function calculateEligibility() {
    try {
        clearError();
        document.getElementById('no-eligibility-warning').style.display = 'none';

        const monthlyIncome = getInputValue('monthly-income');
        const foirInput = getInputValue('foir');
        const existingEMIs = getInputValue('existing-emi') || 0;
        const annualRate = getInputValue('loan-rate');
        const tenureYears = getInputValue('loan-tenure');

        const foirPercent = (foirInput !== null && foirInput > 0) ? foirInput : 50;

        if (monthlyIncome === null || monthlyIncome <= 0) {
            throw new Error('Please enter a valid positive monthly income');
        }
        if (tenureYears === null || tenureYears <= 0) {
            throw new Error('Please enter a valid loan tenure');
        }
        if (annualRate === null || annualRate <= 0) {
            throw new Error('Please enter a valid interest rate');
        }
        if (existingEMIs < 0) {
            throw new Error('Existing EMI obligations cannot be negative');
        }
        if (foirPercent <= 0 || foirPercent > 100) {
            throw new Error('FOIR must be between 1 and 100');
        }

        const maxAffordableEMI = (monthlyIncome * foirPercent / 100) - existingEMIs;

        if (maxAffordableEMI <= 0) {
            document.getElementById('no-eligibility-warning').style.display = 'block';
            document.getElementById('result-section').classList.remove('show');
            return;
        }

        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = tenureYears * 12;

        let maxLoanAmount;
        if (monthlyRate === 0) {
            maxLoanAmount = maxAffordableEMI * totalMonths;
        } else {
            const factor = Math.pow(1 + monthlyRate, totalMonths);
            maxLoanAmount = maxAffordableEMI * (factor - 1) / (monthlyRate * factor);
        }

        const totalPayment = maxAffordableEMI * totalMonths;
        const totalInterest = totalPayment - maxLoanAmount;

        document.getElementById('eligible-loan').textContent = 'Rs ' + formatNumber(maxLoanAmount);
        document.getElementById('affordable-emi').textContent = 'Rs ' + formatNumber(maxAffordableEMI);
        document.getElementById('total-interest').textContent = 'Rs ' + formatNumber(Math.max(0, totalInterest));
        document.getElementById('income-display').textContent = 'Rs ' + formatNumber(monthlyIncome);
        document.getElementById('foir-display').textContent = foirPercent + '%';
        document.getElementById('emi-display').textContent = 'Rs ' + formatNumber(existingEMIs);
        document.getElementById('rate-display').textContent = annualRate + '%';
        document.getElementById('tenure-display').textContent = tenureYears + ' year' + (tenureYears !== 1 ? 's' : '');

        document.getElementById('result-section').classList.add('show');
    } catch (error) {
        showError(error.message);
    }
}

function resetEligibility() {
    document.getElementById('monthly-income').value = '';
    document.getElementById('foir').value = '';
    document.getElementById('existing-emi').value = '';
    document.getElementById('loan-rate').value = '';
    document.getElementById('loan-tenure').value = '';
    document.getElementById('no-eligibility-warning').style.display = 'none';
    document.getElementById('result-section').classList.remove('show');
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    var incomeField = document.getElementById('monthly-income');
    if (incomeField) {
        incomeField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateEligibility();
        });
    }
});
