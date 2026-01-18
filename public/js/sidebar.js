/**
 * Sidebar Navigation Module
 * Handles dynamic generation of the sidebar based on user role.
 */

document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) {
        console.warn('Sidebar container not found.');
        return;
    }

    const userRole = localStorage.getItem('userRole') || 'citizen';
    const currentPath = window.location.pathname;

    const navItems = [
        { name: 'Dashboard', link: '/home', icon: '📊' },
        { name: 'Mobility', link: '/mobility', icon: '🚗' },
        { name: 'Environment', link: '/environment', icon: '🌿' },
        { name: 'Health', link: '/health', icon: '🏥' },
        { name: 'Agriculture', link: '/agriculture', icon: '🌾' },
        { name: 'Settings', link: '/settings', icon: '⚙️' }
    ];

    // Build HTML
    let sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>Smart City</h2>
                <p class="user-role-label">${userRole === 'official' ? 'Official Access' : 'Citizen Portal'}</p>
            </div>
            <ul class="nav-links">
    `;

    navItems.forEach(item => {
        const isActive = currentPath.includes(item.link) || (item.link === '/home' && (currentPath === '/' || currentPath === '/index.html'));
        sidebarHTML += `
            <li class="${isActive ? 'active' : ''}">
                <a href="${item.link}">
                    <span class="icon">${item.icon}</span>
                    <span class="text">${item.name}</span>
                </a>
            </li>
        `;
    });

    sidebarHTML += `
            </ul>
            <div class="sidebar-footer">
    `;

    if (userRole === 'official') {
        sidebarHTML += `
            <button id="add-official-btn" class="sidebar-btn official-action">
                👨‍💼 Add Official
            </button>
        `;
    }

    sidebarHTML += `
                <button id="logout-btn" class="sidebar-btn logout-btn">
                    🚪 Logout
                </button>
            </div>
        </div>
    `;

    sidebarContainer.innerHTML = sidebarHTML;

    // Inject Toggle Button for Mobile
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '☰';
    toggleBtn.className = 'sidebar-toggle-btn';
    toggleBtn.style.cssText = `
        position: fixed; top: 15px; left: 15px; z-index: 1001;
        background: #333; color: white; border: none; padding: 10px 15px;
        border-radius: 5px; cursor: pointer; display: none;
    `;
    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    });

    // Add Styles dynamically if not present
    if (!document.getElementById('sidebar-styles')) {
        const style = document.createElement('style');
        style.id = 'sidebar-styles';
        style.textContent = `
            /* ... existing styles ... */
            .sidebar {
                width: 250px;
                height: 100vh;
                background: #1e1e2f;
                color: #fff;
                position: fixed;
                left: 0;
                top: 0;
                display: flex;
                flex-direction: column;
                box-shadow: 2px 0 10px rgba(0,0,0,0.3);
                z-index: 1000;
                font-family: 'Inter', sans-serif;
            }
            .sidebar-header {
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #333;
                background: #161625;
            }
            .sidebar-header h2 { margin: 0; font-size: 1.5rem; color: #4ade80; }
            .user-role-label { font-size: 0.8rem; color: #aaa; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
            
            .nav-links {
                list-style: none;
                padding: 0;
                margin: 20px 0;
                flex-grow: 1;
            }
            .nav-links li a {
                display: flex;
                align-items: center;
                padding: 15px 25px;
                color: #ccc;
                text-decoration: none;
                transition: 0.3s;
                font-size: 1rem;
            }
            .nav-links li a:hover, .nav-links li.active a {
                background: #4ade80;
                color: #000;
            }
            .nav-links li a .icon { margin-right: 15px; font-size: 1.2rem; }
            
            .sidebar-footer { padding: 20px; border-top: 1px solid #333; background: #161625; }
            .sidebar-btn {
                width: 100%;
                padding: 10px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: 0.3s;
                margin-top: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }
            .logout-btn { background: #ef4444; color: white; }
            .logout-btn:hover { background: #dc2626; }
            .official-action { background: #3b82f6; color: white; margin-bottom: 10px; }
            .official-action:hover { background: #2563eb; }

            /* Main check to push content */
            body { margin-left: 250px; transition: margin 0.3s; }
            
            .sidebar-toggle-btn { display: none; }

            @media (max-width: 768px) {
                .sidebar { transform: translateX(-100%); transition: 0.3s; }
                .sidebar.open { transform: translateX(0); }
                body { margin-left: 0; }
                .sidebar-toggle-btn { display: block; }
            }
        `;
        document.head.appendChild(style);
    }

    // Event Listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        window.location.href = '/';
    });

    const addOfficialBtn = document.getElementById('add-official-btn');
    if (addOfficialBtn) {
        addOfficialBtn.addEventListener('click', () => {
            // Check if we are already on settings page to show the section
            if (window.location.pathname.includes('settings')) {
                document.getElementById('official-controls')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = '/settings?action=add_official';
            }
        });
    }
});
