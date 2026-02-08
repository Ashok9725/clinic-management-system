// Billing logic
async function generateBill(patientId) {
    try {
        const doc = await db.collection('patients').doc(patientId).get();
        if (doc.exists) {
            const data = doc.data();
            const billAmount = data.billAmount || 50; // Default or calculated
            const bill = `Bill for ${data.name} (ID: ${patientId}): $${billAmount}`;
            document.getElementById('bill-output').innerHTML = `<p>${bill}</p>`;
            logAction('Billing', `Generated bill for patient ${patientId}`);
            alert('Bill generated successfully!');
        } else {
            showError('Patient not found for billing. Check the ID or see the patient list.');
            document.getElementById('bill-output').innerHTML = '';
        }
    } catch (error) {
        showError('Failed to generate bill: ' + error.message);
    }
}