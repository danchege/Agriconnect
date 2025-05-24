import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const productSearch = document.getElementById('product-search');
    const countyFilter = document.getElementById('county-filter');
    const buyerTypeFilter = document.getElementById('buyer-type');
    const searchBtn = document.querySelector('.search-btn');
    const buyersGrid = document.querySelector('.buyers-grid');
    const loadMoreBtn = document.querySelector('.load-more-btn');

    let lastDoc = null;
    const buyersPerPage = 6;
    let currentBuyers = [];

    // Create buyer card HTML
    function createBuyerCard(buyer) {
        return `
            <div class="buyer-card" data-buyer-id="${buyer.id}" data-aos="fade-up">
                <div class="buyer-header">
                    <img src="${buyer.image}" alt="${buyer.name}" class="buyer-image">
                    <div class="buyer-info">
                        <h3>${buyer.name}</h3>
                        <span class="buyer-type ${buyer.type}">${buyer.type.charAt(0).toUpperCase() + buyer.type.slice(1)}</span>
                    </div>
                    <div class="verification-badge">
                        <i class="fas fa-check-circle"></i> Verified
                    </div>
                </div>
                <div class="buyer-details">
                    <p><i class="fas fa-map-marker-alt"></i> ${buyer.location}, Kenya</p>
                    <p><i class="fas fa-shopping-basket"></i> Interested in: ${buyer.products.join(', ')}</p>
                    <p><i class="fas fa-truck"></i> ${buyer.transport}</p>
                </div>
                <div class="buyer-actions">
                    <a href="buyer-contact.html?id=${buyer.id}" class="contact-btn">
                        <i class="fas fa-envelope"></i> Contact
                    </a>
                    <a href="buyer-profile.html?id=${buyer.id}" class="view-btn">
                        <i class="fas fa-eye"></i> View Profile
                    </a>
                </div>
            </div>
        `;
    }

    // Fetch buyers from Firestore
    async function fetchBuyers(filters = {}, isLoadMore = false) {
        try {
            showLoading();

            let buyersQuery = collection(db, 'buyers');
            const queryConstraints = [];

            // Add filters
            if (filters.searchTerm) {
                queryConstraints.push(where('searchKeywords', 'array-contains', filters.searchTerm.toLowerCase()));
            }
            if (filters.county) {
                queryConstraints.push(where('location', '==', filters.county));
            }
            if (filters.type) {
                queryConstraints.push(where('type', '==', filters.type));
            }

            // Add ordering and pagination
            queryConstraints.push(orderBy('name'));
            queryConstraints.push(limit(buyersPerPage));

            if (lastDoc && isLoadMore) {
                queryConstraints.push(startAfter(lastDoc));
            }

            const q = query(buyersQuery, ...queryConstraints);
            const querySnapshot = await getDocs(q);

            // Update lastDoc for pagination
            lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

            // Get buyers data
            const buyers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (!isLoadMore) {
                currentBuyers = buyers;
                buyersGrid.innerHTML = '';
            } else {
                currentBuyers = [...currentBuyers, ...buyers];
            }

            // Display buyers
            buyers.forEach(buyer => {
                buyersGrid.insertAdjacentHTML('beforeend', createBuyerCard(buyer));
            });

            // Show/hide load more button
            loadMoreBtn.style.display = buyers.length === buyersPerPage ? 'block' : 'none';

            // Observe new cards for animation
            observeBuyerCards();

        } catch (error) {
            console.error('Error fetching buyers:', error);
            showNotification('Failed to load buyers. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }

    // Filter buyers
    async function filterBuyers() {
        const searchTerm = productSearch.value.toLowerCase();
        const selectedCounty = countyFilter.value.toLowerCase();
        const selectedType = buyerTypeFilter.value.toLowerCase();

        lastDoc = null; // Reset pagination

        await fetchBuyers({
            searchTerm: searchTerm || null,
            county: selectedCounty || null,
            type: selectedType || null
        });
    }

    // Event Listeners
    searchBtn.addEventListener('click', filterBuyers);

    productSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterBuyers();
        }
    });

    countyFilter.addEventListener('change', filterBuyers);
    buyerTypeFilter.addEventListener('change', filterBuyers);

    loadMoreBtn.addEventListener('click', () => {
        const searchTerm = productSearch.value.toLowerCase();
        const selectedCounty = countyFilter.value.toLowerCase();
        const selectedType = buyerTypeFilter.value.toLowerCase();

        fetchBuyers({
            searchTerm: searchTerm || null,
            county: selectedCounty || null,
            type: selectedType || null
        }, true);
    });

    // Add smooth scroll for filter results
    searchBtn.addEventListener('click', () => {
        buyersGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Loading state management
    function showLoading() {
        buyersGrid.style.opacity = '0.5';
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    }

    function hideLoading() {
        buyersGrid.style.opacity = '1';
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
    }

    // Add animation for buyer cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe buyer cards
    function observeBuyerCards() {
        const cards = document.querySelectorAll('.buyer-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease-out';
            observer.observe(card);
        });
    }

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

    // Initialize - fetch first batch of buyers
    fetchBuyers();
}); 