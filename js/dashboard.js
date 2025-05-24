import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        await loadUserData(user);
        await loadDashboardData(user);
    } else {
        // User is signed out, redirect to login
        window.location.href = 'login.html';
    }
});

// Load user data
async function loadUserData(user) {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Update user name in navigation
            document.querySelector('.user-name').textContent = userData.name || user.email;
            document.querySelector('.user-display-name').textContent = userData.name || 'User';
            
            // Update last login time
            const lastLogin = userData.lastLogin ? new Date(userData.lastLogin.toDate()) : new Date();
            document.getElementById('last-login-time').textContent = lastLogin.toLocaleString();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user data', 'error');
    }
}

// Load dashboard data
async function loadDashboardData(user) {
    try {
        // Load products count
        const productsQuery = query(
            collection(db, 'products'),
            where('farmerId', '==', user.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        document.getElementById('products-count').textContent = productsSnapshot.size;

        // Load messages count
        const messagesQuery = query(
            collection(db, 'messages'),
            where('recipientId', '==', user.uid),
            where('read', '==', false)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        document.getElementById('messages-count').textContent = messagesSnapshot.size;

        // Load profile views (last 30 days)
        const viewsQuery = query(
            collection(db, 'profileViews'),
            where('userId', '==', user.uid),
            where('timestamp', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        );
        const viewsSnapshot = await getDocs(viewsQuery);
        document.getElementById('views-count').textContent = viewsSnapshot.size;

        // Load latest market prices
        const pricesQuery = query(collection(db, 'marketPrices'), limit(5));
        const pricesSnapshot = await getDocs(pricesQuery);
        const pricesList = document.getElementById('market-prices-list');
        
        if (!pricesSnapshot.empty) {
            pricesList.innerHTML = '';
            pricesSnapshot.forEach(doc => {
                const price = doc.data();
                pricesList.innerHTML += `
                    <div class="price-item">
                        <span class="price-name">${price.product}</span>
                        <span class="price-value">KES ${price.price}/kg</span>
                    </div>
                `;
            });
        } else {
            pricesList.innerHTML = '<p>No market prices available</p>';
        }

        // Load recent messages
        const recentMessagesQuery = query(
            collection(db, 'messages'),
            where('recipientId', '==', user.uid),
            limit(3)
        );
        const recentMessagesSnapshot = await getDocs(recentMessagesQuery);
        const messagesList = document.getElementById('recent-messages');

        if (!recentMessagesSnapshot.empty) {
            messagesList.innerHTML = '';
            recentMessagesSnapshot.forEach(doc => {
                const message = doc.data();
                messagesList.innerHTML += `
                    <div class="message-item">
                        <div class="message-avatar">
                            ${message.senderName ? message.senderName[0].toUpperCase() : 'U'}
                        </div>
                        <div class="message-content">
                            <div class="message-sender">${message.senderName || 'Unknown'}</div>
                            <div class="message-preview">${message.content}</div>
                        </div>
                    </div>
                `;
            });
        } else {
            messagesList.innerHTML = '<p>No messages</p>';
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load some dashboard data', 'error');
    }
}

// Handle quick action buttons
document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const href = button.getAttribute('href');
        if (href) {
            window.location.href = href;
        }
    });
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Failed to sign out', 'error');
    }
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