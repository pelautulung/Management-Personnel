// Requirements module for SBTC System
// Handles job position requirements management

// Initialize the requirements module
function initRequirements() {
    console.log('Initializing requirements module...');
    loadJobPositions();
}

// Load job positions and requirements
function loadJobPositions() {
    // Only superadmin and admin can manage requirements
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') {
        return;
    }
    
    // Check if requirements section exists, if not create it
    let requirementsSection = document.querySelector('.requirements');
    if (!requirementsSection) {
        createRequirementsSection();
    }
}

// Create requirements management section
function createRequirementsSection() {
    // Check if the main element exists
    const main = document.querySelector('main');
    if (!main) return;
    
    // Create requirements section
    const requirementsSection = document.createElement('section');
    requirementsSection.className = 'requirements';
    requirementsSection.style.display = 'none';
    
    requirementsSection.innerHTML = `
        <div class="section-header">
            <h1>Manajemen Persyaratan Posisi</h1>
            <div class="filter-controls">
                <button class="add-position-btn">+ Tambah Posisi Baru</button>
                <button class="refresh-btn" id="refreshRequirements">
                    <span>Refresh</span>
                </button>
            </div>
        </div>

        <div class="positions-container">
            <div class="positions-list">
                <table class="data-table" id="positionsTable">
                    <thead>
                        <tr>
                            <th>POSISI</th>
                            <th>DESKRIPSI</th>
                            <th>PENGALAMAN MIN.</th>
                            <th>SERTIFIKASI</th>
                            <th>AKSI</th>
                        </tr>
                    </thead>
                    <tbody id="positionsTableBody">
                        <!-- Will be populated by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="positionModal" class="modal">
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detail Posisi</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="positionForm">
                            <input type="hidden" id="positionId">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nama Posisi <span class="required">*</span></label>
                                    <input type="text" id="positionTitle" required>
                                </div>
                                <div class="form-group">
                                    <label>Pengalaman Minimum (tahun) <span class="required">*</span></label>
                                    <input type="number" id="positionExperience" min="0" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label>Deskripsi <span class="required">*</span></label>
                                    <textarea id="positionDescription" rows="3" required></textarea>
                                </div>
                            </div>
                            
                            <h4>Sertifikasi yang Dibutuhkan</h4>
                            <div id="certificationsContainer">
                                <!-- Will be populated dynamically -->
                                <div class="cert-input-group">
                                    <input type="text" class="certification-input" placeholder="Nama Sertifikasi">
                                    <button type="button" class="remove-cert-btn">−</button>
                                </div>
                            </div>
                            <button type="button" class="add-cert-btn">+ Tambah Sertifikasi</button>
                            
                            <h4>Persyaratan Tambahan</h4>
                            <div id="additionalReqContainer">
                                <!-- Will be populated dynamically -->
                                <div class="req-input-group">
                                    <input type="text" class="requirement-input" placeholder="Persyaratan Tambahan">
                                    <button type="button" class="remove-req-btn">−</button>
                                </div>
                            </div>
                            <button type="button" class="add-req-btn">+ Tambah Persyaratan</button>
                            
                            <h4>Persyaratan Kesehatan</h4>
                            <div id="healthReqContainer">
                                <!-- Will be populated dynamically -->
                                <div class="health-input-group">
                                    <input type="text" class="health-input" placeholder="Persyaratan Kesehatan">
                                    <button type="button" class="remove-health-btn">−</button>
                                </div>
                            </div>
                            <button type="button" class="add-health-btn">+ Tambah Persyaratan Kesehatan</button>
                            
                            <div class="form-actions">
                                <button type="button" class="cancel-btn">Batal</button>
                                <button type="submit" class="save-btn">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to main element
    main.appendChild(requirementsSection);
    
    // Add event listeners
    const refreshBtn = requirementsSection.querySelector('#refreshRequirements');
    const addPositionBtn = requirementsSection.querySelector('.add-position-btn');
    const positionModal = requirementsSection.querySelector('#positionModal');
    const closeModalBtn = positionModal.querySelector('.close-modal');
    const cancelBtn = positionModal.querySelector('.cancel-btn');
    const positionForm = positionModal.querySelector('#positionForm');
    
    // Add cert/req buttons
    const addCertBtn = positionModal.querySelector('.add-cert-btn');
    const addReqBtn = positionModal.querySelector('.add-req-btn');
    const addHealthBtn = positionModal.querySelector('.add-health-btn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('refreshing');
            populatePositionsTable();
            
            setTimeout(() => {
                this.classList.remove('refreshing');
                window.app.showNotification('Data telah diperbarui', 'info');
            }, 800);
        });
    }
    
    if (addPositionBtn) {
        addPositionBtn.addEventListener('click', function() {
            openPositionModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            positionModal.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            positionModal.style.display = 'none';
        });
    }
    
    if (positionForm) {
        positionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePosition();
        });
    }
    
    if (addCertBtn) {
        addCertBtn.addEventListener('click', function() {
            addCertificationField();
        });
    }
    
    if (addReqBtn) {
        addReqBtn.addEventListener('click', function() {
            addRequirementField();
        });
    }
    
    if (addHealthBtn) {
        addHealthBtn.addEventListener('click', function() {
            addHealthRequirementField();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === positionModal.querySelector('.modal-overlay')) {
            positionModal.style.display = 'none';
        }
    });
    
    // Add remove button handlers (delegated)
    positionModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-cert-btn')) {
            const container = document.getElementById('certificationsContainer');
            if (container.children.length > 1) {
                container.removeChild(e.target.parentNode);
            }
        } else if (e.target.classList.contains('remove-req-btn')) {
            const container = document.getElementById('additionalReqContainer');
            if (container.children.length > 1) {
                container.removeChild(e.target.parentNode);
            }
        } else if (e.target.classList.contains('remove-health-btn')) {
            const container = document.getElementById('healthReqContainer');
            if (container.children.length > 1) {
                container.removeChild(e.target.parentNode);
            }
        }
    });
    
    // Populate table
    populatePositionsTable();
}

// Populate positions table
function populatePositionsTable() {
    const tableBody = document.getElementById('positionsTableBody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Get positions
    const positions = window.app.state.jobPositions;
    
    if (positions.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">Tidak ada posisi yang ditemukan</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add rows for each position
    positions.forEach((position, index) => {
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
        
        row.innerHTML = `
            <td>
                <div class="position-title">${position.title}</div>
            </td>
            <td>${position.description}</td>
            <td>${position.requirements.minExperience} tahun</td>
            <td>${position.requirements.requiredCertifications.join(', ')}</td>
            <td>
                <button class="edit-btn small" data-id="${position.id}">Edit</button>
                <button class="delete-btn small" data-id="${position.id}">Hapus</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const positionId = this.getAttribute('data-id');
            editPosition(positionId);
        });
    });
    
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const positionId = this.getAttribute('data-id');
            deletePosition(positionId);
        });
    });
}

// Open position modal for new position
function openPositionModal() {
    // Reset form
    document.getElementById('positionId').value = '';
    document.getElementById('positionTitle').value = '';
    document.getElementById('positionDescription').value = '';
    document.getElementById('positionExperience').value = '1';
    
    // Clear existing fields
    document.getElementById('certificationsContainer').innerHTML = `
        <div class="cert-input-group">
            <input type="text" class="certification-input" placeholder="Nama Sertifikasi">
            <button type="button" class="remove-cert-btn">−</button>
        </div>
    `;
    
    document.getElementById('additionalReqContainer').innerHTML = `
        <div class="req-input-group">
            <input type="text" class="requirement-input" placeholder="Persyaratan Tambahan">
            <button type="button" class="remove-req-btn">−</button>
        </div>
    `;
    
    document.getElementById('healthReqContainer').innerHTML = `
        <div class="health-input-group">
            <input type="text" class="health-input" placeholder="Persyaratan Kesehatan">
            <button type="button" class="remove-health-btn">−</button>
        </div>
    `;
    
    // Show modal
    document.getElementById('positionModal').style.display = 'block';
}

// Edit existing position
function editPosition(positionId) {
    // Find position
    const position = window.app.state.jobPositions.find(p => p.id === positionId);
    if (!position) {
        window.app.showNotification('Posisi tidak ditemukan', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('positionId').value = position.id;
    document.getElementById('positionTitle').value = position.title;
    document.getElementById('positionDescription').value = position.description;
    document.getElementById('positionExperience').value = position.requirements.minExperience;
    
    // Fill certifications
    const certsContainer = document.getElementById('certificationsContainer');
    certsContainer.innerHTML = '';
    
    position.requirements.requiredCertifications.forEach(cert => {
        const certGroup = document.createElement('div');
        certGroup.className = 'cert-input-group';
        certGroup.innerHTML = `
            <input type="text" class="certification-input" placeholder="Nama Sertifikasi" value="${cert}">
            <button type="button" class="remove-cert-btn">−</button>
        `;
        certsContainer.appendChild(certGroup);
    });
    
    // If no certifications, add an empty field
    if (position.requirements.requiredCertifications.length === 0) {
        addCertificationField();
    }
    
    // Fill additional requirements
    const reqsContainer = document.getElementById('additionalReqContainer');
    reqsContainer.innerHTML = '';
    
    position.requirements.additionalRequirements.forEach(req => {
        const reqGroup = document.createElement('div');
        reqGroup.className = 'req-input-group';
        reqGroup.innerHTML = `
            <input type="text" class="requirement-input" placeholder="Persyaratan Tambahan" value="${req}">
            <button type="button" class="remove-req-btn">−</button>
        `;
        reqsContainer.appendChild(reqGroup);
    });
    
    // If no additional requirements, add an empty field
    if (position.requirements.additionalRequirements.length === 0) {
        addRequirementField();
    }
    
    // Fill health requirements
    const healthContainer = document.getElementById('healthReqContainer');
    healthContainer.innerHTML = '';
    
    position.requirements.healthRequirements.forEach(req => {
        const healthGroup = document.createElement('div');
        healthGroup.className = 'health-input-group';
        healthGroup.innerHTML = `
            <input type="text" class="health-input" placeholder="Persyaratan Kesehatan" value="${req}">
            <button type="button" class="remove-health-btn">−</button>
        `;
        healthContainer.appendChild(healthGroup);
    });
    
    // If no health requirements, add an empty field
    if (position.requirements.healthRequirements.length === 0) {
        addHealthRequirementField();
    }
    
    // Show modal
    document.getElementById('positionModal').style.display = 'block';
}

// Add certification field
function addCertificationField() {
    const container = document.getElementById('certificationsContainer');
    const certGroup = document.createElement('div');
    certGroup.className = 'cert-input-group';
    certGroup.innerHTML = `
        <input type="text" class="certification-input" placeholder="Nama Sertifikasi">
        <button type="button" class="remove-cert-btn">−</button>
    `;
    container.appendChild(certGroup);
}

// Add requirement field
function addRequirementField() {
    const container = document.getElementById('additionalReqContainer');
    const reqGroup = document.createElement('div');
    reqGroup.className = 'req-input-group';
    reqGroup.innerHTML = `
        <input type="text" class="requirement-input" placeholder="Persyaratan Tambahan">
        <button type="button" class="remove-req-btn">−</button>
    `;
    container.appendChild(reqGroup);
}

// Add health requirement field
function addHealthRequirementField() {
    const container = document.getElementById('healthReqContainer');
    const healthGroup = document.createElement('div');
    healthGroup.className = 'health-input-group';
    healthGroup.innerHTML = `
        <input type="text" class="health-input" placeholder="Persyaratan Kesehatan">
        <button type="button" class="remove-health-btn">−</button>
    `;
    container.appendChild(healthGroup);
}

// Save position
function savePosition() {
    try {
        // Get form values
        const positionId = document.getElementById('positionId').value;
        const title = document.getElementById('positionTitle').value;
        const description = document.getElementById('positionDescription').value;
        const minExperience = parseInt(document.getElementById('positionExperience').value);
        
        // Validate required fields
        if (!title || !description || isNaN(minExperience)) {
            window.app.showNotification('Harap lengkapi semua field yang wajib diisi', 'error');
            return;
        }
        
        // Get certifications
        const certInputs = document.querySelectorAll('.certification-input');
        const requiredCertifications = Array.from(certInputs)
            .map(input => input.value.trim())
            .filter(value => value);
        
        // Get additional requirements
        const reqInputs = document.querySelectorAll('.requirement-input');
        const additionalRequirements = Array.from(reqInputs)
            .map(input => input.value.trim())
            .filter(value => value);
        
        // Get health requirements
        const healthInputs = document.querySelectorAll('.health-input');
        const healthRequirements = Array.from(healthInputs)
            .map(input => input.value.trim())
            .filter(value => value);
        
        // Create position object
        const position = {
            title,
            description,
            requirements: {
                minExperience,
                requiredCertifications,
                additionalRequirements,
                healthRequirements
            }
        };
        
        // Check if editing or adding new
        if (positionId) {
            // Update existing position
            const index = window.app.state.jobPositions.findIndex(p => p.id === positionId);
            if (index !== -1) {
                position.id = positionId;
                window.app.state.jobPositions[index] = position;
                window.app.showNotification('Posisi berhasil diperbarui', 'info');
            }
        } else {
            // Add new position
            position.id = window.app.generateId('POS');
            window.app.state.jobPositions.push(position);
            window.app.showNotification('Posisi baru berhasil ditambahkan', 'info');
        }
        
        // Close modal
        document.getElementById('positionModal').style.display = 'none';
        
        // Refresh table
        populatePositionsTable();
    } catch (error) {
        console.error('Error saving position:', error);
        window.app.showNotification('Terjadi kesalahan saat menyimpan posisi', 'error');
    }
}

// Delete position
function deletePosition(positionId) {
    // Confirm deletion
    if (!confirm('Apakah Anda yakin ingin menghapus posisi ini?')) {
        return;
    }
    
    // Find position index
    const index = window.app.state.jobPositions.findIndex(p => p.id === positionId);
    if (index === -1) {
        window.app.showNotification('Posisi tidak ditemukan', 'error');
        return;
    }
    
    // Remove position
    window.app.state.jobPositions.splice(index, 1);
    
    // Refresh table
    populatePositionsTable();
    
    window.app.showNotification('Posisi berhasil dihapus', 'info');
}