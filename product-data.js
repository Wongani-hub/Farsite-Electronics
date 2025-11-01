// Centralized Product Data - Edit prices here
const PRODUCT_DATA = {
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
    'iPhone 14': {
        image: 'Pictures/Iphones/14ProMax3.jpg',
        price: 'MWK 1,780,000',
        availability: 'In Stock',
        batteryHealth: '95%',
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

// Function to generate product cards dynamically
function generateProductCards() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
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
        productsGrid.appendChild(productCard);
    });
    
    // Re-attach event listeners to the new buttons
    attachProductButtonListeners();
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

// Function to generate happy customers section
function generateHappyCustomers() {
    const customersGrid = document.getElementById('customersGrid');
    if (!customersGrid) return;
    
    customersGrid.innerHTML = '';
    
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
                <span class="review-date">${customer.date}</span>
            </div>
        `;
        customersGrid.appendChild(customerCard);
    });
}

// Function to generate customer reviews section
function generateCustomerReviews() {
    console.log('generateCustomerReviews called');
    const reviewsGrid = document.getElementById('reviewsGrid');
    console.log('reviewsGrid element:', reviewsGrid);
    
    if (!reviewsGrid) {
        console.log('reviewsGrid not found');
        return;
    }
    
    console.log('CUSTOMER_DATA:', CUSTOMER_DATA);
    reviewsGrid.innerHTML = '';
    
    CUSTOMER_DATA.forEach((customer, index) => {
        console.log(`Creating review card ${index + 1}:`, customer.name);
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
            <span class="review-date">${customer.date}</span>
        `;
        reviewsGrid.appendChild(reviewCard);
    });
    
    console.log('Customer reviews generation completed');
}
