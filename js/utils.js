// Utility functions for all calculators

function formatNumber(num, decimals = 2) {
    if (isNaN(num)) return '0.00';
    return parseFloat(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(num, decimals = 2) {
    return '₹ ' + formatNumber(num, decimals);
}

function showError(message, elementId = 'error-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

function clearError(elementId = 'error-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('show');
    }
}

function showResult(elementId = 'result-section') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('show');
    }
}

function hideResult(elementId = 'result-section') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('show');
    }
}

function getInputValue(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    const value = element.value.trim();
    return value === '' ? null : parseFloat(value);
}

function validateNumber(value, min = null, max = null, fieldName = 'Value') {
    if (value === null || isNaN(value)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    if (min !== null && value < min) {
        throw new Error(`${fieldName} must be at least ${min}`);
    }
    if (max !== null && value > max) {
        throw new Error(`${fieldName} cannot exceed ${max}`);
    }
    return value;
}

function validatePositive(value, fieldName = 'Value') {
    return validateNumber(value, 0.01, null, fieldName);
}

function validateRange(value, min, max, fieldName = 'Value') {
    return validateNumber(value, min, max, fieldName);
}

function copyToClipboard(text, buttonElement = null) {
    navigator.clipboard.writeText(text).then(() => {
        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            setTimeout(() => {
                buttonElement.textContent = originalText;
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function calculateDaysBetweenDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();

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

    return { years, months, days };
}

function calculateCompoundInterest(principal, rate, time, n = 1) {
    // A = P(1 + r/n)^(nt)
    return principal * Math.pow(1 + (rate / 100) / n, n * time);
}

function calculateSimpleInterest(principal, rate, time) {
    // SI = (P * R * T) / 100
    return (principal * rate * time) / 100;
}

function calculateEMI(principal, annualRate, years) {
    // EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
        return principal / numberOfPayments;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return emi;
}

function calculateSIP(monthlyAmount, annualRate, years) {
    // Future Value = P × [((1 + r)^n - 1) / r] × (1 + r)
    const monthlyRate = annualRate / 100 / 12;
    const numberOfMonths = years * 12;

    if (monthlyRate === 0) {
        return monthlyAmount * numberOfMonths;
    }

    const fv = monthlyAmount *
               (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate *
               (1 + monthlyRate);

    return fv;
}

function calculateGST(amount, rate = 18) {
    return (amount * rate) / 100;
}

function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}

function calculatePercentageIncrease(original, increased) {
    return ((increased - original) / original) * 100;
}

function calculateDiscount(originalPrice, discountPercent) {
    const discountAmount = (originalPrice * discountPercent) / 100;
    const finalPrice = originalPrice - discountAmount;
    return { discountAmount, finalPrice };
}

function convertTemperature(value, fromUnit, toUnit) {
    let celsius = 0;

    if (fromUnit === 'C') celsius = value;
    else if (fromUnit === 'F') celsius = (value - 32) * 5/9;
    else if (fromUnit === 'K') celsius = value - 273.15;

    if (toUnit === 'C') return celsius;
    else if (toUnit === 'F') return (celsius * 9/5) + 32;
    else if (toUnit === 'K') return celsius + 273.15;

    return celsius;
}

function convertLength(value, fromUnit, toUnit) {
    // Convert to meters first
    const meters = {
        'mm': value / 1000,
        'cm': value / 100,
        'm': value,
        'km': value * 1000,
        'inch': value * 0.0254,
        'foot': value * 0.3048,
        'yard': value * 0.9144,
        'mile': value * 1609.34
    };

    const result = {
        'mm': meters[fromUnit] * 1000,
        'cm': meters[fromUnit] * 100,
        'm': meters[fromUnit],
        'km': meters[fromUnit] / 1000,
        'inch': meters[fromUnit] / 0.0254,
        'foot': meters[fromUnit] / 0.3048,
        'yard': meters[fromUnit] / 0.9144,
        'mile': meters[fromUnit] / 1609.34
    };

    return result[toUnit];
}

function convertWeight(value, fromUnit, toUnit) {
    // Convert to grams first
    const grams = {
        'mg': value / 1000,
        'g': value,
        'kg': value * 1000,
        'oz': value * 28.3495,
        'lb': value * 453.592
    };

    const result = {
        'mg': grams[fromUnit] * 1000,
        'g': grams[fromUnit],
        'kg': grams[fromUnit] / 1000,
        'oz': grams[fromUnit] / 28.3495,
        'lb': grams[fromUnit] / 453.592
    };

    return result[toUnit];
}

function convertVolume(value, fromUnit, toUnit) {
    // Convert to liters first
    const liters = {
        'ml': value / 1000,
        'l': value,
        'gallon': value * 3.78541,
        'oz': value * 0.0295735,
        'cup': value * 0.236588
    };

    const result = {
        'ml': liters[fromUnit] * 1000,
        'l': liters[fromUnit],
        'gallon': liters[fromUnit] / 3.78541,
        'oz': liters[fromUnit] / 0.0295735,
        'cup': liters[fromUnit] / 0.236588
    };

    return result[toUnit];
}

// Mock currency conversion (in production, use real API)
const exchangeRates = {
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

function convertCurrency(amount, fromCurrency, toCurrency) {
    const amountInINR = amount * exchangeRates[fromCurrency];
    return amountInINR / exchangeRates[toCurrency];
}

function factorial(n) {
    if (n < 0) throw new Error('Factorial is not defined for negative numbers');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculateCombinations(n, r) {
    if (r > n) throw new Error('r cannot be greater than n');
    return factorial(n) / (factorial(r) * factorial(n - r));
}

function calculatePermutations(n, r) {
    if (r > n) throw new Error('r cannot be greater than n');
    return factorial(n) / factorial(n - r);
}

// Event delegation helper
function addEventListenerToElements(selector, event, callback) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.addEventListener(event, callback);
    });
}

// Format date to readable format
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Check if value is integer
function isInteger(value) {
    return Number.isInteger(Number(value));
}

// Round to specific decimal places
function roundTo(num, decimals) {
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
}

// ----- PDF/File utility helpers -----

function showProgress(msg) {
    var el = document.getElementById('progress-area');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function hideProgress() {
    var el = document.getElementById('progress-area');
    if (el) { el.style.display = 'none'; }
}

function checkFileSize(file) {
    var el = document.getElementById('size-warning');
    if (el && file && file.size > 20 * 1024 * 1024) { el.style.display = 'block'; }
    else if (el) { el.style.display = 'none'; }
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function downloadBlob(content, fileName, mimeType) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
}

function showLoadingSpinner(el) {
    if (!el) return;
    el.innerHTML = '<div class="spinner" style="display:inline-block;width:20px;height:20px;border:3px solid var(--border-color);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:8px;"></div><span>Processing...</span>';
}
