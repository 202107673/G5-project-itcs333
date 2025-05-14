// API Configuration
const API_URL = 'https://jsonplaceholder.typicode.com';
const ITEMS_PER_PAGE = 6;

// State Management
let currentPage = 1;
let currentCategory = '';
let currentSort = 'newest';

// DOM Elements
const newsGrid = document.querySelector('.news-grid');
const searchForm = document.querySelector('.search-form');
const sortSelect = document.getElementById('sort');
const paginationNav = document.querySelector('.pagination');
const articleDetail = document.querySelector('.article-detail');
const newsForm = document.querySelector('.news-form');

// Loading Indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading';
loadingIndicator.textContent = 'Loading...';

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/')) {
        initializeNewsListing();
    } else if (path.endsWith('article.html')) {
        initializeArticleDetail();
    } else if (path.endsWith('create.html')) {
        initializeCreateForm();
    }
});

// News Listing Page Functions
function initializeNewsListing() {
    loadNews();
    setupNewsListingEvents();
}

function setupNewsListingEvents() {
    // Search form
    if (searchForm) {
        // Handle form submission for search
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentPage = 1;
            loadNews();
        });

        // Handle category changes
        const categorySelect = searchForm.querySelector('select');
        categorySelect?.addEventListener('change', () => {
            currentPage = 1;
            loadNews();
        });
    }

    // Sort
    sortSelect?.addEventListener('change', () => {
        currentSort = sortSelect.value;
        loadNews();
    });
}

async function loadNews() {
    try {
        showLoading();
        const searchQuery = searchForm?.querySelector('input[type="search"]')?.value?.toLowerCase() || '';
        const categoryFilter = searchForm?.querySelector('select')?.value || '';

        // Fetch all posts for better search (in a real app, this would be handled by the server)
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error('Failed to fetch news');
        let news = await response.json();

        // Add some sample categories since JSONPlaceholder doesn't have categories
        news = news.map(article => ({
            ...article,
            category: ['academic', 'events', 'sports', 'culture'][Math.floor(Math.random() * 4)]
        }));

        // Client-side filtering
        if (searchQuery) {
            news = news.filter(article =>
                article.title.toLowerCase().includes(searchQuery) ||
                article.body.toLowerCase().includes(searchQuery)
            );
        }

        if (categoryFilter) {
            news = news.filter(article => article.category === categoryFilter);
        }

        // Client-side sorting
        news.sort((a, b) => {
            if (currentSort === 'newest') return new Date(b.date || b.id) - new Date(a.date || a.id);
            if (currentSort === 'oldest') return new Date(a.date || a.id) - new Date(b.date || b.id);
            return 0;
        });

        renderNews(news);
        updatePagination(news.length);
    } catch (error) {
        showError('Failed to load news articles');
    } finally {
        hideLoading();
    }
}

function renderNews(news) {
    if (!newsGrid) return;
    newsGrid.innerHTML = '';

    news.forEach(article => {
        const articleElement = `
            <article class="news-card">
                <div class="news-content">
                    <span class="category">${article.category || 'General'}</span>
                    <h2>${article.title}</h2>
                    <p>${article.body.substring(0, 100)}...</p>
                    <div class="meta">
                        <span class="date">${formatDate(article.date || Date.now())}</span>
                        <a href="article.html?id=${article.id}" class="read-more">Read More</a>
                    </div>
                </div>
            </article>
        `;
        newsGrid.insertAdjacentHTML('beforeend', articleElement);
    });
}

function updatePagination(totalItems) {
    if (!paginationNav) return;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Remove any existing event listeners by replacing the element
    const newPaginationNav = paginationNav.cloneNode(false);
    paginationNav.parentNode.replaceChild(newPaginationNav, paginationNav);
    paginationNav = newPaginationNav;

    // Create Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadNews();
        }
    });
    paginationNav.appendChild(prevButton);

    // Create page numbers
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    // Adjust start if we're at the end
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            const current = document.createElement('span');
            current.className = 'current';
            current.textContent = i;
            paginationNav.appendChild(current);
        } else {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                loadNews();
            });
            paginationNav.appendChild(pageLink);
        }
    }

    // Create Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadNews();
        }
    });
    paginationNav.appendChild(nextButton);
}

// Article Detail Page Functions
async function initializeArticleDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId || !articleDetail) return;

    try {
        showLoading();
        const response = await fetch(`${API_URL}/posts/${articleId}`);
        if (!response.ok) throw new Error('Article not found');
        const article = await response.json();
        
        renderArticleDetail(article);
        setupArticleActions(article.id);
    } catch (error) {
        showError('Failed to load article');
    } finally {
        hideLoading();
    }
}

function renderArticleDetail(article) {
    if (!articleDetail) return;
    
    const header = articleDetail.querySelector('.article-header');
    const content = articleDetail.querySelector('.article-content');
    
    if (header) {
        header.innerHTML = `
            <span class="category">${article.category || 'General'}</span>
            <h1>${article.title}</h1>
            <div class="meta">
                <span class="date">${formatDate(article.date || Date.now())}</span>
                <span class="author">By ${article.author || 'Anonymous'}</span>
            </div>
        `;
    }

    if (content) {
        content.innerHTML = `<p>${article.body}</p>`;
    }
}

function setupArticleActions(articleId) {
    const deleteBtn = document.querySelector('.btn-delete');
    const editBtn = document.querySelector('.btn-edit');

    deleteBtn?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                const response = await fetch(`${API_URL}/posts/${articleId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete');
                window.location.href = 'index.html';
            } catch (error) {
                showError('Failed to delete article');
            }
        }
    });

    editBtn?.addEventListener('click', () => {
        window.location.href = `create.html?edit=${articleId}`;
    });
}

// Create/Edit Form Functions
async function initializeCreateForm() {
    if (!newsForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        try {
            showLoading();
            const response = await fetch(`${API_URL}/posts/${editId}`);
            if (!response.ok) throw new Error('Article not found');
            const article = await response.json();
            populateForm(article);
        } catch (error) {
            showError('Failed to load article for editing');
        } finally {
            hideLoading();
        }
    }

    setupFormValidation();
}

function populateForm(article) {
    const titleInput = document.getElementById('title');
    const categorySelect = document.getElementById('category');
    const contentTextarea = document.getElementById('content');

    if (titleInput) titleInput.value = article.title;
    if (categorySelect) categorySelect.value = article.category || '';
    if (contentTextarea) contentTextarea.value = article.body;
}

function setupFormValidation() {
    newsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('title');
        const categorySelect = document.getElementById('category');
        const contentTextarea = document.getElementById('content');

        if (!validateForm(titleInput, categorySelect, contentTextarea)) {
            return;
        }

        const articleData = {
            title: titleInput.value,
            category: categorySelect.value,
            body: contentTextarea.value,
            date: new Date().toISOString()
        };

        try {
            showLoading();
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData),
            });
            if (!response.ok) throw new Error('Failed to save');
            window.location.href = 'index.html';
        } catch (error) {
            showError('Failed to save article');
        } finally {
            hideLoading();
        }
    });
}

function validateForm(titleInput, categorySelect, contentTextarea) {
    let isValid = true;

    if (!titleInput?.value.trim()) {
        showFieldError(titleInput, 'Title is required');
        isValid = false;
    }

    if (!categorySelect?.value) {
        showFieldError(categorySelect, 'Please select a category');
        isValid = false;
    }

    if (!contentTextarea?.value.trim()) {
        showFieldError(contentTextarea, 'Content is required');
        isValid = false;
    }

    return isValid;
}

// Utility Functions
function showLoading() {
    document.body.appendChild(loadingIndicator);
}

function hideLoading() {
    loadingIndicator.remove();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = newsGrid || articleDetail || newsForm;
    if (container) {
        container.innerHTML = '';
        container.appendChild(errorDiv);
    }
}

function showFieldError(field, message) {
    const existingError = field.nextElementSibling;
    if (existingError?.classList.contains('error-message')) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
