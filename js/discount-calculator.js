function calculateDiscount() {
    try {
        clearError();

        const originalPrice = getInputValue('original-price');
        const discountPercent = getInputValue('discount-percent');
        const discountPercent2 = getInputValue('discount-percent-2');

        validatePositive(originalPrice, 'Original Price');
        validateRange(discountPercent, 0, 100, 'Discount Percentage');
        if (discountPercent2 !== null && discountPercent2 !== undefined && !isNaN(discountPercent2) && discountPercent2 !== '') {
            validateRange(discountPercent2, 0, 100, 'Additional Discount Percentage');
        }

        // Apply first discount
        const firstDiscountAmount = (originalPrice * discountPercent) / 100;
        let priceAfterFirst = originalPrice - firstDiscountAmount;

        let secondDiscountAmount = 0;
        let finalPrice = priceAfterFirst;

        if (discountPercent2 !== null && discountPercent2 !== undefined && !isNaN(discountPercent2) && discountPercent2 !== '') {
            secondDiscountAmount = (priceAfterFirst * discountPercent2) / 100;
            finalPrice = priceAfterFirst - secondDiscountAmount;
        }

        const totalSaved = originalPrice - finalPrice;
        const combinedPercent = (totalSaved / originalPrice) * 100;

        document.getElementById('discount-amount').textContent = formatCurrency(firstDiscountAmount);
        document.getElementById('combined-discount-amount').textContent = formatCurrency(totalSaved);
        document.getElementById('combined-discount-percent').textContent = formatNumber(combinedPercent, 2) + '%';
        document.getElementById('final-price').textContent = formatCurrency(finalPrice);
        document.getElementById('you-save').textContent = formatCurrency(totalSaved);

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function resetDiscount() {
    document.getElementById('original-price').value = '';
    document.getElementById('discount-percent').value = '';
    document.getElementById('discount-percent-2').value = '';
    hideResult();
    clearError();

    const extras = ['combined-discount-percent','combined-discount-amount'];
    extras.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = id === 'combined-discount-percent' ? '0%' : '₹0';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('discount-percent').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            calculateDiscount();
        }
    });
});
