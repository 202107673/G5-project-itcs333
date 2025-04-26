document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.querySelector('.news-grid');
    const searchInput = document.querySelector('.search-input');
    const sortSelect = document.querySelector('.sort-select');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Loading...';
    loadingIndicator.classList.add('loading-indicator');
    document.body.appendChild(loadingIndicator);

    let newsData = [];
    const itemsPerPage = 5;
    let currentPage = 1;

    const fetchNews = async () => {
        loadingIndicator.style.display = 'block';
        try {
            const response = await fetch('https://api.example.com/news'); // Replace with your API endpoint
            if (!response.ok) throw new Error('Failed to fetch news');
            newsData = await response.json();
            renderNews();
        } catch (error) {
            console.error(error);
            alert('Error fetching news. Please try again later.');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    const renderNews = () => {
        newsContainer.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const currentNews = newsData.slice(startIndex, startIndex + itemsPerPage);
        
        currentNews.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-item';
            article.innerHTML = `
                <h2 class="news-title">${news.title}</h2>
                <p class="news-date">${news.date}</p>
                <p class="news-content">${news.content}</p>
                <a href="news-detail.html?article=${news.id}" class="add-button">more details</a>
            `;
            newsContainer.appendChild(article);
        });
        setupPagination();
    };

    const setupPagination = () => {
        const totalPages = Math.ceil(newsData.length / itemsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = 'pagination-button';
            button.onclick = () => {
                currentPage = i;
                renderNews();
            };
            paginationContainer.appendChild(button);
        }
    };

    searchInput.addEventListener('keyup', () => {
        const filter = searchInput.value.toLowerCase();
        const filteredNews = newsData.filter(news => news.title.toLowerCase().includes(filter));
        renderFilteredNews(filteredNews);
    });

    const renderFilteredNews = (filteredNews) => {
        newsContainer.innerHTML = '';
        filteredNews.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-item';
            article.innerHTML = `
                <h2 class="news-title">${news.title}</h2>
                <p class="news-date">${news.date}</p>
                <p class="news-content">${news.content}</p>
                <a href="news-detail.html?article=${news.id}" class="add-button">more details</a>
            `;
            newsContainer.appendChild(article);
        });
    };

    sortSelect.addEventListener('change', () => {
        const sortBy = sortSelect.value;
        if (sortBy === 'Sort by Date') {
            newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'Sort by Title') {
            newsData.sort((a, b) => a.title.localeCompare(b.title));
        }
        renderNews();
    });

    fetchNews();
});