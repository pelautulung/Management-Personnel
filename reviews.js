// Reviews module for SBTC System
// Handles application review process by HSSE and Engineering personnel

// Initialize the reviews module
function initReviews() {
    console.log('Initializing reviews module...');
    setupReviewFilters();
    loadPendingReviews();
}

// Set up review section filters
function setupReviewFilters() {
    const reviewSection = document.querySelector('.review');
    if (!reviewSection) {
        // Create review section if it doesn't exist
        createReviewSection();
        return;
    }

    // Add filter controls if they don't exist
    if (!reviewSection.querySelector('.filter-controls')) {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h1>Review Pengajuan</h1>
            <div class="filter-controls">
                <select id="reviewTypeFilter">
                    <option value="all">Semua Tipe</option>
                    <option value="hsse">HSSE</option>
                    <option value="engineering">Engineering</option>
                </select>
                <select id="reviewStatusFilter">
                    <option value="pending">Menunggu Review</option>
                    <option value="all">Semua Status</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                </select>
                <button class="refresh-btn" id="refreshReviews">
                    <span>Refresh</span>
                </button>
            </div>
        `;
        
        // Insert at the beginning of review section
        reviewSection.insertBefore(header, reviewSection.firstChild);
        
        // Add event listeners
        const typeFilter = document.getElementById('reviewTypeFilter');
        const statusFilter = document.getElementById('reviewStatusFilter');
        const refreshBtn = document.getElementById('refreshReviews');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', function() {
                loadFilteredReviews();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                loadFilteredReviews();
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                this.classList.add('refreshing');
                loadFilteredReviews();
                
                setTimeout(() => {
                    this.classList.remove('refreshing');
                    window.app.showNotification('Data telah diperbarui', 'info');
                }, 800);
            });
        }
    }
}

// Create review section if it doesn't exist
function createReviewSection() {
    // Check if main element exists
    const main = document.querySelector('main');
    if (!main) return;
    
    // Create review section
    const reviewSection = document.createElement('section');
    reviewSection.className = 'review';
    reviewSection.style.display = 'none';
    
    reviewSection.innerHTML = `
        <div class="section-header">
            <h1>Review Pengajuan</h1>
            <div class="filter-controls">
                <select id="reviewTypeFilter">
                    <option value="all">Semua Tipe</option>
                    <option value="hsse">HSSE</option>
                    <option value="engineering">Engineering</option>
                </select>
                <select id="reviewStatusFilter">
                    <option value="pending">Menunggu Review</option>
                    <option value="all">Semua Status</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                </select>
                <button class="refresh-btn" id="refreshReviews">
                    <span>Refresh</span>
                </button>
            </div>
        </div>

        <div class="reviews-container">
            <div class="review-list">
                <table class="data-table" id="reviewsTable">
                    <thead>
                        <tr>
                            <th>PEKERJA</th>
                            <th>KONTRAKTOR</th>
                            <th>POSISI</th>
                            <th>TIPE REVIEW</th>
                            <th>TANGGAL PENGAJUAN</th>
                            <th>STATUS</th>
                            <th>AKSI</th>
                        </tr>
                    </thead>
                    <tbody id="reviewsTableBody">
                        <!-- Will be populated by JavaScript -->
                    </tbody>
                </table>
                <div class="pagination" id="reviewsPagination">
                    <span>Menampilkan 0 dari 0 pengajuan</span>
                    <div class="pagination-controls">
                        <a href="#" class="pagination-btn">Sebelumnya</a>
                        <a href="#" class="pagination-btn active">1</a>
                        <a href="#" class="pagination-btn">Selanjutnya</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="reviewDetailModal" class="modal">
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detail Pengajuan</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to main element
    main.appendChild(reviewSection);
    
    // Add event listeners
    const typeFilter = document.getElementById('reviewTypeFilter');
    const statusFilter = document.getElementById('reviewStatusFilter');
    const refreshBtn = document.getElementById('refreshReviews');
    
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            loadFilteredReviews();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            loadFilteredReviews();
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            loadFilteredReviews();
            
            setTimeout(() => {
                this.classList.remove('refreshing');
                window.app.showNotification('Data telah diperbarui', 'info');
            }, 800);
        });
    }
    
    // Close modal when clicking on close button or outside
    const modal = document.getElementById('reviewDetailModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal.querySelector('.modal-overlay')) {
                modal.style.display = 'none';
            }
        });
    }
}

// Load pending reviews
function loadPendingReviews() {
    loadFilteredReviews('all', 'pending');
}

// Load filtered reviews
function loadFilteredReviews(type, status) {
    // Get filter values if not provided
    if (!type) {
        const typeFilter = document.getElementById('reviewTypeFilter');
        type = typeFilter ? typeFilter.value : 'all';
    }
    
    if (!status) {
        const statusFilter = document.getElementById('reviewStatusFilter');
        status = statusFilter ? statusFilter.value : 'pending';
    }
    
    // Filter applications based on criteria
    let filteredApps = window.app.state.applications;
    
    // Apply status filter
    if (status !== 'all') {
        switch(status) {
            case 'pending':
                filteredApps = filteredApps.filter(app => 
                    app.status === 'Menunggu Review' || app.status === 'Direview');
                break;
            case 'approved':
                filteredApps = filteredApps.filter(app => 
                    app.status === 'Disetujui' || app.status === 'Menunggu Interview');
                break;
            case 'rejected':
                filteredApps = filteredApps.filter(app => 
                    app.status === 'Ditolak');
                break;
        }
    }
    
    // Current user for filtering by review type
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // For HSSE or Engineering interviewer, show only their reviews
    if (currentUser.role === 'admin' && currentUser.interviewType) {
        const interviewType = currentUser.interviewType.toLowerCase();
        
        // Filter by user's interview type (HSSE or Engineering)
        filteredApps = filteredApps.filter(app => {
            // For engineering reviewer
            if (interviewType === 'engineering' && app.reviewers && app.reviewers.engineering === currentUser.id) {
                return true;
            }
            
            // For HSSE reviewer
            if (interviewType === 'hsse' && app.reviewers && app.reviewers.hsse === currentUser.id) {
                return true;
            }
            
            return false;
        });
    } else if (type !== 'all') {
        // For others (admins/superadmins) filter by selected type
        filteredApps = filteredApps.filter(app => {
            // If application has reviewers specified
            if (app.reviewers) {
                // For engineering filter
                if (type === 'engineering' && app.reviewers.engineering) {
                    return true;
                }
                
                // For HSSE filter
                if (type === 'hsse' && app.reviewers.hsse) {
                    return true;
                }
            }
            
            return false;
        });
    }
    
    // Update table with filtered applications
    updateReviewsTable(filteredApps);
}

// Update the reviews table
function updateReviewsTable(applications) {
    const tableBody = document.getElementById('reviewsTableBody');
    if (!tableBody) return;
    
    // Sort applications by date (newest first)
    const sortedApps = applications.sort((a, b) => 
        new Date(b.submissionDate) - new Date(a.submissionDate)
    );
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (sortedApps.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">Tidak ada pengajuan yang memerlukan review</td>`;
        tableBody.appendChild(emptyRow);
        
        // Update pagination info
        const paginationInfo = document.getElementById('reviewsPagination').querySelector('span');
        if (paginationInfo) {
            paginationInfo.textContent = 'Menampilkan 0 dari 0 pengajuan';
        }
        return;
    }
    
    // Add rows for each application
    sortedApps.forEach((app, index) => {
        // Get related data
        const contractor = window.app.state.contractors.find(c => c.id === app.contractorId) || {};
        const worker = window.app.state.workers.find(w => w.id === app.workerId) || {};
        
        // Determine review type
        let reviewType = [];
        if (app.reviewers) {
            if (app.reviewers.hsse) reviewType.push('HSSE');
            if (app.reviewers.engineering) reviewType.push('Engineering');
        }
        if (reviewType.length === 0) reviewType = ['General'];
        
        // Create row with animation
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
        
        row.innerHTML = `
            <td>
                <div class="worker-name">${worker.name || '-'}</div>
                <div class="position">${worker.position || '-'}</div>
            </td>
            <td>
                <div class="company">${contractor.name || '-'}</div>
                <div class="category">${contractor.business || '-'}</div>
            </td>
            <td>${worker.position || '-'}</td>
            <td>${reviewType.join(', ')}</td>
            <td>${window.app.formatDate(app.submissionDate) || '-'}</td>
            <td><span class="status ${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</span></td>
            <td>
                <button class="action-btn review-btn" data-id="${app.id}">Review</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to review buttons
    tableBody.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const appId = this.getAttribute('data-id');
            openReviewDetail(appId);
        });
    });
    
    // Update pagination info
    const paginationInfo = document.getElementById('reviewsPagination').querySelector('span');
    if (paginationInfo) {
        paginationInfo.textContent = `Menampilkan ${sortedApps.length} dari ${applications.length} pengajuan`;
    }
}

// Open review detail in modal
function openReviewDetail(appId) {
    // Get application data
    const app = window.app.state.applications.find(a => a.id === appId);
    if (!app) {
        window.app.showNotification('Pengajuan tidak ditemukan', 'error');
        return;
    }
    
    // Get related data
    const contractor = window.app.state.contractors.find(c => c.id === app.contractorId) || {};
    const worker = window.app.state.workers.find(w => w.id === app.workerId) || {};
    
    // Get the modal and modal body
    const modal = document.getElementById('reviewDetailModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Update modal title
    modal.querySelector('.modal-header h3').textContent = `Detail Pengajuan - ${app.id}`;
    
    // Get the current user and their role
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isHsseReviewer = currentUser.interviewType === 'HSSE';
    const isEngineeringReviewer = currentUser.interviewType === 'Engineering';
    
    // Populate modal content
    modalBody.innerHTML = `
        <div class="review-detail-container">
            <div class="detail-section">
                <h3>Data Kontraktor</h3>
                <div class="detail-row">
                    <div class="detail-label">Nama Perusahaan</div>
                    <div class="detail-value">${contractor.name || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Jenis Usaha</div>
                    <div class="detail-value">${contractor.business || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Alamat</div>
                    <div class="detail-value">${contractor.address || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Kontak Person</div>
                    <div class="detail-value">${contractor.contactPerson || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">No. Telepon</div>
                    <div class="detail-value">${contractor.phone || '-'}</div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Data Pekerja</h3>
                <div class="detail-row">
                    <div class="detail-label">Nama Lengkap</div>
                    <div class="detail-value">${worker.name || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">NIK</div>
                    <div class="detail-value">${worker.nik || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Posisi/Jabatan</div>
                    <div class="detail-value">${worker.position || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sertifikasi</div>
                    <div class="detail-value">${worker.certifications ? worker.certifications.join(', ') : '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Pengalaman Kerja</div>
                    <div class="detail-value">
                        ${worker.workExperience && worker.workExperience.length > 0 
                            ? `${worker.workExperience[0].position} at ${worker.workExperience[0].company}` 
                            : '-'}
                    </div>
                </div>
            </div>
            
            <div class="document-section">
                <h3>Dokumen Pendukung</h3>
                <div class="document-list">
                    ${app.documents && app.documents.length > 0 
                        ? app.documents.map(doc => 
                            `<div class="document-item">
                                <div class="document-type">${doc.type}</div>
                                <div class="document-name">${doc.fileName}</div>
                                <a href="#" class="document-link">Lihat</a>
                            </div>`
                        ).join('') 
                        : '<p>Tidak ada dokumen pendukung</p>'}
                </div>
            </div>
        </div>
        
        <div class="review-form-container">
            <h3>${isHsseReviewer ? 'HSSE Review' : isEngineeringReviewer ? 'Engineering Review' : 'Review'}</h3>
            
            ${isHsseReviewer ? `
                <div class="review-form hsse-review">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Status MCU</label>
                            <select id="mcuStatus">
                                <option value="">Pilih Status</option>
                                <option value="valid">Valid</option>
                                <option value="invalid">Tidak Valid</option>
                                <option value="expired">Kadaluarsa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Safety Training</label>
                            <select id="safetyTraining">
                                <option value="">Pilih Status</option>
                                <option value="complete">Lengkap</option>
                                <option value="incomplete">Tidak Lengkap</option>
                                <option value="expired">Kadaluarsa</option>
                            </select>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${isEngineeringReviewer ? `
                <div class="review-form engineering-review">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Pengalaman Kerja</label>
                            <select id="workExperience">
                                <option value="">Pilih Status</option>
                                <option value="sufficient">Memenuhi Syarat</option>
                                <option value="insufficient">Kurang Memenuhi</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Sertifikasi</label>
                            <select id="certifications">
                                <option value="">Pilih Status</option>
                                <option value="complete">Lengkap</option>
                                <option value="incomplete">Tidak Lengkap</option>
                                <option value="expired">Kadaluarsa</option>
                            </select>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="form-row">
                <div class="form-group full-width">
                    <label>Catatan Review</label>
                    <textarea id="reviewNotes" rows="4" placeholder="Tambahkan catatan review di sini..."></textarea>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="reject-btn" data-app-id="${app.id}">Tolak</button>
                <button class="approve-btn" data-app-id="${app.id}">Setujui</button>
                <button class="schedule-btn" data-app-id="${app.id}">Jadwalkan Interview</button>
            </div>
        </div>
    `;
    
    // Add event listeners for action buttons
    modalBody.querySelectorAll('.action-buttons button').forEach(btn => {
        btn.addEventListener('click', function() {
            const appId = this.getAttribute('data-app-id');
            const action = this.className.replace('-btn', '');
            
            submitReview(appId, action);
        });
    });
    
    // Show the modal
    modal.style.display = 'block';
}

// Submit review
function submitReview(appId, action) {
    // Get application data
    const appIndex = window.app.state.applications.findIndex(a => a.id === appId);
    if (appIndex === -1) {
        window.app.showNotification('Pengajuan tidak ditemukan', 'error');
        return;
    }
    
    const app = window.app.state.applications[appIndex];
    
    // Get review data
    const reviewNotes = document.getElementById('reviewNotes').value;
    const mcuStatus = document.getElementById('mcuStatus')?.value;
    const safetyTraining = document.getElementById('safetyTraining')?.value;
    const workExperience = document.getElementById('workExperience')?.value;
    const certifications = document.getElementById('certifications')?.value;
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const reviewType = currentUser.interviewType || 'General';
    
    // Create review object
    const review = {
        id: window.app.generateId('REV'),
        applicationId: appId,
        reviewerId: currentUser.id,
        type: reviewType,
        date: new Date().toISOString(),
        status: action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Pending',
        notes: reviewNotes,
        results: {}
    };
    
    // Add specific review results
    if (reviewType === 'HSSE') {
        review.results.mcuValid = mcuStatus === 'valid';
        review.results.safetyTraining = safetyTraining === 'complete';
    } else if (reviewType === 'Engineering') {
        review.results.experienceValid = workExperience === 'sufficient';
        review.results.certificationValid = certifications === 'complete';
    }
    
    // Update application status based on action
    let newStatus;
    let statusNote;
    
    switch(action) {
        case 'approve':
            newStatus = 'Disetujui';
            statusNote = `Pengajuan disetujui oleh ${reviewType} Reviewer`;
            break;
        case 'reject':
            newStatus = 'Ditolak';
            statusNote = `Pengajuan ditolak oleh ${reviewType} Reviewer: ${reviewNotes}`;
            break;
        case 'schedule':
            newStatus = 'Menunggu Interview';
            statusNote = `Pengajuan disetujui untuk interview oleh ${reviewType} Reviewer`;
            break;
    }
    
    // Update application
    app.status = newStatus;
    
    // Add to status history
    if (!app.statusHistory) {
        app.statusHistory = [];
    }
    
    app.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        notes: statusNote
    });
    
    // Update application in state
    window.app.state.applications[appIndex] = app;
    
    // Add review to reviews array
    window.app.state.reviews.push(review);
    
    // Close modal
    document.getElementById('reviewDetailModal').style.display = 'none';
    
    // Show notification
    window.app.showNotification(`Pengajuan berhasil ${action === 'approve' ? 'disetujui' : action === 'reject' ? 'ditolak' : 'dijadwalkan'}`, 'info');
    
    // Reload reviews and notify other modules about the data change
    loadFilteredReviews();
    window.app.notifyDataChange('applications');
    window.app.notifyDataChange('reviews');
}