/**
 * Top Navigation Bar Module
 * Handles dynamic generation of the top navbar based on user role.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Locate or create container
    let navContainer = document.getElementById('navbar-container');
    if (!navContainer) {
        navContainer = document.createElement('div');
        navContainer.id = 'navbar-container';
        document.body.insertBefore(navContainer, document.body.firstChild);
    }

    const userRole = sessionStorage.getItem('userRole') || 'citizen';
    const currentPath = window.location.pathname;

    const navItems = [
        { name: 'Mobility', link: '/mobility' },
        { name: 'Environment', link: '/environment' },
        { name: 'Health', link: '/health' },
        { name: 'Agriculture', link: '/agriculture' }
    ];

    // Build Bootstrap Navbar HTML
    let navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center gap-2" href="/home">
                    <img src="/logo.png" alt="MetroMatriX" style="height: 32px; width: auto;">
                    <span class="fw-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent" 
                          style="background: linear-gradient(to right, #4ade80, #3b82f6); -webkit-background-clip: text; color: transparent;">
                        MetroMatriX
                    </span>
                    <span class="badge bg-secondary ms-2" style="font-size: 0.7rem; opacity: 0.8;">${userRole.toUpperCase()}</span>
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
    `;

    navItems.forEach(item => {
        // Simple active check
        const isActive = currentPath.includes(item.link) || (item.link === '/home' && (currentPath === '/' || currentPath === '/index.html'));

        navbarHTML += `
            <li class="nav-item">
                <a class="nav-link ${isActive ? 'active fw-bold text-primary' : ''}" href="${item.link}">
                    ${item.name}
                </a>
            </li>
        `;
    });

    navbarHTML += `
                    </ul>
                    <div class="d-flex align-items-center gap-3">
                        <a href="/settings" class="btn btn-outline-light btn-sm rounded-pill px-3">
                            Settings
                        </a>
        ${userRole === 'official' ?
            `<button id="nav-add-official" class="btn btn-sm btn-outline-warning rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#addOfficialModal">
                                + Official
                            </button>` : ''
        }
                    </div>
                    
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3 ms-2" onclick="logout()">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
        <!-- Spacer for fixed navbar -->
        <div style="height: 70px;"></div>
    `;

    navContainer.innerHTML = navbarHTML;

    // Global Logout Function
    window.logout = function () {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/login.html';
        }
    };

    // Inject Add Official Modal if official
    if (userRole === 'official') {
        const modalHTML = `
            <div class="modal fade" id="addOfficialModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content text-bg-dark border-secondary">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title">Add New Official</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Step 1: Verify Password -->
                            <div id="step-verify-pass">
                                <p class="text-warning mb-3">Verification required. Please enter your password.</p>
                                <input type="password" id="modal-verify-password" class="form-control mb-3" placeholder="Your Password">
                                <button class="btn btn-warning w-100" id="btn-verify-continue">Verify & Continue</button>
                            </div>

                            <!-- Step 2: Add Email -->
                            <div id="step-add-email" style="display: none;">
                                <p class="text-info mb-3">Identity Verified.</p>
                                <label class="form-label">New Official's Email</label>
                                <input type="email" id="modal-new-email" class="form-control mb-3" placeholder="official@metro.com">
                                <button class="btn btn-success w-100" id="btn-submit-official">Whiteliste Email</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Modal Logic
        setTimeout(() => {
            const verifyBtn = document.getElementById('btn-verify-continue');
            const submitBtn = document.getElementById('btn-submit-official');

            if (verifyBtn) {
                verifyBtn.addEventListener('click', async () => {
                    const pass = document.getElementById('modal-verify-password').value;
                    if (!pass) return alert('Enter password');

                    verifyBtn.innerHTML = 'Verifying...';
                    const isValid = await verifyPassword(pass); // from auth.js
                    verifyBtn.innerHTML = 'Verify & Continue';

                    if (isValid) {
                        document.getElementById('step-verify-pass').style.display = 'none';
                        document.getElementById('step-add-email').style.display = 'block';
                    } else {
                        alert('Incorrect Password');
                    }
                });
            }

            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    const email = document.getElementById('modal-new-email').value;
                    const pass = document.getElementById('modal-verify-password').value; // Reuse verified pass
                    if (email && pass) {
                        addOfficialEmail(email, pass); // from auth.js
                        const modalEl = document.getElementById('addOfficialModal');
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        modal.hide();

                        // Reset steps for next time
                        document.getElementById('step-verify-pass').style.display = 'block';
                        document.getElementById('step-add-email').style.display = 'none';
                        document.getElementById('modal-verify-password').value = '';
                        document.getElementById('modal-new-email').value = '';
                    }
                });
            }
        }, 1000);
    }

    // Clean up any potential sidebar remnants if they exist in DOM
    const oldSidebar = document.getElementById('sidebar');
    if (oldSidebar) oldSidebar.remove();
    const oldToggle = document.getElementById('sidebarToggle');
    if (oldToggle) oldToggle.remove();
    document.body.style.marginLeft = '0'; // Reset margin
});
