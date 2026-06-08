// scripts/gallery-slider.js - Universal Rendering, Animations, Recommendations & SEO

let sliderIntervals = [];

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid') ||
                 document.getElementById('featured-grid');

    if (!grid) return;

    grid.innerHTML = '';

    updateSEOContent(properties);
    addPropertySchema(properties);

    sliderIntervals.forEach(clearInterval);
    sliderIntervals = [];

    const finalProperties = handlePropertyMode(properties);

    finalProperties.forEach(p => {
        const card = createPropertyCard(p);
        grid.appendChild(card);
    });

    initSliders();
    openPropertyFromURL();
}

function handlePropertyMode(properties) {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('property');

    if (!propertyId) return properties;

    const selected = properties.find(
        p => String(p.id) === String(propertyId)
    );

    if (!selected) return properties;

    const oldNotice = document.getElementById('recommendation-notice');
    if (oldNotice) oldNotice.remove();

    const notice = document.createElement('div');
    notice.id = 'recommendation-notice';

    notice.innerHTML = `
        <div class="recommendation-notice-content">
            <i class="fas fa-lightbulb"></i>
            <div>
                <strong>Recommended Properties</strong>
                <p>Showing similar properties from the same area and category.</p>
            </div>
        </div>
    `;

    const container = document.querySelector('.properties .container');
    if (container) container.prepend(notice);

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

function getRecommendationLabel(p) {
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get('property');

    if (!selectedId) return '';

    const selected = allProperties.find(
        item => String(item.id) === String(selectedId)
    );

    if (!selected) return '';

    const currentLocation = String(p.location || '').toLowerCase().trim();
    const selectedLocation = String(selected.location || '').toLowerCase().trim();
    const currentType = String(p.type || '').toLowerCase().trim();
    const selectedType = String(selected.type || '').toLowerCase().trim();

    if (String(p.id) === String(selected.id)) {
        return `<div class="property-section-label main-property">Property You Selected</div>`;
    }

    if (currentLocation === selectedLocation) {
        return `<div class="property-section-label">More Properties in ${escapeText(selected.location)}</div>`;
    }

    if (currentType === selectedType) {
        return `<div class="property-section-label">Similar ${escapeText(selected.type)} Properties</div>`;
    }

    return `<div class="property-section-label">Other Recommended Properties</div>`;
}

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

    const cleanTitle = escapeText(p.title || 'Property');
    const propertyType = escapeText(p.type || 'Property');
    const location = escapeText(p.location || 'Uganda');
    const price = escapeText(p.price || 'Contact for Price');
    const propertyId = escapeText(p.id || '');
    const isLong = (p.description || '').length > 100;

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}">
            <img src="${escapeText(img)}" alt="${cleanTitle}">
        </div>
    `).join('');

    const recommendationLabel = getRecommendationLabel(p);

    card.innerHTML = `
        ${recommendationLabel}

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

            <div class="location">
                ${location}
            </div>

            <div class="price">
                ${price}
            </div>

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

    card.addEventListener('click', () => {
        history.pushState({}, '',
            `/gallery.html?property=${encodeURIComponent(p.id)}`
        );

        renderProperties(allProperties);
    });

    return card;
}

function openPropertyFromURL() {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('property');

    if (!propertyId) return;

    setTimeout(() => {
        const card = document.querySelector(
            `.property-card[data-id="${CSS.escape(propertyId)}"]`
        );

        if (!card) return;

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlighted-property');

        setTimeout(() => {
            card.classList.remove('highlighted-property');
        }, 5000);

    }, 500);
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
                <p>Browse houses, land, apartments, farms and commercial properties across Uganda.</p>
                <div id="seo-properties-list"></div>
            </div>
        `;

        document.querySelector('.properties')?.after(seoSection);
    }

    const seoList = document.getElementById('seo-properties-list');
    if (!seoList) return;

    seoList.innerHTML = properties.map(p => `
        <article>
            <h3>${escapeText(p.title || '')}</h3>
            <p>${escapeText(p.description || '')}</p>
            <span>${escapeText(p.location || '')}</span>
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
        "url": "https://noahkiweewa.com/gallery.html",

        "itemListElement": properties.slice(0, 30).map((p, index) => {

            const images = Array.isArray(p.images)
                ? p.images
                : [p.images].filter(Boolean);

            const propertyUrl =
                `https://noahkiweewa.com/gallery.html?property=${encodeURIComponent(p.id || '')}`;

            return {
                "@type": "ListItem",
                "position": index + 1,

                "item": {
                    "@type": "Residence",

                    "name": p.title || "Property",
                    "description": p.description || "",

                    "identifier": String(p.id || ""),
                    "image": images.length ? images : [],
                    "url": propertyUrl,

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

function cleanPriceForSchema(price) {
    return String(price || '').replace(/[^\d.]/g, '') || "0";
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

window.orderViaWhatsApp = function(id, title, type, location, price) {
    const link = `https://noahkiweewa.com/gallery.html?property=${encodeURIComponent(id)}`;

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
