document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search');
    const filter = document.getElementById('filter-dropdown');
    const sec = document.getElementsByClassName('main-section')[0];
    const maxNotes = 9;
    let coursesData = [];

    if (searchInput) {
        searchInput.focus();
    }

    const addButton = document.getElementById('add-btn');
    if (addButton) {
        addButton.addEventListener('click', function (e) {
            e.preventDefault(); 
            alert('hello world');
        });
    }

    function renderNotes(data) {
        if (!sec) return;
        sec.innerHTML = '';
        let displayed = 0;

        for (let i = 0; i < data.length && displayed < maxNotes; i++) {
            sec.insertAdjacentHTML('beforeend', `
                <div class="note">
                    <h3>${data[i].courseCode}</h3>
                    <p>${data[i].description}</p>
                    <a href="detail.html">Show Details</a>
                </div>
            `);
            displayed++;
        }

        if (searchInput) {
            searchNote(searchInput.value.trim());
        }
    }

    function searchNote(searchValue) {
        const notes = document.querySelectorAll('.note');
        const searchLower = searchValue.toLowerCase();

        notes.forEach(note => {
            const courseCode = note.querySelector('h3').textContent.toLowerCase();
            note.style.display = courseCode.includes(searchLower) ? '' : 'none';
        });
    }

    function filterNotes(filterValue) {
        const nowTime = new Date();
        let fromDate;
        let filtered;

        if (filterValue === 'last-week') {
            fromDate = new Date();
            fromDate.setDate(nowTime.getDate() - 7);
            filtered = coursesData.filter(note => new Date(note.createdAt) >= fromDate);
        } else if (filterValue === 'last-month') {
            fromDate = new Date();
            fromDate.setMonth(nowTime.getMonth() - 1);
            filtered = coursesData.filter(note => new Date(note.createdAt) >= fromDate);
        } else if (filterValue === 'last-year') {
            fromDate = new Date();
            fromDate.setFullYear(nowTime.getFullYear() - 1);
            filtered = coursesData.filter(note => new Date(note.createdAt) >= fromDate);
        } else if (
            filterValue === 'Science' ||
            filterValue === 'Information System' ||
            filterValue === 'Business'
        ) {
            filtered = coursesData.filter(note => note.course === filterValue);
        } else {
            renderNotes(coursesData);
            return;
        }

        renderNotes(filtered);
    }

    fetch('courses.json')
        .then(response => response.json())
        .then(data => {
            coursesData = data;
            renderNotes(coursesData);
        });

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            searchNote(e.target.value.trim());
        });
    }

    if (filter) {
        filter.addEventListener('change', function () {
            filterNotes(this.value);
        });
    }

    function sortNotes(sortOption) {
        let sorted = [...coursesData];

        switch (sortOption) {
            case 'Sort by Name (a-z)':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'Sort by Name (z-a)':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'Sort by Newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'Sort by Oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default:
                return renderNotes(coursesData);
        }

        renderNotes(sorted);
    }

    const sortSelect = document.querySelector('select[name="sort"]');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortNotes(this.value);
        });
    }
});