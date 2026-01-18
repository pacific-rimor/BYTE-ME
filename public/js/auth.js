const API_CheckUser = '/api/check-user';
const API_Register = '/api/register';
const API_Login = '/api/login';
const API_ForgotPassword = '/api/forgot-password';
const API_ResetPassword = '/api/reset-password';
const API_AddOfficial = '/api/add-official';

// 1. Check User Status
async function checkUserStatus(email) {
    const res = await fetch(API_CheckUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return await res.json();
}

// 2. Register / Set Password
async function registerUser(email, password, role) {
    const res = await fetch(API_Register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });
    return await res.json();
}

// Helper to just verify password without full login redirect
async function verifyPassword(password) {
    const email = sessionStorage.getItem('userEmail');
    if (!email) return false;

    const res = await fetch(API_Login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data.success;
}

// 3. Login
async function loginUser(email, password) {
    const res = await fetch(API_Login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
        sessionStorage.setItem('userRole', data.role);
        sessionStorage.setItem('userName', data.name || 'User');
        sessionStorage.setItem('userEmail', data.email);

        // Store extended profile data if available
        if (data.area) sessionStorage.setItem('userArea', data.area);
        if (data.profilePic) sessionStorage.setItem('userPic', data.profilePic);
        if (data.phoneNumber) sessionStorage.setItem('userPhone', data.phoneNumber);
        if (data.gender) sessionStorage.setItem('userGender', data.gender);
        if (data.dob) sessionStorage.setItem('userDOB', data.dob);

        sessionStorage.setItem('isLoggedIn', 'true');
        // Redirect to Dashboard
        window.location.href = '/home';
    }
    return data;
}

// Strict Redirect Logic
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const isLoginPage = window.location.pathname === '/' || window.location.pathname.includes('login.html');

    // If NOT logged in and NOT on login page, redirect to login
    if (!isLoggedIn && !isLoginPage) {
        window.location.href = '/';
        return false;
    }



    return true;
}

// Logout
function logout() {
    sessionStorage.clear();
    window.location.href = '/';
}

// 6. Update Profile
async function updateUserProfile(profileData) {
    const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (data.success) {
        // Update Session Storage
        if (data.user.name) sessionStorage.setItem('userName', data.user.name);
        if (data.user.area) sessionStorage.setItem('userArea', data.user.area);
        if (data.user.profilePic) sessionStorage.setItem('userPic', data.user.profilePic);
        if (data.user.phoneNumber) sessionStorage.setItem('userPhone', data.user.phoneNumber);
        if (data.user.gender) sessionStorage.setItem('userGender', data.user.gender);
        if (data.user.dob) sessionStorage.setItem('userDOB', data.user.dob);
    }
    return data;
}

// Add New Official (Admin Only)
async function addOfficialEmail(newEmail, password) {
    const role = sessionStorage.getItem('userRole');
    const email = sessionStorage.getItem('userEmail');

    if (role !== 'official') {
        alert('Only officials can perform this action.');
        return;
    }

    try {
        const response = await fetch(API_AddOfficial, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                newEmail,
                requesterRole: role,
                requesterEmail: email,
                requesterPassword: password
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Success: ' + data.message);
            // Clear input if successful
            const input = document.getElementById('new-official-email');
            const passInput = document.getElementById('new-official-password');
            if (input) input.value = '';
            if (passInput) passInput.value = '';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to add official:', error);
        alert('Network error occurred.');
    }
}

// Update UI based on Role
function updateUIForRole() {
    // Run Strict Auth Check first
    if (!checkAuth()) return;

    const role = sessionStorage.getItem('userRole');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');

    // Feature Gating: Scenario Planning
    const scenarioPanel = document.querySelector('.scenario-panel');
    if (scenarioPanel) {
        if (role === 'official') {
            scenarioPanel.style.display = 'block'; // Show for officials
        } else {
            // Hide or Disable for citizens
            const inputs = scenarioPanel.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = true);

            // Optional: Add a visual "Locked" overlay or message
            const lockMessage = document.getElementById('citizen-lock-msg');
            if (!lockMessage) {
                const msg = document.createElement('div');
                msg.id = 'citizen-lock-msg';
                msg.className = 'alert alert-info mt-3';
                msg.innerHTML = '🔒 <strong>Read-Only Mode:</strong> Only City Officials can modify simulation parameters.';
                scenarioPanel.prepend(msg);
            }
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUIForRole();
});
