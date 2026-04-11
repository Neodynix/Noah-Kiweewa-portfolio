// js/gallery.js - Properties from Supabase + Smart Filter Bar

const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';     // ← CHANGE THIS
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';              // ← CHANGE THIS

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allProperties = [];
let lastScrollY = 0;
let isFilterVisible = true;

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('properties-grid');
    const filterSection = document.querySelector('.filters');

    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 60px; color:#888;">Loading properties...</p>';

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allProperties = data || [];

        if (allProperties.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666;">No properties available at the moment.</p>';
            return;
        }

        renderProperties(allProperties);

    } catch (err) {
        console.error('Error fetching properties:', err);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#e74c3c; padding: 60px;">Unable to load properties. Please try again later.</p>`;
    }

    // Setup filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            if (filterValue === 'all') {
                renderProperties(allProperties);
            } else {
                const filtered = allProperties.filter(p => p.type === filterValue);
                renderProperties(filtered);
            }
        });
    });

    // Smart Filter Bar: Hide on scroll down, Show on scroll up
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 300) {
            // Scrolling DOWN → hide filter
            if (isFilterVisible) {
                filterSection.style.transform = 'translateY(-100%)';
                filterSection.style.transition = 'transform 0.3s ease';
                isFilterVisible = false;
            }
        } else {
            // Scrolling UP → show filter
            if (!isFilterVisible) {
                filterSection.style.transform = 'translateY(0)';
                isFilterVisible = true;
            }
        }

        lastScrollY = currentScrollY;
    });
});

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid');
    grid.innerHTML = '';

    if (properties.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666; padding: 40px;">No properties found in this category.</p>';
        return;
    }

    properties.forEach(property => {
        const card = createPropertyCard(property);
        grid.appendChild(card);
    });
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.setAttribute('data-type', property.type || 'residential');

    const firstImage = property.images && property.images.length > 0 
        ? property.images[0] 
        : 'https://picsum.photos/id/1015/600/400';

    card.innerHTML = `
        <div class="property-image" style="background-image: url('\( {firstImage}')" data-type=" \){property.type || 'residential'}">
        </div>
        <div class="property-info">
            <h3>${property.title}</h3>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i> ${property.location}
            </div>
            <div class="price">${property.price}</div>
            <p class="description">
                ${property.description ? property.description.substring(0, 140) + '...' : 'Premium property in a great location.'}
            </p>
            <p class="listing-date">
                <i class="fas fa-clock"></i> Listed: ${new Date(property.created_at || property.listing_date).toLocaleDateString('en-GB')}
            </p>
            <button class="order-btn" onclick="orderViaWhatsApp('\( {property.id}', ' \){property.title.replace(/'/g, "\\'")}')">
                <i class="fab fa-whatsapp"></i> Inquire via WhatsApp
            </button>
        </div>
    `;
    return card;
}

// WhatsApp function
window.orderViaWhatsApp = function(id, title) {
    const message = encodeURIComponent(
        `Hi Noah,\n\n` +
        `I'm interested in this property from your gallery:\n\n` +
        `*${title}*\n` +
        `Property ID: ${id}\n\n` +
        `Please send me more photos, details, and available viewing times.\nThank you!`
    );
    window.open(`https://wa.me/256772492207?text=${message}`, '_blank');
};