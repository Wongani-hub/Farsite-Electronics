// Centralized Product Data - default static fallback (used if API not available)
let PRODUCT_DATA = {
    'iPhone 14 Pro Max': {
        image: 'Pictures/Iphones/Iphone 13Pro Max.jpg',
        price: 'MWK 2,780,000',
        availability: 'In Stock',
        batteryHealth: '98%',
        faceId: 'Available',
        trueTone: 'Available',
        batteryReplaced: 'No',
        condition: 'Brand New (Unboxed)'
    },
    'AirPods Pro 2': {
        image: 'Pictures/Iphones/Airpods pro 2.jpg',
        price: 'MWK 65,000',
        availability: 'In Stock',
        condition: 'Brand New (Unboxed)'
    },
    'iPhone 13 Pro Max': {
        image: 'Pictures/Iphones/13 Pro Max.jpg',
        price: 'MWK 2,380,000',
        availability: 'In Stock',
        batteryHealth: '92%',
        faceId: 'Available',
        trueTone: 'Available',
        batteryReplaced: 'Yes (2024)',
        condition: 'Excellent (Refurbished)'
    },
    'iPhone 14 Pro Max Black': {
        image: 'Pictures/Iphones/14proMaxblack1.jpg',
        price: 'MWK 2,780,000',
        availability: 'In Stock',
        batteryHealth: '96%',
        faceId: 'Available',
        trueTone: 'Available',
        batteryReplaced: 'No',
        condition: 'Brand New (Unboxed)'
    },
    'iPhone Accessories': {
        image: 'Pictures/Iphones/apple_usbc_charger.jpg',
        price: 'MWK 35,000',
        availability: 'In Stock',
        condition: 'Brand New (Unboxed)'
    }
};

// Load latest products from API and normalize into PRODUCT_DATA map
async function loadProductsFromAPI() {
    try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const items = await res.json();
        const map = {};
        items.forEach(p => {
            const priceStr = formatPrice(p.currency || 'MWK', Number(p.price));
            map[p.name] = {
                image: p.image || '',
                price: priceStr,
                availability: p.availability || 'In Stock',
                batteryHealth: p.details && p.details.batteryHealth,
                faceId: p.details && p.details.faceId,
                trueTone: p.details && p.details.trueTone,
                batteryReplaced: p.details && p.details.batteryReplaced,
                condition: (p.details && p.details.condition) || p.description || '',
                generation: p.details && p.details.generation
            };
        });
        PRODUCT_DATA = map;
        return true;
    } catch (_) {
        return false;
    }
}

function formatPrice(currency, amount) {
    try {
        const n = Number(amount);
        if (!isFinite(n)) return `${currency} ${amount}`;
        return `${currency} ${new Intl.NumberFormat('en-US').format(n)}`;
    } catch {
        return `${currency} ${amount}`;
    }
}

// Helper function to render product cards (reusable)
function renderProductCards(container) {
    if (!container) return;
    
    container.innerHTML = '';
    Object.entries(PRODUCT_DATA).forEach(([productName, productData]) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${productData.image}" alt="${productName}" class="product-img">
            </div>
            <div class="product-info">
                <h3>${productName}</h3>
                <p class="product-price">${productData.price}</p>
                <button class="product-btn">View Details</button>
            </div>
        `;
        container.appendChild(productCard);
    });
    attachProductButtonListeners();
}

// Render product cards into #productsGrid
async function generateProductCards() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    await loadProductsFromAPI();
    renderProductCards(productsGrid);
}

// Polling to keep customer side up-to-date
let __lastProductsHash = '';
function hashProductsMap(mapObj) {
    try {
        // Create a stable string by sorting keys
        const keys = Object.keys(mapObj).sort();
        const parts = keys.map(k => `${k}|${JSON.stringify(mapObj[k])}`);
        return parts.join('::');
    } catch {
        return Math.random().toString(36);
    }
}

async function refreshIfChanged() {
    const beforeHash = hashProductsMap(PRODUCT_DATA);
    await loadProductsFromAPI();
    const afterHash = hashProductsMap(PRODUCT_DATA);
    if (beforeHash !== afterHash) {
        const grid = document.getElementById('productsGrid');
        if (grid) {
            renderProductCards(grid);
        }
    }
}

function startProductPolling(intervalMs = 60000) {
    // initialize hash
    __lastProductsHash = hashProductsMap(PRODUCT_DATA);
    // Poll periodically
    setInterval(refreshIfChanged, intervalMs);
}

// Function to attach event listeners to product buttons
function attachProductButtonListeners() {
    document.querySelectorAll('.product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.closest('.product-card').querySelector('h3').textContent;
            showProductDetails(productName);
        });
    });
}

// Customer Data - Edit customer information here only once
const CUSTOMER_DATA = [
    {
        name: 'Mellisa Taulo',
        photo: 'Pictures/Customer Reviews/Customer 2.jpg',
        review: "Excellent service! Got my iPhone 15 Pro Max delivered the same day I ordered. The phone swap deal was amazing - got great value for my old iPhone 12. Highly recommended!",
        rating: '★★★★★',
        date: '2 days ago'
    },
    {
        name: 'James Msiska',
        photo: 'Pictures/Customer Reviews/Customer 3.jpg',
        review: "Best electronics shop in Blantyre! The staff is knowledgeable and the free delivery service is fantastic. My Iphone 11 Pro Max work perfectly. Will definitely shop here again.",
        rating: '★★★★★',
        date: '1 week ago'
    },
    {
        name: 'Mercy Kachale',
        photo: 'Pictures/Customer Reviews/Customer 4.jpg',
        review: "Fast and reliable service. Ordered a Samsung Galaxy S24 and it arrived in perfect condition. The customer support team was very helpful with all my questions.",
        rating: '★★★★★',
        date: '2 weeks ago'
    },
    {
        name: 'Alice Mwenda',
        photo: 'Pictures/Customer Reviews/Customer 5.jpg',
        review: "Great prices and authentic products. I was skeptical about buying electronics online, but Farsite Electronics exceeded my expectations. My iPhone 14 Pro Max is flawless!",
        rating: '★★★★★',
        date: '3 weeks ago'
    },
    {
        name: 'Emma Phiri',
        photo: 'Pictures/Customer Reviews/Customer 6.jpg',
        review: "Professional service from start to finish. The phone swap process was smooth and I got a fair price for my old device. Free delivery to my office was a bonus!",
        rating: '★★★★★',
        date: '1 month ago'
    },
    {
        name: 'Thomas Banda',
        photo: 'Pictures/Customer Reviews/Customer 7.jpg',
        review: "Love the variety of products available. From iPhones to Samsung phones, they have everything. The website is easy to navigate and the ordering process is simple.",
        rating: '★★★★★',
        date: '1 month ago'
    }
];

// Try fetching live reviews from backend and normalize into CUSTOMER_DATA shape
async function loadReviewsFromAPI() {
    try {
        const res = await fetch('/api/reviews', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const items = await res.json();
        if (!Array.isArray(items)) throw new Error('Bad reviews payload');
        const mapped = items.map(r => ({
            name: r.name || '',
            photo: r.photo || '',
            review: r.review || '',
            rating: r.rating || '★★★★★',
            date: '',
            createdAt: r.createdAt || ''
        }));
        CUSTOMER_DATA.length = 0;
        mapped.forEach(x => CUSTOMER_DATA.push(x));
        return true;
    } catch (e) {
        return false;
    }
}

// Function to generate happy customers section
async function generateHappyCustomers() {
    const customersGrid = document.getElementById('customersGrid');
    if (!customersGrid) return;

    customersGrid.innerHTML = '';
    await loadReviewsFromAPI();

    CUSTOMER_DATA.forEach(customer => {
        const customerCard = document.createElement('div');
        customerCard.className = 'customer-card';
        customerCard.innerHTML = `
            <div class="customer-image">
                <img src="${customer.photo}" alt="${customer.name}" class="customer-photo">
            </div>
            <div class="customer-info">
                <h4>${customer.name}</h4>
                <div class="customer-rating">${customer.rating}</div>
                <p class="customer-review">${customer.review}</p>
                <span class="review-date">${formatAbsoluteTime(customer.createdAt) || customer.date}</span>
            </div>
        `;
        customersGrid.appendChild(customerCard);
    });
    // Using fixed absolute timestamps; no auto-updates required
}

// Function to generate customer reviews section
async function generateCustomerReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    reviewsGrid.innerHTML = '';
    await loadReviewsFromAPI();

    CUSTOMER_DATA.forEach(customer => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <img src="${customer.photo}" alt="${customer.name}" class="review-photo">
                <div class="review-info">
                    <h4>${customer.name}</h4>
                    <div class="review-rating">${customer.rating}</div>
                </div>
            </div>
            <p class="review-text">${customer.review}</p>
            <span class="review-date">${formatAbsoluteTime(customer.createdAt) || customer.date}</span>
        `;
        reviewsGrid.appendChild(reviewCard);
    });
    // Using fixed absolute timestamps; no auto-updates required
}

function formatAbsoluteTime(iso) {
    try {
        if (!iso) return '';
        const d = new Date(iso);
        // Use a consistent, readable format
        return d.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch { return ''; }
}

// ... (rest of the code remains the same)
