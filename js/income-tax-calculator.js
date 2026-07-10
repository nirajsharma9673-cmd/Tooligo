function calculateTax() {
    try {
        clearError();

        const grossIncome = getInputValue('annual-income');
        if (grossIncome === null || grossIncome <= 0) {
            throw new Error('Please enter a valid positive annual income');
        }

        const ageBracket = document.getElementById('age-bracket').value;
        const employmentType = document.querySelector('input[name="employment-type"]:checked');
        if (!employmentType) throw new Error('Please select employment type');
        const isSalaried = employmentType.value === 'salaried';

        const deduction80C = getInputValue('deduction-80c') || 0;
        const otherDeductions = getInputValue('other-deductions') || 0;

        if (grossIncome > 5000000) {
            document.getElementById('surcharge-warning').classList.remove('hidden');
        } else {
            document.getElementById('surcharge-warning').classList.add('hidden');
        }

        const capped80C = Math.min(deduction80C, 150000);
        let eightyCNote = '';
        if (deduction80C > 150000) {
            eightyCNote = 'Note: Your Section 80C deduction exceeds the ₹1,50,000 limit. Only ₹1,50,000 has been used in the calculation.';
        }
        document.getElementById('eighty-c-note').textContent = eightyCNote;

        const newRegime = calculateNewRegime(grossIncome, isSalaried);
        const oldRegime = calculateOldRegime(grossIncome, ageBracket, isSalaried, capped80C, otherDeductions);

        document.getElementById('new-regime-result').innerHTML = renderTaxResult('New Regime', newRegime);
        document.getElementById('old-regime-result').innerHTML = renderTaxResult('Old Regime', oldRegime);

        const diff = Math.abs(newRegime.finalTax - oldRegime.finalTax);
        let betterRegime, worseRegime;
        if (newRegime.finalTax <= oldRegime.finalTax) {
            betterRegime = 'New Regime';
            worseRegime = 'Old Regime';
        } else {
            betterRegime = 'Old Regime';
            worseRegime = 'New Regime';
        }
        const saveMsg = diff < 1
            ? 'Both regimes give the same tax for this income. Choose based on your eligibility for deductions.'
            : 'You save <strong>₹ ' + formatNumber(diff) + '</strong> by choosing the <strong>' + betterRegime + '</strong> over the ' + worseRegime + '.';
        document.getElementById('save-callout').innerHTML = saveMsg;

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function calculateNewRegime(grossIncome, isSalaried) {
    const standardDeduction = isSalaried ? 75000 : 0;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction);

    const slabs = [
        { limit: 400000, rate: 0 },
        { limit: 800000, rate: 5 },
        { limit: 1200000, rate: 10 },
        { limit: 1600000, rate: 15 },
        { limit: 2000000, rate: 20 },
        { limit: 2400000, rate: 25 }
    ];
    const topRate = 30;

    let taxBeforeRebate = 0;
    let slabDetails = [];
    let prevLimit = 0;

    for (const slab of slabs) {
        const slabIncome = Math.max(0, Math.min(taxableIncome, slab.limit) - prevLimit);
        const slabTax = slabIncome * slab.rate / 100;
        taxBeforeRebate += slabTax;
        if (slabIncome > 0) {
            slabDetails.push({
                range: '₹ ' + formatNumber(prevLimit) + ' – ₹ ' + formatNumber(slab.limit),
                income: slabIncome,
                rate: slab.rate + '%',
                tax: slabTax
            });
        }
        prevLimit = slab.limit;
    }

    if (taxableIncome > prevLimit) {
        const slabIncome = taxableIncome - prevLimit;
        const slabTax = slabIncome * topRate / 100;
        taxBeforeRebate += slabTax;
        slabDetails.push({
            range: '₹ ' + formatNumber(prevLimit) + '+',
            income: slabIncome,
            rate: topRate + '%',
            tax: slabTax
        });
    }

    let rebate = 0;
    if (taxableIncome <= 1200000) {
        rebate = Math.min(taxBeforeRebate, 60000);
    }
    const taxAfterRebate = taxBeforeRebate - rebate;
    const cess = taxAfterRebate * 4 / 100;
    const finalTax = taxAfterRebate + cess;

    return {
        grossIncome,
        standardDeduction,
        taxableIncome,
        slabDetails,
        taxBeforeRebate,
        rebate,
        taxAfterRebate,
        cess,
        finalTax
    };
}

function calculateOldRegime(grossIncome, ageBracket, isSalaried, deduction80C, otherDeductions) {
    const standardDeduction = isSalaried ? 50000 : 0;
    const totalDeductions = deduction80C + otherDeductions;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction - totalDeductions);

    let slabLimits;
    if (ageBracket === 'below-60') {
        slabLimits = [250000, 500000, 1000000];
    } else if (ageBracket === '60-79') {
        slabLimits = [300000, 500000, 1000000];
    } else {
        slabLimits = [500000, 1000000];
    }

    const slabRates = [0, 5, 20, 30];
    let taxBeforeRebate = 0;
    let slabDetails = [];
    let prevLimit = 0;

    for (let i = 0; i < slabLimits.length; i++) {
        const slabIncome = Math.max(0, Math.min(taxableIncome, slabLimits[i]) - prevLimit);
        const slabTax = slabIncome * slabRates[i] / 100;
        taxBeforeRebate += slabTax;
        if (slabIncome > 0) {
            slabDetails.push({
                range: '₹ ' + formatNumber(prevLimit) + ' – ₹ ' + formatNumber(slabLimits[i]),
                income: slabIncome,
                rate: slabRates[i] + '%',
                tax: slabTax
            });
        }
        if (taxableIncome <= slabLimits[i]) break;
        prevLimit = slabLimits[i];
    }

    if (taxableIncome > slabLimits[slabLimits.length - 1]) {
        const slabIncome = taxableIncome - slabLimits[slabLimits.length - 1];
        const slabTax = slabIncome * slabRates[slabRates.length - 1] / 100;
        taxBeforeRebate += slabTax;
        slabDetails.push({
            range: '₹ ' + formatNumber(slabLimits[slabLimits.length - 1]) + '+',
            income: slabIncome,
            rate: slabRates[slabRates.length - 1] + '%',
            tax: slabTax
        });
    }

    let rebate = 0;
    if (taxableIncome <= 500000) {
        rebate = Math.min(taxBeforeRebate, 12500);
    }
    const taxAfterRebate = taxBeforeRebate - rebate;
    const cess = taxAfterRebate * 4 / 100;
    const finalTax = taxAfterRebate + cess;

    return {
        grossIncome,
        standardDeduction,
        deductions80C: deduction80C,
        otherDeductions,
        totalDeductions: standardDeduction + totalDeductions,
        taxableIncome,
        slabDetails,
        taxBeforeRebate,
        rebate,
        taxAfterRebate,
        cess,
        finalTax
    };
}

function renderTaxResult(regimeName, data) {
    let html = '<h4>' + regimeName + '</h4>';
    html += '<table class="tax-breakdown">';
    html += '<tr><td>Gross Annual Income</td><td>₹ ' + formatNumber(data.grossIncome) + '</td></tr>';

    if (regimeName === 'New Regime') {
        if (data.standardDeduction > 0) {
            html += '<tr><td>Standard Deduction</td><td class="deduction">− ₹ ' + formatNumber(data.standardDeduction) + '</td></tr>';
        }
    } else {
        if (data.standardDeduction > 0) {
            html += '<tr><td>Standard Deduction</td><td class="deduction">− ₹ ' + formatNumber(data.standardDeduction) + '</td></tr>';
        }
        if (data.deductions80C > 0) {
            html += '<tr><td>Section 80C Deduction</td><td class="deduction">− ₹ ' + formatNumber(data.deductions80C) + '</td></tr>';
        }
        if (data.otherDeductions > 0) {
            html += '<tr><td>Other Deductions</td><td class="deduction">− ₹ ' + formatNumber(data.otherDeductions) + '</td></tr>';
        }
    }

    html += '<tr class="total-row"><td><strong>Taxable Income</strong></td><td><strong>₹ ' + formatNumber(data.taxableIncome) + '</strong></td></tr>';
    html += '</table>';

    html += '<h5>Slab-wise Breakdown</h5>';
    html += '<table class="tax-breakdown">';
    html += '<thead><tr><th>Income Range</th><th>Amount</th><th>Rate</th><th>Tax</th></tr></thead><tbody>';
    for (const slab of data.slabDetails) {
        html += '<tr><td>' + slab.range + '</td><td>₹ ' + formatNumber(slab.income) + '</td><td>' + slab.rate + '</td><td>₹ ' + formatNumber(slab.tax) + '</td></tr>';
    }
    html += '<tr class="total-row"><td colspan="3"><strong>Tax Before Rebate</strong></td><td><strong>₹ ' + formatNumber(data.taxBeforeRebate) + '</strong></td></tr>';
    html += '</tbody></table>';

    if (data.rebate > 0) {
        html += '<p class="rebate-note">Section 87A Rebate applied: −₹ ' + formatNumber(data.rebate) + '</p>';
    }
    html += '<p>Tax after Rebate: ₹ ' + formatNumber(data.taxAfterRebate) + '</p>';
    html += '<p>Health & Education Cess (4%): ₹ ' + formatNumber(data.cess) + '</p>';
    html += '<p class="final-tax"><strong>Final Tax Payable: ₹ ' + formatNumber(data.finalTax) + '</strong></p>';

    return html;
}

function resetTax() {
    document.getElementById('annual-income').value = '';
    document.getElementById('deduction-80c').value = '';
    document.getElementById('other-deductions').value = '';
    document.getElementById('age-bracket').value = 'below-60';
    document.querySelector('input[name="employment-type"][value="salaried"]').checked = true;
    document.getElementById('surcharge-warning').classList.add('hidden');
    document.getElementById('eighty-c-note').textContent = '';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('annual-income').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateTax();
    });
});
