// Mock Event Data complying with project requirements
const eventsData = [
    {
        id: 1,
        title: "AI & Future Tech Summit 2026",
        category: "Tech",
        date: "November 24, 2026",
        time: "10:00 AM - 04:00 PM",
        venue: "Silicon Auditorium, Tech City",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        description: "Join industry leaders and researchers to explore breakthrough developments in generative AI, neural networks, and scalable backend architecture."
    },
    {
        id: 2,
        title: "Full-Stack Web Dev Masterclass",
        category: "Workshop",
        date: "December 02, 2026",
        time: "02:00 PM - 06:00 PM",
        venue: "Innovation Hub, Hall B",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        description: "A hands-on coding workshop covering modern web design patterns, API integrations, and robust database management."
    },
    {
        id: 3,
        title: "Sonic Vibes Open-Air Concert",
        category: "Music",
        date: "December 15, 2026",
        time: "06:00 PM - 11:00 PM",
        venue: "Central Amphitheater",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        description: "An incredible evening of live indie music, acoustic sets, and immersive lighting displays under the stars."
    },
    {
        id: 4,
        title: "Global Esports Championship 2026",
        category: "Sports",
        date: "January 10, 2027",
        time: "11:00 AM - 08:00 PM",
        venue: "Metropolis Esports Arena",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        description: "Watch top-tier teams battle it out across racing simulators and tactical multiplayer matches for the grand championship title."
    },
    {
        id: 5,
        title: "UI/UX Design Systems Workshop",
        category: "Workshop",
        date: "January 18, 2027",
        time: "10:00 AM - 02:00 PM",
        venue: "Creative Space Studio 4",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
        description: "Learn how to build scalable design systems, responsive grids, and micro-interactions that elevate user experience."
    },
    {
        id: 6,
        title: "Cloud Infrastructure & DevOps Meetup",
        category: "Tech",
        date: "February 05, 2027",
        time: "04:00 PM - 07:00 PM",
        venue: "Cloud Cafe & Conference Center",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        description: "Deep dive into cloud server configurations, automated deployment pipelines, and high-availability server clusters."
    }
];

let currentSelectedEvent = null;
let activeCategory = 'All';

// DOM Elements
const eventsGrid = document.getElementById('events-grid');
const searchInput = document.getElementById('search-input');
const categoryButtons = document.querySelectorAll('.category-btn');
const noResultsDiv = document.getElementById('no-results');

// Render Event Cards
function renderEvents(eventsToRender) {
    eventsGrid.innerHTML = '';
    if (eventsToRender.length === 0) {
        noResultsDiv.classList.remove('hidden');
        return;
    }
    noResultsDiv.classList.add('hidden');

    eventsToRender.forEach((event, index) => {
        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col group";
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());

        card.innerHTML = `
            <div class="relative overflow-hidden h-48 sm:h-52">
                <img src="${event.image}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-brand-400 border border-slate-800">${event.category}</span>
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center gap-2 text-xs text-brand-400 font-medium mb-2">
                    <i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${event.date}
                </div>
                <h3 class="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">${event.title}</h3>
                <p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-500"></i> ${event.venue}
                </p>
                <p class="text-sm text-slate-400 mt-3 line-clamp-2">${event.description}</p>
                <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-300">${event.time}</span>
                    <button onclick="openEventDetails(${event.id})" class="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 transition-all duration-200">
                        View Details & Register
                    </button>
                </div>
            </div>
        `;
        eventsGrid.appendChild(card);
    });
    lucide.createIcons();
}

// Filter and Search Logic
function filterAndSearchEvents() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = eventsData.filter(event => {
        const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
        const matchesSearch = event.title.toLowerCase().includes(query) || event.venue.toLowerCase().includes(query) || event.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    renderEvents(filtered);
}

searchInput.addEventListener('input', filterAndSearchEvents);

categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        categoryButtons.forEach(b => {
            b.className = "category-btn px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-all";
        });
        e.target.className = "category-btn px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 text-white whitespace-nowrap shadow-md shadow-brand-600/20 transition-all";
        activeCategory = e.target.getAttribute('data-category');
        filterAndSearchEvents();
    });
});

// Modal Handling for Event Details & Registration
function openEventDetails(eventId) {
    currentSelectedEvent = eventsData.find(e => e.id === eventId);
    if (!currentSelectedEvent) return;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="relative h-64 sm:h-72">
            <img src="${currentSelectedEvent.image}" alt="${currentSelectedEvent.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        <div class="p-6 sm:p-8">
            <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/30">${currentSelectedEvent.category}</span>
                <span class="text-xs text-slate-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${currentSelectedEvent.date}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">${currentSelectedEvent.title}</h2>
            <p class="text-sm text-slate-400 flex items-center gap-1.5 mb-6">
                <i data-lucide="map-pin" class="w-4 h-4 text-brand-500"></i> ${currentSelectedEvent.venue} (${currentSelectedEvent.time})
            </p>
            <p class="text-sm text-slate-300 leading-relaxed mb-8">${currentSelectedEvent.description}</p>
            
            <!-- Registration Form -->
            <div class="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 class="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <i data-lucide="user-check" class="w-4 h-4 text-brand-500"></i> Secure Your Registration
                </h3>
                <form id="registration-form" onsubmit="handleRegistrationSubmit(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                        <input type="text" id="reg-name" placeholder="Shashank Shekhar" class="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500">
                        <p id="error-name" class="text-xs text-red-400 mt-1 hidden"></p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                            <input type="email" id="reg-email" placeholder="shashank@example.com" class="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500">
                            <p id="error-email" class="text-xs text-red-400 mt-1 hidden"></p>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                            <input type="tel" id="reg-phone" placeholder="9876543210" class="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500">
                            <p id="error-phone" class="text-xs text-red-400 mt-1 hidden"></p>
                        </div>
                    </div>
                    <input type="hidden" id="reg-event-title" value="${currentSelectedEvent.title}">
                    <button type="submit" class="w-full py-3 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all duration-200 mt-2">
                        Complete Registration[cite: 1]
                    </button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('event-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

// Form Validation and LocalStorage Management
function handleRegistrationSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const eventTitle = document.getElementById('reg-event-title').value;

    const errorName = document.getElementById('error-name');
    const errorEmail = document.getElementById('error-email');
    const errorPhone = document.getElementById('error-phone');

    // Reset errors
    [errorName, errorEmail, errorPhone].forEach(el => { el.textContent = ''; el.classList.add('hidden'); });

    let isValid = true;

    if (nameInput.value.trim() === '') {
        errorName.textContent = "Please enter your full name.";
        errorName.classList.remove('hidden');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        errorEmail.textContent = "Please enter a valid email address.";
        errorEmail.classList.remove('hidden');
        isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneInput.value.trim().replace(/[- ]/g, ''))) {
        errorPhone.textContent = "Please enter a valid 10-digit phone number.";
        errorPhone.classList.remove('hidden');
        isValid = false;
    }

    if (!isValid) return;

    // Save registration to LocalStorage[cite: 1]
    const registrationData = {
        id: Date.now(),
        eventTitle: eventTitle,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        timestamp: new Date().toLocaleDateString()
    };

    let registrations = JSON.parse(localStorage.getItem('eventRegistrations')) || [];
    registrations.push(registrationData);
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));

    // Success State Confirmation Message[cite: 1]
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="p-10 text-center flex flex-col items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <i data-lucide="check" class="w-8 h-8"></i>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
            <p class="text-sm text-slate-400 max-w-sm mb-6">You are successfully registered for <span class="text-white font-semibold">${eventTitle}</span>. Confirmation details have been saved[cite: 1].</p>
            <button onclick="closeModal()" class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                Back to Events
            </button>
        </div>
    `;
    lucide.createIcons();
}

// My Registrations Modal
function openRegistrationsModal() {
    const listContainer = document.getElementById('registrations-list');
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations')) || [];

    listContainer.innerHTML = '';
    if (registrations.length === 0) {
        listContainer.innerHTML = `<p class="text-sm text-slate-500 text-center py-6">No registrations found yet. Register for an event to view it here[cite: 1].</p>`;
    } else {
        registrations.forEach(reg => {
            const item = document.createElement('div');
            item.className = "p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between";
            item.innerHTML = `
                <div>
                    <h4 class="text-sm font-bold text-white">${reg.eventTitle}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">Participant: ${reg.name} (${reg.email})</p>
                    <span class="text-[10px] text-brand-400 mt-1 block">Registered on: ${reg.timestamp}</span>
                </div>
                <button onclick="cancelRegistration(${reg.id})" class="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Cancel Registration">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            listContainer.appendChild(item);
        });
    }
    document.getElementById('registrations-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeRegistrationsModal() {
    document.getElementById('registrations-modal').classList.add('hidden');
}

function cancelRegistration(id) {
    let registrations = JSON.parse(localStorage.getItem('eventRegistrations')) || [];
    registrations = registrations.filter(r => r.id !== id);
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
    openRegistrationsModal();
}

// Initial render on page load
renderEvents(eventsData);