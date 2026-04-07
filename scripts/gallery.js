// js/gallery.js
const allProperties = [
    {
        id: 1,
        title: "Luxury 5-Bedroom Villa",
        location: "Kololo, Kampala",
        price: "UGX 1,850,000,000",
        type: "residential",
        image: "https://picsum.photos/id/1015/600/400",
        description: "Stunning modern villa with private swimming pool, manicured gardens, and breathtaking city views.",
        listingDate: "March 2026"
    },
    {
        id: 2,
        title: "Prime Commercial Land",
        location: "Entebbe Road",
        price: "UGX 950,000,000",
        type: "land",
        image: "https://picsum.photos/id/201/600/400",
        description: "2.5 acres of prime land ideal for hotel, shopping center or office development.",
        listingDate: "February 2026"
    },
    {
        id: 3,
        title: "Modern 3-Bed Apartment",
        location: "Naguru, Kampala",
        price: "UGX 420,000,000",
        type: "apartment",
        image: "https://picsum.photos/id/133/600/400",
        description: "Spacious apartment in a secure gated community with gym, parking, and rooftop terrace.",
        listingDate: "April 2026"
    },
    {
        id: 4,
        title: "4-Storey Commercial Building",
        location: "Kampala Road",
        price: "UGX 2,300,000,000",
        type: "commercial",
        image: "https://picsum.photos/id/180/600/400",
        description: "Prime commercial building with ground floor retail and upper floors ideal for offices.",
        listingDate: "January 2026"
    },
    {
        id: 5,
        title: "Waterfront Residential Plot",
        location: "Lake Victoria, Entebbe",
        price: "UGX 680,000,000",
        type: "land",
        image: "https://picsum.photos/id/251/600/400",
        description: "Beautiful 1.2 acre plot with direct lake access. Perfect for luxury home construction.",
        listingDate: "March 2026"
    },
    {
        id: 6,
        title: "Executive 4-Bedroom Home",
        location: "Muyenga, Kampala",
        price: "UGX 980,000,000",
        type: "residential",
        image: "https://picsum.photos/id/870/600/400",
        description: "Elegant family home with large compound, modern kitchen and servant quarters.",
        listingDate: "April 2026"
    }
];

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = `property-card`;
    card.setAttribute('data-type', property.type);
    
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
            <p class="listing-date"><i class="fas fa-clock"></i> Listed: ${property.listingDate}</p>
            <button class="order-btn" onclick="orderViaWhatsApp(\( {property.id}, ' \){property.title.replace(/'/g, "\\'")}')">
                <i class="fab fa-whatsapp"></i> Inquire via WhatsApp
            </button>
        </div>
    `;
    return card;
}

function orderViaWhatsApp(id, title) {
    const message = encodeURIComponent(
        `Hi Noah,\n\n` +
        `I'm interested in this property from your gallery:\n\n` +
        `*${title}*\n` +
        `Property ID: #${id}\n\n` +
        `Please send me more photos, details, and available viewing times.\n\nThank you!`
    );
    window.open(`https://wa.me/256772492207?text=${message}`, '_blank');
}

// Filter functionality
function filterProperties(filter) {
    const cards = document.querySelectorAll('.property-card');
    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            card.style.display = card.getAttribute('data-type') === filter ? 'block' : 'none';
        }
    });
}

// Initialize Gallery
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('properties-grid');
    
    // Populate all properties
    allProperties.forEach(property => {
        grid.appendChild(createPropertyCard(property));
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            filterProperties(filterValue);
        });
    });
});

