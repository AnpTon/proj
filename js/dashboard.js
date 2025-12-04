const welcomeGreeting = document.getElementById('welcomeGreeting');
const accountStatus = document.getElementById('accountStatus');
const memberSince = document.getElementById('memberSince');
const upcomingAppointments = document.getElementById('upcomingAppointments');
const pastAppointments = document.getElementById('pastAppointments');
const editProfileForm = document.getElementById('editProfileForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const contactEmail = document.getElementById('contactEmail');
const contactPhone = document.getElementById('contactPhone');
const contactRole = document.getElementById('contactRole');
const promotionsList = document.getElementById('promotionsList');
const reviewModal = document.getElementById('reviewModal');
const reviewForm = document.getElementById('reviewForm');
const stars = document.querySelectorAll('.star');
const reviewRating = document.getElementById('reviewRating');
let currentUser = null;
let currentAppointmentForReview = null;
function checkAuth() {
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('full_name');
    
    if (!userId) {
        window.location.href = 'index.html';
        return false;
    }
    
    currentUser = {
        id: userId,
        name: userName
    };
    
    return true;
}

// Load user data
async function loadUserData() {
    try {
        const response = await fetch('./backend/user/get_user.php');
        const data = await response.json();
        
        if (data.user) {
            const user = data.user;
            
            welcomeGreeting.textContent = `Welcome back, ${user.full_name}!`;
            contactEmail.textContent = user.email;
            contactPhone.textContent = user.phone_number || 'Not provided';
            contactRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            memberSince.textContent = new Date(user.created_at).toLocaleDateString();
            
            localStorage.setItem('user_id', user.user_id);
            localStorage.setItem('full_name', user.full_name);
            localStorage.setItem('email', user.email);
            
            document.getElementById('editFullName').value = user.full_name;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editPhone').value = user.phone_number || '';
        } else if (data.error) {
            alert('Session expired. Please login again.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load appointments
async function loadAppointments() {
    try {
        const response = await fetch('./backend/appointment/get_user_appointments.php');
        const data = await response.json();
        
        if (data.appointments) {
            const now = new Date();
            const upcoming = [];
            const past = [];
            
            data.appointments.forEach(appointment => {
                const apptDate = new Date(appointment.appointment_date + ' ' + appointment.start_time);
                
                if (apptDate > now && appointment.status !== 'canceled') {
                    upcoming.push(appointment);
                } else {
                    past.push(appointment);
                }
            });
            
            upcoming.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
            
            past.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
            
            displayAppointments(upcoming, upcomingAppointments, true);
            displayAppointments(past, pastAppointments, false);
        } else if (data.error) {
            alert('Session expired. Please login again.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Display appointments
function displayAppointments(appointments, container, isUpcoming) {
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No ${isUpcoming ? 'upcoming' : 'past'} appointments found</p>
                ${isUpcoming ? '<a href="services.html" class="btn btn-primary">Book Now</a>' : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(appointment => {
        const statusClass = `status-${appointment.status}`;
        const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
        
        return `
            <div class="appointment-card">
                <div class="appointment-header">
                    <span class="appointment-service">${appointment.service_name}</span>
                    <span class="appointment-status ${statusClass}">${statusText}</span>
                </div>
                <div class="appointment-details">
                    <p><strong>Date:</strong> ${appointment.appointment_date}</p>
                    <p><strong>Time:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
                    <p><strong>Therapist:</strong> ${appointment.therapist_name}</p>
                    <p><strong>Price:</strong> $${appointment.price}</p>
                    ${appointment.review_id ? 
                        `<p><strong>Your Review:</strong> ${'★'.repeat(appointment.rating)}${'☆'.repeat(5-appointment.rating)}</p>` : 
                        ''
                    }
                </div>
                <div class="appointment-actions">
                    ${isUpcoming && appointment.status === 'pending' ? `
                        <button class="btn btn-secondary cancel-appointment" data-id="${appointment.appointment_id}">Cancel</button>
                        <button class="btn btn-primary reschedule-appointment" data-id="${appointment.appointment_id}">Reschedule</button>
                    ` : ''}
                    ${!isUpcoming && appointment.status === 'completed' && !appointment.review_id ? `
                        <button class="btn btn-primary leave-review" data-id="${appointment.appointment_id}">Leave Review</button>
                    ` : ''}
                    ${!isUpcoming && appointment.review_id ? `
                        <button class="btn btn-secondary view-review" data-id="${appointment.review_id}">View Review</button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    if (isUpcoming) {
        document.querySelectorAll('.cancel-appointment').forEach(btn => {
            btn.addEventListener('click', cancelAppointment);
        });
        document.querySelectorAll('.reschedule-appointment').forEach(btn => {
            btn.addEventListener('click', rescheduleAppointment);
        });
    } else {
        document.querySelectorAll('.leave-review').forEach(btn => {
            btn.addEventListener('click', openReviewModal);
        });
        document.querySelectorAll('.view-review').forEach(btn => {
            btn.addEventListener('click', viewReview);
        });
    }
}

// Load promotions
async function loadPromotions() {
    try {
        const response = await fetch('./backend/payment/get_promotions.php');
        const data = await response.json();
        
        if (data.promotions && data.promotions.length > 0) {
            promotionsList.innerHTML = data.promotions.map(promo => `
                <div class="promo-card">
                    <h4>${promo.description}</h4>
                    <div class="promo-code">${promo.promo_code}</div>
                    <p>${promo.discount_percent}% off • Valid until ${promo.end_date}</p>
                </div>
            `).join('');
        } else {
            promotionsList.innerHTML = '<p class="empty-state">No active promotions at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading promotions:', error);
        promotionsList.innerHTML = '<p class="empty-state">Unable to load promotions.</p>';
    }
}

// Cancel appointment
async function cancelAppointment(e) {
    const appointmentId = e.target.getAttribute('data-id');
    
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('appointment_id', appointmentId);
        formData.append('new_status', 'canceled');
        
        const response = await fetch('./backend/appointment/update_status.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            alert('Appointment cancelled successfully');
            loadAppointments(); 
        } else {
            alert('Error cancelling appointment: ' + data.message);
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Error cancelling appointment');
    }
}

// Reschedule appointment
function rescheduleAppointment(e) {
    const appointmentId = e.target.getAttribute('data-id');
    alert('Redirecting to booking page for rescheduling...');
    window.location.href = 'booking.html';
}

// Open review modal
function openReviewModal(e) {
    currentAppointmentForReview = e.target.getAttribute('data-id');
    document.getElementById('reviewAppointmentId').value = currentAppointmentForReview;
    openModal(reviewModal);
}

// View review
function viewReview(e) {
    const reviewId = e.target.getAttribute('data-id');
    alert(`Review ID: ${reviewId}\nFeature to view full review details coming soon!`);
}

// Submit review
async function submitReview(e) {
    e.preventDefault();
    
    const appointmentId = document.getElementById('reviewAppointmentId').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (!comment) {
        document.getElementById('reviewMessage').textContent = 'Please enter a comment';
        document.getElementById('reviewMessage').style.color = 'red';
        return;
    }
    
    try {
        const userId = localStorage.getItem('user_id');
        const formData = new FormData();
        formData.append('appointment_id', appointmentId);
        formData.append('user_id', userId);
        formData.append('rating', rating);
        formData.append('comment', comment);
        
        const response = await fetch('./backend/review/submit_review.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            document.getElementById('reviewMessage').textContent = 'Review submitted successfully!';
            document.getElementById('reviewMessage').style.color = 'green';
            
            setTimeout(() => {
                closeModal(reviewModal);
                loadAppointments(); 
            }, 1500);
        } else {
            document.getElementById('reviewMessage').textContent = data.message;
            document.getElementById('reviewMessage').style.color = 'red';
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        document.getElementById('reviewMessage').textContent = 'Error submitting review';
        document.getElementById('reviewMessage').style.color = 'red';
    }
}

// Update profile
async function updateProfile(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    
    try {
        const userId = localStorage.getItem('user_id');
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('full_name', fullName);
        formData.append('email', email);
        formData.append('phone_number', phone);
        
        const response = await fetch('./backend/user/update_profile.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            document.getElementById('profileMessage').textContent = 'Profile updated successfully!';
            document.getElementById('profileMessage').style.color = 'green';
            
            localStorage.setItem('full_name', fullName);
            
            setTimeout(() => {
                loadUserData();
            }, 1000);
        } else {
            document.getElementById('profileMessage').textContent = data.message;
            document.getElementById('profileMessage').style.color = 'red';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        document.getElementById('profileMessage').textContent = 'Error updating profile';
        document.getElementById('profileMessage').style.color = 'red';
    }
}

// Change password
async function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        document.getElementById('passwordMessage').textContent = 'New passwords do not match';
        document.getElementById('passwordMessage').style.color = 'red';
        return;
    }
    
    if (newPassword.length < 6) {
        document.getElementById('passwordMessage').textContent = 'Password must be at least 6 characters';
        document.getElementById('passwordMessage').style.color = 'red';
        return;
    }
    
    
    document.getElementById('passwordMessage').textContent = 'Password change feature requires backend implementation';
    document.getElementById('passwordMessage').style.color = 'orange';
}

// Star rating 
stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = star.getAttribute('data-rating');
        reviewRating.value = rating;
        
        stars.forEach(s => {
            if (s.getAttribute('data-rating') <= rating) {
                s.classList.add('active');
                s.textContent = '★';
            } else {
                s.classList.remove('active');
                s.textContent = '☆';
            }
        });
    });
    
    star.addEventListener('mouseover', () => {
        const rating = star.getAttribute('data-rating');
        
        stars.forEach(s => {
            if (s.getAttribute('data-rating') <= rating) {
                s.textContent = '★';
            } else {
                s.textContent = '☆';
            }
        });
    });
    
    star.addEventListener('mouseout', () => {
        const currentRating = reviewRating.value;
        
        stars.forEach(s => {
            if (s.getAttribute('data-rating') <= currentRating) {
                s.textContent = '★';
            } else {
                s.textContent = '☆';
            }
        });
    });
});

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

editProfileForm.addEventListener('submit', updateProfile);
changePasswordForm.addEventListener('submit', changePassword);
reviewForm.addEventListener('submit', submitReview);

document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(reviewModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
        closeModal(reviewModal);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    loadUserData();
    loadAppointments();
    loadPromotions();
    
    stars[4].click(); 
});