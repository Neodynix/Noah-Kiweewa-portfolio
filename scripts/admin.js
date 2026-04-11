// admin.js
import * as auth from './auth.js';
import * as props from './properties.js';

let currentEditId = null;
let selectedFiles = [];

const elements = {
    loginScreen: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard'),
    adminEmail: document.getElementById('admin-email'),
    loginError: document.getElementById('login-error'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    propertyForm: document.getElementById('property-form'),
    imagePreview: document.getElementById('image-preview'),
    tableBody: document.getElementById('table-body'),
    imagesInput: document.getElementById('images')
};

document.addEventListener('DOMContentLoaded', () => {
    // Auth state listener
    auth.onAuthChange((event, session) => {
        if (session) {
            elements.loginScreen.classList.add('hidden');
            elements.dashboard.classList.remove('hidden');
            elements.adminEmail.textContent = session.user.email;
            loadProperties();
        } else {
            elements.loginScreen.classList.remove('hidden');
            elements.dashboard.classList.add('hidden');
        }
    });

    // Form submit handler
    elements.propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            title: document.getElementById('title').value.trim(),
            location: document.getElementById('location').value.trim(),
            price: document.getElementById('price').value.trim(),
            type: document.getElementById('type').value,
            description: document.getElementById('description').value.trim(),
            is_sold: document.getElementById('is_sold').checked
        };

        // Basic validation
        if (!formData.title || !formData.location || !formData.price) {
            showError('Please fill in all required fields.');
            return;
        }

        try {
            let imageUrls = [];

            if (selectedFiles.length > 0) {
                imageUrls = await props.uploadImages(selectedFiles);
            }

            if (imageUrls.length > 0) {
                formData.images = imageUrls;
            }

            if (currentEditId) {
                await props.updateProperty(currentEditId, formData);
                showSuccess('Property updated successfully!');
            } else {
                await props.addProperty(formData);
                showSuccess('Property added successfully!');
            }

            hideModal();
            await loadProperties();

        } catch (err) {
            console.error(err);
            showError('Failed to save property: ' + err.message);
        }
    });

    // Image preview
    elements.imagesInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);

        elements.imagePreview.innerHTML = '';

        selectedFiles.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxHeight = '80px';
            img.style.margin = '5px';
            elements.imagePreview.appendChild(img);
        });
    });
});

// ======================
// Global UI Functions
// ======================

window.login = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = elements.loginError;

    errorEl.textContent = '';

    if (!email || !password) {
        errorEl.textContent = 'Please enter email and password';
        return;
    }

    const error = await auth.login(email, password);
    if (error) {
        errorEl.textContent = error.message || 'Login failed. Please try again.';
    }
};

window.logout = () => {
    auth.logout();
};

window.showAddModal = () => {
    currentEditId = null;
    elements.modalTitle.textContent = 'Add New Property';
    elements.propertyForm.reset();
    elements.imagePreview.innerHTML = '';
    selectedFiles = [];
    elements.modal.classList.remove('hidden');
};

window.editProperty = async (id) => {
    try {
        const properties = await props.getAllProperties();
        const property = properties.find(p => p.id === id);

        if (!property) {
            showError('Property not found');
            return;
        }

        currentEditId = id;
        elements.modalTitle.textContent = 'Edit Property';

        // Fill form
        document.getElementById('title').value = property.title || '';
        document.getElementById('location').value = property.location || '';
        document.getElementById('price').value = property.price || '';
        document.getElementById('type').value = property.type || 'residential';
        document.getElementById('description').value = property.description || '';
        document.getElementById('is_sold').checked = property.is_sold || false;

        // Clear previous preview and files
        elements.imagePreview.innerHTML = '';
        selectedFiles = [];

        // Show existing images if any
        if (property.images && property.images.length > 0) {
            property.images.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.style.maxHeight = '80px';
                img.style.margin = '5px';
                elements.imagePreview.appendChild(img);
            });
        }

        elements.modal.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        showError('Failed to load property for editing');
    }
};

window.hideModal = () => {
    elements.modal.classList.add('hidden');
    currentEditId = null;
    selectedFiles = [];
};

window.deleteProperty = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this property?')) {
        return;
    }

    try {
        await props.deleteProperty(id);
        showSuccess('Property deleted successfully');
        await loadProperties();
    } catch (err) {
        showError('Failed to delete property: ' + err.message);
    }
};

window.toggleSold = async (id, currentSold) => {
    try {
        await props.toggleSold(id, !currentSold);
        await loadProperties();
    } catch (err) {
        showError('Failed to update sold status');
    }
};

// ======================
// Helper Functions
// ======================

async function loadProperties() {
    try {
        const data = await props.getAllProperties();

        elements.tableBody.innerHTML = data.map(p => `
            <tr>
                <td>${escapeHtml(p.title)}</td>
                <td>${escapeHtml(p.location)}</td>
                <td>${escapeHtml(p.price)}</td>
                <td>${escapeHtml(p.type)}</td>
                <td>${p.is_sold ? '✅ Sold' : 'Available'}</td>
                <td>${p.images ? p.images.length : 0} image(s)</td>
                <td class="action-buttons">
                    <button onclick="editProperty('${p.id}')" class="edit-btn">Edit</button>
                    <button onclick="toggleSold('${p.id}', ${p.is_sold})" class="sold-btn">
                        ${p.is_sold ? 'Mark Available' : 'Mark Sold'}
                    </button>
                    <button onclick="deleteProperty('${p.id}')" class="delete-btn">Delete</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
        showError('Failed to load properties');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.margin = '10px 0';
    
    // Auto remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
    
    // Add to modal or dashboard depending on context
    if (!elements.modal.classList.contains('hidden')) {
        elements.modal.querySelector('.modal-content').appendChild(errorDiv);
    } else {
        document.querySelector('.dashboard-content').prepend(errorDiv);
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.color = 'green';
    successDiv.style.margin = '10px 0';
    
    setTimeout(() => successDiv.remove(), 4000);
    
    if (!elements.modal.classList.contains('hidden')) {
        elements.modal.querySelector('.modal-content').appendChild(successDiv);
    } else {
        document.querySelector('.dashboard-content').prepend(successDiv);
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}