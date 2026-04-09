// js/auth.js
const supabase = Supabase.createClient(
    'https://hitmllkcwlzwdlmodwbd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0'
);

export async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
}

export async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
}

export function getCurrentUser() {
    return supabase.auth.getUser();
}

export function onAuthChange(callback) {
    supabase.auth.onAuthStateChange(callback);
}

