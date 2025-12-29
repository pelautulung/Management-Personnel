// Notifications Integration Script
// File: js/notifications.js

class NotificationManager {
    constructor() {
        this.unreadCount = 0;
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        await this.loadNotifications();
        await this.updateUnreadCount();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    async loadNotifications() {
        try {
            const response = await api.getNotifications({ page: 1, per_page: 20 });

            if (response.success) {
                this.displayNotifications(response.data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    displayNotifications(data) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<div class="no-notifications">No notifications</div>';
            return;
        }

        container.innerHTML = data.data.map(notif => {
            const safeId = escapeHtml(notif.id);
            const safeRelatedTable = escapeHtml(notif.related_table);
            const safeRelatedId = escapeHtml(notif.related_id);
            const safeTitle = escapeHtml(notif.title);
            const safeMessage = escapeHtml(notif.message);
            const safeTime = escapeHtml(this.formatTimeAgo(notif.created_at));
            const readClass = notif.is_read ? 'read' : 'unread';
            const safeTypeClass = String(notif.type || '').replace(/[^a-z0-9_-]/gi, '') || 'info';

            return `
            <div class="notification-item ${readClass}" 
                 data-id="${safeId}"
                 onclick="notificationManager.markAsReadAndNavigate('${safeId}', '${safeRelatedTable}', '${safeRelatedId}')">
                <div class="notification-icon ${safeTypeClass}">
                    <i class="fas fa-${this.getNotificationIcon(notif.type)}"></i>
                </div>
                <div class="notification-content">
                    <strong>${safeTitle}</strong>
                    <p>${safeMessage}</p>
                    <small>${safeTime}</small>
                </div>
                ${!notif.is_read ? '<div class="unread-badge"></div>' : ''}
            </div>
        `}).join('');
    }

    async updateUnreadCount() {
        try {
            const response = await api.getUnreadCount();

            if (response.success) {
                this.unreadCount = response.data.unread_count;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Failed to update unread count:', error);
        }
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'inline-block' : 'none';
        }

        // Update title
        if (this.unreadCount > 0) {
            document.title = `(${this.unreadCount}) SBTC System`;
        } else {
            document.title = 'SBTC Certification System';
        }
    }

    setupEventListeners() {
        // Mark all as read button
        const markAllBtn = document.getElementById('markAllReadBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // Notification bell click
        const bellIcon = document.getElementById('notificationBell');
        if (bellIcon) {
            bellIcon.addEventListener('click', () => this.toggleNotificationPanel());
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationPanel');
            const bell = document.getElementById('notificationBell');

            if (panel && bell && 
                !panel.contains(e.target) && 
                !bell.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    async markAsReadAndNavigate(id, relatedTable, relatedId) {
        try {
            await api.markAsRead(id);
            await this.updateUnreadCount();

            // Navigate to related item
            if (relatedTable && relatedId && relatedId !== 'null') {
                this.navigateToRelated(relatedTable, relatedId);
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await api.markAllAsRead();

            if (response.success) {
                this.showSuccess('All notifications marked as read');
                await this.loadNotifications();
                await this.updateUnreadCount();
            }
        } catch (error) {
            this.showError('Failed to mark all as read: ' + error.message);
        }
    }

    navigateToRelated(table, id) {
        const routes = {
            'personnel': `personnel-detail.html?id=${id}`,
            'certificates': `certificate-detail.html?id=${id}`,
            'submissions': `submission-detail.html?id=${id}`,
        };

        const route = routes[table];
        if (route) {
            window.location.href = route;
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return icons[type] || 'bell';
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString();
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.updateUnreadCount();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    showSuccess(message) {
        showToast(message, 'success');
    }

    showError(message) {
        showToast('Error: ' + message, 'error');
    }
}

// Initialize
let notificationManager;
document.addEventListener('DOMContentLoaded', () => {
    notificationManager = new NotificationManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (notificationManager) {
        notificationManager.stopAutoRefresh();
    }
});
