// scripts/galley-api.js - Data Fetching & Supabase Logic
const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';

let supabaseClient;
let allProperties = [];

async function initGallery() {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading-state">Loading Premium Properties...</div>';

    // Initialize Supabase Client
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        const { data, error } = await supabaseClient
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        allProperties = data || [];

        if (allProperties.length === 0) {
            grid.innerHTML = '<p class="empty-msg">No properties found.</p>';
            return;
        }

        renderProperties(allProperties);
    } catch (err) {
        grid.innerHTML = `<p class="error-msg">Connection Error: ${err.message}</p>`;
    }

    setupFilters();
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter.toLowerCase();
            const filtered = filter === 'all' 
                ? allProperties 
                : allProperties.filter(p => p.type?.toLowerCase() === filter);
            
            renderProperties(filtered);
        });
    });
}

document.addEventListener('DOMContentLoaded', initGallery);