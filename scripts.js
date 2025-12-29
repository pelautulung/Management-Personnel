// Main application functionality for SBTC System
// This file contains the core logic and data management

// Global state for application data
const appState = {
    applications: [],
    contractors: [],
    workers: [],
    interviews: [],
    certificates: [],
    reviews: [],
    jobPositions: [],
    users: [],
    currentView: 'dashboard'
};

// Redirect to contractor management page
function redirectToContractorManagement() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'superadmin') {
        window.location.href = 'contractor-management.html';
    } else {
        alert('Anda tidak memiliki akses ke halaman manajemen kontraktor.');
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromLocalStorage();
    initializeApp();
    setupEventListeners();
});

// Initialize application data and UI
function initializeApp() {
    // Check authentication first
    if (!window.auth || !window.auth.isSessionValid()) {
        // If we're not on the login page, redirect to it
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return;
    }

    // Load initial data
    loadMockData();
    
    // Initialize all modules
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initApplications === 'function') initApplications();
    if (typeof initReviews === 'function') initReviews();
    if (typeof initInterviews === 'function') initInterviews();
    if (typeof initCertificates === 'function') initCertificates();
    if (typeof initRequirements === 'function') initRequirements();
    if (typeof initReports === 'function') initReports();
    if (typeof initStatusTracking === 'function') initStatusTracking();
    
    // Display appropriate view based on user role
    displayViewByUserRole();
}

// Set up global event listeners
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            changeView(section);
        });
    });
    
    // Contractor management link - no longer prevent default for href links
    const manageContractorsLink = document.getElementById('manageContractorsLink');
    if (manageContractorsLink) {
        // Remove any potential event listener conflicts - let href work naturally
        manageContractorsLink.onclick = null;
    }
    
    // Show contractor form for authorized users
    displayContractorFormBasedOnRole();
    
    // Logout handler - ensure it works for guest users too
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Check if user is guest and handle logout without confirmation if needed
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.role === 'guest') {
                // Guest users don't need confirmation
                window.auth.logout(true); // Skip confirmation for guest users
            } else {
                window.auth.logout();
            }
        });
    }

    // Back to dashboard links
    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            changeView('dashboard');
        });
    });
}

// Change current view/section
function changeView(viewName) {
    // Check permissions for this view
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role || 'guest';
    
    // Permission mapping for views
    const viewPermissions = {
        'dashboard': ['superadmin', 'admin', 'contractor', 'guest'],
        'pengajuan-baru': ['superadmin', 'admin', 'contractor'],
        'review': ['superadmin', 'admin'],
        'jadwal-interview': ['superadmin', 'admin', 'contractor'],
        'sertifikat': ['superadmin', 'admin', 'contractor', 'guest'],
        'laporan': ['superadmin', 'admin'],
        'status-pengajuan': ['superadmin', 'admin', 'contractor', 'guest']
    };
    
    // Check if user has permission
    if (viewPermissions[viewName] && !viewPermissions[viewName].includes(userRole)) {
        showNotification('Anda tidak memiliki akses ke bagian ini', 'error');
        return;
    }
    
    // Update navigation active state
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === viewName) {
            link.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
        section.style.opacity = '0';
        setTimeout(() => {
            section.style.display = 'none';
        }, 150);
    });
    
    // Show selected section with animation
    const selectedSection = document.querySelector(`.${viewName}`);
    if (selectedSection) {
        setTimeout(() => {
            selectedSection.style.display = 'block';
            
            // Update specific view data if needed
            updateViewData(viewName);
            
            setTimeout(() => {
                selectedSection.style.opacity = '1';
            }, 50);
        }, 200);
    }
    
    // Update current view in state
    appState.currentView = viewName;
}

// Update specific view data when switching views
function updateViewData(viewName) {
    switch(viewName) {
        case 'dashboard':
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
            if (typeof updateRecentApplicationsTable === 'function') updateRecentApplicationsTable();
            break;
        case 'pengajuan-baru':
            if (typeof populateContractorSelect === 'function') populateContractorSelect();
            if (typeof loadJobPositions === 'function') loadJobPositions();
            break;
        case 'review':
            if (typeof loadPendingReviews === 'function') loadPendingReviews();
            break;
        case 'jadwal-interview':
            if (typeof loadInterviewSchedules === 'function') loadInterviewSchedules();
            break;
        case 'sertifikat':
            if (typeof loadCertificates === 'function') loadCertificates();
            break;
        case 'laporan':
            if (typeof generateReports === 'function') generateReports();
            break;
        case 'status-pengajuan':
            if (typeof loadApplicationStatuses === 'function') loadApplicationStatuses();
            break;
    }
}

// Display appropriate view based on user role
function displayViewByUserRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role || 'guest';
    
    // Hide sections based on role
    if (userRole === 'contractor') {
        document.querySelectorAll('[data-role-access]').forEach(element => {
            const allowedRoles = element.getAttribute('data-role-access').split(',');
            if (!allowedRoles.includes('contractor')) {
                element.style.display = 'none';
            }
        });
    } else if (userRole === 'guest') {
        document.querySelectorAll('[data-role-access]').forEach(element => {
            const allowedRoles = element.getAttribute('data-role-access').split(',');
            if (!allowedRoles.includes('guest')) {
                element.style.display = 'none';
            }
        });
    }
    
    // Default view based on role
    let defaultView = 'dashboard';
    if (userRole === 'admin' && currentUser.interviewType) {
        defaultView = 'review'; // HSSE or Engineering interviewer
    }
    
    changeView(defaultView);
}

// Load mock data for development/demo
function loadMockData() {
    // Mock Contractors
    appState.contractors = [
        {
            id: 'C001',
            name: 'PT Example Company',
            business: 'Construction',
            address: 'Jl. Industri Raya No. 123, Jakarta Utara',
            contactPerson: 'Budi Santoso',
            phone: '081234567890',
            email: 'contact@example.com',
            contractNumber: 'CTR-2023-0001',
            contractStart: '2023-01-15',
            contractEnd: '2024-01-14'
        },
        {
            id: 'C002',
            name: 'PT Sample Corp',
            business: 'Electrical',
            address: 'Jl. Pahlawan No. 45, Jakarta Selatan',
            contactPerson: 'Siti Rahayu',
            phone: '087654321098',
            email: 'info@samplecorp.com',
            contractNumber: 'CTR-2023-0002',
            contractStart: '2023-03-01',
            contractEnd: '2024-02-28'
        }
    ];
    
    // Mock Job Positions with Requirements
    appState.jobPositions = [
        {
            id: 'POS001',
            title: 'Welder',
            description: 'Skilled welder for industrial piping',
            requirements: {
                minExperience: 3, // years
                requiredCertifications: ['Welder 6G', 'SMAW', 'GTAW'],
                additionalRequirements: [
                    'Pengalaman bekerja di industri minyak dan gas',
                    'Familiar dengan standar ASME dan AWS',
                    'Mampu bekerja di ketinggian'
                ],
                healthRequirements: ['Tidak buta warna', 'Fit to work certification']
            }
        },
        {
            id: 'POS002',
            title: 'Electrical Engineer',
            description: 'Electrical engineer for industrial systems',
            requirements: {
                minExperience: 5, // years
                requiredCertifications: ['Electrical Safety', 'AK3 Listrik'],
                additionalRequirements: [
                    'Pengalaman minimal 5 tahun di industri minyak dan gas',
                    'Familiar dengan standar IEC dan NFPA',
                    'Mampu membaca dan membuat single line diagram'
                ],
                healthRequirements: ['Tidak buta warna', 'Fit to work certification']
            }
        },
        {
            id: 'POS003',
            title: 'Mechanical Engineer',
            description: 'Mechanical engineer for industrial equipment',
            requirements: {
                minExperience: 4, // years
                requiredCertifications: ['ASME B31.3', 'Mechanical Safety'],
                additionalRequirements: [
                    'Pengalaman di bidang perancangan mekanik',
                    'Familiar dengan peralatan rotating',
                    'Pengetahuan tentang pompa dan kompresor'
                ],
                healthRequirements: ['Fit to work certification']
            }
        },
        {
            id: 'POS004',
            title: 'Rigger',
            description: 'Rigger for heavy lifting operations',
            requirements: {
                minExperience: 2, // years
                requiredCertifications: ['Rigging Basic', 'Working at Height'],
                additionalRequirements: [
                    'Pengalaman dengan pengangkatan beban berat',
                    'Pengetahuan tentang sling dan shackle',
                    'Familiar dengan hand signals'
                ],
                healthRequirements: ['Tidak takut ketinggian', 'Fit to work certification']
            }
        },
        {
            id: 'POS005',
            title: 'Instrument Technician',
            description: 'Technician for industrial instrumentation',
            requirements: {
                minExperience: 3, // years
                requiredCertifications: ['Instrumentation Basic', 'Calibration'],
                additionalRequirements: [
                    'Pengalaman dengan sistem kontrol DCS',
                    'Familiar dengan transmitter dan sensor',
                    'Pengetahuan tentang kalibrasi alat ukur'
                ],
                healthRequirements: ['Tidak buta warna', 'Fit to work certification']
            }
        }
    ];
    
    // Mock Workers
    appState.workers = [
        {
            id: 'W001',
            contractorId: 'C001',
            name: 'John Doe',
            nik: '3671122509880001',
            birthDate: '1988-09-25',
            position: 'Welder',
            phone: '081234567890',
            email: 'john.doe@example.com',
            certifications: ['Welder 6G', 'SMAW'],
            mcuStatus: 'Valid',
            mcuExpiry: '2023-12-31',
            trainings: [
                { name: 'Basic Safety Training', date: '2022-05-10', certificate: 'BST-2022-JD' },
                { name: 'Advanced Welding', date: '2021-11-15', certificate: 'AW-2021-JD' }
            ],
            workExperience: [
                { 
                    company: 'PT Previous Company', 
                    position: 'Junior Welder', 
                    startDate: '2018-01-01', 
                    endDate: '2020-12-31',
                    description: 'Performed welding for industrial pipes'
                }
            ]
        },
        {
            id: 'W002',
            contractorId: 'C002',
            name: 'Jane Smith',
            nik: '3671120304900002',
            birthDate: '1990-04-03',
            position: 'Electrical Engineer',
            phone: '087654321098',
            email: 'jane.smith@example.com',
            certifications: ['Electrical Safety', 'AK3 Listrik'],
            mcuStatus: 'Valid',
            mcuExpiry: '2023-11-30',
            trainings: [
                { name: 'Electrical Safety Training', date: '2022-03-20', certificate: 'EST-2022-JS' },
                { name: 'Low Voltage Operations', date: '2021-09-05', certificate: 'LVO-2021-JS' }
            ],
            workExperience: [
                { 
                    company: 'PT Electrical Services', 
                    position: 'Electrical Technician', 
                    startDate: '2016-05-01', 
                    endDate: '2021-04-30',
                    description: 'Maintained and installed electrical systems'
                }
            ]
        }
    ];
    
    // Mock Applications
    appState.applications = [
        {
            id: 'APP001',
            contractorId: 'C001',
            workerId: 'W001',
            position: 'Welder',
            submissionDate: '2023-06-10T09:30:00',
            status: 'Menunggu Review',
            statusHistory: [
                { 
                    status: 'Diajukan', 
                    timestamp: '2023-06-10T09:30:00', 
                    userId: 3, 
                    notes: 'Pengajuan awal'
                }
            ],
            reviewers: {
                hsse: 4, // User ID for HSSE reviewer
                engineering: 5 // User ID for Engineering reviewer
            },
            documents: [
                { type: 'CV', fileName: 'john_doe_cv.pdf', uploadDate: '2023-06-10T09:25:00' },
                { type: 'MCU', fileName: 'john_doe_mcu.pdf', uploadDate: '2023-06-10T09:26:00' },
                { type: 'Certification', fileName: 'welder_6g_cert.pdf', uploadDate: '2023-06-10T09:27:00' }
            ],
            notes: 'Pengajuan untuk proyek pipa baru'
        },
        {
            id: 'APP002',
            contractorId: 'C002',
            workerId: 'W002',
            position: 'Electrical Engineer',
            submissionDate: '2023-06-15T14:15:00',
            status: 'Disetujui',
            statusHistory: [
                { 
                    status: 'Diajukan', 
                    timestamp: '2023-06-15T14:15:00', 
                    userId: 3, 
                    notes: 'Pengajuan awal'
                },
                { 
                    status: 'Direview', 
                    timestamp: '2023-06-16T10:20:00', 
                    userId: 2, 
                    notes: 'Dokumen lengkap'
                },
                { 
                    status: 'Disetujui', 
                    timestamp: '2023-06-17T11:30:00', 
                    userId: 2, 
                    notes: 'Memenuhi semua persyaratan'
                }
            ],
            reviewers: {
                hsse: 4,
                engineering: 5
            },
            documents: [
                { type: 'CV', fileName: 'jane_smith_cv.pdf', uploadDate: '2023-06-15T14:10:00' },
                { type: 'MCU', fileName: 'jane_smith_mcu.pdf', uploadDate: '2023-06-15T14:11:00' },
                { type: 'Certification', fileName: 'electrical_safety_cert.pdf', uploadDate: '2023-06-15T14:12:00' }
            ],
            notes: 'Pengajuan untuk proyek instalasi panel listrik'
        },
        {
            id: 'APP003',
            contractorId: 'C001',
            workerId: 'W001',
            position: 'Welder',
            submissionDate: '2023-07-05T11:45:00',
            status: 'Direview',
            statusHistory: [
                { 
                    status: 'Diajukan', 
                    timestamp: '2023-07-05T11:45:00', 
                    userId: 3, 
                    notes: 'Pengajuan awal'
                },
                { 
                    status: 'Direview', 
                    timestamp: '2023-07-06T09:30:00', 
                    userId: 4, 
                    notes: 'Sedang dalam proses review'
                }
            ],
            reviewers: {
                hsse: 4,
                engineering: 5
            },
            documents: [
                { type: 'CV', fileName: 'john_doe_cv_updated.pdf', uploadDate: '2023-07-05T11:40:00' },
                { type: 'MCU', fileName: 'john_doe_mcu_new.pdf', uploadDate: '2023-07-05T11:41:00' },
                { type: 'Certification', fileName: 'welder_6g_cert_2023.pdf', uploadDate: '2023-07-05T11:42:00' }
            ],
            notes: 'Pengajuan untuk proyek pipa gas'
        }
    ];
    
    // Mock Interviews
    appState.interviews = [
        {
            id: 'INT001',
            applicationId: 'APP001',
            workerId: 'W001',
            contractorId: 'C001',
            type: 'HSSE',
            scheduledDate: '2023-06-20T10:00:00',
            interviewerId: 4,
            status: 'Scheduled',
            notes: 'Interview untuk John Doe dari PT Example Company'
        }
    ];
    
    // Mock Certificates
    appState.certificates = [
        {
            id: 'CERT001',
            applicationId: 'APP002',
            workerId: 'W002',
            contractorId: 'C002',
            type: 'SBTC',
            issueDate: '2023-06-18',
            expiryDate: '2024-06-17',
            status: 'Active',
            issuedBy: 2,
            certNumber: 'SBTC-2023-001',
            notes: 'Sertifikat untuk Jane Smith'
        }
    ];
    
    // Mock Reviews
    appState.reviews = [
        {
            id: 'REV001',
            applicationId: 'APP001',
            reviewerId: 4,
            type: 'HSSE',
            date: '2023-06-16T14:00:00',
            status: 'Pending',
            notes: '',
            results: {}
        },
        {
            id: 'REV002',
            applicationId: 'APP002',
            reviewerId: 4,
            type: 'HSSE',
            date: '2023-06-16T10:20:00',
            status: 'Approved',
            notes: 'Dokumen MCU dan safety training lengkap',
            results: {
                mcuValid: true,
                safetyTraining: true,
                documents: true
            }
        },
        {
            id: 'REV003',
            applicationId: 'APP002',
            reviewerId: 5,
            type: 'Engineering',
            date: '2023-06-17T09:15:00',
            status: 'Approved',
            notes: 'Pengalaman dan sertifikasi memenuhi syarat',
            results: {
                experienceValid: true,
                certificationValid: true,
                technicalKnowledge: true
            }
        }
    ];
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Style the notification
    notification.style.backgroundColor = type === 'error' ? '#ffebee' : '#e8f5e9';
    notification.style.color = type === 'error' ? '#d32f2f' : '#2e7d32';
    notification.style.padding = '12px 16px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    notification.style.position = 'relative';
    notification.style.animation = 'fadeIn 0.3s ease';
    
    // Add notification to container
    container.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '8px';
    
    closeBtn.addEventListener('click', function() {
        container.removeChild(notification);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode === container) {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Utility function to format dates
function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('id-ID', options);
}

// Utility function to calculate duration between dates
function calculateDuration(startDate, endDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} menit`;
        }
        return `${diffHours} jam`;
    } else if (diffDays < 30) {
        return `${diffDays} hari`;
    } else {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths} bulan`;
    }
}

// Helper function to generate unique IDs
function generateId(prefix) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
}

// Get user name by ID
function getUserNameById(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    return user ? user.fullName || user.username : 'Unknown User';
}

// Notify data change to update all related views
function notifyDataChange(dataType) {
    console.log(`Data changed: ${dataType}`);
    
    // Update dashboard stats if visible
    if (document.querySelector('.dashboard').style.display !== 'none') {
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
    }
    
    // Update status-pengajuan if visible
    if (document.querySelector('.status-pengajuan').style.display !== 'none') {
        if (typeof loadApplicationStatuses === 'function') loadApplicationStatuses();
    }
    
    // Update reports if visible
    if (document.querySelector('.laporan').style.display !== 'none') {
        if (typeof generateReports === 'function') generateReports();
    }
    
    // Update specific views based on data type
    switch(dataType) {
        case 'applications':
            // Update applications-related views
            if (document.querySelector('.pengajuan-terbaru').style.display !== 'none') {
                if (typeof updateRecentApplicationsTable === 'function') updateRecentApplicationsTable();
            }
            break;
        case 'reviews':
            // Update review-related views
            if (document.querySelector('.review').style.display !== 'none') {
                if (typeof loadPendingReviews === 'function') loadPendingReviews();
            }
            break;
        case 'interviews':
            // Update interview-related views
            if (document.querySelector('.jadwal-interview').style.display !== 'none') {
                if (typeof loadInterviewSchedules === 'function') loadInterviewSchedules();
            }
            break;
        case 'certificates':
            // Update certificate-related views
            if (document.querySelector('.sertifikat').style.display !== 'none') {
                if (typeof loadCertificates === 'function') loadCertificates();
            }
            break;
    }
}

// Save appState to localStorage for persistence
function saveAppStateToLocalStorage() {
    localStorage.setItem('appState', JSON.stringify(appState));
    console.log('App state saved to localStorage');
}

// Export functions for use in other modules
window.app = {
    state: appState,
    showNotification,
    formatDate,
    calculateDuration,
    generateId,
    getUserNameById,
    changeView,
    notifyDataChange,
    loadDataFromLocalStorage,
    saveAppStateToLocalStorage
};// Display contractor form based on user role
function displayContractorFormBasedOnRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role || 'guest';
    
    // Display contractor form for contractor representatives
    const contractorForm = document.getElementById('contractor-form');
    if (contractorForm) {
        if (userRole === 'contractor') {
            contractorForm.style.display = 'block';
            // Hide access message since user has access
            const roleAccessMessage = document.getElementById('role-access-message');
            if (roleAccessMessage) {
                roleAccessMessage.style.display = 'none';
            }
        } else {
            contractorForm.style.display = 'none';
            // Show message for users without access
            const roleAccessMessage = document.getElementById('role-access-message');
            if (roleAccessMessage) {
                roleAccessMessage.style.display = 'block';
            }
        }
    }
}

// Position selection functionality for drilling and well intervention
function updatePositionOptions() {
    const department = document.getElementById('department').value;
    const positionSelect = document.getElementById('personnelPosition');
    
    // Clear existing options
    positionSelect.innerHTML = '<option value="">Pilih Posisi</option>';
    
    let positions = [];
    
    switch(department) {
        case 'drilling':
            positions = [
                {value: 'toolpusher', text: 'Tool Pusher'},
                {value: 'driller', text: 'Driller'},
                {value: 'assistant-driller', text: 'Assistant Driller'},
                {value: 'derrickman', text: 'Derrickman'},
                {value: 'floorman', text: 'Floorman/Roughneck'},
                {value: 'mud-engineer', text: 'Mud Engineer'},
                {value: 'mud-logger', text: 'Mud Logger'},
                {value: 'directional-driller', text: 'Directional Driller'},
                {value: 'mwd-lwd-engineer', text: 'MWD/LWD Engineer'},
                {value: 'cementing-engineer', text: 'Cementing Engineer'},
                {value: 'drilling-supervisor', text: 'Drilling Supervisor'},
                {value: 'rig-manager', text: 'Rig Manager'},
                {value: 'drilling-foreman', text: 'Drilling Foreman'}
            ];
            break;
            
        case 'well-intervention':
            positions = [
                {value: 'well-intervention-supervisor', text: 'Well Intervention Supervisor'},
                {value: 'workover-supervisor', text: 'Workover Supervisor'},
                {value: 'coiled-tubing-operator', text: 'Coiled Tubing Operator'},
                {value: 'coiled-tubing-supervisor', text: 'Coiled Tubing Supervisor'},
                {value: 'wireline-operator', text: 'Wireline Operator'},
                {value: 'wireline-supervisor', text: 'Wireline Supervisor'},
                {value: 'snubbing-operator', text: 'Snubbing Unit Operator'},
                {value: 'snubbing-supervisor', text: 'Snubbing Unit Supervisor'},
                {value: 'well-intervention-specialist', text: 'Well Intervention Specialist'},
                {value: 'workover-specialist', text: 'Workover Specialist'},
                {value: 'pumping-specialist', text: 'Pumping Specialist'},
                {value: 'fishing-specialist', text: 'Fishing Specialist'},
                {value: 'well-testing-operator', text: 'Well Testing Operator'}
            ];
            break;
            
        case 'marine-support':
            positions = [
                {value: 'marine-supervisor', text: 'Marine Supervisor'},
                {value: 'barge-master', text: 'Barge Master'},
                {value: 'crane-operator', text: 'Crane Operator (Marine)'},
                {value: 'rigger', text: 'Rigger'},
                {value: 'banksman', text: 'Banksman'},
                {value: 'deck-foreman', text: 'Deck Foreman'},
                {value: 'able-seaman', text: 'Able Seaman'},
                {value: 'ordinary-seaman', text: 'Ordinary Seaman'},
                {value: 'marine-engineer', text: 'Marine Engineer'},
                {value: 'deck-crew', text: 'Deck Crew'},
                {value: 'anchor-handler', text: 'Anchor Handler'},
                {value: 'ballast-operator', text: 'Ballast Control Operator'},
                {value: 'dp-operator', text: 'Dynamic Positioning Operator'}
            ];
            break;
            
        case 'hsse':
            positions = [
                {value: 'hsse-supervisor', text: 'HSSE Supervisor'},
                {value: 'safety-officer', text: 'Safety Officer'},
                {value: 'hse-officer', text: 'HSE Officer'},
                {value: 'safety-inspector', text: 'Safety Inspector'},
                {value: 'fire-watcher', text: 'Fire Watcher'},
                {value: 'h2s-monitor', text: 'H2S Monitor'},
                {value: 'emergency-response', text: 'Emergency Response Team'},
                {value: 'medic', text: 'Medic/Paramedic'},
                {value: 'environmental-officer', text: 'Environmental Officer'}
            ];
            break;
            
        case 'maintenance':
            positions = [
                {value: 'maintenance-supervisor', text: 'Maintenance Supervisor'},
                {value: 'mechanical-technician', text: 'Mechanical Technician'},
                {value: 'electrical-technician', text: 'Electrical Technician'},
                {value: 'instrument-technician', text: 'Instrument Technician'},
                {value: 'welder', text: 'Welder'},
                {value: 'fitter', text: 'Fitter'},
                {value: 'machinist', text: 'Machinist'},
                {value: 'electronics-technician', text: 'Electronics Technician'},
                {value: 'hydraulic-technician', text: 'Hydraulic Technician'},
                {value: 'generator-operator', text: 'Generator Operator'},
                {value: 'compressor-operator', text: 'Compressor Operator'}
            ];
            break;
    }
    
    // Add options to select
    positions.forEach(position => {
        const option = document.createElement('option');
        option.value = position.value;
        option.textContent = position.text;
        positionSelect.appendChild(option);
    });
}

// Functions for form actions
function savePersonnelDraft() {
    // Save form data to localStorage for later completion
    const formData = collectFormData();
    localStorage.setItem('personnelDraft', JSON.stringify(formData));
    showNotification('Draft telah disimpan! Anda dapat melanjutkan pengisian form nanti.', 'info');
}

function previewApplication() {
    // Collect and validate form data
    const formData = collectFormData();
    
    // Check if essential fields are filled
    if (!formData.personnelName || !formData.personnelNIK || !formData.companyName) {
        showNotification('Mohon lengkapi minimal data dasar personnel sebelum preview.', 'error');
        return;
    }
    
    // In a real application, this would show a modal with the preview
    // For now, we'll just show an alert
    showNotification('Preview aplikasi telah disiapkan. Data pengajuan sudah lengkap dan siap untuk disubmit.', 'info');
}

function submitPersonnelApplication() {
    // Basic validation
    const requiredFields = [
        'personnelName', 'personnelNIK', 'personnelEmail', 'personnelPhone',
        'personnelBirthDate', 'personnelAddress', 'companyName', 'contractType',
        'joinCompanyDate', 'employmentStatus', 'department', 'personnelPosition',
        'totalExperience', 'currentPositionExperience', 'oilGasExperience'
    ];
    
    let isValid = true;
    let missingFields = [];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) {
            isValid = false;
            missingFields.push(fieldId);
        }
    });
    
    if (!isValid) {
        showNotification('Mohon lengkapi semua field yang wajib diisi!', 'error');
        return;
    }
    
    // File validation (check if required files are selected)
    const requiredFiles = ['cvFile', 'ktpFile', 'photoFile', 'medicalFile'];
    requiredFiles.forEach(fileId => {
        const fileInput = document.getElementById(fileId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            isValid = false;
            missingFields.push(fileId);
        }
    });
    
    if (!isValid) {
        showNotification('Mohon upload semua dokumen yang wajib!', 'error');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin mengajukan personnel ini untuk sertifikasi SBTC?')) {
        // In a real application, this would submit the form data to the server
        // For now, we'll just show a success message
        
        // Clear any drafts
        localStorage.removeItem('personnelDraft');
        
        // Show success notification
        showNotification('Pengajuan berhasil dikirim! Aplikasi akan direview oleh tim assessor.', 'info');
        
        // In a real app, we would then redirect to the status page or show a confirmation
        setTimeout(() => {
            window.app.changeView('status-pengajuan');
        }, 1000);
    }
}

// Helper function to collect all form data
function collectFormData() {
    const formData = {};
    
    // Get all input, select, and textarea elements
    const formElements = document.querySelectorAll('#contractor-form input, #contractor-form select, #contractor-form textarea');
    
    // Collect values from form elements
    formElements.forEach(element => {
        if (element.id) {
            if (element.type === 'file') {
                // For file inputs, just note if a file is selected
                formData[element.id] = element.files && element.files.length > 0 ? true : false;
            } else {
                formData[element.id] = element.value;
            }
        }
    });
    
    return formData;
}

// Function to load saved draft if available
function loadSavedDraft() {
    const savedDraft = localStorage.getItem('personnelDraft');
    if (savedDraft) {
        const formData = JSON.parse(savedDraft);
        
        // Populate form fields with saved data
        Object.keys(formData).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.type !== 'file') {
                field.value = formData[fieldId];
            }
        });
        
        // If department was selected, update position options
        if (formData.department) {
            updatePositionOptions();
            
            // Set the position if it was saved
            if (formData.personnelPosition) {
                const positionSelect = document.getElementById('personnelPosition');
                if (positionSelect) {
                    positionSelect.value = formData.personnelPosition;
                }
            }
        }
        
        showNotification('Draft pengajuan telah dimuat.', 'info');
    }
}// Function for reviewing before submission
function reviewBeforeSubmit() {
    // Collect form data
    const formData = collectFormData();
    
    // Check if essential fields are filled
    let missingRequiredFields = [];
    const requiredFields = [
        'personnelName', 'personnelNIK', 'personnelEmail', 'personnelPhone',
        'personnelBirthDate', 'personnelAddress', 'companyName', 'contractType',
        'joinCompanyDate', 'employmentStatus', 'department', 'personnelPosition',
        'totalExperience', 'currentPositionExperience', 'oilGasExperience'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) {
            missingRequiredFields.push(fieldId);
        }
    });
    
    // File validation (check if required files are selected)
    const requiredFiles = ['cvFile', 'ktpFile', 'photoFile', 'medicalFile'];
    requiredFiles.forEach(fileId => {
        const fileInput = document.getElementById(fileId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            missingRequiredFields.push(fileId);
        }
    });
    
    // Check if there are missing fields
    if (missingRequiredFields.length > 0) {
        // Create a notification summarizing missing fields
        showNotification('Beberapa field wajib belum dilengkapi. Silakan lengkapi data sebelum review.', 'error');
        
        // Highlight missing fields
        missingRequiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('field-error');
                
                // Add error message below the field
                const fieldParent = field.parentElement;
                let errorMsg = fieldParent.querySelector('.error-message');
                
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'Field ini wajib diisi';
                    fieldParent.appendChild(errorMsg);
                }
            }
        });
        
        // Scroll to the first error field
        const firstErrorField = document.getElementById(missingRequiredFields[0]);
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return;
    }
    
    // If all required fields are filled, create a summary modal
    showReviewModal(formData);
}

// Function to show review modal
function showReviewModal(formData) {
    // Create modal structure if it doesn't exist
    let reviewModal = document.getElementById('review-summary-modal');
    
    if (!reviewModal) {
        reviewModal = document.createElement('div');
        reviewModal.id = 'review-summary-modal';
        reviewModal.className = 'modal';
        
        reviewModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Review Pengajuan SBTC</h3>
                        <button class="close-modal" onclick="closeReviewModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="review-summary-content"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn" onclick="closeReviewModal()">Kembali ke Form</button>
                        <button class="submit-btn" onclick="submitPersonnelApplication()">Lanjutkan Pengajuan</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(reviewModal);
    }
    
    // Populate modal with form data summary
    const contentContainer = document.getElementById('review-summary-content');
    let summaryHTML = '';
    
    // Personal Information
    summaryHTML += `
        <div class="review-section">
            <h4>📋 Data Dasar Personnel</h4>
            <div class="review-item">
                <div class="review-label">Nama Lengkap:</div>
                <div class="review-value">${formData.personnelName || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">NIK:</div>
                <div class="review-value">${formData.personnelNIK || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Email:</div>
                <div class="review-value">${formData.personnelEmail || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">No. Telepon:</div>
                <div class="review-value">${formData.personnelPhone || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Tanggal Lahir:</div>
                <div class="review-value">${formData.personnelBirthDate || '-'}</div>
            </div>
        </div>
    `;
    
    // Company & Contract Information
    summaryHTML += `
        <div class="review-section">
            <h4>🏢 Data Perusahaan & Kontrak</h4>
            <div class="review-item">
                <div class="review-label">Perusahaan:</div>
                <div class="review-value">${getCompanyName(formData.companyName) || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Tipe Kontrak:</div>
                <div class="review-value">${getContractType(formData.contractType) || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Tanggal Bergabung:</div>
                <div class="review-value">${formData.joinCompanyDate || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Status Employment:</div>
                <div class="review-value">${getEmploymentStatus(formData.employmentStatus) || '-'}</div>
            </div>
        </div>
    `;
    
    // Position & Experience
    summaryHTML += `
        <div class="review-section">
            <h4>⚙️ Data Posisi & Pengalaman</h4>
            <div class="review-item">
                <div class="review-label">Departemen:</div>
                <div class="review-value">${getDepartmentName(formData.department) || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Posisi:</div>
                <div class="review-value">${getPositionName(formData.personnelPosition) || '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Total Pengalaman:</div>
                <div class="review-value">${formData.totalExperience ? formData.totalExperience + ' tahun' : '-'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Pengalaman di Oil & Gas:</div>
                <div class="review-value">${formData.oilGasExperience ? formData.oilGasExperience + ' tahun' : '-'}</div>
            </div>
        </div>
    `;
    
    // Document Summary
    summaryHTML += `
        <div class="review-section">
            <h4>📄 Dokumen yang Diupload</h4>
            <div class="document-summary">
                <div class="document-category">
                    <h5>📑 Dokumen Dasar & Identitas</h5>
                    <ul>
                        <li class="${formData.cvFile ? 'uploaded' : 'missing'}">CV/Resume Personnel ${formData.cvFile ? '✅' : '❌'}</li>
                        <li class="${formData.ktpFile ? 'uploaded' : 'missing'}">Copy KTP ${formData.ktpFile ? '✅' : '❌'}</li>
                        <li class="${formData.photoFile ? 'uploaded' : 'missing'}">Pas Photo 4x6 ${formData.photoFile ? '✅' : '❌'}</li>
                        <li class="${formData.medicalFile ? 'uploaded' : 'missing'}">Medical Certificate ${formData.medicalFile ? '✅' : '❌'}</li>
                    </ul>
                </div>
                
                <div class="document-category">
                    <h5>🦺 Dokumen HSSE & Safety</h5>
                    <ul>
                        <li class="${formData.basicSafetyFile ? 'uploaded' : 'optional'}">Basic Safety Training Certificate ${formData.basicSafetyFile ? '✅' : '⚠️ (Opsional)'}</li>
                        <li class="${formData.huetFile ? 'uploaded' : 'optional'}">HUET Certificate ${formData.huetFile ? '✅' : '⚠️ (Opsional)'}</li>
                        <li class="${formData.confinedSpaceFile ? 'uploaded' : 'optional'}">Confined Space Training ${formData.confinedSpaceFile ? '✅' : '⚠️ (Opsional)'}</li>
                        <li class="${formData.workHeightFile ? 'uploaded' : 'optional'}">Working at Height Certificate ${formData.workHeightFile ? '✅' : '⚠️ (Opsional)'}</li>
                    </ul>
                </div>
                
                <div class="document-category">
                    <h5>⚙️ Dokumen Kompetensi Teknis</h5>
                    <ul>
                        <li class="${formData.iwcfFile ? 'uploaded' : 'optional'}">IWCF Certificate ${formData.iwcfFile ? '✅' : '⚠️ (Opsional)'}</li>
                        <li class="${formData.technicalCompetencyFile ? 'uploaded' : 'optional'}">Drilling/Well Intervention Competency ${formData.technicalCompetencyFile ? '✅' : '⚠️ (Opsional)'}</li>
                    </ul>
                </div>
                
                <div class="document-category">
                    <h5>📋 Dokumen SIKA</h5>
                    <ul>
                        <li class="${formData.sikaFile ? 'uploaded' : 'optional'}">SIKA Certificate ${formData.sikaFile ? '✅' : '⚠️ (Opsional)'}</li>
                        <li class="${formData.migasSkillFile ? 'uploaded' : 'optional'}">Keahlian Khusus MIGAS ${formData.migasSkillFile ? '✅' : '⚠️ (Opsional)'}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Set content to modal
    contentContainer.innerHTML = summaryHTML;
    
    // Add styles for review modal
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .review-section {
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
        }
        
        .review-section h4 {
            color: #0066cc;
            margin-bottom: 10px;
        }
        
        .review-item {
            display: flex;
            margin-bottom: 8px;
        }
        
        .review-label {
            flex: 0 0 180px;
            font-weight: 500;
            color: #555;
        }
        
        .review-value {
            flex: 1;
        }
        
        .document-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .document-category h5 {
            margin-bottom: 10px;
            font-size: 14px;
            color: #333;
        }
        
        .document-category ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .document-category li {
            padding: 5px 0;
            font-size: 14px;
        }
        
        .document-category li.uploaded {
            color: #2e7d32;
        }
        
        .document-category li.missing {
            color: #c62828;
        }
        
        .document-category li.optional {
            color: #f57c00;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .field-error {
            border: 1px solid #f44336 !important;
            background-color: #ffebee !important;
        }
        
        .error-message {
            color: #f44336;
            font-size: 12px;
            margin-top: 5px;
        }
    `;
    
    document.head.appendChild(styleElement);
    
    // Show modal
    reviewModal.style.display = 'block';
}

// Function to close review modal
function closeReviewModal() {
    const reviewModal = document.getElementById('review-summary-modal');
    if (reviewModal) {
        reviewModal.style.display = 'none';
    }
}

// Helper functions for review modal
function getCompanyName(value) {
    const companySelect = document.getElementById('companyName');
    if (companySelect && value) {
        const selectedOption = companySelect.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : value;
    }
    return value;
}

function getContractType(value) {
    const contractSelect = document.getElementById('contractType');
    if (contractSelect && value) {
        const selectedOption = contractSelect.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : value;
    }
    return value;
}

function getEmploymentStatus(value) {
    const statusSelect = document.getElementById('employmentStatus');
    if (statusSelect && value) {
        const selectedOption = statusSelect.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : value;
    }
    return value;
}

function getDepartmentName(value) {
    const departmentSelect = document.getElementById('department');
    if (departmentSelect && value) {
        const selectedOption = departmentSelect.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : value;
    }
    return value;
}

function getPositionName(value) {
    const positionSelect = document.getElementById('personnelPosition');
    if (positionSelect && value) {
        const selectedOption = positionSelect.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : value;
    }
    return value;
}// Load data from localStorage into app state
function loadDataFromLocalStorage() {
    const savedAppState = localStorage.getItem('appState');
    if (savedAppState) {
        try {
            const parsedState = JSON.parse(savedAppState);
            // Merge with current app state
            if (parsedState.applications) appState.applications = parsedState.applications;
            if (parsedState.contractors) appState.contractors = parsedState.contractors;
            if (parsedState.workers) appState.workers = parsedState.workers;
            if (parsedState.certificates) appState.certificates = parsedState.certificates;
            if (parsedState.reviews) appState.reviews = parsedState.reviews;
            if (parsedState.interviews) appState.interviews = parsedState.interviews;
            
            console.log('Data loaded from localStorage:', parsedState);
        } catch (e) {
            console.error('Failed to parse app state from localStorage:', e);
        }
    }
}