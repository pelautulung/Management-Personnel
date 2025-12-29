// Applications module for SBTC System
// Handles application submissions, editing, and management

// Initialize the applications module
function initApplications() {
    console.log('Initializing applications module...');
    setupApplicationForms();
    setupRequirementsDisplay();
    setupDocumentUploadHandlers();
}

// Set up application form handlers
function setupApplicationForms() {
    // Contractor form autofill based on current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'contractor') {
        autofillContractorData(currentUser);
    }
    
    // Worker form handlers
    setupWorkerFormHandlers();
    
    // Form submission handler
    setupSubmissionHandlers();
    
    // Add contract field handlers
    addContractFields();
}

// Autofill contractor data for contractor users
function autofillContractorData(user) {
    if (!user.companyDetails) return;
    
    // Get form fields
    const companyNameField = document.querySelector('.form-section input[placeholder="Nama Perusahaan"]') || 
                            document.querySelector('.form-section input[name="company-name"]');
    
    const businessTypeField = document.querySelector('.form-section select[name="business-type"]');
    
    const addressField = document.querySelector('.form-section textarea[placeholder="Alamat"]') || 
                         document.querySelector('.form-section textarea[name="address"]');
    
    const contactPersonField = document.querySelector('.form-section input[placeholder="Kontak Person"]') || 
                              document.querySelector('.form-section input[name="contact-person"]');
    
    const phoneField = document.querySelector('.form-section input[placeholder="No. Telepon"]') || 
                       document.querySelector('.form-section input[name="phone"]');
    
    // Fill in the fields if they exist
    if (companyNameField) companyNameField.value = user.companyDetails.name || '';
    if (addressField) addressField.value = user.companyDetails.address || '';
    if (contactPersonField) contactPersonField.value = user.companyDetails.contact || '';
    if (phoneField) phoneField.value = user.companyDetails.phone || '';
    
    // Handle business type dropdown
    if (businessTypeField && user.companyDetails.business) {
        // Find the option with matching text
        const options = Array.from(businessTypeField.options);
        const matchingOption = options.find(option => 
            option.textContent.toLowerCase() === user.companyDetails.business.toLowerCase()
        );
        
        if (matchingOption) {
            businessTypeField.value = matchingOption.value;
        } else {
            // If no match, add the business type as a new option
            const newOption = document.createElement('option');
            newOption.textContent = user.companyDetails.business;
            newOption.value = user.companyDetails.business.toLowerCase().replace(/\s+/g, '-');
            businessTypeField.appendChild(newOption);
            businessTypeField.value = newOption.value;
        }
    }
}

// Add contract fields to contractor section
function addContractFields() {
    const contractorSection = document.querySelector('.form-section:first-child');
    if (!contractorSection) return;
    
    // Check if contract fields already exist
    if (contractorSection.querySelector('.contract-fields')) return;
    
    // Create contract fields
    const contractFields = document.createElement('div');
    contractFields.className = 'contract-fields';
    contractFields.innerHTML = `
        <h4>Informasi Kontrak</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Nomor Kontrak <span class="required">*</span></label>
                <input type="text" name="contract-number" required>
            </div>
            <div class="form-group">
                <label>Tanggal Mulai Kontrak <span class="required">*</span></label>
                <input type="date" name="contract-start" required>
            </div>
            <div class="form-group">
                <label>Tanggal Berakhir Kontrak <span class="required">*</span></label>
                <input type="date" name="contract-end" required>
            </div>
        </div>
    `;
    
    // Add CSS for contract fields
    const style = document.createElement('style');
    style.textContent = `
        .contract-fields {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .contract-fields h4 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
            color: #333;
        }
    `;
    document.head.appendChild(style);
    
    // Insert before the next section
    contractorSection.appendChild(contractFields);
}

// Set up worker form handlers
function setupWorkerFormHandlers() {
    // Add worker button
    const addWorkerBtn = document.querySelector('.add-btn');
    if (addWorkerBtn) {
        addWorkerBtn.addEventListener('click', addWorkerForm);
    }
    
    // Position select changes
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'workerPosition') {
            updateRequirementsForPosition(e.target);
        }
    });
    
    // Document upload fields
    setupDocumentUploadHandlers();
}

// Add a new worker form
function addWorkerForm() {
    const formSection = document.querySelector('.form-section:nth-child(2)');
    if (!formSection) return;
    
    // Get existing worker forms
    const workerForms = formSection.querySelectorAll('.worker-form');
    const workerCount = workerForms.length;
    
    // Create new worker form
    const newWorkerForm = document.createElement('div');
    newWorkerForm.className = 'worker-form';
    newWorkerForm.dataset.workerId = `worker-${workerCount + 1}`;
    
    newWorkerForm.innerHTML = `
        <div class="worker-header">Pekerja #${workerCount + 1}</div>
        <div class="form-row">
            <div class="form-group">
                <label>Nama Lengkap <span class="required">*</span></label>
                <input type="text" name="worker-name" required>
            </div>
            <div class="form-group">
                <label>NIK <span class="required">*</span></label>
                <input type="text" name="worker-nik" required pattern="[0-9]{16}" title="NIK harus 16 digit angka">
            </div>
            <div class="form-group">
                <label>Tanggal Lahir <span class="required">*</span></label>
                <input type="date" name="worker-birthdate" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Posisi/Jabatan <span class="required">*</span></label>
                <select name="worker-position" class="worker-position" required>
                    <option value="">Pilih Posisi</option>
                    ${window.app.state.jobPositions.map(pos => 
                        `<option value="${pos.id}">${pos.title}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>No. Telepon <span class="required">*</span></label>
                <input type="tel" name="worker-phone" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="worker-email">
            </div>
        </div>
        
        <div class="document-section">
            <h4>Dokumen Pendukung</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>CV <span class="required">*</span></label>
                    <div class="file-input">
                        <label class="file-btn">
                            Choose File
                            <input type="file" name="worker-cv" style="display: none;" accept=".pdf,.doc,.docx">
                        </label>
                        <span class="file-text">No file chosen</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>MCU <span class="required">*</span></label>
                    <div class="file-input">
                        <label class="file-btn">
                            Choose File
                            <input type="file" name="worker-mcu" style="display: none;" accept=".pdf,.jpg,.jpeg,.png">
                        </label>
                        <span class="file-text">No file chosen</span>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Sertifikat/Lisensi</label>
                    <div class="file-input">
                        <label class="file-btn">
                            Choose File
                            <input type="file" name="worker-cert" style="display: none;" accept=".pdf,.jpg,.jpeg,.png" multiple>
                        </label>
                        <span class="file-text">No file chosen</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Training</label>
                    <div class="file-input">
                        <label class="file-btn">
                            Choose File
                            <input type="file" name="worker-training" style="display: none;" accept=".pdf,.jpg,.jpeg,.png" multiple>
                        </label>
                        <span class="file-text">No file chosen</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="requirements-container" style="display: none;">
            <h4>Persyaratan Posisi</h4>
            <div class="requirements-content"></div>
        </div>
        
        <div class="work-experience-section">
            <h4>Pengalaman Kerja</h4>
            <div class="work-experience-container"></div>
            <button type="button" class="add-experience-btn">+ Tambah Pengalaman Kerja</button>
        </div>
        
        <div class="delete-group">
            <button type="button" class="delete-btn">Hapus Pekerja</button>
        </div>
    `;
    
    // Add to form section before form actions
    const formActions = formSection.querySelector('.form-actions');
    formSection.insertBefore(newWorkerForm, formActions);
    
    // Set up document upload handlers for the new form
    setupDocumentUploadHandlers();
    
    // Set up delete handler
    const deleteBtn = newWorkerForm.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('Apakah Anda yakin ingin menghapus data pekerja ini?')) {
                formSection.removeChild(newWorkerForm);
                
                // Renumber remaining worker forms
                formSection.querySelectorAll('.worker-form').forEach((form, index) => {
                    form.querySelector('.worker-header').textContent = `Pekerja #${index + 1}`;
                    form.dataset.workerId = `worker-${index + 1}`;
                });
            }
        });
    }
    
    // Set up add experience handler
    const addExpBtn = newWorkerForm.querySelector('.add-experience-btn');
    if (addExpBtn) {
        addExpBtn.addEventListener('click', function() {
            addWorkExperienceForm(newWorkerForm.querySelector('.work-experience-container'));
        });
    }
    
    // Add initial work experience form
    addWorkExperienceForm(newWorkerForm.querySelector('.work-experience-container'));
    
    // Set up position change handler
    const positionSelect = newWorkerForm.querySelector('.worker-position');
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            updateRequirementsForPosition(this, newWorkerForm);
        });
    }
}

// Add work experience form
function addWorkExperienceForm(container) {
    if (!container) return;
    
    // Create work experience form
    const experienceForm = document.createElement('div');
    experienceForm.className = 'work-history-item';
    
    experienceForm.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Nama Perusahaan <span class="required">*</span></label>
                <input type="text" name="company-name" required>
            </div>
            <div class="form-group">
                <label>Posisi/Jabatan <span class="required">*</span></label>
                <input type="text" name="position" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal Mulai <span class="required">*</span></label>
                <input type="date" name="start-date" required>
            </div>
            <div class="form-group">
                <label>Tanggal Selesai <span class="required">*</span></label>
                <input type="date" name="end-date" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group full-width">
                <label>Deskripsi Pekerjaan</label>
                <textarea name="job-description" rows="3"></textarea>
            </div>
        </div>
        <div class="delete-group">
            <button type="button" class="remove-experience-btn">Hapus Pengalaman</button>
        </div>
    `;
    
    // Add to container
    container.appendChild(experienceForm);
    
    // Set up remove handler
    const removeBtn = experienceForm.querySelector('.remove-experience-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (container.childElementCount > 1) {
                container.removeChild(experienceForm);
            } else {
                window.app.showNotification('Minimal satu pengalaman kerja harus diisi', 'error');
            }
        });
    }
}

// Set up document upload handlers
function setupDocumentUploadHandlers() {
    // File input change handlers
    document.querySelectorAll('input[type="file"]').forEach(input => {
        if (input.hasAttribute('data-listener')) return; // Skip if already has listener
        
        input.setAttribute('data-listener', 'true');
        input.addEventListener('change', function() {
            const fileText = this.parentElement.nextElementSibling;
            if (fileText) {
                if (this.files.length === 0) {
                    fileText.textContent = 'No file chosen';
                } else if (this.files.length === 1) {
                    fileText.textContent = this.files[0].name;
                } else {
                    fileText.textContent = `${this.files.length} files selected`;
                }
            }
        });
    });
}

// Display requirements for selected position
function updateRequirementsForPosition(selectElement, containerElement) {
    const positionId = selectElement.value;
    if (!positionId) return;
    
    // Find container element if not provided
    if (!containerElement) {
        containerElement = selectElement.closest('.worker-form');
    }
    
    // Get requirements container
    const requirementsContainer = containerElement.querySelector('.requirements-container');
    const requirementsContent = containerElement.querySelector('.requirements-content');
    
    if (!requirementsContainer || !requirementsContent) return;
    
    // Find position
    const position = window.app.state.jobPositions.find(pos => pos.id === positionId);
    if (!position) {
        requirementsContainer.style.display = 'none';
        return;
    }
    
    // Update requirements display
    requirementsContent.innerHTML = `
        <div class="requirements-info">
            <h4>${position.title}</h4>
            <div class="requirement-details">
                <p><strong>Deskripsi:</strong> ${position.description}</p>
                <p><strong>Pengalaman Minimum:</strong> ${position.requirements.minExperience} tahun</p>
                <p><strong>Sertifikasi yang Diperlukan:</strong></p>
                <ul>
                    ${position.requirements.requiredCertifications.map(cert => 
                        `<li>${cert}</li>`
                    ).join('')}
                </ul>
                <p><strong>Persyaratan Tambahan:</strong></p>
                <ul>
                    ${position.requirements.additionalRequirements.map(req => 
                        `<li>${req}</li>`
                    ).join('')}
                </ul>
                <p><strong>Persyaratan Kesehatan:</strong></p>
                <ul>
                    ${position.requirements.healthRequirements.map(req => 
                        `<li>${req}</li>`
                    ).join('')}
                </ul>
            </div>
        </div>
    `;
    
    requirementsContainer.style.display = 'block';
}

// Set up form submission handlers
function setupSubmissionHandlers() {
    // Draft button
    const draftBtn = document.querySelector('.draft-btn');
    if (draftBtn) {
        draftBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveApplicationDraft();
        });
    }
    
    // Submit button
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitApplication();
        });
    }
}

// Display job position requirements
function setupRequirementsDisplay() {
    // Business type options
    const businessTypeSelect = document.querySelector('select[name="business-type"]');
    if (businessTypeSelect && businessTypeSelect.options.length <= 1) {
        // Add business type options
        const businessTypes = [
            'Konstruksi', 'Elektrikal', 'Mekanikal', 'Instrumentasi',
            'Sipil', 'Konsultan', 'Fabrikasi', 'Inspeksi',
            'Jasa Umum', 'Supplier', 'Lainnya'
        ];
        
        businessTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.toLowerCase().replace(/\s+/g, '-');
            option.textContent = type;
            businessTypeSelect.appendChild(option);
        });
    }
}

// Save application as draft
function saveApplicationDraft() {
    try {
        // Validate minimum required fields
        const contractorName = document.querySelector('input[name="company-name"]').value;
        if (!contractorName) {
            window.app.showNotification('Nama perusahaan harus diisi', 'error');
            return;
        }
        
        // Get draft data
        const draftData = collectApplicationData();
        
        // Save as draft
        draftData.isDraft = true;
        
        // Generate ID if not exists
        if (!draftData.id) {
            draftData.id = window.app.generateId('APP');
        }
        
        // Store in localStorage
        const drafts = JSON.parse(localStorage.getItem('applicationDrafts') || '[]');
        
        // Check if draft already exists
        const existingIndex = drafts.findIndex(draft => draft.id === draftData.id);
        if (existingIndex >= 0) {
            drafts[existingIndex] = draftData;
        } else {
            drafts.push(draftData);
        }
        
        localStorage.setItem('applicationDrafts', JSON.stringify(drafts));
        
        window.app.showNotification('Pengajuan berhasil disimpan sebagai draft', 'info');
    } catch (error) {
        console.error('Error saving draft:', error);
        window.app.showNotification('Terjadi kesalahan saat menyimpan draft', 'error');
    }
}

// Submit application
function submitApplication() {
    try {
        // Validate all required fields
        if (!validateApplicationForm()) {
            window.app.showNotification('Harap lengkapi semua field yang wajib diisi', 'error');
            return;
        }
        
        // Collect application data
        const applicationData = collectApplicationData();
        
        // Set submission date and status
        applicationData.submissionDate = new Date().toISOString();
        applicationData.status = 'Diajukan';
        applicationData.isDraft = false;
        
        // Generate ID if not exists
        if (!applicationData.id) {
            applicationData.id = window.app.generateId('APP');
        }
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Add status history
        if (!applicationData.statusHistory) {
            applicationData.statusHistory = [];
        }
        
        applicationData.statusHistory.push({
            status: 'Diajukan',
            timestamp: applicationData.submissionDate,
            userId: currentUser.id,
            notes: 'Pengajuan awal'
        });
        
        // Add to global state
        window.app.state.applications.push(applicationData);
        
        // Update contractor in state if needed
        updateContractorData(applicationData.contractor);
        
        // Update workers in state
        applicationData.workers.forEach(worker => {
            updateWorkerData(worker);
        });
        
        // Notify data change to update all related views
        window.app.notifyDataChange('applications');
        
        // Show success notification
        window.app.showNotification('Pengajuan berhasil disimpan dan diajukan', 'info');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.app.changeView('dashboard');
        }, 1500);
    } catch (error) {
        console.error('Error submitting application:', error);
        window.app.showNotification('Terjadi kesalahan saat mengajukan aplikasi', 'error');
    }
}

// Validate application form
function validateApplicationForm() {
    // Check contractor section
    const contractorName = document.querySelector('input[name="company-name"]');
    const businessType = document.querySelector('select[name="business-type"]');
    const address = document.querySelector('textarea[name="address"]');
    const contactPerson = document.querySelector('input[name="contact-person"]');
    const phone = document.querySelector('input[name="phone"]');
    const contractNumber = document.querySelector('input[name="contract-number"]');
    const contractStart = document.querySelector('input[name="contract-start"]');
    const contractEnd = document.querySelector('input[name="contract-end"]');
    
    if (!contractorName || !contractorName.value ||
        !businessType || !businessType.value ||
        !address || !address.value ||
        !contactPerson || !contactPerson.value ||
        !phone || !phone.value ||
        !contractNumber || !contractNumber.value ||
        !contractStart || !contractStart.value ||
        !contractEnd || !contractEnd.value) {
        
        // Highlight empty required fields
        document.querySelectorAll('.form-section:first-child input[required], .form-section:first-child select[required], .form-section:first-child textarea[required]').forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                field.addEventListener('input', function() {
                    this.classList.remove('error');
                }, { once: true });
            }
        });
        
        return false;
    }
    
    // Check worker forms
    const workerForms = document.querySelectorAll('.worker-form');
    if (workerForms.length === 0) {
        window.app.showNotification('Minimal satu pekerja harus diisi', 'error');
        return false;
    }
    
    let workersValid = true;
    workerForms.forEach(form => {
        const nameField = form.querySelector('input[name="worker-name"]');
        const nikField = form.querySelector('input[name="worker-nik"]');
        const birthField = form.querySelector('input[name="worker-birthdate"]');
        const positionField = form.querySelector('select[name="worker-position"]');
        const phoneField = form.querySelector('input[name="worker-phone"]');
        const cvField = form.querySelector('input[name="worker-cv"]');
        const mcuField = form.querySelector('input[name="worker-mcu"]');
        
        if (!nameField || !nameField.value ||
            !nikField || !nikField.value ||
            !birthField || !birthField.value ||
            !positionField || !positionField.value ||
            !phoneField || !phoneField.value ||
            !cvField || cvField.files.length === 0 ||
            !mcuField || mcuField.files.length === 0) {
            
            // Highlight empty required fields
            form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                if (field.type === 'file') {
                    if (field.files.length === 0) {
                        field.parentElement.classList.add('error');
                        field.addEventListener('change', function() {
                            this.parentElement.classList.remove('error');
                        }, { once: true });
                    }
                } else if (!field.value) {
                    field.classList.add('error');
                    field.addEventListener('input', function() {
                        this.classList.remove('error');
                    }, { once: true });
                }
            });
            
            workersValid = false;
        }
        
        // Check work experience
        const experienceForms = form.querySelectorAll('.work-history-item');
        experienceForms.forEach(expForm => {
            const companyField = expForm.querySelector('input[name="company-name"]');
            const positionField = expForm.querySelector('input[name="position"]');
            const startField = expForm.querySelector('input[name="start-date"]');
            const endField = expForm.querySelector('input[name="end-date"]');
            
            if (!companyField || !companyField.value ||
                !positionField || !positionField.value ||
                !startField || !startField.value ||
                !endField || !endField.value) {
                
                // Highlight empty required fields
                expForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                    if (!field.value) {
                        field.classList.add('error');
                        field.addEventListener('input', function() {
                            this.classList.remove('error');
                        }, { once: true });
                    }
                });
                
                workersValid = false;
            }
        });
    });
    
    return workersValid;
}

// Collect application form data
function collectApplicationData() {
    const applicationData = {
        id: window.app.generateId('APP'),
        contractor: {
            name: document.querySelector('input[name="company-name"]').value,
            business: document.querySelector('select[name="business-type"]').value,
            address: document.querySelector('textarea[name="address"]').value,
            contactPerson: document.querySelector('input[name="contact-person"]').value,
            phone: document.querySelector('input[name="phone"]').value,
            contractNumber: document.querySelector('input[name="contract-number"]').value,
            contractStart: document.querySelector('input[name="contract-start"]').value,
            contractEnd: document.querySelector('input[name="contract-end"]').value
        },
        workers: [],
        statusHistory: [],
        notes: ''
    };
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    applicationData.contractorId = currentUser.id;
    
    // Collect worker data
    const workerForms = document.querySelectorAll('.worker-form');
    workerForms.forEach(form => {
        const workerId = form.dataset.workerId;
        
        const workerData = {
            id: workerId,
            name: form.querySelector('input[name="worker-name"]').value,
            nik: form.querySelector('input[name="worker-nik"]').value,
            birthDate: form.querySelector('input[name="worker-birthdate"]').value,
            position: form.querySelector('select[name="worker-position"]').value,
            phone: form.querySelector('input[name="worker-phone"]').value,
            email: form.querySelector('input[name="worker-email"]').value,
            documents: {
                cv: form.querySelector('input[name="worker-cv"]').files[0]?.name || '',
                mcu: form.querySelector('input[name="worker-mcu"]').files[0]?.name || '',
                certifications: Array.from(form.querySelector('input[name="worker-cert"]').files || []).map(file => file.name),
                trainings: Array.from(form.querySelector('input[name="worker-training"]').files || []).map(file => file.name)
            },
            workExperience: []
        };
        
        // Collect work experience
        const experienceForms = form.querySelectorAll('.work-history-item');
        experienceForms.forEach(expForm => {
            workerData.workExperience.push({
                company: expForm.querySelector('input[name="company-name"]').value,
                position: expForm.querySelector('input[name="position"]').value,
                startDate: expForm.querySelector('input[name="start-date"]').value,
                endDate: expForm.querySelector('input[name="end-date"]').value,
                description: expForm.querySelector('textarea[name="job-description"]').value
            });
        });
        
        applicationData.workers.push(workerData);
    });
    
    return applicationData;
}

// Update contractor data in state
function updateContractorData(contractorData) {
    // Check if contractor already exists
    const existingIndex = window.app.state.contractors.findIndex(c => 
        c.name.toLowerCase() === contractorData.name.toLowerCase()
    );
    
    if (existingIndex >= 0) {
        // Update existing
        const contractor = window.app.state.contractors[existingIndex];
        contractor.business = contractorData.business;
        contractor.address = contractorData.address;
        contractor.contactPerson = contractorData.contactPerson;
        contractor.phone = contractorData.phone;
        contractor.contractNumber = contractorData.contractNumber;
        contractor.contractStart = contractorData.contractStart;
        contractor.contractEnd = contractorData.contractEnd;
    } else {
        // Add new
        const newContractor = {
            id: window.app.generateId('C'),
            name: contractorData.name,
            business: contractorData.business,
            address: contractorData.address,
            contactPerson: contractorData.contactPerson,
            phone: contractorData.phone,
            contractNumber: contractorData.contractNumber,
            contractStart: contractorData.contractStart,
            contractEnd: contractorData.contractEnd
        };
        
        window.app.state.contractors.push(newContractor);
    }
}

// Update worker data in state
function updateWorkerData(workerData) {
    // Check if worker already exists by NIK
    const existingIndex = window.app.state.workers.findIndex(w => 
        w.nik === workerData.nik
    );
    
    if (existingIndex >= 0) {
        // Update existing
        const worker = window.app.state.workers[existingIndex];
        worker.name = workerData.name;
        worker.birthDate = workerData.birthDate;
        worker.position = workerData.position;
        worker.phone = workerData.phone;
        worker.email = workerData.email;
        worker.documents = workerData.documents;
        worker.workExperience = workerData.workExperience;
    } else {
        // Add new
        const newWorker = {
            id: window.app.generateId('W'),
            name: workerData.name,
            nik: workerData.nik,
            birthDate: workerData.birthDate,
            position: workerData.position,
            phone: workerData.phone,
            email: workerData.email,
            documents: workerData.documents,
            workExperience: workerData.workExperience
        };
        
        window.app.state.workers.push(newWorker);
    }
}

// Populate contractor select dropdown
function populateContractorSelect() {
    const contractorSelect = document.querySelector('select[name="contractor-select"]');
    if (!contractorSelect) return;
    
    // Clear existing options
    contractorSelect.innerHTML = '<option value="">Pilih Kontraktor</option>';
    
    // Add options for each contractor
    window.app.state.contractors.forEach(contractor => {
        const option = document.createElement('option');
        option.value = contractor.id;
        option.textContent = contractor.name;
        contractorSelect.appendChild(option);
    });
}

// Load job positions
function loadJobPositions() {
    const positionSelects = document.querySelectorAll('select[name="worker-position"]');
    if (positionSelects.length === 0) return;
    
    // Clear and populate each select
    positionSelects.forEach(select => {
        // Keep the placeholder option
        select.innerHTML = '<option value="">Pilih Posisi</option>';
        
        // Add options for each position
        window.app.state.jobPositions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.id;
            option.textContent = position.title;
            select.appendChild(option);
        });
    });
}