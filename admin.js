// HMS Admin Logic - MySQL Integrated
let patients = [];
let doctors = [];
let pharmacy = [];
let appointments = [];
let beds = [];

// Check session on load
document.addEventListener('DOMContentLoaded', async () => {
    const session = await fetch('api/check_session.php').then(r => r.json());
    if (!session.logged_in) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set username in header
    const profileSpan = document.querySelector('.admin-profile span');
    if (profileSpan) profileSpan.innerText = session.username;

    // Load initial data
    loadDashboardStats();
    setupNavigation();
    setupSidebarToggle();
    
    // Initial data load for all modules
    loadPatients();
    loadDoctors();
    loadPharmacy();
    loadAppointments();
    loadBeds();
});

// Navigation & Sidebar
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const moduleViews = document.querySelectorAll('.module-view');
    const titleHeader = document.getElementById('current-module-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const module = item.getAttribute('data-module');
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            titleHeader.innerText = item.querySelector('span').innerText;

            moduleViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${module}-view`) view.classList.add('active');
            });
        });
    });
}

function setupSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

let patientChartInstance = null;
let deptChartInstance = null;
let statusChartInstance = null;

// Data Loading (Fetch from API)
async function loadDashboardStats() {
    try {
        const stats = await fetch('api/stats.php').then(r => r.json());
        document.getElementById('stat-patients').innerText = stats.patients;
        document.getElementById('stat-appointments').innerText = stats.appointments;
        document.getElementById('stat-pharmacy').innerText = `${stats.lowStock} Items`;
        document.getElementById('stat-beds').innerText = stats.availableBeds;

        if (typeof Chart !== 'undefined') {
            const pCtx = document.getElementById('patientChart');
            if (pCtx && stats.weeklyPatients) {
                if (patientChartInstance) patientChartInstance.destroy();
                patientChartInstance = new Chart(pCtx, {
                    type: 'bar',
                    data: {
                        labels: stats.weeklyPatients.map(x => x.date),
                        datasets: [{
                            label: 'Patients Admitted',
                            data: stats.weeklyPatients.map(x => x.count),
                            backgroundColor: '#0050d5',
                            borderRadius: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            const dCtx = document.getElementById('deptChart');
            if (dCtx && stats.deptAppointments) {
                if (deptChartInstance) deptChartInstance.destroy();
                deptChartInstance = new Chart(dCtx, {
                    type: 'doughnut',
                    data: {
                        labels: stats.deptAppointments.map(x => x.department),
                        datasets: [{
                            data: stats.deptAppointments.map(x => x.count),
                            backgroundColor: ['#0050d5', '#16c5ff', '#444', '#a1a1a0', '#dedede']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            const sCtx = document.getElementById('statusChart');
            if (sCtx && stats.patientStatus) {
                if (statusChartInstance) statusChartInstance.destroy();
                statusChartInstance = new Chart(sCtx, {
                    type: 'pie',
                    data: {
                        labels: stats.patientStatus.map(x => x.status),
                        datasets: [{
                            data: stats.patientStatus.map(x => x.count),
                            backgroundColor: ['#16c5ff', '#0050d5', '#a1a1a0', '#ff4d4d']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }
    } catch (e) { console.error('Stats load failed', e); }
}

async function loadPatients() {
    patients = await fetch('api/patients.php').then(r => r.json());
    const list = document.getElementById('patient-list');
    if (!list) return;
    list.innerHTML = '';
    patients.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id}</td>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td><span class="status-badge ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span></td>
            <td>
                <button style="color: var(--fros-blue-color); margin-right: 10px;" onclick="openEditPatientModal(${p.id})"><i class="fas fa-edit"></i></button>
                <button style="color: #ff4d4d;" onclick="deletePatient(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        list.appendChild(tr);
    });
}

async function loadDoctors() {
    doctors = await fetch('api/doctors.php').then(r => r.json());
    const list = document.getElementById('doctor-list');
    if (!list) return;
    list.innerHTML = '';
    doctors.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${d.id}</td>
            <td>${d.name}</td>
            <td>${d.specialization}</td>
            <td><span class="status-badge ${d.status.toLowerCase().replace(' ', '-')}">${d.status}</span></td>
            <td>
                <button style="color: var(--fros-blue-color); margin-right: 10px;" onclick="openEditDoctorModal(${d.id})"><i class="fas fa-edit"></i></button>
                <button style="color: #ff4d4d;" onclick="deleteDoctor(${d.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        list.appendChild(tr);
    });
}

async function loadPharmacy() {
    pharmacy = await fetch('api/pharmacy.php').then(r => r.json());
    const list = document.getElementById('pharmacy-list');
    if (!list) return;
    list.innerHTML = '';
    pharmacy.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.name}</td>
            <td class="${m.stock < 10 ? 'text-danger' : ''}">${m.stock}</td>
            <td>$${m.price}</td>
            <td>
                <button style="color: var(--fros-blue-color); margin-right: 10px;" onclick="openEditMedicineModal(${m.id})"><i class="fas fa-edit"></i></button>
                <button style="color: #ff4d4d;" onclick="deleteMedicine(${m.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        list.appendChild(tr);
    });
}

async function loadAppointments() {
    appointments = await fetch('api/appointments.php').then(r => r.json());
    const list = document.getElementById('appointment-list');
    if (!list) return;
    list.innerHTML = '';
    appointments.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>APT-${a.id}</td>
            <td>${a.patient_name}</td>
            <td>${a.phone}</td>
            <td>${a.email}</td>
            <td>${a.department}</td>
            <td><span class="status-badge available">${a.appointment_date}</span></td>
            <td>
                <button style="color: #ff4d4d;" onclick="deleteAppointment(${a.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        list.appendChild(tr);
    });
}

async function loadBeds() {
    try {
        beds = await fetch('api/beds.php').then(r => r.json());
        const list = document.getElementById('bed-list');
        if (!list) return;
        list.innerHTML = '';
        beds.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${b.bed_no}</td>
                <td>${b.patient_name}</td>
                <td>${b.ward}</td>
                <td><span class="status-badge ${b.status.toLowerCase().replace(' ', '-')}">${b.status}</span></td>
                <td>
                    <button style="color: var(--fros-blue-color); margin-right: 10px;" onclick="openEditBedModal(${b.id})"><i class="fas fa-edit"></i></button>
                    <button style="color: #ff4d4d;" onclick="deleteBed(${b.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            list.appendChild(tr);
        });
    } catch(e) { console.error('Error loading beds', e); }
}

// Add Functions
async function addPatient(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('pat-name').value,
        age: document.getElementById('pat-age').value,
        status: document.getElementById('pat-status').value
    };
    await fetch('api/patients.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadPatients();
    loadDashboardStats();
    closeModal('patientModal');
    e.target.reset();
}
document.getElementById('addPatientForm')?.addEventListener('submit', addPatient);

function openEditPatientModal(id) {
    const p = patients.find(x => x.id == id);
    if (p) {
        document.getElementById('edit-pat-id').value = p.id;
        document.getElementById('edit-pat-name').value = p.name;
        document.getElementById('edit-pat-age').value = p.age;
        document.getElementById('edit-pat-status').value = p.status;
        openModal('editPatientModal');
    }
}

async function editPatient(e) {
    e.preventDefault();
    const id = document.getElementById('edit-pat-id').value;
    const data = {
        name: document.getElementById('edit-pat-name').value,
        age: document.getElementById('edit-pat-age').value,
        status: document.getElementById('edit-pat-status').value
    };
    await fetch(`api/patients.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadPatients();
    loadDashboardStats();
    closeModal('editPatientModal');
    e.target.reset();
}
document.getElementById('editPatientForm')?.addEventListener('submit', editPatient);

async function addDoctor(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('doc-name').value,
        spec: document.getElementById('doc-spec').value,
        status: document.getElementById('doc-status').value
    };
    await fetch('api/doctors.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadDoctors();
    closeModal('doctorModal');
    e.target.reset();
}
document.getElementById('addDoctorForm')?.addEventListener('submit', addDoctor);

function openEditDoctorModal(id) {
    const d = doctors.find(x => x.id == id);
    if (d) {
        document.getElementById('edit-doc-id').value = d.id;
        document.getElementById('edit-doc-name').value = d.name;
        document.getElementById('edit-doc-spec').value = d.specialization;
        document.getElementById('edit-doc-status').value = d.status;
        openModal('editDoctorModal');
    }
}

async function editDoctor(e) {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    const data = {
        name: document.getElementById('edit-doc-name').value,
        spec: document.getElementById('edit-doc-spec').value,
        status: document.getElementById('edit-doc-status').value
    };
    await fetch(`api/doctors.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadDoctors();
    closeModal('editDoctorModal');
    e.target.reset();
}
document.getElementById('editDoctorForm')?.addEventListener('submit', editDoctor);

async function addMedicine(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('med-name').value,
        stock: document.getElementById('med-stock').value,
        price: document.getElementById('med-price').value
    };
    await fetch('api/pharmacy.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadPharmacy();
    loadDashboardStats();
    closeModal('pharmacyModal');
    e.target.reset();
}
document.getElementById('addMedicineForm')?.addEventListener('submit', addMedicine);

function openEditMedicineModal(id) {
    const m = pharmacy.find(x => x.id == id);
    if (m) {
        document.getElementById('edit-med-id').value = m.id;
        document.getElementById('edit-med-name').value = m.name;
        document.getElementById('edit-med-stock').value = m.stock;
        document.getElementById('edit-med-price').value = m.price;
        openModal('editPharmacyModal');
    }
}

async function editMedicine(e) {
    e.preventDefault();
    const id = document.getElementById('edit-med-id').value;
    const data = {
        name: document.getElementById('edit-med-name').value,
        stock: document.getElementById('edit-med-stock').value,
        price: document.getElementById('edit-med-price').value
    };
    await fetch(`api/pharmacy.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadPharmacy();
    loadDashboardStats();
    closeModal('editPharmacyModal');
    e.target.reset();
}
document.getElementById('editMedicineForm')?.addEventListener('submit', editMedicine);

async function addBed(e) {
    e.preventDefault();
    const data = {
        bed_no: document.getElementById('bed-no').value,
        patient_name: document.getElementById('bed-patient').value,
        ward: document.getElementById('bed-ward').value,
        status: document.getElementById('bed-status').value
    };
    await fetch('api/beds.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadBeds();
    loadDashboardStats();
    closeModal('addBedModal');
    e.target.reset();
}
document.getElementById('addBedForm')?.addEventListener('submit', addBed);

function openEditBedModal(id) {
    const bed = beds.find(b => b.id == id);
    if (bed) {
        document.getElementById('edit-bed-id').value = bed.id;
        document.getElementById('edit-bed-no').value = bed.bed_no;
        document.getElementById('edit-bed-patient').value = bed.patient_name;
        document.getElementById('edit-bed-ward').value = bed.ward;
        document.getElementById('edit-bed-status').value = bed.status;
        openModal('editBedModal');
    }
}

async function editBed(e) {
    e.preventDefault();
    const id = document.getElementById('edit-bed-id').value;
    const data = {
        bed_no: document.getElementById('edit-bed-no').value,
        patient_name: document.getElementById('edit-bed-patient').value,
        ward: document.getElementById('edit-bed-ward').value,
        status: document.getElementById('edit-bed-status').value
    };
    await fetch(`api/beds.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadBeds();
    loadDashboardStats();
    closeModal('editBedModal');
    e.target.reset();
}
document.getElementById('editBedForm')?.addEventListener('submit', editBed);

// Delete Functions
async function deletePatient(id) {
    if (confirm('Delete this patient?')) {
        await fetch(`api/patients.php?id=${id}`, { method: 'DELETE' });
        loadPatients();
        loadDashboardStats();
    }
}

async function deleteDoctor(id) {
    if (confirm('Delete this doctor?')) {
        await fetch(`api/doctors.php?id=${id}`, { method: 'DELETE' });
        loadDoctors();
    }
}

async function deleteMedicine(id) {
    if (confirm('Delete this medicine?')) {
        await fetch(`api/pharmacy.php?id=${id}`, { method: 'DELETE' });
        loadPharmacy();
        loadDashboardStats();
    }
}

async function deleteAppointment(id) {
    if (confirm('Delete this appointment?')) {
        await fetch(`api/appointments.php?id=${id}`, { method: 'DELETE' });
        loadAppointments();
        loadDashboardStats();
    }
}

async function deleteBed(id) {
    if (confirm('Delete this bed allocation?')) {
        await fetch(`api/beds.php?id=${id}`, { method: 'DELETE' });
        loadBeds();
        loadDashboardStats();
    }
}

// Modal Controls
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
