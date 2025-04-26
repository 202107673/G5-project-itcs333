document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';
    const mainSection = document.querySelector('.main-section');
    
    function fetchNotes() {
        mainSection.innerHTML = '<p>Loading notes...</p>';
        
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                mainSection.innerHTML = '';
                const notesToShow = data.slice(0, 12);
                const noteElements = document.querySelectorAll('.note');
                
                noteElements.forEach((noteElement, index) => {
                    if (notesToShow[index]) {
                        const noteData = notesToShow[index];
                        noteElement.querySelector('h3').textContent = `ITCS${Math.floor(Math.random() * 500)}`;
                        noteElement.querySelector('p').textContent = noteData.body;
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
                mainSection.innerHTML = '<p>Failed to load notes. Please try again later.</p>';
            });
    }
    
    fetchNotes();
    
    const searchInput = document.querySelector('.search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const notes = document.querySelectorAll('.note');
        
        notes.forEach(note => {
            const title = note.querySelector('h3').textContent.toLowerCase();
            const content = note.querySelector('p').textContent.toLowerCase();
            
            note.style.display = (title.includes(searchTerm)) || (content.includes(searchTerm)) 
                ? 'block' 
                : 'none';
        });
    });
    
    const sortSelect = document.querySelector('select[name="sort"]');
    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        const notesContainer = document.querySelector('.main-section');
        const notes = Array.from(document.querySelectorAll('.note'));
        
        notes.sort((a, b) => {
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;
            
            if (sortValue === 'Sort by Name (a-z)') return titleA.localeCompare(titleB);
            if (sortValue === 'Sort by Name (z-a)') return titleB.localeCompare(titleA);
            return 0;
        });
        
        notesContainer.innerHTML = '';
        notes.forEach(note => notesContainer.appendChild(note));
    });

    
});

