class NumberVisualizer {
    constructor() {
        this.firstNumber = null;
        this.secondNumber = null;
        this.operation = null;
        this.resultTimeout = null;
        this.screen = document.getElementById('screen');
        this.port = null;
        this.reader = null;
        this.serialBuffer = '';
        this.setupEventListeners();
        this.setupSerialListeners();
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const number = parseInt(button.dataset.number);
                this.handleNumberInput(number);
            });
        });

        // Operation buttons
        document.getElementById('addBtn').addEventListener('click', () => {
            this.handleOperation('add');
        });

        document.getElementById('subtractBtn').addEventListener('click', () => {
            this.handleOperation('subtract');
        });

        document.getElementById('enterBtn').addEventListener('click', () => {
            this.handleEnter();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clear();
        });
    }

    handleNumberInput(number) {
        if (this.operation === null) {
            // First number
            this.firstNumber = number;
            this.displayNumber(number);
        } else if (this.operation !== null && this.secondNumber === null) {
            // Second number
            this.secondNumber = number;
            this.displayOperation();
        }
    }

    handleOperation(op) {
        if (this.firstNumber !== null && this.secondNumber === null) {
            this.operation = op;
            // Show first number with operation symbol
            this.screen.innerHTML = '';
            const firstDice = this.createDice(this.firstNumber);
            this.screen.appendChild(firstDice);
            const opSymbol = document.createElement('div');
            opSymbol.className = 'operation-symbol';
            opSymbol.textContent = op === 'add' ? '+' : '−';
            this.screen.appendChild(opSymbol);
        } else if (this.firstNumber !== null && this.secondNumber !== null) {
            // Calculate result
            this.calculateResult();
        }
    }

    displayNumber(number) {
        this.screen.innerHTML = '';
        const dice = this.createDice(number);
        this.screen.appendChild(dice);
    }

    displayOperation() {
        this.screen.innerHTML = '';

        const firstDice = this.createDice(this.firstNumber);
        this.screen.appendChild(firstDice);

        const opSymbol = document.createElement('div');
        opSymbol.className = 'operation-symbol';
        opSymbol.textContent = this.operation === 'add' ? '+' : '−';
        this.screen.appendChild(opSymbol);

        const secondDice = this.createDice(this.secondNumber);
        this.screen.appendChild(secondDice);

        // Show the result alongside the operands after a short delay
        if (this.resultTimeout) {
            clearTimeout(this.resultTimeout);
        }
        this.resultTimeout = setTimeout(() => {
            this.calculateResult();
        }, 1500);
    }

    calculateResult() {
        if (this.resultTimeout) {
            clearTimeout(this.resultTimeout);
            this.resultTimeout = null;
        }
        this.showResultAlongside();
    }

    computeResult() {
        if (this.operation === 'add') {
            return this.firstNumber + this.secondNumber;
        }

        if (this.operation === 'subtract') {
            const result = this.firstNumber - this.secondNumber;
            return result < 0 ? 0 : result;
        }

        return null;
    }

    showResultAlongside() {
        const result = this.computeResult();
        if (result === null) return;

        let resultBlock = this.screen.querySelector('.result-block');
        if (!resultBlock) {
            resultBlock = document.createElement('div');
            resultBlock.className = 'result-block';

            const equalsSymbol = document.createElement('div');
            equalsSymbol.className = 'operation-symbol';
            equalsSymbol.textContent = '=';
            resultBlock.appendChild(equalsSymbol);

            const resultDice = this.createDice(result);
            resultBlock.appendChild(resultDice);
            this.screen.appendChild(resultBlock);
        } else {
            const existingDice = resultBlock.querySelector('.dice');
            const newDice = this.createDice(result);
            resultBlock.replaceChild(newDice, existingDice);
        }

        // Reset for next calculation while keeping the visual result on screen
        this.firstNumber = null;
        this.secondNumber = null;
        this.operation = null;
    }

    handleEnter() {
        // Only calculate if we have both numbers and an operation
        if (this.firstNumber !== null && this.secondNumber !== null && this.operation !== null) {
            this.calculateResult();
        }
    }

    createDice(number) {
        const dice = document.createElement('div');
        dice.className = `dice num-${number}`;

        // Create 9 dot slots
        for (let i = 0; i < 9; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dice.appendChild(dot);
        }

        return dice;
    }

    clear() {
        this.firstNumber = null;
        this.secondNumber = null;
        this.operation = null;
        if (this.resultTimeout) {
            clearTimeout(this.resultTimeout);
            this.resultTimeout = null;
        }
        this.screen.innerHTML = '';
    }

    setupSerialListeners() {
        const connectBtn = document.getElementById('connectBtn');
        const statusSpan = document.getElementById('connectionStatus');

        // Check if Web Serial API is supported
        if (!navigator.serial) {
            statusSpan.textContent = 'Web Serial API not supported - Use Chrome/Edge';
            statusSpan.style.color = '#E53935';
            connectBtn.disabled = true;
            console.warn('Web Serial API not available in this browser');
            return;
        }

        connectBtn.addEventListener('click', async () => {
            if (this.port === null) {
                // Connect
                try {
                    const ports = await navigator.serial.getPorts();

                    if (ports.length === 0) {
                        statusSpan.textContent = 'No ports found. Opening port selector...';
                        statusSpan.style.color = '#FF9800';
                    }

                    this.port = await navigator.serial.requestPort();

                    if (!this.port) {
                        statusSpan.textContent = 'Port selection cancelled';
                        statusSpan.style.color = '#E53935';
                        return;
                    }

                    await this.port.open({ baudRate: 9600 });
                    statusSpan.textContent = 'Connected ✓';
                    statusSpan.style.color = '#43A047';
                    connectBtn.textContent = '🔌 Disconnect Arduino';
                    this.readSerialData();
                } catch (err) {
                    console.error('Failed to open serial port:', err);
                    statusSpan.textContent = `Error: ${err.message || 'Connection failed'}`;
                    statusSpan.style.color = '#E53935';
                    this.port = null;
                }
            } else {
                // Disconnect
                try {
                    if (this.reader) {
                        await this.reader.cancel();
                    }
                    await this.port.close();
                    this.port = null;
                    this.reader = null;
                    statusSpan.textContent = 'Disconnected';
                    statusSpan.style.color = '#999';
                    connectBtn.textContent = '🔌 Connect Arduino';
                } catch (err) {
                    console.error('Failed to close serial port:', err);
                }
            }
        });
    }

    async readSerialData() {
        try {
            this.reader = this.port.readable.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await this.reader.read();
                if (done) break;

                const text = decoder.decode(value);
                this.serialBuffer += text;

                // Process complete lines
                const lines = this.serialBuffer.split('\n');
                this.serialBuffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed) {
                        this.processSerialInput(trimmed);
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Serial read error:', err);
            }
        } finally {
            this.reader = null;
        }
    }

    processSerialInput(input) {
        // Map keypad characters to operations
        const char = input.charAt(0);

        if (char >= '0' && char <= '9') {
            // Number input
            const number = parseInt(char);
            this.handleNumberInput(number);
        } else if (char === '+') {
            // Addition
            this.handleOperation('add');
        } else if (char === '-') {
            // Subtraction
            this.handleOperation('subtract');
        } else if (char === 'x') {
            // Multiplication (treat as separate number entry for now)
            // Or could be mapped to another operation
        } else if (char === '/') {
            // Division (treat as separate number entry for now)
            // Or could be mapped to another operation
        } else if (char === '=') {
            // Enter/Calculate
            this.handleEnter();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NumberVisualizer();
});
