function calculateEMI() {
    try {
        clearError();

        const loanAmount = getInputValue('loan-amount');
        const interestRate = getInputValue('interest-rate');
        const loanTenure = getInputValue('loan-tenure');

        validatePositive(loanAmount, 'Loan Amount');
        validateNumber(interestRate, 0, 50, 'Interest Rate');
        validatePositive(loanTenure, 'Loan Tenure');

        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTenure * 12;

        let emi;
        if (monthlyRate === 0) {
            emi = loanAmount / numberOfPayments;
        } else {
            emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                  (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        const totalAmount = emi * numberOfPayments;
        const totalInterest = totalAmount - loanAmount;

        document.getElementById('emi-result').textContent = formatCurrency(emi);
        document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
        document.getElementById('total-interest').textContent = formatCurrency(totalInterest);

        // Build year-by-year amortization table
        const tbody = document.querySelector('#amortization-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            let balance = loanAmount;
            const monthly = emi;
            let year = 1;
            let yearPrincipal = 0;
            let yearInterest = 0;

            for (let m = 1; m <= numberOfPayments; m++) {
                let interestForMonth = 0;
                let principalForMonth = 0;
                if (monthlyRate === 0) {
                    interestForMonth = 0;
                    principalForMonth = monthly;
                } else {
                    interestForMonth = balance * monthlyRate;
                    principalForMonth = monthly - interestForMonth;
                }

                // Protect against tiny rounding causing negative balance on last payment
                if (m === numberOfPayments) {
                    principalForMonth = balance;
                }

                balance = Math.max(0, balance - principalForMonth);

                yearPrincipal += principalForMonth;
                yearInterest += interestForMonth;

                if (m % 12 === 0 || m === numberOfPayments) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="amort-cell">Year ${year}</td>
                        <td class="amort-cell text-right">${formatCurrency(yearPrincipal)}</td>
                        <td class="amort-cell text-right">${formatCurrency(yearInterest)}</td>
                        <td class="amort-cell text-right">${formatCurrency(balance)}</td>
                    `;
                    tbody.appendChild(row);
                    year++;
                    yearPrincipal = 0;
                    yearInterest = 0;
                }
            }
        }

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetEMI() {
    document.getElementById('loan-amount').value = '';
    document.getElementById('interest-rate').value = '';
    document.getElementById('loan-tenure').value = '';
    hideResult();
    // clear amortization table and collapse details
    const tbody = document.querySelector('#amortization-table tbody');
    if (tbody) tbody.innerHTML = '';
    const detail = document.getElementById('amortization-detail');
    if (detail) detail.open = false;
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loan-tenure').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            calculateEMI();
        }
    });
});
