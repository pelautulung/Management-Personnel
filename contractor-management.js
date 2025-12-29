// Contractor Management Module
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeContractorData();
    
    // Tab switching for main tabs
    const tabs = document.querySelectorAll('.management-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Form tab switching
    const formTabs = document.querySelectorAll('.form-tab');
    formTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all form tabs
            formTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.form-tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-form-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Update navigation buttons
            updateFormNavButtons();
        });
    });
    
    // Next and previous buttons for form navigation
    const nextBtn = document.querySelector('.next-tab');
    const prevBtn = document.querySelector('.prev-tab');
    const submitBtn = document.querySelector('.submit-form');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.form-tab.active');
            const nextTab = activeTab.nextElementSibling;
            
            if (nextTab) {
                // Trigger click on next tab
                nextTab.click();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.form-tab.active');
            const prevTab = activeTab.previousElementSibling;
            
            if (prevTab) {
                // Trigger click on previous tab
                prevTab.click();
            }
        });
    }
    
    // Set up file upload buttons
    setupFileUploadButtons();
});

const STORAGE_KEY = 'appState';
const appStorage = window.storage || window.StorageHelper || window.Storage || null;

const BASE_CONTRACTORS = [
    {
        id: 1,
        code: 'CONT001',
        name: 'PT Pertamina Drilling Services Indonesia',
        business: 'Drilling Services',
        email: 'contact@pdsi.co.id',
        phone: '021-5234567',
        address: 'Jl. Medan Merdeka Timur No. 1A, Jakarta Pusat',
        riskCategory: 'high',
        npwp: '01.123.456.7-123.000',
        pic: 'Ahmad Sudrajat',
        picEmail: 'ahmad@pdsi.co.id',
        picPhone: '081234567890',
        status: 'active'
    },
    {
        id: 2,
        code: 'CONT002',
        name: 'PT Halliburton Indonesia',
        business: 'Oil & Gas Services',
        email: 'info@halliburton.co.id',
        phone: '021-7654321',
        address: 'Jl. TB Simatupang Kav. 10, Jakarta Selatan',
        riskCategory: 'medium',
        npwp: '01.456.789.0-123.000',
        pic: 'Budi Santoso',
        picEmail: 'budi@halliburton.co.id',
        picPhone: '087654321098',
        status: 'active'
    },
    {
        id: 3,
        code: 'CONT003',
        name: 'PT Schlumberger Indonesia',
        business: 'Oilfield Services',
        email: 'schlumberger@slb.co.id',
        phone: '021-8765432',
        address: 'Menara Kuningan Lt. 20, Jakarta Selatan',
        riskCategory: 'low',
        npwp: '01.789.012.3-123.000',
        pic: 'Cahya Wijaya',
        picEmail: 'cahya@slb.co.id',
        picPhone: '089876543210',
        status: 'inactive'
    }
];

const BASE_CONTRACTS = [
    {
        id: 1,
        contractNumber: 'CTR-2023-001',
        contractorId: 1,
        workType: 'Drilling Services',
        value: 5000000000,
        startDate: '2023-01-15',
        endDate: '2024-01-14',
        description: 'Jasa pengeboran untuk sumur minyak di area ONWJ',
        status: 'active'
    },
    {
        id: 2,
        contractNumber: 'CTR-2023-002',
        contractorId: 2,
        workType: 'Well Intervention',
        value: 3500000000,
        startDate: '2023-03-01',
        endDate: '2024-02-28',
        description: 'Jasa well intervention untuk sumur produksi',
        status: 'active'
    },
    {
        id: 3,
        contractNumber: 'CTR-2022-045',
        contractorId: 3,
        workType: 'Wireline Services',
        value: 2750000000,
        startDate: '2022-11-01',
        endDate: '2023-10-31',
        description: 'Jasa wireline untuk evaluasi sumur',
        status: 'active'
    }
];

const BASE_CSMS = [
    {
        id: 1,
        contractorId: 1,
        csmsNumber: 'CSMS-2023-001',
        riskCategory: 'high',
        score: 85,
        evaluationDate: '2023-01-10',
        expiryDate: '2024-01-09',
        notes: 'Memenuhi standar HSE untuk pekerjaan risiko tinggi',
        status: 'active'
    },
    {
        id: 2,
        contractorId: 2,
        csmsNumber: 'CSMS-2023-002',
        riskCategory: 'medium',
        score: 78,
        evaluationDate: '2023-02-15',
        expiryDate: '2024-02-14',
        notes: 'Perlu perbaikan pada sistem pelaporan insiden',
        status: 'active'
    },
    {
        id: 3,
        contractorId: 3,
        csmsNumber: 'CSMS-2022-089',
        riskCategory: 'low',
        score: 92,
        evaluationDate: '2022-10-20',
        expiryDate: '2023-10-19',
        notes: 'Sangat baik, memenuhi semua persyaratan HSE',
        status: 'active'
    }
];

const BASE_ACCOUNTS = [
    {
        id: 1,
        contractorId: 1,
        username: 'pdsi_admin',
        email: 'admin@pdsi.co.id',
        fullName: 'Ahmad Sudrajat',
        role: 'contractor_admin',
        status: 'active'
    },
    {
        id: 2,
        contractorId: 1,
        username: 'pdsi_op1',
        email: 'operator1@pdsi.co.id',
        fullName: 'Budi Santoso',
        role: 'operator',
        status: 'active'
    },
    {
        id: 3,
        contractorId: 2,
        username: 'hali_admin',
        email: 'admin@halliburton.co.id',
        fullName: 'Cahya Wijaya',
        role: 'contractor_admin',
        status: 'active'
    },
    {
        id: 4,
        contractorId: 3,
        username: 'slb_admin',
        email: 'admin@slb.co.id',
        fullName: 'Dewi Lestari',
        role: 'contractor_admin',
        status: 'inactive'
    }
];

let contractors = [];
let contracts = [];
let csmsData = [];
let accounts = [];

function cloneDefaults(defaultArray) {
    return defaultArray.map(item => JSON.parse(JSON.stringify(item)));
}

function getStoredAppState() {
    return appStorage ? appStorage.getJSON(STORAGE_KEY) || {} : {};
}

function restoreContractorState() {
    const stored = getStoredAppState();
    contractors = (stored.contractors && stored.contractors.length) ? stored.contractors : cloneDefaults(BASE_CONTRACTORS);
    contracts = (stored.contracts && stored.contracts.length) ? stored.contracts : cloneDefaults(BASE_CONTRACTS);
    csmsData = (stored.csms && stored.csms.length) ? stored.csms : cloneDefaults(BASE_CSMS);
    accounts = (stored.accounts && stored.accounts.length) ? stored.accounts : cloneDefaults(BASE_ACCOUNTS);
}

function persistContractorState() {
    if (!appStorage) return;
    const stored = getStoredAppState();
    const merged = {
        ...stored,
        contractors,
        contracts,
        csms: csmsData,
        accounts
    };
    appStorage.setJSON(STORAGE_KEY, merged);
    if (window.app && window.app.state) {
        window.app.state.contractors = contractors;
        if (typeof window.app.notifyDataChange === 'function') {
            window.app.notifyDataChange('contractors');
        }
    }
}

// Initialize data and populate tables
function initializeContractorData() {
    restoreContractorState();
    // Load contractors data
    loadContractorsTable();
    
    // Load contracts data
    loadContractsTable();
    
    // Load CSMS data
    loadCSMSTable();
    
    // Load personnel data
    loadPersonnelTable();
    
    // Load accounts data
    loadAccountsTable();
    
    // Populate contractor dropdowns
    populateContractorDropdowns();
}

// Load contractors data into table
function loadContractorsTable() {
    const tbody = document.querySelector('#contractorsTable tbody');
    tbody.innerHTML = '';
    
    contractors.forEach(contractor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contractor.code}</td>
            <td>${contractor.name}</td>
            <td>${contractor.business}</td>
            <td>${contractor.email}</td>
            <td>${contractor.phone}</td>
            <td>
                <span class="status-badge risk-${contractor.riskCategory}">
                    ${contractor.riskCategory === 'high' ? 'Tinggi' : 
                      contractor.riskCategory === 'medium' ? 'Menengah' : 'Rendah'}
                </span>
            </td>
            <td>
                <span class="status-badge ${contractor.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${contractor.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editContractor(${contractor.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContractor(${contractor.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load contracts data into table
function loadContractsTable() {
    const tbody = document.querySelector('#contractsTable tbody');
    tbody.innerHTML = '';
    
    contracts.forEach(contract => {
        const contractor = contractors.find(c => c.id === contract.contractorId);
        const tr = document.createElement('tr');
        
        // Format currency
        const formattedValue = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(contract.value);
        
        tr.innerHTML = `
            <td>${contract.contractNumber}</td>
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${contract.workType}</td>
            <td>${formattedValue}</td>
            <td>${formatDate(contract.startDate)}</td>
            <td>${formatDate(contract.endDate)}</td>
            <td>
                <span class="status-badge ${getContractStatusClass(contract.status)}">
                    ${getContractStatusLabel(contract.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editContract(${contract.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContract(${contract.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load CSMS data into table
function loadCSMSTable() {
    const tbody = document.querySelector('#csmsTable tbody');
    tbody.innerHTML = '';
    
    csmsData.forEach(csms => {
        const contractor = contractors.find(c => c.id === csms.contractorId);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${csms.csmsNumber}</td>
            <td>
                <span class="status-badge risk-${csms.riskCategory}">
                    ${csms.riskCategory === 'high' ? 'Tinggi' : 
                      csms.riskCategory === 'medium' ? 'Menengah' : 'Rendah'}
                </span>
            </td>
            <td>${csms.score}/100</td>
            <td>${formatDate(csms.evaluationDate)}</td>
            <td>${formatDate(csms.expiryDate)}</td>
            <td>
                <span class="status-badge ${getCSMSStatusClass(csms.status)}">
                    ${getCSMSStatusLabel(csms.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editCSMS(${csms.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCSMS(${csms.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load accounts data into table
function loadAccountsTable() {
    const tbody = document.querySelector('#accountsTable tbody');
    tbody.innerHTML = '';
    
    accounts.forEach(account => {
        const contractor = contractors.find(c => c.id === account.contractorId);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${account.fullName}</td>
            <td>${account.username}</td>
            <td>${account.email}</td>
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${account.role === 'contractor_admin' ? 'Admin' : 'Operator'}</td>
            <td>
                <span class="status-badge ${account.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${account.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editAccount(${account.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Populate contractor dropdowns in all modals
function populateContractorDropdowns() {
    const dropdowns = [
        document.getElementById('accountContractor'), 
        document.getElementById('contractContractor'),
        document.getElementById('csmsContractor'),
        document.getElementById('personnelContractor'),
        document.getElementById('contractorFilter'),
        document.getElementById('contractorFilterForContract'),
        document.getElementById('contractorFilterForPersonnel')
    ];
    
    dropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Pilih Kontraktor</option>';
            
            contractors.forEach(contractor => {
                if (contractor.status === 'active' || dropdown.id.includes('Filter')) {
                    dropdown.innerHTML += `<option value="${contractor.id}">${contractor.name}</option>`;
                }
            });
        }
    });
    
    // Also populate contract dropdowns
    populateContractDropdowns();
}

// Populate contract dropdowns
function populateContractDropdowns() {
    const contractFilterDropdown = document.getElementById('contractFilterForPersonnel');
    if (contractFilterDropdown) {
        contractFilterDropdown.innerHTML = '<option value="">Semua Kontrak</option>';
        
        contracts.forEach(contract => {
            const contractor = contractors.find(c => c.id === contract.contractorId);
            contractFilterDropdown.innerHTML += `<option value="${contract.id}">${contract.contractNumber} - ${contractor ? contractor.name : 'Unknown'}</option>`;
        });
    }
}

// Helper Functions
function formatDate(dateString) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function getContractStatusClass(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        case 'completed': return 'status-pending';
        default: return '';
    }
}

function getContractStatusLabel(status) {
    switch (status) {
        case 'active': return 'Aktif';
        case 'inactive': return 'Non-Aktif';
        case 'completed': return 'Selesai';
        default: return status;
    }
}

function getCSMSStatusClass(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'expired': return 'status-inactive';
        case 'pending': return 'status-pending';
        default: return '';
    }
}

function getCSMSStatusLabel(status) {
    switch (status) {
        case 'active': return 'Aktif';
        case 'expired': return 'Kedaluwarsa';
        case 'pending': return 'Pending';
        default: return status;
    }
}

// Search Functions
function searchContractors() {
    const searchTerm = document.getElementById('contractorSearch').value.toLowerCase();
    const filteredContractors = contractors.filter(contractor => 
        contractor.name.toLowerCase().includes(searchTerm) || 
        contractor.email.toLowerCase().includes(searchTerm) || 
        contractor.code.toLowerCase().includes(searchTerm) ||
        contractor.business.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.querySelector('#contractorsTable tbody');
    tbody.innerHTML = '';
    
    filteredContractors.forEach(contractor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contractor.code}</td>
            <td>${contractor.name}</td>
            <td>${contractor.business}</td>
            <td>${contractor.email}</td>
            <td>${contractor.phone}</td>
            <td>
                <span class="status-badge risk-${contractor.riskCategory}">
                    ${contractor.riskCategory === 'high' ? 'Tinggi' : 
                      contractor.riskCategory === 'medium' ? 'Menengah' : 'Rendah'}
                </span>
            </td>
            <td>
                <span class="status-badge ${contractor.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${contractor.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editContractor(${contractor.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContractor(${contractor.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchContracts() {
    const searchTerm = document.getElementById('contractSearch').value.toLowerCase();
    const contractorId = document.getElementById('contractorFilterForContract').value;
    
    let filteredContracts = contracts;
    
    // Filter by contractor if selected
    if (contractorId) {
        filteredContracts = filteredContracts.filter(contract => 
            contract.contractorId === parseInt(contractorId)
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredContracts = filteredContracts.filter(contract => {
            const contractor = contractors.find(c => c.id === contract.contractorId);
            return contract.contractNumber.toLowerCase().includes(searchTerm) || 
                   contract.workType.toLowerCase().includes(searchTerm) ||
                   (contractor && contractor.name.toLowerCase().includes(searchTerm));
        });
    }
    
    const tbody = document.querySelector('#contractsTable tbody');
    tbody.innerHTML = '';
    
    filteredContracts.forEach(contract => {
        const contractor = contractors.find(c => c.id === contract.contractorId);
        const tr = document.createElement('tr');
        
        // Format currency
        const formattedValue = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(contract.value);
        
        tr.innerHTML = `
            <td>${contract.contractNumber}</td>
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${contract.workType}</td>
            <td>${formattedValue}</td>
            <td>${formatDate(contract.startDate)}</td>
            <td>${formatDate(contract.endDate)}</td>
            <td>
                <span class="status-badge ${getContractStatusClass(contract.status)}">
                    ${getContractStatusLabel(contract.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editContract(${contract.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContract(${contract.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchCSMS() {
    const searchTerm = document.getElementById('csmsSearch').value.toLowerCase();
    const riskCategory = document.getElementById('riskCategoryFilter').value;
    
    let filteredCSMS = csmsData;
    
    // Filter by risk category if selected
    if (riskCategory) {
        filteredCSMS = filteredCSMS.filter(csms => 
            csms.riskCategory === riskCategory
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredCSMS = filteredCSMS.filter(csms => {
            const contractor = contractors.find(c => c.id === csms.contractorId);
            return csms.csmsNumber.toLowerCase().includes(searchTerm) || 
                   (contractor && contractor.name.toLowerCase().includes(searchTerm));
        });
    }
    
    const tbody = document.querySelector('#csmsTable tbody');
    tbody.innerHTML = '';
    
    filteredCSMS.forEach(csms => {
        const contractor = contractors.find(c => c.id === csms.contractorId);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${csms.csmsNumber}</td>
            <td>
                <span class="status-badge risk-${csms.riskCategory}">
                    ${csms.riskCategory === 'high' ? 'Tinggi' : 
                      csms.riskCategory === 'medium' ? 'Menengah' : 'Rendah'}
                </span>
            </td>
            <td>${csms.score}/100</td>
            <td>${formatDate(csms.evaluationDate)}</td>
            <td>${formatDate(csms.expiryDate)}</td>
            <td>
                <span class="status-badge ${getCSMSStatusClass(csms.status)}">
                    ${getCSMSStatusLabel(csms.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editCSMS(${csms.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCSMS(${csms.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchAccounts() {
    const searchTerm = document.getElementById('accountSearch').value.toLowerCase();
    const contractorId = document.getElementById('contractorFilter').value;
    
    let filteredAccounts = accounts;
    
    // Filter by contractor if selected
    if (contractorId) {
        filteredAccounts = filteredAccounts.filter(account => 
            account.contractorId === parseInt(contractorId)
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredAccounts = filteredAccounts.filter(account => 
            account.fullName.toLowerCase().includes(searchTerm) || 
            account.email.toLowerCase().includes(searchTerm) || 
            account.username.toLowerCase().includes(searchTerm)
        );
    }
    
    const tbody = document.querySelector('#accountsTable tbody');
    tbody.innerHTML = '';
    
    filteredAccounts.forEach(account => {
        const contractor = contractors.find(c => c.id === account.contractorId);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${account.fullName}</td>
            <td>${account.username}</td>
            <td>${account.email}</td>
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${account.role === 'contractor_admin' ? 'Admin' : 'Operator'}</td>
            <td>
                <span class="status-badge ${account.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${account.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editAccount(${account.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// CONTRACTOR MODAL FUNCTIONS
// Open contractor modal
function openContractorModal() {
    document.getElementById('contractorModalTitle').textContent = 'Tambah Kontraktor Baru';
    document.getElementById('contractorForm').reset();
    document.getElementById('contractorModal').style.display = 'block';
}

// Close contractor modal
function closeContractorModal() {
    document.getElementById('contractorModal').style.display = 'none';
}

// Save contractor (add or update)
function saveContractor() {
    const code = document.getElementById('contractorCode').value;
    const name = document.getElementById('contractorName').value;
    const business = document.getElementById('contractorBusiness').value;
    const email = document.getElementById('contractorEmail').value;
    const phone = document.getElementById('contractorPhone').value;
    const address = document.getElementById('contractorAddress').value;
    const riskCategory = document.getElementById('contractorRiskCategory').value;
    const npwp = document.getElementById('contractorNPWP').value;
    const pic = document.getElementById('contractorPIC').value;
    const picEmail = document.getElementById('contractorPICEmail').value;
    const picPhone = document.getElementById('contractorPICPhone').value;
    const status = document.getElementById('contractorStatus').value;
    
    // Validate form
    if (!code || !name || !business || !email || !phone || !address || !riskCategory || !npwp || !pic || !picEmail || !picPhone) {
        alert('Semua field harus diisi!');
        return;
    }
    
    // Check if editing or adding
    const contractorId = document.getElementById('contractorForm').getAttribute('data-id');
    
    if (contractorId) {
        // Update existing contractor
        const index = contractors.findIndex(c => c.id === parseInt(contractorId));
        if (index !== -1) {
            contractors[index] = {
                ...contractors[index],
                code,
                name,
                business,
                email,
                phone,
                address,
                riskCategory,
                npwp,
                pic,
                picEmail,
                picPhone,
                status
            };
        }
    } else {
        // Add new contractor
        const newId = contractors.length > 0 ? Math.max(...contractors.map(c => c.id)) + 1 : 1;
        contractors.push({
            id: newId,
            code,
            name,
            business,
            email,
            phone,
            address,
            riskCategory,
            npwp,
            pic,
            picEmail,
            picPhone,
            status
        });
    }
    
    // Refresh data
    loadContractorsTable();
    populateContractorDropdowns();
    
    persistContractorState();
    // Close modal
    closeContractorModal();
}

// Edit contractor
function editContractor(id) {
    const contractor = contractors.find(c => c.id === id);
    if (!contractor) return;
    
    document.getElementById('contractorModalTitle').textContent = 'Edit Kontraktor';
    document.getElementById('contractorForm').setAttribute('data-id', id);
    
    document.getElementById('contractorCode').value = contractor.code;
    document.getElementById('contractorName').value = contractor.name;
    document.getElementById('contractorBusiness').value = contractor.business;
    document.getElementById('contractorEmail').value = contractor.email;
    document.getElementById('contractorPhone').value = contractor.phone;
    document.getElementById('contractorAddress').value = contractor.address;
    document.getElementById('contractorRiskCategory').value = contractor.riskCategory;
    document.getElementById('contractorNPWP').value = contractor.npwp;
    document.getElementById('contractorPIC').value = contractor.pic;
    document.getElementById('contractorPICEmail').value = contractor.picEmail;
    document.getElementById('contractorPICPhone').value = contractor.picPhone;
    document.getElementById('contractorStatus').value = contractor.status;
    
    document.getElementById('contractorModal').style.display = 'block';
}

// Delete contractor
function deleteContractor(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kontraktor ini?')) return;
    
    // Check if contractor has accounts, contracts or CSMS
    const hasAccounts = accounts.some(account => account.contractorId === id);
    const hasContracts = contracts.some(contract => contract.contractorId === id);
    const hasCSMS = csmsData.some(csms => csms.contractorId === id);
    
    if (hasAccounts || hasContracts || hasCSMS) {
        alert('Kontraktor ini memiliki data terkait (akun, kontrak, atau CSMS). Harap hapus data terkait terlebih dahulu.');
        return;
    }
    
    // Remove contractor
    contractors = contractors.filter(c => c.id !== id);
    
    // Refresh data
    loadContractorsTable();
    populateContractorDropdowns();
    
    persistContractorState();
}

// CONTRACT MODAL FUNCTIONS
// Open contract modal
function openContractModal() {
    document.getElementById('contractModalTitle').textContent = 'Tambah Kontrak Baru';
    document.getElementById('contractForm').reset();
    document.getElementById('contractModal').style.display = 'block';
}

// Close contract modal
function closeContractModal() {
    document.getElementById('contractModal').style.display = 'none';
}

// Save contract (add or update)
function saveContract() {
    const contractNumber = document.getElementById('contractNumber').value;
    const contractorId = document.getElementById('contractContractor').value;
    const workType = document.getElementById('contractWorkType').value;
    const value = document.getElementById('contractValue').value;
    const startDate = document.getElementById('contractStartDate').value;
    const endDate = document.getElementById('contractEndDate').value;
    const description = document.getElementById('contractDescription').value;
    const status = document.getElementById('contractStatus').value;
    
    // Validate form
    if (!contractNumber || !contractorId || !workType || !value || !startDate || !endDate || !description) {
        alert('Semua field harus diisi!');
        return;
    }
    
    // Check if editing or adding
    const contractId = document.getElementById('contractForm').getAttribute('data-id');
    
    if (contractId) {
        // Update existing contract
        const index = contracts.findIndex(c => c.id === parseInt(contractId));
        if (index !== -1) {
            contracts[index] = {
                ...contracts[index],
                contractNumber,
                contractorId: parseInt(contractorId),
                workType,
                value: parseFloat(value),
                startDate,
                endDate,
                description,
                status
            };
        }
    } else {
        // Add new contract
        const newId = contracts.length > 0 ? Math.max(...contracts.map(c => c.id)) + 1 : 1;
        contracts.push({
            id: newId,
            contractNumber,
            contractorId: parseInt(contractorId),
            workType,
            value: parseFloat(value),
            startDate,
            endDate,
            description,
            status
        });
    }
    
    // Refresh data
    loadContractsTable();

    persistContractorState();
    
    // Close modal
    closeContractModal();
}

// Edit contract
function editContract(id) {
    const contract = contracts.find(c => c.id === id);
    if (!contract) return;
    
    document.getElementById('contractModalTitle').textContent = 'Edit Kontrak';
    document.getElementById('contractForm').setAttribute('data-id', id);
    
    document.getElementById('contractNumber').value = contract.contractNumber;
    document.getElementById('contractContractor').value = contract.contractorId;
    document.getElementById('contractWorkType').value = contract.workType;
    document.getElementById('contractValue').value = contract.value;
    document.getElementById('contractStartDate').value = contract.startDate;
    document.getElementById('contractEndDate').value = contract.endDate;
    document.getElementById('contractDescription').value = contract.description;
    document.getElementById('contractStatus').value = contract.status;
    
    document.getElementById('contractModal').style.display = 'block';
}

// Delete contract
function deleteContract(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kontrak ini?')) return;
    
    // Remove contract
    contracts = contracts.filter(c => c.id !== id);
    
    // Refresh data
    loadContractsTable();

    persistContractorState();
}

// CSMS MODAL FUNCTIONS
// Open CSMS modal
function openCSMSModal() {
    document.getElementById('csmsModalTitle').textContent = 'Tambah Evaluasi CSMS';
    document.getElementById('csmsForm').reset();
    document.getElementById('csmsModal').style.display = 'block';
}

// Close CSMS modal
function closeCSMSModal() {
    document.getElementById('csmsModal').style.display = 'none';
}

// Save CSMS (add or update)
function saveCSMS() {
    const contractorId = document.getElementById('csmsContractor').value;
    const csmsNumber = document.getElementById('csmsNumber').value;
    const riskCategory = document.getElementById('csmsRiskCategory').value;
    const score = document.getElementById('csmsScore').value;
    const evaluationDate = document.getElementById('csmsEvaluationDate').value;
    const expiryDate = document.getElementById('csmsExpiryDate').value;
    const notes = document.getElementById('csmsNotes').value;
    const status = document.getElementById('csmsStatus').value;
    
    // Validate form
    if (!contractorId || !csmsNumber || !riskCategory || !score || !evaluationDate || !expiryDate) {
        alert('Semua field harus diisi!');
        return;
    }
    
    // Check if editing or adding
    const csmsId = document.getElementById('csmsForm').getAttribute('data-id');
    
    if (csmsId) {
        // Update existing CSMS
        const index = csmsData.findIndex(c => c.id === parseInt(csmsId));
        if (index !== -1) {
            csmsData[index] = {
                ...csmsData[index],
                contractorId: parseInt(contractorId),
                csmsNumber,
                riskCategory,
                score: parseInt(score),
                evaluationDate,
                expiryDate,
                notes,
                status
            };
        }
    } else {
        // Add new CSMS
        const newId = csmsData.length > 0 ? Math.max(...csmsData.map(c => c.id)) + 1 : 1;
        csmsData.push({
            id: newId,
            contractorId: parseInt(contractorId),
            csmsNumber,
            riskCategory,
            score: parseInt(score),
            evaluationDate,
            expiryDate,
            notes,
            status
        });
    }
    
    // Refresh data
    loadCSMSTable();

    persistContractorState();
    
    // Close modal
    closeCSMSModal();
}

// Edit CSMS
function editCSMS(id) {
    const csms = csmsData.find(c => c.id === id);
    if (!csms) return;
    
    document.getElementById('csmsModalTitle').textContent = 'Edit Evaluasi CSMS';
    document.getElementById('csmsForm').setAttribute('data-id', id);
    
    document.getElementById('csmsContractor').value = csms.contractorId;
    document.getElementById('csmsNumber').value = csms.csmsNumber;
    document.getElementById('csmsRiskCategory').value = csms.riskCategory;
    document.getElementById('csmsScore').value = csms.score;
    document.getElementById('csmsEvaluationDate').value = csms.evaluationDate;
    document.getElementById('csmsExpiryDate').value = csms.expiryDate;
    document.getElementById('csmsNotes').value = csms.notes;
    document.getElementById('csmsStatus').value = csms.status;
    
    document.getElementById('csmsModal').style.display = 'block';
}

// Delete CSMS
function deleteCSMS(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus evaluasi CSMS ini?')) return;
    
    // Remove CSMS
    csmsData = csmsData.filter(c => c.id !== id);
    
    // Refresh data
    loadCSMSTable();

    persistContractorState();
}

// ACCOUNT MODAL FUNCTIONS
// Open account modal
function openAccountModal() {
    document.getElementById('accountModalTitle').textContent = 'Tambah Akun Kontraktor';
    document.getElementById('accountForm').reset();
    
    // Show password fields for new account
    document.getElementById('accountPassword').parentElement.style.display = 'block';
    document.getElementById('accountPasswordConfirm').parentElement.style.display = 'block';
    
    document.getElementById('accountModal').style.display = 'block';
}

// Close account modal
function closeAccountModal() {
    document.getElementById('accountModal').style.display = 'none';
}

// Save account (add or update)
function saveAccount() {
    const contractorId = document.getElementById('accountContractor').value;
    const username = document.getElementById('accountUsername').value;
    const email = document.getElementById('accountEmail').value;
    const password = document.getElementById('accountPassword').value;
    const passwordConfirm = document.getElementById('accountPasswordConfirm').value;
    const fullName = document.getElementById('accountFullName').value;
    const role = document.getElementById('accountRole').value;
    const status = document.getElementById('accountStatus').value;
    
    // Validate form
    if (!contractorId || !username || !email || !fullName || !role) {
        alert('Semua field harus diisi!');
        return;
    }
    
    // Check if editing or adding
    const accountId = document.getElementById('accountForm').getAttribute('data-id');
    
    // Check password match for new accounts
    if (!accountId && password !== passwordConfirm) {
        alert('Password tidak sama!');
        return;
    }
    
    if (accountId) {
        // Update existing account
        const index = accounts.findIndex(a => a.id === parseInt(accountId));
        if (index !== -1) {
            accounts[index] = {
                ...accounts[index],
                contractorId: parseInt(contractorId),
                username,
                email,
                fullName,
                role,
                status
            };
        }
    } else {
        // Add new account
        const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
        accounts.push({
            id: newId,
            contractorId: parseInt(contractorId),
            username,
            email,
            fullName,
            role,
            status
        });
    }
    
    // Refresh data
    loadAccountsTable();

    persistContractorState();
    
    // Close modal
    closeAccountModal();
}

// Edit account
function editAccount(id) {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    document.getElementById('accountModalTitle').textContent = 'Edit Akun Kontraktor';
    document.getElementById('accountForm').setAttribute('data-id', id);
    
    document.getElementById('accountContractor').value = account.contractorId;
    document.getElementById('accountUsername').value = account.username;
    document.getElementById('accountEmail').value = account.email;
    document.getElementById('accountFullName').value = account.fullName;
    document.getElementById('accountRole').value = account.role;
    document.getElementById('accountStatus').value = account.status;
    
    // Hide password fields for edit
    document.getElementById('accountPassword').parentElement.style.display = 'none';
    document.getElementById('accountPasswordConfirm').parentElement.style.display = 'none';
    
    document.getElementById('accountModal').style.display = 'block';
}

// Delete account
function deleteAccount(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini?')) return;
    
    // Remove account
    accounts = accounts.filter(a => a.id !== id);
    
    // Refresh data
    loadAccountsTable();

    persistContractorState();
}

// Sample data for personnel
let personnelData = [
    {
        id: 1,
        name: 'Ahmad Saputra',
        nik: '3271062505880001',
        birthPlace: 'Jakarta',
        birthDate: '1988-05-25',
        address: 'Jl. Raya Bekasi No. 45, Jakarta Timur',
        email: 'ahmad.saputra@pdsi.co.id',
        phone: '081234567890',
        position: 'Driller',
        experience: 7,
        contractorId: 1,
        contractId: 1,
        startDate: '2020-03-15',
        status: 'active',
        documents: {
            cv: { status: 'verified', filename: 'CV_Ahmad.pdf' },
            mcu: { 
                status: 'verified', 
                filename: 'MCU_Ahmad.pdf',
                date: '2023-01-10',
                expiry: '2024-01-09'
            },
            survival: { 
                status: 'verified', 
                filename: 'TBOSIET_Ahmad.pdf',
                date: '2022-11-15',
                expiry: '2026-11-14'
            },
            sika: { 
                status: 'verified', 
                filename: 'SIKA_Ahmad.pdf',
                date: '2023-02-01',
                expiry: '2024-01-31'
            },
            additional: [
                {
                    name: 'IWCF Level 4',
                    filename: 'IWCF_Ahmad.pdf',
                    date: '2022-08-20',
                    expiry: '2024-08-19'
                }
            ]
        }
    },
    {
        id: 2,
        name: 'Budi Santoso',
        nik: '3271060304900002',
        birthPlace: 'Surabaya',
        birthDate: '1990-04-03',
        address: 'Jl. Jendral Sudirman No. 123, Jakarta Selatan',
        email: 'budi.santoso@halliburton.co.id',
        phone: '087654321098',
        position: 'Well Intervention Specialist',
        experience: 5,
        contractorId: 2,
        contractId: 2,
        startDate: '2021-06-10',
        status: 'active',
        documents: {
            cv: { status: 'verified', filename: 'CV_Budi.pdf' },
            mcu: { 
                status: 'verified', 
                filename: 'MCU_Budi.pdf',
                date: '2023-03-15',
                expiry: '2024-03-14'
            },
            survival: { 
                status: 'verified', 
                filename: 'TBOSIET_Budi.pdf',
                date: '2022-10-20',
                expiry: '2026-10-19'
            },
            sika: { 
                status: 'pending', 
                filename: 'SIKA_Budi.pdf',
                date: '2023-04-01',
                expiry: '2024-03-31'
            },
            additional: []
        }
    }
];

// Load personnel data into table
function loadPersonnelTable() {
    const tbody = document.querySelector('#personnelTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    personnelData.forEach(person => {
        const contractor = contractors.find(c => c.id === person.contractorId);
        const contract = contracts.find(c => c.id === person.contractId);
        
        const tr = document.createElement('tr');
        
        // Calculate document status
        let documentStatus = 'Lengkap';
        let documentStatusClass = 'status-active';
        
        if (!person.documents.cv || !person.documents.mcu || !person.documents.survival || !person.documents.sika) {
            documentStatus = 'Tidak Lengkap';
            documentStatusClass = 'status-inactive';
        } else if (person.documents.cv.status === 'pending' || 
                  person.documents.mcu.status === 'pending' || 
                  person.documents.survival.status === 'pending' || 
                  person.documents.sika.status === 'pending') {
            documentStatus = 'Pending Verifikasi';
            documentStatusClass = 'status-pending';
        }
        
        tr.innerHTML = `
            <td>${person.name}</td>
            <td>${person.nik}</td>
            <td>${person.position}</td>
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${contract ? contract.contractNumber : 'Unknown'}</td>
            <td>${formatDate(person.startDate)}</td>
            <td>
                <span class="status-badge ${documentStatusClass}">
                    ${documentStatus}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editPersonnel(${person.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="viewPersonnelDocuments(${person.id})">
                    <i class="icon">📄</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePersonnel(${person.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Update the contract dropdown based on selected contractor
function updateContractDropdown() {
    const contractorId = parseInt(document.getElementById('personnelContractor').value);
    const contractDropdown = document.getElementById('personnelContract');
    
    if (contractDropdown) {
        contractDropdown.innerHTML = '<option value="">Pilih Kontrak</option>';
        
        if (contractorId) {
            const filteredContracts = contracts.filter(contract => 
                contract.contractorId === contractorId && contract.status === 'active'
            );
            
            filteredContracts.forEach(contract => {
                contractDropdown.innerHTML += `<option value="${contract.id}">${contract.contractNumber} - ${contract.workType}</option>`;
            });
        }
    }
}

// Set up file upload buttons
function setupFileUploadButtons() {
    const fileUploadBtns = document.querySelectorAll('.file-upload-btn');
    fileUploadBtns.forEach(btn => {
        const fileInput = btn.previousElementSibling;
        const fileNameSpan = btn.nextElementSibling;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
            } else {
                fileNameSpan.textContent = 'Belum ada file';
            }
        });
    });
}

// Add new document field
function addDocumentField() {
    const documentContainer = document.getElementById('additionalDocuments');
    const documentCount = documentContainer.children.length + 1;
    
    const documentItem = document.createElement('div');
    documentItem.className = 'document-item';
    documentItem.innerHTML = `
        <div class="form-row">
            <div class="form-group col-6">
                <label class="form-label">Nama Sertifikat</label>
                <input type="text" class="form-control" name="docName[]" placeholder="Nama sertifikat" required>
            </div>
            <div class="form-group col-6">
                <button type="button" class="btn btn-sm btn-danger mt-4" onclick="removeDocument(this)">
                    <i class="icon">🗑️</i> Hapus
                </button>
            </div>
        </div>
        <div class="file-upload-container">
            <input type="file" class="file-upload" name="docFile[]" accept=".pdf,.jpg,.jpeg,.png">
            <button type="button" class="btn btn-outline-primary btn-sm file-upload-btn">
                <i class="icon">📎</i> Pilih File
            </button>
            <span class="file-name">Belum ada file</span>
        </div>
        <div class="form-row mt-2">
            <div class="form-group col-6">
                <label class="small">Tanggal Sertifikat</label>
                <input type="date" class="form-control form-control-sm" name="docDate[]">
            </div>
            <div class="form-group col-6">
                <label class="small">Berlaku Hingga</label>
                <input type="date" class="form-control form-control-sm" name="docExpiry[]">
            </div>
        </div>
    `;
    
    documentContainer.appendChild(documentItem);
    setupFileUploadButtons();
}

// Remove document field
function removeDocument(btn) {
    const documentItem = btn.closest('.document-item');
    documentItem.remove();
}

// Update form navigation buttons
function updateFormNavButtons() {
    const activeTab = document.querySelector('.form-tab.active');
    const prevBtn = document.querySelector('.prev-tab');
    const nextBtn = document.querySelector('.next-tab');
    const submitBtn = document.querySelector('.submit-form');
    
    if (!activeTab || !prevBtn || !nextBtn || !submitBtn) return;
    
    // Check if there's a previous tab
    if (activeTab.previousElementSibling) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Check if there's a next tab
    if (activeTab.nextElementSibling) {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    }
}

// PERSONNEL MODAL FUNCTIONS
// Open personnel modal
function openPersonnelModal() {
    document.getElementById('personnelModalTitle').textContent = 'Tambah Personnel Baru';
    document.getElementById('personnelForm').reset();
    
    // Reset form tabs
    document.querySelectorAll('.form-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.form-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.form-tab[data-form-tab="personal-info"]').classList.add('active');
    document.getElementById('personal-info').classList.add('active');
    
    // Reset additional documents
    document.getElementById('additionalDocuments').innerHTML = '';
    
    // Reset file names
    document.querySelectorAll('.file-name').forEach(span => {
        span.textContent = 'Belum ada file';
    });
    
    // Update form navigation buttons
    updateFormNavButtons();
    
    document.getElementById('personnelModal').style.display = 'block';
}

// Close personnel modal
function closePersonnelModal() {
    document.getElementById('personnelModal').style.display = 'none';
}

// Save personnel
function savePersonnel() {
    // Basic validation - just check required fields in the active tab
    const activeTab = document.querySelector('.form-tab-content.active');
    const requiredFields = activeTab.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    if (!isValid) {
        alert('Mohon lengkapi semua field yang wajib diisi!');
        return;
    }
    
    // In a real system, we would collect all form data and submit to server
    // For this demo, we'll just add a new personnel object to our array
    
    const newId = personnelData.length > 0 ? Math.max(...personnelData.map(p => p.id)) + 1 : 1;
    
    const newPersonnel = {
        id: newId,
        name: document.getElementById('personnelName').value,
        nik: document.getElementById('personnelNIK').value,
        birthPlace: document.getElementById('personnelBirthPlace').value,
        birthDate: document.getElementById('personnelBirthDate').value,
        address: document.getElementById('personnelAddress').value,
        email: document.getElementById('personnelEmail').value,
        phone: document.getElementById('personnelPhone').value,
        position: document.getElementById('personnelPosition').value,
        experience: parseInt(document.getElementById('personnelExperience').value),
        contractorId: parseInt(document.getElementById('personnelContractor').value),
        contractId: parseInt(document.getElementById('personnelContract').value),
        startDate: document.getElementById('personnelStartDate').value,
        status: document.getElementById('personnelStatus').value,
        documents: {
            cv: { 
                status: document.getElementById('cvVerified').checked ? 'verified' : 'pending',
                filename: document.getElementById('personnelCV').files.length > 0 ? 
                    document.getElementById('personnelCV').files[0].name : null
            },
            mcu: { 
                status: 'pending',
                filename: document.getElementById('personnelMCU').files.length > 0 ? 
                    document.getElementById('personnelMCU').files[0].name : null,
                date: document.getElementById('mcuDate').value,
                expiry: document.getElementById('mcuExpiry').value
            },
            survival: { 
                status: 'pending',
                filename: document.getElementById('personnelSurvival').files.length > 0 ? 
                    document.getElementById('personnelSurvival').files[0].name : null,
                date: document.getElementById('survivalDate').value,
                expiry: document.getElementById('survivalExpiry').value
            },
            sika: { 
                status: 'pending',
                filename: document.getElementById('personnelSIKA').files.length > 0 ? 
                    document.getElementById('personnelSIKA').files[0].name : null,
                date: document.getElementById('sikaDate').value,
                expiry: document.getElementById('sikaExpiry').value
            },
            additional: []
        }
    };
    
    // Add additional documents
    const additionalDocItems = document.querySelectorAll('#additionalDocuments .document-item');
    additionalDocItems.forEach(item => {
        const nameInput = item.querySelector('input[name="docName[]"]');
        const fileInput = item.querySelector('input[name="docFile[]"]');
        const dateInput = item.querySelector('input[name="docDate[]"]');
        const expiryInput = item.querySelector('input[name="docExpiry[]"]');
        
        if (nameInput && nameInput.value) {
            newPersonnel.documents.additional.push({
                name: nameInput.value,
                filename: fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : null,
                date: dateInput ? dateInput.value : null,
                expiry: expiryInput ? expiryInput.value : null
            });
        }
    });
    
    // Add the new personnel to our array
    personnelData.push(newPersonnel);
    
    // Refresh data
    loadPersonnelTable();
    
    // Close modal
    closePersonnelModal();
    
    // Show success message
    alert('Data personnel berhasil disimpan!');
}

// Search personnel
function searchPersonnel() {
    const searchTerm = document.getElementById('personnelSearch').value.toLowerCase();
    const contractorId = document.getElementById('contractorFilterForPersonnel').value;
    const contractId = document.getElementById('contractFilterForPersonnel').value;
    
    let filteredPersonnel = personnelData;
    
    // Filter by contractor if selected
    if (contractorId) {
        filteredPersonnel = filteredPersonnel.filter(person => 
            person.contractorId === parseInt(contractorId)
        );
    }
    
    // Filter by contract if selected
    if (contractId) {
        filteredPersonnel = filteredPersonnel.filter(person => 
            person.contractId === parseInt(contractId)
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredPersonnel = filteredPersonnel.filter(person => 
            person.name.toLowerCase().includes(searchTerm) || 
            person.nik.toLowerCase().includes(searchTerm) ||
            person.position.toLowerCase().includes(searchTerm)
        );
    }
    
    const tbody = document.querySelector('#personnelTable tbody');
    tbody.innerHTML = '';
    
    filteredPersonnel.forEach(person => {
        const contractor = contractors.find(c => c.id === person.contractorId);
        const contract = contracts.find(c => c.id === person.contractId);
        
        const tr = document.createElement('tr');
        
        // Calculate document status
        let documentStatus = 'Lengkap';
        let documentStatusClass = 'status-active';
        
        if (!person.documents.cv || !person.documents.mcu || !person.documents.survival || !person.documents.sika) {
            documentStatus = 'Tidak Lengkap';
            documentStatusClass = 'status-inactive';
        } else if (person.documents.cv.status === 'pending' || 
                  person.documents.mcu.status === 'pending' || 
                  person.documents.survival.status === 'pending' || 
                  person.documents.sika.status === 'pending') {
            documentStatus = 'Pending Verifikasi';
            documentStatusClass = 'status-pending';
        }
        
        tr.innerHTML = `
            <td>${person.name}</td>
            <td>${person.nik}</td>
            <td>${person.position}</td>
            <td>${contractor ? contractor.name : 'Unknown'}</td>
            <td>${contract ? contract.contractNumber : 'Unknown'}</td>
            <td>${formatDate(person.startDate)}</td>
            <td>
                <span class="status-badge ${documentStatusClass}">
                    ${documentStatus}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editPersonnel(${person.id})">
                    <i class="icon">✏️</i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="viewPersonnelDocuments(${person.id})">
                    <i class="icon">📄</i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePersonnel(${person.id})">
                    <i class="icon">🗑️</i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Edit personnel
function editPersonnel(id) {
    const person = personnelData.find(p => p.id === id);
    if (!person) return;
    
    document.getElementById('personnelModalTitle').textContent = 'Edit Personnel';
    document.getElementById('personnelForm').setAttribute('data-id', id);
    
    // Fill in personal info
    document.getElementById('personnelName').value = person.name;
    document.getElementById('personnelNIK').value = person.nik;
    document.getElementById('personnelBirthPlace').value = person.birthPlace;
    document.getElementById('personnelBirthDate').value = person.birthDate;
    document.getElementById('personnelAddress').value = person.address;
    document.getElementById('personnelEmail').value = person.email;
    document.getElementById('personnelPhone').value = person.phone;
    document.getElementById('personnelPosition').value = person.position;
    document.getElementById('personnelExperience').value = person.experience;
    
    // Fill in contract info
    document.getElementById('personnelContractor').value = person.contractorId;
    updateContractDropdown();
    document.getElementById('personnelContract').value = person.contractId;
    document.getElementById('personnelStartDate').value = person.startDate;
    document.getElementById('personnelStatus').value = person.status;
    
    // Fill in document info
    document.getElementById('cvVerified').checked = person.documents.cv && person.documents.cv.status === 'verified';
    
    if (person.documents.mcu) {
        document.getElementById('mcuDate').value = person.documents.mcu.date || '';
        document.getElementById('mcuExpiry').value = person.documents.mcu.expiry || '';
    }
    
    if (person.documents.survival) {
        document.getElementById('survivalDate').value = person.documents.survival.date || '';
        document.getElementById('survivalExpiry').value = person.documents.survival.expiry || '';
    }
    
    if (person.documents.sika) {
        document.getElementById('sikaDate').value = person.documents.sika.date || '';
        document.getElementById('sikaExpiry').value = person.documents.sika.expiry || '';
    }
    
    // Update file names if present
    if (person.documents.cv && person.documents.cv.filename) {
        document.querySelector('#personnelCV').nextElementSibling.nextElementSibling.textContent = person.documents.cv.filename;
    }
    
    if (person.documents.mcu && person.documents.mcu.filename) {
        document.querySelector('#personnelMCU').nextElementSibling.nextElementSibling.textContent = person.documents.mcu.filename;
    }
    
    if (person.documents.survival && person.documents.survival.filename) {
        document.querySelector('#personnelSurvival').nextElementSibling.nextElementSibling.textContent = person.documents.survival.filename;
    }
    
    if (person.documents.sika && person.documents.sika.filename) {
        document.querySelector('#personnelSIKA').nextElementSibling.nextElementSibling.textContent = person.documents.sika.filename;
    }
    
    // Clear and re-add additional documents
    document.getElementById('additionalDocuments').innerHTML = '';
    
    if (person.documents.additional && person.documents.additional.length > 0) {
        person.documents.additional.forEach(doc => {
            const documentItem = document.createElement('div');
            documentItem.className = 'document-item';
            documentItem.innerHTML = `
                <div class="form-row">
                    <div class="form-group col-6">
                        <label class="form-label">Nama Sertifikat</label>
                        <input type="text" class="form-control" name="docName[]" value="${doc.name}" placeholder="Nama sertifikat" required>
                    </div>
                    <div class="form-group col-6">
                        <button type="button" class="btn btn-sm btn-danger mt-4" onclick="removeDocument(this)">
                            <i class="icon">🗑️</i> Hapus
                        </button>
                    </div>
                </div>
                <div class="file-upload-container">
                    <input type="file" class="file-upload" name="docFile[]" accept=".pdf,.jpg,.jpeg,.png">
                    <button type="button" class="btn btn-outline-primary btn-sm file-upload-btn">
                        <i class="icon">📎</i> Pilih File
                    </button>
                    <span class="file-name">${doc.filename || 'Belum ada file'}</span>
                </div>
                <div class="form-row mt-2">
                    <div class="form-group col-6">
                        <label class="small">Tanggal Sertifikat</label>
                        <input type="date" class="form-control form-control-sm" name="docDate[]" value="${doc.date || ''}">
                    </div>
                    <div class="form-group col-6">
                        <label class="small">Berlaku Hingga</label>
                        <input type="date" class="form-control form-control-sm" name="docExpiry[]" value="${doc.expiry || ''}">
                    </div>
                </div>
            `;
            
            document.getElementById('additionalDocuments').appendChild(documentItem);
        });
        
        setupFileUploadButtons();
    }
    
    // Reset form tabs
    document.querySelectorAll('.form-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.form-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.form-tab[data-form-tab="personal-info"]').classList.add('active');
    document.getElementById('personal-info').classList.add('active');
    
    // Update form navigation buttons
    updateFormNavButtons();
    
    document.getElementById('personnelModal').style.display = 'block';
}

// Delete personnel
function deletePersonnel(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus personnel ini?')) return;
    
    // Remove personnel
    personnelData = personnelData.filter(p => p.id !== id);
    
    // Refresh data
    loadPersonnelTable();
}

// View personnel documents
function viewPersonnelDocuments(id) {
    const person = personnelData.find(p => p.id === id);
    if (!person) return;
    
    // In a real system, this would open a modal to view/download documents
    alert(`Detail dokumen untuk ${person.name} (${person.nik}):\n\n` +
          `CV: ${person.documents.cv ? (person.documents.cv.filename || 'Tidak ada') : 'Tidak ada'}\n` +
          `MCU: ${person.documents.mcu ? (person.documents.mcu.filename || 'Tidak ada') : 'Tidak ada'}\n` +
          `Sea Survival/T-Bosiet: ${person.documents.survival ? (person.documents.survival.filename || 'Tidak ada') : 'Tidak ada'}\n` +
          `SIKA: ${person.documents.sika ? (person.documents.sika.filename || 'Tidak ada') : 'Tidak ada'}\n` +
          `${person.documents.additional && person.documents.additional.length > 0 ? 
             'Dokumen Tambahan:\n' + person.documents.additional.map(doc => `- ${doc.name}: ${doc.filename || 'Tidak ada'}`).join('\n') : 
             'Tidak ada dokumen tambahan'}`);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = [
        { element: document.getElementById('contractorModal'), close: closeContractorModal },
        { element: document.getElementById('contractModal'), close: closeContractModal },
        { element: document.getElementById('csmsModal'), close: closeCSMSModal },
        { element: document.getElementById('personnelModal'), close: closePersonnelModal },
        { element: document.getElementById('accountModal'), close: closeAccountModal }
    ];
    
    modals.forEach(modal => {
        if (event.target === modal.element) {
            modal.close();
        }
    });
};
