class NumberVisualizer {
    constructor() {
        this.firstNumber = null;
        this.secondNumber = null;
        this.operation = null;
        this.resultTimeout = null;
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NumberVisualizer();
});
