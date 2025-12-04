// DOM Elements
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutLink = document.getElementById('logoutLink');
const dashboardLink = document.getElementById('dashboardLink');
const createAccountBtn = document.getElementById('createAccountBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close');
const servicesGrid = document.getElementById('servicesGrid');
const testimonialsSlider = document.getElementById('testimonialsSlider');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Check login status
function checkLoginStatus() {
    if (localStorage.getItem('user_id')) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';
        dashboardLink.style.display = 'block';
    }
}

// Load services 
async function loadServices() {
    try {
        const response = await fetch('./backend/service/get_all_service.php');
        const data = await response.json();

        if (data.services) {
            servicesGrid.innerHTML = '';
            data.services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <h3>${service.service_name}</h3>
                    <p class="description">${service.description.substring(0, 100)}...</p>
                    <p class="price">$${service.price} • ${service.duration} mins</p>
                    <button class="btn btn-primary" onclick="window.location.href='services.html'">Learn More</button>
                `;
                servicesGrid.appendChild(serviceCard);
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load testimonials 
async function loadTestimonials() {
    try {
        const response = await fetch('./backend/review/get_reviews.php'); // You need to create this file
        const data = await response.json();

        if (data.reviews) {
            testimonialsSlider.innerHTML = '';
            data.reviews.forEach(review => {
                const testimonialCard = document.createElement('div');
                testimonialCard.className = 'testimonial-card';
                testimonialCard.innerHTML = `
                    <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <p>"${review.comment.substring(0, 150)}..."</p>
                    <p><strong>${review.user_name}</strong></p>
                `;
                testimonialsSlider.appendChild(testimonialCard);
            });
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        testimonialsSlider.innerHTML = '<p>No testimonials available yet.</p>';
    }
}

// Login function
async function loginUser(email, password) {
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        const response = await fetch('backend/user/login.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message && data.message.startsWith('Success')) {
            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('full_name', data.full_name);
            localStorage.setItem('email', data.email);
            localStorage.setItem('role', data.role);
            
            checkLoginStatus();
            closeModal(loginModal);
            
            if (data.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            document.getElementById('loginMessage').textContent = data.message || 'Login failed';
            document.getElementById('loginMessage').style.color = 'red';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginMessage').textContent = 'Login failed. Please try again.';
        document.getElementById('loginMessage').style.color = 'red';
    }
}

// Register function
async function registerUser(name, email, phone, password, role) {
    try {
        const formData = new FormData();
        formData.append('full_name', name);
        formData.append('email', email);
        formData.append('phone_number', phone);
        formData.append('password', password);
        formData.append('role', role);

        const response = await fetch('./backend/user/register.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.message.startsWith('Success')) {
            document.getElementById('registerMessage').textContent = 'Registration successful! Please login.';
            document.getElementById('registerMessage').style.color = 'green';

            setTimeout(() => {
                closeModal(registerModal);
                openModal(loginModal);
            }, 1500);
        } else {
            document.getElementById('registerMessage').textContent = data.message;
            document.getElementById('registerMessage').style.color = 'red';
        }
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('registerMessage').textContent = 'Registration failed. Please try again.';
        document.getElementById('registerMessage').style.color = 'red';
    }
}

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
});

registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(registerModal);
});

createAccountBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(registerModal);
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(registerModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(email, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    registerUser(name, email, phone, password, role);
});

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadServices();
    loadTestimonials();
});
