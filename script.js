// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.1)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }
});

// Product card hover effects
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// CTA Button click handler
const ctaBtn = document.querySelector('.cta-button');
if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        const products = document.getElementById('products');
        if (products) products.scrollIntoView({ behavior: 'smooth' });
    });
}

// Swap button click handler
const swapBtn = document.querySelector('.swap-btn');
if (swapBtn) {
    swapBtn.addEventListener('click', () => {
        const swapMessage = `Hi! I'm interested in your phone swap deals. I have an old iPhone that I'd like to trade in for a newer model. Could you please provide me with a quote for the trade-in value and what models are available for swap?`;
        const swapUrl = `https://wa.me/265880950026?text=${encodeURIComponent(swapMessage)}`;
        window.open(swapUrl, '_blank');
    });
}

// Modal elements
const modal = document.getElementById('productModal');
const closeBtn = document.querySelector('.close');

// Generate content when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (typeof generateProductCards === 'function') {
        generateProductCards();
        // Start polling for updates every 30s if available
        if (typeof startProductPolling === 'function') {
            startProductPolling(30000);
        }
    }
    
    if (typeof generateHappyCustomers === 'function') {
        generateHappyCustomers();
    }
    
    if (typeof generateCustomerReviews === 'function') {
        generateCustomerReviews();
    }
    
    // Refresh products when tab becomes visible (helps reflect admin changes quickly)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && typeof refreshIfChanged === 'function') {
            refreshIfChanged();
        }
    });

    // Delegate clicks on dynamic product buttons to reliably open the modal
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.addEventListener('click', function(e){
            const btn = e.target.closest('.product-btn');
            if (!btn) return;
            const card = btn.closest('.product-card');
            if (!card) return;
            const nameEl = card.querySelector('h3');
            if (!nameEl) return;
            const productName = nameEl.textContent;
            if (typeof showProductDetails === 'function') showProductDetails(productName);
        });
    }
});

// Show product details modal
function showProductDetails(productName) {
    const product = PRODUCT_DATA[productName];
    if (!product) return;
    
    // Update modal content
    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductImage').alt = productName;
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').textContent = product.price;
    document.getElementById('modalAvailability').textContent = product.availability;
    
    // Show/hide phone-specific details
    const isPhone = (
        product.batteryHealth !== undefined ||
        product.faceId !== undefined ||
        product.trueTone !== undefined ||
        product.batteryReplaced !== undefined
    );
    const isAccessory = productName.toLowerCase().includes('airpods') || productName.toLowerCase().includes('accessories');
    
    if (isPhone) {
        document.getElementById('batteryHealthItem').style.display = 'flex';
        document.getElementById('faceIdItem').style.display = 'flex';
        document.getElementById('trueToneItem').style.display = 'flex';
        document.getElementById('batteryReplacedItem').style.display = 'flex';
        document.getElementById('conditionItem').style.display = 'flex';
        document.getElementById('generationItem').style.display = 'none';
        
        document.getElementById('modalBatteryHealth').textContent = product.batteryHealth;
        document.getElementById('modalFaceId').textContent = product.faceId;
        document.getElementById('modalTrueTone').textContent = product.trueTone;
        document.getElementById('modalBatteryReplaced').textContent = product.batteryReplaced;
        document.getElementById('modalCondition').textContent = product.condition;
    } else {
        // Hide phone-specific details
        document.getElementById('batteryHealthItem').style.display = 'none';
        document.getElementById('faceIdItem').style.display = 'none';
        document.getElementById('trueToneItem').style.display = 'none';
        document.getElementById('batteryReplacedItem').style.display = 'none';
        // Show AirPods generation if present, otherwise hide
        const hasGeneration = product.generation !== undefined && product.generation !== '';
        document.getElementById('generationItem').style.display = hasGeneration ? 'flex' : 'none';
        if (hasGeneration) {
            document.getElementById('modalGeneration').textContent = product.generation;
        }
        // Show condition row if provided
        const hasCondition = product.condition !== undefined && product.condition !== '';
        document.getElementById('conditionItem').style.display = hasCondition ? 'flex' : 'none';
        if (hasCondition) {
            document.getElementById('modalCondition').textContent = product.condition;
        }
    }
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Update Contact Us button with WhatsApp link
    const contactBtn = document.querySelector('.modal-btn.primary');
    const whatsappMessage = `Hi! I'm interested in the ${productName} (${product.price}). Could you please provide more information about this product?`;
    const whatsappUrl = `https://wa.me/265880950026?text=${encodeURIComponent(whatsappMessage)}`;
    contactBtn.onclick = () => window.open(whatsappUrl, '_blank');
    
    // Update Get Quote button with WhatsApp link
    const quoteBtn = document.querySelector('.modal-btn.secondary');
    const quoteMessage = `Hi! I'd like to get a quote for the ${productName} (${product.price}). What's the best price you can offer? Also, do you have any special deals or discounts available?`;
    const quoteUrl = `https://wa.me/265880950026?text=${encodeURIComponent(quoteMessage)}`;
    quoteBtn.onclick = () => window.open(quoteUrl, '_blank');
}

// Close modal
if (closeBtn && modal) {
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (modal && event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);


// Add loading animation for images (when real images are added)
function preloadImages() {
    const imageUrls = [
        // Add your image URLs here when you have them
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}


