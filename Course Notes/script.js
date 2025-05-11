document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search');
    const filter = document.getElementById('filter-dropdown');
    const sec = document.getElementsByClassName('main-section')[0];
    const maxNotes = 9;
    let currentPage = 1;
    let totalPages = 1;
    let coursesData = [];

    if (searchInput) {
        searchInput.focus();
    }

    const detailPage = window.location.pathname === '/detail.html';
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    if (isHomePage) {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageButtonsContainer = document.getElementById('btn-div');

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                displayItems();
            }
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                displayItems();
            }
        });    
        
    
        function createPageButtons() {
            pageButtonsContainer.innerHTML = '';
        
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('a');
                pageBtn.textContent = i;
                pageBtn.classList.add('page-btn');
                if (i === currentPage) {
                    pageBtn.classList.add('active');
                }
                pageBtn.addEventListener('click', () => {
                    currentPage = i;
                    displayItems();
                });
                pageButtonsContainer.appendChild(pageBtn);
            }
        }

        function displayItems() {
            renderNotes(coursesData);
            if (isHomePage) createPageButtons();
        }
        
        function updateActiveButton() {
            const buttons = pageButtonsContainer.querySelectorAll('.page-btn');
            buttons.forEach((btn, index) => {
                btn.classList.toggle('active', index + 1 === currentPage);
            });
        }
    }

    const addButton = document.getElementById('add-btn');
    if (addButton) {
        addButton.addEventListener('click', function (e) {
            const courseCode = document.getElementById('course-code').value.trim();
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const course = document.getElementById('course').value.trim();
            const createdAt = document.getElementById('createdAt').value.trim();

            const errors = [];
            if (!courseCode) errors.push("Course code is required.");
            if (!title) errors.push("Title is required.");
            if (!description || description.length < 10) errors.push("Description must be at least 10 characters.");
            if (!course) errors.push("Course field is required.");
            if (!createdAt || isNaN(Date.parse(createdAt))) errors.push("Valid date is required for 'Created At'.");

            if (errors.length > 0) {
                e.preventDefault();
                alert("Please fix the following errors:\n\n" + errors.join("\n"));
                return;
            }

            const newCourse = {
                courseCode,
                title,
                description,
                course,
                createdAt
            };

            fetch('./courses.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    data.push(newCourse);
                    console.log('Updated data:', data);
                    alert('New Cours Added');
                })
                .catch(error => {
                    console.error(error);
                    alert('Failed');
                });
        });
    }

    function renderNotes(data) {
        totalPages = Math.ceil(data.length / maxNotes);
        if (!sec) return;
        sec.innerHTML = '';
    
        totalPages = Math.ceil(data.length / maxNotes);
        const startIndex = (currentPage - 1) * maxNotes;
        const endIndex = startIndex + maxNotes;
        const pageData = data.slice(startIndex, endIndex);
        let count = startIndex;
    
        pageData.forEach(item => {
            sec.insertAdjacentHTML('beforeend', `
                <div class="note">
                    <h3>${item.courseCode}</h3>
                    <p>${item.description}</p>
                    <a id="${count}" class="detail-btn" href="detail.html">Show Details</a>
                </div>
            `);
            count ++;
        });

        const detailBtns = document.getElementsByClassName('detail-btn');
        Array.from(detailBtns).forEach(btn => {
            btn.addEventListener('click', function(event) {
                localStorage.setItem('detailBtnId', event.target.id);
            });
        });
    
        if (isHomePage) updateActiveButton();
    }
    
    function reanderDetailPage(data) {
        const main = document.getElementsByClassName('note-detail-header')[0];
        const detailBtnId  = localStorage.getItem('detailBtnId');
        if (detailBtnId !== null) {
            const item = data[detailBtnId];
            const htmlContent = `
                <div id="note-detail">
                    <div id="head">
                        <h2>${item.title}</h2>
                        <h3>${item.courseCode}</h3>
                        <p>created: ${item.createdAt}, by: John Doe</p>
                    </div>
                    <div id="body">
                        <h3>More About:</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `;
            
            main.insertAdjacentHTML('beforeend', htmlContent);
        } else {
            console.error("Detail button ID not found.");
        }
    }

    if (detailPage) {
        const editButton = document.getElementById('edit-btn');
        editBtn();
    }

    function editBtn() {
        editButton.addEventListener('click', function(){
            const btnId = localStorage.getItem('detailBtnId');
            const course = document.getElementById('course-code');
            const description = document.getElementById('description');
            course.textContent = data[btnId].courseCode;
        });
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
            if(isHomePage) displayItems();
            if(detailPage) reanderDetailPage(coursesData);
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