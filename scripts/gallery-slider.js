// scripts/gallery-slider.js - Universal Rendering, Animations, Recommendations & SEO

let sliderIntervals = [];

// Helper to handle both ?property=ID and /property/slug routing
function getPropertyIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('property');
    if (id) return id;

    // Fallback for /property/slug or /property/ID
    const pathParts = window.location.pathname.split('/');
    const propIndex = pathParts.indexOf('property');
    if (propIndex !== -1 && pathParts.length > propIndex + 1) {
        return decodeURIComponent(pathParts[propIndex + 1]);
    }
    return null;
}

function renderProperties(properties) {
    const grid = document.getElementById('properties-grid') || document.getElementById('featured-grid');

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
    const propertyId = getPropertyIdFromURL();

    if (!propertyId) return properties;

    const selected = properties.find(
        p => String(p.id) === String(propertyId)
    );

    if (!selected) return properties;

    // Recommendation Notice
    const oldNotice = document.getElementById('recommendation-notice');

    if (oldNotice) {
        oldNotice.remove();
    }

    const notice = document.createElement('div');

    notice.id = 'recommendation-notice';

    notice.innerHTML = `
        <div class="recommendation-notice-content">
            <i class="fas fa-lightbulb"></i>

            <div>
                <strong>Recommended Properties</strong>

                <p>
                    Showing similar properties from the same area,
                    category and other premium listings across Uganda.
                </p>
            </div>
        </div>
    `;

    const propertiesContainer = document.querySelector('.properties .container');

    if (propertiesContainer) {
        propertiesContainer.prepend(notice);
    }

    const selectedLocation = String(selected.location || '')
        .toLowerCase()
        .trim();

    const selectedType = String(selected.type || '')
        .toLowerCase()
        .trim();

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

    return [
        selected,
        ...sameArea,
        ...sameCategory,
        ...others
    ];
}

function getRecommendationLabel(p) {
    const selectedId = getPropertyIdFromURL();

    if (!selectedId) return '';

    const selected = allProperties.find(
        item => String(item.id) === String(selectedId)
    );

    if (!selected) return '';

    const currentId = String(p.id);
    const selectedPropertyId = String(selected.id);

    const currentLocation = String(p.location || '')
        .toLowerCase()
        .trim();

    const selectedLocation = String(selected.location || '')
        .toLowerCase()
        .trim();

    const currentType = String(p.type || '')
        .toLowerCase()
        .trim();

    const selectedType = String(selected.type || '')
        .toLowerCase()
        .trim();

    if (currentId === selectedPropertyId) {
        return `
            <div class="property-section-label main-property">
                Property You Selected
            </div>
        `;
    }

    if (currentLocation === selectedLocation) {
        return `
            <div class="property-section-label">
                More Properties in ${escapeText(selected.location)}
            </div>
        `;
    }

    if (currentType === selectedType) {
        return `
            <div class="property-section-label">
                Similar ${escapeText(selected.type)} Properties
            </div>
        `;
    }

    return `
        <div class="property-section-label">
            Other Recommended Properties
        </div>
    `;
}

function createPropertyCard(p) {
    const card = document.createElement('div');

    card.className = `property-card ${p.is_sold ? 'sold-out' : ''}`;

    card.setAttribute('data-id', p.id);

    let imgs = [];

    // Improved Image Parsing for comma strings, JSON, or arrays
    if (Array.isArray(p.images) && p.images.length > 0) {
        imgs = p.images;
    } else if (typeof p.images === 'string' && p.images.length > 5) {
        try {
            const parsed = JSON.parse(p.images);
            imgs = Array.isArray(parsed) ? parsed : [p.images];
        } catch(e) {
            imgs = p.images.includes(',') ? p.images.split(',').map(i => i.trim()) : [p.images];
        }
    } else {
        imgs = ['https://via.placeholder.com/600x400?text=Premiere+Real+Estate'];
    }

    const cleanTitle = escapeText(p.title || 'Property');

    const propertyType = escapeText(p.type || 'Property');

    const fullDescription = escapeText(
        p.description || 'Inquire for more details on this property.'
    );

    const location = escapeText(p.location || 'Uganda');

    const price = escapeText(p.price || 'Contact for Price');

    const propertyId = escapeText(p.id || '');

    const isLong = fullDescription.length > 100;

    const recommendationLabel = getRecommendationLabel(p);

    const slidesHtml = imgs.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}">
            <img
                src="${escapeText(img)}"
                alt="${cleanTitle} in ${location} - ${propertyType} property in Uganda"
                loading="lazy"
            >
        </div>
    `).join('');

    card.innerHTML = `
        ${recommendationLabel}

        <div class="property-image-container" data-type="${propertyType}">

            <div class="slides-wrapper">
                ${slidesHtml}
            </div>

            ${imgs.length > 1 ? `
                <div class="slider-controls">
                    <button onclick="event.stopPropagation(); changeSlide('${escapeText(p.id)}', -1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>

                    <button onclick="event.stopPropagation(); changeSlide('${escapeText(p.id)}', 1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="slider-dots">
                    ${imgs.map((_, i) => `
                        <span class="dot ${i === 0 ? 'active' : ''}"></span>
                    `).join('')}
                </div>
            ` : ''}

        </div>

        <div class="property-info">

            <h3>${cleanTitle}</h3>

            <div class="location">
                <i class="fas fa-map-marker-alt"></i>
                ${location}
            </div>

            <div class="price">
                ${price}
            </div>

            <div class="description-container">

                <p class="description ${isLong ? 'truncate' : ''}">
                    ${fullDescription}
                </p>

                ${isLong ? `
                    <button
                        class="read-more-btn"
                        onclick="event.stopPropagation(); toggleDescription(this)"
                    >
                        Read More
                    </button>
                ` : ''}

            </div>

            <button
                class="order-btn"
                onclick="event.stopPropagation(); orderViaWhatsApp('${propertyId}', '${cleanTitle}', '${propertyType}', '${location}', '${price}')"
            >
                <i class="fab fa-whatsapp"></i>

                ${p.is_sold
                    ? 'Inquire for Similar'
                    : 'Inquire on WhatsApp'}
            </button>

        </div>
    `;

    card.addEventListener('click', () => {
        history.pushState(
            {},
            '',
            `/gallery.html?property=${encodeURIComponent(p.id)}`
        );

        renderProperties(allProperties);
    });

    return card;
}

function openPropertyFromURL() {
    const propertyId = getPropertyIdFromURL();

    if (!propertyId) return;

    setTimeout(() => {
        const card = document.querySelector(
            `.property-card[data-id="${CSS.escape(propertyId)}"]`
        );

        if (!card) return;

        card.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

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
        
        // Hide visually while keeping accessible for SEO engines and screen readers
        seoSection.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;';

        seoSection.innerHTML = `
            <div class="container">

                <h2>
                    Real Estate Properties in Uganda
                </h2>

                <p>
                    Browse houses, land, apartments, condominiums,
                    estates, hotels, schools, hospitals, factories,
                    farms, industrial plants and commercial properties
                    for sale or rent in Kampala, Entebbe, Wakiso,
                    Mukono and across Uganda with Noah Kiweewa.
                </p>

                <h3>
                    Available Property Listings
                </h3>

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

            <h3>
                ${escapeText(p.title || 'Property in Uganda')}
            </h3>

            <p>
                ${escapeText(
                    p.description ||
                    'Premium real estate property listing in Uganda.'
                )}
            </p>

            <ul>
                <li>
                    <strong>Category:</strong>
                    ${escapeText(p.type || 'Property')}
                </li>

                <li>
                    <strong>Location:</strong>
                    ${escapeText(p.location || 'Uganda')}
                </li>

                <li>
                    <strong>Price:</strong>
                    ${escapeText(p.price || 'Contact for Price')}
                </li>
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

        "description":
            "Houses, land, apartments, condominiums, factories, schools, farms and commercial properties across Uganda by Noah Kiweewa.",

        "url": "https://noahkiweewa.com/gallery.html",

        "itemListElement": properties.slice(0, 30).map((p, index) => {
            
            // Unified schema image parsing mirroring card handling
            let parsedImages = [];
            if (Array.isArray(p.images)) {
                parsedImages = p.images;
            } else if (typeof p.images === 'string' && p.images.length > 5) {
                try {
                    const parsed = JSON.parse(p.images);
                    parsedImages = Array.isArray(parsed) ? parsed : [p.images];
                } catch(e) {
                    parsedImages = p.images.includes(',') ? p.images.split(',').map(i => i.trim()) : [p.images];
                }
            }

            return {
                "@type": "ListItem",

                "position": index + 1,

                "item": {
                    "@type": "Product",

                    "name": p.title || "Property in Uganda",

                    "description":
                        p.description ||
                        "Real estate property listing in Uganda.",

                    "sku": String(p.id || ""),

                    "image":
                        parsedImages.length
                            ? parsedImages
                            : ["https://noahkiweewa.com/images/preview.jpg"],

                    "category": p.type || "Real Estate",

                    "url":
                        `https://noahkiweewa.com/gallery.html?property=${encodeURIComponent(p.id || '')}`,

                    "brand": {
                        "@type": "Brand",
                        "name": "Noah Kiweewa Real Estate"
                    },

                    "offers": {
                        "@type": "Offer",

                        "priceCurrency": "UGX",

                        "price": cleanPriceForSchema(p.price),

                        "availability":
                            p.is_sold
                                ? "https://schema.org/SoldOut"
                                : "https://schema.org/InStock",

                        "url":
                            `https://noahkiweewa.com/gallery.html?property=${encodeURIComponent(p.id || '')}`
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

    const dots = card.querySelectorAll('.dot');

    if (slides.length <= 1) return;

    let idx = Array.from(slides).findIndex(
        s => s.classList.contains('active')
    );

    if (idx < 0) idx = 0;

    slides[idx].classList.remove('active');

    if (dots.length > idx) {
        dots[idx].classList.remove('active');
    }

    idx = (idx + dir + slides.length) % slides.length;

    slides[idx].classList.add('active');

    if (dots.length > idx) {
        dots[idx].classList.add('active');
    }
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

window.orderViaWhatsApp = function(
    propertyId,
    title,
    category,
    location,
    price
) {

    const propertyLink =
        `https://noahkiweewa.com/gallery.html?property=${encodeURIComponent(propertyId)}`;

    const message = `
🏡 *${title}*
🆔 Property ID: ${propertyId}
📂 Category: ${category}
📍 Location: ${location}
💰 Price: ${price}
🔗 Link: ${propertyLink}

Hi Noah, I'm interested in this property.
Could you share more details?
`;

    const encoded = encodeURIComponent(message.trim());

    window.open(
        `https://wa.me/256772492207?text=${encoded}`,
        '_blank'
    );
};
