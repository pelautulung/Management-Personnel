/**
 * Common Utilities & Helpers
 * Lokasi: frontend/js/common.js
 * Purpose: Toast, Validator, Storage, DateFormatter utilities
 */

// ==================== TOAST NOTIFICATIONS ====================
class Toast {
    static createContainer() {
        let container = document.getElementById('toast-container');
        if (container) return container;

        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: auto;
        `;
        document.body.appendChild(container);
        return container;
    }

    static show(message, type = 'info', duration = 3000) {
        const container = this.createContainer();
        
        const toast = document.createElement('div');
        const bgColor = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3',
        }[type] || '#2196F3';

        toast.style.cssText = `
            padding: 16px 20px;
            margin: 10px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            background-color: ${bgColor};
            animation: slideIn 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            max-width: 400px;
        `;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static success(msg) { this.show(msg, 'success'); }
    static error(msg) { this.show(msg, 'error'); }
    static warning(msg) { this.show(msg, 'warning'); }
    static info(msg) { this.show(msg, 'info'); }
}

// ==================== VALIDATOR ====================
const Validator = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone) => /^[\d\s\-\+\(\)]+$/.test(phone) && phone.length >= 10,
    date: (date) => !isNaN(Date.parse(date)),
    required: (value) => value && value.trim().length > 0,
    minLength: (value, min) => value && value.length >= min,
    maxLength: (value, max) => value && value.length <= max,
    number: (value) => !isNaN(value) && value !== '',
    url: (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },
};

// ==================== STORAGE ====================
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
};

// ==================== DATE FORMATTER ====================
const DateFormatter = {
    format: (date, fmt = 'DD/MM/YYYY') => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return fmt
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('HH', hours)
            .replace('mm', minutes);
    },
    
    relative: (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return DateFormatter.format(date);
    },
};

// ==================== ERROR HANDLER ====================
const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.message.includes('401')) {
        Toast.error('Session expired. Please login again.');
        window.location.href = '/login.html';
    } else if (error.message.includes('403')) {
        Toast.error('You do not have permission for this action.');
    } else if (error.message.includes('404')) {
        Toast.error('Resource not found.');
    } else if (error.message.includes('500')) {
        Toast.error('Server error. Please try again later.');
    } else {
        Toast.error(error.message || 'An error occurred');
    }
};

// ==================== ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 3px solid #0066cc;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
    // Debounce function for events
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Format number as currency
    formatCurrency: (amount, currency = 'IDR') => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    },
    
    // Get query parameters
    getQueryParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    // Generate unique ID
    generateId: () => {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    },
    
    // Deep copy object
    deepCopy: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
};

// Export to global scope
if (typeof window !== 'undefined') {
    window.Toast = Toast;
    window.Validator = Validator;
    window.Storage = Storage;
    window.DateFormatter = DateFormatter;
    window.handleApiError = handleApiError;
    window.Utils = Utils;
}
