// Utility functions
function logAction(action, details) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${action}: ${details}`);
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    logAction('Error', message);
}

function clearError() {
    document.getElementById('error-message').textContent = '';
}