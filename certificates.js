// Certificates module for SBTC System
// Handles certificate generation, management, and verification

// Initialize the certificates module
function initCertificates() {
    console.log('Initializing certificates module...');
    setupCertificateFilters();
    loadCertificates();
}

// Set up certificate section filters
function setupCertificateFilters() {
    const certificateSection = document.querySelector('.sertifikat');
    if (!certificateSection) return;

    // Add event listeners to filters if they don't already have them
    const statusFilter = document.getElementById('certificateStatusFilter');
    const searchInput = document.getElementById('certificateSearch');
    const refreshBtn = document.getElementById('refreshCertificates');
    
    if (statusFilter && !statusFilter.hasAttribute('data-listener')) {
        statusFilter.setAttribute('data-listener', 'true');
        statusFilter.addEventListener('change', function() {
            loadFilteredCertificates();
        });
    }
    
    if (searchInput && !searchInput.hasAttribute('data-listener')) {
        searchInput.setAttribute('data-listener', 'true');
        
        // Add debounce for search input
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadFilteredCertificates();
            }, 300);
        });
    }
    
    if (refreshBtn && !refreshBtn.hasAttribute('data-listener')) {
        refreshBtn.setAttribute('data-listener', 'true');
        refreshBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            loadFilteredCertificates();
            
            setTimeout(() => {
                this.classList.remove('refreshing');
                window.app.showNotification('Data telah diperbarui', 'info');
            }, 800);
        });
    }
}

// Load certificates
function loadCertificates() {
    loadFilteredCertificates('all');
}

// Load filtered certificates
function loadFilteredCertificates(status, searchQuery) {
    // Get filter values if not provided
    if (!status) {
        const statusFilter = document.getElementById('certificateStatusFilter');
        status = statusFilter ? statusFilter.value : 'all';
    }
    
    if (!searchQuery) {
        const searchInput = document.getElementById('certificateSearch');
        searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    }
    
    // Filter certificates based on criteria
    let filteredCerts = window.app.state.certificates;
    
    // Filter by status
    if (status !== 'all') {
        switch(status) {
            case 'active':
                filteredCerts = filteredCerts.filter(cert => {
                    const now = new Date();
                    const expiryDate = new Date(cert.expiryDate);
                    return expiryDate > now && cert.status === 'Active';
                });
                break;
            case 'expired':
                filteredCerts = filteredCerts.filter(cert => {
                    const now = new Date();
                    const expiryDate = new Date(cert.expiryDate);
                    return expiryDate <= now || cert.status === 'Expired';
                });
                break;
            case 'pending':
                // Certificates nearing expiry (within 30 days)
                filteredCerts = filteredCerts.filter(cert => {
                    const now = new Date();
                    const expiryDate = new Date(cert.expiryDate);
                    const daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
                    return daysToExpiry >= 0 && daysToExpiry <= 30 && cert.status === 'Active';
                });
                break;
        }
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredCerts = filteredCerts.filter(cert => {
            // Get worker and contractor details
            const worker = window.app.state.workers.find(w => w.id === cert.workerId);
            const contractor = window.app.state.contractors.find(c => c.id === cert.contractorId);
            
            // Search in worker name, contractor name, and certificate number
            return (
                (worker && worker.name.toLowerCase().includes(searchQuery)) ||
                (contractor && contractor.name.toLowerCase().includes(searchQuery)) ||
                cert.certNumber.toLowerCase().includes(searchQuery)
            );
        });
    }
    
    // Current user for filtering
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // If contractor, only show their certificates
    if (currentUser.role === 'contractor') {
        filteredCerts = filteredCerts.filter(cert => cert.contractorId === currentUser.id);
    }
    
    // Update table with filtered certificates
    updateCertificatesTable(filteredCerts);
    
    // Update certificate stats
    updateCertificateStats();
}

// Update the certificates table
function updateCertificatesTable(certificates) {
    const tableBody = document.getElementById('certificateTableBody');
    if (!tableBody) return;
    
    // Sort certificates by issue date (newest first)
    const sortedCerts = certificates.sort((a, b) => 
        new Date(b.issueDate) - new Date(a.issueDate)
    );
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (sortedCerts.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">Tidak ada sertifikat yang ditemukan</td>`;
        tableBody.appendChild(emptyRow);
        
        // Update pagination info
        const paginationInfo = document.getElementById('certificatePagination').querySelector('span');
        if (paginationInfo) {
            paginationInfo.textContent = 'Menampilkan 0 dari 0 sertifikat';
        }
        return;
    }
    
    // Add rows for each certificate
    sortedCerts.forEach((cert, index) => {
        // Get related data
        const worker = window.app.state.workers.find(w => w.id === cert.workerId);
        const contractor = window.app.state.contractors.find(c => c.id === cert.contractorId);
        
        // Calculate days until expiry
        const now = new Date();
        const expiryDate = new Date(cert.expiryDate);
        const daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        // Determine status class
        let statusClass = 'active';
        let statusText = 'Aktif';
        
        if (daysToExpiry < 0) {
            statusClass = 'expired';
            statusText = 'Expired';
        } else if (daysToExpiry <= 30) {
            statusClass = 'pending';
            statusText = `Akan Expired (${daysToExpiry} hari)`;
        }
        
        // Create row with animation
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
        
        row.innerHTML = `
            <td>
                <div class="worker-name">${worker ? worker.name : '-'}</div>
                <div class="position">${worker ? worker.position : '-'}</div>
            </td>
            <td>
                <div class="company">${contractor ? contractor.name : '-'}</div>
                <div class="category">${contractor ? contractor.business : '-'}</div>
            </td>
            <td>${cert.type}</td>
            <td>${window.app.formatDate(cert.issueDate)}</td>
            <td>${window.app.formatDate(cert.expiryDate)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="view-cert-btn small" data-id="${cert.id}">Lihat</button>
                <button class="download-cert-btn small" data-id="${cert.id}">Download</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    tableBody.querySelectorAll('.view-cert-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const certId = this.getAttribute('data-id');
            viewCertificate(certId);
        });
    });
    
    tableBody.querySelectorAll('.download-cert-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const certId = this.getAttribute('data-id');
            downloadCertificate(certId);
        });
    });
    
    // Update pagination info
    const paginationInfo = document.getElementById('certificatePagination').querySelector('span');
    if (paginationInfo) {
        paginationInfo.textContent = `Menampilkan ${sortedCerts.length} dari ${certificates.length} sertifikat`;
    }
}

// Update certificate statistics
function updateCertificateStats() {
    // Get all certificates
    const certificates = window.app.state.certificates;
    
    // Current user for filtering
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // If contractor, only count their certificates
    let filteredCerts = certificates;
    if (currentUser.role === 'contractor') {
        filteredCerts = certificates.filter(cert => cert.contractorId === currentUser.id);
    }
    
    // Calculate statistics
    const now = new Date();
    
    const totalCerts = filteredCerts.length;
    
    const activeCerts = filteredCerts.filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate > now && cert.status === 'Active';
    }).length;
    
    const expiredCerts = filteredCerts.filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate <= now || cert.status === 'Expired';
    }).length;
    
    const pendingCerts = filteredCerts.filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        const daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysToExpiry >= 0 && daysToExpiry <= 30 && cert.status === 'Active';
    }).length;
    
    // Update stat elements with animation
    animateValue(document.getElementById('totalCertificates'), totalCerts);
    animateValue(document.getElementById('activeCertificates'), activeCerts);
    animateValue(document.getElementById('expiredCertificates'), expiredCerts);
    animateValue(document.getElementById('pendingCertificates'), pendingCerts);
}

// Animate value change for better UX
function animateValue(element, endValue) {
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 800; // milliseconds
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const value = Math.floor(startValue + progress * (endValue - startValue));
        
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// View certificate
function viewCertificate(certId) {
    // Get certificate data
    const cert = window.app.state.certificates.find(c => c.id === certId);
    if (!cert) {
        window.app.showNotification('Sertifikat tidak ditemukan', 'error');
        return;
    }
    
    // Get related data
    const worker = window.app.state.workers.find(w => w.id === cert.workerId);
    const contractor = window.app.state.contractors.find(c => c.id === cert.contractorId);
    const issuer = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === cert.issuedBy);
    
    // Check if certificate modal exists, create if not
    let modal = document.getElementById('certificateModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'certificateModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content certificate-modal-content">
                    <div class="modal-header">
                        <h3>SBTC Certificate</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="certificate-container">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .certificate-modal-content {
                    max-width: 800px;
                    width: 90%;
                }
                
                .certificate-container {
                    background-color: #fff;
                    padding: 20px;
                    border: 15px solid #0066cc;
                    position: relative;
                    margin: 0 auto;
                }
                
                .certificate-inner {
                    border: 2px solid #0066cc;
                    padding: 30px;
                    text-align: center;
                    position: relative;
                }
                
                .certificate-header {
                    margin-bottom: 30px;
                }
                
                .certificate-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #0066cc;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                }
                
                .certificate-subtitle {
                    font-size: 18px;
                    color: #333;
                }
                
                .certificate-logo {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 80px;
                    height: auto;
                    opacity: 0.8;
                }
                
                .certificate-body {
                    margin-bottom: 30px;
                }
                
                .certificate-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 10px;
                    border-bottom: 2px solid #0066cc;
                    display: inline-block;
                    padding-bottom: 5px;
                }
                
                .certificate-details {
                    margin: 20px auto;
                    width: 80%;
                }
                
                .cert-detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                
                .cert-detail-label {
                    font-weight: bold;
                    color: #555;
                    text-align: left;
                }
                
                .cert-detail-value {
                    color: #333;
                    text-align: right;
                }
                
                .certificate-footer {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                }
                
                .certificate-signature {
                    text-align: center;
                    width: 200px;
                }
                
                .signature-line {
                    border-top: 1px solid #333;
                    margin-bottom: 5px;
                }
                
                .signature-name {
                    font-weight: bold;
                }
                
                .signature-title {
                    font-size: 12px;
                    color: #555;
                }
                
                .certificate-qr {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    width: 100px;
                    height: 100px;
                    background-color: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                }
                
                .certificate-serial {
                    position: absolute;
                    bottom: 10px;
                    left: 20px;
                    font-size: 12px;
                    color: #666;
                }
                
                .certificate-watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 80px;
                    color: rgba(0, 102, 204, 0.05);
                    font-weight: bold;
                    pointer-events: none;
                    white-space: nowrap;
                }
                
                .certificate-validity {
                    margin-top: 20px;
                    padding: 10px;
                    border: 1px dashed #0066cc;
                    display: inline-block;
                }
                
                .validity-text {
                    font-size: 14px;
                    color: #0066cc;
                }
                
                .expired .validity-text {
                    color: #f44336;
                }
            </style>
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
    
    // Calculate certificate validity
    const now = new Date();
    const issueDate = new Date(cert.issueDate);
    const expiryDate = new Date(cert.expiryDate);
    const isExpired = expiryDate < now;
    
    // Format dates
    const formattedIssueDate = issueDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const formattedExpiryDate = expiryDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Populate certificate
    const certificateContainer = modal.querySelector('.certificate-container');
    certificateContainer.innerHTML = `
        <div class="certificate-inner">
            <img src="xf2c1ffjur.png" class="certificate-logo" alt="SBTC Logo">
            
            <div class="certificate-header">
                <div class="certificate-title">Sertifikat SBTC</div>
                <div class="certificate-subtitle">Safety Basic Training Certificate</div>
            </div>
            
            <div class="certificate-body">
                <div class="certificate-text">
                    Dengan ini menyatakan bahwa
                </div>
                <div class="certificate-name">
                    ${worker ? worker.name : 'Unknown Worker'}
                </div>
                <div class="certificate-position">
                    ${worker ? worker.position : 'Unknown Position'}
                </div>
                
                <div class="certificate-details">
                    <div class="cert-detail-row">
                        <div class="cert-detail-label">Perusahaan:</div>
                        <div class="cert-detail-value">${contractor ? contractor.name : 'Unknown Company'}</div>
                    </div>
                    <div class="cert-detail-row">
                        <div class="cert-detail-label">NIK:</div>
                        <div class="cert-detail-value">${worker ? worker.nik : '-'}</div>
                    </div>
                    <div class="cert-detail-row">
                        <div class="cert-detail-label">Tanggal Terbit:</div>
                        <div class="cert-detail-value">${formattedIssueDate}</div>
                    </div>
                    <div class="cert-detail-row">
                        <div class="cert-detail-label">Tanggal Expired:</div>
                        <div class="cert-detail-value">${formattedExpiryDate}</div>
                    </div>
                    <div class="cert-detail-row">
                        <div class="cert-detail-label">Nomor Sertifikat:</div>
                        <div class="cert-detail-value">${cert.certNumber}</div>
                    </div>
                </div>
                
                <div class="certificate-validity ${isExpired ? 'expired' : ''}">
                    <div class="validity-text">
                        ${isExpired 
                            ? 'SERTIFIKAT INI TELAH EXPIRED' 
                            : 'SERTIFIKAT INI BERLAKU HINGGA TANGGAL YANG TERCANTUM'}
                    </div>
                </div>
            </div>
            
            <div class="certificate-footer">
                <div class="certificate-signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">${issuer ? issuer.fullName : 'SBTC Administrator'}</div>
                    <div class="signature-title">SBTC Authorized Officer</div>
                </div>
                
                <div class="certificate-signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">SBTC Zone 5 Manager</div>
                    <div class="signature-title">PHE ONWJ</div>
                </div>
            </div>
            
            <div class="certificate-qr">
                QR Code Verification<br>
                Scan to verify
            </div>
            
            <div class="certificate-serial">
                Serial: ${cert.id}
            </div>
            
            <div class="certificate-watermark">
                SBTC ZONA 5
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
}

// Download certificate
function downloadCertificate(certId) {
    // Get certificate data
    const cert = window.app.state.certificates.find(c => c.id === certId);
    if (!cert) {
        window.app.showNotification('Sertifikat tidak ditemukan', 'error');
        return;
    }
    
    // Show notification (in a real app, this would actually generate a PDF)
    window.app.showNotification('Fitur download sertifikat belum tersedia', 'info');
}