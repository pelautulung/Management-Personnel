/**
 * Dashboard Module
 * Lokasi: frontend/js/dashboard.js
 * Purpose: Dashboard functionality - load stats, activities, charts
 * Dependencies: api.js, common.js, auth.js
 */

class DashboardModule {
    constructor() {
        this.stats = null;
        this.activities = null;
        this.refreshInterval = null;
    }

    async init() {
        try {
            console.log('[Dashboard] Initializing...');
            
            // Verify authentication
            if (!AuthManager.isAuthenticated()) {
                window.location.href = '/login.html';
                return;
            }

            // Load initial data
            await this.loadDashboardStats();
            await this.loadRecentActivities();
            this.setupEventListeners();
            
            // Auto-refresh every 30 seconds
            this.startAutoRefresh();
            
            console.log('[Dashboard] Initialized successfully');
        } catch (error) {
            console.error('[Dashboard] Initialization error:', error);
            Toast.error('Failed to load dashboard');
        }
    }

    async loadDashboardStats() {
        try {
            const statsContainer = document.getElementById('dashboard-stats');
            if (!statsContainer) return;

            // Show loading state
            statsContainer.innerHTML = '<div class="loading"></div> Loading stats...';

            const stats = await api.getDashboardStats();
            this.stats = stats;
            this.renderStats(stats);
        } catch (error) {
            console.error('[Dashboard] Error loading stats:', error);
            const statsContainer = document.getElementById('dashboard-stats');
            if (statsContainer) {
                statsContainer.innerHTML = '<div class="error-message">Failed to load statistics</div>';
            }
        }
    }

    async loadRecentActivities() {
        try {
            const activitiesContainer = document.getElementById('recent-activities');
            if (!activitiesContainer) return;

            // Show loading state
            activitiesContainer.innerHTML = '<div class="loading"></div> Loading activities...';

            const activities = await api.getRecentActivities(10);
            this.activities = activities;
            this.renderActivities(activities);
        } catch (error) {
            console.error('[Dashboard] Error loading activities:', error);
            const activitiesContainer = document.getElementById('recent-activities');
            if (activitiesContainer) {
                activitiesContainer.innerHTML = '<div class="error-message">Failed to load activities</div>';
            }
        }
    }

    renderStats(stats) {
        const statsContainer = document.getElementById('dashboard-stats');
        if (!statsContainer) return;

        try {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Personnel</h3>
                        <div class="stat-value">${stats.total_personnel || 0}</div>
                        <div class="stat-subtitle">Active employees</div>
                    </div>
                    <div class="stat-card">
                        <h3>Certificates</h3>
                        <div class="stat-value">${stats.total_certificates || 0}</div>
                        <div class="stat-subtitle">Uploaded certificates</div>
                    </div>
                    <div class="stat-card">
                        <h3>Pending Approvals</h3>
                        <div class="stat-value" style="color: ${stats.pending_approvals > 0 ? '#ff9800' : '#4CAF50'}">
                            ${stats.pending_approvals || 0}
                        </div>
                        <div class="stat-subtitle">Awaiting review</div>
                    </div>
                    <div class="stat-card">
                        <h3>Submissions</h3>
                        <div class="stat-value">${stats.total_submissions || 0}</div>
                        <div class="stat-subtitle">Total submissions</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[Dashboard] Error rendering stats:', error);
            statsContainer.innerHTML = '<div class="error-message">Error rendering statistics</div>';
        }
    }

    renderActivities(activities) {
        const activitiesContainer = document.getElementById('recent-activities');
        if (!activitiesContainer) return;

        try {
            if (!activities || activities.length === 0) {
                activitiesContainer.innerHTML = '<p class="text-muted">No recent activities</p>';
                return;
            }

            let html = '<div class="activities-list">';
            
            activities.forEach(activity => {
                const timestamp = DateFormatter.relative(activity.created_at || activity.timestamp);
                html += `
                    <div class="activity-item">
                        <div class="activity-icon" style="background-color: ${this.getActivityColor(activity.type)}">
                            ${this.getActivityIcon(activity.type)}
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">${this.escapeHtml(activity.title || activity.action)}</div>
                            <div class="activity-description">${this.escapeHtml(activity.description || '')}</div>
                            <div class="activity-time">${timestamp}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            activitiesContainer.innerHTML = html;
        } catch (error) {
            console.error('[Dashboard] Error rendering activities:', error);
            activitiesContainer.innerHTML = '<div class="error-message">Error rendering activities</div>';
        }
    }

    getActivityColor(type) {
        const colors = {
            'created': '#4CAF50',
            'updated': '#2196F3',
            'deleted': '#f44336',
            'uploaded': '#ff9800',
            'approved': '#4CAF50',
            'rejected': '#f44336',
            'default': '#9C27B0'
        };
        return colors[type] || colors['default'];
    }

    getActivityIcon(type) {
        const icons = {
            'created': '✚',
            'updated': '✎',
            'deleted': '✕',
            'uploaded': '⬆',
            'approved': '✓',
            'rejected': '✗',
            'default': '•'
        };
        return icons[type] || icons['default'];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }

    async refreshDashboard() {
        try {
            Toast.info('Refreshing dashboard...');
            await this.loadDashboardStats();
            await this.loadRecentActivities();
            Toast.success('Dashboard updated');
        } catch (error) {
            console.error('[Dashboard] Refresh error:', error);
            Toast.error('Failed to refresh dashboard');
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboardStats();
            this.loadRecentActivities();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
        this.stats = null;
        this.activities = null;
    }
}

// Initialize when page loads
let dashboard = null;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard-stats') || document.getElementById('recent-activities')) {
        dashboard = new DashboardModule();
        dashboard.init();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});

// Export to global scope
if (typeof window !== 'undefined') {
    window.DashboardModule = DashboardModule;
    window.dashboard = dashboard;
}
