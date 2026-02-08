// Authentication logic
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        logAction('Login', `User ${email} logged in as ${role}`);
        showDashboard(role);
    } catch (error) {
        showError('Login failed: ' + error.message);
    }
});

document.getElementById('logout').addEventListener('click', async () => {
    await auth.signOut();
    logAction('Logout', 'User logged out');
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
});

function showDashboard(role) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('dashboard-title').textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (role === 'receptionist') {
        loadReceptionistUI(content);
    } else if (role === 'doctor') {
        loadDoctorUI(content);
    }
}
