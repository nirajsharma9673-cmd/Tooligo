let currentUnit = 'metric';

function setUnit(unit) {
    currentUnit = unit;
    document.getElementById('metric-unit').classList.toggle('active', unit === 'metric');
    document.getElementById('imperial-unit').classList.toggle('active', unit === 'imperial');
    document.getElementById('height-cm-group').style.display = unit === 'metric' ? '' : 'none';
    document.getElementById('height-imperial-group').style.display = unit === 'imperial' ? '' : 'none';
    clearError();
    hideResult();
}

function calculateBMI() {
    try {
        clearError();
        let weight, heightM;

        if (currentUnit === 'metric') {
            weight = getInputValue('weight-kg');
            const heightCm = getInputValue('height-cm');
            if (weight === null || heightCm === null || isNaN(weight) || isNaN(heightCm)) throw new Error('Please fill in all fields with valid numbers');
            if (weight <= 0) throw new Error('Weight must be greater than 0');
            if (heightCm <= 0) throw new Error('Height must be greater than 0');
            heightM = heightCm / 100;
        } else {
            weight = getInputValue('weight-lb');
            const feet = getInputValue('height-ft');
            const inches = getInputValue('height-in');
            if (weight === null || feet === null || isNaN(weight) || isNaN(feet)) throw new Error('Please fill in all fields with valid numbers');
            if (weight <= 0) throw new Error('Weight must be greater than 0');
            if (feet <= 0) throw new Error('Height must be greater than 0');
            const totalInches = feet * 12 + (isNaN(inches) ? 0 : (inches || 0));
            heightM = totalInches * 0.0254;
        }

        const bmi = weight / (heightM * heightM);
        const bmiDisplay = formatNumber(bmi, 1);

        let category, statusClass;
        if (bmi < 18.5) {
            category = 'Underweight';
            statusClass = 'status-danger';
        } else if (bmi < 25) {
            category = 'Normal weight';
            statusClass = 'status-success';
        } else if (bmi < 30) {
            category = 'Overweight';
            statusClass = 'status-warning';
        } else {
            category = 'Obese';
            statusClass = 'status-danger';
        }

        document.getElementById('bmi-value').textContent = bmiDisplay;
        document.getElementById('bmi-category').textContent = category;
        document.getElementById('bmi-category').className = 'attendance-badge ' + statusClass;

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetBMI() {
    document.getElementById('weight-kg').value = '';
    document.getElementById('height-cm').value = '';
    document.getElementById('weight-lb').value = '';
    document.getElementById('height-ft').value = '';
    document.getElementById('height-in').value = '';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    ['weight-kg','height-cm','weight-lb','height-ft','height-in'].forEach(function(id) {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateBMI();
        });
    });
});
