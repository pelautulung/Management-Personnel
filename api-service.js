// API Service - Base configuration for all API calls
// File: js/api-service.js

const API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000/api',
    // Alternate endpoints to try if the primary fails (useful during local dev)
    alternates: [
        'http://127.0.0.1:8001/api',
        'http://localhost:8000/api',
    ],
    timeout: 30000,
};

class APIService {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('auth_token');
    }

    // Set auth token
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    // Remove auth token
    removeToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }

    // Get current user from localStorage
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Save current user to localStorage
    setCurrentUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Build headers
    getHeaders(isFormData = false) {
        const headers = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Handle response
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.removeToken();
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }

            // Handle other errors
            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.body instanceof FormData),
        };

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            // Network error (server unreachable). Try alternates once.
            console.warn('Primary API request failed:', error);
            if (API_CONFIG.alternates && API_CONFIG.alternates.length) {
                const next = API_CONFIG.alternates.shift();
                if (next) {
                    console.info('Retrying with alternate API base:', next);
                    this.baseURL = next;
                    const retryUrl = `${this.baseURL}${endpoint}`;
                    try {
                        const retryResp = await fetch(retryUrl, config);
                        return await this.handleResponse(retryResp);
                    } catch (err2) {
                        console.error('Retry API Error:', err2);
                        throw err2;
                    }
                }
            }

            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, {
            method: 'GET',
        });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // ==================== AUTH ENDPOINTS ====================

    async login(username, password) {
        const response = await this.post('/auth/login', {
            username,
            password
        });

        if (response.success) {
            this.setToken(response.data.token);
            this.setCurrentUser(response.data.user);
        }

        return response;
    }

    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.removeToken();
            window.location.href = '/login.html';
        }
    }

    async getCurrentUserInfo() {
        return this.get('/auth/me');
    }

    async refreshToken() {
        const response = await this.post('/auth/refresh');
        if (response.success) {
            this.setToken(response.data.token);
        }
        return response;
    }

    // ==================== PERSONNEL ENDPOINTS ====================

    async getPersonnel(params = {}) {
        return this.get('/personnel', params);
    }

    async getPersonnelById(id) {
        return this.get(`/personnel/${id}`);
    }

    async createPersonnel(data) {
        return this.post('/personnel', data);
    }

    async updatePersonnel(id, data) {
        return this.put(`/personnel/${id}`, data);
    }

    async deletePersonnel(id) {
        return this.delete(`/personnel/${id}`);
    }

    // ==================== CERTIFICATE ENDPOINTS ====================

    async getCertificates(params = {}) {
        return this.get('/certificates', params);
    }

    async getCertificateById(id) {
        return this.get(`/certificates/${id}`);
    }

    async issueCertificate(data) {
        return this.post('/certificates', data);
    }

    async updateCertificate(id, data) {
        return this.put(`/certificates/${id}`, data);
    }

    async revokeCertificate(id) {
        return this.delete(`/certificates/${id}`);
    }

    async verifyCertificate(certificateNumber) {
        return this.get(`/certificates/verify/${certificateNumber}`);
    }

    // ==================== SUBMISSION ENDPOINTS ====================

    async getSubmissions(params = {}) {
        return this.get('/submissions', params);
    }

    async getSubmissionById(id) {
        return this.get(`/submissions/${id}`);
    }

    async createSubmission(data) {
        return this.post('/submissions', data);
    }

    async approveSubmission(id, notes = null) {
        return this.post(`/submissions/${id}/approve`, {
            review_notes: notes
        });
    }

    async rejectSubmission(id, notes) {
        return this.post(`/submissions/${id}/reject`, {
            review_notes: notes
        });
    }

    // ==================== DOCUMENT ENDPOINTS ====================

    async getDocuments(params = {}) {
        return this.get('/documents', params);
    }

    async uploadDocument(personnelId, documentType, file) {
        const formData = new FormData();
        formData.append('personnel_id', personnelId);
        formData.append('document_type', documentType);
        formData.append('file', file);

        return this.post('/documents/upload', formData);
    }

    async downloadDocument(id) {
        const url = `${this.baseURL}/documents/${id}/download`;
        window.open(url, '_blank');
    }

    async deleteDocument(id) {
        return this.delete(`/documents/${id}`);
    }

    // ==================== COMPANY ENDPOINTS ====================

    async getCompanies(params = {}) {
        return this.get('/companies', params);
    }

    async getCompanyById(id) {
        return this.get(`/companies/${id}`);
    }

    async createCompany(data) {
        return this.post('/companies', data);
    }

    async updateCompany(id, data) {
        return this.put(`/companies/${id}`, data);
    }

    async deleteCompany(id) {
        return this.delete(`/companies/${id}`);
    }

    // ==================== USER ENDPOINTS ====================

    async getUsers(params = {}) {
        return this.get('/users', params);
    }

    async getUserById(id) {
        return this.get(`/users/${id}`);
    }

    async createUser(data) {
        return this.post('/users', data);
    }

    async updateUser(id, data) {
        return this.put(`/users/${id}`, data);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async changePassword(id, currentPassword, newPassword) {
        return this.put(`/users/${id}/change-password`, {
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPassword
        });
    }

    // ==================== NOTIFICATION ENDPOINTS ====================

    async getNotifications(params = {}) {
        return this.get('/notifications', params);
    }

    async getUnreadCount() {
        return this.get('/notifications/unread-count');
    }

    async markAsRead(id) {
        return this.put(`/notifications/${id}/read`);
    }

    async markAllAsRead() {
        return this.put('/notifications/read-all');
    }

    async deleteNotification(id) {
        return this.delete(`/notifications/${id}`);
    }

    // ==================== DASHBOARD ENDPOINTS ====================

    async getDashboardStats() {
        return this.get('/dashboard/stats');
    }

    async getRecentActivities(limit = 10) {
        return this.get('/dashboard/activities', { limit });
    }
}

// Create singleton instance
const api = new APIService();
// Expose globally so other pages/scripts (like login.html) can update token/user
// without needing a full reload.
try { window.api = api; } catch (e) { console.warn('Could not set window.api', e); }

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const publicPages = ['login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (!publicPages.includes(currentPage)) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/login.html';
        }
    }
});
