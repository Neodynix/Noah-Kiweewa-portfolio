// scripts/gallery.js - Premium Gallery Engine

const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';

let supabase;
let allProperties = [];
let sliderIntervals = [];

/**
 * Main Initialization
 */
async function initGallery() {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 60px; color:#888;">Initializing Gallery...</p>';

    // 1. Wait for Supabase Library to load (Mobile optimization)
    let attempts = 0;
    while (!window.supabase && attempts < 20) {
        await new Promise(res => setTimeout(res, 200));
        attempts++;
    }

    if (!window.supabase) {
        grid.innerHTML = '<p style="color:red; text-align:center; padding:40px;">Connection Error: Library failed to load. Please refresh.</p>';
        return;
    }

    // 2. Connect
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        // 3. Fetch
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allProperties = data || [];

        if (allProperties.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 60px; color:#666;">No properties found in the database. Check RLS settings.</p>';
            return;
        }

        renderProperties(allProperties);

    } catch (err) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#e74c3c; padding: 40px;">Database Error: ${err.message}</p>`;
    }

    // 4. Setup Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-filter');
            renderProperties(type === 'all' ? allProperties : allProperties.filter(p => p.type === type));
        });
    });
}

/**
 * Render Cards to Grid
 */
function renderProperties(properties) {
    const grid = document.getElementById('properties-grid');
    grid.innerHTML = '';
    
    sliderIntervals.forEach(clearInterval);
    sliderIntervals = [];

    properties.forEach(property => {
        const card = createPropertyCard(property);
        grid.appendChild(card);
    });

    initSliders();
}

/**
 * Generate Individual Card HTML
 */
function createPropertyCard(p) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.setAttribute('data-id', p.id);

    // Handle Image Array or String
    let imgs = [];
    if (Array.isArray(p.images) && p.images.length > 0) imgs = p.images;
    else if (typeof p.images === 'string' && p.images.length > 5) imgs = [p.images];
    else imgs = ['https://via.placeholder.com/600x400?text=Premiere+Real+Estate'];

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}" style="background-image: url('${img}')"></div>
    `).join('');

    const controlsHtml = imgs.length > 1 ? `
        <div class="slider-controls">
            <button onclick="changeSlide('${p.id}', -1)"><i class="fas fa-chevron-left"></i></button>
            <button onclick="changeSlide('${p.id}', 1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="slider-dots">
            ${imgs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
        </div>
    ` : '';

    card.innerHTML = `
        <div class="property-image-container" data-type="${p.type || 'Property'}">
            <div class="slides-wrapper">${slidesHtml}</div>
            ${controlsHtml}
        </div>
        <div class="property-info">
            <h3>${p.title}</h3>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
            <div class="price">${p.price}</div>
            <p class="description">${p.description ? p.description.substring(0, 100) + '...' : 'Premium property available.'}</p>
            <button class="order-btn" onclick="orderViaWhatsApp('${p.id}', '${p.title.replace(/'/g, "\\'")}')">
                <i class="fab fa-whatsapp"></i> Inquire via WhatsApp
            </button>
        </div>`;
    return card;
}

/**
 * Manual Slide Change
 */
window.changeSlide = function(id, dir) {
    const card = document.querySelector(`.property-card[data-id="${id}"]`);
    if (!card) return;
    const slides = card.querySelectorAll('.slide');
    const dots = card.querySelectorAll('.dot');
    let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));

    slides[idx].classList.remove('active');
    if (dots.length) dots[idx].classList.remove('active');

    idx = (idx + dir + slides.length) % slides.length;

    slides[idx].classList.add('active');
    if (dots.length) dots[idx].classList.add('active');
};

/**
 * Auto Slider Logic
 */
function initSliders() {
    document.querySelectorAll('.property-card').forEach(card => {
        const slides = card.querySelectorAll('.slide');
        if (slides.length <= 1) return;
        const id = card.getAttribute('data-id');
        sliderIntervals.push(setInterval(() => window.changeSlide(id, 1), 5000));
    });
}

/**
 * WhatsApp Integration
 */
window.orderViaWhatsApp = function(id, title) {
    const msg = encodeURIComponent(`Hi Noah, I'm interested in: *${title}* (ID: ${id})`);
    window.open(`https://wa.me/256772492207?text=${msg}`, '_blank');
};

// Fire it up
document.addEventListener('DOMContentLoaded', initGallery);
