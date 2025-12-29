// Document Management Integration Script
// File: js/documents.js

class DocumentManager {
    constructor() {
        this.personnelId = null;
        this.init();
    }

    async init() {
        // Get personnel ID from URL if on detail page
        const params = new URLSearchParams(window.location.search);
        this.personnelId = params.get('id');

        if (this.personnelId) {
            await this.loadDocuments();
        }

        this.setupEventListeners();
    }

    async loadDocuments() {
        try {
            const response = await api.getDocuments({
                personnel_id: this.personnelId
            });

            if (response.success) {
                this.displayDocuments(response.data);
            }
        } catch (error) {
            this.showError('Failed to load documents: ' + error.message);
        }
    }

    displayDocuments(documents) {
        const container = document.getElementById('documentsContainer');
        if (!container) return;

        if (!documents || documents.length === 0) {
            container.innerHTML = '<p class="no-data">No documents uploaded</p>';
            return;
        }

        container.innerHTML = documents.map(doc => `
            <div class="document-item">
                <div class="document-icon">
                    <i class="fas fa-file-${this.getFileIcon(doc.file_name)}"></i>
                </div>
                <div class="document-info">
                    <strong>${escapeHtml(doc.document_type)}</strong>
                    <small>${escapeHtml(doc.file_name)}</small>
                    <small>Uploaded: ${this.formatDate(doc.created_at)}</small>
                </div>
                <div class="document-actions">
                    <button class="btn btn-sm btn-primary" onclick="documentManager.download('${escapeHtml(doc.id)}')">
                        Download
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="documentManager.deleteDocument('${escapeHtml(doc.id)}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Upload button
        const uploadBtn = document.getElementById('uploadDocumentBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadModal());
        }

        // Upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.uploadDocument();
            });
        }

        // File input change
        const fileInput = document.getElementById('document_file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.validateFile(e.target.files[0]);
            });
        }
    }

    showUploadModal() {
        const modal = document.getElementById('uploadModal');
        const form = document.getElementById('uploadForm');

        if (form) form.reset();
        if (modal) modal.style.display = 'block';
    }

    validateFile(file) {
        if (!file) return false;

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('File size must be less than 10MB');
            return false;
        }

        // Check file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            this.showError('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX');
            return false;
        }

        return true;
    }

    async uploadDocument() {
        const fileInput = document.getElementById('document_file');
        const documentType = document.getElementById('document_type').value;
        const file = fileInput.files[0];

        if (!file) {
            this.showError('Please select a file');
            return;
        }

        if (!this.validateFile(file)) {
            return;
        }

        try {
            this.showLoading(true);

            const response = await api.uploadDocument(
                this.personnelId,
                documentType,
                file
            );

            if (response.success) {
                this.showSuccess('Document uploaded successfully');
                this.closeModal();
                await this.loadDocuments();
            }
        } catch (error) {
            this.showError('Failed to upload document: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async download(id) {
        try {
            await api.downloadDocument(id);
        } catch (error) {
            this.showError('Failed to download document: ' + error.message);
        }
    }

    async deleteDocument(id) {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const response = await api.deleteDocument(id);

            if (response.success) {
                this.showSuccess('Document deleted successfully');
                await this.loadDocuments();
            }
        } catch (error) {
            this.showError('Failed to delete document: ' + error.message);
        }
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'pdf',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'doc': 'word',
            'docx': 'word'
        };
        return icons[ext] || 'alt';
    }

    closeModal() {
        const modal = document.getElementById('uploadModal');
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

    showLoading(show) {
        const loader = document.getElementById('uploadLoading');
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
let documentManager;
document.addEventListener('DOMContentLoaded', () => {
    documentManager = new DocumentManager();
});
