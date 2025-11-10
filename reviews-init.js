// Ensure customer reviews are generated on page load
window.addEventListener('load', function() {
    if (typeof generateCustomerReviews === 'function') {
        generateCustomerReviews();
    }
});

