// Profile and User Management System

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set profile header information
    document.getElementById('profileUsername').textContent = currentUser.fullName;
    document.getElementById('profileAvatar').textContent = currentUser.fullName.charAt(0);
    document.getElementById('profileAvatarLarge').textContent = currentUser.fullName.charAt(0);
    document.getElementById('profileFullName').textContent = currentUser.fullName;
    document.getElementById('profileRole').textContent = capitalizeFirstLetter(currentUser.role);
    
    // Apply role-based UI
    applyRoleBasedUI(currentUser.role);
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize all forms
    initPersonalInfoForm();
    initCompanyInfoForm();
    initSecurityForm();
    
    // Load history data
    loadHistoryData();
    
    // Load user management data if user has permission
    if (window.auth.hasPermission('manageUsers')) {
        loadUserManagementData();
        initUserModal();
    }
    
    // Load job requirements data if user has permission
    if (window.auth.hasPermission('edit')) {
        loadJobRequirementsData();
        initJobModal();
    }
});

// Initialize tab navigation
function initTabNavigation() {
    const menuLinks = document.querySelectorAll('.profile-menu a');
    const tabs = document.querySelectorAll('.profile-tab');
    
    menuLinks.forEach(link => {
        if (link.classList.contains('menu-logout')) return;
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and tabs
            menuLinks.forEach(l => l.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding tab
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Apply role-based UI changes
function applyRoleBasedUI(role) {
    // Hide menu items based on role
    document.querySelectorAll('[data-requires-role]').forEach(element => {
        const requiredRoles = element.getAttribute('data-requires-role').split(',');
        if (!requiredRoles.includes(role)) {
            element.style.display = 'none';
        }
    });
    
    // Hide menu items based on permission
    document.querySelectorAll('[data-requires-permission]').forEach(element => {
        const requiredPermission = element.getAttribute('data-requires-permission');
        if (!window.auth.hasPermission(requiredPermission)) {
            element.style.display = 'none';
        }
    });
}

// Initialize personal info form
function initPersonalInfoForm() {
    const form = document.getElementById('personalInfoForm');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (form && currentUser) {
        // Populate form fields
        document.getElementById('fullName').value = currentUser.fullName || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('username').value = currentUser.username || '';
        document.getElementById('userType').value = capitalizeFirstLetter(currentUser.role) || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('lastLogin').value = currentUser.lastLogin ? formatDateTime(currentUser.lastLogin) : 'Tidak ada data';
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            // Validate form
            if (!fullName || !email) {
                alert('Semua field wajib diisi harus diisi.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Format email tidak valid.');
                return;
            }
            
            // Update user data
            updateUserProfile({
                fullName,
                email,
                phone
            });
            
            // Show success message
            alert('Profil berhasil diperbarui.');
        });
    }
}

// Initialize company info form
function initCompanyInfoForm() {
    const form = document.getElementById('companyInfoForm');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (form && currentUser && currentUser.role === 'contractor') {
        // Populate form fields
        if (currentUser.companyDetails) {
            document.getElementById('companyName').value = currentUser.companyDetails.name || '';
            document.getElementById('companyAddress').value = currentUser.companyDetails.address || '';
            document.getElementById('contactPerson').value = currentUser.companyDetails.contact || '';
            document.getElementById('companyPhone').value = currentUser.companyDetails.phone || '';
            document.getElementById('taxId').value = currentUser.companyDetails.taxId || '';
            document.getElementById('businessLicense').value = currentUser.companyDetails.license || '';
            
            // Set selected business type
            const businessTypeSelect = document.getElementById('businessType');
            if (businessTypeSelect) {
                populateBusinessTypes(businessTypeSelect, currentUser.companyDetails.business);
            }
        }
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const companyName = document.getElementById('companyName').value;
            const businessType = document.getElementById('businessType').value;
            const companyAddress = document.getElementById('companyAddress').value;
            const contactPerson = document.getElementById('contactPerson').value;
            const companyPhone = document.getElementById('companyPhone').value;
            const taxId = document.getElementById('taxId').value;
            const businessLicense = document.getElementById('businessLicense').value;
            
            // Validate form
            if (!companyName || !businessType || !companyAddress || !contactPerson || !companyPhone) {
                alert('Semua field wajib diisi harus diisi.');
                return;
            }
            
            // Update company data
            const companyDetails = {
                name: companyName,
                business: businessType,
                address: companyAddress,
                contact: contactPerson,
                phone: companyPhone,
                taxId,
                license: businessLicense
            };
            
            updateUserProfile({ companyDetails });
            
            // Show success message
            alert('Informasi perusahaan berhasil diperbarui.');
        });
    }
}

// Initialize security form
function initSecurityForm() {
    const form = document.getElementById('securityForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate form
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Semua field harus diisi.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('Password baru dan konfirmasi password tidak cocok.');
                return;
            }
            
            // Validate password strength
            if (!validatePasswordStrength(newPassword)) {
                alert('Password harus memenuhi semua persyaratan keamanan.');
                return;
            }
            
            // Verify current password
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!verifyCurrentPassword(currentUser.username, currentPassword)) {
                alert('Password lama tidak valid.');
                return;
            }
            
            // Update password
            if (updateUserPassword(currentUser.username, newPassword)) {
                // Clear form
                form.reset();
                
                // Show success message
                alert('Password berhasil diubah.');
            } else {
                alert('Gagal mengubah password. Silakan coba lagi.');
            }
        });
    }
}

// Load history data
function loadHistoryData() {
    const activityFilter = document.getElementById('activityFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearHistoryFilter = document.getElementById('clearHistoryFilter');
    const historyTableBody = document.getElementById('historyTableBody');
    const paginationInfo = document.querySelector('#historyPagination span');
    const paginationControls = document.querySelector('#historyPagination .pagination-controls');
    
    if (activityFilter && dateFilter && clearHistoryFilter && historyTableBody) {
        // Load initial data
        displayHistoryData();
        
        // Add filter event listeners
        activityFilter.addEventListener('change', function() {
            displayHistoryData(1, this.value, dateFilter.value);
        });
        
        dateFilter.addEventListener('change', function() {
            displayHistoryData(1, activityFilter.value, this.value);
        });
        
        clearHistoryFilter.addEventListener('click', function() {
            activityFilter.value = 'all';
            dateFilter.value = '';
            displayHistoryData();
        });
        
        // Add pagination event listeners
        if (paginationControls) {
            paginationControls.addEventListener('click', function(e) {
                if (e.target.classList.contains('pagination-btn')) {
                    e.preventDefault();
                    
                    // Get current page
                    let currentPage = 1;
                    const activeBtn = paginationControls.querySelector('.pagination-btn.active');
                    if (activeBtn && !isNaN(parseInt(activeBtn.textContent))) {
                        currentPage = parseInt(activeBtn.textContent);
                    }
                    
                    // Calculate new page
                    let newPage = currentPage;
                    if (e.target.textContent === 'Sebelumnya') {
                        newPage = Math.max(1, currentPage - 1);
                    } else if (e.target.textContent === 'Selanjutnya') {
                        newPage = currentPage + 1;
                    } else {
                        newPage = parseInt(e.target.textContent);
                    }
                    
                    // Display data for new page
                    displayHistoryData(newPage, activityFilter.value, dateFilter.value);
                }
            });
        }
    }
}

// Display history data with filtering and pagination
function displayHistoryData(page = 1, actionFilter = 'all', dateFilter = '') {
    const historyTableBody = document.getElementById('historyTableBody');
    const paginationInfo = document.querySelector('#historyPagination span');
    const paginationControls = document.querySelector('#historyPagination .pagination-controls');
    
    if (historyTableBody) {
        // Get all audit logs
        let auditLogs = JSON.parse(localStorage.getItem('auditLog') || '[]');
        
        // Sort by timestamp (newest first)
        auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Filter by action
        if (actionFilter && actionFilter !== 'all') {
            auditLogs = auditLogs.filter(log => log.action === actionFilter);
        }
        
        // Filter by date
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            filterDate.setHours(0, 0, 0, 0);
            const filterDateEnd = new Date(filterDate);
            filterDateEnd.setHours(23, 59, 59, 999);
            
            auditLogs = auditLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= filterDate && logDate <= filterDateEnd;
            });
        }
        
        // Pagination
        const itemsPerPage = 10;
        const totalPages = Math.ceil(auditLogs.length / itemsPerPage);
        const validPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
        const startIndex = (validPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedLogs = auditLogs.slice(startIndex, endIndex);
        
        // Update pagination info
        if (paginationInfo) {
            paginationInfo.textContent = `Menampilkan ${startIndex + 1}-${Math.min(endIndex, auditLogs.length)} dari ${auditLogs.length} aktivitas`;
        }
        
        // Update pagination controls
        if (paginationControls) {
            let paginationHTML = `<a href="#" class="pagination-btn">Sebelumnya</a>`;
            
            // Generate page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === validPage) {
                    paginationHTML += `<a href="#" class="pagination-btn active">${i}</a>`;
                } else if (i <= 3 || i > totalPages - 3 || (i >= validPage - 1 && i <= validPage + 1)) {
                    paginationHTML += `<a href="#" class="pagination-btn">${i}</a>`;
                } else if (i === 4 || i === totalPages - 3) {
                    paginationHTML += `<span class="pagination-ellipsis">...</span>`;
                }
            }
            
            paginationHTML += `<a href="#" class="pagination-btn">Selanjutnya</a>`;
            paginationControls.innerHTML = paginationHTML;
        }
        
        // Clear table
        historyTableBody.innerHTML = '';
        
        // Populate table
        paginatedLogs.forEach(log => {
            const row = document.createElement('tr');
            
            // Format timestamp
            const formattedTimestamp = formatDateTime(log.timestamp);
            
            // Format action
            let formattedAction = log.action;
            if (log.action === 'login') formattedAction = 'Login';
            else if (log.action === 'logout') formattedAction = 'Logout';
            else if (log.action === 'add') formattedAction = 'Tambah Data';
            else if (log.action === 'edit') formattedAction = 'Edit Data';
            else if (log.action === 'delete') formattedAction = 'Hapus Data';
            else if (log.action === 'register') formattedAction = 'Registrasi';
            else if (log.action === 'approve') formattedAction = 'Approval';
            
            row.innerHTML = `
                <td>${formattedTimestamp}</td>
                <td>${formattedAction}</td>
                <td>${log.description}</td>
                <td><small>${log.userAgent}</small></td>
                <td>${log.ipAddress}</td>
            `;
            
            historyTableBody.appendChild(row);
        });
        
        // Show message if no data
        if (paginatedLogs.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">Tidak ada data aktivitas.</td>`;
            historyTableBody.appendChild(row);
        }
    }
}

// Load user management data
function loadUserManagementData() {
    const userSearchInput = document.getElementById('userSearchInput');
    const userRoleFilter = document.getElementById('userRoleFilter');
    const userStatusFilter = document.getElementById('userStatusFilter');
    const usersTableBody = document.getElementById('usersTableBody');
    const paginationInfo = document.querySelector('#usersPagination span');
    const paginationControls = document.querySelector('#usersPagination .pagination-controls');
    const addUserBtn = document.getElementById('addUserBtn');
    
    if (usersTableBody) {
        // Load initial data
        displayUserData();
        
        // Add search and filter event listeners
        if (userSearchInput) {
            userSearchInput.addEventListener('input', function() {
                displayUserData(1, this.value, userRoleFilter.value, userStatusFilter.value);
            });
        }
        
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', function() {
                displayUserData(1, userSearchInput.value, this.value, userStatusFilter.value);
            });
        }
        
        if (userStatusFilter) {
            userStatusFilter.addEventListener('change', function() {
                displayUserData(1, userSearchInput.value, userRoleFilter.value, this.value);
            });
        }
        
        // Add pagination event listeners
        if (paginationControls) {
            paginationControls.addEventListener('click', function(e) {
                if (e.target.classList.contains('pagination-btn')) {
                    e.preventDefault();
                    
                    // Get current page
                    let currentPage = 1;
                    const activeBtn = paginationControls.querySelector('.pagination-btn.active');
                    if (activeBtn && !isNaN(parseInt(activeBtn.textContent))) {
                        currentPage = parseInt(activeBtn.textContent);
                    }
                    
                    // Calculate new page
                    let newPage = currentPage;
                    if (e.target.textContent === 'Sebelumnya') {
                        newPage = Math.max(1, currentPage - 1);
                    } else if (e.target.textContent === 'Selanjutnya') {
                        newPage = currentPage + 1;
                    } else {
                        newPage = parseInt(e.target.textContent);
                    }
                    
                    // Display data for new page
                    displayUserData(newPage, userSearchInput.value, userRoleFilter.value, userStatusFilter.value);
                }
            });
        }
        
        // Add user button
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                openUserModal();
            });
        }
    }
}

// Display user data with filtering and pagination
function displayUserData(page = 1, searchTerm = '', roleFilter = 'all', statusFilter = 'all') {
    const usersTableBody = document.getElementById('usersTableBody');
    const paginationInfo = document.querySelector('#usersPagination span');
    const paginationControls = document.querySelector('#usersPagination .pagination-controls');
    
    if (usersTableBody) {
        // Get all users
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            users = users.filter(user => 
                user.fullName?.toLowerCase().includes(term) || 
                user.username?.toLowerCase().includes(term) || 
                user.email?.toLowerCase().includes(term)
            );
        }
        
        // Filter by role
        if (roleFilter && roleFilter !== 'all') {
            users = users.filter(user => user.role === roleFilter);
        }
        
        // Filter by status
        if (statusFilter && statusFilter !== 'all') {
            users = users.filter(user => user.status === statusFilter);
        }
        
        // Pagination
        const itemsPerPage = 10;
        const totalPages = Math.ceil(users.length / itemsPerPage);
        const validPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
        const startIndex = (validPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        // Update pagination info
        if (paginationInfo) {
            paginationInfo.textContent = `Menampilkan ${startIndex + 1}-${Math.min(endIndex, users.length)} dari ${users.length} pengguna`;
        }
        
        // Update pagination controls
        if (paginationControls) {
            let paginationHTML = `<a href="#" class="pagination-btn">Sebelumnya</a>`;
            
            // Generate page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === validPage) {
                    paginationHTML += `<a href="#" class="pagination-btn active">${i}</a>`;
                } else if (i <= 3 || i > totalPages - 3 || (i >= validPage - 1 && i <= validPage + 1)) {
                    paginationHTML += `<a href="#" class="pagination-btn">${i}</a>`;
                } else if (i === 4 || i === totalPages - 3) {
                    paginationHTML += `<span class="pagination-ellipsis">...</span>`;
                }
            }
            
            paginationHTML += `<a href="#" class="pagination-btn">Selanjutnya</a>`;
            paginationControls.innerHTML = paginationHTML;
        }
        
        // Clear table
        usersTableBody.innerHTML = '';
        
        // Populate table
        paginatedUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Format role
            const formattedRole = capitalizeFirstLetter(user.role);
            
            // Format status
            let statusClass = '';
            if (user.status === 'active') statusClass = 'status approved';
            else if (user.status === 'pending') statusClass = 'status waiting';
            else if (user.status === 'suspended') statusClass = 'status rejected';
            else if (user.status === 'inactive') statusClass = 'status certificate';
            
            const formattedStatus = capitalizeFirstLetter(user.status);
            
            // Format last login
            const formattedLastLogin = user.lastLogin ? formatDateTime(user.lastLogin) : 'Belum pernah login';
            
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${formattedRole}</td>
                <td><span class="${statusClass}">${formattedStatus}</span></td>
                <td>${formattedLastLogin}</td>
                <td>
                    <button class="btn-icon edit-user" data-id="${user.id}">
                        <i class="icon-edit">✏️</i>
                    </button>
                    <button class="btn-icon delete-user" data-id="${user.id}" ${user.role === 'superadmin' ? 'disabled' : ''}>
                        <i class="icon-delete">🗑️</i>
                    </button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Show message if no data
        if (paginatedUsers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" class="text-center">Tidak ada data pengguna.</td>`;
            usersTableBody.appendChild(row);
        }
        
        // Add event listeners to action buttons
        usersTableBody.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                openUserModal(userId);
            });
        });
        
        usersTableBody.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                    deleteUser(userId);
                    displayUserData(validPage, searchTerm, roleFilter, statusFilter);
                }
            });
        });
    }
}

// Initialize user modal
function initUserModal() {
    const userModal = document.getElementById('userModal');
    const closeUserModal = document.getElementById('closeUserModal');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const userForm = document.getElementById('userForm');
    
    if (userModal && closeUserModal && cancelUserBtn && userForm) {
        // Close modal when clicking close button
        closeUserModal.addEventListener('click', function() {
            userModal.style.display = 'none';
        });
        
        // Close modal when clicking cancel button
        cancelUserBtn.addEventListener('click', function() {
            userModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        userModal.querySelector('.modal-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
                userModal.style.display = 'none';
            }
        });
        
        // Form submission
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const userId = document.getElementById('userId').value;
            const fullName = document.getElementById('userFullName').value;
            const email = document.getElementById('userEmail').value;
            const username = document.getElementById('userUsername').value;
            const role = document.getElementById('userRole').value;
            const password = document.getElementById('userPassword').value;
            const status = document.getElementById('userStatus').value;
            
            // Validate form
            if (!fullName || !email || !username || !role || !status) {
                alert('Semua field wajib harus diisi.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Format email tidak valid.');
                return;
            }
            
            // Create user object
            const userData = {
                fullName,
                email,
                username,
                role,
                status
            };
            
            // Add password if provided (for new users or password changes)
            if (password) {
                if (!validatePasswordStrength(password)) {
                    alert('Password harus memenuhi semua persyaratan keamanan.');
                    return;
                }
                userData.password = password;
            }
            
            // Save user
            if (userId) {
                // Update existing user
                if (updateUser(userId, userData)) {
                    userModal.style.display = 'none';
                    displayUserData();
                    alert('Pengguna berhasil diperbarui.');
                } else {
                    alert('Gagal memperbarui pengguna.');
                }
            } else {
                // Add new user
                if (!password) {
                    alert('Password harus diisi untuk pengguna baru.');
                    return;
                }
                
                if (addUser(userData)) {
                    userModal.style.display = 'none';
                    displayUserData();
                    alert('Pengguna berhasil ditambahkan.');
                } else {
                    alert('Gagal menambahkan pengguna.');
                }
            }
        });
    }
}

// Open user modal (for adding or editing users)
function openUserModal(userId = null) {
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const userModalTitle = document.getElementById('userModalTitle');
    
    if (userModal && userForm && userModalTitle) {
        // Reset form
        userForm.reset();
        document.getElementById('userId').value = '';
        
        if (userId) {
            // Edit existing user
            userModalTitle.textContent = 'Edit Pengguna';
            
            // Get user data
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.id.toString() === userId.toString());
            
            if (user) {
                // Populate form
                document.getElementById('userId').value = user.id;
                document.getElementById('userFullName').value = user.fullName || '';
                document.getElementById('userEmail').value = user.email || '';
                document.getElementById('userUsername').value = user.username || '';
                document.getElementById('userRole').value = user.role || '';
                document.getElementById('userStatus').value = user.status || 'active';
                
                // Clear password field (leave empty for no change)
                document.getElementById('userPassword').value = '';
            }
        } else {
            // Add new user
            userModalTitle.textContent = 'Tambah Pengguna';
        }
        
        // Show modal
        userModal.style.display = 'block';
    }
}

// Load job requirements data
function loadJobRequirementsData() {
    const jobRequirementsTableBody = document.getElementById('jobRequirementsTableBody');
    const addJobBtn = document.getElementById('addJobBtn');
    
    if (jobRequirementsTableBody) {
        // Load initial data
        displayJobRequirementsData();
        
        // Add job button
        if (addJobBtn) {
            addJobBtn.addEventListener('click', function() {
                openJobModal();
            });
        }
    }
}

// Display job requirements data
function displayJobRequirementsData() {
    const jobRequirementsTableBody = document.getElementById('jobRequirementsTableBody');
    
    if (jobRequirementsTableBody) {
        // Get all job requirements
        const requirements = JSON.parse(localStorage.getItem('jobRequirements') || '[]');
        
        // Clear table
        jobRequirementsTableBody.innerHTML = '';
        
        // Populate table
        requirements.forEach(job => {
            const row = document.createElement('tr');
            
            // Format certifications
            const certifications = job.requiredCertifications.join(', ');
            
            // Format health requirements
            const healthRequirements = job.healthRequirements.join(', ');
            
            row.innerHTML = `
                <td>${job.position}</td>
                <td>${job.minExperience} tahun</td>
                <td>${certifications}</td>
                <td>${healthRequirements}</td>
                <td>
                    <button class="btn-icon edit-job" data-position="${job.position}">
                        <i class="icon-edit">✏️</i>
                    </button>
                    <button class="btn-icon delete-job" data-position="${job.position}">
                        <i class="icon-delete">🗑️</i>
                    </button>
                </td>
            `;
            
            jobRequirementsTableBody.appendChild(row);
        });
        
        // Show message if no data
        if (requirements.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">Tidak ada data persyaratan pekerjaan.</td>`;
            jobRequirementsTableBody.appendChild(row);
        }
        
        // Add event listeners to action buttons
        jobRequirementsTableBody.querySelectorAll('.edit-job').forEach(btn => {
            btn.addEventListener('click', function() {
                const position = this.getAttribute('data-position');
                openJobModal(position);
            });
        });
        
        jobRequirementsTableBody.querySelectorAll('.delete-job').forEach(btn => {
            btn.addEventListener('click', function() {
                const position = this.getAttribute('data-position');
                if (confirm(`Apakah Anda yakin ingin menghapus persyaratan untuk posisi ${position}?`)) {
                    deleteJobRequirement(position);
                    displayJobRequirementsData();
                }
            });
        });
    }
}

// Initialize job modal
function initJobModal() {
    const jobModal = document.getElementById('jobModal');
    const closeJobModal = document.getElementById('closeJobModal');
    const cancelJobBtn = document.getElementById('cancelJobBtn');
    const jobForm = document.getElementById('jobForm');
    const addCertBtn = document.getElementById('addCertBtn');
    const addHealthBtn = document.getElementById('addHealthBtn');
    
    if (jobModal && closeJobModal && cancelJobBtn && jobForm && addCertBtn && addHealthBtn) {
        // Close modal when clicking close button
        closeJobModal.addEventListener('click', function() {
            jobModal.style.display = 'none';
        });
        
        // Close modal when clicking cancel button
        cancelJobBtn.addEventListener('click', function() {
            jobModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        jobModal.querySelector('.modal-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
                jobModal.style.display = 'none';
            }
        });
        
        // Add certification button
        addCertBtn.addEventListener('click', function() {
            addCertificationField();
        });
        
        // Add health requirement button
        addHealthBtn.addEventListener('click', function() {
            addHealthRequirementField();
        });
        
        // Initialize remove buttons
        initRemoveButtons();
        
        // Form submission
        jobForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const position = document.getElementById('jobPosition').value;
            const minExperience = document.getElementById('jobMinExperience').value;
            const additionalRequirements = document.getElementById('additionalRequirements').value;
            
            // Get certifications
            const certInputs = document.querySelectorAll('.certification-input');
            const certifications = Array.from(certInputs).map(input => input.value.trim()).filter(cert => cert);
            
            // Get health requirements
            const healthInputs = document.querySelectorAll('.health-input');
            const healthRequirements = Array.from(healthInputs).map(input => input.value.trim()).filter(req => req);
            
            // Validate form
            if (!position || !minExperience) {
                alert('Nama posisi dan pengalaman minimal harus diisi.');
                return;
            }
            
            if (certifications.length === 0) {
                alert('Minimal satu sertifikasi wajib harus diisi.');
                return;
            }
            
            // Create job requirement object
            const jobData = {
                position,
                minExperience: parseInt(minExperience),
                requiredCertifications: certifications,
                additionalRequirements: additionalRequirements.split('\n').filter(req => req.trim()),
                healthRequirements
            };
            
            // Save job requirement
            if (saveJobRequirement(jobData)) {
                jobModal.style.display = 'none';
                displayJobRequirementsData();
                alert(`Persyaratan untuk posisi ${position} berhasil disimpan.`);
            } else {
                alert('Gagal menyimpan persyaratan pekerjaan.');
            }
        });
    }
}

// Initialize remove buttons for dynamic fields
function initRemoveButtons() {
    // Certification remove buttons
    document.querySelectorAll('.btn-remove-cert').forEach(btn => {
        btn.addEventListener('click', function() {
            const certItems = document.querySelectorAll('.certification-item');
            if (certItems.length > 1) {
                this.closest('.certification-item').remove();
            } else {
                alert('Minimal satu sertifikasi harus ada.');
            }
        });
    });
    
    // Health requirement remove buttons
    document.querySelectorAll('.btn-remove-health').forEach(btn => {
        btn.addEventListener('click', function() {
            const healthItems = document.querySelectorAll('.health-item');
            if (healthItems.length > 1) {
                this.closest('.health-item').remove();
            } else {
                alert('Minimal satu persyaratan kesehatan harus ada.');
            }
        });
    });
}

// Add certification field
function addCertificationField() {
    const container = document.getElementById('certificationContainer');
    if (container) {
        const div = document.createElement('div');
        div.className = 'certification-item';
        div.innerHTML = `
            <input type="text" class="certification-input" placeholder="Nama sertifikasi">
            <button type="button" class="btn-remove-cert">×</button>
        `;
        container.appendChild(div);
        
        // Add event listener to the new remove button
        div.querySelector('.btn-remove-cert').addEventListener('click', function() {
            const certItems = document.querySelectorAll('.certification-item');
            if (certItems.length > 1) {
                div.remove();
            } else {
                alert('Minimal satu sertifikasi harus ada.');
            }
        });
    }
}

// Add health requirement field
function addHealthRequirementField() {
    const container = document.getElementById('healthContainer');
    if (container) {
        const div = document.createElement('div');
        div.className = 'health-item';
        div.innerHTML = `
            <input type="text" class="health-input" placeholder="Persyaratan kesehatan">
            <button type="button" class="btn-remove-health">×</button>
        `;
        container.appendChild(div);
        
        // Add event listener to the new remove button
        div.querySelector('.btn-remove-health').addEventListener('click', function() {
            const healthItems = document.querySelectorAll('.health-item');
            if (healthItems.length > 1) {
                div.remove();
            } else {
                alert('Minimal satu persyaratan kesehatan harus ada.');
            }
        });
    }
}

// Open job modal (for adding or editing job requirements)
function openJobModal(position = null) {
    const jobModal = document.getElementById('jobModal');
    const jobForm = document.getElementById('jobForm');
    const jobModalTitle = document.getElementById('jobModalTitle');
    const certificationContainer = document.getElementById('certificationContainer');
    const healthContainer = document.getElementById('healthContainer');
    
    if (jobModal && jobForm && jobModalTitle && certificationContainer && healthContainer) {
        // Reset form
        jobForm.reset();
        
        // Clear certification and health containers
        certificationContainer.innerHTML = '';
        healthContainer.innerHTML = '';
        
        if (position) {
            // Edit existing job requirement
            jobModalTitle.textContent = 'Edit Persyaratan Pekerjaan';
            
            // Get job requirement data
            const requirements = JSON.parse(localStorage.getItem('jobRequirements') || '[]');
            const job = requirements.find(j => j.position === position);
            
            if (job) {
                // Populate form
                document.getElementById('jobPosition').value = job.position;
                document.getElementById('jobMinExperience').value = job.minExperience;
                document.getElementById('additionalRequirements').value = job.additionalRequirements.join('\n');
                
                // Add certification fields
                job.requiredCertifications.forEach(cert => {
                    const div = document.createElement('div');
                    div.className = 'certification-item';
                    div.innerHTML = `
                        <input type="text" class="certification-input" placeholder="Nama sertifikasi" value="${cert}">
                        <button type="button" class="btn-remove-cert">×</button>
                    `;
                    certificationContainer.appendChild(div);
                });
                
                // Add health requirement fields
                job.healthRequirements.forEach(health => {
                    const div = document.createElement('div');
                    div.className = 'health-item';
                    div.innerHTML = `
                        <input type="text" class="health-input" placeholder="Persyaratan kesehatan" value="${health}">
                        <button type="button" class="btn-remove-health">×</button>
                    `;
                    healthContainer.appendChild(div);
                });
            }
        } else {
            // Add new job requirement
            jobModalTitle.textContent = 'Tambah Persyaratan Pekerjaan';
            
            // Add empty certification field
            const certDiv = document.createElement('div');
            certDiv.className = 'certification-item';
            certDiv.innerHTML = `
                <input type="text" class="certification-input" placeholder="Nama sertifikasi">
                <button type="button" class="btn-remove-cert">×</button>
            `;
            certificationContainer.appendChild(certDiv);
            
            // Add empty health requirement field
            const healthDiv = document.createElement('div');
            healthDiv.className = 'health-item';
            healthDiv.innerHTML = `
                <input type="text" class="health-input" placeholder="Persyaratan kesehatan">
                <button type="button" class="btn-remove-health">×</button>
            `;
            healthContainer.appendChild(healthDiv);
        }
        
        // Initialize remove buttons
        initRemoveButtons();
        
        // Show modal
        jobModal.style.display = 'block';
    }
}

// Update user profile
function updateUserProfile(userData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    
    // Get all users
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find and update the user
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return false;
    
    // Update user data
    users[userIndex] = { ...users[userIndex], ...userData };
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        ...userData
    }));
    
    // Log the action
    window.auth.logAction('edit', currentUser.id, 'User profile updated');
    
    return true;
}

// Verify current password
function verifyCurrentPassword(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username);
    
    return user && user.password === password;
}

// Update user password
function updateUserPassword(username, newPassword) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) return false;
    
    // Update password
    users[userIndex].password = newPassword;
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log the action
    window.auth.logAction('edit', users[userIndex].id, 'Password changed');
    
    return true;
}

// Add new user
function addUser(userData) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username or email already exists
    if (users.some(user => user.username === userData.username)) {
        alert('Username sudah digunakan.');
        return false;
    }
    
    if (users.some(user => user.email === userData.email)) {
        alert('Email sudah terdaftar.');
        return false;
    }
    
    // Generate new ID
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    // Create new user
    const newUser = {
        id: newId,
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        lastLogin: null,
        createdAt: new Date().toISOString()
    };
    
    // Add company details if contractor
    if (userData.role === 'contractor') {
        newUser.companyDetails = {
            name: userData.fullName,
            business: '',
            address: '',
            contact: '',
            phone: ''
        };
    }
    
    // Add user to array and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log the action
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    window.auth.logAction('add', currentUser.id, `User ${userData.username} added as ${userData.role}`);
    
    return true;
}

// Update existing user
function updateUser(userId, userData) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id.toString() === userId.toString());
    
    if (userIndex === -1) return false;
    
    // Check if username or email already exists (excluding the current user)
    const usernameExists = users.some(user => 
        user.id.toString() !== userId.toString() && user.username === userData.username
    );
    
    if (usernameExists) {
        alert('Username sudah digunakan.');
        return false;
    }
    
    const emailExists = users.some(user => 
        user.id.toString() !== userId.toString() && user.email === userData.email
    );
    
    if (emailExists) {
        alert('Email sudah terdaftar.');
        return false;
    }
    
    // Update user data
    users[userIndex] = {
        ...users[userIndex],
        fullName: userData.fullName,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        status: userData.status
    };
    
    // Update password if provided
    if (userData.password) {
        users[userIndex].password = userData.password;
    }
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user if this is the logged in user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id.toString() === userId.toString()) {
        const { password, ...userWithoutPassword } = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    }
    
    // Log the action
    window.auth.logAction('edit', currentUser.id, `User ${userData.username} updated`);
    
    return true;
}

// Delete user
function deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Don't allow deleting superadmin
    const user = users.find(u => u.id.toString() === userId.toString());
    if (user && user.role === 'superadmin') {
        alert('Tidak dapat menghapus Super Admin.');
        return false;
    }
    
    // Remove user
    const updatedUsers = users.filter(u => u.id.toString() !== userId.toString());
    
    if (updatedUsers.length === users.length) {
        return false; // User not found
    }
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Log the action
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    window.auth.logAction('delete', currentUser.id, `User ${user.username} deleted`);
    
    return true;
}

// Save job requirement
function saveJobRequirement(jobData) {
    let requirements = JSON.parse(localStorage.getItem('jobRequirements') || '[]');
    
    // Check if position already exists
    const index = requirements.findIndex(job => job.position === jobData.position);
    
    if (index !== -1) {
        // Update existing requirement
        requirements[index] = jobData;
    } else {
        // Add new requirement
        requirements.push(jobData);
    }
    
    // Save back to localStorage
    localStorage.setItem('jobRequirements', JSON.stringify(requirements));
    
    // Log the action
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    window.auth.logAction('edit', currentUser.id, `Job requirements for ${jobData.position} updated`);
    
    return true;
}

// Delete job requirement
function deleteJobRequirement(position) {
    let requirements = JSON.parse(localStorage.getItem('jobRequirements') || '[]');
    
    // Remove requirement
    const updatedRequirements = requirements.filter(job => job.position !== position);
    
    if (updatedRequirements.length === requirements.length) {
        return false; // Requirement not found
    }
    
    // Save back to localStorage
    localStorage.setItem('jobRequirements', JSON.stringify(updatedRequirements));
    
    // Log the action
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    window.auth.logAction('delete', currentUser.id, `Job requirements for ${position} deleted`);
    
    return true;
}

// Populate business types dropdown
function populateBusinessTypes(selectElement, selectedValue = '') {
    const businessTypes = [
        'Konstruksi',
        'Elektrikal', 
        'Mekanikal',
        'Offshore',
        'Instrumentasi',
        'Marine',
        'Piping',
        'Civil',
        'HSE',
        'Quality Control'
    ];
    
    // Clear existing options except the first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add options
    businessTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        selectElement.appendChild(option);
    });
    
    // Set selected value if provided
    if (selectedValue) {
        selectElement.value = selectedValue;
    }
}

// Validate password strength
function validatePasswordStrength(password) {
    // Check length
    if (password.length < 8) return false;
    
    // Check for uppercase and lowercase
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return false;
    
    // Check for numbers
    if (!/[0-9]/.test(password)) return false;
    
    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    
    return true;
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}