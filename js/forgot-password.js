import { auth } from './firebase-config.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        
        // Basic validation
        if (!email) {
            showNotification('Please enter your email address.', 'error');
            return;
        }

        try {
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Send password reset email
            await sendPasswordResetEmail(auth, email);

            // Show success message
            showNotification(
                'Password reset link has been sent to your email. Please check your inbox and spam folder.',
                'success'
            );

            // Clear form
            forgotPasswordForm.reset();

        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send reset link. Please try again.';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please check your email address.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
            }

            showNotification(errorMessage, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
        }
    });
});

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
    }, 5000); // Show for 5 seconds for password reset
} 