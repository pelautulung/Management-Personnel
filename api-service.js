/**
 * API Service - Central HTTP Client
 * Lokasi: frontend/js/api-service.js
 * Purpose: Menangani semua HTTP request ke backend
 */

const API_CONFIG = {
    baseURL: 'http://localhost:8000/api',  // ← UBAH KE URL BACKEND ANDA
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};

class APIService {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), API_CONFIG.timeout);
        
        const requestConfig = {
            method,
            headers: this.getHeaders(),
            signal: abortController.signal,
            ...options,
        };

        if (data && !(data instanceof FormData)) {
            requestConfig.body = JSON.stringify(data);
        } else if (data instanceof FormData) {
            requestConfig.body = data;
            delete requestConfig.headers['Content-Type'];
        }

        let lastError;
        for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, requestConfig);
                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.href = '/login.html';
                        throw new Error('Unauthorized - Please login again');
                    }

                    const errorData = await response.json().catch(() => ({
                        message: `HTTP ${response.status}: ${response.statusText}`,
                    }));
                    throw new Error(errorData.message || `HTTP Error ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                
                if (error.message.includes('401') || error.message.includes('400')) {
                    throw error;
                }

                if (attempt < API_CONFIG.retryAttempts) {
                    console.warn(`Request failed (attempt ${attempt}/${API_CONFIG.retryAttempts}), retrying...`);
                    await new Promise(resolve => 
                        setTimeout(resolve, API_CONFIG.retryDelay * attempt)
                    );
                }
            }
        }

        clearTimeout(timeoutId);
        throw lastError;
    }

    // ==================== PERSONNEL ====================
    async getPersonnel(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request('GET', `/personnel${params ? '?' + params : ''}`);
    }

    async getPersonnelById(id) {
        return this.request('GET', `/personnel/${id}`);
    }

    async createPersonnel(data) {
        return this.request('POST', '/personnel', data);
    }

    async updatePersonnel(id, data) {
        return this.request('PUT', `/personnel/${id}`, data);
    }

    async deletePersonnel(id) {
        return this.request('DELETE', `/personnel/${id}`);
    }

    // ==================== CERTIFICATES ====================
    async getCertificates(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request('GET', `/certificates${params ? '?' + params : ''}`);
    }

    async getCertificateById(id) {
        return this.request('GET', `/certificates/${id}`);
    }

    async createCertificate(data) {
        return this.request('POST', '/certificates', data);
    }

    async updateCertificate(id, data) {
        return this.request('PUT', `/certificates/${id}`, data);
    }

    async deleteCertificate(id) {
        return this.request('DELETE', `/certificates/${id}`);
    }

    async uploadCertificateFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.request('POST', '/certificates/upload', formData);
    }

    // ==================== AUTH ====================
    async login(email, password) {
        const response = await this.request('POST', '/auth/login', { email, password });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout() {
        localStorage.removeItem('auth_token');
        this.token = null;
        return this.request('POST', '/auth/logout').catch(() => null);
    }

    async getCurrentUser() {
        return this.request('GET', '/auth/user');
    }

    // ==================== DASHBOARD ====================
    async getDashboardStats() {
        return this.request('GET', '/dashboard/stats');
    }

    async getRecentActivities(limit = 10) {
        return this.request('GET', `/dashboard/activities?limit=${limit}`);
    }

    // ==================== DOCUMENTS ====================
    async uploadDocument(file, documentType) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', documentType);
        return this.request('POST', '/documents/upload', formData);
    }

    async getDocuments(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request('GET', `/documents${params ? '?' + params : ''}`);
    }

    async deleteDocument(id) {
        return this.request('DELETE', `/documents/${id}`);
    }
}

const api = new APIService();
if (typeof window !== 'undefined') window.api = api;

