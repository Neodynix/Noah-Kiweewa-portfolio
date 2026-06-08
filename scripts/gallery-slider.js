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

/* UNIQUE SEO SLUG */
function generateSlug(p) {
return slugify(${p.type || 'property'}-${p.location || 'uganda'}-${p.id});
}

/* =========================
SEO TITLE
========================= */

function generateSEOTitle(p) {
const type = (p.type || '').toLowerCase();
const location = p.location || 'Uganda';

if (type.includes('land')) return `Land for Sale in ${location}`;  
if (type.includes('house')) return `House for Sale in ${location}`;  
if (type.includes('apartment')) return `Apartment for Sale in ${location}`;  
if (type.includes('commercial')) return `Commercial Property in ${location}`;  

return `${p.type || 'Property'} for Sale in ${location}`;

}

/* =========================
FIND PROPERTY FROM SLUG
========================= */

function findPropertyBySlug(properties, slug) {
return properties.find(p => generateSlug(p) === slug);
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
    ? [selected, ...properties.filter(p => p.id !== selected.id)]  
    : properties;  

finalProperties.forEach(p => {  
    grid.appendChild(createPropertyCard(p));  
});  

initSliders();  
openPropertyFromURL(properties);

}

/* =========================
GET SLUG FROM URL
========================= */

function getPropertySlug() {
const match = window.location.pathname.match(/^/property/(.+)/);
return match ? match[1] : null;
}

/* =========================
PROPERTY CARD
========================= */

function createPropertyCard(p) {
const card = document.createElement('div');
card.className = property-card ${p.is_sold ? 'sold-out' : ''};
card.setAttribute('data-id', p.id);

const imgs = Array.isArray(p.images)  
    ? p.images  
    : (typeof p.images === 'string' ? [p.images] : []);  

const seoTitle = generateSEOTitle(p);  
const slug = generateSlug(p);  

const title = escapeText(seoTitle);  
const location = escapeText(p.location || 'Uganda');  
const price = escapeText(p.price || 'Contact for Price');  

const propertyUrl = `/property/${slug}`;  

const slidesHtml = imgs.length  
    ? imgs.map((img, i) => `  
        <div class="slide ${i === 0 ? 'active' : ''}">  
            <img src="${escapeText(img)}" alt="${title}">  
        </div>  
    `).join('')  
    : '';  

card.innerHTML = `  
    <div class="property-image-container">  
        <div class="slides-wrapper">  
            ${slidesHtml}  
        </div>  
    </div>  

    <div class="property-info">  
        <h3>${title}</h3>  
        <div class="location">${location}</div>  
        <div class="price">${price}</div>  

        <p class="description">  
            ${escapeText(p.description || '')}  
        </p>  

        <button class="order-btn"  
            onclick="event.stopPropagation(); orderViaWhatsApp('${p.id}','${title}','${p.type}','${location}','${price}')">  
            WhatsApp Inquiry  
        </button>  
    </div>  
`;  

/* NAVIGATION */  
card.addEventListener('click', () => {  
    history.pushState({}, '', propertyUrl);  
    renderProperties(allProperties);  
});  

return card;

}

/* =========================
URL LOAD FIX (IMPORTANT)
========================= */

function openPropertyFromURL(properties) {
const slug = getPropertySlug();
if (!slug) return;

const found = findPropertyBySlug(properties, slug);  
if (!found) return;  

setTimeout(() => {  
    const card = document.querySelector(  
        `.property-card[data-id="${found.id}"]`  
    );  

    if (!card) return;  

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });  
    card.classList.add('highlighted-property');  

    setTimeout(() => {  
        card.classList.remove('highlighted-property');  
    }, 3000);  

}, 500);

}

/* =========================
SEO CONTENT (HIDDEN SAFE MODE)
========================= */

function updateSEOContent(properties) {
let seoSection = document.getElementById('seo-property-content');

if (!seoSection) {  
    seoSection = document.createElement('section');  
    seoSection.id = 'seo-property-content';  
    seoSection.style.display = 'none'; // 🔥 IMPORTANT FIX  

    seoSection.innerHTML = `  
        <h2>Real Estate Uganda</h2>  
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
SCHEMA
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
            : [];  

        const url = `https://noahkiweewa.com/property/${generateSlug(p)}`;  

        return {  
            "@type": "ListItem",  
            "position": index + 1,  
            "item": {  
                "@type": "Residence",  
                "name": generateSEOTitle(p),  
                "description": p.description || "",  
                "identifier": String(p.id),  
                "image": images,  
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
UTIL
========================= */

function escapeText(value) {
return String(value || '')
.replace(/&/g, '&')
.replace(/</g, '<')
.replace(/>/g, '>')
.replace(/"/g, '"')
.replace(/'/g, ''');
}

/* =========================
SLIDER
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

/* =========================
SLIDE CONTROL
========================= */

window.changeSlide = function(id, dir) {
const card = document.querySelector(
.property-card[data-id="${CSS.escape(String(id))}"]
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
const link = https://noahkiweewa.com/property/${generateSlug({id, type, location})};

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
   
