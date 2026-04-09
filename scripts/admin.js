// js/admin.js
import * as auth from './auth.js';
import * as props from './properties.js';

let currentEditId = null;
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthChange((event, session) => {
        if (session) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('admin-email').textContent = session.user.email;
            loadProperties();
        } else {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }
    });

    // Form submit
    document.getElementById('property-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('title').value,
            location: document.getElementById('location').value,
            price: document.getElementById('price').value,
            type: document.getElementById('type').value,
            description: document.getElementById('description').value,
            is_sold: document.getElementById('is_sold').checked
        };

        try {
            if (selectedFiles.length > 0) {
                const imageUrls = await props.uploadImages(selectedFiles);
                formData.images = imageUrls;
            }

            if (currentEditId) {
                await props.updateProperty(currentEditId, formData);
            } else {
                await props.addProperty(formData);
            }

            hideModal();
            loadProperties();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });

    // Image preview
    document.getElementById('images').addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        selectedFiles.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        });
    });
});

window.login = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    const err = await auth.login(email, password);
    if (err) errorEl.textContent = err.message;
};

window.logout = auth.logout;

window.showAddModal = () => {
    currentEditId = null;
    document.getElementById('modal-title').textContent = 'Add New Property';
    document.getElementById('property-form').reset();
    document.getElementById('image-preview').innerHTML = '';
    selectedFiles = [];
    document.getElementById('modal').classList.remove('hidden');
};

window.hideModal = () => {
    document.getElementById('modal').classList.add('hidden');
    currentEditId = null;
};

window.editProperty = async (id) => {
    // Fetch single property and prefill form (add this logic if needed)
    // For brevity, you can expand later
    alert('Edit functionality ready – extend as needed');
};

window.deleteProperty = async (id) => {
    if (confirm('Delete this property permanently?')) {
        await props.deleteProperty(id);
        loadProperties();
    }
};

window.toggleSold = async (id, isSold) => {
    await props.toggleSold(id, !isSold);
    loadProperties();
};

async function loadProperties() {
    const data = await props.getAllProperties();
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = data.map(p => `
        <tr>
            <td>${p.title}</td>
            <td>${p.location}</td>
            <td>${p.price}</td>
            <td>${p.type}</td>
            <td>${p.is_sold ? '✅' : 'No'}</td>
            <td>${p.images.length} images</td>
            <td>
                <button onclick="editProperty('${p.id}')">Edit</button>
                <button onclick="deleteProperty('${p.id}')">Delete</button>
                <button onclick="toggleSold('${p.id}', \( {p.is_sold})"> \){p.is_sold ? 'Mark Available' : 'Mark Sold'}</button>
            </td>
        </tr>
    `).join('');
}