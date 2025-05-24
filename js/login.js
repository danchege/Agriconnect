import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { saveUserProfile, getUserProfile } from './user-profile.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login');
    const togglePasswordBtn = document.querySelector('.toggle-password');

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please enter both email and password.', 'error');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Get or create user profile in Firestore
            let userProfile = await getUserProfile(userCredential.user.uid);
            if (!userProfile) {
                await saveUserProfile(userCredential.user.uid, {
                    email: userCredential.user.email,
                    lastLogin: new Date()
                });
            } else {
                // Update last login
                await saveUserProfile(userCredential.user.uid, {
                    lastLogin: new Date()
                });
            }

            showNotification('Login successful! Redirecting...', 'success');
            
            // Store user info in session
            sessionStorage.setItem('user', JSON.stringify({
                uid: userCredential.user.uid,
                email: userCredential.user.email
            }));

            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to login. Please try again.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please check your email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled. Please contact support.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email. Please register first.';
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed login attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            
            // Clear password field for security
            document.getElementById('password').value = '';
        }
    });

    // Handle Google login
    googleLoginBtn?.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            
            // Get or create user profile in Firestore
            let userProfile = await getUserProfile(result.user.uid);
            if (!userProfile) {
                await saveUserProfile(result.user.uid, {
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    loginMethod: 'google'
                });
            } else {
                // Update last login and any changed Google profile info
                await saveUserProfile(result.user.uid, {
                    lastLogin: new Date(),
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL
                });
            }

            showNotification('Login successful! Redirecting...', 'success');
            
            // Store user info in session
            sessionStorage.setItem('user', JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName
            }));

            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            console.error('Google login error:', error);
            let errorMessage = 'Failed to login with Google.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login cancelled. Please try again.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Login popup was blocked. Please allow popups for this site.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            
            showNotification(errorMessage, 'error');
        }
    });

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = togglePasswordBtn.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
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
    }, 3000);
} 