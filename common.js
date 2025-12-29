// Common Utilities and Helpers
// File: js/common.js

// Toast notification function
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = {
        'success': '✓',
        'error': '✕',
        'warning': '⚠',
        'info': 'ℹ'
    }[type] || 'ℹ';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Escape string to prevent basic XSS when inserting into HTML
function escapeHtml(input) {
    if (input === null || input === undefined) return '';
    const str = String(input);
    return str.replace(/[&<>"'`=\/]/g, function (s) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#96;',
            '=': '&#61;',
            '/': '&#47;'
        })[s];
    });
}

// Format date to readable string
function formatDate(dateString, format = 'long') {
    const date = new Date(dateString);

    if (format === 'short') {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date to ISO string for input fields
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Confirm dialog with custom message
function confirmAction(message, callback) {
    const result = confirm(message);
    if (result && callback) {
        callback();
    }
    return result;
}

// Show loading overlay
function showLoadingOverlay(show = true) {
    let overlay = document.getElementById('loadingOverlay');

    if (!overlay && show) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard', 'success');
    }).catch(err => {
        showToast('Failed to copy', 'error');
        console.error('Copy failed:', err);
    });
}

// Export table to CSV
function exportTableToCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (let row of rows) {
        let rowData = [];
        const cols = row.querySelectorAll('td, th');

        for (let col of cols) {
            rowData.push('"' + col.textContent.trim().replace(/"/g, '""') + '"');
        }

        csv.push(rowData.join(','));
    }

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Table exported successfully', 'success');
}

// Print page or element
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="css/print.css">');
    printWindow.document.write('</head><body>');
    // Clone and sanitize the element before printing to avoid executing scripts or inline handlers
    const clone = element.cloneNode(true);

    // Remove script tags and inline event handlers
    function sanitizeNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT') {
                node.remove();
                return;
            }

            // Remove attributes that start with "on" (onclick, onmouseover, etc.)
            [...node.attributes].forEach(attr => {
                if (attr.name && attr.name.toLowerCase().startsWith('on')) {
                    node.removeAttribute(attr.name);
                }
            });
        }

        // Recurse into children (use static NodeList snapshot)
        const children = Array.from(node.childNodes);
        for (const child of children) {
            sanitizeNode(child);
        }
    }

    sanitizeNode(clone);
    printWindow.document.body.appendChild(clone);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Indonesian format)
function validatePhone(phone) {
    const re = /^(\+62|62|0)[0-9]{9,12}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}

// Get query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Update query parameter in URL
function updateQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

// Check if user has specific role
function hasRole(roles) {
    const user = api.getCurrentUser();
    if (!user) return false;

    if (Array.isArray(roles)) {
        return roles.includes(user.role);
    }
    return user.role === roles;
}

// Show/hide element based on role
function roleBasedDisplay() {
    const elements = document.querySelectorAll('[data-role]');
    const user = api.getCurrentUser();

    elements.forEach(el => {
        const allowedRoles = el.dataset.role.split(',');
        if (!allowedRoles.includes(user.role)) {
            el.style.display = 'none';
        }
    });
}

// Initialize common features
document.addEventListener('DOMContentLoaded', () => {
    // Apply role-based display
    roleBasedDisplay();

    // Add click handlers for copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.dataset.copy;
            if (text) copyToClipboard(text);
        });
    });

    // Add handlers for export buttons
    document.querySelectorAll('.export-csv-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tableId = e.target.dataset.table;
            if (tableId) exportTableToCSV(tableId);
        });
    });
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You can send to error tracking service here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
