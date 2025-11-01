// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
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
document.querySelector('.cta-button').addEventListener('click', () => {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth'
    });
});

// Swap button click handler
document.querySelector('.swap-btn').addEventListener('click', () => {
    const swapMessage = `Hi! I'm interested in your phone swap deals. I have an old iPhone that I'd like to trade in for a newer model. Could you please provide me with a quote for the trade-in value and what models are available for swap?`;
    const swapUrl = `https://wa.me/265880950026?text=${encodeURIComponent(swapMessage)}`;
    window.open(swapUrl, '_blank');
});

// Modal elements
const modal = document.getElementById('productModal');
const closeBtn = document.querySelector('.close');

// Generate content when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, generating content...');
    
    if (typeof generateProductCards === 'function') {
        generateProductCards();
        console.log('Product cards generated');
    }
    
    if (typeof generateHappyCustomers === 'function') {
        generateHappyCustomers();
        console.log('Happy customers generated');
    }
    
    if (typeof generateCustomerReviews === 'function') {
        generateCustomerReviews();
        console.log('Customer reviews generated');
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
    const isPhone = productName.includes('iPhone');
    const isAccessory = productName.includes('AirPods') || productName.includes('Accessories');
    
    if (isPhone) {
        document.getElementById('batteryHealthItem').style.display = 'flex';
        document.getElementById('faceIdItem').style.display = 'flex';
        document.getElementById('trueToneItem').style.display = 'flex';
        document.getElementById('batteryReplacedItem').style.display = 'flex';
        document.getElementById('conditionItem').style.display = 'flex';
        
        document.getElementById('modalBatteryHealth').textContent = product.batteryHealth;
        document.getElementById('modalFaceId').textContent = product.faceId;
        document.getElementById('modalTrueTone').textContent = product.trueTone;
        document.getElementById('modalBatteryReplaced').textContent = product.batteryReplaced;
        document.getElementById('modalCondition').textContent = product.condition;
    } else {
        // Hide phone-specific details for accessories
        document.getElementById('batteryHealthItem').style.display = 'none';
        document.getElementById('faceIdItem').style.display = 'none';
        document.getElementById('trueToneItem').style.display = 'none';
        document.getElementById('batteryReplacedItem').style.display = 'none';
        document.getElementById('conditionItem').style.display = 'flex';
        
        document.getElementById('modalCondition').textContent = product.condition;
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
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
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


