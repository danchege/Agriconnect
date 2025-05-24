import { registerUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const typeButtons = document.querySelectorAll('.type-btn');
    const farmerFields = document.querySelectorAll('.farmer-field');
    const buyerFields = document.querySelectorAll('.buyer-field');
    let userType = 'farmer'; // Default user type

    // Toggle between farmer and buyer registration
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            userType = button.getAttribute('data-type');

            // Toggle visibility of fields
            if (userType === 'buyer') {
                farmerFields.forEach(field => field.style.display = 'none');
                buyerFields.forEach(field => field.style.display = 'block');
            } else {
                farmerFields.forEach(field => field.style.display = 'block');
                buyerFields.forEach(field => field.style.display = 'none');
            }
        });
    });

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const userData = {
            name: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value,
            location: document.getElementById('county').value,
            userType: userType
        };

        // Add type-specific fields
        if (userType === 'farmer') {
            userData.products = document.getElementById('products').value.split(',').map(p => p.trim());
            userData.farmLocation = userData.location;
        } else {
            userData.companyName = document.getElementById('business').value;
            userData.buyerType = document.getElementById('buyer-type').value;
            userData.interestedProducts = document.getElementById('interested-products').value.split(',').map(p => p.trim());
        }

        // Validate passwords match
        if (userData.password !== userData.confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        // Validate required fields
        if (!validateForm(userData)) {
            showNotification('Please fill in all required fields!', 'error');
            return;
        }

        try {
            const user = await registerUser(userData);
            
            if (user) {
                showNotification('Registration successful! Redirecting to login...', 'success');
                
                // Clear form
                registerForm.reset();

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Form validation
    function validateForm(userData) {
        if (!userData.name || !userData.email || !userData.phone || 
            !userData.password || !userData.location) {
            return false;
        }

        if (userData.userType === 'farmer' && !userData.products) {
            return false;
        }

        if (userData.userType === 'buyer' && 
            (!userData.companyName || !userData.buyerType || !userData.interestedProducts)) {
            return false;
        }

        return true;
    }

    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}); 