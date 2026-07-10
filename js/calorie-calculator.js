function calculateCalories() {
    try {
        clearError();

        const sex = document.getElementById('sex').value;
        const age = getInputValue('age');
        const weight = getInputValue('weight');
        const height = getInputValue('height');
        const activity = parseFloat(document.getElementById('activity').value);

        if (!sex) throw new Error('Please select your sex');
        if (age === null || weight === null || height === null) throw new Error('Please fill in all fields');

        if (age < 1 || age > 120) throw new Error('Age must be between 1 and 120');
        if (weight < 20 || weight > 300) throw new Error('Weight must be between 20 and 300 kg');
        if (height < 50 || height > 250) throw new Error('Height must be between 50 and 250 cm');

        let bmr;
        if (sex === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const tdee = bmr * activity;

        document.getElementById('bmr-result').textContent = Math.round(bmr).toLocaleString();
        document.getElementById('tdee-result').textContent = Math.round(tdee).toLocaleString();
        document.getElementById('tdee-loss').textContent = Math.round(tdee - 500).toLocaleString();
        document.getElementById('tdee-gain').textContent = Math.round(tdee + 500).toLocaleString();

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetCalories() {
    document.getElementById('sex').value = '';
    document.getElementById('age').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('height').value = '';
    document.getElementById('activity').value = '1.2';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    ['age','weight','height'].forEach(function(id) {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateCalories();
        });
    });
});
