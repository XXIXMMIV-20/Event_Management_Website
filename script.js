/* ==========================================================================
   KEVENTA APPLICATION LOGIC (script.js)
   ========================================================================== */

const DROWNING_THEME = {
    name: 'drowning (participant)',
    bg: '#121520', panel: '#191e2b', panelHover: '#212838', border: '#262e42',
    sub: '#586987', text: '#9bb1d6', bright: '#dce7fa', main: '#4a88ff', banner: '#5275ab', bannerEdge: '#3b5988'
};

const ORGANIZER_THEME = {
    name: 'carbon-amber (organizer studio)',
    bg: '#101216', panel: '#171b22', panelHover: '#1f2530', border: '#2b3240',
    sub: '#7c8698', text: '#d1d7e0', bright: '#ffffff', main: '#f59e0b', banner: '#92400e', bannerEdge: '#5c2808'
};

const LIGHT_DROWNING_THEME = {
    name: 'drowning-light',
    bg: '#eef2f9', panel: '#ffffff', panelHover: '#e2e8f4', border: '#cbd5e8',
    sub: '#5b6e8c', text: '#2b3a55', bright: '#0f172a', main: '#2563eb', banner: '#6082b6', bannerEdge: '#4a699c'
};

const LIGHT_ORGANIZER_THEME = {
    name: 'organizer-amber-light',
    bg: '#faf6f0', panel: '#ffffff', panelHover: '#f3ece1', border: '#e5d7c3',
    sub: '#786652', text: '#3d3124', bright: '#1c140d', main: '#d97706', banner: '#b45309', bannerEdge: '#78350f'
};

const DEFAULT_EVENTS = [
    {
        id: 1, title: "deep ocean shaders & webgl jam", category: "Tech", date: "Nov 24, 2026", time: "06:00 PM - 09:30 PM",
        price: "Free Entry", seatsLeft: 28, isoDate: "2026-11-24T18:00:00Z", venue: "Silicon Auditorium, Tech City",
        organizer: "Cyberpunk Labs", featured: true, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
        description: "Join top creative technologists to build realtime GPU shaders, fluid ocean simulations, and WebGL particle systems."
    },
    {
        id: 2, title: "swiss typography & modular grid lab", category: "Design", date: "Dec 02, 2026", time: "02:00 PM - 05:30 PM",
        price: "Free Entry", seatsLeft: 19, isoDate: "2026-12-02T14:00:00Z", venue: "Studio 4, Geneva",
        organizer: "Bauhaus Guild", featured: true, image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        description: "An intensive masterclass examining asymmetric grids, negative space, and modern typographic hierarchies."
    }
];

function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return parsed == null ? fallback : parsed;
    } catch (error) {
        console.warn(`Invalid localStorage value for "${key}". Using defaults.`, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Could not save "${key}" to localStorage.`, error);
        showToast('Unable to save changes. Browser storage may be full.', 'error');
        return false;
    }
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

function makeTicketId() {
    return `TICK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

let eventsList = asArray(readStorage('kexplore_events', [...DEFAULT_EVENTS]));
let registrations = asArray(readStorage('kexplore_registrations', []));
let savedEvents = asArray(readStorage('kexplore_saved', []));
let userAccounts = asArray(readStorage('keventa_accounts', []));
let currentUser = readStorage('kexplore_user', { name: '', email: '', role: 'participant', loggedIn: false });
if (!currentUser || typeof currentUser !== 'object') currentUser = { name: '', email: '', role: 'participant', loggedIn: false };
let isLightMode = readStorage('kexplore_lightmode', false) === true;
let activeCategory = 'All';
let featuredOnly = false;
let savedOnly = false;
let currentActiveEvent = null;
let currentOrganizerInspectedEventId = null;
let pendingDeleteEventId = null;
let uploadedImageDataUrl = '';

function animateOpenModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    document.body.classList.add('modal-open');
    modal.classList.remove('hidden', 'is-closing');
    void modal.offsetWidth;
    modal.classList.add('is-open');
}

function animateCloseModal(modalId, callback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.classList.add('is-closing');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('is-closing');
        if (typeof callback === 'function') callback();
    }, 380);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `p-3.5 rounded-xl border text-xs font-medium shadow-xl backdrop-blur-md transition-all transform translate-y-2 opacity-0 pointer-events-auto flex items-center justify-between gap-3 mt-panel border mt-border mt-bright`;
    const iconName = type === 'error' ? 'alert-circle' : 'check-circle-2';
    const iconColor = type === 'error' ? 'text-rose-400' : 'mt-main';
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2';
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', iconName);
    icon.className = `w-4 h-4 ${iconColor}`;
    const text = document.createElement('span');
    text.textContent = String(message);
    row.append(icon, text);
    toast.appendChild(row);
    container.appendChild(toast);
    if (window.lucide?.createIcons) lucide.createIcons();
    requestAnimationFrame(() => toast.classList.remove('translate-y-2', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

function openAuthGateScreen() {
    const gate = document.getElementById('auth-gate-screen');
    if (gate) gate.classList.remove('hidden');
    switchAuthMode('signin');
    selectGateRole(currentUser.role || 'participant');
    if (window.lucide?.createIcons) lucide.createIcons();
}

function handleUserLogout() {
    currentUser = { name: '', email: '', role: 'participant', loggedIn: false };
    writeStorage('kexplore_user', currentUser);
    updateAuthHeaderUI();
    openAuthGateScreen();
    showToast('Logged out successfully.');
}

function switchAuthMode(mode) {
    document.getElementById('gate-auth-mode').value = mode;
    const tabSignIn = document.getElementById('auth-tab-signin');
    const tabSignUp = document.getElementById('auth-tab-signup');
    const nameWrapper = document.getElementById('gate-name-wrapper');
    const subtitle = document.getElementById('gate-subtitle');
    const errEl = document.getElementById('gate-error-msg');
    if (errEl) errEl.classList.add('hidden');

    if (mode === 'signup') {
        tabSignUp.className = `py-2 rounded-lg text-xs font-extrabold bg-[#4a88ff] text-slate-950 transition-all`;
        tabSignIn.className = 'py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all';
        nameWrapper.classList.remove('hidden');
        subtitle.textContent = 'Create a new Keventa account';
    } else {
        tabSignIn.className = `py-2 rounded-lg text-xs font-extrabold bg-[#4a88ff] text-slate-950 transition-all`;
        tabSignUp.className = 'py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all';
        nameWrapper.classList.add('hidden');
        subtitle.textContent = 'Sign in to your account to continue';
    }
}

function toggleAuthModeLink() {
    const currentMode = document.getElementById('gate-auth-mode').value;
    switchAuthMode(currentMode === 'signin' ? 'signup' : 'signin');
}

function selectGateRole(role) {
    role = role === 'organizer' ? 'organizer' : 'participant';
    const selected = document.getElementById('gate-selected-role');
    const partCard = document.getElementById('gate-role-participant');
    const orgCard = document.getElementById('gate-role-organizer');
    if (selected) selected.value = role;
    if (!partCard || !orgCard) return;
    if (role === 'organizer') {
        orgCard.className = 'w-full px-4 py-3 rounded-xl border-2 border-amber-400 bg-amber-500/10 flex items-center justify-between text-left transition-all';
        partCard.className = 'w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between text-left transition-all';
    } else {
        partCard.className = 'w-full px-4 py-3 rounded-xl border-2 border-[#4a88ff] bg-[#4a88ff]/10 flex items-center justify-between text-left transition-all';
        orgCard.className = 'w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between text-left transition-all';
    }
    const participantBadge = document.getElementById('gate-badge-participant');
    const organizerBadge = document.getElementById('gate-badge-organizer');
    participantBadge?.classList.toggle('bg-[#4a88ff]', role === 'participant');
    participantBadge?.classList.toggle('bg-slate-700', role !== 'participant');
    organizerBadge?.classList.toggle('bg-amber-400', role === 'organizer');
    organizerBadge?.classList.toggle('bg-slate-700', role !== 'organizer');
}

function handleGateLoginSubmit(e) {
    e.preventDefault();
    const modeEl = document.getElementById('gate-auth-mode');
    const roleEl = document.getElementById('gate-selected-role');
    const nameEl = document.getElementById('gate-input-name');
    const emailEl = document.getElementById('gate-input-email');
    const passEl = document.getElementById('gate-input-pass');
    const errEl = document.getElementById('gate-error-msg');
    if (!modeEl || !roleEl || !emailEl || !passEl || !errEl) return;

    const mode = modeEl.value;
    const role = roleEl.value === 'organizer' ? 'organizer' : 'participant';
    const nameInput = nameEl ? nameEl.value.trim() : '';
    const email = emailEl.value.trim().toLowerCase();
    const password = passEl.value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
        errEl.textContent = 'Please fill in all required fields.';
        errEl.classList.remove('hidden');
        return;
    }

    if (mode === 'signup') {
        if (!nameInput) {
            errEl.textContent = 'Please enter your name to create an account.';
            errEl.classList.remove('hidden');
            return;
        }
        const existing = userAccounts.find(acc => String(acc.email || '').toLowerCase() === email);
        if (existing) {
            errEl.textContent = 'Account already exists. Please Sign In.';
            errEl.classList.remove('hidden');
            return;
        }
        const newAccount = { name: nameInput, email, password, role, profileCompleted: false };
        userAccounts.push(newAccount);
        if (!writeStorage('keventa_accounts', userAccounts)) {
            userAccounts.pop();
            return;
        }
        currentUser = { ...newAccount, loggedIn: true };
    } else {
        const existing = userAccounts.find(acc => String(acc.email || '').toLowerCase() === email);
        if (!existing) {
            errEl.textContent = 'Email ID not registered. Please Sign Up.';
            errEl.classList.remove('hidden');
            return;
        }
        if (existing.password !== password) {
            errEl.textContent = 'Incorrect password.';
            errEl.classList.remove('hidden');
            return;
        }
        // The account's saved role is authoritative during sign-in.
        currentUser = { ...existing, role: existing.role === 'organizer' ? 'organizer' : 'participant', loggedIn: true };
    }

    if (!writeStorage('kexplore_user', currentUser)) return;
    document.getElementById('auth-gate-screen')?.classList.add('hidden');
    applyRoleWorkspaceView();
    showToast(`Signed in as ${currentUser.name}`);
}

function toggleProfileDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('profile-dropdown-menu');
    if (menu) menu.classList.toggle('hidden');
}

function closeProfileDropdown() {
    const menu = document.getElementById('profile-dropdown-menu');
    if (menu) menu.classList.add('hidden');
}

function openProfileModal() {
    document.getElementById('profile-input-name').value = currentUser.name || '';
    document.getElementById('profile-input-email').value = currentUser.email || '';
    document.getElementById('profile-input-phone').value = currentUser.phone || '';
    document.getElementById('profile-input-org').value = currentUser.org || '';
    document.getElementById('profile-input-city').value = currentUser.city || '';
    document.getElementById('profile-input-bio').value = currentUser.bio || '';
    animateOpenModal('profile-modal');
}

function closeProfileModal() { animateCloseModal('profile-modal'); }

function handleProfileFormSubmit(e) {
    e.preventDefault();
    currentUser.name = getValue('profile-input-name').trim();
    currentUser.phone = getValue('profile-input-phone').trim();
    currentUser.org = getValue('profile-input-org').trim();
    currentUser.city = getValue('profile-input-city').trim();
    currentUser.bio = getValue('profile-input-bio').trim();
    const error = document.getElementById('profile-form-error');
    if (!currentUser.name || !/^\d{10}$/.test(currentUser.phone) || !currentUser.org || !currentUser.city || !currentUser.bio) {
        if (error) {
            error.textContent = 'Complete all fields and enter a valid 10-digit phone number.';
            error.classList.remove('hidden');
        }
        return;
    }
    if (error) error.classList.add('hidden');
    currentUser.profileCompleted = true;
    if (!writeStorage('kexplore_user', currentUser)) return;
    updateAuthHeaderUI();
    closeProfileModal();
    showToast('Profile saved!');
}

function applyRoleWorkspaceView() {
    const participantMain = document.getElementById('main-page-view');
    const organizerMain = document.getElementById('organizer-workspace-view');
    const orgNavBtn = document.getElementById('organizer-nav-btn');

    if (currentUser.role === 'organizer') {
        participantMain.classList.add('hidden');
        organizerMain.classList.remove('hidden');
        if (orgNavBtn) orgNavBtn.classList.remove('hidden');
        switchOrganizerSubView('dashboard');
        renderOrganizerPostedEvents();
    } else {
        organizerMain.classList.add('hidden');
        participantMain.classList.remove('hidden');
        if (orgNavBtn) orgNavBtn.classList.add('hidden');
        renderEventsGrid();
    }
    updateAuthHeaderUI();
    if (window.lucide?.createIcons) lucide.createIcons();
}

function switchOrganizerSubView(view) {
    const dashSec = document.getElementById('org-subview-dashboard');
    const createSec = document.getElementById('org-subview-create');
    if (view === 'create') {
        dashSec.classList.add('hidden');
        createSec.classList.remove('hidden');
    } else {
        createSec.classList.add('hidden');
        dashSec.classList.remove('hidden');
        renderOrganizerPostedEvents();
    }
    if (window.lucide?.createIcons) lucide.createIcons();
}

function updateOrganizerKPIStats() {
    const totalEvents = eventsList.length;
    const totalRegs = registrations.length;
    const checkedInCount = registrations.filter(r => r.attended).length;
    const rate = totalRegs > 0 ? Math.round((checkedInCount / totalRegs) * 100) : 0;

    setText('org-stat-events', String(totalEvents).padStart(2, '0'));
    setText('org-stat-regs', String(totalRegs).padStart(2, '0'));
    setText('org-stat-checkedin', String(checkedInCount).padStart(2, '0'));
    setText('org-stat-rate', `${rate}%`);
}

function renderOrganizerPostedEvents() {
    updateOrganizerKPIStats();
    const grid = document.getElementById('org-posted-events-grid');
    if (!grid) return;

    const query = getValue('org-events-search').trim().toLowerCase();
    const filteredEvents = eventsList.filter(ev => [ev.title, ev.date, ev.venue, ev.category].join(' ').toLowerCase().includes(query));
    grid.innerHTML = filteredEvents.map(ev => {
        const evRegs = registrations.filter(r => Number(r.eventId) === Number(ev.id));
        const presentCount = evRegs.filter(r => r.attended).length;
        return `
            <article onclick="openOrganizerEventDetailModal('${escapeHtml(ev.id)}')" class="event-card mt-panel border mt-border rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group p-4 space-y-3">
                <h3 class="logo-font text-lg font-extrabold mt-bright">${escapeHtml(ev.title)}</h3>
                <p class="text-xs mt-sub">${escapeHtml(ev.date)} • ${escapeHtml(ev.venue)}</p>
                <div class="text-xs text-emerald-400 font-bold">✓ ${presentCount}/${evRegs.length} present</div>
            </article>
        `;
    }).join('');
    if (window.lucide?.createIcons) lucide.createIcons();
}

function openOrganizerEventDetailModal(eventId) {
    currentOrganizerInspectedEventId = eventId;
    const ev = eventsList.find(e => Number(e.id) === Number(eventId));
    if (!ev) return;
    setText('org-detail-title', ev.title);
    setText('org-detail-date', ev.date);
    setText('org-detail-venue', ev.venue);
    setText('org-detail-desc', ev.description || ev.story || '');
    setText('org-detail-cat', ev.category || 'Event');
    setImage('org-detail-img', ev.image);
    renderOrganizerParticipantRoster();
    animateOpenModal('organizer-event-detail-modal');
}

function closeOrganizerEventDetailModal() {
    animateCloseModal('organizer-event-detail-modal');
}

function renderOrganizerParticipantRoster() {
    const evRegs = registrations.filter(r => Number(r.eventId) === Number(currentOrganizerInspectedEventId));
    document.getElementById('org-detail-reg-count').textContent = evRegs.length;
    document.getElementById('org-detail-present-count').textContent = evRegs.filter(r => r.attended).length;
    document.getElementById('org-detail-pending-count').textContent = evRegs.filter(r => !r.attended).length;
    const inspectedEvent = eventsList.find(e => Number(e.id) === Number(currentOrganizerInspectedEventId));
    setText('org-detail-seats-left', inspectedEvent ? Math.max(0, Number(inspectedEvent.seatsLeft) || 0) : '—');

    const rosterBody = document.getElementById('org-participant-roster-body');
    if (!rosterBody) return;
    if (evRegs.length === 0) {
        rosterBody.innerHTML = `<p class="text-xs mt-sub text-center py-6">No participants registered yet.</p>`;
        return;
    }
    const query = getValue('org-participant-search').trim().toLowerCase();
    const visibleRegs = evRegs.filter(r => `${r.name} ${r.email} ${r.regId}`.toLowerCase().includes(query));
    rosterBody.innerHTML = visibleRegs.map(r => `
        <div class="p-3 rounded-xl mt-bg border mt-border flex items-center justify-between gap-3">
            <div>
                <div class="text-xs font-bold mt-bright">${escapeHtml(r.name)} (${escapeHtml(r.email)})</div>
                <div class="text-[10px] mt-sub">Ticket ID: ${escapeHtml(r.regId)}</div>
            </div>
            <button onclick="toggleParticipantAttendance('${escapeHtml(r.regId)}')" class="px-3 py-1.5 rounded-lg text-xs font-bold ${r.attended ? 'bg-emerald-500 text-slate-950' : 'mt-panel mt-border mt-bright'}">
                ${r.attended ? '✓ Present' : 'Mark Present'}
            </button>
        </div>
    `).join('') || `<p class="text-xs mt-sub text-center py-6">No matching participants.</p>`;
    if (window.lucide?.createIcons) lucide.createIcons();
}

function toggleParticipantAttendance(regId) {
    const target = registrations.find(r => r.regId === regId);
    if (target) {
        target.attended = !target.attended;
        writeStorage('kexplore_registrations', registrations);
        renderOrganizerParticipantRoster();
        updateOrganizerKPIStats();
        showToast('Attendance updated');
    }
}

function handleAddWalkInParticipant(e) {
    e.preventDefault();
    const ev = eventsList.find(item => Number(item.id) === Number(currentOrganizerInspectedEventId));
    if (!ev) return showToast('Select an event first.', 'error');

    const name = getValue('walkin-name').trim();
    const email = getValue('walkin-email').trim().toLowerCase();
    const phone = getValue('walkin-phone').trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone)) {
        return showToast('Enter a valid name, email, and 10-digit phone number.', 'error');
    }
    if (Number(ev.seatsLeft) <= 0) return showToast('This event has no seats remaining.', 'error');

    registrations.unshift({
        regId: makeTicketId(), eventId: Number(ev.id), eventTitle: ev.title,
        name, email, phone, attended: true, timestamp: new Date().toISOString(),
        userEmail: email, walkIn: true
    });
    ev.seatsLeft = Math.max(0, Number(ev.seatsLeft) - 1);
    if (!writeStorage('kexplore_registrations', registrations) || !writeStorage('kexplore_events', eventsList)) {
        registrations.shift();
        ev.seatsLeft += 1;
        return;
    }
    ['walkin-name', 'walkin-email', 'walkin-phone'].forEach(id => setValue(id, ''));
    renderOrganizerParticipantRoster();
    renderOrganizerPostedEvents();
    updateOrganizerKPIStats();
    showToast('Walk-in participant checked in!');
}

function openCreateNewEventForm() {
    const form = document.getElementById('org-full-create-form');
    if (form) form.reset();
    uploadedImageDataUrl = '';
    setValue('org-editing-event-id', '');
    setText('org-form-mode-badge', 'create event');
    setText('org-form-heading', 'Publish a new event');
    setText('org-form-submit-label', 'publish event');
    switchOrganizerSubView('create');
}

function cancelEditOrCreateEvent() {
    setValue('org-editing-event-id', '');
    switchOrganizerSubView('dashboard');
}

function handleCreateEventSubmit(e) {
    e.preventDefault();
    const title = getValue('org-event-title').trim();
    const category = getValue('org-event-category');
    const date = getValue('org-event-date').trim();
    const time = getValue('org-event-time').trim();
    const venue = getValue('org-event-venue').trim();
    const price = getValue('org-event-price').trim();
    const seatsLeft = Number(getValue('org-event-seats'));
    const description = getValue('org-event-desc').trim();
    const story = getValue('org-event-story').trim();
    const featured = !!document.getElementById('org-event-featured')?.checked;
    const editingId = getValue('org-editing-event-id');
    const existing = editingId ? eventsList.find(ev => String(ev.id) === String(editingId)) : null;

    if (!title || !date || !time || !venue || !price || !description || !story ||
        !Number.isInteger(seatsLeft) || seatsLeft < 5 || seatsLeft > 1000) {
        showToast('Complete all required fields and enter capacity between 5 and 1000.', 'error');
        return;
    }

    const posterImg = uploadedImageDataUrl || getValue('org-event-url').trim() ||
        (existing && existing.image) ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';
    const registeredCount = existing ? registrations.filter(r => Number(r.eventId) === Number(existing.id)).length : 0;
    const eventData = {
        ...(existing || {}),
        id: existing ? existing.id : Date.now(),
        title, category, date, time, price,
        seatsLeft: existing ? Math.max(0, seatsLeft - registeredCount) : seatsLeft,
        capacity: existing ? Math.max(seatsLeft, registeredCount) : seatsLeft,
        isoDate: existing?.isoDate || (() => {
            const parsed = Date.parse(`${date} ${time.split('-')[0].trim()}`);
            return Number.isFinite(parsed) ? new Date(parsed).toISOString() : '';
        })(),
        venue, organizer: existing?.organizer || currentUser.name,
        organizerEmail: existing?.organizerEmail || currentUser.email,
        featured, image: posterImg, description, story
    };

    if (existing) eventsList = eventsList.map(ev => String(ev.id) === String(existing.id) ? eventData : ev);
    else eventsList.unshift(eventData);
    if (!writeStorage('kexplore_events', eventsList)) return;

    uploadedImageDataUrl = '';
    setValue('org-editing-event-id', '');
    switchOrganizerSubView('dashboard');
    renderEventsGrid();
    renderOrganizerPostedEvents();
    showToast(existing ? 'Event updated successfully!' : 'Event published successfully!');
}

function handleOrganizerFilePreview(e) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please select an image file.', 'error');
    if (file.size > 3 * 1024 * 1024) return showToast('Poster must be 3 MB or smaller.', 'error');
    const reader = new FileReader();
    reader.onload = evt => {
        uploadedImageDataUrl = typeof evt.target?.result === 'string' ? evt.target.result : '';
        if (uploadedImageDataUrl) showToast('Poster uploaded');
    };
    reader.onerror = () => showToast('Could not read poster file.', 'error');
    reader.readAsDataURL(file);
}

function handleOrganizerUrlPreview(url) {
    const trimmed = String(url || '').trim();
    if (!trimmed) { uploadedImageDataUrl = ''; return; }
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Invalid protocol');
        uploadedImageDataUrl = parsed.href;
    } catch {
        uploadedImageDataUrl = '';
    }
}
function fillSampleOrganizerEventForm() {
    document.getElementById('org-event-title').value = 'AI & Future Tech Summit';
    document.getElementById('org-event-date').value = 'Jan 15, 2027';
    document.getElementById('org-event-time').value = '10:00 AM - 04:00 PM';
    document.getElementById('org-event-venue').value = 'Silicon Hall, Bengaluru';
    document.getElementById('org-event-desc').value = 'Exploring generative AI and backend architectures.';
    document.getElementById('org-event-story').value = 'Deep-dive technical sessions and live demos.';
    showToast('Sample filled!');
}

function renderEventsGrid() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;
    const query = (getValue('search-input') || '').trim().toLowerCase();
    const sort = getValue('sort-select') || 'featured';
    let filtered = eventsList.filter(ev => {
        const matchesCategory = activeCategory === 'All' || String(ev.category || '').toLowerCase() === activeCategory.toLowerCase();
        const matchesFeatured = !featuredOnly || !!ev.featured;
        const matchesSaved = !savedOnly || savedEvents.some(id => String(id) === String(ev.id));
        const haystack = [ev.title, ev.category, ev.venue, ev.organizer, ev.description, ev.story].join(' ').toLowerCase();
        return matchesCategory && matchesFeatured && matchesSaved && haystack.includes(query);
    });
    filtered.sort((a, b) => {
        if (sort === 'title') return String(a.title).localeCompare(String(b.title));
        if (sort === 'date') return eventTimestamp(a) - eventTimestamp(b);
        return Number(!!b.featured) - Number(!!a.featured) || eventTimestamp(a) - eventTimestamp(b);
    });

    grid.innerHTML = filtered.map(ev => `
        <article class="event-card mt-panel border mt-border rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer p-5 space-y-4" role="button" tabindex="0" aria-label="Open event: ${escapeHtml(ev.title)}" onclick="openRegistrationModal('${escapeHtml(ev.id)}')" onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault();openRegistrationModal('${escapeHtml(ev.id)}');}">
            <div class="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-950">
                <img src="${escapeHtml(ev.image || '')}" alt="${escapeHtml(ev.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
            <div class="space-y-2">
                <div class="text-[11px] mt-sub">${escapeHtml(ev.date || '')}</div>
                <h3 class="logo-font text-lg font-extrabold mt-bright">${escapeHtml(ev.title || 'Untitled event')}</h3>
                <p class="text-xs mt-text line-clamp-2">${escapeHtml(ev.description || '')}</p>
                <div class="text-[10px] mt-sub">${escapeHtml(ev.category || '')} · ${escapeHtml(ev.price || 'Free Entry')} · ${Math.max(0, Number(ev.seatsLeft) || 0)} seats</div>
            </div>
        </article>
    `).join('');
    setText('results-count-label', `showing ${filtered.length} of ${eventsList.length} events`);
    document.getElementById('no-results')?.classList.toggle('hidden', filtered.length > 0);
    document.getElementById('clear-search-btn')?.classList.toggle('hidden', !query);
    updateFilterButtons();
    if (window.lucide?.createIcons) lucide.createIcons();
}

function openRegistrationModal(eventId) {
    const ev = eventsList.find(e => String(e.id) === String(eventId));
    if (!ev) return showToast('Event not found.', 'error');
    currentActiveEvent = ev;
    setValue('reg-event-id', ev.id);
    setImage('reg-fullscreen-bg', ev.image);
    setText('modal-event-title', ev.title);
    setText('modal-event-date', ev.date);
    setText('modal-event-time', ev.time || 'Time to be announced');
    setText('modal-event-venue', ev.venue);
    setText('modal-event-organizer', ev.organizer || 'Keventa');
    setText('modal-event-cat', ev.category || 'Event');
    setText('modal-event-price', ev.price || 'Free Entry');
    setText('modal-event-tagline', ev.story || ev.description || 'Join us for an unforgettable event.');
    updateEventCapacityUI(ev);

    const selectEl = document.getElementById('input-selected-event');
    if (selectEl) {
        selectEl.innerHTML = eventsList.map(item =>
            `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`
        ).join('');
        selectEl.value = String(ev.id);
    }
    document.getElementById('participant-reg-form')?.reset();
    if (selectEl) selectEl.value = String(ev.id); // reset() selects the first option; restore the clicked event.
    document.getElementById('participant-reg-form')?.classList.remove('hidden');
    document.getElementById('reg-success-container')?.classList.add('hidden');
    updateBookmarkButton();
    animateOpenModal('registration-modal');
    if (window.lucide?.createIcons) lucide.createIcons();
}

function handleSelectedEventChange(eventId) {
    const ev = eventsList.find(item => String(item.id) === String(eventId));
    if (!ev) return;
    currentActiveEvent = ev;
    setValue('reg-event-id', ev.id);
    setImage('reg-fullscreen-bg', ev.image);
    setText('modal-event-title', ev.title);
    setText('modal-event-date', ev.date);
    setText('modal-event-time', ev.time || 'Time to be announced');
    setText('modal-event-venue', ev.venue);
    setText('modal-event-organizer', ev.organizer || 'Keventa');
    setText('modal-event-cat', ev.category || 'Event');
    setText('modal-event-price', ev.price || 'Free Entry');
    setText('modal-event-tagline', ev.story || ev.description || 'Join us for an unforgettable event.');
    updateEventCapacityUI(ev);
    updateBookmarkButton();
}

function closeRegistrationModal() { animateCloseModal('registration-modal'); }

function handleParticipantRegistration(e) {
    e.preventDefault();
    const eventId = getValue('input-selected-event') || getValue('reg-event-id');
    const name = getValue('input-part-name').trim();
    const email = getValue('input-part-email').trim().toLowerCase();
    const phone = getValue('input-part-phone').trim();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone)) {
        showToast('Enter a valid name, email, and 10-digit phone number.', 'error');
        return;
    }
    const ev = eventsList.find(item => String(item.id) === String(eventId));
    if (!ev) return showToast('The selected event could not be found.', 'error');
    if (!currentUser?.loggedIn) return showToast('Please sign in before registering.', 'error');
    if (Number(ev.seatsLeft) <= 0) return showToast('Sorry, this event is fully booked.', 'error');

    const duplicate = registrations.some(r =>
        String(r.eventId) === String(ev.id) && String(r.email || '').toLowerCase() === email
    );
    if (duplicate) return showToast('This email is already registered for the event.', 'error');

    const registration = {
        regId: makeTicketId(), eventId: Number(ev.id), eventTitle: ev.title,
        name, email, phone, attended: false, timestamp: new Date().toISOString(),
        userEmail: currentUser.email || email
    };
    ev.seatsLeft = Math.max(0, Number(ev.seatsLeft) - 1);
    registrations.push(registration);

    if (!writeStorage('kexplore_events', eventsList) || !writeStorage('kexplore_registrations', registrations)) {
        registrations = registrations.filter(r => r.regId !== registration.regId);
        ev.seatsLeft += 1;
        return;
    }
    updateTicketsBadge();
    updateEventCapacityUI(ev);
    document.getElementById('participant-reg-form')?.classList.add('hidden');
    document.getElementById('reg-success-container')?.classList.remove('hidden');
    setText('reg-success-summary', `Registered ${name} for ${ev.title}. Ticket: ${registration.regId}`);
    renderEventsGrid();
    showToast('Registration complete!');
}

function openMyTicketsModal() {
    const container = document.getElementById('tickets-list-container');
    if (!container) return;
    const myRegistrations = registrations.filter(t =>
        !currentUser?.email || !t.userEmail || String(t.userEmail).toLowerCase() === String(currentUser.email).toLowerCase()
    );
    if (myRegistrations.length === 0) {
        container.innerHTML = `<p class="text-xs mt-sub text-center py-6">No registrations found.</p>`;
    } else {
        container.innerHTML = myRegistrations.map(t => `
            <div class="p-3 rounded-xl mt-bg border mt-border flex items-center justify-between gap-3">
                <div>
                    <div class="text-xs font-bold mt-bright">${escapeHtml(t.eventTitle)}</div>
                    <div class="text-[10px] mt-sub">Ticket: ${escapeHtml(t.regId)} • ${escapeHtml(t.name)}</div>
                    <div class="text-[10px] mt-sub">${t.attended ? 'Checked in' : 'Registered'}</div>
                </div>
                ${t.attended ? '' : `<button onclick="cancelRegistrationTicket('${escapeHtml(t.regId)}')" class="text-rose-400 text-xs font-bold">Cancel</button>`}
            </div>
        `).join('');
    }
    animateOpenModal('tickets-modal');
    if (window.lucide?.createIcons) lucide.createIcons();
}

function closeMyTicketsModal() { animateCloseModal('tickets-modal'); }
function cancelRegistrationTicket(regId) {
    const ticket = registrations.find(t => String(t.regId) === String(regId));
    if (!ticket) return;
    if (ticket.attended) return showToast('Checked-in tickets cannot be cancelled.', 'error');
    const ev = eventsList.find(item => String(item.id) === String(ticket.eventId));
    registrations = registrations.filter(t => String(t.regId) !== String(regId));
    if (ev) ev.seatsLeft = Math.max(0, Number(ev.seatsLeft) || 0) + 1;
    if (!writeStorage('kexplore_registrations', registrations) || !writeStorage('kexplore_events', eventsList)) return;
    updateTicketsBadge();
    renderEventsGrid();
    openMyTicketsModal();
    showToast('Ticket cancelled.');
}

function updateTicketsBadge() {
    const badge = document.getElementById('tickets-count-badge');
    if (!badge) return;
    const count = registrations.filter(reg =>
        !currentUser?.email || !reg.userEmail ||
        String(reg.userEmail).toLowerCase() === String(currentUser.email).toLowerCase()
    ).length;
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function returnToHomepageDefault() {
    closeRegistrationModal();
    closeOrganizerEventDetailModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToEvents() {
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
}

function toggleColorMode() {
    isLightMode = !isLightMode;
    writeStorage('kexplore_lightmode', isLightMode);
    document.body.classList.toggle('light-mode', isLightMode);
    showToast(`Switched to ${isLightMode ? 'light' : 'dark'} mode`);
}

function updateAuthHeaderUI() {
    const display = document.getElementById('auth-user-display');
    const avatar = document.getElementById('auth-user-avatar');
    const incomplete = document.getElementById('profile-incomplete-dot');
    if (display) display.textContent = currentUser?.loggedIn ? (currentUser.name || 'Account') : 'Profile';
    if (avatar) avatar.textContent = currentUser?.loggedIn ? String(currentUser.name || 'U').trim().charAt(0).toUpperCase() : 'U';
    if (incomplete) incomplete.classList.toggle('hidden', !!currentUser?.profileCompleted);
    const welcome = document.getElementById('org-welcome-name');
    if (welcome) welcome.textContent = currentUser?.name || 'Organizer';
}


/* Shared DOM helpers and UI handlers required by index.html */
function getValue(id) {
    const el = document.getElementById(id);
    return el && 'value' in el ? String(el.value ?? '') : '';
}
function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && 'value' in el) el.value = value == null ? '' : String(value);
}
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value ?? '');
}
function setImage(id, src) {
    const el = document.getElementById(id);
    if (el && src) el.src = String(src);
}
function eventTimestamp(ev) {
    if (ev?.isoDate) {
        const value = Date.parse(ev.isoDate);
        if (Number.isFinite(value)) return value;
    }
    const value = Date.parse(ev?.date || '');
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}
function updateEventCapacityUI(ev) {
    const remaining = Math.max(0, Number(ev?.seatsLeft) || 0);
    const capacity = Math.max(1, Number(ev?.capacity) || remaining || 1);
    setText('modal-event-seats', `${remaining} seats left`);
    const bar = document.getElementById('modal-seats-bar');
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, remaining / capacity * 100))}%`;
}
function updateFilterButtons() {
    const featured = document.getElementById('mode-featured');
    const saved = document.getElementById('mode-saved');
    featured?.classList.toggle('mt-main', featuredOnly);
    featured?.classList.toggle('mt-sub', !featuredOnly);
    saved?.classList.toggle('mt-main', savedOnly);
    saved?.classList.toggle('mt-sub', !savedOnly);
    document.querySelectorAll('.cat-pill[data-cat]').forEach(button => {
        const active = (button.dataset.cat || 'All') === activeCategory;
        button.classList.toggle('mt-main', active);
        button.classList.toggle('font-semibold', active);
        button.classList.toggle('mt-sub', !active);
    });
}
function filterByFeatured() {
    featuredOnly = true;
    savedOnly = false;
    activeCategory = 'All';
    renderEventsGrid();
}
function toggleFeaturedFilter() {
    featuredOnly = !featuredOnly;
    if (featuredOnly) savedOnly = false;
    renderEventsGrid();
}
function toggleSavedFilter() {
    savedOnly = !savedOnly;
    if (savedOnly) featuredOnly = false;
    renderEventsGrid();
}
function resetFilters() {
    activeCategory = 'All';
    featuredOnly = false;
    savedOnly = false;
    setValue('search-input', '');
    setValue('sort-select', 'featured');
    renderEventsGrid();
}
function clearSearchInput() {
    setValue('search-input', '');
    renderEventsGrid();
}
function handleHeaderExploreClick() {
    returnToHomepageDefault();
    resetFilters();
    scrollToEvents();
}
function toggleBookmarkCurrentEvent() {
    if (!currentActiveEvent) return;
    const id = String(currentActiveEvent.id);
    const exists = savedEvents.some(savedId => String(savedId) === id);
    savedEvents = exists ? savedEvents.filter(savedId => String(savedId) !== id) : [...savedEvents, currentActiveEvent.id];
    if (!writeStorage('kexplore_saved', savedEvents)) return;
    updateBookmarkButton();
    renderEventsGrid();
    showToast(exists ? 'Event removed from saved events.' : 'Event saved.');
}
function updateBookmarkButton() {
    const button = document.getElementById('modal-bookmark-btn');
    const label = document.getElementById('modal-bookmark-label');
    const saved = !!currentActiveEvent && savedEvents.some(id => String(id) === String(currentActiveEvent.id));
    if (label) label.textContent = saved ? 'saved' : 'save';
    if (button) button.setAttribute('aria-pressed', String(saved));
}
async function shareCurrentEvent() {
    if (!currentActiveEvent) return;
    const shareData = {
        title: currentActiveEvent.title,
        text: `${currentActiveEvent.title} — ${currentActiveEvent.date} at ${currentActiveEvent.venue}`,
        url: `${location.href.split('#')[0]}#event-${encodeURIComponent(currentActiveEvent.id)}`
    };
    try {
        if (navigator.share) await navigator.share(shareData);
        else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareData.url);
            showToast('Event link copied.');
        } else showToast('Sharing is not supported in this browser.', 'error');
    } catch (error) {
        if (error?.name !== 'AbortError') showToast('Could not share this event.', 'error');
    }
}
function editOrganizerEvent(eventId) {
    const ev = eventsList.find(item => String(item.id) === String(eventId));
    if (!ev) return showToast('Event not found.', 'error');
    animateCloseModal('organizer-event-detail-modal');
    const form = document.getElementById('org-full-create-form');
    if (form) form.reset();
    setValue('org-editing-event-id', ev.id);
    setValue('org-event-title', ev.title);
    setValue('org-event-category', ev.category || 'Tech');
    setValue('org-event-date', ev.date);
    setValue('org-event-time', ev.time);
    setValue('org-event-venue', ev.venue);
    setValue('org-event-price', ev.price || 'Free Entry');
    const registeredCount = registrations.filter(r => Number(r.eventId) === Number(ev.id)).length;
    setValue('org-event-seats', Number(ev.capacity) || (Number(ev.seatsLeft) + registeredCount));
    setValue('org-event-desc', ev.description);
    setValue('org-event-story', ev.story || ev.description);
    const featured = document.getElementById('org-event-featured');
    if (featured) featured.checked = !!ev.featured;
    setValue('org-event-url', ev.image && !ev.image.startsWith('data:') ? ev.image : '');
    uploadedImageDataUrl = ev.image?.startsWith('data:') ? ev.image : '';
    setText('org-form-mode-badge', 'edit event');
    setText('org-form-heading', 'Update event');
    setText('org-form-submit-label', 'save changes');
    switchOrganizerSubView('create');
}
function promptDeleteOrganizerEvent(eventId) {
    const ev = eventsList.find(item => String(item.id) === String(eventId));
    if (!ev) return showToast('Event not found.', 'error');
    pendingDeleteEventId = ev.id;
    setText('delete-event-modal-desc', `Delete "${ev.title}" and its registrations? This cannot be undone.`);
    animateOpenModal('delete-event-modal');
}
function closeDeleteEventModal() {
    pendingDeleteEventId = null;
    animateCloseModal('delete-event-modal');
}
function confirmDeleteOrganizerEvent() {
    if (pendingDeleteEventId == null) return;
    const id = pendingDeleteEventId;
    eventsList = eventsList.filter(ev => String(ev.id) !== String(id));
    registrations = registrations.filter(reg => String(reg.eventId) !== String(id));
    savedEvents = savedEvents.filter(savedId => String(savedId) !== String(id));
    if (!writeStorage('kexplore_events', eventsList) ||
        !writeStorage('kexplore_registrations', registrations) ||
        !writeStorage('kexplore_saved', savedEvents)) return;
    pendingDeleteEventId = null;
    animateCloseModal('delete-event-modal');
    animateCloseModal('organizer-event-detail-modal');
    renderOrganizerPostedEvents();
    renderEventsGrid();
    updateTicketsBadge();
    showToast('Event deleted.');
}
function markAllParticipantsAttendance(attended = true) {
    const eventId = currentOrganizerInspectedEventId;
    registrations.forEach(reg => {
        if (String(reg.eventId) === String(eventId)) reg.attended = !!attended;
    });
    if (!writeStorage('kexplore_registrations', registrations)) return;
    renderOrganizerParticipantRoster();
    updateOrganizerKPIStats();
    showToast(attended ? 'All participants marked present.' : 'Attendance reset.');
}
function selectUserRole(role) {
    role = role === 'organizer' ? 'organizer' : 'participant';
    setValue('auth-role-input', role);
    const part = document.getElementById('role-card-participant');
    const org = document.getElementById('role-card-organizer');
    if (part) part.classList.toggle('border-2', role === 'participant');
    if (org) org.classList.toggle('border-2', role === 'organizer');
}
function handleAuthFormSubmit(e) {
    e.preventDefault();
    const name = getValue('auth-name').trim();
    const email = getValue('auth-email').trim().toLowerCase();
    const password = getValue('auth-password');
    const role = getValue('auth-role-input') === 'organizer' ? 'organizer' : 'participant';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
        showToast('Enter a name, valid email, and password of at least 6 characters.', 'error');
        return;
    }
    const existing = userAccounts.find(acc => String(acc.email || '').toLowerCase() === email);
    if (existing) {
        if (existing.password !== password) return showToast('Account exists. Check your password.', 'error');
        currentUser = { ...existing, role: existing.role, loggedIn: true };
    } else {
        const account = { name, email, password, role, profileCompleted: false };
        userAccounts.push(account);
        if (!writeStorage('keventa_accounts', userAccounts)) {
            userAccounts.pop();
            return;
        }
        currentUser = { ...account, loggedIn: true };
    }
    if (!writeStorage('kexplore_user', currentUser)) return;
    animateCloseModal('auth-modal');
    applyRoleWorkspaceView();
    showToast(`Signed in as ${currentUser.name}`);
}
function closeAuthModal() { animateCloseModal('auth-modal'); }

window.addEventListener('DOMContentLoaded', function () {
    document.body.classList.toggle('light-mode', isLightMode);
    document.getElementById('auth-gate-screen')?.classList.toggle('hidden', !!currentUser?.loggedIn);
    if (currentUser?.loggedIn) applyRoleWorkspaceView();
    else openAuthGateScreen();

    document.getElementById('search-input')?.addEventListener('input', renderEventsGrid);
    document.querySelectorAll('.cat-pill[data-cat]').forEach(button => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.cat || 'All';
            renderEventsGrid();
        });
    });
    document.addEventListener('click', event => {
        const dropdown = document.getElementById('profile-dropdown-container');
        const menu = document.getElementById('profile-dropdown-menu');
        if (dropdown && menu && !dropdown.contains(event.target)) menu.classList.add('hidden');
    });
    renderEventsGrid();
    updateTicketsBadge();
    updateAuthHeaderUI();
    if (window.lucide?.createIcons) lucide.createIcons();
});
