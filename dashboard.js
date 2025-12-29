// Dashboard functionality for SBTC System
// Provides dashboard statistics and overview data

// Initialize the dashboard module
function initDashboard() {
    console.log('Initializing dashboard module...');
    updateDashboardStats();
    setupDashboardEventListeners();
    loadApplicationsByStatus();
    
    // Initialize user dropdown functionality
    initUserDropdown();
}

// Initialize user profile dropdown
function initUserDropdown() {
    const userProfile = document.getElementById('userProfileHeader');
    if (userProfile) {
        // Limit click event to just the user profile area itself
        userProfile.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent body click events
            this.classList.toggle('active');
        });
        
        // Handle clicks on dropdown items - prevent them from closing the dropdown
        const dropdownLinks = userProfile.querySelectorAll('.user-dropdown a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.stopPropagation(); // Stop event from bubbling to parent elements
                // For links that should navigate away, don't prevent default
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfile.contains(e.target)) {
                userProfile.classList.remove('active');
            }
        });
    }
    
    // Set up contractor management link
    setupContractorManagementLink();
}

// Setup contractor management link functionality
function setupContractorManagementLink() {
    const manageContractorsLink = document.getElementById('manageContractorsLink');
    if (manageContractorsLink) {
        // Remove any existing event listeners to prevent conflicts
        const clone = manageContractorsLink.cloneNode(true);
        manageContractorsLink.parentNode.replaceChild(clone, manageContractorsLink);
        
        // Only hide the link for non-superadmin users
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.role !== 'superadmin') {
            clone.style.display = 'none';
        }
    }
}

// Set up dashboard-specific event listeners
function setupDashboardEventListeners() {
    // Period selector for dashboard stats
    const periodSelector = document.querySelector('.dashboard .filter-controls select');
    if (periodSelector) {
        periodSelector.innerHTML = `
            <option value="all">Semua Periode</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="quarter">Kuartal Ini</option>
            <option value="year">Tahun Ini</option>
        `;
        
        periodSelector.addEventListener('change', function() {
            updateDashboardStats(this.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('.dashboard .refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            updateDashboardStats(periodSelector ? periodSelector.value : 'all');
            
            setTimeout(() => {
                this.classList.remove('refreshing');
                window.app.showNotification('Data telah diperbarui', 'info');
            }, 800);
        });
    }
    
    // Application detail links
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('action-link')) {
            e.preventDefault();
            const appId = e.target.getAttribute('data-id');
            if (appId) {
                openApplicationDetail(appId);
            }
        }
    });
}

// Update dashboard statistics
function updateDashboardStats(period = 'all') {
    console.log(`Updating dashboard stats for period: ${period}`);
    
    // Filter applications based on selected period
    let filteredApps = window.app.state.applications;
    
    if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }
        
        filteredApps = filteredApps.filter(app => {
            const appDate = new Date(app.submissionDate);
            return appDate >= startDate;
        });
    }
    
    // Calculate statistics
    const stats = {
        total: filteredApps.length,
        awaiting: filteredApps.filter(app => app.status === 'Menunggu Review').length,
        interviews: filteredApps.filter(app => app.status === 'Menunggu Interview').length,
        certificates: window.app.state.certificates.filter(cert => {
            if (period === 'all') return true;
            const certDate = new Date(cert.issueDate);
            const now = new Date();
            
            switch(period) {
                case 'today':
                    return certDate.toDateString() === now.toDateString();
                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return certDate >= weekStart;
                case 'month':
                    return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
                    return certDate >= quarterStart;
                case 'year':
                    return certDate.getFullYear() === now.getFullYear();
            }
        }).length,
        
        // Status counts
        submitted: filteredApps.filter(app => app.status === 'Diajukan').length,
        inReview: filteredApps.filter(app => app.status === 'Direview').length,
        approved: filteredApps.filter(app => app.status === 'Disetujui').length,
        rejected: filteredApps.filter(app => app.status === 'Ditolak').length,
        certified: filteredApps.filter(app => app.status === 'Sertifikat Terbit').length
    };
    
    // Calculate trends based on real data comparison
    const previousPeriodStats = getPreviousPeriodStats(period);
    const trends = {
        total: calculateTrendPercentage(previousPeriodStats.total, stats.total),
        awaiting: calculateTrendPercentage(previousPeriodStats.awaiting, stats.awaiting),
        interviews: calculateTrendPercentage(previousPeriodStats.interviews, stats.interviews),
        certificates: calculateTrendPercentage(previousPeriodStats.certificates, stats.certificates)
    };
    
    // Update UI with new stats
    document.querySelectorAll('.stats-container .stat-value').forEach((el, index) => {
        let value;
        switch(index) {
            case 0: value = stats.total; break;
            case 1: value = stats.awaiting; break;
            case 2: value = stats.interviews; break;
            case 3: value = stats.certificates; break;
        }
        
        // Animate the value change
        animateValue(el, parseInt(el.textContent) || 0, value, 800);
    });
    
    // Update trends with real data calculations
    document.querySelectorAll('.stats-container .stat-trend').forEach((el, index) => {
        let trend;
        switch(index) {
            case 0: trend = trends.total; break;
            case 1: trend = trends.awaiting; break;
            case 2: trend = trends.interviews; break;
            case 3: trend = trends.certificates; break;
        }
        
        // Remove previous class to ensure correct color
        el.classList.remove('up', 'down');
        
        // Update text and add appropriate class
        el.textContent = trend;
        if (trend.startsWith('+')) {
            el.classList.add('up');
        } else if (trend.startsWith('-')) {
            el.classList.add('down');
        }
    });
    
    // Update status counts
    document.querySelectorAll('.status-stats .status-value').forEach((el, index) => {
        let value;
        switch(index) {
            case 0: value = stats.submitted; break;
            case 1: value = stats.inReview; break;
            case 2: value = stats.approved; break;
            case 3: value = stats.rejected; break;
            case 4: value = stats.certified; break;
        }
        
        // Animate the value change
        animateValue(el, parseInt(el.textContent) || 0, value, 800);
    });
    
    // Update status overview percentages
    updateStatusOverview(stats);
    
    // Update recent applications table
    updateRecentApplicationsTable(filteredApps);
}

// Animate value change for better UX
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Update the recent applications table on dashboard
function updateRecentApplicationsTable(applications) {
    const tableBody = document.getElementById('applicationsTableBody');
    if (!tableBody) return;
    
    // Sort applications by date (newest first)
    const sortedApps = applications.sort((a, b) => 
        new Date(b.submissionDate) - new Date(a.submissionDate)
    ).slice(0, 10); // Show only 10 most recent
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (sortedApps.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">Tidak ada pengajuan yang ditemukan</td>`;
        tableBody.appendChild(emptyRow);
        
        // Update pagination info
        const paginationInfo = document.querySelector('.pengajuan-terbaru .pagination span');
        if (paginationInfo) {
            paginationInfo.textContent = 'Menampilkan 0 dari 0 pengajuan';
        }
        return;
    }
    
    // Add rows for each application
    sortedApps.forEach((app, index) => {
        // Get contractor and worker details
        const contractor = window.app.state.contractors.find(c => c.id === app.contractorId) || 
            { name: 'Unknown', business: 'Unknown' };
        
        const worker = window.app.state.workers.find(w => w.id === app.workerId) || 
            { name: 'Unknown', position: 'Unknown' };
        
        // Get PIC (the last person who updated the status)
        const latestStatus = app.statusHistory && app.statusHistory.length > 0 ? 
            app.statusHistory[app.statusHistory.length - 1] : null;
        
        const pic = latestStatus ? window.app.getUserNameById(latestStatus.userId) : 'N/A';
        
        // Create row with animation delay based on index
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
        
        row.innerHTML = `
            <td>
                <div class="company">${contractor.name}</div>
                <div class="category">${contractor.business}</div>
            </td>
            <td>
                <div class="worker-name">${worker.name}</div>
                <div class="position">${worker.position}</div>
            </td>
            <td>${window.app.formatDate(app.submissionDate)}</td>
            <td>
                <span class="status ${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</span>
                <div class="duration">
                    <small>${window.app.calculateDuration(app.submissionDate)}</small>
                </div>
            </td>
            <td>${pic}</td>
            <td>
                <a href="#" class="action-link" data-id="${app.id}">Detail</a>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update pagination info
    const paginationInfo = document.querySelector('.pengajuan-terbaru .pagination span');
    if (paginationInfo) {
        paginationInfo.textContent = `Menampilkan ${sortedApps.length} dari ${applications.length} pengajuan`;
    }
}

// Load applications organized by status
function loadApplicationsByStatus() {
    // Create UI for application status sections if not already present
    let statusSection = document.querySelector('.status-detail-section');
    
    if (!statusSection) {
        // Create the container for status details
        statusSection = document.createElement('section');
        statusSection.className = 'status-detail-section';
        
        // Insert it after the pengajuan-terbaru section
        const recentApps = document.querySelector('.pengajuan-terbaru');
        if (recentApps && recentApps.parentNode) {
            recentApps.parentNode.insertBefore(statusSection, recentApps.nextSibling);
        } else {
            document.querySelector('main').appendChild(statusSection);
        }
        
        // Add title and container
        statusSection.innerHTML = `
            <h2>Detail Status Pengajuan</h2>
            <div class="status-detail-container">
                <div class="status-column" id="status-diajukan">
                    <div class="status-header">
                        <h3>Diajukan</h3>
                        <span class="status-count">0</span>
                    </div>
                    <div class="status-items"></div>
                </div>
                <div class="status-column" id="status-direview">
                    <div class="status-header">
                        <h3>Dalam Review</h3>
                        <span class="status-count">0</span>
                    </div>
                    <div class="status-items"></div>
                </div>
                <div class="status-column" id="status-interview">
                    <div class="status-header">
                        <h3>Interview</h3>
                        <span class="status-count">0</span>
                    </div>
                    <div class="status-items"></div>
                </div>
                <div class="status-column" id="status-ditolak">
                    <div class="status-header">
                        <h3>Ditolak</h3>
                        <span class="status-count">0</span>
                    </div>
                    <div class="status-items"></div>
                </div>
            </div>
            
            <style>
                .status-detail-section {
                    margin-top: 20px;
                }
                
                .status-detail-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .status-column {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 15px;
                    min-height: 200px;
                }
                
                .status-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 10px;
                }
                
                .status-header h3 {
                    margin: 0;
                    font-size: 16px;
                }
                
                .status-count {
                    background-color: #e9ecef;
                    color: #495057;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .status-items {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .status-item {
                    background-color: white;
                    border-radius: 6px;
                    padding: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .status-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 3px 5px rgba(0,0,0,0.1);
                }
                
                .status-item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .worker-info {
                    font-weight: 500;
                }
                
                .time-info {
                    font-size: 12px;
                    color: #6c757d;
                }
                
                .contractor-info {
                    font-size: 12px;
                    color: #6c757d;
                }
                
                .process-time {
                    font-size: 11px;
                    color: #0066cc;
                    margin-top: 5px;
                }
                
                #status-diajukan .status-header {
                    color: #0066cc;
                }
                
                #status-direview .status-header {
                    color: #ff9800;
                }
                
                #status-interview .status-header {
                    color: #2196f3;
                }
                
                #status-ditolak .status-header {
                    color: #f44336;
                }
                
                .empty-status {
                    text-align: center;
                    color: #777;
                    padding: 20px 0;
                    font-size: 14px;
                }
            </style>
        `;
    }
    
    // Group applications by status
    const applications = window.app.state.applications;
    const statusGroups = {
        'Diajukan': [],
        'Direview': [],
        'Menunggu Interview': [],
        'Ditolak': []
    };
    
    applications.forEach(app => {
        if (app.status === 'Diajukan') {
            statusGroups['Diajukan'].push(app);
        } else if (app.status === 'Direview' || app.status === 'Menunggu Review') {
            statusGroups['Direview'].push(app);
        } else if (app.status === 'Menunggu Interview' || app.status === 'Interview Terjadwal') {
            statusGroups['Menunggu Interview'].push(app);
        } else if (app.status === 'Ditolak') {
            statusGroups['Ditolak'].push(app);
        }
    });
    
    // Update the UI for each status group
    for (const [status, apps] of Object.entries(statusGroups)) {
        let containerId;
        switch(status) {
            case 'Diajukan': containerId = 'status-diajukan'; break;
            case 'Direview': containerId = 'status-direview'; break;
            case 'Menunggu Interview': containerId = 'status-interview'; break;
            case 'Ditolak': containerId = 'status-ditolak'; break;
        }
        
        const container = document.querySelector(`#${containerId} .status-items`);
        const countEl = document.querySelector(`#${containerId} .status-count`);
        
        if (container && countEl) {
            // Update count
            countEl.textContent = apps.length;
            
            // Clear existing items
            container.innerHTML = '';
            
            if (apps.length === 0) {
                container.innerHTML = '<div class="empty-status">Tidak ada pengajuan</div>';
                continue;
            }
            
            // Add status items
            apps.forEach(app => {
                const worker = window.app.state.workers.find(w => w.id === app.workerId) || { name: 'Unknown' };
                const contractor = window.app.state.contractors.find(c => c.id === app.contractorId) || { name: 'Unknown' };
                
                const statusItem = document.createElement('div');
                statusItem.className = 'status-item';
                statusItem.setAttribute('data-app-id', app.id);
                
                // Calculate how long the application has been in this status
                const latestStatus = app.statusHistory && app.statusHistory.length > 0 ? 
                    app.statusHistory.find(s => s.status === app.status) || app.statusHistory[app.statusHistory.length - 1] : null;
                
                const statusTime = latestStatus ? window.app.calculateDuration(latestStatus.timestamp) : '';
                
                statusItem.innerHTML = `
                    <div class="status-item-header">
                        <span class="worker-info">${worker.name}</span>
                        <span class="time-info">${window.app.formatDate(app.submissionDate, false)}</span>
                    </div>
                    <div class="contractor-info">${contractor.name}</div>
                    <div class="process-time">Proses: ${statusTime}</div>
                `;
                
                // Add click event to show details
                statusItem.addEventListener('click', () => {
                    openApplicationDetail(app.id);
                });
                
                container.appendChild(statusItem);
            });
        }
    }
}

// Open application detail view
function openApplicationDetail(appId) {
    // Find the application
    const app = window.app.state.applications.find(a => a.id === appId);
    if (!app) {
        window.app.showNotification('Pengajuan tidak ditemukan', 'error');
        return;
    }
    
    // Find related data
    const contractor = window.app.state.contractors.find(c => c.id === app.contractorId) || {};
    const worker = window.app.state.workers.find(w => w.id === app.workerId) || {};
    
    // Switch to detail view
    document.querySelector('.detail-pengajuan').style.display = 'block';
    document.querySelectorAll('main > section').forEach(section => {
        if (!section.classList.contains('detail-pengajuan')) {
            section.style.display = 'none';
        }
    });
    
    // Update contractor details
    document.querySelector('.detail-section:nth-child(1) .detail-row:nth-child(1) .detail-value').textContent = contractor.name || '-';
    document.querySelector('.detail-section:nth-child(1) .detail-row:nth-child(2) .detail-value').textContent = contractor.business || '-';
    document.querySelector('.detail-section:nth-child(1) .detail-row:nth-child(3) .detail-value').textContent = contractor.address || '-';
    document.querySelector('.detail-section:nth-child(1) .detail-row:nth-child(4) .detail-value').textContent = contractor.contactPerson || '-';
    document.querySelector('.detail-section:nth-child(1) .detail-row:nth-child(5) .detail-value').textContent = contractor.phone || '-';
    
    // Update worker details
    document.querySelector('.detail-section:nth-child(2) .detail-row:nth-child(1) .detail-value').textContent = worker.name || '-';
    document.querySelector('.detail-section:nth-child(2) .detail-row:nth-child(2) .detail-value').textContent = worker.nik || '-';
    document.querySelector('.detail-section:nth-child(2) .detail-row:nth-child(3) .detail-value').textContent = worker.position || '-';
    document.querySelector('.detail-section:nth-child(2) .detail-row:nth-child(4) .detail-value').textContent = 
        worker.certifications ? worker.certifications.join(', ') : '-';
    document.querySelector('.detail-section:nth-child(2) .detail-row:nth-child(5) .detail-value').textContent = 
        worker.workExperience && worker.workExperience.length > 0 ? 
        `${worker.workExperience[0].position} at ${worker.workExperience[0].company}` : '-';
    
    // Update heading
    document.querySelector('.detail-pengajuan h2').textContent = `Detail Pengajuan - ${app.id}`;
    
    // Add back button if not already present
    if (!document.querySelector('.detail-pengajuan .back-link')) {
        const backLink = document.createElement('a');
        backLink.className = 'back-link';
        backLink.href = '#';
        backLink.textContent = '← Kembali ke Dashboard';
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.app.changeView('dashboard');
        });
        
        document.querySelector('.detail-pengajuan').insertBefore(
            backLink, 
            document.querySelector('.detail-pengajuan .detail-container')
        );
    }
    
    // Update action buttons based on current status
    const actionButtons = document.querySelector('.review-section .action-buttons');
    if (actionButtons) {
        // Only show appropriate actions based on status
        switch(app.status) {
            case 'Diajukan':
            case 'Menunggu Review':
            case 'Direview':
                actionButtons.innerHTML = `
                    <button class="reject-btn" data-app-id="${app.id}">Tolak</button>
                    <button class="hold-btn" data-app-id="${app.id}">Hold</button>
                    <button class="approve-btn" data-app-id="${app.id}">Setujui</button>
                `;
                break;
            case 'Disetujui':
                actionButtons.innerHTML = `
                    <button class="schedule-btn" data-app-id="${app.id}">Jadwalkan Interview</button>
                `;
                break;
            case 'Menunggu Interview':
                actionButtons.innerHTML = `
                    <button class="cancel-btn" data-app-id="${app.id}">Batalkan</button>
                    <button class="reschedule-btn" data-app-id="${app.id}">Reschedule</button>
                `;
                break;
            case 'Interview Selesai':
                actionButtons.innerHTML = `
                    <button class="reject-btn" data-app-id="${app.id}">Tolak</button>
                    <button class="issue-cert-btn" data-app-id="${app.id}">Terbitkan Sertifikat</button>
                `;
                break;
            case 'Sertifikat Terbit':
                actionButtons.innerHTML = `
                    <button class="view-cert-btn" data-app-id="${app.id}">Lihat Sertifikat</button>
                `;
                break;
            default:
                actionButtons.innerHTML = ''; // No actions for other statuses
        }
        
        // Add event listeners for action buttons
        actionButtons.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function() {
                const appId = this.getAttribute('data-app-id');
                const action = this.className.replace('-btn', '');
                
                // Handle different actions
                handleApplicationAction(appId, action);
            });
        });
    }
    
    // Add application status history if not already present
    addApplicationStatusHistory(app);
}

// Add application status history to detail view
function addApplicationStatusHistory(app) {
    // Check if history section already exists
    let historySection = document.querySelector('.application-history');
    
    if (!historySection) {
        // Create history section
        historySection = document.createElement('div');
        historySection.className = 'application-history';
        historySection.innerHTML = `
            <h3>Riwayat Status</h3>
            <div class="timeline"></div>
            
            <style>
                .application-history {
                    margin-top: 20px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    padding: 20px;
                }
                
                .timeline {
                    position: relative;
                    padding-left: 30px;
                    margin-top: 20px;
                }
                
                .timeline::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10px;
                    height: 100%;
                    width: 2px;
                    background-color: #e0e0e0;
                }
                
                .timeline-item {
                    position: relative;
                    padding-bottom: 20px;
                }
                
                .timeline-icon {
                    position: absolute;
                    left: -20px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #0066cc;
                    border: 3px solid #fff;
                    z-index: 1;
                }
                
                .timeline-content {
                    background-color: #f9f9f9;
                    border-radius: 4px;
                    padding: 15px;
                }
                
                .timeline-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                
                .timeline-status {
                    font-weight: 500;
                }
                
                .timeline-date {
                    font-size: 12px;
                    color: #777;
                }
                
                .timeline-user {
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                
                .timeline-notes {
                    font-size: 14px;
                    color: #333;
                }
                
                /* Status colors */
                .timeline-icon.diajukan { background-color: #0066cc; }
                .timeline-icon.direview { background-color: #ff9800; }
                .timeline-icon.disetujui { background-color: #4caf50; }
                .timeline-icon.ditolak { background-color: #f44336; }
                .timeline-icon.interview { background-color: #2196f3; }
                .timeline-icon.sertifikat { background-color: #9c27b0; }
            </style>
        `;
        
        // Add to page
        document.querySelector('.detail-pengajuan').appendChild(historySection);
    }
    
    // Get the timeline container
    const timeline = historySection.querySelector('.timeline');
    timeline.innerHTML = ''; // Clear existing items
    
    // If no history, show message
    if (!app.statusHistory || app.statusHistory.length === 0) {
        timeline.innerHTML = '<p>Belum ada riwayat status</p>';
        return;
    }
    
    // Add timeline items
    app.statusHistory.forEach(status => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        // Get status class for icon
        let statusClass = '';
        switch(status.status) {
            case 'Diajukan': statusClass = 'diajukan'; break;
            case 'Menunggu Review':
            case 'Direview': statusClass = 'direview'; break;
            case 'Disetujui': statusClass = 'disetujui'; break;
            case 'Ditolak': statusClass = 'ditolak'; break;
            case 'Menunggu Interview':
            case 'Interview Terjadwal':
            case 'Interview Selesai': statusClass = 'interview'; break;
            case 'Sertifikat Terbit': statusClass = 'sertifikat'; break;
            default: statusClass = 'direview';
        }
        
        // Get user name
        const userName = window.app.getUserNameById(status.userId);
        
        timelineItem.innerHTML = `
            <div class="timeline-icon ${statusClass}"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <span class="timeline-status">${status.status}</span>
                    <span class="timeline-date">${window.app.formatDate(status.timestamp, true)}</span>
                </div>
                <div class="timeline-user">Oleh: ${userName}</div>
                <div class="timeline-notes">${status.notes || 'Tidak ada catatan'}</div>
            </div>
        `;
        
        timeline.appendChild(timelineItem);
    });
}

// Handle application actions (approve, reject, etc)
function handleApplicationAction(appId, action) {
    console.log(`Handling action ${action} for application ${appId}`);
    
    // Find the application
    const appIndex = window.app.state.applications.findIndex(a => a.id === appId);
    if (appIndex === -1) {
        window.app.showNotification('Pengajuan tidak ditemukan', 'error');
        return;
    }
    
    const app = window.app.state.applications[appIndex];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    switch(action) {
        case 'approve':
            // Update application status
            app.status = 'Disetujui';
            
            // Add to status history
            app.statusHistory.push({
                status: 'Disetujui',
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                notes: 'Pengajuan disetujui, menunggu jadwal interview'
            });
            
            window.app.showNotification('Pengajuan berhasil disetujui', 'info');
            break;
            
        case 'reject':
            // Get rejection reason
            const reason = prompt('Alasan penolakan:');
            if (reason === null) return; // User canceled
            
            // Update application status
            app.status = 'Ditolak';
            
            // Add to status history
            app.statusHistory.push({
                status: 'Ditolak',
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                notes: reason || 'Pengajuan ditolak'
            });
            
            window.app.showNotification('Pengajuan telah ditolak', 'info');
            break;
            
        case 'hold':
            // Get hold reason
            const holdReason = prompt('Alasan hold:');
            if (holdReason === null) return; // User canceled
            
            // Update application status
            app.status = 'On Hold';
            
            // Add to status history
            app.statusHistory.push({
                status: 'On Hold',
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                notes: holdReason || 'Pengajuan di-hold'
            });
            
            window.app.showNotification('Pengajuan telah di-hold', 'info');
            break;
            
        case 'schedule':
            // This would typically open a scheduling modal
            // For now, just update status
            app.status = 'Menunggu Interview';
            
            // Add to status history
            app.statusHistory.push({
                status: 'Menunggu Interview',
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                notes: 'Menunggu jadwal interview'
            });
            
            window.app.showNotification('Pengajuan menunggu jadwal interview', 'info');
            break;
            
        case 'issueCert':
            // This would typically open a certificate issuance form
            // For now, just update status
            app.status = 'Sertifikat Terbit';
            
            // Add to status history
            app.statusHistory.push({
                status: 'Sertifikat Terbit',
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                notes: 'Sertifikat telah diterbitkan'
            });
            
            // Create a certificate
            const certId = window.app.generateId('CERT');
            const now = new Date();
            const expiryDate = new Date();
            expiryDate.setFullYear(now.getFullYear() + 1); // Valid for 1 year
            
            const newCertificate = {
                id: certId,
                applicationId: appId,
                workerId: app.workerId,
                contractorId: app.contractorId,
                type: 'SBTC',
                issueDate: now.toISOString().split('T')[0],
                expiryDate: expiryDate.toISOString().split('T')[0],
                status: 'Active',
                issuedBy: currentUser.id,
                certNumber: `SBTC-${now.getFullYear()}-${window.app.state.certificates.length + 1}`,
                notes: 'Sertifikat SBTC'
            };
            
            window.app.state.certificates.push(newCertificate);
            
            window.app.showNotification('Sertifikat berhasil diterbitkan', 'info');
            break;
            
        case 'viewCert':
            // This would typically open the certificate view
            window.app.showNotification('Fitur lihat sertifikat belum tersedia', 'info');
            break;
            
        default:
            window.app.showNotification('Aksi tidak tersedia', 'error');
    }
    
    // Update application in state
    window.app.state.applications[appIndex] = app;
    
    // Update UI and notify other modules about the data change
    updateDashboardStats();
    loadApplicationsByStatus();
    window.app.notifyDataChange('applications');
    
    // Update application detail view
    openApplicationDetail(appId);
}// Get previous period statistics for comparison
function getPreviousPeriodStats(period) {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;
    
    // Define current period start and previous period based on selected period
    switch(period) {
        case 'all':
            // For 'all', we'll compare with the same amount of time in the past
            // Example: if we have 6 months of data, compare with the previous 6 months
            const oldestApp = window.app.state.applications.reduce((oldest, app) => {
                const appDate = new Date(app.submissionDate);
                return appDate < oldest ? appDate : oldest;
            }, new Date());
            
            const totalDuration = now - oldestApp;
            currentPeriodStart = oldestApp;
            previousPeriodStart = new Date(oldestApp.getTime() - totalDuration);
            previousPeriodEnd = new Date(oldestApp.getTime() - 1); // 1 ms before current period
            break;
            
        case 'today':
            currentPeriodStart = new Date(now.setHours(0, 0, 0, 0));
            previousPeriodStart = new Date(currentPeriodStart);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
            previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
            break;
            
        case 'week':
            currentPeriodStart = new Date(now);
            currentPeriodStart.setDate(now.getDate() - now.getDay()); // Start of this week
            currentPeriodStart.setHours(0, 0, 0, 0);
            
            previousPeriodStart = new Date(currentPeriodStart);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 7); // Start of previous week
            
            previousPeriodEnd = new Date(currentPeriodStart);
            previousPeriodEnd.setMilliseconds(previousPeriodEnd.getMilliseconds() - 1); // End of previous week
            break;
            
        case 'month':
            currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            
            previousPeriodStart = new Date(currentPeriodStart);
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1); // Start of previous month
            
            previousPeriodEnd = new Date(currentPeriodStart);
            previousPeriodEnd.setMilliseconds(previousPeriodEnd.getMilliseconds() - 1); // End of previous month
            break;
            
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            currentPeriodStart = new Date(now.getFullYear(), quarter * 3, 1);
            
            previousPeriodStart = new Date(currentPeriodStart);
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3); // Start of previous quarter
            
            previousPeriodEnd = new Date(currentPeriodStart);
            previousPeriodEnd.setMilliseconds(previousPeriodEnd.getMilliseconds() - 1); // End of previous quarter
            break;
            
        case 'year':
            currentPeriodStart = new Date(now.getFullYear(), 0, 1);
            
            previousPeriodStart = new Date(currentPeriodStart);
            previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1); // Start of previous year
            
            previousPeriodEnd = new Date(currentPeriodStart);
            previousPeriodEnd.setMilliseconds(previousPeriodEnd.getMilliseconds() - 1); // End of previous year
            break;
            
        default:
            // Default fallback
            previousPeriodStart = new Date(now);
            previousPeriodStart.setMonth(now.getMonth() - 1);
            previousPeriodEnd = new Date(now);
            break;
    }
    
    // Filter applications for the previous period
    const previousApps = window.app.state.applications.filter(app => {
        const appDate = new Date(app.submissionDate);
        return appDate >= previousPeriodStart && appDate <= previousPeriodEnd;
    });
    
    // Previous period certificates
    const previousCerts = window.app.state.certificates.filter(cert => {
        const certDate = new Date(cert.issueDate);
        return certDate >= previousPeriodStart && certDate <= previousPeriodEnd;
    });
    
    // Calculate statistics for previous period
    return {
        total: previousApps.length,
        awaiting: previousApps.filter(app => app.status === 'Menunggu Review').length,
        interviews: previousApps.filter(app => app.status === 'Menunggu Interview').length,
        certificates: previousCerts.length,
        submitted: previousApps.filter(app => app.status === 'Diajukan').length,
        inReview: previousApps.filter(app => app.status === 'Direview').length,
        approved: previousApps.filter(app => app.status === 'Disetujui').length,
        rejected: previousApps.filter(app => app.status === 'Ditolak').length,
        certified: previousApps.filter(app => app.status === 'Sertifikat Terbit').length
    };
}

// Calculate trend percentage between previous and current value
function calculateTrendPercentage(previousValue, currentValue) {
    // If previous value is 0, handle special case to avoid division by zero
    if (previousValue === 0) {
        if (currentValue === 0) return '0%'; // No change
        return '+100%'; // Technically infinite increase, but cap at 100%
    }
    
    const percentChange = ((currentValue - previousValue) / previousValue) * 100;
    
    // Format with sign and fixed decimal points
    const formattedPercentage = percentChange > 0 
        ? `+${percentChange.toFixed(0)}%` 
        : `${percentChange.toFixed(0)}%`;
    
    return formattedPercentage;
}

// Update status overview with real percentages
function updateStatusOverview(stats) {
    // Calculate total of all statuses
    const totalStatusItems = 
        stats.submitted + 
        stats.inReview + 
        stats.approved + 
        stats.rejected + 
        stats.certified;
    
    // Update percentage on UI if elements exist
    const statusProgressBars = document.querySelectorAll('.status-progress-bar');
    if (statusProgressBars.length > 0) {
        // Submitted
        if (statusProgressBars[0]) {
            const percentage = totalStatusItems > 0 ? (stats.submitted / totalStatusItems * 100) : 0;
            statusProgressBars[0].style.width = `${percentage}%`;
            statusProgressBars[0].setAttribute('data-percentage', `${Math.round(percentage)}%`);
        }
        
        // In Review
        if (statusProgressBars[1]) {
            const percentage = totalStatusItems > 0 ? (stats.inReview / totalStatusItems * 100) : 0;
            statusProgressBars[1].style.width = `${percentage}%`;
            statusProgressBars[1].setAttribute('data-percentage', `${Math.round(percentage)}%`);
        }
        
        // Approved
        if (statusProgressBars[2]) {
            const percentage = totalStatusItems > 0 ? (stats.approved / totalStatusItems * 100) : 0;
            statusProgressBars[2].style.width = `${percentage}%`;
            statusProgressBars[2].setAttribute('data-percentage', `${Math.round(percentage)}%`);
        }
        
        // Rejected
        if (statusProgressBars[3]) {
            const percentage = totalStatusItems > 0 ? (stats.rejected / totalStatusItems * 100) : 0;
            statusProgressBars[3].style.width = `${percentage}%`;
            statusProgressBars[3].setAttribute('data-percentage', `${Math.round(percentage)}%`);
        }
        
        // Certified
        if (statusProgressBars[4]) {
            const percentage = totalStatusItems > 0 ? (stats.certified / totalStatusItems * 100) : 0;
            statusProgressBars[4].style.width = `${percentage}%`;
            statusProgressBars[4].setAttribute('data-percentage', `${Math.round(percentage)}%`);
        }
    }
}