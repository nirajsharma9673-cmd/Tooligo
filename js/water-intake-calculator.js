function calculateWaterIntake() {
    try {
        clearError();

        const weight = getInputValue('weight');
        const exerciseMinutes = getInputValue('exercise') || 0;
        const climate = document.getElementById('climate').value;

        if (weight === null || weight <= 0) {
            throw new Error('Please enter a valid positive body weight');
        }
        if (exerciseMinutes < 0) {
            throw new Error('Exercise minutes cannot be negative');
        }

        const baseIntake = weight * 0.033;
        const exerciseAddition = (exerciseMinutes / 30) * 0.4;
        let subtotal = baseIntake + exerciseAddition;

        if (climate === 'hot') {
            subtotal = subtotal * 1.15;
        }

        const totalLiters = subtotal;
        const totalGlasses = Math.round(totalLiters / 0.25);

        document.getElementById('total-litres').textContent = formatNumber(totalLiters, 2) + ' L';
        document.getElementById('total-glasses').textContent = totalGlasses + ' glasses';
        document.getElementById('weight-display').textContent = weight + ' kg';
        document.getElementById('exercise-display').textContent = exerciseMinutes + ' min/day';
        document.getElementById('climate-display').textContent = climate === 'hot' ? 'Hot or Humid' : 'Normal';

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetWaterIntake() {
    document.getElementById('weight').value = '';
    document.getElementById('exercise').value = '';
    document.getElementById('climate').value = 'normal';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    var weightField = document.getElementById('weight');
    if (weightField) {
        weightField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateWaterIntake();
        });
    }
});
