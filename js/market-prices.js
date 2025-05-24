document.addEventListener('DOMContentLoaded', () => {
    // Sample data - In a real application, this would come from an API
    const samplePriceData = [
        {
            product: 'Maize',
            category: 'Cereals',
            location: 'Nairobi',
            price: 4500,
            unit: '90kg bag',
            lastUpdated: '2024-03-20',
            trend: 'up'
        },
        {
            product: 'Tomatoes',
            category: 'Vegetables',
            location: 'Mombasa',
            price: 250,
            unit: 'per kg',
            lastUpdated: '2024-03-20',
            trend: 'down'
        },
        {
            product: 'Potatoes',
            category: 'Vegetables',
            location: 'Nakuru',
            price: 3200,
            unit: '110kg bag',
            lastUpdated: '2024-03-20',
            trend: 'up'
        },
        {
            product: 'Milk',
            category: 'Dairy',
            location: 'Kisumu',
            price: 65,
            unit: 'per liter',
            lastUpdated: '2024-03-20',
            trend: 'up'
        }
    ];

    // Elements
    const countySelect = document.getElementById('county');
    const categorySelect = document.getElementById('category');
    const refreshButton = document.getElementById('refresh-prices');
    const priceTable = document.getElementById('price-data');
    const setAlertButton = document.querySelector('.set-alert-btn');

    // Filter prices based on selected county and category
    function filterPrices() {
        const selectedCounty = countySelect.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();

        return samplePriceData.filter(item => {
            const matchCounty = !selectedCounty || item.location.toLowerCase() === selectedCounty;
            const matchCategory = !selectedCategory || item.category.toLowerCase() === selectedCategory;
            return matchCounty && matchCategory;
        });
    }

    // Format price with thousand separator
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Update the price table
    function updatePriceTable() {
        const filteredData = filterPrices();
        priceTable.innerHTML = '';

        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product}</td>
                <td>${item.category}</td>
                <td>${item.location}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${item.unit}</td>
                <td>${item.lastUpdated}</td>
                <td><i class="fas fa-arrow-${item.trend} trend-${item.trend}"></i></td>
            `;
            priceTable.appendChild(row);
        });

        // Add animation to new rows
        const rows = priceTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s forwards`;
        });
    }

    // Refresh button animation
    function animateRefresh() {
        const icon = refreshButton.querySelector('i');
        icon.style.animation = 'rotate 1s linear';
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    }

    // Event Listeners
    countySelect.addEventListener('change', updatePriceTable);
    categorySelect.addEventListener('change', updatePriceTable);
    
    refreshButton.addEventListener('click', () => {
        animateRefresh();
        // In a real application, this would fetch new data from the server
        setTimeout(updatePriceTable, 1000);
    });

    setAlertButton.addEventListener('click', () => {
        // This would open a modal or form to set price alerts
        alert('Price alert feature coming soon!');
    });

    // Initialize table
    updatePriceTable();

    // Add some CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        #price-data tr {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
}); 