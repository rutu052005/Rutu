// Helper: set accessible message
function setMessage(elem, text, type) {
    if (!elem) return;
    elem.textContent = text || "";
    elem.classList.remove("error", "success");
    if (type === "error") elem.classList.add("error");
    if (type === "success") elem.classList.add("success");
    // Show toast for important messages
    if (text) showToast(text, type);
}

// Toast helper
let toastTimer = null;
function showToast(text, type = 'info', duration = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = text;
    t.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');
    t.hidden = false;
    t.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(()=> t.hidden = true, 300);
    }, duration);
}

// Simple SHA-256 hash using Web Crypto API (client-side only)
async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showElement(el) {
    if (!el) return;
    el.hidden = false;
}
function hideElement(el) {
    if (!el) return;
    el.hidden = true;
}

function showLogin() {
    showElement(document.getElementById('loginPage'));
    hideElement(document.getElementById('signupPage'));
    hideElement(document.getElementById('dashboardPage'));
}

function showSignup() {
    hideElement(document.getElementById('loginPage'));
    showElement(document.getElementById('signupPage'));
    hideElement(document.getElementById('dashboardPage'));
}

function showDashboard(userName) {
    hideElement(document.getElementById('loginPage'));
    hideElement(document.getElementById('signupPage'));
    showElement(document.getElementById('dashboardPage'));
    const greet = document.getElementById('dashboardGreeting');
    if (greet) greet.textContent = `Welcome, ${userName || 'user'}`;
    // show profile badge in header
    const pb = document.getElementById('profileBadge');
    const pn = document.getElementById('profileName');
    if (pb && pn) {
        pn.textContent = userName || '';
        pb.hidden = false;
    }
}

// Save user to localStorage (namespaced). Password stored as SHA-256 hex (demo only).
async function saveUser({ name, email, password }) {
    const passwordHash = await hashPassword(password);
    const user = { name: name.trim(), email: email.trim().toLowerCase(), passwordHash };
    localStorage.setItem('ued_user', JSON.stringify(user));
}

function getUser() {
    const raw = localStorage.getItem('ued_user');
    return raw ? JSON.parse(raw) : null;
}

// Signup handler for SPA and standalone form
async function handleSignupForm(form, msgElem) {
    const name = form.querySelector('#name')?.value || '';
    const email = form.querySelector('#signupEmail')?.value || '';
    const pass = form.querySelector('#signupPassword')?.value || '';
    const passConfirm = form.querySelector('#signupPasswordConfirm')?.value || '';

    if (!name.trim() || !email.trim() || !pass) {
        setMessage(msgElem, 'All fields are required.', 'error');
        return;
    }

    if (!email.includes('@')) {
        setMessage(msgElem, 'Please enter a valid email address.', 'error');
        return;
    }

    if (pass.length < 6) {
        setMessage(msgElem, 'Password must be at least 6 characters.', 'error');
        return;
    }

    if (pass !== passConfirm) {
        setMessage(msgElem, 'Passwords do not match.', 'error');
        return;
    }

    await saveUser({ name, email, password: pass });
    setMessage(msgElem, 'Account created successfully. You can sign in now.', 'success');
    setTimeout(() => showLogin(), 900);
}

// Login handler
async function handleLoginForm(form, msgElem) {
    const email = form.querySelector('#loginEmail')?.value || '';
    const pass = form.querySelector('#loginPassword')?.value || '';
    const user = getUser();

    if (!email || !pass) {
        setMessage(msgElem, 'Please enter both email and password.', 'error');
        return;
    }

    if (!user || user.email !== email.trim().toLowerCase()) {
        setMessage(msgElem, 'Invalid email or password.', 'error');
        return;
    }

    const passHash = await hashPassword(pass);
    if (passHash === user.passwordHash) {
        setMessage(msgElem, 'Login successful.', 'success');
        setTimeout(() => showDashboard(user.name), 700);
    } else {
        setMessage(msgElem, 'Invalid email or password.', 'error');
    }
}

function logout() {
    // For demo, we simply return to login view; user data remains in storage
    showLogin();
    const msg = document.getElementById('loginMsg');
    setMessage(msg, 'You have been logged out.', 'success');
    // hide profile badge
    const pb = document.getElementById('profileBadge');
    if (pb) pb.hidden = true;
}

// Wire up event listeners on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Navigation / view toggles
    document.getElementById('showSignupLink')?.addEventListener('click', (e) => { e.preventDefault(); showSignup(); });
    document.getElementById('showLoginLink')?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
    document.getElementById('navSignup')?.addEventListener('click', (e) => { e.preventDefault(); showSignup(); });

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    document.getElementById('profileLogout')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    // Password toggle buttons
    document.querySelectorAll('.pw-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; btn.setAttribute('aria-pressed','true'); }
            else { input.type = 'password'; btn.textContent = 'Show'; btn.setAttribute('aria-pressed','false'); }
        });
    });

    // SPA forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginMsg = document.getElementById('loginMsg');
    const signupMsg = document.getElementById('signupMsg');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLoginForm(loginForm, loginMsg);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignupForm(signupForm, signupMsg);
        });
    }

    // Standalone signup page form (if present)
    const signupStandalone = document.getElementById('signupFormStandalone');
    const signupStandaloneMsg = document.getElementById('signupMsg');
    if (signupStandalone) {
        signupStandalone.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignupForm(signupStandalone, signupStandaloneMsg);
        });
    }

    // If a user is already signed in, show dashboard
    const existingUser = getUser();
    if (existingUser) {
        // Do not auto-login — keep user on login page but show friendly hint
        const msg = document.getElementById('loginMsg');
        if (msg) setMessage(msg, `Account found for ${existingUser.email}. Sign in to continue.`, 'success');
    }
});
