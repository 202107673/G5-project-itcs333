// script.js

const eventsContainer = document.getElementById('events-container');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const paginationContainer = document.getElementById('pagination');

let events = [];
let currentPage = 1;
const eventsPerPage = 2;

// Fetch events from local JSON
async function fetchEvents() {
    try {
        showLoading();
        const response = await fetch('events.json');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        events = await response.json();
        renderEvents();
    } catch (error) {
        eventsContainer.innerHTML = `<p class="error">Error loading events: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Show loading spinner
function showLoading() {
    eventsContainer.innerHTML = `<p>Loading events...</p>`;
}

// Hide loading spinner (not needed separately since we re-render after fetch)

// Render events
function renderEvents() {
    const filteredEvents = filterEvents(events);
    const sortedEvents = sortEvents(filteredEvents);
    const paginatedEvents = paginateEvents(sortedEvents);

    eventsContainer.innerHTML = '';

    if (paginatedEvents.length === 0) {
        eventsContainer.innerHTML = '<p>No events found.</p>';
        paginationContainer.innerHTML = '';
        return;
    }

    paginatedEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event';
        eventElement.innerHTML = `
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <a href="detail.html?id=${event.id}" class="button">View Details</a>
        `;
        eventsContainer.appendChild(eventElement);
    });

    renderPagination(filteredEvents.length);
}

// Filter events by search input
function filterEvents(data) {
    const query = searchInput.value.trim().toLowerCase();
    return data.filter(event => event.title.toLowerCase().includes(query));
}

// Sort events
function sortEvents(data) {
    const sortValue = sortSelect.value;
    if (sortValue === 'date') {
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'title') {
        return data.sort((a, b) => a.title.localeCompare(b.title));
    }
    return data;
}

// Pagination
function paginateEvents(data) {
    const start = (currentPage - 1) * eventsPerPage;
    const end = start + eventsPerPage;
    return data.slice(start, end);
}

// Render pagination buttons
function renderPagination(totalEvents) {
    const totalPages = Math.ceil(totalEvents / eventsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = i;
            renderEvents();
        });
        paginationContainer.appendChild(btn);
    }
}

// Form Validation for Create Event
const eventForm = document.getElementById('event-form');
if (eventForm) {
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        validateForm();
    });
}

function validateForm() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value.trim();
    const location = document.getElementById('event-location').value.trim();

    if (!title || !date || !location) {
        alert('Please fill out all required fields.');
        return false;
    }

    alert('Event created successfully! (Simulation)');
}

// Display Event Details
async function displayEventDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        showLoading();
        const response = await fetch('events.json');
        const data = await response.json();
        const event = data.find(e => e.id === parseInt(id));

        if (!event) {
            document.querySelector('main').innerHTML = '<p>Event not found.</p>';
            return;
        }

        document.querySelector('.event-detail h2').textContent = event.title;
        document.querySelector('.meta time').textContent = event.date;
        document.querySelector('.meta time').setAttribute('datetime', event.date);
        document.querySelector('.meta span:nth-child(2)').textContent = `📍 ${event.location}`;
        document.querySelector('.content').innerHTML = `
            <p>${event.description}</p>
            <p>Time: ${event.time}</p>
            <p>Organizer: ${event.organizer}</p>
        `;
    } catch (error) {
        document.querySelector('main').innerHTML = `<p class="error">Error loading event details: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Initialize
if (eventsContainer) {
    fetchEvents();
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderEvents();
    });
    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        renderEvents();
    });
} else {
    displayEventDetails();
}