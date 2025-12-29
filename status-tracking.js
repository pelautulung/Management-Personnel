// Status Tracking Module for SBTC System
// Handles tracking and displaying application status history

// Initialize the status tracking module
function initStatusTracking() {
    console.log('Initializing status tracking module...');
    setupStatusFilters();
}

// Set up status filters and controls
function setupStatusFilters() {
    // Status filter dropdown
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterApplicationsByStatus(this.value);
        });
    }
    
    // Search input
    const searchInput = document.getElementById('statusSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchApplications(this.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('.status-pengajuan .refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadApplicationStatuses();
        });
    }
}

// Load application statuses
function loadApplicationStatuses() {
    console.log('Loading application statuses...');
    
    // Get applications from state
    const applications = window.app.state.applications;
    
    // Get current user for filtering if contractor
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Filter applications if user is contractor
    let filteredApplications = applications;
    if (currentUser.role === 'contractor') {
        filteredApplications = applications.filter(app => app.contractorId === currentUser.id);
    }
    
    // Get container
    const container = document.querySelector('.status-pengajuan .application-list-container');
    if (!container) {
        console.error('Application list container not found');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Display message if no applications
    if (filteredApplications.length === 0) {
        container.innerHTML = '<div class="no-data">Tidak ada pengajuan yang ditemukan</div>';
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID PENGAJUAN</th>
                <th>KONTRAKTOR</th>
                <th>PEKERJA</th>
                <th>TANGGAL PENGAJUAN</th>
                <th>STATUS TERAKHIR</th>
                <th>AKSI</th>
            </tr>
        </thead>
        <tbody id="statusTableBody">
        </tbody>
    `;
    
    container.appendChild(table);
    
    // Get table body
    const tableBody = document.getElementById('statusTableBody');
    
    // Add rows for each application
    filteredApplications.forEach(app => {
        // Get contractor and worker details
        const contractor = window.app.state.contractors.find(c => c.id === app.contractorId) || { name: 'Unknown' };
        let workerNames = '';
        
        if (app.workers && app.workers.length > 0) {
            workerNames = app.workers.map(w => w.name).join(', ');
        } else if (app.workerId) {
            const worker = window.app.state.workers.find(w => w.id === app.workerId);
            workerNames = worker ? worker.name : 'Unknown';
        }
        
        // Get latest status
        const latestStatus = app.statusHistory && app.statusHistory.length > 0 
            ? app.statusHistory[app.statusHistory.length - 1] 
            : { status: 'Unknown', timestamp: app.submissionDate || new Date().toISOString() };
        
        // Create row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.id}</td>
            <td>${contractor.name}</td>
            <td>${workerNames}</td>
            <td>${window.app.formatDate(app.submissionDate)}</td>
            <td>
                <span class="status-badge ${getStatusClass(latestStatus.status)}">
                    ${latestStatus.status}
                </span>
            </td>
            <td>
                <button class="view-detail-btn" data-id="${app.id}">Detail</button>
                <button class="view-history-btn" data-id="${app.id}">Riwayat</button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Add event listeners for buttons
        const detailBtn = row.querySelector('.view-detail-btn');
        if (detailBtn) {
            detailBtn.addEventListener('click', function() {
                viewApplicationDetail(this.getAttribute('data-id'));
            });
        }
        
        const historyBtn = row.querySelector('.view-history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                viewStatusHistory(this.getAttribute('data-id'));
            });
        }
    });
    
    // Add pagination
    addPagination(container, filteredApplications.length);
}

// Filter applications by status
function filterApplicationsByStatus(status) {
    // Get all rows
    const rows = document.querySelectorAll('#statusTableBody tr');
    
    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(5) .status-badge');
        if (!statusCell) return;
        
        const rowStatus = statusCell.textContent.trim();
        
        if (status === 'all' || rowStatus === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update pagination
    updatePaginationCount();
}

// Search applications
function searchApplications(query) {
    if (!query) {
        // Show all rows if query is empty
        document.querySelectorAll('#statusTableBody tr').forEach(row => {
            row.style.display = '';
        });
        updatePaginationCount();
        return;
    }
    
    query = query.toLowerCase();
    
    // Get all rows
    const rows = document.querySelectorAll('#statusTableBody tr');
    
    rows.forEach(row => {
        const id = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const contractor = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const worker = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (id.includes(query) || contractor.includes(query) || worker.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update pagination
    updatePaginationCount();
}

// Update pagination count
function updatePaginationCount() {
    const visibleRows = document.querySelectorAll('#statusTableBody tr[style="display: none;"]').length;
    const totalRows = document.querySelectorAll('#statusTableBody tr').length;
    
    const paginationSpan = document.querySelector('.status-pengajuan .pagination span');
    if (paginationSpan) {
        paginationSpan.textContent = `Menampilkan ${totalRows - visibleRows} dari ${totalRows} pengajuan`;
    }
}

// Add pagination
function addPagination(container, totalItems) {
    // Create pagination
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.innerHTML = `
        <span>Menampilkan ${totalItems} dari ${totalItems} pengajuan</span>
        <div class="pagination-controls">
            <a href="#" class="pagination-btn">Sebelumnya</a>
            <a href="#" class="pagination-btn active">1</a>
            <a href="#" class="pagination-btn">Selanjutnya</a>
        </div>
    `;
    
    container.appendChild(pagination);
}

// View application detail
function viewApplicationDetail(applicationId) {
    // Find application
    const application = window.app.state.applications.find(app => app.id === applicationId);
    if (!application) {
        window.app.showNotification('Pengajuan tidak ditemukan', 'error');
        return;
    }
    
    // Find contractor
    const contractor = window.app.state.contractors.find(c => c.id === application.contractorId);
    
    // Find worker(s)
    let workers = [];
    if (application.workers && application.workers.length > 0) {
        workers = application.workers;
    } else if (application.workerId) {
        const worker = window.app.state.workers.find(w => w.id === application.workerId);
        if (worker) workers.push(worker);
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Detail Pengajuan ${application.id}</h2>
            
            <div class="detail-container">
                <div class="detail-section">
                    <h3>Data Kontraktor</h3>
                    ${contractor ? `
                        <div class="detail-row">
                            <div class="detail-label">Nama Perusahaan</div>
                            <div class="detail-value">${contractor.name}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Jenis Usaha</div>
                            <div class="detail-value">${contractor.business}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Alamat</div>
                            <div class="detail-value">${contractor.address}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Kontak Person</div>
                            <div class="detail-value">${contractor.contactPerson}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">No. Telepon</div>
                            <div class="detail-value">${contractor.phone}</div>
                        </div>
                    ` : '<div class="no-data">Data kontraktor tidak tersedia</div>'}
                </div>
                
                ${workers.length > 0 ? workers.map(worker => `
                    <div class="detail-section">
                        <h3>Data Pekerja: ${worker.name}</h3>
                        <div class="detail-row">
                            <div class="detail-label">NIK</div>
                            <div class="detail-value">${worker.nik || '-'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Tanggal Lahir</div>
                            <div class="detail-value">${worker.birthDate ? window.app.formatDate(worker.birthDate) : '-'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Posisi/Jabatan</div>
                            <div class="detail-value">${worker.position}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">No. Telepon</div>
                            <div class="detail-value">${worker.phone || '-'}</div>
                        </div>
                        ${worker.email ? `
                            <div class="detail-row">
                                <div class="detail-label">Email</div>
                                <div class="detail-value">${worker.email}</div>
                            </div>
                        ` : ''}
                    </div>
                `).join('') : '<div class="detail-section"><div class="no-data">Data pekerja tidak tersedia</div></div>'}
                
                <div class="detail-section">
                    <h3>Status Pengajuan</h3>
                    <div class="detail-row">
                        <div class="detail-label">Tanggal Pengajuan</div>
                        <div class="detail-value">${window.app.formatDate(application.submissionDate, true)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Status Terakhir</div>
                        <div class="detail-value">
                            <span class="status-badge ${getStatusClass(application.status)}">
                                ${application.status}
                            </span>
                        </div>
                    </div>
                    ${application.notes ? `
                        <div class="detail-row">
                            <div class="detail-label">Catatan</div>
                            <div class="detail-value">${application.notes}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="history-btn" data-id="${application.id}">Lihat Riwayat Status</button>
                <button class="close-btn">Tutup</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Close modal when clicking close button or outside
    modal.querySelector('.close').addEventListener('click', function() {
        closeModal(modal);
    });
    
    modal.querySelector('.close-btn').addEventListener('click', function() {
        closeModal(modal);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // History button
    const historyBtn = modal.querySelector('.history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            closeModal(modal);
            viewStatusHistory(this.getAttribute('data-id'));
        });
    }
    
    // Add modal styles if not already added
    if (!document.getElementById('modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'modal-styles';
        modalStyles.innerHTML = `
            .modal {
                display: flex;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal-content {
                background-color: #fefefe;
                margin: 10% auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            }
            
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                top: 10px;
                right: 20px;
            }
            
            .close:hover,
            .close:focus {
                color: black;
                text-decoration: none;
            }
            
            .modal h2 {
                margin-top: 0;
                margin-bottom: 20px;
                color: #0066cc;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-actions {
                margin-top: 20px;
                text-align: right;
            }
            
            .modal-actions button {
                padding: 8px 16px;
                margin-left: 10px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .history-btn {
                background-color: #0066cc;
                color: white;
                border: none;
            }
            
            .close-btn {
                background-color: #f8f9fa;
                border: 1px solid #ddd;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                color: white;
            }
            
            .status-diajukan {
                background-color: #0066cc;
            }
            
            .status-direview {
                background-color: #ff9800;
            }
            
            .status-disetujui {
                background-color: #4caf50;
            }
            
            .status-ditolak {
                background-color: #f44336;
            }
            
            .no-data {
                padding: 20px;
                text-align: center;
                color: #666;
                font-style: italic;
            }
        `;
        document.head.appendChild(modalStyles);
    }
}

// View status history
function viewStatusHistory(applicationId) {
    // Find application
    const application = window.app.state.applications.find(app => app.id === applicationId);
    if (!application) {
        window.app.showNotification('Pengajuan tidak ditemukan', 'error');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Riwayat Status Pengajuan ${application.id}</h2>
            
            <div class="history-container">
                ${application.statusHistory && application.statusHistory.length > 0 ? `
                    <div class="timeline">
                        ${application.statusHistory.map((history, index) => `
                            <div class="timeline-item">
                                <div class="timeline-badge ${getStatusClass(history.status)}"></div>
                                <div class="timeline-content">
                                    <h3>
                                        ${history.status}
                                        <span class="timeline-date">${window.app.formatDate(history.timestamp, true)}</span>
                                    </h3>
                                    <p class="timeline-user">Oleh: ${window.app.getUserNameById(history.userId)}</p>
                                    ${history.notes ? `<p class="timeline-notes">${history.notes}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-data">Tidak ada riwayat status yang tersedia</div>'}
            </div>
            
            <div class="modal-actions">
                <button class="detail-btn" data-id="${application.id}">Lihat Detail Pengajuan</button>
                <button class="close-btn">Tutup</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Close modal when clicking close button or outside
    modal.querySelector('.close').addEventListener('click', function() {
        closeModal(modal);
    });
    
    modal.querySelector('.close-btn').addEventListener('click', function() {
        closeModal(modal);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Detail button
    const detailBtn = modal.querySelector('.detail-btn');
    if (detailBtn) {
        detailBtn.addEventListener('click', function() {
            closeModal(modal);
            viewApplicationDetail(this.getAttribute('data-id'));
        });
    }
    
    // Add timeline styles if not already added
    if (!document.getElementById('timeline-styles')) {
        const timelineStyles = document.createElement('style');
        timelineStyles.id = 'timeline-styles';
        timelineStyles.innerHTML = `
            .history-container {
                max-height: 60vh;
                overflow-y: auto;
                padding: 0 10px;
            }
            
            .timeline {
                position: relative;
                margin: 20px 0;
                padding-left: 30px;
            }
            
            .timeline:before {
                content: '';
                position: absolute;
                left: 10px;
                top: 0;
                bottom: 0;
                width: 2px;
                background-color: #e9ecef;
                z-index: 1;
            }
            
            .timeline-item {
                position: relative;
                margin-bottom: 30px;
            }
            
            .timeline-badge {
                position: absolute;
                left: -30px;
                top: 0;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                z-index: 2;
            }
            
            .timeline-content {
                background-color: #f8f9fa;
                border-radius: 4px;
                padding: 15px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .timeline-content h3 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .timeline-date {
                font-size: 12px;
                color: #6c757d;
                font-weight: normal;
            }
            
            .timeline-user {
                font-size: 14px;
                color: #495057;
                margin-bottom: 8px;
            }
            
            .timeline-notes {
                font-size: 14px;
                color: #212529;
                margin-bottom: 0;
            }
        `;
        document.head.appendChild(timelineStyles);
    }
}

// Close modal
function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// Get status class for styling
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'diajukan':
            return 'status-diajukan';
        case 'direview':
        case 'menunggu review':
            return 'status-direview';
        case 'disetujui':
            return 'status-disetujui';
        case 'ditolak':
            return 'status-ditolak';
        default:
            return '';
    }
}

// Export function for use in main script
window.initStatusTracking = initStatusTracking;