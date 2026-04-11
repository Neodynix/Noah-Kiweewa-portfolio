// scripts/auth.js
const { createClient } = supabase;

// Supabase configuration - Replace with your actual keys
const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';   // ←←← CHANGE THIS TO YOUR REAL ANON KEY

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function login(email, password) {
    try {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return error;
        }
        return null; // success
    } catch (err) {
        console.error('Login error:', err);
        return { message: 'An unexpected error occurred during login.' };
    }
}

export async function logout() {
    try {
        await supabaseClient.auth.signOut();
        // The onAuthChange listener in admin.js will handle UI update + reload
    } catch (err) {
        console.error('Logout error:', err);
    }
}

export function onAuthChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

export function getCurrentUser() {
    return supabaseClient.auth.getUser();
}

// Optional: Get current session
export async function getCurrentSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
}