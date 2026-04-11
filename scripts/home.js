// js/home.js - Featured Properties from Supabase
// Replace with your actual Supabase credentials

const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';     // ← CHANGE THIS
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';              // ← CHANGE THIS

// Initialize Supabase client
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#888;">Loading featured properties...</p>';

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('is_sold', false)           // Only show available properties
            .limit(3)                       // Show only 3 featured on homepage
            .order('created_at', { ascending: false });

        if (error) throw error;

        grid.innerHTML = ''; // Clear loading message

        if (data.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666;">No properties available at the moment.</p>';
            return;
        }

        data.forEach(property => {
            const card = createPropertyCard(property);
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching featured properties:', err);
        grid.innerHTML = `
            <p style="grid-column: 1/-1; text-align:center; color:#e74c3c; padding: 40px;">
                Unable to load properties. Please try again later.
            </p>`;
    }
});

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';

    // Use first image or fallback
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
                ${property.description ? property.description.substring(0, 120) + '...' : 'Premium property in a great location.'}
            </p>
            <button class="order-btn" onclick="orderViaWhatsApp('\( {property.id}', ' \){property.title.replace(/'/g, "\\'")}')">
                <i class="fab fa-whatsapp"></i> Inquire via WhatsApp
            </button>
        </div>
    `;
    return card;
}

// WhatsApp inquiry function
window.orderViaWhatsApp = function(id, title) {
    const message = encodeURIComponent(
        `Hi Noah,\n\n` +
        `I'm interested in this property from your website:\n\n` +
        `*${title}*\n` +
        `Property ID: ${id}\n\n` +
        `Please send me more details, photos, and available viewing times.\n\nThank you!`
    );
    
    window.open(`https://wa.me/256772492207?text=${message}`, '_blank');
};
