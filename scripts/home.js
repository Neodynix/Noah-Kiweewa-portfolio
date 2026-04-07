// js/home.js
const featuredProperties = [
    {
        id: 1,
        title: "Luxury 5-Bedroom Villa",
        location: "Kololo, Kampala",
        price: "UGX 1,850,000,000",
        type: "Residential",
        image: "https://picsum.photos/id/1015/600/400",
        description: "Stunning modern villa with swimming pool, garden, and panoramic city views. Perfect for families or high-end living.",
        listingDate: "March 2026"
    },
    {
        id: 2,
        title: "Prime Commercial Land",
        location: "Entebbe Road",
        price: "UGX 950,000,000",
        type: "Land",
        image: "https://picsum.photos/id/201/600/400",
        description: "2.5 acres of prime commercial land ideal for hotel, shopping mall or office complex development.",
        listingDate: "February 2026"
    },
    {
        id: 3,
        title: "Modern 3-Bed Apartment",
        location: "Naguru, Kampala",
        price: "UGX 420,000,000",
        type: "Apartment",
        image: "https://picsum.photos/id/133/600/400",
        description: "Spacious apartment in a gated community with gym, parking, and 24/7 security.",
        listingDate: "April 2026"
    }
];

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    
    card.innerHTML = `
        <div class="property-image" style="background-image: url('\( {property.image}')" data-type=" \){property.type}">
        </div>
        <div class="property-info">
            <h3>${property.title}</h3>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i> ${property.location}
            </div>
            <div class="price">${property.price}</div>
            <p class="description">${property.description}</p>
            <button class="order-btn" onclick="orderViaWhatsApp(\( {property.id}, ' \){property.title}')">
                <i class="fab fa-whatsapp"></i> Order via WhatsApp
            </button>
        </div>
    `;
    return card;
}

function orderViaWhatsApp(id, title) {
    const message = encodeURIComponent(
        `Hi Noah,\n\nI'm interested in this property from your website:\n\n` +
        `*${title}*\n` +
        `Property ID: #${id}\n\n` +
        `Please send me more details and viewing schedule.\n\n` +
        `Thank you!`
    );
    window.open(`https://wa.me/256772492207?text=${message}`, '_blank');
}

// Populate featured properties
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('featured-grid');
    if (grid) {
        featuredProperties.forEach(property => {
            grid.appendChild(createPropertyCard(property));
        });
    }
});