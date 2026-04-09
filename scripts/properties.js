// js/properties.js
const supabase = Supabase.createClient(
    'https://hitmllkcwlzwdlmodwbd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1sbGtjd2x6d2RsbW9kd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg2MjgsImV4cCI6MjA5MTMyNDYyOH0.T1EEuj1_m1zz33LYz27g82rjUk2U63XmKHpSiTmzwE0'
);

const BUCKET = 'property-images';

// Upload multiple images and return public URLs
export async function uploadImages(files) {
    const urls = [];
    for (const file of files) {
        const fileName = `\( {Date.now()}- \){file.name}`;
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, file, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        urls.push(publicUrl);
    }
    return urls;
}

// CRUD Functions
export async function addProperty(property) {
    const { error } = await supabase.from('properties').insert([property]);
    if (error) throw error;
}

export async function updateProperty(id, property) {
    const { error } = await supabase.from('properties').update(property).eq('id', id);
    if (error) throw error;
}

export async function deleteProperty(id) {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
}

export async function getAllProperties() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function toggleSold(id, isSold) {
    const { error } = await supabase
        .from('properties')
        .update({ is_sold: isSold })
        .eq('id', id);
    if (error) throw error;
}

