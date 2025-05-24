import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Get buyer ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const buyerId = urlParams.get('id');

    try {
        // Get buyer data from Firestore
        const buyerDoc = await getDoc(doc(db, 'buyers', buyerId));
        
        if (!buyerDoc.exists()) {
            // Handle case when buyer is not found
            window.location.href = 'connect.html';
            return;
        }

        const buyer = buyerDoc.data();

        // Update page content with buyer information
        document.getElementById('buyerImage').src = buyer.image;
        document.getElementById('buyerName').textContent = buyer.name;
        document.getElementById('buyerType').textContent = buyer.type.charAt(0).toUpperCase() + buyer.type.slice(1);
        document.getElementById('buyerType').className = `buyer-type ${buyer.type}`;
        document.getElementById('buyerDescription').textContent = buyer.description;
        document.getElementById('buyerEmail').textContent = buyer.email;
        document.getElementById('buyerPhone').textContent = buyer.phone;
        document.getElementById('buyerLocation').textContent = `${buyer.location}, Kenya`;
        document.getElementById('buyerTransport').textContent = buyer.transport;

        // Update products list
        const productsList = document.getElementById('buyerProducts');
        buyer.products.forEach(product => {
            const li = document.createElement('li');
            li.textContent = product;
            productsList.appendChild(li);
        });

        // Update contact button link
        document.getElementById('contactButton').href = `buyer-contact.html?id=${buyerId}`;

        // Add animation for content sections
        const sections = document.querySelectorAll('.profile-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.5s ease-out';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });

    } catch (error) {
        console.error('Error fetching buyer data:', error);
        // Handle error (e.g., show error message to user)
        window.location.href = 'connect.html';
    }
}); 