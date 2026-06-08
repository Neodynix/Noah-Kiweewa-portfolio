// scripts/gallery-slider.js - SEO Optimized Property System (Cloudflare + Supabase)

let sliderIntervals = [];

/* =========================
   SLUG SYSTEM
========================= */

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function getPropertySlug() {
    const match = window.location.pathname.match(/^\/property\/(.+)/);
    return match ? match[1] : null;
}

function findPropertyBySlug(properties, slug) {
    return properties.find(p =>
        slugify(generateSEOTitle(p)) === slug
    );
}

/* =========================
   SEO TITLE GENERATOR (IMPORTANT)
========================= */

function generateSEOTitle(p) {
    const type = (p.type || '').toLowerCase();
    const location = p.location || 'Uganda';

    if (type.includes('land')) {
        return `Prime Land for Sale in ${location}`;
    }

    if (type.includes('house')) {
        return `Luxury House in ${location}`;
    }

    if (type.includes('apartment')) {
        return `Modern Apartment in ${location}`;
    }

    if (type.includes('commercial')) {
        return `Commercial Property in ${location}`;
    }

    return `${p.type || 'Property'} in ${location}`;
}

/* =========================
   MAIN RENDER
========================= */

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid') ||
                 document.getElementById('featured-grid');

    if (!grid) return;

    grid.innerHTML = '';

    updateSEOContent(properties);
    addPropertySchema(properties);

    sliderIntervals.forEach(clearInterval);
    sliderIntervals = [];

    const slug = getPropertySlug();
    const selected = slug ? findPropertyBySlug(properties, slug) : null;

    const finalProperties = selected
        ? [selected, ...properties.filter(p => p !== selected)]
        : handlePropertyMode(properties);

    finalProperties.forEach(p => {
        const card = createPropertyCard(p);
        grid.appendChild(card);
    });

    initSliders();
    openPropertyFromURL();
}

/* =========================
   RECOMMENDATION SYSTEM
========================= */

function handlePropertyMode(properties) {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('property');

    if (!propertyId) return properties;

    const selected = properties.find(
        p => String(p.id) === String(propertyId)
    );

    if (!selected) return properties;

    const selectedLocation = String(selected.location || '').toLowerCase().trim();
    const selectedType = String(selected.type || '').toLowerCase().trim();

    const sameArea = properties.filter(p =>
        String(p.id) !== String(propertyId) &&
        String(p.location || '').toLowerCase().trim() === selectedLocation
    );

    const sameCategory = properties.filter(p =>
        String(p.id) !== String(propertyId) &&
        String(p.type || '').toLowerCase().trim() === selectedType &&
        String(p.location || '').toLowerCase().trim() !== selectedLocation
    );

    const others = properties.filter(p =>
        String(p.id) !== String(propertyId) &&
        !sameArea.includes(p) &&
        !sameCategory.includes(p)
    );

    return [selected, ...sameArea, ...sameCategory, ...others];
}

/* =========================
   PROPERTY CARD
========================= */

function createPropertyCard(p) {
    const card = document.createElement('div');
    card.className = `property-card ${p.is_sold ? 'sold-out' : ''}`;
    card.setAttribute('data-id', p.id);

    let imgs = [];

    if (Array.isArray(p.images) && p.images.length > 0) {
        imgs = p.images;
    } else if (typeof p.images === 'string') {
        imgs = [p.images];
    } else {
        imgs = ['https://via.placeholder.com/600x400?text=Real+Estate'];
    }

    const seoTitle = generateSEOTitle(p);
    const cleanTitle = escapeText(seoTitle);

    const propertyType = escapeText(p.type || 'Property');
    const location = escapeText(p.location || 'Uganda');
    const price = escapeText(p.price || 'Contact for Price');
    const propertyId = escapeText(p.id || '');

    const isLong = (p.description || '').length > 100;

    const slug = slugify(seoTitle);
    const propertyUrl = `/property/${slug}`;

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}">
            <img src="${escapeText(img)}" alt="${cleanTitle}">
        </div>
    `).join('');

    card.innerHTML = `
        <div class="property-image-container">

            <div class="slides-wrapper">
                ${slidesHtml}
            </div>

            ${imgs.length > 1 ? `
                <div class="slider-controls">
                    <button onclick="event.stopPropagation(); changeSlide('${p.id}', -1)">‹</button>
                    <button onclick="event.stopPropagation(); changeSlide('${p.id}', 1)">›</button>
                </div>
            ` : ''}

        </div>

        <div class="property-info">

            <h3>${cleanTitle}</h3>

            <div class="location">${location}</div>

            <div class="price">${price}</div>

            <p class="description ${isLong ? 'truncate' : ''}">
                ${escapeText(p.description || '')}
            </p>

            <button
                class="order-btn"
                onclick="event.stopPropagation(); orderViaWhatsApp('${propertyId}','${cleanTitle}','${propertyType}','${location}','${price}')"
            >
                WhatsApp Inquiry
            </button>

        </div>
    `;

    /* =========================
       SEO NAVIGATION
    ========================= */

    card.addEventListener('click', () => {
        history.pushState({}, '', propertyUrl);
        renderProperties(allProperties);
    });

    return card;
}

/* =========================
   URL HANDLING
========================= */

function openPropertyFromURL() {
    const slug = getPropertySlug();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('property');

    const target = slug || id;
    if (!target) return;

    setTimeout(() => {
        const card = document.querySelector(
            `.property-card[data-id="${CSS.escape(target)}"]`
        );

        if (!card) return;

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        card.classList.add('highlighted-property');

        setTimeout(() => {
            card.classList.remove('highlighted-property');
        }, 5000);

    }, 500);
}

/* =========================
   SEO CONTENT
========================= */

function updateSEOContent(properties) {
    let seoSection = document.getElementById('seo-property-content');

    if (!seoSection) {
        seoSection = document.createElement('section');
        seoSection.id = 'seo-property-content';

        seoSection.innerHTML = `
            <h2>Real Estate in Uganda</h2>
            <p>Buy and sell houses, land, apartments and commercial properties across Uganda.</p>
            <div id="seo-properties-list"></div>
        `;

        document.querySelector('.properties')?.after(seoSection);
    }

    const seoList = document.getElementById('seo-properties-list');

    seoList.innerHTML = properties.slice(0, 20).map(p => `
        <article>
            <h3>${escapeText(generateSEOTitle(p))}</h3>
            <p>${escapeText(p.description || '')}</p>
        </article>
    `).join('');
}

/* =========================
   SCHEMA (SEO FIXED)
========================= */

function addPropertySchema(properties) {
    const existing = document.getElementById('property-schema');
    if (existing) existing.remove();

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Real Estate Uganda",

        "itemListElement": properties.slice(0, 30).map((p, index) => {

            const images = Array.isArray(p.images)
                ? p.images
                : [p.images].filter(Boolean);

            const seoTitle = generateSEOTitle(p);
            const url = `https://noahkiweewa.com/property/${slugify(seoTitle)}`;

            return {
                "@type": "ListItem",
                "position": index + 1,

                "item": {
                    "@type": "Residence",
                    "name": seoTitle,
                    "description": p.description || "",
                    "identifier": String(p.id || ""),
                    "image": images.length ? images : [],
                    "url": url,

                    "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "UG",
                        "addressLocality": p.location || "Uganda"
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

/* =========================
   UTILITIES
========================= */

function escapeText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* =========================
   SLIDERS
========================= */

function initSliders() {
    document.querySelectorAll('.property-card').forEach(card => {
        const slides = card.querySelectorAll('.slide');
        if (slides.length <= 1) return;

        const id = card.getAttribute('data-id');

        const interval = setInterval(() => {
            window.changeSlide(id, 1);
        }, 4500);

        sliderIntervals.push(interval);
    });
}

window.changeSlide = function(id, dir) {
    const card = document.querySelector(
        `.property-card[data-id="${CSS.escape(String(id))}"]`
    );

    if (!card) return;

    const slides = card.querySelectorAll('.slide');

    let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));
    if (idx < 0) idx = 0;

    slides[idx].classList.remove('active');

    idx = (idx + dir + slides.length) % slides.length;

    slides[idx].classList.add('active');
};

/* =========================
   WHATSAPP
========================= */

window.orderViaWhatsApp = function(id, title, type, location, price) {
    const link = `https://noahkiweewa.com/property/${slugify(title)}`;

    const msg = `
🏡 ${title}
🆔 ${id}
📍 ${location}
💰 ${price}
🔗 ${link}

Interested in this property.
`;

    window.open(`https://wa.me/256772492207?text=${encodeURIComponent(msg)}`, '_blank');
};
