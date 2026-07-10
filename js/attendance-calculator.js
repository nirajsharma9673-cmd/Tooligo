function calculateAttendance() {
    try {
        clearError();

        const total = getInputValue('total-classes');
        const attended = getInputValue('attended-classes');
        const requiredPercent = getInputValue('required-percent');

        if (total === null || attended === null || requiredPercent === null) {
            throw new Error('Please fill in all fields');
        }

        if (total <= 0) {
            throw new Error('Total classes must be greater than 0');
        }
        if (attended < 0) {
            throw new Error('Attended classes cannot be negative');
        }
        if (attended > total) {
            throw new Error('Attended classes cannot exceed total classes');
        }
        if (requiredPercent <= 0) {
            throw new Error('Required attendance % must be greater than 0');
        }
        if (requiredPercent >= 100) {
            throw new Error('Required attendance % must be less than 100');
        }

        const R = requiredPercent / 100;
        const currentPercent = (attended / total) * 100;

        document.getElementById('current-percent').textContent = formatNumber(currentPercent, 1) + '%';
        document.getElementById('required-percent-display').textContent = formatNumber(requiredPercent, 1) + '%';

        const statusEl = document.getElementById('attendance-status');

        if (currentPercent >= requiredPercent) {
            const maxSkippable = Math.floor(attended / R - total);
            const skipMsg = maxSkippable > 0
                ? 'You can skip up to <strong>' + maxSkippable + '</strong> more class' + (maxSkippable !== 1 ? 'es' : '') + ' and stay at ' + formatNumber(requiredPercent, 1) + '%.'
                : 'You are right at the threshold \u2014 missing even one class will drop you below ' + formatNumber(requiredPercent, 1) + '%.';
            document.getElementById('attendance-result-msg').innerHTML = skipMsg;
            statusEl.textContent = 'On Track \u2713';
            statusEl.className = 'attendance-badge status-success';
        } else {
            const classesNeeded = Math.ceil((R * total - attended) / (1 - R));
            const needMsg = 'You need to attend the next <strong>' + classesNeeded + '</strong> class' + (classesNeeded !== 1 ? 'es' : '') + ' in a row to reach ' + formatNumber(requiredPercent, 1) + '%.';
            document.getElementById('attendance-result-msg').innerHTML = needMsg;
            statusEl.textContent = 'Below Minimum';
            statusEl.className = 'attendance-badge status-danger';
        }

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetAttendance() {
    document.getElementById('total-classes').value = '';
    document.getElementById('attended-classes').value = '';
    document.getElementById('required-percent').value = '75';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('total-classes').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateAttendance();
    });
    document.getElementById('attended-classes').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateAttendance();
    });
    document.getElementById('required-percent').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateAttendance();
    });
});
