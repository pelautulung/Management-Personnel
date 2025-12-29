// Data Management functions for SBTC System

document.addEventListener('DOMContentLoaded', function() {
    // Setup drag and drop functionality
    setupDragAndDrop();
    
    // Check for authentication
    checkAuthentication();
});

// Check if user is authenticated before allowing data management
function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (!currentUser || !sessionToken) {
        window.location.href = 'login.html';
        return;
    }
    
    // Only allow admin/superadmin to access this page
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        showStatusMessage('Anda tidak memiliki akses untuk halaman ini. Hanya Admin dan Superadmin yang diizinkan.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }
}

// Setup drag and drop functionality for file upload
function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-area');
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFiles(files);
        }
    });
}

// Show import section and hide others
function showImportSection() {
    document.getElementById('importSection').style.display = 'block';
    document.getElementById('dataPreview').style.display = 'none';
    document.getElementById('mappingSection').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    
    // Reset selected data type
    document.querySelectorAll('.data-type-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Select data type for import
function selectDataType(type) {
    document.querySelectorAll('.data-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelector(`.data-type-card[data-type="${type}"]`).classList.add('selected');
}

// Handle file upload from input change
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length) {
        handleFiles(files);
    }
}

// Process uploaded files
function handleFiles(files) {
    const file = files[0]; // Only handle the first file
    
    // Check if a data type is selected
    const selectedType = document.querySelector('.data-type-card.selected');
    if (!selectedType) {
        showStatusMessage('Silakan pilih jenis data terlebih dahulu', 'warning');
        return;
    }
    
    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.some(type => file.type === type || file.name.endsWith(type))) {
        showStatusMessage('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv', 'error');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showStatusMessage('Ukuran file terlalu besar. Maksimum 10MB', 'error');
        return;
    }
    
    showStatusMessage('Memproses file...', 'warning');
    
    // Parse file based on type
    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        parseCSV(file);
    } else {
        parseExcel(file);
    }
}

// Parse CSV file
function parseCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        
        // Extract headers (first line)
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        // Extract data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            // Handle quoted fields with commas inside
            const row = [];
            let startIdx = 0;
            let inQuote = false;
            
            for (let j = 0; j < line.length; j++) {
                if (line[j] === '"') {
                    inQuote = !inQuote;
                } else if (line[j] === ',' && !inQuote) {
                    row.push(line.substring(startIdx, j).trim().replace(/"/g, ''));
                    startIdx = j + 1;
                }
            }
            
            // Add the last field
            row.push(line.substring(startIdx).trim().replace(/"/g, ''));
            
            // Create object from headers and row values
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            
            data.push(obj);
        }
        
        // Display preview and mapping
        displayDataPreview(headers, data);
    };
    
    reader.onerror = function() {
        showStatusMessage('Error membaca file CSV', 'error');
    };
    
    reader.readAsText(file);
}

// Parse Excel file
function parseExcel(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract headers (first row)
        const headers = jsonData[0];
        
        // Extract data rows
        const rows = jsonData.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] !== undefined ? row[index] : '';
            });
            return obj;
        }).filter(row => Object.values(row).some(val => val !== '')); // Filter out empty rows
        
        // Display preview and mapping
        displayDataPreview(headers, rows);
    };
    
    reader.onerror = function() {
        showStatusMessage('Error membaca file Excel', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}

// Display data preview
function displayDataPreview(headers, data) {
    // Show preview section
    document.getElementById('dataPreview').style.display = 'block';
    document.getElementById('recordCount').textContent = `${data.length} records`;
    
    // Build table for preview
    const previewTable = document.getElementById('previewTable');
    let tableHTML = '<table><thead><tr>';
    
    // Add headers
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    
    tableHTML += '</tr></thead><tbody>';
    
    // Add data rows (max 10 for preview)
    const maxRows = Math.min(data.length, 10);
    for (let i = 0; i < maxRows; i++) {
        tableHTML += '<tr>';
        headers.forEach(header => {
            tableHTML += `<td>${data[i][header] || ''}</td>`;
        });
        tableHTML += '</tr>';
    }
    
    tableHTML += '</tbody></table>';
    previewTable.innerHTML = tableHTML;
    
    // Show mapping section
    document.getElementById('mappingSection').style.display = 'block';
    document.getElementById('actionButtons').style.display = 'block';
    
    // Create mapping UI
    createMappingUI(headers, data);
    
    // Update status
    showStatusMessage('File berhasil dibaca. Silakan sesuaikan mapping kolom.', 'success');
}

// Create mapping UI between file headers and system fields
function createMappingUI(headers, data) {
    const mappingContent = document.getElementById('mappingContent');
    mappingContent.innerHTML = '';
    
    // Get required fields based on selected data type
    const selectedType = document.querySelector('.data-type-card.selected').getAttribute('data-type');
    const requiredFields = getRequiredFields(selectedType);
    
    // Create mapping fields
    requiredFields.forEach(field => {
        const mappingRow = document.createElement('div');
        mappingRow.className = 'field-mapping';
        
        const label = document.createElement('label');
        label.textContent = `${field.label}${field.required ? ' *' : ''}:`;
        
        const select = document.createElement('select');
        select.setAttribute('data-field', field.name);
        select.innerHTML = '<option value="">-- Pilih Kolom --</option>';
        
        // Add all headers as options
        headers.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            
            // Try to auto-match headers to fields based on name similarity
            if (header.toLowerCase().includes(field.name.toLowerCase()) || 
                field.name.toLowerCase().includes(header.toLowerCase()) ||
                header.toLowerCase().includes(field.aliases?.join(' ').toLowerCase() || '')) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });
        
        mappingRow.appendChild(label);
        mappingRow.appendChild(select);
        mappingContent.appendChild(mappingRow);
    });
    
    // Store data temporarily for processing
    window.tempImportData = {
        headers: headers,
        data: data,
        type: selectedType
    };
}

// Get required fields for each data type
function getRequiredFields(type) {
    switch (type) {
        case 'applications':
            return [
                { name: 'id', label: 'ID Pengajuan', required: true, aliases: ['app_id', 'application_id', 'nomor_pengajuan'] },
                { name: 'contractorId', label: 'ID Kontraktor', required: true, aliases: ['contractor_id', 'id_kontraktor', 'company_id'] },
                { name: 'workerId', label: 'ID Pekerja', required: true, aliases: ['worker_id', 'id_pekerja', 'personnel_id'] },
                { name: 'position', label: 'Posisi', required: true, aliases: ['job_position', 'jabatan'] },
                { name: 'submissionDate', label: 'Tanggal Pengajuan', required: true, aliases: ['submission_date', 'tanggal', 'date'] },
                { name: 'status', label: 'Status', required: true, aliases: ['application_status', 'status_pengajuan'] },
                { name: 'notes', label: 'Catatan', required: false, aliases: ['notes', 'keterangan', 'remarks'] }
            ];
        case 'contractors':
            return [
                { name: 'id', label: 'ID Kontraktor', required: true, aliases: ['contractor_id', 'company_id'] },
                { name: 'name', label: 'Nama Perusahaan', required: true, aliases: ['company_name', 'nama_perusahaan', 'contractor_name'] },
                { name: 'business', label: 'Jenis Usaha', required: true, aliases: ['business_type', 'jenis_usaha', 'category'] },
                { name: 'address', label: 'Alamat', required: true, aliases: ['company_address', 'alamat'] },
                { name: 'contactPerson', label: 'Contact Person', required: true, aliases: ['contact', 'cp', 'pic'] },
                { name: 'phone', label: 'Telepon', required: false, aliases: ['phone_number', 'telepon', 'contact_number'] },
                { name: 'email', label: 'Email', required: false, aliases: ['contact_email', 'email_perusahaan'] },
                { name: 'contractNumber', label: 'Nomor Kontrak', required: false, aliases: ['contract_number', 'no_kontrak'] },
                { name: 'contractStart', label: 'Tanggal Mulai Kontrak', required: false, aliases: ['contract_start', 'start_date'] },
                { name: 'contractEnd', label: 'Tanggal Akhir Kontrak', required: false, aliases: ['contract_end', 'end_date'] }
            ];
        case 'personnel':
            return [
                { name: 'id', label: 'ID Personnel', required: true, aliases: ['worker_id', 'personnel_id', 'id_pekerja'] },
                { name: 'contractorId', label: 'ID Kontraktor', required: true, aliases: ['contractor_id', 'company_id', 'id_kontraktor'] },
                { name: 'name', label: 'Nama Lengkap', required: true, aliases: ['full_name', 'nama_lengkap', 'name'] },
                { name: 'nik', label: 'NIK', required: true, aliases: ['id_number', 'ktp'] },
                { name: 'birthDate', label: 'Tanggal Lahir', required: false, aliases: ['birth_date', 'dob', 'tanggal_lahir'] },
                { name: 'position', label: 'Posisi/Jabatan', required: true, aliases: ['job_position', 'jabatan'] },
                { name: 'phone', label: 'Telepon', required: false, aliases: ['phone_number', 'telepon', 'contact'] },
                { name: 'email', label: 'Email', required: false, aliases: ['email_address'] },
                { name: 'mcuStatus', label: 'Status MCU', required: false, aliases: ['medical_status', 'health_status'] },
                { name: 'mcuExpiry', label: 'Tanggal Kadaluarsa MCU', required: false, aliases: ['medical_expiry', 'mcu_expiry'] }
            ];
        case 'certificates':
            return [
                { name: 'id', label: 'ID Sertifikat', required: true, aliases: ['certificate_id', 'cert_id'] },
                { name: 'applicationId', label: 'ID Pengajuan', required: true, aliases: ['app_id', 'application_id', 'id_pengajuan'] },
                { name: 'workerId', label: 'ID Pekerja', required: true, aliases: ['worker_id', 'personnel_id', 'id_pekerja'] },
                { name: 'contractorId', label: 'ID Kontraktor', required: true, aliases: ['contractor_id', 'company_id', 'id_kontraktor'] },
                { name: 'type', label: 'Jenis Sertifikat', required: true, aliases: ['certificate_type', 'cert_type', 'jenis'] },
                { name: 'issueDate', label: 'Tanggal Terbit', required: true, aliases: ['issue_date', 'tanggal_terbit', 'date_issued'] },
                { name: 'expiryDate', label: 'Tanggal Kadaluarsa', required: true, aliases: ['expiry_date', 'valid_until', 'tanggal_expired'] },
                { name: 'status', label: 'Status', required: true, aliases: ['certificate_status', 'status_sertifikat'] },
                { name: 'certNumber', label: 'Nomor Sertifikat', required: true, aliases: ['cert_number', 'certificate_number', 'nomor'] }
            ];
        default:
            return [];
    }
}

// Process data import based on mapping
function processImport() {
    if (!window.tempImportData) {
        showStatusMessage('Tidak ada data untuk diimport', 'error');
        return;
    }
    
    const { headers, data, type } = window.tempImportData;
    
    // Get mapping from UI
    const mapping = {};
    const mappingSelects = document.querySelectorAll('#mappingContent select');
    
    // Check required fields
    const requiredFields = getRequiredFields(type).filter(field => field.required);
    const missingRequiredFields = [];
    
    requiredFields.forEach(requiredField => {
        const select = document.querySelector(`select[data-field="${requiredField.name}"]`);
        if (!select || !select.value) {
            missingRequiredFields.push(requiredField.label);
        }
    });
    
    if (missingRequiredFields.length > 0) {
        showStatusMessage(`Kolom wajib belum dipilih: ${missingRequiredFields.join(', ')}`, 'error');
        return;
    }
    
    // Build mapping
    mappingSelects.forEach(select => {
        const fieldName = select.getAttribute('data-field');
        const headerName = select.value;
        
        if (headerName) {
            mapping[fieldName] = headerName;
        }
    });
    
    // Transform data according to mapping
    const transformedData = data.map(row => {
        const newRow = {};
        
        Object.keys(mapping).forEach(fieldName => {
            const headerName = mapping[fieldName];
            newRow[fieldName] = row[headerName];
        });
        
        return newRow;
    });
    
    // Save to localStorage based on type
    saveToLocalStorage(type, transformedData);
}

// Save imported data to localStorage
function saveToLocalStorage(type, data) {
    try {
        // Get existing data
        let existingData = [];
        const appState = JSON.parse(localStorage.getItem('appState') || '{}');
        
        switch (type) {
            case 'applications':
                existingData = appState.applications || [];
                appState.applications = mergeData(existingData, data, 'id');
                break;
            case 'contractors':
                existingData = appState.contractors || [];
                appState.contractors = mergeData(existingData, data, 'id');
                break;
            case 'personnel':
                existingData = appState.workers || [];
                appState.workers = mergeData(existingData, data, 'id');
                break;
            case 'certificates':
                existingData = appState.certificates || [];
                appState.certificates = mergeData(existingData, data, 'id');
                break;
        }
        
        // Save updated data
        localStorage.setItem('appState', JSON.stringify(appState));
        
        // Show success message
        const addedCount = data.length - existingData.length;
        const updatedCount = existingData.length - addedCount;
        
        showStatusMessage(`Import berhasil! ${addedCount > 0 ? addedCount + ' data baru ditambahkan. ' : ''}${updatedCount > 0 ? updatedCount + ' data diupdate.' : ''}`, 'success');
        
        // Clear preview and mapping
        setTimeout(() => {
            document.getElementById('dataPreview').style.display = 'none';
            document.getElementById('mappingSection').style.display = 'none';
            document.getElementById('actionButtons').style.display = 'none';
            document.getElementById('importSection').style.display = 'none';
            document.getElementById('fileInput').value = '';
            
            // Refresh page to see updated data
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        console.error('Error saving data:', error);
        showStatusMessage('Error menyimpan data: ' + error.message, 'error');
    }
}

// Merge new data with existing data (update if exists, add if new)
function mergeData(existingData, newData, idField) {
    const mergedData = [...existingData];
    const existingIds = new Set(existingData.map(item => item[idField]));
    
    newData.forEach(newItem => {
        if (existingIds.has(newItem[idField])) {
            // Update existing item
            const index = mergedData.findIndex(item => item[idField] === newItem[idField]);
            mergedData[index] = { ...mergedData[index], ...newItem };
        } else {
            // Add new item
            mergedData.push(newItem);
        }
    });
    
    return mergedData;
}

// Cancel import and reset UI
function cancelImport() {
    document.getElementById('dataPreview').style.display = 'none';
    document.getElementById('mappingSection').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    document.getElementById('fileInput').value = '';
    
    // Reset selected data type
    document.querySelectorAll('.data-type-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Show status message
function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    statusMessage.classList.add(`status-${type}`);
    statusMessage.style.display = 'block';
}

// Export data to CSV
function exportData() {
    // Show export options modal
    const exportOptions = `
        <div class="upload-section">
            <h2>Export Data</h2>
            <p>Pilih jenis data yang ingin diexport:</p>
            
            <div class="data-type-selector">
                <div class="data-type-card" data-type="applications" onclick="exportDataType('applications')">
                    <h3>📋 Pengajuan</h3>
                    <p>Data pengajuan sertifikasi</p>
                </div>
                <div class="data-type-card" data-type="contractors" onclick="exportDataType('contractors')">
                    <h3>🏢 Kontraktor</h3>
                    <p>Data perusahaan kontraktor</p>
                </div>
                <div class="data-type-card" data-type="personnel" onclick="exportDataType('personnel')">
                    <h3>👤 Personnel</h3>
                    <p>Data personnel/pekerja</p>
                </div>
                <div class="data-type-card" data-type="certificates" onclick="exportDataType('certificates')">
                    <h3>🏆 Sertifikat</h3>
                    <p>Data sertifikat yang diterbitkan</p>
                </div>
            </div>
        </div>
    `;
    
    // Update DOM
    document.getElementById('importSection').style.display = 'none';
    document.getElementById('dataPreview').style.display = 'none';
    document.getElementById('mappingSection').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'none';
    
    const container = document.querySelector('.container');
    const exportSection = document.createElement('div');
    exportSection.id = 'exportSection';
    exportSection.innerHTML = exportOptions;
    
    // Remove existing export section if it exists
    const existingExportSection = document.getElementById('exportSection');
    if (existingExportSection) {
        existingExportSection.remove();
    }
    
    container.appendChild(exportSection);
}

// Export specific data type to CSV
function exportDataType(type) {
    // Get data from localStorage
    const appState = JSON.parse(localStorage.getItem('appState') || '{}');
    let data = [];
    
    switch (type) {
        case 'applications':
            data = appState.applications || [];
            break;
        case 'contractors':
            data = appState.contractors || [];
            break;
        case 'personnel':
            data = appState.workers || [];
            break;
        case 'certificates':
            data = appState.certificates || [];
            break;
    }
    
    if (data.length === 0) {
        alert('Tidak ada data untuk diexport');
        return;
    }
    
    // Convert data to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const val = row[header] || '';
            // Escape commas and quotes
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    });
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sbtc_${type}_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Format date for file name
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Clear all data from localStorage
function clearAllData() {
    if (confirm('PERHATIAN: Semua data akan dihapus dan reset ke default. Apakah Anda yakin?')) {
        // Get confirmation with an admin password
        const password = prompt('Masukkan password admin untuk konfirmasi:');
        
        if (password === 'admin123') { // Simple example password
            localStorage.removeItem('appState');
            alert('Data berhasil dihapus. Halaman akan dimuat ulang.');
            window.location.reload();
        } else {
            alert('Password salah. Penghapusan data dibatalkan.');
        }
    }
}

// Show data statistics
function showDataStats() {
    // Get data from localStorage
    const appState = JSON.parse(localStorage.getItem('appState') || '{}');
    
    const stats = {
        applications: (appState.applications || []).length,
        contractors: (appState.contractors || []).length,
        personnel: (appState.workers || []).length,
        certificates: (appState.certificates || []).length,
        
        applicationsByStatus: countByProperty(appState.applications || [], 'status'),
        certificatesByType: countByProperty(appState.certificates || [], 'type'),
        personnelByPosition: countByProperty(appState.workers || [], 'position'),
        contractorsByBusiness: countByProperty(appState.contractors || [], 'business')
    };
    
    // Create stats HTML
    const statsHtml = `
        <div class="upload-section">
            <h2>Data Statistics</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>📋 Pengajuan</h3>
                    <div style="font-size: 24px; font-weight: bold;">${stats.applications}</div>
                </div>
                <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>🏢 Kontraktor</h3>
                    <div style="font-size: 24px; font-weight: bold;">${stats.contractors}</div>
                </div>
                <div style="background: #fff3e0; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>👤 Personnel</h3>
                    <div style="font-size: 24px; font-weight: bold;">${stats.personnel}</div>
                </div>
                <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>🏆 Sertifikat</h3>
                    <div style="font-size: 24px; font-weight: bold;">${stats.certificates}</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3>Status Pengajuan</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Status</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Jumlah</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Persentase</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(stats.applicationsByStatus).map(([status, count]) => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${status}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${count}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">
                                        ${stats.applications > 0 ? ((count / stats.applications) * 100).toFixed(1) + '%' : '0%'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3>Posisi Personnel</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Posisi</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Jumlah</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Persentase</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(stats.personnelByPosition).map(([position, count]) => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${position}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${count}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">
                                        ${stats.personnel > 0 ? ((count / stats.personnel) * 100).toFixed(1) + '%' : '0%'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn btn-primary" onclick="window.location.reload()">Kembali</button>
            </div>
        </div>
    `;
    
    // Update DOM
    document.getElementById('importSection').style.display = 'none';
    document.getElementById('dataPreview').style.display = 'none';
    document.getElementById('mappingSection').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'none';
    
    const container = document.querySelector('.container');
    const statsSection = document.createElement('div');
    statsSection.id = 'statsSection';
    statsSection.innerHTML = statsHtml;
    
    // Remove existing stats section if it exists
    const existingStatsSection = document.getElementById('statsSection');
    if (existingStatsSection) {
        existingStatsSection.remove();
    }
    
    // Remove existing export section if it exists
    const existingExportSection = document.getElementById('exportSection');
    if (existingExportSection) {
        existingExportSection.remove();
    }
    
    container.appendChild(statsSection);
}

// Count items by property
function countByProperty(array, property) {
    const result = {};
    
    array.forEach(item => {
        const value = item[property] || 'Unknown';
        result[value] = (result[value] || 0) + 1;
    });
    
    return result;
}