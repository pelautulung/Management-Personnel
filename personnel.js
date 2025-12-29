/**
 * Personnel Management Module
 * Lokasi: frontend/js/personnel.js
 * Purpose: Personnel CRUD operations
 * Dependencies: api.js, common.js, auth.js
 */

class PersonnelManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 15;
        this.personnel = [];
        this.totalPersonnel = 0;
        this.isLoading = false;
    }

    async init() {
        try {
            console.log('[Personnel] Initializing...');
            AuthManager.requireAuth();
            
            this.setupEventListeners();
            await this.loadPersonnel();
            
            console.log('[Personnel] Initialized successfully');
        } catch (error) {
            console.error('[Personnel] Init error:', error);
            Toast.error('Failed to initialize personnel module');
        }
    }

    setupEventListeners() {
        // Add new button
        const addBtn = document.getElementById('add-personnel-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddDialog());
        }

        // Search input
        const searchInput = document.getElementById('personnel-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentPage = 1;
                this.loadPersonnel({ search: e.target.value });
            }, 300));
        }

        // Pagination
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
    }

    async loadPersonnel(filters = {}) {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...filters
            };

            const response = await api.getPersonnel(params);
            this.personnel = response.data || response || [];
            this.totalPersonnel = response.total || this.personnel.length;
            
            this.renderPersonnelList();
            this.updatePagination();
        } catch (error) {
            console.error('[Personnel] Load error:', error);
            Toast.error('Failed to load personnel');
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    renderPersonnelList() {
        const container = document.getElementById('personnel-list');
        if (!container) return;

        try {
            if (!this.personnel || this.personnel.length === 0) {
                container.innerHTML = '<p class="text-center text-muted">No personnel found</p>';
                return;
            }

            let html = '<table class="personnel-table"><thead><tr>';
            html += '<th>Name</th><th>Email</th><th>Position</th><th>Status</th><th>Actions</th>';
            html += '</tr></thead><tbody>';

            this.personnel.forEach(person => {
                const statusClass = person.status === 'active' ? 'badge-success' : 'badge-warning';
                html += `
                    <tr data-id="${person.id}">
                        <td>${this.escapeHtml(person.name || '')}</td>
                        <td>${this.escapeHtml(person.email || '')}</td>
                        <td>${this.escapeHtml(person.position || '')}</td>
                        <td><span class="badge ${statusClass}">${person.status || 'unknown'}</span></td>
                        <td>
                            <button class="btn-sm btn-edit" onclick="personnelManager.openEditDialog('${person.id}')">Edit</button>
                            <button class="btn-sm btn-delete" onclick="personnelManager.deletePersonnel('${person.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        } catch (error) {
            console.error('[Personnel] Render error:', error);
            container.innerHTML = '<p class="text-center text-danger">Error rendering personnel list</p>';
        }
    }

    async openAddDialog() {
        const formHtml = `
            <form id="personnel-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Position</label>
                    <input type="text" id="position" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="status" class="form-control">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save</button>
                    <button type="button" class="btn btn-secondary" onclick="personnelManager.closeDialog()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showDialog('Add Personnel', formHtml);
        
        const form = document.getElementById('personnel-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonnel(new FormData(form));
            });
        }
    }

    async openEditDialog(id) {
        try {
            const person = await api.getPersonnelById(id);
            
            const formHtml = `
                <form id="personnel-form">
                    <input type="hidden" id="id" value="${person.id}">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="name" class="form-control" value="${this.escapeHtml(person.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="email" class="form-control" value="${this.escapeHtml(person.email || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Position</label>
                        <input type="text" id="position" class="form-control" value="${this.escapeHtml(person.position || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="status" class="form-control">
                            <option value="active" ${person.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${person.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Update</button>
                        <button type="button" class="btn btn-secondary" onclick="personnelManager.closeDialog()">Cancel</button>
                    </div>
                </form>
            `;
            
            this.showDialog('Edit Personnel', formHtml);
            
            const form = document.getElementById('personnel-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.updatePersonnel(id, new FormData(form));
                });
            }
        } catch (error) {
            console.error('[Personnel] Edit dialog error:', error);
            Toast.error('Failed to load personnel details');
        }
    }

    async savePersonnel(formData) {
        try {
            const data = Object.fromEntries(formData);
            
            // Validation
            if (!Validator.required(data.name)) throw new Error('Name is required');
            if (!Validator.email(data.email)) throw new Error('Valid email is required');
            if (!Validator.required(data.position)) throw new Error('Position is required');

            Toast.info('Saving...');
            await api.createPersonnel(data);
            
            Toast.success('Personnel added successfully');
            this.closeDialog();
            await this.loadPersonnel();
        } catch (error) {
            console.error('[Personnel] Save error:', error);
            Toast.error(error.message || 'Failed to save personnel');
        }
    }

    async updatePersonnel(id, formData) {
        try {
            const data = Object.fromEntries(formData);
            delete data.id; // Remove ID from data
            
            // Validation
            if (!Validator.required(data.name)) throw new Error('Name is required');
            if (!Validator.email(data.email)) throw new Error('Valid email is required');
            if (!Validator.required(data.position)) throw new Error('Position is required');

            Toast.info('Updating...');
            await api.updatePersonnel(id, data);
            
            Toast.success('Personnel updated successfully');
            this.closeDialog();
            await this.loadPersonnel();
        } catch (error) {
            console.error('[Personnel] Update error:', error);
            Toast.error(error.message || 'Failed to update personnel');
        }
    }

    async deletePersonnel(id) {
        if (!confirm('Are you sure you want to delete this personnel?')) return;
        
        try {
            Toast.info('Deleting...');
            await api.deletePersonnel(id);
            
            Toast.success('Personnel deleted successfully');
            await this.loadPersonnel();
        } catch (error) {
            console.error('[Personnel] Delete error:', error);
            Toast.error('Failed to delete personnel');
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadPersonnel();
        }
    }

    nextPage() {
        const maxPages = Math.ceil(this.totalPersonnel / this.pageSize);
        if (this.currentPage < maxPages) {
            this.currentPage++;
            this.loadPersonnel();
        }
    }

    updatePagination() {
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            const maxPages = Math.ceil(this.totalPersonnel / this.pageSize);
            pageInfo.textContent = `Page ${this.currentPage} of ${maxPages || 1}`;
        }
    }

    showLoadingState() {
        const container = document.getElementById('personnel-list');
        if (container) container.innerHTML = '<div class="loading"></div> Loading personnel...';
    }

    showErrorState() {
        const container = document.getElementById('personnel-list');
        if (container) container.innerHTML = '<p class="text-center text-danger">Error loading personnel</p>';
    }

    showDialog(title, content) {
        let dialog = document.getElementById('personnel-dialog');
        if (!dialog) {
            dialog = document.createElement('div');
            dialog.id = 'personnel-dialog';
            dialog.className = 'modal';
            document.body.appendChild(dialog);
        }
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.escapeHtml(title)}</h2>
                    <button class="close" onclick="personnelManager.closeDialog()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        dialog.style.display = 'block';
    }

    closeDialog() {
        const dialog = document.getElementById('personnel-dialog');
        if (dialog) dialog.style.display = 'none';
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

let personnelManager = null;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('personnel-list')) {
        personnelManager = new PersonnelManager();
        personnelManager.init();
    }
});

if (typeof window !== 'undefined') {
    window.PersonnelManager = PersonnelManager;
    window.personnelManager = personnelManager;
}
