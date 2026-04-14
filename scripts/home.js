// scripts/home.js - Featured Properties using gallery system

const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';

// Use same global supabase
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    grid.innerHTML = `
        <p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#888;">
            Loading featured properties...
        </p>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('properties')
            .select('*')
            .eq('is_sold', false)
            .order('created_at', { ascending: false })
            .limit(3); // 👈 ONLY 3

        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = `
                <p style="grid-column: 1/-1; text-align:center; color:#666;">
                    No properties available.
                </p>
            `;
            return;
        }

        // 🔥 USE SAME RENDER SYSTEM AS GALLERY
        renderProperties(data);

    } catch (err) {
        console.error(err);
        grid.innerHTML = `
            <p style="grid-column: 1/-1; text-align:center; color:red;">
                Failed to load properties.
            </p>
        `;
    }
});