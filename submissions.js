// Submission Management Integration Script
// File: js/submissions.js

class SubmissionManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 15;
        this.statusFilter = '';
        this.user = api.getCurrentUser();
        this.init();
    }

    async init() {
        await this.loadSubmissions();
        this.setupEventListeners();
        this.checkUserRole();
    }

    checkUserRole() {
        const createBtn = document.getElementById('createSubmissionBtn');
        const approveColumn = document.getElementById('approveColumn');

        // Only contractors can create submissions
        if (createBtn && this.user.role !== 'contractor') {
            createBtn.style.display = 'none';
        }

        // Only admins can approve/reject
        if (approveColumn && this.user.role === 'contractor') {
            approveColumn.style.display = 'none';
        }
    }

    async loadSubmissions(page = 1) {
        try {
            this.showLoading(true);

            const params = {
                page: page,
                per_page: this.perPage
            };

            if (this.statusFilter) {
                params.status = this.statusFilter;
            }

            const response = await api.getSubmissions(params);

            if (response.success) {
                this.displaySubmissions(response.data);
                this.updatePagination(response.data);
            }
        } catch (error) {
            this.showError('Failed to load submissions: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displaySubmissions(data) {
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) return;

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No submissions found</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(sub => {
            const statusClass = sub.status === 'approved' ? 'success' : 
                               sub.status === 'rejected' ? 'danger' : 'warning';

            return `
                <tr>
                    <td>${sub.personnel ? escapeHtml(sub.personnel.full_name) : '-'}</td>
                    <td>${escapeHtml(sub.submission_type)}</td>
                    <td>${this.formatDate(sub.submission_date)}</td>
                    <td><span class="badge badge-${statusClass}">${escapeHtml(sub.status)}</span></td>
                    <td>${escapeHtml(sub.review_notes || '-')}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="submissionManager.viewDetails('${escapeHtml(sub.id)}')">
                            View
                        </button>
                        ${sub.status === 'pending' && (this.user.role === 'admin' || this.user.role === 'superadmin') ? 
                            `<button class="btn btn-sm btn-success" onclick="submissionManager.approve('${escapeHtml(sub.id)}')">
                                Approve
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="submissionManager.reject('${escapeHtml(sub.id)}')">
                                Reject
                            </button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.loadSubmissions(1);
            });
        }

        // Create Submission Button
        const createBtn = document.getElementById('createSubmissionBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateModal());
        }

        // Submission Form
        const submissionForm = document.getElementById('submissionForm');
        if (submissionForm) {
            submissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createSubmission();
            });
        }

        // Load personnel for dropdown
        this.loadPersonnelOptions();
    }

    async loadPersonnelOptions() {
        try {
            const response = await api.getPersonnel({ per_page: 100 });
            if (response.success) {
                const select = document.getElementById('personnel_id');
                if (select) {
                    select.innerHTML = '<option value="">Select Personnel</option>' +
                        response.data.data.map(p => 
                                `<option value="${escapeHtml(p.id)}">${escapeHtml(p.full_name)} - ${escapeHtml(p.position)}</option>`
                            ).join('');
                }
            }
        } catch (error) {
            console.error('Failed to load personnel:', error);
        }
    }

    showCreateModal() {
        const modal = document.getElementById('submissionModal');
        const form = document.getElementById('submissionForm');

        if (form) {
            form.reset();
            document.getElementById('submission_date').value = new Date().toISOString().split('T')[0];
        }

        if (modal) modal.style.display = 'block';
    }

    async createSubmission() {
        try {
            const formData = {
                personnel_id: document.getElementById('personnel_id').value,
                submission_type: document.getElementById('submission_type').value,
                submission_date: document.getElementById('submission_date').value
            };

            const response = await api.createSubmission(formData);

            if (response.success) {
                this.showSuccess('Submission created successfully');
                this.closeModal();
                await this.loadSubmissions(this.currentPage);
            }
        } catch (error) {
            this.showError('Failed to create submission: ' + error.message);
        }
    }

    async approve(id) {
        const notes = prompt('Approval notes (optional):');

        try {
            const response = await api.approveSubmission(id, notes);

            if (response.success) {
                this.showSuccess('Submission approved successfully');
                await this.loadSubmissions(this.currentPage);
            }
        } catch (error) {
            this.showError('Failed to approve submission: ' + error.message);
        }
    }

    async reject(id) {
        const notes = prompt('Rejection reason (required):');

        if (!notes) {
            this.showError('Rejection reason is required');
            return;
        }

        try {
            const response = await api.rejectSubmission(id, notes);

            if (response.success) {
                this.showSuccess('Submission rejected');
                await this.loadSubmissions(this.currentPage);
            }
        } catch (error) {
            this.showError('Failed to reject submission: ' + error.message);
        }
    }

    viewDetails(id) {
        window.location.href = `submission-detail.html?id=${id}`;
    }

    closeModal() {
        const modal = document.getElementById('submissionModal');
        if (modal) modal.style.display = 'none';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    updatePagination(data) {
        this.currentPage = data.current_page;
        const paginationEl = document.getElementById('pagination');
        if (!paginationEl) return;

        let html = '';
        if (data.prev_page_url) {
            html += `<button class="btn-page" onclick="submissionManager.loadSubmissions(${data.current_page - 1})">Previous</button>`;
        }
        html += `<span class="page-info">Page ${data.current_page} of ${data.last_page}</span>`;
        if (data.next_page_url) {
            html += `<button class="btn-page" onclick="submissionManager.loadSubmissions(${data.current_page + 1})">Next</button>`;
        }
        paginationEl.innerHTML = html;
    }

    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.style.display = show ? 'block' : 'none';
    }

    showSuccess(message) {
        showToast(message, 'success');
    }

    showError(message) {
        showToast('Error: ' + message, 'error');
    }
}

// Initialize
let submissionManager;
document.addEventListener('DOMContentLoaded', () => {
    submissionManager = new SubmissionManager();
});
