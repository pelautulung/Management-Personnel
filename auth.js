/**
 * Authentication Manager
 * Lokasi: frontend/js/auth.js
 * Purpose: Menangani login, logout, dan session management
 */

class AuthManager {
    static async login(email, password) {
        try {
            if (!email || !password) {
                Toast.error('Email dan password harus diisi');
                return false;
            }

            Toast.info('Logging in...');
            const response = await api.login(email, password);
            
            if (response.token && response.user) {
                Storage.set('user', response.user);
                Storage.set('auth_token', response.token);
                Toast.success('Login berhasil!');
                window.location.href = '/index.html';
                return true;
            } else {
                Toast.error('Login gagal - response tidak valid');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            Toast.error(error.message || 'Login gagal');
            return false;
        }
    }

    static logout() {
        try {
            api.logout().catch(() => null);
            Storage.remove('user');
            Storage.remove('auth_token');
            Toast.success('Logout berhasil');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            Storage.remove('user');
            Storage.remove('auth_token');
            window.location.href = '/login.html';
        }
    }

    static getCurrentUser() {
        return Storage.get('user', null);
    }

    static isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    }

    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    static getRole() {
        const user = this.getCurrentUser();
        return user?.role || null;
    }

    static hasRole(role) {
        return this.getRole() === role;
    }

    static hasPermission(permission) {
        const user = this.getCurrentUser();
        return user?.permissions?.includes(permission) || false;
    }

    static canAccess(requiredRole) {
        const role = this.getRole();
        const roleHierarchy = {
            'admin': ['admin', 'manager', 'user'],
            'manager': ['manager', 'user'],
            'user': ['user'],
        };
        
        return roleHierarchy[role]?.includes(requiredRole) || false;
    }
}

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const publicPages = ['login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!publicPages.includes(currentPage) && !AuthManager.isAuthenticated()) {
        window.location.href = '/login.html';
    }
});

// Export untuk global scope
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
}
