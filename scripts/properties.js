import { supabase } from './auth.js';

const BUCKET = 'property-images';

export async function uploadImages(files) {
    const urls = [];
    for (const file of files) {
        // FIXED: Corrected template literal syntax
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        urls.push(data.publicUrl);
    }
    return urls;
}

export async function getAllProperties() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

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