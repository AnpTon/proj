const servicesList = document.getElementById('servicesList');
const searchBar = document.getElementById('searchBar');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const durationButtons = document.querySelectorAll('.duration-btn');
const sortSelect = document.getElementById('sortSelect');
const searchBtn = document.querySelector('.search-btn');

let allServices = [];
let filteredServices = [];

// Load services 
async function loadAllServices() {
    try {
        const response = await fetch('./backend/service/get_all_service.php');
        const data = await response.json();
        
        if (data.services) {
            allServices = data.services;
            filteredServices = [...allServices];
            displayServices();
        }
    } catch (error) {
        console.error('Error loading services:', error);
        servicesList.innerHTML = '<div class="no-results">Unable to load services. Please try again later.</div>';
    }
}

// Display services
function displayServices() {
    if (filteredServices.length === 0) {
        servicesList.innerHTML = '<div class="no-results">No services match your filters.</div>';
        return;
    }

    servicesList.innerHTML = filteredServices.map(service => `
        <div class="service-detail-card">
            <div class="service-image">
                <!-- Placeholder icon - you can replace with actual images -->
                <span>🧘</span>
            </div>
            <div class="service-content">
                <h3>${service.service_name}</h3>
                <div class="service-price">$${service.price}</div>
                <div class="service-duration">${service.duration} minutes</div>
                <p class="service-description">${service.description}</p>
                <button class="btn btn-primary book-service-btn" data-id="${service.service_id}">
                    Book This Service
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.book-service-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceId = e.target.getAttribute('data-id');
            bookService(serviceId);
        });
    });
}

// Filter services
function filterServices() {
    const searchTerm = searchBar.value.toLowerCase();
    const maxPrice = parseInt(priceRange.value);
    const activeDurationBtn = document.querySelector('.duration-btn.active');
    const durationFilter = activeDurationBtn ? activeDurationBtn.getAttribute('data-duration') : 'all';
    const sortBy = sortSelect.value;

    filteredServices = allServices.filter(service => {
        const matchesSearch = service.service_name.toLowerCase().includes(searchTerm) ||
                            service.description.toLowerCase().includes(searchTerm);
        
        const matchesPrice = parseFloat(service.price) <= maxPrice;
        
        let matchesDuration = true;
        if (durationFilter !== 'all') {
            matchesDuration = parseInt(service.duration) === parseInt(durationFilter);
        }
        
        return matchesSearch && matchesPrice && matchesDuration;
    });

    sortServices(sortBy);
    displayServices();
}

// Sort services
function sortServices(sortBy) {
    filteredServices.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.service_name.localeCompare(b.service_name);
            
            case 'price_low':
                return parseFloat(a.price) - parseFloat(b.price);
            
            case 'price_high':
                return parseFloat(b.price) - parseFloat(a.price);
            
            case 'duration':
                return parseInt(a.duration) - parseInt(b.duration);
            
            default:
                return 0;
        }
    });
}

// Book service
function bookService(serviceId) {
    if (!localStorage.getItem('user_id')) {
        alert('Please login to book a service.');
        document.getElementById('loginLink').click();
        return;
    }
    
    localStorage.setItem('selected_service_id', serviceId);
    window.location.href = 'booking.html';
}

function updatePriceValue() {
    const maxPrice = priceRange.value;
    priceValue.textContent = `$0 - $${maxPrice}`;
}

searchBar.addEventListener('input', filterServices);
searchBtn.addEventListener('click', filterServices);

priceRange.addEventListener('input', () => {
    updatePriceValue();
    filterServices();
});

durationButtons.forEach(button => {
    button.addEventListener('click', () => {
        durationButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterServices();
    });
});

sortSelect.addEventListener('change', filterServices);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadAllServices();
    updatePriceValue();
    
    if (typeof checkLoginStatus === 'function') {
        checkLoginStatus();
    }
});