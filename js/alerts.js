document.addEventListener('DOMContentLoaded', () => {
    const alertForm = document.getElementById('alert-form');
    const alertsList = document.querySelector('.alerts-list');
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    // Handle form submission
    alertForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(alertForm);
        const alertData = {
            product: formData.get('product'),
            county: formData.get('county'),
            price: formData.get('price'),
            condition: formData.get('condition'),
            notification: formData.get('notification')
        };

        // Create new alert card
        const alertCard = createAlertCard(alertData);
        alertsList.insertBefore(alertCard, alertsList.firstChild);

        // Add slide-in animation
        alertCard.style.animation = 'slideIn 0.5s ease-out';

        // Reset form
        alertForm.reset();

        // Show success message
        showNotification('Alert created successfully!', 'success');
    });

    // Handle edit buttons
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const alertCard = e.target.closest('.alert-card');
            const alertData = getAlertDataFromCard(alertCard);
            populateForm(alertData);
            alertCard.remove();
            showNotification('Alert loaded for editing', 'info');
        });
    });

    // Handle delete buttons
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const alertCard = e.target.closest('.alert-card');
            // Add fade-out animation
            alertCard.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                alertCard.remove();
                showNotification('Alert deleted successfully!', 'success');
            }, 300);
        });
    });

    // Create new alert card
    function createAlertCard(data) {
        const card = document.createElement('div');
        card.className = 'alert-card';
        card.innerHTML = `
            <div class="alert-header">
                <h3>${data.product} Price Alert</h3>
                <span class="alert-status active">Active</span>
            </div>
            <div class="alert-details">
                <p><strong>Product:</strong> ${data.product}</p>
                <p><strong>County:</strong> ${data.county}</p>
                <p><strong>Target Price:</strong> KES ${formatPrice(data.price)}</p>
                <p><strong>Condition:</strong> ${data.condition}</p>
                <p><strong>Notification:</strong> ${data.notification}</p>
            </div>
            <div class="alert-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;

        // Add event listeners to new buttons
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            const alertData = getAlertDataFromCard(card);
            populateForm(alertData);
            card.remove();
            showNotification('Alert loaded for editing', 'info');
        });

        card.querySelector('.delete-btn').addEventListener('click', () => {
            card.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                card.remove();
                showNotification('Alert deleted successfully!', 'success');
            }, 300);
        });

        return card;
    }

    // Get alert data from card
    function getAlertDataFromCard(card) {
        return {
            product: card.querySelector('p:nth-child(1)').textContent.split(': ')[1],
            county: card.querySelector('p:nth-child(2)').textContent.split(': ')[1],
            price: card.querySelector('p:nth-child(3)').textContent.split('KES ')[1].replace(/,/g, ''),
            condition: card.querySelector('p:nth-child(4)').textContent.split(': ')[1],
            notification: card.querySelector('p:nth-child(5)').textContent.split(': ')[1]
        };
    }

    // Populate form with alert data
    function populateForm(data) {
        document.getElementById('product').value = data.product;
        document.getElementById('county').value = data.county;
        document.getElementById('price').value = data.price;
        document.getElementById('condition').value = data.condition.toLowerCase();
        document.getElementById('notification').value = data.notification.toLowerCase().replace(' & ', '_');
    }

    // Format price with thousand separator
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background-color: ${type === 'success' ? '#22c55e' : '#3b82f6'};
            color: white;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add to document
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 3000);
        }, 3000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
}); 