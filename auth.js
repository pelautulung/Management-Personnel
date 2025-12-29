// Authentication and User Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication system
    initAuth();
    
    // Handle tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                // Add animation
                targetTab.style.animation = 'fadeIn 0.3s ease';
                setTimeout(() => {
                    targetTab.style.animation = '';
                }, 300);
            }
        });
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const loadingElement = document.querySelector('.login-loading');
            if (loadingElement) {
                document.getElementById('loginForm').style.display = 'none';
                const quickLogin = document.querySelector('.quick-login');
                if (quickLogin) quickLogin.style.display = 'none';
                loadingElement.style.display = 'block';
            }
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            // Add a slight delay for better UX
            setTimeout(() => {
                enhancedLogin(username, password, rememberMe);
            }, 800);
        });
    }
    
    // Registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading effect
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Mendaftar...';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
            }
            
            const fullName = document.getElementById('registerFullName').value;
            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const userType = document.getElementById('registerUserType').value;
            const termsAgreed = document.getElementById('termsAgree').checked;
            
            // Slight delay for better UX
            setTimeout(() => {
                register(fullName, email, username, password, confirmPassword, userType, termsAgreed);
                
                // Reset button state
                if (submitBtn) {
                    submitBtn.textContent = 'Daftar';
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
            }, 800);
        });
    }
    
    // Guest login button
    const guestLink = document.querySelector('.btn-guest');
    if (guestLink) {
        guestLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show loading
            const loadingElement = document.querySelector('.login-loading');
            if (loadingElement) {
                document.getElementById('loginForm').style.display = 'none';
                const quickLogin = document.querySelector('.quick-login');
                if (quickLogin) quickLogin.style.display = 'none';
                loadingElement.style.display = 'block';
            }
            
            // Slight delay for better UX
            setTimeout(() => {
                // Show success message
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                    const successElement = document.querySelector('.login-success');
                    if (successElement) {
                        successElement.style.display = 'block';
                    }
                }
                
                // Proceed with guest login after visual feedback
                setTimeout(() => {
                    loginAsGuest();
                }, 800);
            }, 1200);
        });
    }
    
    // Setup logout functionality across the app
    setupLogout();
    
    // Set up quick login buttons if they exist
    setupQuickLogin();
});

// Initialize authentication system
function initAuth() {
    // Check if predefined users exist, if not, create them
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'superadmin',
                password: 'SbtcZona5#2023',
                fullName: 'Super Administrator',
                email: 'superadmin@phe.onwj.com',
                role: 'superadmin',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                maxInterviews: 10,
                permissions: ['view', 'add', 'edit', 'delete', 'approve', 'audit', 'manageUsers']
            },
            {
                id: 2,
                username: 'admin',
                password: 'Admin@Sbtc2023',
                fullName: 'Administrator',
                email: 'admin@phe.onwj.com',
                role: 'admin',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                maxInterviews: 8,
                permissions: ['view', 'add', 'edit', 'delete', 'approve']
            },
            {
                id: 3,
                username: 'contractor',
                password: 'Contractor@2023',
                fullName: 'PT Maju Bersama',
                email: 'contact@majubersama.com',
                role: 'contractor',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                companyDetails: {
                    name: 'PT Maju Bersama',
                    business: 'Konstruksi',
                    address: 'Jl. Industri Raya No. 123, Jakarta Utara',
                    contact: 'Budi Santoso',
                    phone: '081234567890'
                }
            },
            {
                id: 4,
                username: 'hsse_interviewer',
                password: 'Hsse@2023',
                fullName: 'HSSE Interviewer',
                email: 'hsse@phe.onwj.com',
                role: 'admin',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                interviewType: 'HSSE',
                maxInterviews: 6,
                permissions: ['view', 'edit', 'interview']
            },
            {
                id: 5,
                username: 'engineering_interviewer',
                password: 'Engineering@2023',
                fullName: 'Engineering Interviewer',
                email: 'engineering@phe.onwj.com',
                role: 'admin',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                interviewType: 'Engineering',
                maxInterviews: 6,
                permissions: ['view', 'edit', 'interview']
            },
            {
                id: 6,
                username: 'guest',
                password: 'guest',
                fullName: 'Guest User',
                email: 'guest@example.com',
                role: 'guest',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                permissions: ['view']
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Check if job requirements exist, if not, create them
    if (!localStorage.getItem('jobRequirements')) {
        const defaultRequirements = [
            {
                position: 'Welder',
                minExperience: 3, // years
                requiredCertifications: ['Welder 6G', 'SMAW', 'GTAW'],
                additionalRequirements: [
                    'Pengalaman bekerja di industri minyak dan gas',
                    'Familiar dengan standar ASME dan AWS',
                    'Mampu bekerja di ketinggian'
                ],
                healthRequirements: ['Tidak buta warna', 'Fit to work certification']
            },
            {
                position: 'Electrical Engineer',
                minExperience: 5, // years
                requiredCertifications: ['Electrical Safety', 'AK3 Listrik'],
                additionalRequirements: [
                    'Pengalaman minimal 5 tahun di industri minyak dan gas',
                    'Familiar dengan standar IEC dan NFPA',
                    'Mampu membaca dan membuat single line diagram'
                ],
                healthRequirements: ['Tidak buta warna', 'Fit to work certification']
            }
        ];
        
        localStorage.setItem('jobRequirements', JSON.stringify(defaultRequirements));
    }
    
    // Check if audit log exists, if not, create it
    if (!localStorage.getItem('auditLog')) {
        localStorage.setItem('auditLog', JSON.stringify([]));
    }
    
    // Check if current session exists
    checkSession();
}

// Set up quick login buttons
function setupQuickLogin() {
    const quickLoginBtns = document.querySelectorAll('.quick-login-btn');
    if (quickLoginBtns.length > 0) {
        quickLoginBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                const password = this.getAttribute('data-password');
                
                if (username && password) {
                    // Fill login form
                    document.getElementById('loginUsername').value = username;
                    document.getElementById('loginPassword').value = password;
                    
                    // Add visual indication that the button was clicked
                    this.style.backgroundColor = '#c8e6c9';
                    
                    // Simulate login after a short delay
                    setTimeout(() => {
                        document.querySelector('.btn-login').click();
                    }, 300);
                }
            });
        });
    }
}

// Set up logout functionality
function setupLogout() {
    const logoutLinks = document.querySelectorAll('#logoutLink, .logout-btn');
    logoutLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Visual feedback for logout
                this.textContent = 'Logging out...';
                
                // Perform logout with slight delay for better UX
                setTimeout(() => {
                    logout();
                }, 500);
            });
        }
    });
}

// Check if user is already logged in
function checkSession() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const sessionInfo = JSON.parse(localStorage.getItem('sessionInfo'));
        const sessionToken = localStorage.getItem('sessionToken');
        
        // Check if session exists
        if (currentUser && sessionToken && sessionInfo) {
            // Check if session has expired
            const expiresAt = new Date(sessionInfo.expiresAt);
            const now = new Date();
            
            if (now > expiresAt) {
                // Session expired, clear it
                console.log('Session expired. Logging out...');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('sessionToken');
                localStorage.removeItem('sessionInfo');
                
                // If on a protected page, redirect to login
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html?expired=true';
                }
                return;
            }
            
            // Valid session, if on login page, redirect to index
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
            
            // Update user profile information if on main site
            updateUserProfileDisplay();
        } else if (!window.location.pathname.includes('login.html')) {
            // No valid session and not on login page, redirect to login
            window.location.href = 'login.html';
        }
        
        // Check for guest login via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('guest') && urlParams.get('guest') === 'true') {
            loginAsGuest();
        }
        
        // Check for expired session notification
        if (urlParams.has('expired') && urlParams.get('expired') === 'true') {
            const loginError = document.getElementById('loginError');
            if (loginError) {
                loginError.textContent = 'Sesi Anda telah berakhir. Silakan login kembali.';
                loginError.style.display = 'block';
                loginError.classList.add('error-message');
            }
        }
    } catch (error) {
        console.error('Session check error:', error);
        // Clear any potentially corrupt session data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('sessionInfo');
        
        // If not on login page, redirect
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html?error=true';
        }
    }
}

// Update user profile display on all pages
function updateUserProfileDisplay() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Update header user info
        const headerUserName = document.getElementById('headerUserName');
        const headerUserAvatar = document.getElementById('headerUserAvatar');
        
        if (headerUserName) {
            headerUserName.textContent = currentUser.fullName || currentUser.username;
        }
        
        if (headerUserAvatar) {
            // Set first letter of name as avatar
            headerUserAvatar.textContent = (currentUser.fullName || currentUser.username).charAt(0).toUpperCase();
            
            // Set color based on role
            const roleColors = {
                'superadmin': '#f44336',
                'admin': '#2196f3',
                'contractor': '#4caf50',
                'guest': '#9e9e9e'
            };
            
            headerUserAvatar.style.backgroundColor = roleColors[currentUser.role] || '#607d8b';
        }
        
        // Set role-specific UI elements
        const roleIndicator = document.createElement('div');
        roleIndicator.className = 'role-indicator';
        roleIndicator.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        
        const userProfile = document.getElementById('userProfileHeader');
        if (userProfile && !userProfile.querySelector('.role-indicator')) {
            userProfile.appendChild(roleIndicator);
        }
        
        // Show switch account link only for guest users
        const switchAccountLink = document.getElementById('switchAccountLink');
        if (switchAccountLink) {
            if (currentUser.role === 'guest') {
                switchAccountLink.style.display = '';
                // Setup switch account event listener
                if (!switchAccountLink.hasAttribute('data-initialized')) {
                    switchAccountLink.setAttribute('data-initialized', 'true');
                    switchAccountLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        switchToAdminAccount();
                    });
                }
            } else {
                switchAccountLink.style.display = 'none';
            }
        }
        
        // Hide elements based on permissions, but ensure logout is always accessible
        document.querySelectorAll('[data-requires-permission]').forEach(element => {
            const requiredPermission = element.getAttribute('data-requires-permission');
            // Check if this is a logout button (which should always be visible)
            const isLogoutButton = element.id === 'logoutLink' || element.classList.contains('logout-btn');
            
            if (!hasPermission(requiredPermission) && !isLogoutButton) {
                element.style.display = 'none';
            }
        });
        
        // Ensure logout link is always visible
        const logoutLinks = document.querySelectorAll('#logoutLink, .logout-btn');
        logoutLinks.forEach(link => {
            if (link) {
                link.style.display = '';
            }
        });
    } catch (error) {
        console.error('Error updating user profile display:', error);
    }
}

// Enhanced login function with visual feedback
function enhancedLogin(username, password, rememberMe) {
    try {
        if (!username || !password) {
            showLoginError('Username dan password harus diisi.');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user with matching username
        const user = users.find(u => u.username === username);
        
        // Check if user exists and password is correct
        if (user && user.password === password) {
            if (user.status !== 'active') {
                showLoginError('Akun Anda tidak aktif. Silakan hubungi administrator.');
                return;
            }
            
            // Show success message
            document.querySelector('.login-loading').style.display = 'none';
            document.querySelector('.login-success').style.display = 'block';
            
            // Create session
            const sessionToken = generateSessionToken();
            const sessionDuration = rememberMe ? 30 : 1; // Days to remember login
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + sessionDuration);
            
            // Update user's last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
            
            // Save session info
            const sessionInfo = {
                userId: user.id,
                token: sessionToken,
                expiresAt: expiresAt.toISOString(),
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };
            
            // Remove sensitive info before storing in session
            const { password, ...userWithoutPassword } = user;
            
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
            
            // Log the login action
            logAction('login', user.id, `User ${username} logged in`);
            
            // Redirect to dashboard after delay for visual feedback
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showLoginError('Username atau password salah.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Show login form error with animation
function showLoginError(message) {
    document.querySelector('.login-loading').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.querySelector('.quick-login').style.display = 'block';
    
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.add('error-message');
        // Add shake animation
        errorElement.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            errorElement.style.animation = '';
        }, 500);
    }
}

// Login function - legacy version for compatibility
function login(username, password, rememberMe) {
    enhancedLogin(username, password, rememberMe);
}

// Guest login function
function loginAsGuest() {
    try {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find guest user
        let guestUser = users.find(u => u.username === 'guest');
        
        // If guest user doesn't exist, create one
        if (!guestUser) {
            guestUser = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 6,
                username: 'guest',
                password: 'guest',
                fullName: 'Guest User',
                email: 'guest@example.com',
                role: 'guest',
                status: 'active',
                lastLogin: null,
                createdAt: new Date().toISOString(),
                permissions: ['view']
            };
            
            users.push(guestUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Create session
        const sessionToken = generateSessionToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1); // Guest sessions last 1 day
        
        // Update guest user's last login
        guestUser.lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        
        // Save session info
        const sessionInfo = {
            userId: guestUser.id,
            token: sessionToken,
            expiresAt: expiresAt.toISOString(),
            isGuest: true,
            loginTime: new Date().toISOString()
        };
        
        // Remove sensitive info before storing in session
        const { password, ...userWithoutPassword } = guestUser;
        
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
        
        // Log the login action
        logAction('login', guestUser.id, `User ${guestUser.username} logged in as guest`);
        
        // Redirect to dashboard
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Guest login error:', error);
        showError('loginError', 'Terjadi kesalahan saat login sebagai tamu.');
    }
}

// Registration function
function register(fullName, email, username, password, confirmPassword, userType, termsAgreed) {
    try {
        // Validate form
        if (!fullName || !email || !username || !password || !confirmPassword || !userType) {
            showError('registerError', 'Semua field harus diisi.');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('registerError', 'Password dan konfirmasi password tidak cocok.');
            return;
        }
        
        if (!termsAgreed) {
            showError('registerError', 'Anda harus menyetujui syarat dan ketentuan.');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('registerError', 'Format email tidak valid.');
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if username or email already exists
        if (users.some(user => user.username === username)) {
            showError('registerError', 'Username sudah digunakan.');
            return;
        }
        
        if (users.some(user => user.email === email)) {
            showError('registerError', 'Email sudah terdaftar.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            password, // In a real app, this would be hashed
            fullName,
            email,
            role: userType,
            status: 'pending', // Needs admin approval
            lastLogin: null,
            createdAt: new Date().toISOString()
        };
        
        // Add company details if contractor
        if (userType === 'contractor') {
            newUser.companyDetails = {
                name: fullName,
                business: '',
                address: '',
                contact: '',
                phone: ''
            };
        }
        
        // Add user to array and save
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Log the registration
        logAction('register', newUser.id, `New user ${username} registered as ${userType}`);
        
        // Show success message and switch to login tab
        alert('Pendaftaran berhasil. Akun Anda akan diverifikasi oleh admin sebelum dapat digunakan.');
        document.querySelector('.tab-btn[data-tab="login"]').click();
    } catch (error) {
        console.error('Registration error:', error);
        showError('registerError', 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
    }
}

// Enhanced logout function with confirmation
function logout(skipConfirmation = false) {
    try {
        if (!skipConfirmation) {
            const confirmLogout = confirm('Apakah Anda yakin ingin keluar?');
            if (!confirmLogout) return;
        }
        
        // Get current user before clearing
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Add visual feedback - show overlay or loading indicator if exists
        const logoutOverlay = document.querySelector('.logout-overlay');
        if (logoutOverlay) {
            logoutOverlay.style.display = 'flex';
        }
        
        // Clear session
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('sessionInfo');
        
        // Log the logout action if we had a user
        if (currentUser) {
            logAction('logout', currentUser.id, `User ${currentUser.username} logged out`);
        }
        
        // Redirect to login page after a small delay for visual feedback
        setTimeout(() => {
            window.location.href = 'login.html?logged_out=true';
        }, 500);
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect to login page anyway
        window.location.href = 'login.html';
    }
}

// Function to switch from guest to admin account
function switchToAdminAccount() {
    try {
        // Get current user to log the action
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser && currentUser.role === 'guest') {
            // Show confirmation dialog
            const confirmSwitch = confirm('Anda akan beralih ke akun Admin. Lanjutkan?');
            if (!confirmSwitch) return;
            
            // Add visual feedback
            const switchBtn = document.getElementById('switchAccountLink');
            if (switchBtn) {
                switchBtn.textContent = 'Beralih ke Admin...';
            }
            
            // Log the action
            if (currentUser) {
                logAction('switch_account', currentUser.id, `User ${currentUser.username} switched from guest to admin account`);
            }
            
            // Clear current session
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('sessionInfo');
            
            // Redirect to login page with admin options highlighted
            setTimeout(() => {
                window.location.href = 'login.html?switch_to_admin=true';
            }, 500);
        }
    } catch (error) {
        console.error('Switch account error:', error);
        // Redirect to login page anyway
        window.location.href = 'login.html';
    }
}

// Generate a random session token
function generateSessionToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Display error message
function showError(elementId, message) {
    try {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Add animation if it's a form error
            if (elementId.includes('Error')) {
                errorElement.classList.add('error-message');
                errorElement.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    errorElement.style.animation = '';
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error displaying error message:', error);
    }
}

// Log actions to audit log
function logAction(action, userId, description) {
    try {
        const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
        
        const logEntry = {
            id: auditLog.length > 0 ? Math.max(...auditLog.map(log => log.id)) + 1 : 1,
            timestamp: new Date().toISOString(),
            action,
            userId,
            description,
            userAgent: navigator.userAgent,
            ipAddress: '127.0.0.1' // In a real app, this would be the actual IP
        };
        
        auditLog.push(logEntry);
        localStorage.setItem('auditLog', JSON.stringify(auditLog));
    } catch (error) {
        console.error('Error logging action:', error);
    }
}

// Check permissions
function hasPermission(permission) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return false;
        
        const role = currentUser.role;
        
        // Define permissions based on roles
        const rolePermissions = {
            superadmin: ['view', 'add', 'edit', 'delete', 'approve', 'audit', 'manageUsers'],
            admin: ['view', 'add', 'edit', 'delete', 'approve'],
            contractor: ['view', 'add', 'editOwn'],
            guest: ['view']
        };
        
        return rolePermissions[role] && rolePermissions[role].includes(permission);
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}

// Check if session is valid and not expired
function isSessionValid() {
    try {
        const sessionInfo = JSON.parse(localStorage.getItem('sessionInfo'));
        if (!sessionInfo) return false;
        
        const expiresAt = new Date(sessionInfo.expiresAt);
        const now = new Date();
        
        return now < expiresAt;
    } catch (error) {
        console.error('Session validity check error:', error);
        return false;
    }
}

// Expose key functions globally
window.auth = {
    logout,
    hasPermission,
    logAction,
    isSessionValid,
    enhancedLogin,
    loginAsGuest,
    updateUserProfileDisplay,
    switchToAdminAccount
};