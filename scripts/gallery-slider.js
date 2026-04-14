// scripts/ui-slider.js - Universal Rendering & Animations
let sliderIntervals = [];

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid') || document.getElementById('featured-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // Stop all active intervals to prevent phone memory issues
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

    // 1. Handle Images
    let imgs = [];
    if (Array.isArray(p.images) && p.images.length > 0) imgs = p.images;
    else if (typeof p.images === 'string' && p.images.length > 5) imgs = [p.images];
    else imgs = ['https://via.placeholder.com/600x400?text=Premiere+Real+Estate'];

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}" style="background-image: url('${img}')"></div>
    `).join('');

    // 2. Prepare Variables
    const cleanTitle = (p.title || 'Property').replace(/['"]/g, "");
    const propertyType = p.type || 'Property';
    const fullDescription = p.description || 'Inquire for more details on this property.';
    const isLong = fullDescription.length > 100;

    // 3. Construct HTML
    card.innerHTML = `
        <div class="property-image-container" data-type="${propertyType}">
            <div class="slides-wrapper">${slidesHtml}</div>
            
            ${imgs.length > 1 ? `
                <div class="slider-controls">
                    <button onclick="event.stopPropagation(); changeSlide('${p.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                    <button onclick="event.stopPropagation(); changeSlide('${p.id}', 1)"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="slider-dots">
                    ${imgs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="property-info">
            <h3>${p.title || 'New Listing'}</h3>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${p.location || 'Uganda'}</div>
            <div class="price">${p.price || 'Contact for Price'}</div>
            
            <div class="description-container">
                <p class="description ${isLong ? 'truncate' : ''}">${fullDescription}</p>
                ${isLong ? `<button class="read-more-btn" onclick="toggleDescription(this)">Read More</button>` : ''}
            </div>

            <button class="order-btn" onclick="orderViaWhatsApp('${p.id}', '${cleanTitle}')">
                <i class="fab fa-whatsapp"></i> ${p.is_sold ? 'Inquire for Similar' : 'Inquire on WhatsApp'}
            </button>
        </div>`;
    return card;
}

function initSliders() {
    document.querySelectorAll('.property-card').forEach(card => {
        const slides = card.querySelectorAll('.slide');
        if (slides.length <= 1) return;
        const id = card.getAttribute('data-id');
        const interval = setInterval(() => window.changeSlide(id, 1), 4500);
        sliderIntervals.push(interval);
    });
}

window.changeSlide = function(id, dir) {
    const card = document.querySelector(`.property-card[data-id="${id}"]`);
    if (!card) return;
    
    const slides = card.querySelectorAll('.slide');
    const dots = card.querySelectorAll('.dot');
    if (slides.length <= 1) return;

    let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));

    slides[idx].classList.remove('active');
    if (dots.length > idx) dots[idx].classList.remove('active');

    idx = (idx + dir + slides.length) % slides.length;

    slides[idx].classList.add('active');
    if (dots.length > idx) dots[idx].classList.add('active');
};

window.toggleDescription = function(btn) {
    const container = btn.parentElement;
    const text = container.querySelector('.description');
    
    if (text.classList.contains('truncate')) {
        text.classList.remove('truncate');
        btn.innerText = 'Show Less';
    } else {
        text.classList.add('truncate');
        btn.innerText = 'Read More';
    }
};

window.orderViaWhatsApp = function(id, title) {
    const msg = encodeURIComponent(`Hi Noah, I'm interested in: *${title}* (ID: ${id})`);
    window.open(`https://wa.me/256772492207?text=${msg}`, '_blank');
};