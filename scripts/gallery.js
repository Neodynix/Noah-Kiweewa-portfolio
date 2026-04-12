// scripts/gallery.js - DEBUG MODE (FULL TRACE)

const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';

let supabase;
let allProperties = [];
let sliderIntervals = [];

/**
 * LOGGING SYSTEM
 */
function log(msg, type = "info") {
    const style = {
        info: "color:#3498db",
        success: "color:#2ecc71",
        warn: "color:#f1c40f",
        error: "color:#e74c3c"
    };
    console.log(`%c[Gallery DEBUG] ${msg}`, style[type]);
}

/**
 * INIT
 */
async function initGallery() {
    log("Starting gallery initialization...");

    const grid = document.getElementById('properties-grid');

    if (!grid) {
        log("❌ properties-grid NOT FOUND in HTML", "error");
        return;
    }

    grid.innerHTML = "Loading gallery...";

    // 1. Check Supabase CDN
    log("Checking Supabase library...");

    let attempts = 0;
    while (!window.supabase && attempts < 30) {
        await new Promise(res => setTimeout(res, 200));
        attempts++;
    }

    if (!window.supabase) {
        log("❌ Supabase library FAILED to load", "error");
        grid.innerHTML = "Supabase library not loaded (CDN issue)";
        return;
    }

    log("✔ Supabase library loaded", "success");

    // 2. Create client
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        log("✔ Supabase client created", "success");
    } catch (e) {
        log("❌ Supabase client error: " + e.message, "error");
        grid.innerHTML = "Supabase client creation failed";
        return;
    }

    // 3. Test connection FIRST
    log("Testing database connection...");

    try {
        const test = await supabase.from('properties').select('count', { count: 'exact', head: true });

        log("Connection test response received", "success");
        console.log("Test response:", test);

        if (test.error) {
            log("❌ Supabase ERROR: " + test.error.message, "error");
        }

    } catch (err) {
        log("❌ Connection FAILED: " + err.message, "error");
    }

    // 4. Fetch real data
    log("Fetching properties...");

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        console.log("Raw data:", data);
        console.log("Raw error:", error);

        if (error) {
            log("❌ DATABASE ERROR: " + error.message, "error");
            grid.innerHTML = "Database error: " + error.message;
            return;
        }

        if (!data || data.length === 0) {
            log("⚠ No properties returned (EMPTY TABLE or RLS issue)", "warn");
            grid.innerHTML = "No properties found. Check RLS or table data.";
            return;
        }

        allProperties = data;
        log(`✔ Loaded ${data.length} properties`, "success");

        renderProperties(allProperties);

    } catch (err) {
        log("❌ FETCH FAILED: " + err.message, "error");
        grid.innerHTML = "Fetch failed: " + err.message;
    }

    // 5. Filters debug
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            log("Filter clicked: " + btn.dataset.filter);

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.getAttribute('data-filter');
            const filtered = type === 'all'
                ? allProperties
                : allProperties.filter(p => p.type === type);

            log(`Filtered results: ${filtered.length}`);
            renderProperties(filtered);
        });
    });
}

/**
 * RENDER
 */
function renderProperties(properties) {
    const grid = document.getElementById('properties-grid');

    if (!grid) {
        log("❌ Grid missing during render", "error");
        return;
    }

    grid.innerHTML = "";
    log(`Rendering ${properties.length} cards...`);

    sliderIntervals.forEach(clearInterval);
    sliderIntervals = [];

    properties.forEach((p, i) => {
        try {
            const card = createPropertyCard(p);
            grid.appendChild(card);
        } catch (e) {
            log(`Card render failed at index ${i}: ${e.message}`, "error");
        }
    });

    initSliders();
}

/**
 * CARD CREATION
 */
function createPropertyCard(p) {

    if (!p) {
        log("Null property object", "error");
        return document.createElement('div');
    }

    let imgs = [];

    if (Array.isArray(p.images)) {
        imgs = p.images;
    } else if (typeof p.images === 'string') {
        imgs = [p.images];
    } else {
        imgs = ["https://via.placeholder.com/600x400?text=No+Image"];
        log(`Property ${p.id} has NO images`, "warn");
    }

    const card = document.createElement('div');
    card.className = "property-card";
    card.dataset.id = p.id;

    card.innerHTML = `
        <div class="property-image-container" data-type="${p.type || 'unknown'}">
            <div class="slides-wrapper">
                ${imgs.map((img, i) => `
                    <div class="slide ${i === 0 ? 'active' : ''}" 
                         style="background-image:url('${img}')"></div>
                `).join('')}
            </div>
        </div>

        <div class="property-info">
            <h3>${p.title || "No Title"}</h3>
            <div>${p.location || "No location"}</div>
            <div>${p.price || "No price"}</div>
        </div>
    `;

    return card;
}

/**
 * SLIDER ENGINE
 */
function initSliders() {
    log("Initializing sliders...");

    document.querySelectorAll('.property-card').forEach(card => {
        const slides = card.querySelectorAll('.slide');

        if (slides.length <= 1) return;

        const id = card.dataset.id;

        sliderIntervals.push(setInterval(() => {
            changeSlide(id, 1);
        }, 4000));
    });
}

/**
 * SLIDE SWITCH
 */
window.changeSlide = function(id, dir) {
    const card = document.querySelector(`.property-card[data-id="${id}"]`);
    if (!card) {
        log("Slide change failed: card not found", "error");
        return;
    }

    const slides = card.querySelectorAll('.slide');
    let idx = [...slides].findIndex(s => s.classList.contains('active'));

    slides[idx].classList.remove('active');

    idx = (idx + dir + slides.length) % slides.length;

    slides[idx].classList.add('active');
};

/**
 * WHATSAPP DEBUG
 */
window.orderViaWhatsApp = function(id, title) {
    log(`WhatsApp clicked: ${title}`);
    alert(`WhatsApp debug: ${title}`);
};

/**
 * START
 */
document.addEventListener('DOMContentLoaded', () => {
    log("DOM loaded");
    initGallery();
});
