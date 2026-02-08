// Receptionist functionalities
function loadReceptionistUI(container) {
    container.innerHTML = `
        <div class="tabs">
            <button class="tab-button active" onclick="showTab('actions')">Actions</button>
            <button class="tab-button" onclick="showTab('history')">History</button>
        </div>
        <div id="actions" class="tab-content active">
            <h3>Add Patient</h3>
            <form id="add-patient-form">
                <input type="text" id="patient-name" placeholder="Name" required>
                <input type="number" id="patient-age" placeholder="Age" required>
                <input type="datetime-local" id="patient-time" placeholder="Appointment Date & Time" required>
                <button type="submit">Add Patient & Generate Token</button>
            </form>
            <div id="patient-id-display" style="margin-top: 10px; color: green;"></div>
            <h3>Generate/Update Bill (by Name)</h3>
            <input type="text" id="bill-patient-name" placeholder="Patient Name" required>
            <input type="number" id="bill-amount" placeholder="Bill Amount" required>
            <button id="search-for-bill">Search & Generate/Update Bill</button>
            <div id="bill-selection" class="selection-list"></div>
            <h3>Total Bill (Search by Name)</h3>
            <input type="text" id="total-bill-patient-name" placeholder="Patient Name" required>
            <button id="search-total-bill">Search Total Bill</button>
            <div id="total-bill-result" class="selection-list"></div>
        </div>
        <div id="history" class="tab-content">
            <h3>All Patients History</h3>
            <div id="patient-history"></div>
        </div>
    `;

    // Load history on tab switch
    document.querySelector('[onclick="showTab(\'history\')"]').addEventListener('click', () => loadPatientHistory());

    document.getElementById('add-patient-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('patient-name').value.trim();
        const age = document.getElementById('patient-age').value;
        const time = document.getElementById('patient-time').value;
        const token = Math.random().toString(36).substr(2, 9);

        try {
            const docRef = await db.collection('patients').add({
                name,
                age: parseInt(age),
                time,
                token,
                prescription: '',
                doctorBill: 0,
                receptionistBill: 0,
                totalBill: 0,
                history: []
            });
            const patientId = docRef.id;
            document.getElementById('patient-id-display').textContent = `Patient added! ID: ${patientId}`;
            logAction('Receptionist', `Added patient ${name} with ID ${patientId} and token ${token}`);
            alert('Patient added successfully!');
            loadPatientHistory();
        } catch (error) {
            showError('Failed to add patient: ' + error.message);
        }
    });

    document.getElementById('search-for-bill').addEventListener('click', async () => {
        const patientName = document.getElementById('bill-patient-name').value.trim().toLowerCase();
        const billAmount = parseFloat(document.getElementById('bill-amount').value);
        if (!patientName || isNaN(billAmount)) {
            showError('Please enter Patient Name and valid Bill Amount.');
            return;
        }
        await searchAndGenerateBill(patientName, billAmount);
    });

    document.getElementById('search-total-bill').addEventListener('click', async () => {
        const patientName = document.getElementById('total-bill-patient-name').value.trim().toLowerCase();
        if (!patientName) {
            showError('Please enter Patient Name.');
            return;
        }
        await searchTotalBill(patientName);
    });
}

async function loadPatientHistory() {
    const historyDiv = document.getElementById('patient-history');
    if (!historyDiv) return;
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

async function searchAndGenerateBill(name, amount) {
    const selectionDiv = document.getElementById('bill-selection');
    if (!selectionDiv) {
        console.error('Bill selection div not found.');
        showError('Bill generation unavailable.');
        return;
    }
    selectionDiv.innerHTML = 'Searching...';
    try {
        const snapshot = await db.collection('patients').where('name', '>=', name).where('name', '<=', name + '\uf8ff').get();
        if (snapshot.empty) {
            selectionDiv.innerHTML = 'No patients found with that name.';
            return;
        }
        let html = '<p>Select a patient to generate/update the bill:</p><ul>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const patientId = doc.id;
            html += `<li onclick="generateBillForPatient('${patientId}', ${amount})">${data.name} (Age: ${data.age}, Token: ${data.token})</li>`;
        });
        html += '</ul>';
        selectionDiv.innerHTML = html;
    } catch (error) {
        selectionDiv.innerHTML = 'Error searching for bill generation.';
        showError('Failed to search for bill: ' + error.message);
    }
}

async function generateBillForPatient(patientId, amount) {
    try {
        const docRef = db.collection('patients').doc(patientId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            await docRef.update({
                receptionistBill: amount,
                totalBill: (data.doctorBill || 0) + amount,
                history: [...data.history, `Bill generated/updated to $${amount}`]
            });
            logAction('Receptionist', `Generated/updated bill to $${amount} for patient ${patientId}`);
            alert('Bill generated/updated successfully!');
            document.getElementById('bill-selection').innerHTML = '';
            loadPatientHistory();
        }
    } catch (error) {
        showError('Failed to generate/update bill: ' + error.message);
    }
}

async function searchTotalBill(name) {
    const resultDiv = document.getElementById('total-bill-result');
    if (!resultDiv) {
        console.error('Total bill result div not found.');
        showError('Total bill search unavailable.');
        return;
    }
    resultDiv.innerHTML = 'Searching...';
    try {
        const snapshot = await db.collection('patients').where('name', '>=', name).where('name', '<=', name + '\uf8ff').get();
        if (snapshot.empty) {
            resultDiv.innerHTML = 'No patients found with that name.';
            return;
        }
        let html = '<p>Select a patient to view total bill:</p><ul>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const patientId = doc.id;
            const totalBill = (data.doctorBill || 0) + (data.receptionistBill || 0);
            html += `<li onclick="showTotalBill('${patientId}')">${data.name} (Total Bill: $${totalBill})</li>`;
        });
        html += '</ul>';
        resultDiv.innerHTML = html;
    } catch (error) {
        resultDiv.innerHTML = 'Error searching for total bill.';
        showError('Failed to search for total bill: ' + error.message);
    }
}

async function showTotalBill(patientId) {
    try {
        const doc = await db.collection('patients').doc(patientId).get();
        if (doc.exists) {
            const data = doc.data();
            const doctorBill = data.doctorBill || 0;
            const receptionistBill = data.receptionistBill || 0;
            const totalBill = doctorBill + receptionistBill;
            document.getElementById('total-bill-result').innerHTML = `
                <div class="patient-card">
                    <h4>${data.name}</h4>
                    <p><strong>Doctor's Bill:</strong> $${doctorBill}</p>
                    <p><strong>Receptionist's Bill:</strong> $${receptionistBill}</p>
                    <p><strong>Total Bill (Doctor's + Receptionist's):</strong> $${totalBill}</p>
                </div>
            `;
        }
    } catch (error) {
        showError('Failed to load total bill: ' + error.message);
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}