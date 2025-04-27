const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const NOTES_PER_PAGE = 6;
const DEBOUNCE_DELAY = 300;

let notes = [];
let filteredNotes = [];
let currentPage = 1;
let currentSort = 'name-asc';
let currentFilter = 'all';
let debounceTimer;

function initializeApp() {
    if (isIndexPage()) {
        setupIndexPage();
    } else if (isDetailPage()) {
        setupDetailPage();
    } else if (isCreatePage()) {
        setupCreatePage();
    }
}

async function fetchNotes() {
    showLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        notes = transformApiData(data);
        filteredNotes = [...notes];
        if (isIndexPage()) {
            renderNotes();
        } else if (isDetailPage()) {
            loadNoteDetails();
        }
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        showError('Failed to load notes. Please try again later.');
        notes = getSampleNotes();
        filteredNotes = [...notes];
        if (isIndexPage()) renderNotes();
    } finally {
        showLoading(false);
    }
}

function transformApiData(apiData) {
    return apiData.map(post => ({
        id: post.id,
        courseCode: `ITCS${Math.floor(100 + Math.random() * 400)}`,
        title: post.title.substring(0, 20),
        description: post.body,
        createdBy: "Admin",
        createdAt: new Date().toISOString().split('T')[0]
    }));
}

function getSampleNotes() {
    return [
        {
            id: 1,
            courseCode: 'ITCS333',
            title: 'Mobile Development',
            description: 'Learn cross-platform mobile app development with React Native and Flutter.',
            createdBy: 'Prof. Smith',
            createdAt: '2025-01-15'
        },
    ];
}

function renderNotes() {
    const mainSection = document.querySelector('.main-section');
    if (!mainSection) return;
    mainSection.innerHTML = '';
    const paginatedNotes = getPaginatedNotes();
    paginatedNotes.forEach(note => {
        const noteElement = createNoteElement(note);
        mainSection.appendChild(noteElement);
    });
    renderPagination();
}

function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    noteDiv.innerHTML = `
        <h3>${note.courseCode}</h3>
        <p>${note.description.substring(0, 100)}...</p>
        <a href="detail.html?id=${note.id}">Show Details</a>
    `;
    return noteDiv;
}

function renderPagination() {
    const paginationContainer = document.querySelector('.btn-section div:first-child');
    if (!paginationContainer) return;
    const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
    paginationContainer.innerHTML = '';
    if (currentPage > 1) {
        const prevLink = createPaginationLink('&laquo;', () => {
            currentPage--;
            renderNotes();
        });
        paginationContainer.appendChild(prevLink);
    }
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = createPaginationLink(i, () => {
            currentPage = i;
            renderNotes();
        });
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        paginationContainer.appendChild(pageLink);
    }
    if (currentPage < totalPages) {
        const nextLink = createPaginationLink('&raquo;', () => {
            currentPage++;
            renderNotes();
        });
        paginationContainer.appendChild(nextLink);
    }
}

function createPaginationLink(text, onClick) {
    const link = document.createElement('a');
    link.href = '#';
    link.innerHTML = text;
    link.addEventListener('click', (e) => {
        e.preventDefault();
        onClick();
    });
    return link;
}

function applyFiltersAndSearch() {
    const searchTerm = document.querySelector('.search')?.value.toLowerCase() || '';
    const filterValue = document.querySelector('select[name="filter"]')?.value.toLowerCase() || 'all';
    filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm) || 
                            note.courseCode.toLowerCase().includes(searchTerm) ||
                            note.description.toLowerCase().includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                            filterValue === 'filter' || 
                            note.courseCode.toLowerCase().includes(filterValue);
        return matchesSearch && matchesFilter;
    });
    applySorting();
    currentPage = 1;
    renderNotes();
}

function applySorting() {
    const sortValue = document.querySelector('select[name="sort"]')?.value || '';
    switch (sortValue) {
        case 'Sort by Name (a-z)':
            filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'Sort by Name (z-a)':
            filteredNotes.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'Sort by Newest':
            filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'Sort by Oldest':
            filteredNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
    }
}

function getPaginatedNotes() {
    const startIndex = (currentPage - 1) * NOTES_PER_PAGE;
    return filteredNotes.slice(startIndex, startIndex + NOTES_PER_PAGE);
}

function loadNoteDetails() {
    const params = new URLSearchParams(window.location.search);
    const noteId = params.get('id');
    const noteDetailContainer = document.getElementById('note-detail');
    if (!noteId || !noteDetailContainer) return;
    const note = notes.find(n => n.id == noteId);
    if (!note) {
        noteDetailContainer.innerHTML = '<p>Note not found</p>';
        return;
    }
    noteDetailContainer.innerHTML = `
        <div id="head">
            <h2>${note.title}</h2>
            <h3>${note.courseCode}</h3>
            <p>Created: ${note.createdAt}, by: ${note.createdBy}</p>
        </div>
        <div id="body">
            <h3>More About:</h3>
            <p>${note.description}</p>
        </div>
    `;
    setupCommentSection();
}

function setupCommentSection() {
    const commentForm = document.querySelector('.comments');
    if (!commentForm) return;
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = document.querySelector('.comment-input');
        const commentText = commentInput.value.trim();
        if (commentText) {
            addComment(commentText);
            commentInput.value = '';
        }
    });
}

function addComment(text) {
    const commentsContainer = document.querySelector('.comments');
    if (!commentsContainer) return;
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
        <h4>You</h4>
        <p>${text}</p>
    `;
    commentsContainer.insertBefore(commentDiv, commentsContainer.lastElementChild);
}

function validateNoteForm() {
    const inputs = [
        document.querySelector('input[placeholder="Enter Course Code"]'),
        document.querySelector('input[placeholder="Enter Course Title"]'),
        document.querySelector('textarea[placeholder="Enter Description"]')
    ];
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            markInvalid(input);
            isValid = false;
        } else {
            markValid(input);
        }
    });
    return isValid;
}

function markInvalid(element) {
    element.style.borderColor = 'red';
    if (!element.nextElementSibling?.classList.contains('error')) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = 'This field is required';
        error.style.color = 'red';
        error.style.fontSize = '0.8em';
        element.parentNode.insertBefore(error, element.nextSibling);
    }
}

function markValid(element) {
    element.style.borderColor = '';
    const error = element.nextElementSibling;
    if (error?.classList.contains('error')) {
        error.remove();
    }
}

function showLoading(show) {
    const loading = document.querySelector('.loading');
    if (loading) loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.padding = '10px';
    const header = document.querySelector('header');
    if (header) {
        header.insertAdjacentElement('afterend', errorDiv);
    }
}

function debounce(func, delay) {
    return function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
    };
}

function isIndexPage() {
    return window.location.pathname.includes('index.html') || 
           window.location.pathname.endsWith('/');
}

function isDetailPage() {
    return window.location.pathname.includes('detail.html');
}

function isCreatePage() {
    return window.location.pathname.includes('create.html');
}

function setupIndexPage() {
    fetchNotes();
    const searchInput = document.querySelector('.search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFiltersAndSearch, DEBOUNCE_DELAY));
    }
    document.querySelector('select[name="filter"]')?.addEventListener('change', applyFiltersAndSearch);
    document.querySelector('select[name="sort"]')?.addEventListener('change', applyFiltersAndSearch);
}

function setupDetailPage() {
    fetchNotes();
}

function setupCreatePage() {
    const submitButton = document.querySelector('.create-btn a[style]');
    if (submitButton) {
        submitButton.addEventListener('click', (e) => {
            if (!validateNoteForm()) {
                e.preventDefault();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
