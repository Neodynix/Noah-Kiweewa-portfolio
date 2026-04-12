// scripts/gallery.js - Optimized for Premiere Admin Logic
const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';

let supabase;
let allProperties = [];
let sliderIntervals = [];

async function initGallery() {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading-state">Loading Premium Properties...</div>';

    // Ensure Supabase is ready
    if (!window.supabase) {
        await new Promise(res => {
            const check = setInterval(() => {
                if (window.supabase) { clearInterval(check); res(); }
            }, 100);
        });
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        allProperties = data || [];

        if (allProperties.length === 0) {
            grid.innerHTML = '<p class="empty-msg">No properties found. Check Admin Dashboard.</p>';
            return;
        }

        renderProperties(allProperties);

    } catch (err) {
        grid.innerHTML = `<p class="error-msg">Connection Error: ${err.message}</p>`;
    }

    // Filter Logic with Case-Insensitivity
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter.toLowerCase();
            const filtered = filter === 'all' 
                ? allProperties 
                : allProperties.filter(p => p.type?.toLowerCase() === filter);
            
            renderProperties(filtered);
        });
    });
}

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid');
    grid.innerHTML = '';
    
    // Clear old intervals to prevent phone lag
    sliderIntervals.forEach(clearInterval);
    sliderIntervals = [];

    properties.forEach(p => {
        const card = createPropertyCard(p);
        grid.appendChild(card);
    });

    initSliders();
}

function createPropertyCard(p) {
    const card = document.createElement('div');
    card.className = `property-card ${p.is_sold ? 'sold-out' : ''}`;
    card.setAttribute('data-id', p.id);

    // Image logic matching admin.js upload structure
    let imgs = [];
    if (Array.isArray(p.images) && p.images.length > 0) imgs = p.images;
    else if (typeof p.images === 'string' && p.images.length > 5) imgs = [p.images];
    else imgs = ['https://via.placeholder.com/600x400?text=Premiere+Real+Estate'];

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}" style="background-image: url('${img}')"></div>
    `).join('');

    const statusBadge = p.is_sold 
        ? '<span class="status-badge sold">Sold</span>' 
        : `<span class="status-badge avail">${p.type || 'Property'}</span>`;

    // Clean data for the WhatsApp button
    const cleanTitle = (p.title || 'Property').replace(/['"]/g, "");

    card.innerHTML = `
        <div class="property-image-container">
            <div class="slides-wrapper">${slidesHtml}</div>
            ${statusBadge}
            ${imgs.length > 1 ? `
                <div class="slider-dots">
                    ${imgs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="property-info">
            <h3>${p.title || 'New Listing'}</h3>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${p.location || 'Uganda'}</div>
            <div class="price">${p.price || 'Contact for Price'}</div>
            <p class="description">${p.description ? p.description.substring(0, 80) + '...' : 'Inquire for details.'}</p>
            <button class="order-btn" onclick="orderViaWhatsApp('${p.id}', '${cleanTitle}')">
                <i class="fab fa-whatsapp"></i> ${p.is_sold ? 'Inquire for Similar' : 'Inquire on WhatsApp'}
            </button>
        </div>`;
    return card;
}

window.changeSlide = function(id, dir) {
    const card = document.querySelector(`.property-card[data-id="${id}"]`);
    if (!card) return;
    const slides = card.querySelectorAll('.slide');
    const dots = card.querySelectorAll('.dot');
    let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));

    slides[idx].classList.remove('active');
    if (dots.length > idx) dots[idx].classList.remove('active');

    idx = (idx + dir + slides.length) % slides.length;

    slides[idx].classList.add('active');
    if (dots.length > idx) dots[idx].classList.add('active');
};

function initSliders() {
    document.querySelectorAll('.property-card').forEach(card => {
        const slides = card.querySelectorAll('.slide');
        if (slides.length <= 1) return;
        const id = card.getAttribute('data-id');
        sliderIntervals.push(setInterval(() => window.changeSlide(id, 1), 4500));
    });
}

window.orderViaWhatsApp = function(id, title) {
    const msg = encodeURIComponent(`Hi Noah, I'm interested in: *${title}* (ID: ${id})`);
    window.open(`https://wa.me/256772492207?text=${msg}`, '_blank');
};

document.addEventListener('DOMContentLoaded', initGallery);
