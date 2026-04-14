class NumberVisualizer {
    constructor() {
        this.firstNumber = null;
        this.secondNumber = null;
        this.operation = null;
        this.screen = document.getElementById('screen');
        this.setupEventListeners();
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

        // Show equals after a delay
        setTimeout(() => {
            this.calculateResult();
        }, 1500);
    }

    calculateResult() {
        let result;
        if (this.operation === 'add') {
            result = this.firstNumber + this.secondNumber;
        } else if (this.operation === 'subtract') {
            result = this.firstNumber - this.secondNumber;
            if (result < 0) result = 0; // Prevent negative numbers
        } else {
            return; // No operation selected
        }

        // Show result
        this.screen.innerHTML = '';
        const equalsSymbol = document.createElement('div');
        equalsSymbol.className = 'operation-symbol';
        equalsSymbol.textContent = '=';
        this.screen.appendChild(equalsSymbol);

        const resultDice = this.createDice(result);
        this.screen.appendChild(resultDice);

        // Reset for next calculation
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
        this.screen.innerHTML = '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NumberVisualizer();
});
