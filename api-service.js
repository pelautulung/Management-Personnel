/**
 * API Service - Central HTTP Client
 * Lokasi: frontend/js/api-service.js
 * Purpose: Menangani semua HTTP request ke backend dengan retry logic, timeout, dan error handling
 */

const API_CONFIG = {
    baseURL: 'http://localhost:8000/api',  // ← UBAH KE URL BACKEND ANDA
    timeout: 30000,                         // 30 detik
    retryAttempts: 3,
    retryDelay: 1000,                       // 1 detik
};

class APIService {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = this.getToken();
    }

    getToken() {
        try {
            return localStorage.getItem('auth_token');
        } catch (e) {
            console.error('Error getting token:', e);
            return null;
        }
    }

    setToken(token) {
        try {
            if (token) {
                localStorage.setItem('auth_token', token);
                this.token = token;
            }
        } catch (e) {
            console.error('Error setting token:', e);
        }
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

        // Handle FormData untuk file uploads
        if (data && data instanceof FormData) {
            requestConfig.body = data;
            // Jangan set Content-Type untuk FormData - fetch akan set boundary otomatis
            delete requestConfig.headers['Content-Type'];
        } else if (data && method !== 'GET') {
            requestConfig.body = JSON.stringify(data);
        }

        let lastError;
        
        for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, requestConfig);
                clearTimeout(timeoutId);

                // Handle berbagai status code
                if (!response.ok) {
                    // 401 Unauthorized - Session expired
                    if (response.status === 401) {
                        this.handleUnauthorized();
                        throw new Error('Unauthorized - Session expired');
                    }

                    // 403 Forbidden - No permission
                    if (response.status === 403) {
                        throw new Error('Forbidden - You do not have permission');
                    }

                    // 404 Not Found
                    if (response.status === 404) {
                        throw new Error('Not Found - Resource does not exist');
                    }

                    // 500+ Server Error
                    if (response.status >= 500) {
                        throw new Error(`Server Error ${response.status}`);
                    }

                    // Try to parse error response
                    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        // Jika tidak bisa parse JSON, gunakan statusText
                    }
                    
                    throw new Error(errorMessage);
                }

                // Success - Parse response
                return await this.parseResponse(response);
                
            } catch (error) {
                lastError = error;
                
                // Don't retry pada auth errors
                if (error.message.includes('401') || error.message.includes('403')) {
                    clearTimeout(timeoutId);
                    throw error;
                }
                
                // Don't retry pada 404
                if (error.message.includes('404')) {
                    clearTimeout(timeoutId);
                    throw error;
                }

                // Retry pada network errors atau timeout
                if (attempt < API_CONFIG.retryAttempts) {
                    const delay = API_CONFIG.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.warn(`Request failed (attempt ${attempt}/${API_CONFIG.retryAttempts}), retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    // Last attempt failed
                    clearTimeout(timeoutId);
                }
            }
        }

        clearTimeout(timeoutId);
        throw lastError || new Error('Request failed after ' + API_CONFIG.retryAttempts + ' attempts');
    }

    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('text')) {
            return await response.text();
        } else if (contentType && contentType.includes('blob')) {
            return await response.blob();
        } else {
            // Default: try JSON
            try {
                return await response.json();
            } catch (e) {
                return await response.text();
            }
        }
    }

    handleUnauthorized() {
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        } catch (e) {
            console.error('Error handling unauthorized:', e);
        }
    }

    // ==================== PERSONNEL ENDPOINTS ====================
    async getPersonnel(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const queryString = params.toString() ? '?' + params.toString() : '';
            return await this.request('GET', `/personnel${queryString}`);
        } catch (error) {
            console.error('Error fetching personnel:', error);
            throw error;
        }
    }

    async getPersonnelById(id) {
        if (!id) throw new Error('Personnel ID is required');
        return await this.request('GET', `/personnel/${id}`);
    }

    async createPersonnel(data) {
        if (!data) throw new Error('Personnel data is required');
        return await this.request('POST', '/personnel', data);
    }

    async updatePersonnel(id, data) {
        if (!id) throw new Error('Personnel ID is required');
        if (!data) throw new Error('Personnel data is required');
        return await this.request('PUT', `/personnel/${id}`, data);
    }

    async deletePersonnel(id) {
        if (!id) throw new Error('Personnel ID is required');
        return await this.request('DELETE', `/personnel/${id}`);
    }

    // ==================== CERTIFICATE ENDPOINTS ====================
    async getCertificates(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const queryString = params.toString() ? '?' + params.toString() : '';
            return await this.request('GET', `/certificates${queryString}`);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            throw error;
        }
    }

    async getCertificateById(id) {
        if (!id) throw new Error('Certificate ID is required');
        return await this.request('GET', `/certificates/${id}`);
    }

    async createCertificate(data) {
        if (!data) throw new Error('Certificate data is required');
        return await this.request('POST', '/certificates', data);
    }

    async updateCertificate(id, data) {
        if (!id) throw new Error('Certificate ID is required');
        if (!data) throw new Error('Certificate data is required');
        return await this.request('PUT', `/certificates/${id}`, data);
    }

    async deleteCertificate(id) {
        if (!id) throw new Error('Certificate ID is required');
        return await this.request('DELETE', `/certificates/${id}`);
    }

    async uploadCertificateFile(file) {
        if (!file) throw new Error('File is required');
        const formData = new FormData();
        formData.append('file', file);
        return await this.request('POST', '/certificates/upload', formData);
    }

    // ==================== AUTH ENDPOINTS ====================
    async login(email, password) {
        if (!email || !password) throw new Error('Email and password are required');
        const response = await this.request('POST', '/auth/login', { email, password });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout() {
        try {
            await this.request('POST', '/auth/logout').catch(() => null);
        } catch (e) {
            console.warn('Logout API call failed:', e);
        } finally {
            this.handleUnauthorized();
        }
    }

    async getCurrentUser() {
        return await this.request('GET', '/auth/user');
    }

    async register(userData) {
        if (!userData) throw new Error('User data is required');
        return await this.request('POST', '/auth/register', userData);
    }

    async refreshToken() {
        try {
            const response = await this.request('POST', '/auth/refresh-token');
            if (response.token) {
                this.setToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.handleUnauthorized();
            throw error;
        }
    }

    // ==================== DASHBOARD ENDPOINTS ====================
    async getDashboardStats() {
        return await this.request('GET', '/dashboard/stats');
    }

    async getRecentActivities(limit = 10) {
        if (typeof limit !== 'number' || limit < 1) {
            limit = 10;
        }
        return await this.request('GET', `/dashboard/activities?limit=${limit}`);
    }

    // ==================== DOCUMENT ENDPOINTS ====================
    async uploadDocument(file, documentType) {
        if (!file) throw new Error('File is required');
        if (!documentType) throw new Error('Document type is required');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', documentType);
        return await this.request('POST', '/documents/upload', formData);
    }

    async getDocuments(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const queryString = params.toString() ? '?' + params.toString() : '';
            return await this.request('GET', `/documents${queryString}`);
        } catch (error) {
            console.error('Error fetching documents:', error);
            throw error;
        }
    }

    async deleteDocument(id) {
        if (!id) throw new Error('Document ID is required');
        return await this.request('DELETE', `/documents/${id}`);
    }

    async downloadDocument(id) {
        if (!id) throw new Error('Document ID is required');
        return await this.request('GET', `/documents/${id}/download`);
    }

    // ==================== SUBMISSION ENDPOINTS ====================
    async getSubmissions(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const queryString = params.toString() ? '?' + params.toString() : '';
            return await this.request('GET', `/submissions${queryString}`);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            throw error;
        }
    }

    async createSubmission(data) {
        if (!data) throw new Error('Submission data is required');
        return await this.request('POST', '/submissions', data);
    }

    async updateSubmission(id, data) {
        if (!id) throw new Error('Submission ID is required');
        if (!data) throw new Error('Submission data is required');
        return await this.request('PUT', `/submissions/${id}`, data);
    }

    async getSubmissionById(id) {
        if (!id) throw new Error('Submission ID is required');
        return await this.request('GET', `/submissions/${id}`);
    }

    // ==================== GENERIC ERROR HANDLER ====================
    handleError(error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return 'Network error - Please check your internet connection';
        }
        if (error.name === 'AbortError') {
            return 'Request timeout - Server took too long to respond';
        }
        return error.message || 'An unexpected error occurred';
    }
}

// Create singleton instance
const api = new APIService();

// Expose globally untuk digunakan di script lain
if (typeof window !== 'undefined') {
    window.api = api;
}

// Export untuk ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
