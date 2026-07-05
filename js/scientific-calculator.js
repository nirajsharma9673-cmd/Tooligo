let display;
let currentInput = '0';
let previousValue = null;
let operation = null;
let shouldResetDisplay = false;

function updateDisplay() {
    display.textContent = currentInput.length > 20 ? currentInput.substring(0, 20) + '...' : currentInput;
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (num === '.' && !currentInput.includes('.')) {
            currentInput += num;
        } else if (num !== '.') {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (currentInput === 'Error') return;
    if (shouldResetDisplay && op !== '√' && op !== 'sin' && op !== 'cos' && op !== 'tan' && op !== 'log' && op !== 'ln') {
        return;
    }

    const num = parseFloat(currentInput);
    if (isNaN(num)) {
        currentInput = 'Error';
        updateDisplay();
        return;
    }

    if (op === '+' || op === '-' || op === '*' || op === '/') {
        if (previousValue === null) {
            previousValue = num;
        } else if (operation) {
            previousValue = performCalculation(previousValue, num, operation);
            currentInput = previousValue.toString();
        }
        operation = op;
        shouldResetDisplay = true;
    } else if (op === '%') {
        currentInput = (num / 100).toString();
        shouldResetDisplay = true;
    } else if (op === '^') {
        operation = '^';
        previousValue = num;
        shouldResetDisplay = true;
    } else if (op === '√') {
        if (num >= 0) {
            currentInput = Math.sqrt(num).toString();
        } else {
            currentInput = 'Error';
        }
        shouldResetDisplay = true;
    } else if (op === 'sin' || op === 'cos' || op === 'tan') {
        const angleMode = (document.getElementById('angle-mode') || { value: 'deg' }).value;
        let arg = num;
        if (angleMode === 'deg') arg = num * Math.PI / 180;
        if (op === 'sin') currentInput = Math.sin(arg).toString();
        if (op === 'cos') currentInput = Math.cos(arg).toString();
        if (op === 'tan') currentInput = Math.tan(arg).toString();
        shouldResetDisplay = true;
    } else if (op === 'log') {
        if (num > 0) {
            currentInput = Math.log10(num).toString();
        } else {
            currentInput = 'Error';
        }
        shouldResetDisplay = true;
    } else if (op === 'ln') {
        if (num > 0) {
            currentInput = Math.log(num).toString();
        } else {
            currentInput = 'Error';
        }
        shouldResetDisplay = true;
    } else if (op === '!') {
        if (Number.isInteger(num) && num >= 0 && num <= 170) {
            currentInput = factorial(num).toString();
        } else {
            currentInput = 'Error';
        }
        shouldResetDisplay = true;
    }

    updateDisplay();
}

function performCalculation(prev, current, op) {
    let result;
    switch (op) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : NaN;
            break;
        case '^':
            result = Math.pow(prev, current);
            break;
        default:
            result = current;
    }
    return result;
}

function calculate() {
    if (operation && previousValue !== null) {
        const current = parseFloat(currentInput);
        const result = performCalculation(previousValue, current, operation);
        currentInput = isNaN(result) ? 'Error' : result.toString();
        previousValue = null;
        operation = null;
        shouldResetDisplay = true;
        updateDisplay();
    }
}

function clearDisplay() {
    currentInput = '0';
    previousValue = null;
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function backspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function toggleSign() {
    const num = parseFloat(currentInput);
    currentInput = (-num).toString();
    updateDisplay();
}

function calculateFactorial() {
    try {
        const n = parseInt(document.getElementById('factorial-input').value);
        if (n < 0) {
            document.getElementById('factorial-result').textContent = 'Error: Negative number';
            return;
        }
        if (!Number.isInteger(n)) {
            document.getElementById('factorial-result').textContent = 'Error: Must be integer';
            return;
        }
        const result = factorial(n);
        document.getElementById('factorial-result').textContent = n + '! = ' + formatNumber(result, 0);
    } catch (error) {
        document.getElementById('factorial-result').textContent = 'Error';
    }
}

function calculateCombPerm(type) {
    try {
        const n = parseInt(document.getElementById('n-value').value);
        const r = parseInt(document.getElementById('r-value').value);

        if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
            alert('Please enter valid positive integers');
            return;
        }

        if (r > n) {
            alert('R cannot be greater than N');
            return;
        }

        let result;
        if (type === 'C') {
            result = factorial(n) / (factorial(r) * factorial(n - r));
            alert('C(' + n + ',' + r + ') = ' + formatNumber(result, 0));
        } else {
            result = factorial(n) / factorial(n - r);
            alert('P(' + n + ',' + r + ') = ' + formatNumber(result, 0));
        }
    } catch (error) {
        alert('Error in calculation');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    display = document.getElementById('display');
    updateDisplay();
    document.addEventListener('keydown', function(event) {
        if (event.key >= '0' && event.key <= '9') {
            appendNumber(event.key);
        } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
            appendOperator(event.key);
        } else if (event.key === 'Enter' || event.key === '=') {
            calculate();
        } else if (event.key === 'Backspace') {
            backspace();
        } else if (event.key === '.') {
            appendNumber('.');
        } else if (event.key === '^') {
            appendOperator('^');
        } else if (event.key === '%') {
            appendOperator('%');
        } else if (event.key === '!') {
            appendOperator('!');
        } else if (event.key.toLowerCase() === 's') {
            appendOperator('sin');
        } else if (event.key.toLowerCase() === 'c') {
            appendOperator('cos');
        } else if (event.key.toLowerCase() === 't') {
            appendOperator('tan');
        }
    });
});
