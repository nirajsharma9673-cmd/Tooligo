function calculateDateDifference() {
    try {
        clearError();

        const startDateStr = document.getElementById('start-date').value;
        const endDateStr = document.getElementById('end-date').value;

        if (!startDateStr || !endDateStr) {
            throw new Error('Please select both start and end dates');
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // Ensure start <= end for calculations; keep sign for display
        let start = new Date(startDateStr);
        let end = new Date(endDateStr);
        let negative = false;
        if (start > end) {
            const tmp = start; start = end; end = tmp; negative = true;
        }

        // Total days (UTC safe)
        const msPerDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.ceil((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / msPerDay);

        // Weeks
        const weeks = Math.floor(totalDays / 7);

        // Approx months/years kept for reference (existing UI)
        const monthsApprox = Math.floor(totalDays / 30.44);
        const yearsApprox = Math.floor(totalDays / 365.25);

        // Exact years/months/days breakdown
        let y1 = start.getFullYear();
        let m1 = start.getMonth();
        let d1 = start.getDate();
        let y2 = end.getFullYear();
        let m2 = end.getMonth();
        let d2 = end.getDate();

        let years = y2 - y1;
        let months = m2 - m1;
        let days = d2 - d1;

        if (days < 0) {
            // borrow days from previous month of end
            const prevMonth = new Date(y2, m2, 0); // last day of previous month
            days += prevMonth.getDate();
            months -= 1;
        }

        if (months < 0) {
            months += 12;
            years -= 1;
        }

        // Business days count (Mon-Fri) inclusive of start and end
        function countBusinessDays(a, b) {
            let count = 0;
            const cur = new Date(a.getFullYear(), a.getMonth(), a.getDate());
            const last = new Date(b.getFullYear(), b.getMonth(), b.getDate());
            while (cur <= last) {
                const wd = cur.getDay();
                if (wd !== 0 && wd !== 6) count++;
                cur.setDate(cur.getDate() + 1);
            }
            return count;
        }

        const businessDays = countBusinessDays(start, end);

        // Update DOM
        document.getElementById('total-days').textContent = formatNumber(totalDays, 0);
        document.getElementById('weeks').textContent = formatNumber(weeks, 0);
        document.getElementById('months').textContent = formatNumber(monthsApprox, 0);
        document.getElementById('years').textContent = formatNumber(yearsApprox, 0);
        document.getElementById('exact-difference').textContent = `${negative ? '-' : ''}${years} years, ${months} months, ${days} days`;
        document.getElementById('business-days').textContent = formatNumber(businessDays, 0);

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetDateDifference() {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    hideResult();
    clearError();
    const extras = ['exact-difference','business-days'];
    extras.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = id === 'exact-difference' ? '0 years, 0 months, 0 days' : '0';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').max = today;
    document.getElementById('end-date').max = today;
});
