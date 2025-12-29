// Reports module for SBTC System
// Handles reporting and statistics

// Initialize the reports module
function initReports() {
    console.log('Initializing reports module...');
    setupReportFilters();
    generateReports();
}

// Set up report filters
function setupReportFilters() {
    const reportSection = document.querySelector('.laporan');
    if (!reportSection) return;

    // Add event listeners to filters if they don't already have them
    const periodFilter = reportSection.querySelector('.filter-controls select');
    const refreshBtn = reportSection.querySelector('.refresh-btn');
    
    if (periodFilter && !periodFilter.hasAttribute('data-listener')) {
        periodFilter.setAttribute('data-listener', 'true');
        
        // Update period options if needed
        if (periodFilter.options.length <= 1) {
            periodFilter.innerHTML = `
                <option value="all">Semua Periode</option>
                <option value="month">Bulan Ini</option>
                <option value="quarter">Kuartal Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="custom">Kustom...</option>
            `;
        }
        
        periodFilter.addEventListener('change', function() {
            if (this.value === 'custom') {
                showCustomDateRangePicker();
            } else {
                generateReports(this.value);
            }
        });
    }
    
    if (refreshBtn && !refreshBtn.hasAttribute('data-listener')) {
        refreshBtn.setAttribute('data-listener', 'true');
        refreshBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            generateReports(periodFilter ? periodFilter.value : 'all');
            
            setTimeout(() => {
                this.classList.remove('refreshing');
                window.app.showNotification('Laporan telah diperbarui', 'info');
            }, 800);
        });
    }
}

// Show custom date range picker
function showCustomDateRangePicker() {
    // Check if custom date picker already exists
    if (document.getElementById('customDatePicker')) {
        document.getElementById('customDatePicker').style.display = 'block';
        return;
    }
    
    // Create custom date picker
    const datePickerContainer = document.createElement('div');
    datePickerContainer.id = 'customDatePicker';
    datePickerContainer.className = 'custom-date-picker';
    
    // Style the container
    datePickerContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        z-index: 1000;
        width: 300px;
    `;
    
    // Add form elements
    datePickerContainer.innerHTML = `
        <h3 style="margin-top: 0;">Pilih Rentang Tanggal</h3>
        <div style="margin-bottom: 15px;">
            <label>Tanggal Mulai</label>
            <input type="date" id="startDate" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        <div style="margin-bottom: 20px;">
            <label>Tanggal Akhir</label>
            <input type="date" id="endDate" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancelDateRange" style="padding: 8px 12px;">Batal</button>
            <button id="applyDateRange" style="padding: 8px 12px; background-color: #0066cc; color: white; border: none; border-radius: 4px;">Terapkan</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(datePickerContainer);
    
    // Set default dates (this month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('startDate').valueAsDate = firstDay;
    document.getElementById('endDate').valueAsDate = lastDay;
    
    // Add event listeners
    document.getElementById('cancelDateRange').addEventListener('click', function() {
        datePickerContainer.style.display = 'none';
        // Reset select to "all"
        const periodFilter = document.querySelector('.laporan .filter-controls select');
        if (periodFilter) periodFilter.value = 'all';
    });
    
    document.getElementById('applyDateRange').addEventListener('click', function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            window.app.showNotification('Harap pilih rentang tanggal yang valid', 'error');
            return;
        }
        
        // Hide date picker
        datePickerContainer.style.display = 'none';
        
        // Generate report with custom date range
        generateReports('custom', { startDate, endDate });
    });
}

// Generate reports
function generateReports(period = 'all', customDateRange = null) {
    // Filter applications based on selected period
    let filteredApps = filterApplicationsByPeriod(window.app.state.applications, period, customDateRange);
    
    // Generate different reports
    updateMonthlySummary(filteredApps, period);
    updatePICPerformance(filteredApps, period);
    updateCertificateSummary(period, customDateRange);
    
    // Add export functionality
    setupReportExport();
}

// Filter applications by period
function filterApplicationsByPeriod(applications, period, customDateRange = null) {
    if (period === 'all') return applications;
    
    const now = new Date();
    let startDate;
    
    if (period === 'custom' && customDateRange) {
        startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // End of the day
        
        return applications.filter(app => {
            const appDate = new Date(app.submissionDate);
            return appDate >= startDate && appDate <= endDate;
        });
    }
    
    switch(period) {
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
        default:
            return applications;
    }
    
    return applications.filter(app => {
        const appDate = new Date(app.submissionDate);
        return appDate >= startDate;
    });
}

// Update monthly summary report
function updateMonthlySummary(applications, period) {
    const reportCard = document.querySelector('.report-card:nth-child(1)');
    if (!reportCard) return;
    
    // Update title based on period
    const reportTitle = reportCard.querySelector('h3');
    if (reportTitle) {
        switch(period) {
            case 'month':
                reportTitle.textContent = 'Ringkasan Bulanan';
                break;
            case 'quarter':
                reportTitle.textContent = 'Ringkasan Kuartal';
                break;
            case 'year':
                reportTitle.textContent = 'Ringkasan Tahunan';
                break;
            case 'custom':
                reportTitle.textContent = 'Ringkasan Kustom';
                break;
            default:
                reportTitle.textContent = 'Ringkasan Keseluruhan';
        }
    }
    
    // Calculate statistics
    const totalApps = applications.length;
    const approvedApps = applications.filter(app => 
        app.status === 'Disetujui' || 
        app.status === 'Interview Terjadwal' ||
        app.status === 'Interview Selesai' ||
        app.status === 'Sertifikat Terbit'
    ).length;
    
    const rejectedApps = applications.filter(app => 
        app.status === 'Ditolak'
    ).length;
    
    const inProgressApps = applications.filter(app => 
        app.status === 'Diajukan' || 
        app.status === 'Menunggu Review' || 
        app.status === 'Direview' ||
        app.status === 'Menunggu Interview'
    ).length;
    
    // Update values with animation
    const reportList = reportCard.querySelector('.report-list');
    if (reportList) {
        const reportValues = reportList.querySelectorAll('.report-value');
        
        // Animate values
        animateValue(reportValues[0], totalApps);
        animateValue(reportValues[1], approvedApps);
        animateValue(reportValues[2], rejectedApps);
        animateValue(reportValues[3], inProgressApps);
    }
}

// Update PIC performance report
function updatePICPerformance(applications, period) {
    const reportCard = document.querySelector('.report-card:nth-child(2)');
    if (!reportCard) return;
    
    // Get all unique PICs from application history
    const picStats = {};
    
    applications.forEach(app => {
        if (!app.statusHistory) return;
        
        app.statusHistory.forEach(status => {
            const userId = status.userId;
            if (!userId) return;
            
            if (!picStats[userId]) {
                picStats[userId] = {
                    count: 0,
                    totalDuration: 0,
                    name: window.app.getUserNameById(userId)
                };
            }
            
            picStats[userId].count++;
        });
    });
    
    // Calculate average processing time
    for (const userId in picStats) {
        if (picStats[userId].count > 0) {
            picStats[userId].avgDuration = Math.round(picStats[userId].totalDuration / picStats[userId].count);
        }
    }
    
    // Find best performing PIC (most processed applications)
    let bestPIC = { count: 0, name: '-' };
    for (const userId in picStats) {
        if (picStats[userId].count > bestPIC.count) {
            bestPIC = {
                count: picStats[userId].count,
                name: picStats[userId].name
            };
        }
    }
    
    // Update values
    const reportList = reportCard.querySelector('.report-list');
    if (reportList) {
        const reportValues = reportList.querySelectorAll('.report-value');
        
        // Count active PICs
        const activePICs = Object.keys(picStats).length;
        
        // Average completion time (placeholder)
        const avgCompletionTime = '3 hari';
        
        // Update with animation
        animateValue(reportValues[0], activePICs);
        reportValues[1].textContent = avgCompletionTime;
        reportValues[2].textContent = bestPIC.name;
    }
}

// Update certificate summary report
function updateCertificateSummary(period, customDateRange) {
    const reportCard = document.querySelector('.report-card:nth-child(3)');
    if (!reportCard) return;
    
    // Filter certificates by period
    let filteredCerts;
    
    if (period === 'custom' && customDateRange) {
        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        filteredCerts = window.app.state.certificates.filter(cert => {
            const issueDate = new Date(cert.issueDate);
            return issueDate >= startDate && issueDate <= endDate;
        });
    } else {
        filteredCerts = filterCertificatesByPeriod(window.app.state.certificates, period);
    }
    
    // Calculate statistics
    const totalCerts = filteredCerts.length;
    
    // Count new certificates vs renewals (placeholder - we don't track this yet)
    const newCerts = Math.round(totalCerts * 0.7); // Placeholder: 70% new
    const renewalCerts = totalCerts - newCerts;    // Placeholder: 30% renewals
    
    // Update values
    const reportList = reportCard.querySelector('.report-list');
    if (reportList) {
        const reportValues = reportList.querySelectorAll('.report-value');
        
        // Update with animation
        animateValue(reportValues[0], totalCerts);
        animateValue(reportValues[1], newCerts);
        animateValue(reportValues[2], renewalCerts);
    }
}

// Filter certificates by period
function filterCertificatesByPeriod(certificates, period) {
    if (period === 'all') return certificates;
    
    const now = new Date();
    let startDate;
    
    switch(period) {
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
        default:
            return certificates;
    }
    
    return certificates.filter(cert => {
        const certDate = new Date(cert.issueDate);
        return certDate >= startDate;
    });
}

// Animate value change
function animateValue(element, endValue) {
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 800; // milliseconds
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (endValue - startValue) + startValue);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Set up report export functionality
function setupReportExport() {
    // Add functionality to download buttons
    const downloadButtons = document.querySelectorAll('.btn-download');
    
    downloadButtons.forEach((btn, index) => {
        if (btn.hasAttribute('data-listener')) return;
        
        btn.setAttribute('data-listener', 'true');
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get report type based on index
            let reportType;
            switch(index) {
                case 0:
                    reportType = 'monthly-summary';
                    break;
                case 1:
                    reportType = 'pic-performance';
                    break;
                case 2:
                    reportType = 'certificate-summary';
                    break;
                default:
                    reportType = 'general';
            }
            
            // Show notification (in a real app, this would generate a report file)
            window.app.showNotification('Fitur unduh laporan belum tersedia', 'info');
        });
    });
}