function calculateSIP() {
    try {
        clearError();

        const monthlyAmount = getInputValue('monthly-amount');
        const annualRate = getInputValue('sip-rate');
        const years = getInputValue('sip-years');
        const stepUpEnabled = document.getElementById('step-up-enabled') && document.getElementById('step-up-enabled').checked;
        const stepUpPercent = stepUpEnabled ? (getInputValue('step-up-percent') || 0) : 0;

        validatePositive(monthlyAmount, 'Monthly Investment');
        validateNumber(annualRate, 0, 50, 'Annual Return');
        validatePositive(years, 'Investment Period');
        if (stepUpEnabled) validateNumber(stepUpPercent, 0, 100, 'Annual Increase');

        const monthlyRate = annualRate / 100 / 12;
        const numberOfMonths = years * 12;
        const totalInvested = monthlyAmount * numberOfMonths;

        let finalAmount = 0;
        if (!stepUpEnabled) {
            if (monthlyRate === 0) {
                finalAmount = totalInvested;
            } else {
                finalAmount = monthlyAmount *
                             (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate *
                             (1 + monthlyRate);
            }
        } else {
            // Month-by-month simulation with annual step-up applied every 12 months
            let balance = 0;
            let contribution = monthlyAmount;
            const stepUpFactor = 1 + (stepUpPercent / 100);
            for (let m = 1; m <= numberOfMonths; m++) {
                // contribution at beginning of period
                balance = balance * (1 + monthlyRate) + contribution;

                // apply step-up at year boundary (after 12th, 24th... month)
                if (m % 12 === 0) {
                    contribution = contribution * stepUpFactor;
                }
            }
            finalAmount = balance;
        }

        const investmentGain = finalAmount - totalInvested;

        document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
        document.getElementById('investment-gain').textContent = formatCurrency(investmentGain);
        document.getElementById('final-amount').textContent = formatCurrency(finalAmount);

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetSIP() {
    document.getElementById('monthly-amount').value = '';
    document.getElementById('sip-rate').value = '';
    document.getElementById('sip-years').value = '';
    const stepUpCheckbox = document.getElementById('step-up-enabled');
    if (stepUpCheckbox) stepUpCheckbox.checked = false;
    const stepUpSettings = document.getElementById('step-up-settings');
    if (stepUpSettings) stepUpSettings.classList.add('hidden');
    const stepUpInput = document.getElementById('step-up-percent');
    if (stepUpInput) stepUpInput.value = '';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sip-years').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            calculateSIP();
        }
    });
    // Toggle step-up settings visibility
    const stepUpCheckbox = document.getElementById('step-up-enabled');
    if (stepUpCheckbox) {
        stepUpCheckbox.addEventListener('change', function() {
            const settings = document.getElementById('step-up-settings');
            if (settings) settings.classList.toggle('hidden', !this.checked);
            if (document.getElementById('result-section').classList.contains('show')) {
                calculateSIP();
            }
        });
    }
});
