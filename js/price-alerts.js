import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.querySelector('.user-name').textContent = user.email;
        await loadProducts();
        await loadUserAlerts();
    }
});

// Load available products for alerts
async function loadProducts() {
    try {
        const productsQuery = query(collection(db, 'marketPrices'));
        const snapshot = await getDocs(productsQuery);
        
        const productSelect = document.getElementById('product');
        productSelect.innerHTML = '<option value="">Select Product</option>';
        
        const addedProducts = new Set();
        
        snapshot.forEach(doc => {
            const product = doc.data();
            if (!addedProducts.has(product.product)) {
                const option = document.createElement('option');
                option.value = product.product;
                option.textContent = product.product;
                productSelect.appendChild(option);
                addedProducts.add(product.product);
            }
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Load user's active alerts
async function loadUserAlerts() {
    try {
        const user = auth.currentUser;
        const alertsQuery = query(
            collection(db, 'priceAlerts'),
            where('userId', '==', user.uid)
        );
        
        const snapshot = await getDocs(alertsQuery);
        const alertsList = document.getElementById('active-alerts');
        
        if (snapshot.empty) {
            alertsList.innerHTML = '<p>No active alerts</p>';
            return;
        }
        
        alertsList.innerHTML = '';
        snapshot.forEach(doc => {
            const alert = doc.data();
            const alertElement = document.createElement('div');
            alertElement.className = 'alert-item';
            alertElement.innerHTML = `
                <div class="alert-info">
                    <h3>${alert.product}</h3>
                    <p>Target: KES ${alert.targetPrice}/kg</p>
                    <p>Condition: Price goes ${alert.condition}</p>
                    <p>Notification: ${alert.notificationMethod}</p>
                </div>
                <button class="delete-alert" data-alert-id="${doc.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            alertsList.appendChild(alertElement);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-alert').forEach(button => {
            button.addEventListener('click', async () => {
                const alertId = button.dataset.alertId;
                await deleteAlert(alertId);
            });
        });
    } catch (error) {
        console.error('Error loading alerts:', error);
        showNotification('Failed to load alerts', 'error');
    }
}

// Handle form submission
const form = document.getElementById('price-alert-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Setting Alert...';

    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const alertData = {
            userId: user.uid,
            userEmail: user.email,
            product: form.product.value,
            targetPrice: parseFloat(form.targetPrice.value),
            condition: form.condition.value,
            notificationMethod: form.notificationMethod.value,
            createdAt: serverTimestamp(),
            status: 'active'
        };

        await addDoc(collection(db, 'priceAlerts'), alertData);
        
        showNotification('Price alert set successfully!', 'success');
        form.reset();
        await loadUserAlerts();

    } catch (error) {
        console.error('Error setting alert:', error);
        showNotification('Failed to set alert. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Set Alert';
    }
});

// Delete alert
async function deleteAlert(alertId) {
    try {
        await deleteDoc(doc(db, 'priceAlerts', alertId));
        showNotification('Alert deleted successfully', 'success');
        await loadUserAlerts();
    } catch (error) {
        console.error('Error deleting alert:', error);
        showNotification('Failed to delete alert', 'error');
    }
}

// Notification function
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

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Failed to sign out', 'error');
    }
}); 