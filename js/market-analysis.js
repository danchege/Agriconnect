import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let priceChart, supplyDemandChart, regionalChart, marketShareChart;

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.querySelector('.user-name').textContent = user.email;
        await loadProducts();
        initializeCharts();
    }
});

// Load available products
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

// Initialize charts
function initializeCharts() {
    // Price Trends Chart
    const priceCtx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(priceCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price (KES/kg)',
                data: [],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Supply vs Demand Chart
    const supplyDemandCtx = document.getElementById('supplyDemandChart').getContext('2d');
    supplyDemandChart = new Chart(supplyDemandCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Supply',
                    data: [],
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Demand',
                    data: [],
                    backgroundColor: '#2196F3'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Regional Price Comparison Chart
    const regionalCtx = document.getElementById('regionalChart').getContext('2d');
    regionalChart = new Chart(regionalCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Average Price (KES/kg)',
                data: [],
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Market Share Chart
    const marketShareCtx = document.getElementById('marketShareChart').getContext('2d');
    marketShareChart = new Chart(marketShareCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#9C27B0',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Update charts with data
async function updateCharts(product, timeRange) {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Fetch price history
        const priceQuery = query(
            collection(db, 'marketPrices'),
            where('product', '==', product),
            where('timestamp', '>=', startDate),
            orderBy('timestamp', 'asc')
        );

        const priceSnapshot = await getDocs(priceQuery);
        const prices = [];
        const dates = [];
        
        priceSnapshot.forEach(doc => {
            const data = doc.data();
            prices.push(data.price);
            dates.push(data.timestamp.toDate().toLocaleDateString());
        });

        // Update Price Trends Chart
        priceChart.data.labels = dates;
        priceChart.data.datasets[0].data = prices;
        priceChart.update();

        // Fetch supply and demand data
        const supplyDemandQuery = query(
            collection(db, 'marketData'),
            where('product', '==', product),
            where('timestamp', '>=', startDate),
            orderBy('timestamp', 'asc')
        );

        const supplyDemandSnapshot = await getDocs(supplyDemandQuery);
        const supply = [];
        const demand = [];
        const sdDates = [];

        supplyDemandSnapshot.forEach(doc => {
            const data = doc.data();
            supply.push(data.supply);
            demand.push(data.demand);
            sdDates.push(data.timestamp.toDate().toLocaleDateString());
        });

        // Update Supply vs Demand Chart
        supplyDemandChart.data.labels = sdDates;
        supplyDemandChart.data.datasets[0].data = supply;
        supplyDemandChart.data.datasets[1].data = demand;
        supplyDemandChart.update();

        // Fetch regional data
        const regionalQuery = query(
            collection(db, 'regionalPrices'),
            where('product', '==', product),
            where('timestamp', '>=', startDate)
        );

        const regionalSnapshot = await getDocs(regionalQuery);
        const regions = new Map();

        regionalSnapshot.forEach(doc => {
            const data = doc.data();
            if (!regions.has(data.region)) {
                regions.set(data.region, []);
            }
            regions.get(data.region).push(data.price);
        });

        const regionalAverages = Array.from(regions.entries()).map(([region, prices]) => ({
            region,
            average: prices.reduce((a, b) => a + b, 0) / prices.length
        }));

        // Update Regional Price Comparison Chart
        regionalChart.data.labels = regionalAverages.map(r => r.region);
        regionalChart.data.datasets[0].data = regionalAverages.map(r => r.average);
        regionalChart.update();

        // Calculate market share
        const totalSupply = supply.reduce((a, b) => a + b, 0);
        const marketShares = Array.from(regions.keys()).map(region => ({
            region,
            share: (regions.get(region).length / totalSupply) * 100
        }));

        // Update Market Share Chart
        marketShareChart.data.labels = marketShares.map(m => m.region);
        marketShareChart.data.datasets[0].data = marketShares.map(m => m.share);
        marketShareChart.update();

        // Update insights
        updateInsights(prices, supply, demand, regionalAverages);

    } catch (error) {
        console.error('Error updating charts:', error);
        showNotification('Failed to update market analysis', 'error');
    }
}

// Update market insights
function updateInsights(prices, supply, demand, regionalAverages) {
    // Price trend analysis
    const priceTrend = prices[prices.length - 1] - prices[0];
    const trendPercentage = ((priceTrend / prices[0]) * 100).toFixed(2);
    const trendDirection = priceTrend > 0 ? 'increased' : 'decreased';
    
    document.getElementById('priceTrendInsight').textContent = 
        `Prices have ${trendDirection} by ${Math.abs(trendPercentage)}% over the selected period.`;

    // Supply and demand analysis
    const latestSupply = supply[supply.length - 1];
    const latestDemand = demand[demand.length - 1];
    const supplyDemandRatio = (latestSupply / latestDemand).toFixed(2);
    
    document.getElementById('supplyDemandInsight').textContent = 
        `Current supply/demand ratio is ${supplyDemandRatio}. ${
            supplyDemandRatio > 1 ? 'Supply exceeds demand.' : 'Demand exceeds supply.'
        }`;

    // Regional analysis
    const sortedRegions = [...regionalAverages].sort((a, b) => b.average - a.average);
    const highestRegion = sortedRegions[0];
    const lowestRegion = sortedRegions[sortedRegions.length - 1];
    
    document.getElementById('regionalInsight').textContent = 
        `Highest prices in ${highestRegion.region}, lowest in ${lowestRegion.region}. Price difference: ${
            (highestRegion.average - lowestRegion.average).toFixed(2)
        } KES/kg.`;

    // Recommendations
    const recommendations = [];
    if (supplyDemandRatio < 0.8) {
        recommendations.push('Consider increasing production due to high demand.');
    } else if (supplyDemandRatio > 1.2) {
        recommendations.push('Consider diversifying to other products due to oversupply.');
    }
    
    if (priceTrend > 0) {
        recommendations.push('Prices are trending upward - good time to sell.');
    } else {
        recommendations.push('Prices are trending downward - consider storage if possible.');
    }

    document.getElementById('recommendations').textContent = recommendations.join(' ');
}

// Event listeners
document.getElementById('product').addEventListener('change', (e) => {
    const timeRange = document.getElementById('timeRange').value;
    if (e.target.value) {
        updateCharts(e.target.value, timeRange);
    }
});

document.getElementById('timeRange').addEventListener('change', (e) => {
    const product = document.getElementById('product').value;
    if (product) {
        updateCharts(product, e.target.value);
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