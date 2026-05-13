// scripts/ui-slider.js - Universal Rendering, Animations & SEO
let sliderIntervals = [];

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid') || document.getElementById('featured-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // SEO additions
    updateSEOContent(properties);
    addPropertySchema(properties);

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

    let imgs = [];
    if (Array.isArray(p.images) && p.images.length > 0) imgs = p.images;
    else if (typeof p.images === 'string' && p.images.length > 5) imgs = [p.images];
    else imgs = ['https://via.placeholder.com/600x400?text=Premiere+Real+Estate'];

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}" style="background-image: url('${img}')"></div>
    `).join('');

    const cleanTitle = escapeText(p.title || 'Property');
    const propertyType = escapeText(p.type || 'Property');
    const fullDescription = escapeText(p.description || 'Inquire for more details on this property.');
    const location = escapeText(p.location || 'Uganda');
    const price = escapeText(p.price || 'Contact for Price');
    const isLong = fullDescription.length > 100;

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
            <h3>${cleanTitle}</h3>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${location}</div>
            <div class="price">${price}</div>

            <div class="description-container">
                <p class="description ${isLong ? 'truncate' : ''}">${fullDescription}</p>
                ${isLong ? `<button class="read-more-btn" onclick="toggleDescription(this)">Read More</button>` : ''}
            </div>

            <button class="order-btn" onclick="orderViaWhatsApp('${cleanTitle}', '${propertyType}', '${location}', '${price}')">
                <i class="fab fa-whatsapp"></i> ${p.is_sold ? 'Inquire for Similar' : 'Inquire on WhatsApp'}
            </button>
        </div>
    `;

    return card;
}

function updateSEOContent(properties) {
    let seoSection = document.getElementById('seo-property-content');

    if (!seoSection) {
        seoSection = document.createElement('section');
        seoSection.id = 'seo-property-content';
        seoSection.className = 'seo-property-content';

        seoSection.innerHTML = `
            <div class="container">
                <h2>Real Estate Properties in Uganda</h2>
                <p>
                    Browse houses, land, apartments, estates, hotels, schools, factories,
                    farms and commercial properties for sale or rent in Kampala, Entebbe
                    and across Uganda with Noah Kiweewa.
                </p>

                <h3>Available Property Listings</h3>
                <div id="seo-properties-list"></div>
            </div>
        `;

        const propertiesSection = document.querySelector('.properties');
        if (propertiesSection) {
            propertiesSection.after(seoSection);
        }
    }

    const seoList = document.getElementById('seo-properties-list');
    if (!seoList) return;

    seoList.innerHTML = properties.map(p => `
        <article class="seo-property-item">
            <h3>${escapeText(p.title || 'Property in Uganda')}</h3>
            <p>${escapeText(p.description || 'Premium real estate property listing in Uganda.')}</p>
            <ul>
                <li><strong>Category:</strong> ${escapeText(p.type || 'Property')}</li>
                <li><strong>Location:</strong> ${escapeText(p.location || 'Uganda')}</li>
                <li><strong>Price:</strong> ${escapeText(p.price || 'Contact for Price')}</li>
            </ul>
        </article>
    `).join('');
}

function addPropertySchema(properties) {
    const existing = document.getElementById('property-schema');
    if (existing) existing.remove();

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Real Estate Properties in Uganda",
        "description": "Houses, land, apartments and commercial properties across Uganda by Noah Kiweewa.",
        "url": "https://noahkiweewa.com/gallery.html",
        "itemListElement": properties.slice(0, 30).map((p, index) => {
            const image = Array.isArray(p.images) ? p.images[0] : p.images;

            return {
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Product",
                    "name": p.title || "Property in Uganda",
                    "description": p.description || "Real estate property listing in Uganda.",
                    "image": image || "https://noahkiweewa.com/images/preview.jpg",
                    "category": p.type || "Real Estate",
                    "url": "https://noahkiweewa.com/gallery.html",
                    "brand": {
                        "@type": "Brand",
                        "name": "Noah Kiweewa Real Estate"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "UGX",
                        "price": cleanPriceForSchema(p.price),
                        "availability": p.is_sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
                        "url": "https://noahkiweewa.com/gallery.html"
                    },
                    "areaServed": {
                        "@type": "Country",
                        "name": "Uganda"
                    }
                }
            };
        })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'property-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

function cleanPriceForSchema(price) {
    if (!price) return "0";

    const cleaned = String(price).replace(/[^\d.]/g, '');

    return cleaned || "0";
}

function escapeText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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

window.orderViaWhatsApp = function(title, category, location, price) {
    const message = `
🏡 *${title}*
📂 Category: ${category}
📍 Location: ${location}
💰 Price: ${price}

Hi Noah, I'm interested in this property. Could you share more details?
`;

    const encoded = encodeURIComponent(message.trim());
    window.open(`https://wa.me/256772492207?text=${encoded}`, '_blank');
};
