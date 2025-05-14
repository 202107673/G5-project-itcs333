const searchForm = document.getElementById('searchForm');
const groupsContainer = document.getElementById('groupsContainer');
const loadingIndicator = document.getElementById('loading');
const errorDisplay = document.getElementById('errorDisplay');
const createGroupForm = document.getElementById('createGroupForm');

// State variables
let allStudyGroups = [];
let filteredGroups = [];
let currentPage = 1;
const groupsPerPage = 5;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchStudyGroups();
    setupEventListeners();
});

// Fetch study groups from JSON
async function fetchStudyGroups() {
    try {
        showLoading();
        errorDisplay.textContent = '';

        // Updated endpoint to use api.php
        const response = await fetch('https://e13e130b-8132-4ff0-959c-ca94148baa4f-00-1lc4uyx56gpdd.sisko.replit.dev/api.php');

        if (!response.ok) {
            throw new Error(`Failed to fetch study groups: ${response.status}`);
        }

        allStudyGroups = await response.json();
        filteredGroups = [...allStudyGroups];
        renderGroups();
    } catch (error) {
        console.error('Error:', error);
        errorDisplay.textContent = 'Error loading study groups. Please try again later.';
    } finally {
        hideLoading();
    }
}

// Render groups based on current filters and pagination
function renderGroups() {
    groupsContainer.innerHTML = '';

    if (filteredGroups.length === 0) {
        groupsContainer.innerHTML = '<p class="no-results">No study groups found matching your criteria.</p>';
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * groupsPerPage;
    const endIndex = startIndex + groupsPerPage;
    const groupsToDisplay = filteredGroups.slice(startIndex, endIndex);

    // Create group cards
    groupsToDisplay.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';

        // Handle field name differences between backend and frontend
        const meetingTime = group.meeting_time || group.meetingTime;

        groupCard.innerHTML = `
            <h3>${group.name}</h3>
            <p><strong>Subject:</strong> ${group.subject}</p>
            <p><strong>Meeting Time:</strong> ${formatDate(meetingTime)}</p>
            <p><strong>Location:</strong> ${group.location}</p>
            <p>${group.description}</p>
            <button class="join-btn" data-id="${group.id}">Join Group</button>
        `;
        groupsContainer.appendChild(groupCard);
    });

    // Render pagination controls
    renderPagination();
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Not specified';

    try {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
        console.error('Date formatting error:', e);
        return dateString; // Return the original string if formatting fails
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search and filter functionality
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
    });

    // Join group buttons
    groupsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('join-btn')) {
            const groupId = e.target.dataset.id;
            joinStudyGroup(groupId);
        }
    });

    // Create new group form
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCreateGroup();
        });
    }
}

// Apply search filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const subjectFilter = document.getElementById('subjectFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;

    filteredGroups = allStudyGroups.filter(group => {
        // Handle field name differences
        const meetingTime = group.meeting_time || group.meetingTime;

        const matchesSearch = group.name.toLowerCase().includes(searchTerm) || 
                             group.description.toLowerCase().includes(searchTerm);
        const matchesSubject = subjectFilter === '' || 
                              group.subject.toLowerCase().includes(subjectFilter);
        const matchesDate = dateFilter === '' || 
                            (meetingTime && new Date(meetingTime).toDateString() === new Date(dateFilter).toDateString());

        return matchesSearch && matchesSubject && matchesDate;
    });

    currentPage = 1;
    renderGroups();
}

// Join a study group - Fixed template literal
function joinStudyGroup(groupId) {
    const group = allStudyGroups.find(g => g.id == groupId);
    if (group) {
        // Fixed template literal syntax
        alert(`You've joined ${group.name}! Contact: ${group.contact_email || group.contact}`);
        // In a real app, you would send this to your backend
    }
}

// Handle new group creation
function handleCreateGroup() {
    const formData = new FormData(createGroupForm);
    const newGroup = {
        id: Date.now().toString(),
        name: formData.get('group-name'),
        subject: formData.get('subject'),
        description: formData.get('description'),
        location: formData.get('location'),
        meeting_time: formData.get('meeting-time'), // Match backend field name
        contact_email: formData.get('contact'), // Match backend field name
        members: 1
    };

    // Add to local state (in a real app, you would POST to a server)
    allStudyGroups.unshift(newGroup);
    filteredGroups = [...allStudyGroups];

    // Reset form and show success
    createGroupForm.reset();
    alert('Study group created successfully!');
    renderGroups();
}

// Pagination controls - Fixed template literal
function renderPagination() {
    const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);
    if (totalPages <= 1) return;

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderGroups();
        }
    });

     // Page numbers - Fixed template literal syntax
     const pageInfo = document.createElement('span');
     pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderGroups();
        }
    });

    paginationDiv.append(prevBtn, pageInfo, nextBtn);
    groupsContainer.appendChild(paginationDiv);
}

// Loading state helpers
function showLoading() {
    loadingIndicator.style.display = 'block';
    groupsContainer.style.opacity = '0.5';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    groupsContainer.style.opacity = '1';
}