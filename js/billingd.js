// Billing logic
async function generateBill(patientId) {
    const doc = await db.collection('patients').doc(patientId).get();
    if (doc.exists) {
        const data = doc.data();
        const bill = `Bill for ${data.name}: $${data.billAmount || 50}`; // Example calculation
        document.getElementById('bill-output').textContent = bill;
        logAction('Billing', `Generated bill for patient ${patientId}`);
    } else {
        showError('Patient not found for billing');
    }
}