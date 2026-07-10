let activeMode = 'fd';

function switchMode(mode) {
    activeMode = mode;
    document.querySelectorAll('.mode-tab').forEach(function(tab) {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    document.getElementById('fd-inputs').classList.toggle('hidden', mode !== 'fd');
    document.getElementById('rd-inputs').classList.toggle('hidden', mode !== 'rd');
    hideResult();
    clearError();
}

function calculateFD() {
    try {
        clearError();

        const principal = getInputValue('fd-principal');
        const rate = getInputValue('fd-rate');
        const tenure = getInputValue('fd-tenure');
        const freq = document.getElementById('fd-frequency').value;

        if (principal === null || rate === null || tenure === null) {
            throw new Error('Please fill in all fields');
        }
        if (principal <= 0) throw new Error('Principal must be greater than 0');
        if (rate < 0.1 || rate > 15) throw new Error('Interest rate must be between 0.1% and 15%');
        if (tenure <= 0) throw new Error('Tenure must be greater than 0');

        const nMap = { quarterly: 4, monthly: 12, halfyearly: 2, annually: 1 };
        const n = nMap[freq];
        const r = rate / 100;
        const amount = principal * Math.pow(1 + r / n, n * tenure);
        const interest = amount - principal;

        document.getElementById('fd-maturity').textContent = '₹ ' + formatNumber(amount);
        document.getElementById('fd-principal-display').textContent = '₹ ' + formatNumber(principal);
        document.getElementById('fd-interest-display').textContent = '₹ ' + formatNumber(interest);
        document.getElementById('fd-rate-display').textContent = rate + '%';
        document.getElementById('fd-tenure-display').textContent = tenure + ' year' + (tenure !== 1 ? 's' : '');
        document.getElementById('fd-freq-display').textContent = freq.charAt(0).toUpperCase() + freq.slice(1);

        document.getElementById('fd-result-section').classList.add('show');
    } catch (error) {
        showError(error.message);
    }
}

function calculateRD() {
    try {
        clearError();

        const monthlyDeposit = getInputValue('rd-monthly');
        const rate = getInputValue('rd-rate');
        const tenureMonths = getInputValue('rd-tenure-months');

        if (monthlyDeposit === null || rate === null || tenureMonths === null) {
            throw new Error('Please fill in all fields');
        }
        if (monthlyDeposit <= 0) throw new Error('Monthly deposit must be greater than 0');
        if (rate < 0.1 || rate > 15) throw new Error('Interest rate must be between 0.1% and 15%');
        if (tenureMonths <= 0) throw new Error('Tenure must be greater than 0');
        if (tenureMonths < 3) throw new Error('Minimum tenure is 3 months');

        const i = rate / 400;
        const n = tenureMonths / 3;
        const maturity = monthlyDeposit * (Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1/3));
        const totalDeposited = monthlyDeposit * tenureMonths;
        const interest = maturity - totalDeposited;

        document.getElementById('rd-maturity').textContent = '₹ ' + formatNumber(maturity);
        document.getElementById('rd-deposited-display').textContent = '₹ ' + formatNumber(totalDeposited);
        document.getElementById('rd-interest-display').textContent = '₹ ' + formatNumber(interest);
        document.getElementById('rd-rate-display').textContent = rate + '%';
        document.getElementById('rd-tenure-display').textContent = tenureMonths + ' months';
        document.getElementById('rd-monthly-display').textContent = '₹ ' + formatNumber(monthlyDeposit);

        document.getElementById('rd-result-section').classList.add('show');
    } catch (error) {
        showError(error.message);
    }
}

function resetFD() {
    document.getElementById('fd-principal').value = '';
    document.getElementById('fd-rate').value = '';
    document.getElementById('fd-tenure').value = '';
    document.getElementById('fd-frequency').value = 'quarterly';
    document.getElementById('fd-result-section').classList.remove('show');
    clearError();
}

function resetRD() {
    document.getElementById('rd-monthly').value = '';
    document.getElementById('rd-rate').value = '';
    document.getElementById('rd-tenure-months').value = '';
    document.getElementById('rd-result-section').classList.remove('show');
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fd-principal').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateFD();
    });
    document.getElementById('rd-monthly').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateRD();
    });
});
