// Receptionist functionalities
function loadReceptionistUI(container) {
    container.innerHTML = `
        <h3>Add Patient</h3>
        <form id="add-patient-form">
            <input type="text" id="patient-name" placeholder="Name" required>
            <input type="number" id="patient-age" placeholder="Age" required>
            <button type="submit">Add Patient & Generate Token</button>
        </form>
        <h3>Generate Bill</h3>
        <input type="text" id="bill-patient-id" placeholder="Patient ID">
        <button id="generate-bill">Generate Bill</button>
        <div id="bill-output"></div>
    `;

    document.getElementById('add-patient-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('patient-name').value;
        const age = document.getElementById('patient-age').value;
        const token = Math.random().toString(36).substr(2, 9); // Simple token generation

        try {
            await db.collection('patients').add({
                name,
                age: parseInt(age),
                token,
                prescription: '',
                history: [],
                billAmount: 0
            });
            logAction('Receptionist', `Added patient ${name} with token ${token}`);
            alert('Patient added successfully!');
        } catch (error) {
            showError('Failed to add patient: ' + error.message);
        }
    });

    document.getElementById('generate-bill').addEventListener('click', async () => {
        const patientId = document.getElementById('bill-patient-id').value;
        await generateBill(patientId);
    });
}