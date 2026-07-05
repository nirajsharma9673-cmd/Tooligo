// Age calculator for tools/age-calculator.html
// Replaces duplicate logic and ensures safe DOM updates.

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getZodiac(month, day) {
    // month: 1-12
    const m = month;
    const d = day;
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Aquarius';
    if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return 'Pisces';
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Aries';
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Taurus';
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Gemini';
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Cancer';
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Leo';
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Virgo';
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra';
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio';
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius';
    return 'Capricorn';
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function calculateAge() {
    try {
        clearError();

        const birthDateStr = document.getElementById('birth-date').value;
        if (!birthDateStr) throw new Error('Please select your date of birth');

        const birth = new Date(birthDateStr);
        const today = new Date();
        if (birth > today) throw new Error('Birth date cannot be in the future');

        // Years / months / days (calendar-accurate)
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        // Use UTC-based day difference for totalDays to avoid DST issues
        const msPerDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate())) / msPerDay);

        const totalHours = Math.floor((today - birth) / (1000 * 60 * 60));
        const totalMinutes = Math.floor((today - birth) / (1000 * 60));
        const totalWeeks = Math.floor(totalDays / 7);

        const totalMonths = (years * 12) + months;

        const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const birthDayName = weekDays[birth.getDay()];

        // Next birthday handling (handles Feb 29 birthdays as observed on Feb 28 in non-leap years)
        const birthMonth = birth.getMonth();
        const birthDate = birth.getDate();
        let nextYear = today.getFullYear();

        function makeNextBirthday(year) {
            // For Feb 29 birthdays, if year is not leap, use Feb 28 as observed
            if (birthMonth === 1 && birthDate === 29) {
                if (isLeapYear(year)) return new Date(year, 1, 29);
                return new Date(year, 1, 28);
            }
            return new Date(year, birthMonth, birthDate);
        }

        let nextBirthday = makeNextBirthday(nextYear);
        // compare by UTC date
        if (Date.UTC(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate()) < Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) {
            nextYear++;
            nextBirthday = makeNextBirthday(nextYear);
        }

        const daysToBirthday = Math.max(0, Math.ceil((Date.UTC(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / msPerDay));

        // Zodiac and estimated heartbeats
        const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());
        const avgBpm = 72; // approximate average resting heart rate
        const estimatedHeartBeats = Math.round(totalMinutes * avgBpm);

        // Update DOM safely
        safeSetText('age-summary', `${years} Years, ${months} Months, ${days} Days`);
        safeSetText('total-days', formatNumber(totalDays, 0));
        safeSetText('total-hours', formatNumber(totalHours, 0));
        safeSetText('total-minutes', formatNumber(totalMinutes, 0));
        safeSetText('total-weeks', formatNumber(totalWeeks, 0));
        safeSetText('total-months', formatNumber(totalMonths, 0));
        safeSetText('birth-day', birthDayName);
        safeSetText('next-birthday', `${daysToBirthday} Days (${formatDate(nextBirthday)})`);
        safeSetText('zodiac-sign', zodiac);
        safeSetText('heartbeats', formatNumber(estimatedHeartBeats, 0));

        showResult();

    } catch (err) {
        showError(err.message || 'An error occurred');
    }
}

function resetAge() {
    document.getElementById('birth-date').value = '';

    hideResult();
    clearError();

    const resultIds = [
        'years',
        'months',
        'days',
        'total-days',
        'total-hours',
        'total-minutes',
        'total-months',
        'total-weeks',
        'birth-day',
        'next-birthday',
        'age-summary'
    ];

    // Additional fields added: zodiac and heartbeats
    const extraIds = ['zodiac-sign', 'heartbeats'];

    resultIds.forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = '-';
        }
    });

    extraIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '-';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {

    const today = new Date()
        .toISOString()
        .split('T')[0];

    const birthDateInput =
        document.getElementById('birth-date');

    if (birthDateInput) {

        birthDateInput.max = today;

        birthDateInput.addEventListener(
            'keypress',
            function (event) {
                if (event.key === 'Enter') {
                    calculateAge();
                }
            }
        );
    }
});
