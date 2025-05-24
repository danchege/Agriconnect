import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Get buyer ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const buyerId = urlParams.get('id');

    // Sample buyers data (in a real application, this would come from Firestore)
    const buyers = [
        {
            id: 1,
            name: 'Kenya Fresh Produce Ltd',
            type: 'wholesaler',
            location: 'Nairobi',
            products: ['Tomatoes', 'Potatoes', 'Onions'],
            transport: 'Can arrange transport',
            image: 'https://via.placeholder.com/50',
            email: 'info@kenyafresh.co.ke',
            phone: '+254 712 345 678',
            description: 'Leading wholesaler of fresh produce in Nairobi'
        },
        {
            id: 2,
            name: 'Nakuru Cereals Exporters',
            type: 'exporter',
            location: 'Nakuru',
            products: ['Maize', 'Wheat', 'Beans'],
            transport: 'Transport provided',
            image: 'https://via.placeholder.com/50',
            email: 'sales@nakurucereals.co.ke',
            phone: '+254 723 456 789',
            description: 'Premier exporter of cereals in the Rift Valley region'
        },
        {
            id: 3,
            name: 'Mombasa Food Processors',
            type: 'processor',
            location: 'Mombasa',
            products: ['Fruits', 'Vegetables'],
            transport: 'Transport negotiable',
            image: 'https://via.placeholder.com/50',
            email: 'info@mombasafood.co.ke',
            phone: '+254 734 567 890',
            description: 'Leading food processing company in the coastal region'
        }
    ];

    // Find the buyer by ID
    const buyer = buyers.find(b => b.id === parseInt(buyerId));

    if (!buyer) {
        // Handle case when buyer is not found
        window.location.href = 'connect.html';
        return;
    }

    // Update page content with buyer information
    document.getElementById('buyerName').textContent = buyer.name;
    document.getElementById('buyerCompany').textContent = buyer.name;
    document.getElementById('buyerImage').src = buyer.image;
    document.getElementById('buyerType').textContent = buyer.type.charAt(0).toUpperCase() + buyer.type.slice(1);
    document.getElementById('buyerType').className = `buyer-type ${buyer.type}`;
    document.getElementById('buyerLocation').textContent = `${buyer.location}, Kenya`;
    document.getElementById('buyerProducts').textContent = buyer.products.join(', ');

    // Handle form submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            buyerId: buyer.id,
            buyerName: buyer.name,
            buyerEmail: buyer.email,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            product: document.getElementById('product').value,
            message: document.getElementById('message').value,
            timestamp: serverTimestamp(),
            status: 'pending' // pending, contacted, completed, rejected
        };

        try {
            // Store the contact form submission in Firestore
            const docRef = await addDoc(collection(db, 'contactRequests'), formData);
            console.log('Contact request stored with ID:', docRef.id);

            // Show success message
            showNotification('Message sent successfully! The buyer will contact you soon.', 'success');
            
            // Reset form
            contactForm.reset();

            // Redirect back to connect page after 3 seconds
            setTimeout(() => {
                window.location.href = 'connect.html';
            }, 3000);

        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        }
    });
});

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;

    // Add notification to page
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 