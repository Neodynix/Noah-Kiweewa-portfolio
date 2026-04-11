// scripts/properties.js
const { createClient } = supabase;

// Supabase configuration - Replace with your actual keys
const SUPABASE_URL = 'https://hitmllkcwlzwdlmodwbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0';   // ←←← CHANGE THIS TO YOUR REAL ANON KEY

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = 'property-images';

// ======================
// Image Upload
// ======================
export async function uploadImages(files) {
    if (!files || files.length === 0) return [];

    const urls = [];

    for (const file of files) {
        try {
            const fileName = `\( {Date.now()}- \){Math.random().toString(36).substring(2)}-${file.name}`;

            const { error: uploadError } = await supabaseClient.storage
                .from(BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseClient.storage
                .from(BUCKET)
                .getPublicUrl(fileName);

            urls.push(urlData.publicUrl);
        } catch (err) {
            console.error('Image upload failed:', err);
            throw new Error(`Failed to upload image: ${file.name}`);
        }
    }

    return urls;
}

// ======================
// CRUD Operations
// ======================
export async function addProperty(property) {
    const { error } = await supabaseClient
        .from('properties')
        .insert([property]);

    if (error) {
        console.error('Add property error:', error);
        throw error;
    }
}

export async function updateProperty(id, property) {
    const { error } = await supabaseClient
        .from('properties')
        .update(property)
        .eq('id', id);

    if (error) {
        console.error('Update property error:', error);
        throw error;
    }
}

export async function deleteProperty(id) {
    const { error } = await supabaseClient
        .from('properties')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete property error:', error);
        throw error;
    }
}

export async function getAllProperties() {
    const { data, error } = await supabaseClient
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Get properties error:', error);
        throw error;
    }

    return data || [];
}

export async function toggleSold(id, isSold) {
    const { error } = await supabaseClient
        .from('properties')
        .update({ is_sold: isSold })
        .eq('id', id);

    if (error) {
        console.error('Toggle sold error:', error);
        throw error;
    }
}