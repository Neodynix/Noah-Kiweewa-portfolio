import * as auth from './auth.js';
import * as props from './properties.js';

let currentEditId = null;
let selectedFiles = [];

// --- DOM Elements ---
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const loginForm = document.getElementById('login-form');
const propertyForm = document.getElementById('property-form');
const modal = document.getElementById('modal');
const imagePreview = document.getElementById('image-preview');
const tableBody = document.getElementById('table-body');
const contentBody = document.querySelector('.content-body');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const breadcrumbCurrent = document.querySelector('.breadcrumb span:last-child');

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. AUTHENTICATION MONITOR
    auth.onAuthChange((event, session) => {
        if (session) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('admin-email').textContent = session.user.email;
            loadData();
        } else {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }
    });

    // 2. LOGIN HANDLER
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            
            try {
                await auth.login(email, password);
            } catch (err) {
                errorDiv.textContent = "Invalid administrator credentials.";
            }
        });
    }

    // 3. LOGOUT HANDLER
    document.getElementById('logout-btn').addEventListener('click', () => auth.logout());

    // 4. NAVIGATION & AESTHETIC SWITCHER
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // UI State: Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update Breadcrumb
            const pageName = link.textContent.trim();
            breadcrumbCurrent.textContent = pageName;

            if (link.classList.contains('inactive-feature')) {
                // Load the "Aesthetic Purpose" View
                renderAestheticNotice(pageName);
            } else {
                // Restore Properties View
                restorePropertiesView();
                loadData();
            }

            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // 5. SIDEBAR TOGGLES
    if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
    if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

    // 6. PROPERTY FORM SUBMISSION
    if (propertyForm) {
        propertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('save-btn');
            const originalText = saveBtn.textContent;
            
            saveBtn.disabled = true;
            saveBtn.textContent = "Uploading...";

            const data = {
                title: document.getElementById('title').value,
                location: document.getElementById('location').value,
                price: document.getElementById('price').value,
                type: document.getElementById('type').value,
                description: document.getElementById('description').value,
                is_sold: document.getElementById('is_sold').checked
            };

            try {
                if (selectedFiles.length > 0) {
                    data.images = await props.uploadImages(selectedFiles);
                }

                if (currentEditId) {
                    await props.updateProperty(currentEditId, data);
                } else {
                    await props.addProperty(data);
                }

                hideModal();
                loadData();
            } catch (err) {
                alert("Database Error: " + err.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }
        });
    }

    // 7. IMAGE PREVIEW LOGIC
    document.getElementById('images').addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        imagePreview.innerHTML = '';
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = document.createElement('img');
                img.src = ev.target.result;
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // 8. DYNAMIC TABLE ACTIONS (Edit/Delete/Toggle)
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.id === 'open-add-modal') showModal();
        if (btn.id === 'close-modal' || btn.id === 'cancel-modal') hideModal();

        const id = btn.dataset.id;
        if (btn.classList.contains('edit-action')) startEdit(id);
        if (btn.classList.contains('delete-action')) confirmDelete(id);
        
        if (btn.classList.contains('toggle-sold-action')) {
            const status = btn.dataset.status === 'true';
            await props.updateProperty(id, { is_sold: !status });
            loadData();
        }
    });
});

/**
 * UI RENDERING FUNCTIONS
 */

async function loadData() {
    // Only fetch if the table body exists (prevents errors in aesthetic view)
    const table = document.getElementById('table-body');
    if (!table) return;

    try {
        const list = await props.getAllProperties();
        table.innerHTML = list.map(p => `
            <tr>
                <td><strong>${p.title}</strong><br><small style="color:#888">${p.location}</small></td>
                <td>${p.price}</td>
                <td style="text-transform: capitalize;">${p.type}</td>
                <td><span class="badge ${p.is_sold ? 'badge-sold' : 'badge-avail'}">${p.is_sold ? 'Sold' : 'Available'}</span></td>
                <td><i class="fas fa-image"></i> ${p.images ? p.images.length : 0}</td>
                <td class="table-actions">
                    <button class="edit-action" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                    <button class="toggle-sold-action" data-id="${p.id}" data-status="${p.is_sold}">
                        <i class="fas ${p.is_sold ? 'fa-undo' : 'fa-check-circle'}"></i>
                    </button>
                    <button class="delete-action" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Data Load Error:", err);
    }
}

function renderAestheticNotice(featureName) {
    contentBody.innerHTML = `
        <div class="aesthetic-notice">
            <i class="fas fa-compass-drafting" style="font-size: 4rem; color: #c9a66b; margin-bottom: 25px; opacity: 0.8;"></i>
            <h2 style="font-size: 1.8rem; margin-bottom: 10px;">${featureName} Module</h2>
            <p style="max-width: 450px; line-height: 1.6; color: #666;">
                This interface was designed for <strong>aesthetic purposes</strong> to visualize the future scale of the Premiere administration system. Live data integration for this section is not yet active.
            </p>
            <button class="btn-primary" id="return-home" style="margin-top: 30px;">
                <i class="fas fa-arrow-left"></i> Back to Inventory
            </button>
        </div>
    `;
    
    document.getElementById('return-home').addEventListener('click', () => {
        window.location.reload();
    });
}

function restorePropertiesView() {
    contentBody.innerHTML = `
        <div class="table-header">
            <h2>Property Inventory</h2>
            <button id="open-add-modal" class="btn-primary">
                <i class="fas fa-plus"></i> Add Property
            </button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Property Details</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Images</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="table-body"></tbody>
            </table>
        </div>
    `;
}

/**
 * MODAL HELPERS
 */

async function startEdit(id) {
    const list = await props.getAllProperties();
    const p = list.find(x => x.id === id);
    if (!p) return;

    currentEditId = id;
    document.getElementById('modal-title').textContent = "Update Listing";
    document.getElementById('title').value = p.title;
    document.getElementById('location').value = p.location;
    document.getElementById('price').value = p.price;
    document.getElementById('type').value = p.type;
    document.getElementById('description').value = p.description || '';
    document.getElementById('is_sold').checked = p.is_sold;
    modal.classList.remove('hidden');
}

function confirmDelete(id) {
    if (confirm("Permanently delete this property from the Premiere database?")) {
        props.deleteProperty(id).then(() => loadData());
    }
}

function showModal() {
    currentEditId = null;
    propertyForm.reset();
    imagePreview.innerHTML = '';
    document.getElementById('modal-title').textContent = "New Property Listing";
    modal.classList.remove('hidden');
}

function hideModal() {
    modal.classList.add('hidden');
    selectedFiles = [];
}