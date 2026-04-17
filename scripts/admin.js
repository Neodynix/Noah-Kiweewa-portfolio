import * as auth from './auth.js';
import * as props from './properties.js';

let currentEditId = null;
let selectedFiles = [];
let existingImages = [];

// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const loginForm = document.getElementById('login-form');
const propertyForm = document.getElementById('property-form');
const modal = document.getElementById('modal');
const imagePreview = document.getElementById('image-preview');
const contentBody = document.querySelector('.content-body');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const breadcrumbCurrent = document.querySelector('.breadcrumb span:last-child');

document.addEventListener('DOMContentLoaded', () => {

    // --- AUTHENTICATION ---
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

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await auth.login(email, password);
        } catch (err) {
            document.getElementById('login-error').textContent = "Invalid credentials";
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => auth.logout());

    // --- NAVIGATION ---
    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const pageName = link.textContent.trim();
            breadcrumbCurrent.textContent = pageName;

            if (pageName === "Analytics") {
                const list = await props.getAllProperties();
                renderInsights(list);
            } else if (pageName === "Inquiries") {
                renderLeadsInfo();
            } else {
                restorePropertiesView();
                loadData();
            }
        });
    });

    // --- SIDEBAR UI ---
    menuToggle?.addEventListener('click', () => sidebar.classList.add('active'));
    sidebarClose?.addEventListener('click', () => sidebar.classList.remove('active'));

    // --- FORM HANDLING ---
    propertyForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const saveBtn = document.getElementById('save-btn');
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const data = {
            title: document.getElementById('title').value,
            location: document.getElementById('location').value,
            price: document.getElementById('price').value,
            type: document.getElementById('type').value,
            description: document.getElementById('description').value,
            is_sold: document.getElementById('is_sold').checked,
        };

        try {
            if (selectedFiles.length > 0) {
                const newUrls = await props.uploadImages(selectedFiles);
                data.images = [...existingImages, ...newUrls];
            } else {
                data.images = existingImages;
            }

            if (currentEditId) {
                await props.updateProperty(currentEditId, data);
            } else {
                await props.addProperty(data);
            }

            hideModal();
            loadData();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    });

    // --- IMAGE PREVIEW LOGIC ---
    document.getElementById('images').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            selectedFiles.push(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('preview-item');
                wrapper.innerHTML = `
                    <img src="${ev.target.result}">
                    <button type="button" class="remove-btn">×</button>
                `;
                wrapper.querySelector('.remove-btn').onclick = () => {
                    selectedFiles = selectedFiles.filter(f => f !== file);
                    wrapper.remove();
                };
                imagePreview.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    });

    // --- GLOBAL CLICK ACTIONS (Icons fix) ---
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        // Modal Controls
        if (btn.id === 'open-add-modal') showModal();
        if (btn.id === 'close-modal' || btn.id === 'cancel-modal') hideModal();

        // Row Actions
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains('edit-action')) {
            startEdit(id);
        }

        if (btn.classList.contains('delete-action')) {
            if (confirm("Permanently delete this property?")) {
                await props.deleteProperty(id);
                loadData();
            }
        }

        if (btn.classList.contains('toggle-sold-action')) {
            const status = btn.dataset.status === 'true';
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            await props.updateProperty(id, { is_sold: !status });
            loadData();
        }
    });
});

// --- CORE FUNCTIONS ---

async function loadData() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    try {
        const list = await props.getAllProperties();
        tableBody.innerHTML = list.map(p => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-home" style="color:var(--primary)"></i>
                        <div>
                            <strong>${p.title}</strong><br>
                            <small style="color:#888"><i class="fas fa-map-marker-alt"></i> ${p.location}</small>
                        </div>
                    </div>
                </td>
                <td><strong>${p.price}</strong></td>
                <td><span class="badge" style="background:#eee">${p.type}</span></td>
                <td>
                    <span class="badge ${p.is_sold ? 'badge-sold' : 'badge-avail'}">
                        ${p.is_sold ? '<i class="fas fa-check-circle"></i> Sold' : '<i class="fas fa-clock"></i> Available'}
                    </span>
                </td>
                <td><i class="fas fa-images"></i> ${p.images ? p.images.length : 0}</td>
                <td style="max-width:200px; font-size:0.85rem; color:#666;">
                    ${p.description ? p.description.substring(0, 30) + '...' : '-'}
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon edit-action edit-btn" data-id="${p.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon toggle-sold-action sold-btn" data-id="${p.id}" data-status="${p.is_sold}" title="Mark Sold/Available">
                            <i class="fas fa-handshake"></i>
                        </button>
                        <button class="btn-icon delete-action delete-btn" data-id="${p.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load properties", err);
    }
}

async function startEdit(id) {
    const list = await props.getAllProperties();
    const p = list.find(x => x.id === id);
    if (!p) return;

    currentEditId = id;
    existingImages = p.images || [];

    document.getElementById('title').value = p.title;
    document.getElementById('location').value = p.location;
    document.getElementById('price').value = p.price;
    document.getElementById('type').value = p.type;
    document.getElementById('description').value = p.description || '';
    document.getElementById('is_sold').checked = p.is_sold;

    imagePreview.innerHTML = '';
    existingImages.forEach(url => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('preview-item');
        wrapper.innerHTML = `
            <img src="${url}">
            <button type="button" class="remove-btn">×</button>
        `;
        wrapper.querySelector('.remove-btn').onclick = async () => {
            if (confirm("Delete this image from server?")) {
                wrapper.remove();
                existingImages = existingImages.filter(i => i !== url);
                await props.deleteImageFromStorage(url);
                await props.updateProperty(currentEditId, { images: existingImages });
            }
        };
        imagePreview.appendChild(wrapper);
    });

    modal.classList.remove('hidden');
}

function renderInsights(properties) {
    const total = properties.length;
    const sold = properties.filter(p => p.is_sold).length;
    const available = total - sold;
    const categories = {};
    properties.forEach(p => categories[p.type] = (categories[p.type] || 0) + 1);

    contentBody.innerHTML = `
        <div class="insights-grid">
            <div class="insight-card">
                <h3><i class="fas fa-chart-pie"></i> Inventory</h3>
                <div class="insight-item"><span>Total</span> <strong>${total}</strong></div>
                <div class="insight-item"><span>Available</span> <strong style="color:var(--success)">${available}</strong></div>
                <div class="insight-item"><span>Sold</span> <strong style="color:var(--danger)">${sold}</strong></div>
            </div>
            <div class="insight-card">
                <h3><i class="fas fa-tags"></i> Categories</h3>
                ${Object.entries(categories).map(([k, v]) => `
                    <div class="insight-item"><span>${k}</span> <strong>${v}</strong></div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderLeadsInfo() {
    contentBody.innerHTML = `
        <div class="inquiry-card">
            <div style="text-align:center; margin-bottom:20px;">
                <i class="fas fa-user-tie" style="font-size:3rem; color:var(--primary)"></i>
                <h2>Lead Management</h2>
            </div>
            <div class="inquiry-step"><i class="fas fa-edit"></i> <p>Click <b>Edit</b> to add client names to the Description.</p></div>
            <div class="inquiry-step"><i class="fas fa-handshake"></i> <p>Use the <b>Handshake</b> icon to close deals quickly.</p></div>
        </div>
    `;
}

function restorePropertiesView() {
    contentBody.innerHTML = `
        <div class="table-header">
            <h2>Property Inventory</h2>
            <button id="open-add-modal" class="btn-primary"><i class="fas fa-plus"></i> Add Property</button>
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
                        <th>Description Snippet</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="table-body"></tbody>
            </table>
        </div>
    `;
}

function showModal() {
    currentEditId = null;
    existingImages = [];
    selectedFiles = [];
    propertyForm.reset();
    imagePreview.innerHTML = '';
    modal.classList.remove('hidden');
}

function hideModal() {
    modal.classList.add('hidden');
}