// Doctor functionalities
function loadDoctorUI(container) {
    container.innerHTML = `
        <div class="tabs">
            <button class="tab-button active" onclick="showTab('actions')">Search & Actions</button>
            <button class="tab-button" onclick="showTab('history')">View History</button>
        </div>
        <div id="actions" class="tab-content active">
            <h3>Search Patient by Name</h3>
            <input type="text" id="search-name" placeholder="Enter patient name">
            <button id="search-patient">Search</button>
            <div id="search-results" class="search-results"></div>
            <h3>Add Prescription</h3>
            <input type="text" id="prescription-patient-name" placeholder="Patient Name" required>
            <textarea id="prescription-text" placeholder="Prescription" required></textarea>
            <input type="number" id="prescription-bill" placeholder="Prescription Bill Amount" required>
            <button id="search-for-prescription">Search & Add Prescription</button>
            <div id="prescription-selection" class="selection-list"></div>
            <h3>Add Bill Amount</h3>
            <input type="text" id="bill-patient-name" placeholder="Patient Name" required>
            <input type="number" id="bill-amount" placeholder="Bill Amount" required>
            <button id="search-for-bill">Search & Add Bill</button>
            <div id="bill-selection" class="selection-list"></div>
        </div>
        <div id="history" class="tab-content">
            <h3>All Patients History</h3>
            <div id="patient-history"></div>
        </div>
    `;

    // Load history on tab switch
    document.querySelector('[onclick="showTab(\'history\')"]').addEventListener('click', () => loadPatientHistory());

    document.getElementById('search-patient').addEventListener('click', async () => {
        const searchName = document.getElementById('search-name').value.trim().toLowerCase();
        if (!searchName) {
            showError('Please enter a name to search.');
            return;
        }
        await searchPatientsByName(searchName, 'search-results');
    });

    document.getElementById('search-for-prescription').addEventListener('click', async () => {
        const patientName = document.getElementById('prescription-patient-name').value.trim().toLowerCase();
        const prescription = document.getElementById('prescription-text').value.trim();
        const billAmount = parseFloat(document.getElementById('prescription-bill').value);
        if (!patientName || !prescription || isNaN(billAmount)) {
            showError('Please enter Patient Name, Prescription, and valid Bill Amount.');
            return;
        }
        await searchAndAddPrescription(patientName, prescription, billAmount);
    });

    document.getElementById('search-for-bill').addEventListener('click', async () => {
        const patientName = document.getElementById('bill-patient-name').value.trim().toLowerCase();
        const billAmount = parseFloat(document.getElementById('bill-amount').value);
        if (!patientName || isNaN(billAmount)) {
            showError('Please enter Patient Name and valid Bill Amount.');
            return;
        }
        await searchAndAddBill(patientName, billAmount);
    });
}

async function loadPatientHistory() {
    const historyDiv = document.getElementById('patient-history');
    if (!historyDiv) {
        console.error('Patient history div not found.');
        showError('History loading unavailable.');
        return;
    }
    historyDiv.innerHTML = 'Loading...';
    try {
        const snapshot = await db.collection('patients').get();
        if (snapshot.empty) {
            historyDiv.innerHTML = 'No patients found.';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const totalBill = (data.doctorBill || 0) + (data.receptionistBill || 0);
            html += `
                <div class="patient-card">
                    <h4>${data.name}</h4>
                    <p><strong>Age:</strong> ${data.age}</p>
                    <p><strong>Time:</strong> ${data.time}</p>
                    <p><strong>Token:</strong> ${data.token}</p>
                    <p><strong>Prescription:</strong> ${data.prescription || 'None'}</p>
                    <p><strong>Doctor's Bill:</strong> $${data.doctorBill || 0}</p>
                    <p><strong>Receptionist's Bill:</strong> $${data.receptionistBill || 0}</p>
                    <p><strong>Total Bill:</strong> $${totalBill}</p>
                    <p><strong>History:</strong> ${data.history.join(', ') || 'None'}</p>
                </div>
            `;
        });
        historyDiv.innerHTML = html;
    } catch (error) {
        historyDiv.innerHTML = 'Error loading history.';
        showError('Failed to load patient history: ' + error.message);
    }
}

async function searchPatientsByName(name, resultsDivId) {
    const resultsDiv = document.getElementById(resultsDivId);
    if (!resultsDiv) {
        console.error('Search results div not found for ID: ' + resultsDivId);
        showError('Search functionality unavailable.');
        return;
    }
    resultsDiv.innerHTML = 'Searching...';
    try {
        const snapshot = await db.collection('patients').where('name', '>=', name).where('name', '<=', name + '\uf8ff').get();
        if (snapshot.empty) {
            resultsDiv.innerHTML = 'No patients found with that name.';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const totalBill = (data.doctorBill || 0) + (data.receptionistBill || 0);
            html += `
                <div class="patient-card">
                    <h4>${data.name}</h4>
                    <p><strong>Age:</strong> ${data.age}</p>
                    <p><strong>Time:</strong> ${data.time}</p>
                    <p><strong>Token:</strong> ${data.token}</p>
                    <p><strong>Prescription:</strong> ${data.prescription || 'None'}</p>
                    <p><strong>Doctor's Bill:</strong> $${data.doctorBill || 0}</p>
                    <p><strong>Receptionist's Bill:</strong> $${data.receptionistBill || 0}</p>
                    <p><strong>Total Bill:</strong> $${totalBill}</p>
                    <p><strong>History:</strong> ${data.history.join(', ') || 'None'}</p>
                </div>
            `;
        });
        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = 'Error searching patients.';
        showError('Failed to search patients: ' + error.message);
    }
}

async function searchAndAddPrescription(name, prescription, billAmount) {
    const selectionDiv = document.getElementById('prescription-selection');
    if (!selectionDiv) {
        console.error('Prescription selection div not found.');
        showError('Prescription addition unavailable.');
        return;
    }
    selectionDiv.innerHTML = 'Searching...';
    try {
        const snapshot = await db.collection('patients').where('name', '>=', name).where('name', '<=', name + '\uf8ff').get();
        if (snapshot.empty) {
            selectionDiv.innerHTML = 'No patients found with that name.';
            return;
        }
        let html = '<p>Select a patient to add the prescription:</p><ul>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const patientId = doc.id;
            html += `<li onclick="addPrescriptionToPatient('${patientId}', '${prescription.replace(/'/g, "\\'")}', ${billAmount})">${data.name} (Age: ${data.age}, Token: ${data.token})</li>`;
        });
        html += '</ul>';
        selectionDiv.innerHTML = html;
    } catch (error) {
        selectionDiv.innerHTML = 'Error searching for prescription addition.';
        showError('Failed to search for prescription: ' + error.message);
    }
}

async function addPrescriptionToPatient(patientId, prescription, billAmount) {
    try {
        const docRef = db.collection('patients').doc(patientId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            const receptionistBill = data.receptionistBill || 0;
            const totalBill = billAmount + receptionistBill;
            await docRef.update({
                prescription,
                doctorBill: billAmount,
                totalBill,
                history: [...data.history, `Prescription added: ${prescription}, Doctor's Bill: $${billAmount}`]
            });
            logAction('Doctor', `Added prescription and bill to patient ${patientId}`);
            alert('Prescription and bill added successfully!');
            document.getElementById('prescription-selection').innerHTML = '';
            loadPatientHistory();
        }
    } catch (error) {
        showError('Failed to add prescription: ' + error.message);
    }
}

async function searchAndAddBill(name, amount) {
    const selectionDiv = document.getElementById('bill-selection');
    if (!selectionDiv) {
        console.error('Bill selection div not found.');
        showError('Bill addition unavailable.');
        return;
    }
    selectionDiv.innerHTML = 'Searching...';
    try {
        const snapshot = await db.collection('patients').where('name', '>=', name).where('name', '<=', name + '\uf8ff').get();
        if (snapshot.empty) {
            selectionDiv.innerHTML = 'No patients found with that name.';
            return;
        }
        let html = '<p>Select a patient to add the bill:</p><ul>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const patientId = doc.id;
            html += `<li onclick="addBillToPatient('${patientId}', ${amount})">${data.name} (Age: ${data.age}, Token: ${data.token})</li>`;
        });
        html += '</ul>';
        selectionDiv.innerHTML = html;
    } catch (error) {
        selectionDiv.innerHTML = 'Error searching for bill addition.';
        showError('Failed to search for bill: ' + error.message);
    }
}

async function addBillToPatient(patientId, amount) {
    try {
        const docRef = db.collection('patients').doc(patientId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            await docRef.update({
                receptionistBill: amount,
                totalBill: (data.doctorBill || 0) + amount,
                history: [...data.history, `Receptionist's Bill set to $${amount}`]
            });
            logAction('Doctor', `Set receptionist's bill to $${amount} for patient ${patientId}`);
            alert('Bill amount added successfully!');
            document.getElementById('bill-selection').innerHTML = '';
            loadPatientHistory();
        }
    } catch (error) {
        showError('Failed to add bill: ' + error.message);
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}