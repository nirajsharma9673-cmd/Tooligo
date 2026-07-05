function calculateGST() {
    try {
        clearError();

        const price = getInputValue('price-amount');
        const rate = parseFloat(document.getElementById('gst-rate').value);
        const includesGST = document.getElementById('includes-gst').checked;

        validatePositive(price, 'Price');
        validateNumber(rate, 0, 100, 'GST Rate');

        let basePrice, gstAmount, finalPrice;
        if (includesGST) {
            // price is final price (includes GST). Reverse-calculate base price.
            basePrice = price / (1 + rate / 100);
            gstAmount = price - basePrice;
            finalPrice = price;
        } else {
            basePrice = price;
            gstAmount = (basePrice * rate) / 100;
            finalPrice = basePrice + gstAmount;
        }

        document.getElementById('base-price').textContent = formatCurrency(basePrice);
        document.getElementById('gst-amount').textContent = formatCurrency(gstAmount);
        document.getElementById('final-price').textContent = formatCurrency(finalPrice);

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetGST() {
    document.getElementById('price-amount').value = '';
    document.getElementById('gst-rate').value = '18';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('gst-rate').addEventListener('change', function() {
        if (document.getElementById('result-section').classList.contains('show')) {
            calculateGST();
        }
    });
    document.getElementById('includes-gst').addEventListener('change', function() {
        if (document.getElementById('result-section').classList.contains('show')) {
            calculateGST();
        }
    });
});
