// Personnel Management Integration Script
// File: js/personnel.js

class PersonnelManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 15;
        this.searchQuery = '';
        this.init();
    }

    async init() {
        await this.loadPersonnel();
        this.setupEventListeners();
    }

    async loadPersonnel(page = 1) {
        try {
            this.showLoading(true);

            const params = {
                page: page,
                per_page: this.perPage,
                search: this.searchQuery
            };

            const response = await api.getPersonnel(params);

            if (response.success) {
                this.displayPersonnel(response.data);
                this.updatePagination(response.data);
            }
        } catch (error) {
            this.showError('Failed to load personnel: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayPersonnel(data) {
        const tbody = document.getElementById('personnelTableBody');
        if (!tbody) return;

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No personnel found</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(person => `
            <tr>
                <td>${escapeHtml(person.full_name)}</td>
                <td>${escapeHtml(person.position)}</td>
                <td>${escapeHtml(person.employee_id || '-')}</td>
                <td>${person.company ? escapeHtml(person.company.company_name) : '-'}</td>
                <td>
                    <span class="badge badge-${person.certificates?.length > 0 ? 'success' : 'secondary'}">
                        ${person.certificates?.length || 0} Certificates
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="personnelManager.viewDetails('${escapeHtml(person.id)}')">
                        View
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="personnelManager.editPersonnel('${escapeHtml(person.id)}')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="personnelManager.deletePersonnel('${escapeHtml(person.id)}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchPersonnel');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.loadPersonnel(1);
                }, 500);
            });
        }

        // Add Personnel Button
        const addBtn = document.getElementById('addPersonnelBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Submit Personnel Form
        const personnelForm = document.getElementById('personnelForm');
        if (personnelForm) {
            personnelForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonnel();
            });
        }
    }

    showAddModal() {
        const modal = document.getElementById('personnelModal');
        const form = document.getElementById('personnelForm');

        if (form) form.reset();
        if (modal) modal.style.display = 'block';

        this.editingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Personnel';
    }

    async editPersonnel(id) {
        try {
            const response = await api.getPersonnelById(id);

            if (response.success) {
                this.fillFormWithData(response.data);
                this.editingId = id;
                document.getElementById('modalTitle').textContent = 'Edit Personnel';
                document.getElementById('personnelModal').style.display = 'block';
            }
        } catch (error) {
            this.showError('Failed to load personnel data: ' + error.message);
        }
    }

    fillFormWithData(data) {
        document.getElementById('full_name').value = data.full_name;
        document.getElementById('position').value = data.position;
        document.getElementById('employee_id').value = data.employee_id || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('date_of_birth').value = data.date_of_birth || '';
        document.getElementById('nationality').value = data.nationality || 'Indonesia';

        if (data.company_id) {
            document.getElementById('company_id').value = data.company_id;
        }
    }

    async savePersonnel() {
        try {
            const formData = {
                company_id: document.getElementById('company_id').value,
                full_name: document.getElementById('full_name').value,
                position: document.getElementById('position').value,
                employee_id: document.getElementById('employee_id').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                date_of_birth: document.getElementById('date_of_birth').value,
                nationality: document.getElementById('nationality').value
            };

            let response;
            if (this.editingId) {
                response = await api.updatePersonnel(this.editingId, formData);
            } else {
                response = await api.createPersonnel(formData);
            }

            if (response.success) {
                this.showSuccess(this.editingId ? 'Personnel updated successfully' : 'Personnel added successfully');
                this.closeModal();
                await this.loadPersonnel(this.currentPage);
            }
        } catch (error) {
            this.showError('Failed to save personnel: ' + error.message);
        }
    }

    async deletePersonnel(id) {
        if (!confirm('Are you sure you want to delete this personnel?')) {
            return;
        }

        try {
            const response = await api.deletePersonnel(id);

            if (response.success) {
                this.showSuccess('Personnel deleted successfully');
                await this.loadPersonnel(this.currentPage);
            }
        } catch (error) {
            this.showError('Failed to delete personnel: ' + error.message);
        }
    }

    async viewDetails(id) {
        window.location.href = `personnel-detail.html?id=${id}`;
    }

    closeModal() {
        const modal = document.getElementById('personnelModal');
        if (modal) modal.style.display = 'none';
    }

    updatePagination(data) {
        this.currentPage = data.current_page;

        const paginationEl = document.getElementById('pagination');
        if (!paginationEl) return;

        let html = '';

        // Previous button
        if (data.prev_page_url) {
            html += `<button class="btn-page" onclick="personnelManager.loadPersonnel(${data.current_page - 1})">Previous</button>`;
        }

        // Page numbers
        html += `<span class="page-info">Page ${data.current_page} of ${data.last_page}</span>`;

        // Next button
        if (data.next_page_url) {
            html += `<button class="btn-page" onclick="personnelManager.loadPersonnel(${data.current_page + 1})">Next</button>`;
        }

        paginationEl.innerHTML = html;
    }

    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    showSuccess(message) {
        alert(message); // Replace with toast notification
    }

    showError(message) {
        alert('Error: ' + message); // Replace with toast notification
    }
}

// Initialize
let personnelManager;
document.addEventListener('DOMContentLoaded', () => {
    personnelManager = new PersonnelManager();
});
