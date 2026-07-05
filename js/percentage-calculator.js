function changeCalculationType() {
    const type = document.getElementById('calc-type').value;
    document.getElementById('type-percent-of').classList.toggle('hidden', type !== 'percent-of');
    document.getElementById('type-percent-change').classList.toggle('hidden', type !== 'percent-change');
    document.getElementById('type-percent-value').classList.toggle('hidden', type !== 'percent-value');
    hideResult();
    clearError();
}

function calculatePercentage() {
    try {
        clearError();
        const type = document.getElementById('calc-type').value;
        let result;

        if (type === 'percent-of') {
            const percentage = getInputValue('percentage');
            const totalValue = getInputValue('total-value');
            validateNumber(percentage, 0, null, 'Percentage');
            validateNumber(totalValue, 0, null, 'Total Value');
            result = (percentage * totalValue) / 100;
            document.getElementById('percentage-result').textContent = formatNumber(result, 2);
        } else if (type === 'percent-change') {
            const originalValue = getInputValue('original-value');
            const newValue = getInputValue('new-value');
            validateNumber(originalValue, null, null, 'Original Value');
            validateNumber(newValue, null, null, 'New Value');
            if (originalValue === 0) {
                if (newValue === 0) {
                    result = 0;
                    document.getElementById('percentage-result').textContent = '0%';
                } else {
                    throw new Error('Original value is zero — percentage change is undefined');
                }
            } else {
                result = ((newValue - originalValue) / originalValue) * 100;
                document.getElementById('percentage-result').textContent = formatNumber(result, 2) + '%';
            }
        } else if (type === 'percent-value') {
            const partValue = getInputValue('part-value');
            const wholeValue = getInputValue('whole-value');
            validateNumber(partValue, null, null, 'Part Value');
            validateNumber(wholeValue, null, null, 'Whole Value');
            if (wholeValue === 0) throw new Error('Whole value cannot be zero');
            result = (partValue / wholeValue) * 100;
            document.getElementById('percentage-result').textContent = formatNumber(result, 2) + '%';
        }

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetPercentage() {
    document.getElementById('percentage').value = '';
    document.getElementById('total-value').value = '';
    document.getElementById('original-value').value = '';
    document.getElementById('new-value').value = '';
    document.getElementById('part-value').value = '';
    document.getElementById('whole-value').value = '';
    hideResult();
    clearError();
}
