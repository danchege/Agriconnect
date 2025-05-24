import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.querySelector('.user-name').textContent = user.email;
    }
});

// Handle form submission
const form = document.getElementById('add-product-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Adding Product...';

    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        // Get form data
        const formData = {
            productName: form.productName.value,
            category: form.category.value,
            quantity: parseFloat(form.quantity.value),
            price: parseFloat(form.price.value),
            description: form.description.value,
            location: form.location.value,
            farmerId: user.uid,
            farmerEmail: user.email,
            createdAt: serverTimestamp(),
            status: 'active'
        };

        // Handle image uploads
        const imageFiles = form.images.files;
        const imageUrls = [];

        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const imageRef = ref(storage, `products/${user.uid}/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(imageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }
        }

        formData.images = imageUrls;

        // Add to Firestore
        await addDoc(collection(db, 'products'), formData);

        // Show success message
        showNotification('Product added successfully!', 'success');
        
        // Reset form
        form.reset();

    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Failed to add product. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Add Product';
    }
});

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