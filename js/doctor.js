// Doctor functionalities
function loadDoctorUI(container) {
    container.innerHTML = `
        <h3>View Patient</h3>
        <input type="text" id="view-patient-id" placeholder="Patient ID">
        <button id="view-patient">View</button>
        <div id="patient-details"></div>
        <h3>Add Prescription</h3>
        <input type="text" id="prescription-patient-id" placeholder="Patient ID">
        <textarea id="prescription-text" placeholder="Prescription"></textarea>
        <button id="add-prescription">Add Prescription</button>
    `;

    document.getElementById('view-patient').addEventListener('click', async () => {
        const patientId = document.getElementById('view-patient-id').value;
        const doc = await db.collection('patients').doc(patientId).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('patient-details').innerHTML = `
                <p>Name: ${data.name}</p>
                <p>Age: ${data.age}</p>
                <p>Token: ${data.token}</p>
                <p>Prescription: ${data.prescription}</p>
                <p>History: ${data.history.join(', ')}</p>
            `;
            logAction('Doctor', `Viewed patient ${patientId}`);
        } else {
            showError('Patient not found');
        }
    });

    document.getElementById('add-prescription').addEventListener('click', async () => {
        const patientId = document.getElementById('prescription-patient-id').value;
        const prescription = document.getElementById('prescription-text').value;
        try {
            const docRef = db.collection('patients').doc(patientId);
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                await docRef.update({
                    prescription,
                    history: [...data.history, `Prescription added: ${prescription}`]
                });
                logAction('Doctor', `Added prescription to patient ${patientId}`);
                alert('Prescription added!');
            }
        } catch (error) {
            showError('Failed to add prescription: ' + error.message);
        }
    });
}