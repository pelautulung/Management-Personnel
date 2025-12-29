// Interviews module for SBTC System
// Handles interview scheduling and results

// Initialize the interviews module
function initInterviews() {
    console.log('Initializing interviews module...');
    setupInterviewFilters();
    loadInterviewSchedules();
}

// Set up interview section filters
function setupInterviewFilters() {
    const interviewSection = document.querySelector('.jadwal-interview');
    if (!interviewSection) return;

    // Add filter controls if they don't exist
    if (!interviewSection.querySelector('.filter-controls')) {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h1>Jadwal Interview</h1>
            <div class="filter-controls">
                <select id="interviewTypeFilter">
                    <option value="all">Semua Tipe</option>
                    <option value="hsse">HSSE</option>
                    <option value="engineering">Engineering</option>
                </select>
                <select id="interviewStatusFilter">
                    <option value="scheduled">Terjadwal</option>
                    <option value="all">Semua Status</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                </select>
                <button class="refresh-btn" id="refreshInterviews">
                    <span>Refresh</span>
                </button>
            </div>
        `;
        
        // Insert at the beginning of interview section
        interviewSection.insertBefore(header, interviewSection.firstChild);
        
        // Add event listeners
        const typeFilter = document.getElementById('interviewTypeFilter');
        const statusFilter = document.getElementById('interviewStatusFilter');
        const refreshBtn = document.getElementById('refreshInterviews');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', function() {
                loadFilteredInterviews();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                loadFilteredInterviews();
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                this.classList.add('refreshing');
                loadFilteredInterviews();
                
                setTimeout(() => {
                    this.classList.remove('refreshing');
                    window.app.showNotification('Data telah diperbarui', 'info');
                }, 800);
            });
        }
    }
    
    // Add interview scheduling form if not exists
    addInterviewSchedulingForm(interviewSection);
}

// Add interview scheduling form
function addInterviewSchedulingForm(interviewSection) {
    // Check if form already exists
    if (interviewSection.querySelector('.jadwal-form')) return;
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'jadwal-form';
    
    formContainer.innerHTML = `
        <h2>Jadwalkan Interview Baru</h2>
        <form id="scheduleInterviewForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Aplikasi SBTC</label>
                    <select id="applicationSelect" required>
                        <option value="">Pilih Aplikasi</option>
                        <!-- Will be populated by JavaScript -->
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tipe Interview</label>
                    <select id="interviewType" required>
                        <option value="">Pilih Tipe</option>
                        <option value="HSSE">HSSE</option>
                        <option value="Engineering">Engineering</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Interviewer</label>
                    <select id="interviewerSelect" required>
                        <option value="">Pilih Interviewer</option>
                        <!-- Will be populated based on selected type -->
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tanggal Interview</label>
                    <input type="date" id="interviewDate" required>
                </div>
                <div class="form-group">
                    <label>Waktu Interview</label>
                    <input type="time" id="interviewTime" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label>Catatan</label>
                    <textarea id="interviewNotes" rows="3" placeholder="Tambahkan catatan atau instruksi tambahan..."></textarea>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="schedule-btn">Jadwalkan Interview</button>
            </div>
        </form>
        
        <div class="kuota-section">
            <h3>Kuota Interviewer</h3>
            <div class="kuota-container">
                <!-- Will be populated by JavaScript -->
            </div>
        </div>
    `;
    
    // Add to jadwal-container
    const jadwalContainer = interviewSection.querySelector('.jadwal-container');
    if (jadwalContainer) {
        jadwalContainer.appendChild(formContainer);
    } else {
        // If jadwal-container doesn't exist, create it
        const container = document.createElement('div');
        container.className = 'jadwal-container';
        
        // Add list and form to container
        const listContainer = interviewSection.querySelector('.jadwal-list') || 
            document.createElement('div');
        
        if (!listContainer.className) {
            listContainer.className = 'jadwal-list';
            
            // Add table if it doesn't exist
            if (!listContainer.querySelector('table')) {
                listContainer.innerHTML = `
                    <h2>Jadwal Interview Mendatang</h2>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>PEKERJA</th>
                                <th>KONTRAKTOR</th>
                                <th>TIPE</th>
                                <th>TANGGAL & WAKTU</th>
                                <th>PIC</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody id="interviewTableBody">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                    <div class="pagination">
                        <span>Menampilkan 0 dari 0 interview</span>
                        <div class="pagination-controls">
                            <a href="#" class="pagination-btn">Sebelumnya</a>
                            <a href="#" class="pagination-btn active">1</a>
                            <a href="#" class="pagination-btn">Selanjutnya</a>
                        </div>
                    </div>
                `;
            }
        }
        
        container.appendChild(listContainer);
        container.appendChild(formContainer);
        interviewSection.appendChild(container);
    }
    
    // Setup application select
    populateApplicationSelect();
    
    // Setup interviewer type change handler
    const interviewTypeSelect = document.getElementById('interviewType');
    if (interviewTypeSelect) {
        interviewTypeSelect.addEventListener('change', function() {
            populateInterviewerSelect(this.value);
        });
    }
    
    // Setup form submission handler
    const form = document.getElementById('scheduleInterviewForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            scheduleInterview();
        });
    }
    
    // Update quota display
    updateInterviewerQuota();
}

// Populate application select dropdown
function populateApplicationSelect() {
    const applicationSelect = document.getElementById('applicationSelect');
    if (!applicationSelect) return;
    
    // Clear existing options
    applicationSelect.innerHTML = '<option value="">Pilih Aplikasi</option>';
    
    // Filter applications that have been approved but not scheduled
    const eligibleApps = window.app.state.applications.filter(app => 
        app.status === 'Disetujui' || 
        app.status === 'Menunggu Interview'
    );
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If contractor, only show their applications
    if (currentUser.role === 'contractor') {
        eligibleApps = eligibleApps.filter(app => app.contractorId === currentUser.id);
    }
    
    if (eligibleApps.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'Tidak ada aplikasi yang memenuhi syarat';
        applicationSelect.appendChild(option);
        return;
    }
    
    // Add options for eligible applications
    eligibleApps.forEach(app => {
        // Get worker and contractor info
        const worker = window.app.state.workers.find(w => w.id === app.workerId);
        const contractor = window.app.state.contractors.find(c => c.id === app.contractorId);
        
        if (worker && contractor) {
            const option = document.createElement('option');
            option.value = app.id;
            option.textContent = `${worker.name} - ${worker.position} (${contractor.name})`;
            applicationSelect.appendChild(option);
        }
    });
}

// Populate interviewer select based on type
function populateInterviewerSelect(type) {
    const interviewerSelect = document.getElementById('interviewerSelect');
    if (!interviewerSelect) return;
    
    // Clear existing options
    interviewerSelect.innerHTML = '<option value="">Pilih Interviewer</option>';
    
    if (!type) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Filter by type (HSSE or Engineering)
    const interviewers = users.filter(user => 
        user.role === 'admin' && 
        user.interviewType && 
        user.interviewType.toUpperCase() === type.toUpperCase() &&
        user.status === 'active'
    );
    
    if (interviewers.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = `Tidak ada interviewer ${type} yang tersedia`;
        interviewerSelect.appendChild(option);
        return;
    }
    
    // Add options for interviewers
    interviewers.forEach(interviewer => {
        const option = document.createElement('option');
        option.value = interviewer.id;
        option.textContent = interviewer.fullName;
        
        // Check quota
        const quota = getInterviewerQuota(interviewer);
        if (quota.used >= quota.max) {
            option.textContent += ' (Kuota Penuh)';
            option.disabled = true;
        } else {
            option.textContent += ` (${quota.used}/${quota.max})`;
        }
        
        interviewerSelect.appendChild(option);
    });
}

// Get interviewer quota
function getInterviewerQuota(interviewer) {
    // Default quota
    const maxQuota = interviewer.maxInterviews || 5;
    
    // Count scheduled interviews for this interviewer
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Count interviews for today
    const usedQuota = window.app.state.interviews.filter(interview => 
        interview.interviewerId === interviewer.id && 
        new Date(interview.scheduledDate) >= today &&
        interview.status !== 'Cancelled'
    ).length;
    
    return {
        max: maxQuota,
        used: usedQuota,
        available: maxQuota - usedQuota
    };
}

// Update interviewer quota display
function updateInterviewerQuota() {
    const quotaContainer = document.querySelector('.kuota-container');
    if (!quotaContainer) return;
    
    // Clear existing content
    quotaContainer.innerHTML = '';
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Filter interviewers (HSSE and Engineering)
    const interviewers = users.filter(user => 
        user.role === 'admin' && 
        user.interviewType && 
        user.status === 'active'
    );
    
    if (interviewers.length === 0) {
        quotaContainer.innerHTML = '<p>Tidak ada interviewer yang tersedia</p>';
        return;
    }
    
    // Group by type
    const hsseInterviewers = interviewers.filter(i => i.interviewType.toUpperCase() === 'HSSE');
    const engineeringInterviewers = interviewers.filter(i => i.interviewType.toUpperCase() === 'ENGINEERING');
    
    // Add HSSE interviewers
    if (hsseInterviewers.length > 0) {
        const hsseSection = document.createElement('div');
        hsseSection.innerHTML = '<h4>HSSE Interviewers</h4>';
        
        hsseInterviewers.forEach(interviewer => {
            const quota = getInterviewerQuota(interviewer);
            const percentage = Math.min(100, Math.round((quota.used / quota.max) * 100));
            
            const quotaItem = document.createElement('div');
            quotaItem.className = 'kuota-item';
            quotaItem.innerHTML = `
                <div class="kuota-info">
                    <div class="kuota-label">${interviewer.fullName}</div>
                    <div class="kuota-value">${quota.used}/${quota.max}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%; background-color: ${percentage >= 100 ? '#f44336' : '#4caf50'};"></div>
                </div>
            `;
            
            hsseSection.appendChild(quotaItem);
        });
        
        quotaContainer.appendChild(hsseSection);
    }
    
    // Add Engineering interviewers
    if (engineeringInterviewers.length > 0) {
        const engSection = document.createElement('div');
        engSection.innerHTML = '<h4>Engineering Interviewers</h4>';
        
        engineeringInterviewers.forEach(interviewer => {
            const quota = getInterviewerQuota(interviewer);
            const percentage = Math.min(100, Math.round((quota.used / quota.max) * 100));
            
            const quotaItem = document.createElement('div');
            quotaItem.className = 'kuota-item';
            quotaItem.innerHTML = `
                <div class="kuota-info">
                    <div class="kuota-label">${interviewer.fullName}</div>
                    <div class="kuota-value">${quota.used}/${quota.max}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%; background-color: ${percentage >= 100 ? '#f44336' : '#4caf50'};"></div>
                </div>
            `;
            
            engSection.appendChild(quotaItem);
        });
        
        quotaContainer.appendChild(engSection);
    }
}

// Schedule a new interview
function scheduleInterview() {
    try {
        // Get form data
        const applicationId = document.getElementById('applicationSelect').value;
        const interviewType = document.getElementById('interviewType').value;
        const interviewerId = document.getElementById('interviewerSelect').value;
        const interviewDate = document.getElementById('interviewDate').value;
        const interviewTime = document.getElementById('interviewTime').value;
        const notes = document.getElementById('interviewNotes').value;
        
        // Validate required fields
        if (!applicationId || !interviewType || !interviewerId || !interviewDate || !interviewTime) {
            window.app.showNotification('Harap lengkapi semua field yang wajib diisi', 'error');
            return;
        }
        
        // Get application data
        const application = window.app.state.applications.find(app => app.id === applicationId);
        if (!application) {
            window.app.showNotification('Aplikasi tidak ditemukan', 'error');
            return;
        }
        
        // Create scheduled date
        const scheduledDate = new Date(`${interviewDate}T${interviewTime}`);
        
        // Validate date is in the future
        if (scheduledDate <= new Date()) {
            window.app.showNotification('Tanggal interview harus di masa depan', 'error');
            return;
        }
        
        // Check interviewer quota
        const interviewer = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === parseInt(interviewerId));
        if (interviewer) {
            const quota = getInterviewerQuota(interviewer);
            if (quota.used >= quota.max) {
                window.app.showNotification(`Interviewer ${interviewer.fullName} telah mencapai kuota maksimum`, 'error');
                return;
            }
        }
        
        // Create interview object
        const interview = {
            id: window.app.generateId('INT'),
            applicationId: applicationId,
            workerId: application.workerId,
            contractorId: application.contractorId,
            type: interviewType,
            scheduledDate: scheduledDate.toISOString(),
            interviewerId: parseInt(interviewerId),
            status: 'Scheduled',
            notes: notes,
            results: null
        };
        
        // Add to interviews array
        window.app.state.interviews.push(interview);
        
        // Update application status
        const appIndex = window.app.state.applications.findIndex(app => app.id === applicationId);
        if (appIndex !== -1) {
            const app = window.app.state.applications[appIndex];
            app.status = 'Interview Terjadwal';
            
            // Add to status history
            if (!app.statusHistory) {
                app.statusHistory = [];
            }
            
            app.statusHistory.push({
                status: 'Interview Terjadwal',
                timestamp: new Date().toISOString(),
                userId: interviewer.id,
                notes: `Interview dijadwalkan dengan ${interviewer.fullName} pada ${new Date(scheduledDate).toLocaleString('id-ID')}`
            });
            
            window.app.state.applications[appIndex] = app;
        }
        
        // Show success notification
        window.app.showNotification('Interview berhasil dijadwalkan', 'info');
        
        // Reset form
        document.getElementById('scheduleInterviewForm').reset();
        
        // Update interview list and quota
        loadInterviewSchedules();
        updateInterviewerQuota();
        
    } catch (error) {
        console.error('Error scheduling interview:', error);
        window.app.showNotification('Terjadi kesalahan saat menjadwalkan interview', 'error');
    }
}

// Load interview schedules
function loadInterviewSchedules() {
    loadFilteredInterviews();
}

// Load filtered interviews
function loadFilteredInterviews(type, status) {
    // Get filter values if not provided
    if (!type) {
        const typeFilter = document.getElementById('interviewTypeFilter');
        type = typeFilter ? typeFilter.value : 'all';
    }
    
    if (!status) {
        const statusFilter = document.getElementById('interviewStatusFilter');
        status = statusFilter ? statusFilter.value : 'scheduled';
    }
    
    // Filter interviews based on criteria
    let filteredInterviews = window.app.state.interviews;
    
    // Apply type filter
    if (type !== 'all') {
        filteredInterviews = filteredInterviews.filter(interview => 
            interview.type.toLowerCase() === type.toLowerCase()
        );
    }
    
    // Apply status filter
    if (status !== 'all') {
        switch(status) {
            case 'scheduled':
                filteredInterviews = filteredInterviews.filter(interview => 
                    interview.status === 'Scheduled' || interview.status === 'Confirmed'
                );
                break;
            case 'completed':
                filteredInterviews = filteredInterviews.filter(interview => 
                    interview.status === 'Completed'
                );
                break;
            case 'cancelled':
                filteredInterviews = filteredInterviews.filter(interview => 
                    interview.status === 'Cancelled'
                );
                break;
        }
    }
    
    // Current user for filtering
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Filter based on user role
    if (currentUser.role === 'contractor') {
        // Contractors see only their interviews
        filteredInterviews = filteredInterviews.filter(interview => 
            interview.contractorId === currentUser.id
        );
    } else if (currentUser.role === 'admin' && currentUser.interviewType) {
        // HSSE or Engineering interviewers see only their assigned interviews
        filteredInterviews = filteredInterviews.filter(interview => 
            interview.interviewerId === currentUser.id || 
            (interview.type.toLowerCase() === currentUser.interviewType.toLowerCase() && !interview.interviewerId)
        );
    }
    
    // Update table with filtered interviews
    updateInterviewsTable(filteredInterviews);
}

// Update the interviews table
function updateInterviewsTable(interviews) {
    const tableBody = document.getElementById('interviewTableBody');
    if (!tableBody) return;
    
    // Sort interviews by date (nearest first)
    const sortedInterviews = interviews.sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
    );
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (sortedInterviews.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">Tidak ada jadwal interview</td>`;
        tableBody.appendChild(emptyRow);
        
        // Update pagination info
        const paginationInfo = document.querySelector('.jadwal-interview .pagination span');
        if (paginationInfo) {
            paginationInfo.textContent = 'Menampilkan 0 dari 0 interview';
        }
        return;
    }
    
    // Add rows for each interview
    sortedInterviews.forEach((interview, index) => {
        // Get related data
        const application = window.app.state.applications.find(app => app.id === interview.applicationId);
        const contractor = window.app.state.contractors.find(c => c.id === interview.contractorId);
        const worker = window.app.state.workers.find(w => w.id === interview.workerId);
        const interviewer = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === interview.interviewerId);
        
        // Create row with animation
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
        
        // Format date and time
        const interviewDate = new Date(interview.scheduledDate);
        const formattedDate = interviewDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        const formattedTime = interviewDate.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        row.innerHTML = `
            <td>
                <div class="worker-name">${worker ? worker.name : '-'}</div>
                <div class="position">${worker ? worker.position : '-'}</div>
            </td>
            <td>
                <div class="company">${contractor ? contractor.name : '-'}</div>
                <div class="category">${contractor ? contractor.business : '-'}</div>
            </td>
            <td><span class="badge ${interview.type.toLowerCase()}">${interview.type}</span></td>
            <td>
                <div class="interview-date">${formattedDate}</div>
                <div class="interview-time">${formattedTime}</div>
            </td>
            <td>${interviewer ? interviewer.fullName : '-'}</td>
            <td>
                <div class="action-buttons">
                    ${interview.status === 'Scheduled' ? `
                        <button class="reschedule-btn small" data-id="${interview.id}">Reschedule</button>
                        <button class="complete-btn small" data-id="${interview.id}">Selesai</button>
                    ` : interview.status === 'Completed' ? `
                        <button class="view-result-btn small" data-id="${interview.id}">Hasil</button>
                    ` : `
                        <button class="view-btn small" data-id="${interview.id}">Detail</button>
                    `}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    tableBody.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            const interviewId = this.getAttribute('data-id');
            const action = this.className.replace('-btn', '').replace(' small', '');
            
            handleInterviewAction(interviewId, action);
        });
    });
    
    // Update pagination info
    const paginationInfo = document.querySelector('.jadwal-interview .pagination span');
    if (paginationInfo) {
        paginationInfo.textContent = `Menampilkan ${sortedInterviews.length} dari ${interviews.length} interview`;
    }
}

// Handle interview actions (reschedule, complete, view)
function handleInterviewAction(interviewId, action) {
    console.log(`Handling ${action} for interview ${interviewId}`);
    
    // Find the interview
    const interview = window.app.state.interviews.find(i => i.id === interviewId);
    if (!interview) {
        window.app.showNotification('Interview tidak ditemukan', 'error');
        return;
    }
    
    switch(action) {
        case 'reschedule':
            openRescheduleModal(interview);
            break;
        case 'complete':
            openCompleteModal(interview);
            break;
        case 'view-result':
            viewInterviewResult(interview);
            break;
        case 'view':
            viewInterviewDetail(interview);
            break;
        default:
            window.app.showNotification('Aksi tidak tersedia', 'error');
    }
}

// Open reschedule modal
function openRescheduleModal(interview) {
    // Check if modal exists, create if not
    let modal = document.getElementById('rescheduleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rescheduleModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Reschedule Interview</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="rescheduleForm">
                            <input type="hidden" id="rescheduleInterviewId">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tanggal Baru</label>
                                    <input type="date" id="rescheduleDate" required>
                                </div>
                                <div class="form-group">
                                    <label>Waktu Baru</label>
                                    <input type="time" id="rescheduleTime" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label>Alasan Reschedule</label>
                                    <textarea id="rescheduleReason" rows="3" required></textarea>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="cancel-btn">Batal</button>
                                <button type="submit" class="save-btn">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#rescheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveReschedule();
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Populate form
    const interviewDate = new Date(interview.scheduledDate);
    
    document.getElementById('rescheduleInterviewId').value = interview.id;
    document.getElementById('rescheduleDate').value = interviewDate.toISOString().split('T')[0];
    document.getElementById('rescheduleTime').value = interviewDate.toTimeString().slice(0, 5);
    document.getElementById('rescheduleReason').value = '';
    
    // Show modal
    modal.style.display = 'block';
}

// Save reschedule
function saveReschedule() {
    const interviewId = document.getElementById('rescheduleInterviewId').value;
    const newDate = document.getElementById('rescheduleDate').value;
    const newTime = document.getElementById('rescheduleTime').value;
    const reason = document.getElementById('rescheduleReason').value;
    
    // Validate
    if (!newDate || !newTime || !reason) {
        window.app.showNotification('Harap lengkapi semua field yang wajib diisi', 'error');
        return;
    }
    
    // Find interview
    const interviewIndex = window.app.state.interviews.findIndex(i => i.id === interviewId);
    if (interviewIndex === -1) {
        window.app.showNotification('Interview tidak ditemukan', 'error');
        return;
    }
    
    const interview = window.app.state.interviews[interviewIndex];
    
    // Save old date for history
    const oldDate = new Date(interview.scheduledDate);
    const oldDateFormatted = oldDate.toLocaleString('id-ID');
    
    // Update scheduled date
    const newScheduledDate = new Date(`${newDate}T${newTime}`);
    interview.scheduledDate = newScheduledDate.toISOString();
    
    // Add reschedule history if not exists
    if (!interview.rescheduleHistory) {
        interview.rescheduleHistory = [];
    }
    
    // Add to history
    interview.rescheduleHistory.push({
        oldDate: oldDate.toISOString(),
        newDate: newScheduledDate.toISOString(),
        reason: reason,
        timestamp: new Date().toISOString(),
        userId: JSON.parse(localStorage.getItem('currentUser')).id
    });
    
    // Update in state
    window.app.state.interviews[interviewIndex] = interview;
    
    // Update application status history
    const application = window.app.state.applications.find(app => app.id === interview.applicationId);
    if (application) {
        if (!application.statusHistory) {
            application.statusHistory = [];
        }
        
        application.statusHistory.push({
            status: 'Interview Dijadwalkan Ulang',
            timestamp: new Date().toISOString(),
            userId: JSON.parse(localStorage.getItem('currentUser')).id,
            notes: `Interview dijadwalkan ulang dari ${oldDateFormatted} ke ${newScheduledDate.toLocaleString('id-ID')}. Alasan: ${reason}`
        });
        
        // Update application in state
        const appIndex = window.app.state.applications.findIndex(app => app.id === application.id);
        if (appIndex !== -1) {
            window.app.state.applications[appIndex] = application;
        }
    }
    
    // Close modal
    document.getElementById('rescheduleModal').style.display = 'none';
    
    // Show notification
    window.app.showNotification('Interview berhasil dijadwalkan ulang', 'info');
    
    // Reload interviews and notify other modules about the data change
    loadInterviewSchedules();
    window.app.notifyDataChange('applications');
    window.app.notifyDataChange('interviews');
}

// Open complete interview modal
function openCompleteModal(interview) {
    // Check if modal exists, create if not
    let modal = document.getElementById('completeInterviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'completeInterviewModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Selesaikan Interview</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="completeInterviewForm">
                            <input type="hidden" id="completeInterviewId">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Hasil Interview</label>
                                    <select id="interviewResult" required>
                                        <option value="">Pilih Hasil</option>
                                        <option value="pass">Lulus</option>
                                        <option value="fail">Tidak Lulus</option>
                                        <option value="conditional">Lulus Bersyarat</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Nilai (0-100)</label>
                                    <input type="number" id="interviewScore" min="0" max="100" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label>Catatan & Hasil Interview</label>
                                    <textarea id="interviewNotes" rows="5" required></textarea>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label>Rekomendasi</label>
                                    <textarea id="interviewRecommendation" rows="3"></textarea>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="cancel-btn">Batal</button>
                                <button type="submit" class="save-btn">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#completeInterviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            completeInterview();
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Populate form
    document.getElementById('completeInterviewId').value = interview.id;
    document.getElementById('interviewResult').value = '';
    document.getElementById('interviewScore').value = '';
    document.getElementById('interviewNotes').value = '';
    document.getElementById('interviewRecommendation').value = '';
    
    // Show modal
    modal.style.display = 'block';
}

// Complete interview
function completeInterview() {
    const interviewId = document.getElementById('completeInterviewId').value;
    const result = document.getElementById('interviewResult').value;
    const score = document.getElementById('interviewScore').value;
    const notes = document.getElementById('interviewNotes').value;
    const recommendation = document.getElementById('interviewRecommendation').value;
    
    // Validate
    if (!result || !score || !notes) {
        window.app.showNotification('Harap lengkapi semua field yang wajib diisi', 'error');
        return;
    }
    
    // Find interview
    const interviewIndex = window.app.state.interviews.findIndex(i => i.id === interviewId);
    if (interviewIndex === -1) {
        window.app.showNotification('Interview tidak ditemukan', 'error');
        return;
    }
    
    const interview = window.app.state.interviews[interviewIndex];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update interview status and results
    interview.status = 'Completed';
    interview.completedDate = new Date().toISOString();
    interview.results = {
        result: result,
        score: parseInt(score),
        notes: notes,
        recommendation: recommendation,
        completedBy: currentUser.id
    };
    
    // Update in state
    window.app.state.interviews[interviewIndex] = interview;
    
    // Update application status
    const appIndex = window.app.state.applications.findIndex(app => app.id === interview.applicationId);
    if (appIndex !== -1) {
        const app = window.app.state.applications[appIndex];
        
        // Set new status based on result
        if (result === 'pass') {
            app.status = 'Interview Selesai';
            
            // If both HSSE and Engineering interviews completed successfully, change to "Sertifikat Terbit"
            const allInterviews = window.app.state.interviews.filter(i => 
                i.applicationId === app.id && i.status === 'Completed'
            );
            
            const hasHssePass = allInterviews.some(i => 
                i.type === 'HSSE' && i.results && i.results.result === 'pass'
            );
            
            const hasEngineeringPass = allInterviews.some(i => 
                i.type === 'Engineering' && i.results && i.results.result === 'pass'
            );
            
            if (hasHssePass && hasEngineeringPass) {
                app.status = 'Sertifikat Terbit';
                
                // Create certificate
                createCertificate(app);
            }
        } else if (result === 'fail') {
            app.status = 'Ditolak';
        } else {
            // Conditional pass
            app.status = 'Interview Selesai - Bersyarat';
        }
        
        // Add to status history
        if (!app.statusHistory) {
            app.statusHistory = [];
        }
        
        app.statusHistory.push({
            status: app.status,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            notes: `Interview ${interview.type} selesai dengan hasil: ${result === 'pass' ? 'Lulus' : result === 'fail' ? 'Tidak Lulus' : 'Lulus Bersyarat'}`
        });
        
        // Update in state
        window.app.state.applications[appIndex] = app;
    }
    
    // Close modal
    document.getElementById('completeInterviewModal').style.display = 'none';
    
    // Show notification
    window.app.showNotification('Interview berhasil diselesaikan', 'info');
    
    // Reload interviews and notify other modules about the data change
    loadInterviewSchedules();
    window.app.notifyDataChange('applications');
    window.app.notifyDataChange('interviews');
}

// Create certificate
function createCertificate(application) {
    // Generate certificate ID
    const certId = window.app.generateId('CERT');
    
    // Get current date
    const now = new Date();
    
    // Set expiry date (1 year from now)
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Create certificate object
    const certificate = {
        id: certId,
        applicationId: application.id,
        workerId: application.workerId,
        contractorId: application.contractorId,
        type: 'SBTC',
        issueDate: now.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'Active',
        issuedBy: JSON.parse(localStorage.getItem('currentUser')).id,
        certNumber: `SBTC-${now.getFullYear()}-${now.getMonth() + 1}-${window.app.state.certificates.length + 1}`,
        notes: 'Sertifikat SBTC'
    };
    
    // Add to certificates array
    window.app.state.certificates.push(certificate);
    
    // Notify other modules about the certificate creation
    window.app.notifyDataChange('certificates');
}

// View interview result
function viewInterviewResult(interview) {
    // Check if modal exists, create if not
    let modal = document.getElementById('viewResultModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'viewResultModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Hasil Interview</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="interview-result-container">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Get related data
    const application = window.app.state.applications.find(app => app.id === interview.applicationId);
    const worker = window.app.state.workers.find(w => w.id === interview.workerId);
    const contractor = window.app.state.contractors.find(c => c.id === interview.contractorId);
    const interviewer = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === interview.interviewerId);
    
    // Format date
    const interviewDate = new Date(interview.scheduledDate);
    const formattedDate = interviewDate.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Format completion date
    const completionDate = interview.completedDate ? new Date(interview.completedDate) : null;
    const formattedCompletionDate = completionDate ? completionDate.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    }) : '-';
    
    // Result text
    let resultText = '-';
    let resultClass = '';
    
    if (interview.results && interview.results.result) {
        switch(interview.results.result) {
            case 'pass':
                resultText = 'Lulus';
                resultClass = 'success';
                break;
            case 'fail':
                resultText = 'Tidak Lulus';
                resultClass = 'error';
                break;
            case 'conditional':
                resultText = 'Lulus Bersyarat';
                resultClass = 'warning';
                break;
        }
    }
    
    // Populate modal
    const resultContainer = modal.querySelector('.interview-result-container');
    resultContainer.innerHTML = `
        <div class="result-header">
            <div class="result-worker">
                <h4>${worker ? worker.name : '-'}</h4>
                <div class="position">${worker ? worker.position : '-'}</div>
            </div>
            <div class="result-status ${resultClass}">${resultText}</div>
        </div>
        
        <div class="result-details">
            <div class="detail-row">
                <div class="detail-label">Kontraktor</div>
                <div class="detail-value">${contractor ? contractor.name : '-'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tipe Interview</div>
                <div class="detail-value">${interview.type}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tanggal Interview</div>
                <div class="detail-value">${formattedDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Interviewer</div>
                <div class="detail-value">${interviewer ? interviewer.fullName : '-'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tanggal Selesai</div>
                <div class="detail-value">${formattedCompletionDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Nilai</div>
                <div class="detail-value">${interview.results ? interview.results.score : '-'}/100</div>
            </div>
        </div>
        
        <div class="result-notes">
            <h4>Catatan Interview</h4>
            <p>${interview.results && interview.results.notes ? interview.results.notes : 'Tidak ada catatan'}</p>
        </div>
        
        ${interview.results && interview.results.recommendation ? `
            <div class="result-recommendation">
                <h4>Rekomendasi</h4>
                <p>${interview.results.recommendation}</p>
            </div>
        ` : ''}
        
        <style>
            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .result-worker h4 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }
            
            .result-worker .position {
                color: #666;
                font-size: 14px;
            }
            
            .result-status {
                padding: 6px 12px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            .result-status.success {
                background-color: rgba(76, 175, 80, 0.1);
                color: #4CAF50;
            }
            
            .result-status.error {
                background-color: rgba(244, 67, 54, 0.1);
                color: #F44336;
            }
            
            .result-status.warning {
                background-color: rgba(255, 152, 0, 0.1);
                color: #FF9800;
            }
            
            .result-details {
                margin-bottom: 20px;
            }
            
            .detail-row {
                display: flex;
                margin-bottom: 10px;
            }
            
            .detail-label {
                width: 140px;
                font-weight: 500;
                color: #555;
            }
            
            .result-notes, .result-recommendation {
                margin-top: 20px;
            }
            
            .result-notes h4, .result-recommendation h4 {
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            
            .result-notes p, .result-recommendation p {
                margin: 0;
                padding: 15px;
                background-color: #f9f9f9;
                border-radius: 4px;
                color: #333;
            }
        </style>
    `;
    
    // Show modal
    modal.style.display = 'block';
}

// View interview detail
function viewInterviewDetail(interview) {
    // Simply reuse the view result function but check if results exist
    if (interview.results) {
        viewInterviewResult(interview);
    } else {
        // For interviews without results, show basic details
        let modal = document.getElementById('viewInterviewDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'viewInterviewDetailModal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Detail Interview</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="interview-detail-container">
                                <!-- Will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal.querySelector('.modal-overlay')) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Get related data
        const application = window.app.state.applications.find(app => app.id === interview.applicationId);
        const worker = window.app.state.workers.find(w => w.id === interview.workerId);
        const contractor = window.app.state.contractors.find(c => c.id === interview.contractorId);
        const interviewer = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === interview.interviewerId);
        
        // Format date and time
        const interviewDate = new Date(interview.scheduledDate);
        const formattedDate = interviewDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const formattedTime = interviewDate.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Populate modal
        const detailContainer = modal.querySelector('.interview-detail-container');
        detailContainer.innerHTML = `
            <div class="interview-header">
                <h4>${worker ? worker.name : '-'}</h4>
                <div class="position">${worker ? worker.position : '-'}</div>
            </div>
            
            <div class="interview-details">
                <div class="detail-row">
                    <div class="detail-label">Kontraktor</div>
                    <div class="detail-value">${contractor ? contractor.name : '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Tipe Interview</div>
                    <div class="detail-value">${interview.type}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Tanggal</div>
                    <div class="detail-value">${formattedDate}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Waktu</div>
                    <div class="detail-value">${formattedTime}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Interviewer</div>
                    <div class="detail-value">${interviewer ? interviewer.fullName : '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">${interview.status}</div>
                </div>
            </div>
            
            ${interview.notes ? `
                <div class="interview-notes">
                    <h4>Catatan</h4>
                    <p>${interview.notes}</p>
                </div>
            ` : ''}
            
            ${interview.rescheduleHistory && interview.rescheduleHistory.length > 0 ? `
                <div class="reschedule-history">
                    <h4>Riwayat Penjadwalan Ulang</h4>
                    <table class="reschedule-table">
                        <thead>
                            <tr>
                                <th>Tanggal Lama</th>
                                <th>Tanggal Baru</th>
                                <th>Alasan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${interview.rescheduleHistory.map(history => `
                                <tr>
                                    <td>${new Date(history.oldDate).toLocaleDateString('id-ID')}</td>
                                    <td>${new Date(history.newDate).toLocaleDateString('id-ID')}</td>
                                    <td>${history.reason}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <style>
                .interview-header {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .interview-header h4 {
                    margin: 0 0 5px 0;
                    font-size: 18px;
                }
                
                .interview-header .position {
                    color: #666;
                    font-size: 14px;
                }
                
                .interview-details {
                    margin-bottom: 20px;
                }
                
                .detail-row {
                    display: flex;
                    margin-bottom: 10px;
                }
                
                .detail-label {
                    width: 140px;
                    font-weight: 500;
                    color: #555;
                }
                
                .interview-notes {
                    margin-top: 20px;
                }
                
                .interview-notes h4 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }
                
                .interview-notes p {
                    margin: 0;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 4px;
                    color: #333;
                }
                
                .reschedule-history {
                    margin-top: 20px;
                }
                
                .reschedule-history h4 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }
                
                .reschedule-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .reschedule-table th, .reschedule-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                
                .reschedule-table th {
                    background-color: #f5f5f5;
                    font-weight: 500;
                }
            </style>
        `;
        
        // Show modal
        modal.style.display = 'block';
    }
}