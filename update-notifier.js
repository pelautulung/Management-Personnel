// Update notification system

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (!currentUser || !sessionToken) {
        return; // Don't show updates for unauthenticated users
    }
    
    // Check if the update notification has been shown already
    const updateNotificationShown = localStorage.getItem('updateNotification_v2.1.0');
    
    if (!updateNotificationShown) {
        // Set a small delay before showing the notification
        setTimeout(() => {
            showUpdateNotification();
        }, 1500);
    }
    
    // Setup the update notification banner
    setupUpdateBanner();
});

// Show popup notification for the update
function showUpdateNotification() {
    // Create notification dialog
    const notificationHTML = `
        <div class="update-notification-overlay">
            <div class="update-notification">
                <div class="update-notification-header">
                    <h3>🎉 Update Terbaru SBTC</h3>
                    <button class="close-notification">&times;</button>
                </div>
                <div class="update-notification-body">
                    <p>SBTC Zona 5 telah diperbarui dengan fitur baru!</p>
                    <ul>
                        <li><strong>Data Management System</strong> - Import data dari Excel/CSV</li>
                        <li><strong>Real-time Dashboard</strong> - Statistik terupdate otomatis</li>
                        <li><strong>Form SBTC Komprehensif</strong> - Lebih banyak data yang bisa diinput</li>
                    </ul>
                </div>
                <div class="update-notification-footer">
                    <button class="view-updates-btn">Lihat Detail Update</button>
                    <button class="later-btn">Nanti Saja</button>
                </div>
            </div>
        </div>
    `;
    
    // Create styles for the notification
    const notificationStyles = `
        <style>
            .update-notification-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            
            .update-notification {
                background: white;
                width: 90%;
                max-width: 500px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                overflow: hidden;
                animation: slideUp 0.4s ease;
            }
            
            .update-notification-header {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .update-notification-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-notification {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            
            .update-notification-body {
                padding: 20px;
                color: #333;
            }
            
            .update-notification-body ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            
            .update-notification-body li {
                margin-bottom: 8px;
            }
            
            .update-notification-footer {
                display: flex;
                padding: 15px 20px;
                background: #f8f9fa;
                border-top: 1px solid #eee;
            }
            
            .view-updates-btn {
                background: #0066cc;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 10px;
                font-weight: 500;
            }
            
            .later-btn {
                background: #f0f0f0;
                color: #333;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    `;
    
    // Append to body
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = notificationStyles + notificationHTML;
    document.body.appendChild(tempDiv);
    
    // Setup event listeners
    const overlay = document.querySelector('.update-notification-overlay');
    const closeBtn = document.querySelector('.close-notification');
    const viewUpdatesBtn = document.querySelector('.view-updates-btn');
    const laterBtn = document.querySelector('.later-btn');
    
    closeBtn.addEventListener('click', () => {
        overlay.remove();
        markUpdateAsSeen();
    });
    
    viewUpdatesBtn.addEventListener('click', () => {
        // Open announcement page
        window.location.href = 'announcement.html';
        overlay.remove();
        markUpdateAsSeen();
    });
    
    laterBtn.addEventListener('click', () => {
        overlay.remove();
    });
}

// Setup persistent update banner
function setupUpdateBanner() {
    // Create banner element
    const bannerHTML = `
        <div class="update-banner">
            <div class="update-banner-content">
                <span class="update-icon">🎉</span>
                <span class="update-text">Fitur baru! Data Management System tersedia sekarang.</span>
            </div>
            <div class="update-banner-actions">
                <button class="update-banner-btn">Lihat Fitur</button>
                <button class="close-banner-btn">&times;</button>
            </div>
        </div>
    `;
    
    // Create styles for the banner
    const bannerStyles = `
        <style>
            .update-banner {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 15px;
                width: 350px;
                animation: slideIn 0.5s ease;
                z-index: 999;
            }
            
            .update-banner-content {
                display: flex;
                align-items: center;
            }
            
            .update-icon {
                font-size: 20px;
                margin-right: 10px;
            }
            
            .update-text {
                font-size: 14px;
                color: #333;
            }
            
            .update-banner-actions {
                display: flex;
                align-items: center;
            }
            
            .update-banner-btn {
                background: #0066cc;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-right: 10px;
            }
            
            .close-banner-btn {
                background: none;
                border: none;
                color: #777;
                font-size: 20px;
                cursor: pointer;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @media (max-width: 480px) {
                .update-banner {
                    width: calc(100% - 40px);
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .update-banner-actions {
                    margin-top: 10px;
                    align-self: flex-end;
                }
            }
        </style>
    `;
    
    // Append to body with delay
    setTimeout(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bannerStyles + bannerHTML;
        document.body.appendChild(tempDiv);
        
        // Setup event listeners
        const banner = document.querySelector('.update-banner');
        const viewBtn = document.querySelector('.update-banner-btn');
        const closeBtn = document.querySelector('.close-banner-btn');
        
        viewBtn.addEventListener('click', () => {
            window.location.href = 'announcement.html';
            banner.remove();
        });
        
        closeBtn.addEventListener('click', () => {
            banner.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => {
                banner.remove();
            }, 500);
        });
        
        // Add slideOut animation
        const additionalStyle = document.createElement('style');
        additionalStyle.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(additionalStyle);
    }, 5000); // Show banner after 5 seconds
}

// Mark update as seen
function markUpdateAsSeen() {
    localStorage.setItem('updateNotification_v2.1.0', 'shown');
}