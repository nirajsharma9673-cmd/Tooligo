async function fetchLiveRates(base = 'USD') {
    const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}`;
    try {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) throw new Error('Network response not ok');
        const data = await resp.json();
        if (!data || !data.rates) throw new Error('Invalid rate data');
        return { rates: data.rates, timestamp: data.date || new Date().toISOString().split('T')[0], source: 'live' };
    } catch (e) {
        return null;
    }
}

const FALLBACK_RATES = {
    'INR': 1,
    'USD': 83.12,
    'EUR': 90.45,
    'GBP': 105.23,
    'JPY': 0.56,
    'AUD': 54.85,
    'CAD': 61.15,
    'SGD': 62.10,
    'HKD': 10.65,
    'MYR': 17.85
};

async function convertCurrency() {
    try {
        clearError();

        const amount = getInputValue('amount');
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;

        validatePositive(amount, 'Amount');

        if (fromCurrency === toCurrency) {
            throw new Error('Please select different currencies');
        }

        // Try live fetch first
        const live = await fetchLiveRates(fromCurrency).catch(() => null);
        let rates, timestamp, source;

        if (live && live.rates) {
            rates = live.rates;
            timestamp = live.timestamp;
            source = 'live';
        } else {
            // Fallback: derive rates relative to INR-like table (fallback uses INR-based numbers)
            rates = FALLBACK_RATES;
            timestamp = 'Fallback rates (offline)';
            source = 'fallback';
        }

        // If live rates are keyed differently (non-1 base), compute rate accordingly
        // We expect rates[toCurrency] and rates[fromCurrency] to exist when live
        let rate;
        if (source === 'live') {
            if (!rates[toCurrency]) throw new Error('Rate for selected currency not available');
            rate = rates[toCurrency]; // this is amount of TO per 1 FROM when base=FROM
        } else {
            // FALLBACK_RATES are INR-based: convert via INR
            const amountInINR = amount * (FALLBACK_RATES[fromCurrency] || 1);
            const result = amountInINR / (FALLBACK_RATES[toCurrency] || 1);
            const displayRate = (FALLBACK_RATES[toCurrency] && FALLBACK_RATES[fromCurrency]) ? (FALLBACK_RATES[fromCurrency] / FALLBACK_RATES[toCurrency]) : 0;
            document.getElementById('from-label').textContent = amount + ' ' + fromCurrency;
            document.getElementById('to-label').textContent = 'Equals in ' + toCurrency;
            document.getElementById('from-result').textContent = formatNumber(amount, 2) + ' ' + fromCurrency;
            document.getElementById('to-result').textContent = formatNumber(result, 2) + ' ' + toCurrency;
            document.getElementById('exchange-rate').textContent = '1 ' + fromCurrency + ' = ' + formatNumber(displayRate, 4) + ' ' + toCurrency;
            document.getElementById('rates-info').textContent = `Rates last updated: ${timestamp} — Indicative rates only.`;
            showResult();
            return;
        }

        // With live rates (base = fromCurrency), rate = rates[toCurrency]
        const result = amount * rate;

        document.getElementById('from-label').textContent = amount + ' ' + fromCurrency;
        document.getElementById('to-label').textContent = 'Equals in ' + toCurrency;
        document.getElementById('from-result').textContent = formatNumber(amount, 2) + ' ' + fromCurrency;
        document.getElementById('to-result').textContent = formatNumber(result, 2) + ' ' + toCurrency;
        document.getElementById('exchange-rate').textContent = '1 ' + fromCurrency + ' = ' + formatNumber(rate, 6) + ' ' + toCurrency;
        document.getElementById('rates-info').textContent = `Rates last updated: ${timestamp} (source: exchangerate.host) — Indicative rates only.`;

        showResult();
    } catch (error) {
        showError(error.message || 'Conversion failed');
    }
}

function resetCurrency() {
    document.getElementById('amount').value = '';
    document.getElementById('from-currency').value = 'INR';
    document.getElementById('to-currency').value = 'INR';
    hideResult();
    clearError();
    const ratesInfo = document.getElementById('rates-info');
    if (ratesInfo) ratesInfo.textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('amount').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            convertCurrency();
        }
    });
});
