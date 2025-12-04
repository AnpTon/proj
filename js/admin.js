const totalBookings = document.getElementById('totalBookings');
const activeCustomers = document.getElementById('activeCustomers');
const todaysAppointments = document.getElementById('todaysAppointments');
const activeTherapists = document.getElementById('activeTherapists');
const bookingsTable = document.getElementById('bookingsTable');
const adminServicesList = document.getElementById('adminServicesList');
const schedulesList = document.getElementById('schedulesList');
const addServiceForm = document.getElementById('addServiceForm');
const addAvailabilityForm = document.getElementById('addAvailabilityForm');
const availabilityTherapist = document.getElementById('availabilityTherapist');

function checkAdminAccess() {
    const userRole = localStorage.getItem('role');
    
    if (userRole !== 'admin') {
        alert('Access denied. Admin only.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

async function loadDashboardStats() {
    try {
        const response = await fetch('./backend/admin/get_stats.php');
        const data = await response.json();
        
        if (data.stats) {
            const stats = data.stats;
            totalBookings.textContent = stats.total_bookings || 0;
            activeCustomers.textContent = stats.active_customers || 0;
            todaysAppointments.textContent = stats.todays_appointments || 0;
            activeTherapists.textContent = stats.active_therapists || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all bookings
async function loadAllBookings() {
    try {
        const response = await fetch('./backend/admin/get_all_bookings.php');
        const data = await response.json();
        
        if (data.bookings && data.bookings.length > 0) {
            const tbody = bookingsTable.querySelector('tbody');
            tbody.innerHTML = data.bookings.map(booking => `
                <tr>
                    <td>${booking.appointment_id}</td>
                    <td>${booking.customer_name}</td>
                    <td>${booking.service_name}</td>
                    <td>${booking.appointment_date}</td>
                    <td>${booking.start_time}</td>
                    <td>
                        <span class="status-badge badge-${booking.status}">${booking.status}</span>
                    </td>
                    <td>
                        <select class="status-select" data-id="${booking.appointment_id}">
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="canceled" ${booking.status === 'canceled' ? 'selected' : ''}>Canceled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
            
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', updateBookingStatus);
            });
        } else {
            bookingsTable.querySelector('tbody').innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">No bookings found</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsTable.querySelector('tbody').innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">Error loading bookings</td>
            </tr>
        `;
    }
}

// Update booking status
async function updateBookingStatus(e) {
    const appointmentId = e.target.getAttribute('data-id');
    const newStatus = e.target.value;
    
    try {
        const formData = new FormData();
        formData.append('appointment_id', appointmentId);
        formData.append('new_status', newStatus);
        
        const response = await fetch('./backend/appointment/update_status.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            const row = e.target.closest('tr');
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = newStatus;
            statusCell.className = `status-badge badge-${newStatus}`;
            
            loadDashboardStats();
        } else {
            alert('Error updating status: ' + data.message);
            loadAllBookings();
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating booking status');
        loadAllBookings();
    }
}

// Load services for admin
async function loadAdminServices() {
    try {
        const response = await fetch('./backend/service/get_all_service.php');
        const data = await response.json();
        
        if (data.services && data.services.length > 0) {
            adminServicesList.innerHTML = data.services.map(service => `
                <div class="service-item">
                    <div class="service-info">
                        <h4>${service.service_name}</h4>
                        <p>$${service.price} • ${service.duration} minutes</p>
                        <p>${service.description.substring(0, 100)}...</p>
                    </div>
                    <div class="service-actions">
                        <button class="btn btn-danger delete-service" data-id="${service.service_id}">Delete</button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.delete-service').forEach(button => {
                button.addEventListener('click', deleteService);
            });
        } else {
            adminServicesList.innerHTML = '<p class="empty-state">No services found</p>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        adminServicesList.innerHTML = '<p class="empty-state">Error loading services</p>';
    }
}

// Add new service
async function addNewService(e) {
    e.preventDefault();
    
    const name = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const duration = document.getElementById('serviceDuration').value;
    const price = document.getElementById('servicePrice').value;
    
    try {
        const formData = new FormData();
        formData.append('service_name', name);
        formData.append('description', description);
        formData.append('duration', duration);
        formData.append('price', price);
        
        const response = await fetch('./backend/admin/add_service.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            document.getElementById('serviceMessage').textContent = 'Service added successfully!';
            document.getElementById('serviceMessage').style.color = 'green';
            
            addServiceForm.reset();
            
            setTimeout(() => {
                loadAdminServices();
            }, 1000);
        } else {
            document.getElementById('serviceMessage').textContent = data.message;
            document.getElementById('serviceMessage').style.color = 'red';
        }
    } catch (error) {
        console.error('Error adding service:', error);
        document.getElementById('serviceMessage').textContent = 'Error adding service';
        document.getElementById('serviceMessage').style.color = 'red';
    }
}

// Delete service
async function deleteService(e) {
    const serviceId = e.target.getAttribute('data-id');
    const serviceName = e.target.closest('.service-item').querySelector('h4').textContent;
    
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This cannot be undone.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('service_id', serviceId);
        
        const response = await fetch('./backend/admin/delete_service.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            alert('Service deleted successfully');
            loadAdminServices();
        } else {
            alert('Error deleting service: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service');
    }
}

// Load therapists for dropdown
async function loadTherapistsForDropdown() {
    try {
        const response = await fetch('./backend/get_therapist.php');
        const data = await response.json();
        
        if (data.therapists) {
            availabilityTherapist.innerHTML = '<option value="">Select Therapist</option>' +
                data.therapists.map(therapist => `
                    <option value="${therapist.user_id}">${therapist.full_name}</option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading therapists:', error);
    }
}

// Load all schedules
async function loadAllSchedules() {
    try {
        const response = await fetch('backend/admin/get_all_schedules.php');
        const data = await response.json();
        
        if (data.schedules && data.schedules.length > 0) {
            schedulesList.innerHTML = data.schedules.map(schedule => `
                <div class="schedule-item">
                    <div class="schedule-header">
                        <span class="schedule-therapist">${schedule.full_name}</span>
                        <span class="schedule-date">${schedule.date}</span>
                    </div>
                    <div class="schedule-time">${schedule.start_time} - ${schedule.end_time}</div>
                    <div class="schedule-actions">
                        <button class="btn btn-danger delete-schedule" data-id="${schedule.availability_id}">Delete</button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.delete-schedule').forEach(btn => {
                btn.addEventListener('click', deleteSchedule);
            });
        } else {
            schedulesList.innerHTML = '<p class="empty-state">No schedules found</p>';
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        schedulesList.innerHTML = '<p class="empty-state">Error loading schedules</p>';
    }
}

// Add availability
async function addAvailability(e) {
    e.preventDefault();
    
    const therapistId = availabilityTherapist.value;
    const date = document.getElementById('availabilityDate').value;
    const startTime = document.getElementById('availabilityStart').value;
    const endTime = document.getElementById('availabilityEnd').value;
    
    if (!therapistId) {
        document.getElementById('availabilityMessage').textContent = 'Please select a therapist';
        document.getElementById('availabilityMessage').style.color = 'red';
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('therapist_id', therapistId);
        formData.append('date', date);
        formData.append('start_time', startTime);
        formData.append('end_time', endTime);
        
        const response = await fetch('./ackend/admin/add_availability.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            document.getElementById('availabilityMessage').textContent = 'Schedule added successfully!';
            document.getElementById('availabilityMessage').style.color = 'green';
            
            addAvailabilityForm.reset();
            
            setTimeout(() => {
                loadAllSchedules();
            }, 1000);
        } else {
            document.getElementById('availabilityMessage').textContent = data.message;
            document.getElementById('availabilityMessage').style.color = 'red';
        }
    } catch (error) {
        console.error('Error adding availability:', error);
        document.getElementById('availabilityMessage').textContent = 'Error adding schedule';
        document.getElementById('availabilityMessage').style.color = 'red';
    }
}

// Delete schedule
async function deleteSchedule(e) {
    const scheduleId = e.target.getAttribute('data-id');
    
    if (!confirm('Are you sure you want to delete this schedule?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('availability_id', scheduleId);
        
        const response = await fetch('./backend/admin/delete_availability.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.message.includes('Success')) {
            alert('Schedule deleted successfully');
            loadAllSchedules();
        } else {
            alert('Error deleting schedule: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Error deleting schedule');
    }
}

addServiceForm.addEventListener('submit', addNewService);
addAvailabilityForm.addEventListener('submit', addAvailability);

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAccess()) return;
    
    loadDashboardStats();
    loadAllBookings();
    loadAdminServices();
    loadTherapistsForDropdown();
    loadAllSchedules();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('availabilityDate').value = today;
    document.getElementById('availabilityDate').min = today;
});