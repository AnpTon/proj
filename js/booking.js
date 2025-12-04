// DOM Elements
const progressSteps = document.querySelectorAll('.step');
const bookingSteps = document.querySelectorAll('.booking-step');
const nextStepBtns = document.querySelectorAll('.next-step');
const prevStepBtns = document.querySelectorAll('.prev-step');
const servicesSelection = document.getElementById('servicesSelection');
const therapistsSelection = document.getElementById('therapistsSelection');
const datePicker = document.getElementById('datePicker');
const timeSlots = document.getElementById('timeSlots');
const confirmBookingBtn = document.getElementById('confirmBooking');
const applyPromoBtn = document.getElementById('applyPromo');
const promoMessage = document.getElementById('promoMessage');
const successMessage = document.getElementById('successMessage');
let bookingData = {
    service_id: null,
    therapist_id: null,
    service_price: 0,
    service_duration: 0,
    appointment_date: null,
    start_time: null,
    promo_code: null,
    discount: 0,
    final_price: 0
};

flatpickr(datePicker, {
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr, instance) {
        bookingData.appointment_date = dateStr;
        loadAvailableTimeSlots();
    }
});

// Load services
async function loadServices() {
    try {
        const response = await fetch('backend/service/get_all_service.php');
        const data = await response.json();
        
        if (data.services) {
            servicesSelection.innerHTML = data.services.map(service => `
                <div class="service-option" data-id="${service.service_id}" data-price="${service.price}" data-duration="${service.duration}">
                    <div class="service-icon">💆</div>
                    <h4>${service.service_name}</h4>
                    <p>$${service.price} • ${service.duration} mins</p>
                </div>
            `).join('');
            
            document.querySelectorAll('.service-option').forEach(option => {
                option.addEventListener('click', selectService);
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load therapists
async function loadTherapists() {
    try {
        const response = await fetch('backend/get_therapist.php'); // Need to create this
        const data = await response.json();
        
        if (data.therapists) {
            therapistsSelection.innerHTML = data.therapists.map(therapist => `
                <div class="therapist-option" data-id="${therapist.user_id}">
                    <div class="therapist-photo">👨‍⚕️</div>
                    <div class="therapist-info">
                        <h4>${therapist.full_name}</h4>
                        <p>${therapist.specialty || 'Wellness Therapist'}</p>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.therapist-option').forEach(option => {
                option.addEventListener('click', selectTherapist);
            });
        }
    } catch (error) {
        console.error('Error loading therapists:', error);
        therapistsSelection.innerHTML = '<p>Unable to load therapists</p>';
    }
}

// Select service
function selectService(e) {
    const option = e.currentTarget;
    
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    option.classList.add('selected');
    
    bookingData.service_id = option.getAttribute('data-id');
    bookingData.service_price = parseFloat(option.getAttribute('data-price'));
    bookingData.service_duration = parseInt(option.getAttribute('data-duration'));
    bookingData.final_price = bookingData.service_price;
    
    updateStep1Summary();
    checkStep1Completion();
}

// Select therapist
function selectTherapist(e) {
    const option = e.currentTarget;
    
    document.querySelectorAll('.therapist-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    option.classList.add('selected');
    
    bookingData.therapist_id = option.getAttribute('data-id');
    
    updateStep1Summary();
    checkStep1Completion();
}

// Update step 1 summary
function updateStep1Summary() {
    const serviceOption = document.querySelector('.service-option.selected');
    const therapistOption = document.querySelector('.therapist-option.selected');
    
    if (serviceOption) {
        document.getElementById('summaryService').textContent = serviceOption.querySelector('h4').textContent;
        document.getElementById('summaryDuration').textContent = serviceOption.getAttribute('data-duration') + ' mins';
        document.getElementById('summaryPrice').textContent = '$' + serviceOption.getAttribute('data-price');
    }
    
    if (therapistOption) {
        document.getElementById('summaryTherapist').textContent = therapistOption.querySelector('h4').textContent;
    }
    
    updateConfirmationSummary();
}

// Check if step 1 is complete
function checkStep1Completion() {
    const nextBtn = document.querySelector('#step1 .next-step');
    const isComplete = bookingData.service_id && bookingData.therapist_id;
    
    nextBtn.disabled = !isComplete;
}

// Load available time slots
async function loadAvailableTimeSlots() {
    if (!bookingData.appointment_date || !bookingData.therapist_id || !bookingData.service_id) {
        timeSlots.innerHTML = '<p class="select-date-message">Please select service, therapist, and date first</p>';
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('therapist_id', bookingData.therapist_id);
        formData.append('date', bookingData.appointment_date);
        formData.append('service_id', bookingData.service_id);
        
        const response = await fetch('backend/appointment/available_slots.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.slots && Array.isArray(data.slots)) {
            timeSlots.innerHTML = data.slots.map(slot => `
                <div class="time-slot" data-time="${slot}">${slot}</div>
            `).join('');
            
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.addEventListener('click', selectTimeSlot);
            });
            
            checkStep2Completion();
        } else {
            timeSlots.innerHTML = '<p class="select-date-message">No available time slots for this date</p>';
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
        timeSlots.innerHTML = '<p class="select-date-message">Unable to load time slots</p>';
    }
}

// Select time slot
function selectTimeSlot(e) {
    const slot = e.currentTarget;
    
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('selected');
    });
    
    slot.classList.add('selected');
    
    bookingData.start_time = slot.getAttribute('data-time');
    
    updateConfirmationSummary();
    checkStep2Completion();
}

// Check if step 2 is complete
function checkStep2Completion() {
    const nextBtn = document.querySelector('#step2 .next-step');
    const isComplete = bookingData.appointment_date && bookingData.start_time;
    
    nextBtn.disabled = !isComplete;
}

// Update confirmation summary
function updateConfirmationSummary() {
    const summaryHTML = `
        <div class="confirmation-item">
            <strong>Service:</strong> ${document.getElementById('summaryService').textContent}
        </div>
        <div class="confirmation-item">
            <strong>Therapist:</strong> ${document.getElementById('summaryTherapist').textContent}
        </div>
        <div class="confirmation-item">
            <strong>Date:</strong> ${bookingData.appointment_date || 'Not selected'}
        </div>
        <div class="confirmation-item">
            <strong>Time:</strong> ${bookingData.start_time || 'Not selected'}
        </div>
        <div class="confirmation-item">
            <strong>Duration:</strong> ${bookingData.service_duration} minutes
        </div>
    `;
    
    document.getElementById('confirmationSummary').innerHTML = summaryHTML;
    
    document.getElementById('originalPrice').textContent = '$' + bookingData.service_price.toFixed(2);
    document.getElementById('discountAmount').textContent = '-$' + bookingData.discount.toFixed(2);
    document.getElementById('finalPrice').textContent = '$' + bookingData.final_price.toFixed(2);
}

// Apply promo code
async function applyPromoCode() {
    const promoCode = document.getElementById('promoCode').value.trim();
    
    if (!promoCode) {
        promoMessage.textContent = 'Please enter a promo code';
        promoMessage.style.color = 'red';
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('promo_code', promoCode);
        formData.append('total_amount', bookingData.service_price);
        
        const response = await fetch('backend/payment/apply_promo.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (typeof data.discounted_amount === 'number') {
            bookingData.promo_code = promoCode;
            bookingData.discount = bookingData.service_price - data.discounted_amount;
            bookingData.final_price = data.discounted_amount;
            
            promoMessage.textContent = 'Promo code applied successfully!';
            promoMessage.style.color = 'green';
            updateConfirmationSummary();
        } else {
            promoMessage.textContent = data.discounted_amount || 'Invalid promo code';
            promoMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error applying promo:', error);
        promoMessage.textContent = 'Error applying promo code';
        promoMessage.style.color = 'red';
    }
}

// Confirm booking
async function confirmBooking() {
    const user_id = localStorage.getItem('user_id');
    
    if (!user_id) {
        alert('Please login to confirm booking');
        return;
    }
    
    if (!document.getElementById('termsAgree').checked) {
        alert('Please agree to the terms and conditions');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    try {
        const appointmentFormData = new FormData();
        appointmentFormData.append('therapist_id', bookingData.therapist_id);
        appointmentFormData.append('service_id', bookingData.service_id);
        appointmentFormData.append('appointment_date', bookingData.appointment_date);
        appointmentFormData.append('start_time', bookingData.start_time);
        
        const appointmentResponse = await fetch('backend/appointment/create_appointment.php', {
            method: 'POST',
            body: appointmentFormData,
            headers: {
                'X-User-ID': user_id
            }
        });
        
        const appointmentData = await appointmentResponse.json();
        
        if (appointmentData.appointment_id) {
            const paymentFormData = new FormData();
            paymentFormData.append('appointment_id', appointmentData.appointment_id);
            paymentFormData.append('amount', bookingData.final_price);
            paymentFormData.append('payment_method', paymentMethod);
            
            const paymentResponse = await fetch('backend/payment/create_payment.php', {
                method: 'POST',
                body: paymentFormData
            });
            
            const paymentData = await paymentResponse.json();
            
            if (paymentData.payment_id) {
                document.getElementById('bookingId').textContent = appointmentData.appointment_id;
                document.querySelectorAll('.booking-step').forEach(step => {
                    step.style.display = 'none';
                });
                successMessage.style.display = 'block';
                
                bookingData = {
                    service_id: null,
                    therapist_id: null,
                    service_price: 0,
                    service_duration: 0,
                    appointment_date: null,
                    start_time: null,
                    promo_code: null,
                    discount: 0,
                    final_price: 0
                };
            }
        }
    } catch (error) {
        console.error('Error confirming booking:', error);
        alert('Error confirming booking. Please try again.');
    }
}

// Step navigation
function goToStep(stepNumber) {
    progressSteps.forEach(step => {
        if (parseInt(step.getAttribute('data-step')) <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    bookingSteps.forEach(step => {
        if (step.id === `step${stepNumber}`) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function checkTermsAgreement() {
    confirmBookingBtn.disabled = !document.getElementById('termsAgree').checked;
}

nextStepBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const nextStep = e.target.getAttribute('data-next');
        goToStep(parseInt(nextStep));
    });
});

prevStepBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const prevStep = e.target.getAttribute('data-prev');
        goToStep(parseInt(prevStep));
    });
});

applyPromoBtn.addEventListener('click', applyPromoCode);
confirmBookingBtn.addEventListener('click', confirmBooking);
document.getElementById('termsAgree').addEventListener('change', checkTermsAgreement);

document.addEventListener('DOMContentLoaded', () => {
    loadServices();
    loadTherapists();
    goToStep(1); 
    
    if (!localStorage.getItem('user_id')) {
        alert('Please login to book appointments');
        window.location.href = 'index.html';
    }
    
    const selectedServiceId = localStorage.getItem('selected_service_id');
    if (selectedServiceId) {
        localStorage.removeItem('selected_service_id');
        setTimeout(() => {
            const serviceOption = document.querySelector(`.service-option[data-id="${selectedServiceId}"]`);
            if (serviceOption) {
                serviceOption.click();
            }
        }, 500);
    }
});