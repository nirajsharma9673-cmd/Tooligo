function convertFromPercentage() {
    try {
        clearError();

        const percentage = getInputValue('percentage-input');

        if (percentage === null || percentage === '') {
            return;
        }

        if (percentage < 0 || percentage > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }

        const cgpa = percentage / 9.5;
        document.getElementById('cgpa-input').value = formatNumber(cgpa, 2);
        document.getElementById('cgpa-result').textContent = formatNumber(cgpa, 2);
        document.getElementById('percentage-result').textContent = formatNumber(percentage, 2) + '%';

        document.getElementById('conversion-direction').textContent = percentage + '% = CGPA';
        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function convertFromCGPA() {
    try {
        clearError();

        const cgpa = getInputValue('cgpa-input');

        if (cgpa === null || cgpa === '') {
            return;
        }

        if (cgpa < 0 || cgpa > 10) {
            throw new Error('CGPA must be between 0 and 10');
        }

        const percentage = cgpa * 9.5;
        document.getElementById('percentage-input').value = formatNumber(percentage, 2);
        document.getElementById('percentage-result').textContent = formatNumber(percentage, 2) + '%';
        document.getElementById('cgpa-result').textContent = formatNumber(cgpa, 2);

        document.getElementById('conversion-direction').textContent = 'CGPA ' + cgpa + ' = %';
        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function calculateCGPAConversion() {
    const pctVal = document.getElementById('percentage-input').value.trim();
    const cgpaVal = document.getElementById('cgpa-input').value.trim();

    if (pctVal && cgpaVal) {
        convertFromPercentage();
    } else if (pctVal) {
        convertFromPercentage();
    } else if (cgpaVal) {
        convertFromCGPA();
    } else {
        showError('Please enter a value in either Percentage or CGPA');
    }
}

function resetCGPA() {
    document.getElementById('percentage-input').value = '';
    document.getElementById('cgpa-input').value = '';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('percentage-input').addEventListener('input', function() {
        if (this.value.trim() !== '') {
            convertFromPercentage();
        }
    });
    document.getElementById('cgpa-input').addEventListener('input', function() {
        if (this.value.trim() !== '') {
            convertFromCGPA();
        }
    });
    document.getElementById('percentage-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateCGPAConversion();
    });
    document.getElementById('cgpa-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateCGPAConversion();
    });
});
