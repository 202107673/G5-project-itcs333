// state object with properties
const state = {
    reviews: [], //when your application first loads, there are no course reviews loaded yet.
    //Later in your code, this array will be populated with review objects fetched from the courses.json file.
    //Each object in the array will represent one course review with properties like id, courseCode, courseTitle, etc. 
    filteredReviews: [],
    currentPage: 1,
    reviewsPerPage: 3, //To not forget **** Show 3 cards(Reviews) per page
    isLoading: false,
    sortOption: 'recent',
    filters: {
      search: '',
      department: '',
      level: '',
      rating: ''
    }
  };
  
  // Fetch all reviews from our JSON file
  async function fetchReviews() {
    try {
      showLoading();
      
      // Fetch our courses.json file
      const response = await fetch('courses.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      state.reviews = data;
      state.filteredReviews = [...state.reviews];
      hideLoading();
      
      return state.reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      hideLoading();
      showError('Failed to load reviews. Please try again later.');
      return [];
    }
  }
  
  // Fetch a single review by ID
  async function fetchReviewById(id) {
    try {
      showLoading();
      
      // If we already have the review in our state, return it
      const cachedReview = state.reviews.find(review => review.id === parseInt(id));
      if (cachedReview) {
        hideLoading();
        return cachedReview;
      }
      
      // Otherwise, fetch from JSON file
      const response = await fetch('courses.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const review = data.find(review => review.id === parseInt(id));
      
      hideLoading();
      return review;
    } catch (error) {
      console.error('Error fetching review:', error);
      hideLoading();
      showError('Failed to load review. Please try again later.');
      return null;
    }
  }

  // Render the review cards on the main page
  function renderReviewCards(reviews) {
    const reviewsGrid = document.querySelector('.reviews-grid');
    
    if (!reviewsGrid) return;
    
    reviewsGrid.innerHTML = '';
    
    if (reviews.length === 0) {
      reviewsGrid.innerHTML = '<p>No reviews found matching your criteria.</p>';
      return;
    }
    
    // Calculate pagination
    const startIndex = (state.currentPage - 1) * state.reviewsPerPage; // to control the cards with the pages
    const endIndex = startIndex + state.reviewsPerPage;
    const paginatedReviews = reviews.slice(startIndex, endIndex);
    
    paginatedReviews.forEach(review => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-header">
          <h3 class="course-title">${review.courseCode}: ${review.courseTitle}</h3>
          <p><strong>Instructor:</strong> ${review.instructor}</p>
          <p><strong>Rating:</strong> ${renderStars(review.rating)}</p>
          <p><strong>Difficulty:</strong> ${review.difficulty}</p>
          <p>${review.content}</p>
          <a href="review-detail.html?id=${review.id}" class="btn">View Details</a>
        </div>
      `;
      reviewsGrid.appendChild(card);
    });
    
    renderPagination(reviews.length);
  }
  // Render star rating
  function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += i <= rating ? '★' : '☆';
    }
    return stars;
  }

  // Render pagination controls
  function renderPagination(totalItems) {
    const paginationDiv = document.querySelector('div[style="text-align: center; margin-top: 2rem;"]');
    
    if (!paginationDiv) return;
    
    const totalPages = Math.ceil(totalItems / state.reviewsPerPage);
    
    // Clear existing buttons
    paginationDiv.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = state.currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderReviewCards(state.filteredReviews);
      }
    });
    paginationDiv.appendChild(prevButton);
    
    // Page number display
    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Page ${state.currentPage} of ${totalPages} `;
    pageInfo.style.margin = '0 10px';
    paginationDiv.appendChild(pageInfo);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = state.currentPage === totalPages || totalPages === 0;
    nextButton.addEventListener('click', () => {
      if (state.currentPage < totalPages) {
        state.currentPage++;
        renderReviewCards(state.filteredReviews);
      }
    });
    paginationDiv.appendChild(nextButton);
  }

  // Render a detailed review
  function renderReviewDetail(review) {
    if (!review) return;
    
    const title = document.querySelector('.review-detail-title');
    if (title) title.textContent = `${review.courseCode}: ${review.courseTitle}`;
    
    const metadata = document.querySelector('.review-detail-metadata');
    if (metadata) {
      metadata.innerHTML = `
        <p><strong>Professor:</strong> ${review.instructor}</p>
        <p><strong>Department:</strong> ${review.department}</p>
        <p><strong>Rating:</strong> ${renderStars(review.rating)}</p>
      `;
    }
    
    const contentParagraph = document.querySelector('.review-detail > p');
    if (contentParagraph) contentParagraph.textContent = review.fullContent;
    
    const infoDiv = document.querySelector('div[style="margin-top: 20px;"]');
    if (infoDiv) {
      infoDiv.innerHTML = `
        <p><strong>Workload:</strong> ${review.difficulty === 'Easy' ? 'Light' : review.difficulty === 'Moderate' ? 'Moderate' : 'Heavy'}</p>
        <p><strong>Difficulty:</strong> ${review.difficulty}</p>
      `;
    }

    // Render course-specific comments
    renderComments(review.comments);
  }

  // Render comments for a specific course
  function renderComments(comments) {
    const commentsSection = document.querySelector('.comments-section');
    if (!commentsSection) return;
    
    // Update comments title
    const commentsTitle = commentsSection.querySelector('.comments-title');
    if (commentsTitle) {
      commentsTitle.textContent = `Comments (${comments.length})`;
    }
    
    // Clear existing comments
    const existingComments = commentsSection.querySelectorAll('.comment');
    existingComments.forEach(comment => comment.remove());
    
    // Add new comments
    const commentForm = commentsSection.querySelector('.comment-form');
    
    comments.forEach(comment => {
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `
        <div class="comment-author">${comment.author}</div>
        <div class="comment-date">${comment.date}</div>
        <p>${comment.text}</p>
      `;
      
      // Insert before the comment form
      commentsSection.insertBefore(commentElement, commentForm);
    });
  }

  // Apply filters and sort the reviews
  function applyFiltersAndSort() {
    state.currentPage = 1;
    
    let filtered = [...state.reviews];
    
    // Apply search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(review => 
        review.courseCode.toLowerCase().includes(searchTerm) ||
        review.courseTitle.toLowerCase().includes(searchTerm) ||
        review.instructor.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply department filter
    if (state.filters.department) {
      const departmentMap = {
        'cs': 'Computer Science',
        'bio': 'Biology',
        'eng': 'English',
        'math': 'Mathematics',
        'phys': 'Physics'
      };
      
      filtered = filtered.filter(review => 
        review.department === departmentMap[state.filters.department]
      );
    }
    
    // Apply level filter
    if (state.filters.level) {
      filtered = filtered.filter(review => 
        review.difficulty === state.filters.level
      );
    }
    
    // Apply rating filter
    if (state.filters.rating) {
      const minRating = parseInt(state.filters.rating);
      filtered = filtered.filter(review => 
        review.rating >= minRating
      );
    }
    
    // Apply sorting
    switch (state.sortOption) {
      case 'recent':
        // Sort by ID (higher ID is more recent in our data)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }
    
    state.filteredReviews = filtered;
    renderReviewCards(filtered);
  }

  // Simple functions to show/hide loading indicator
  function showLoading() {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loading';
    loadingEl.textContent = 'Loading...';
    document.body.appendChild(loadingEl);
  }
  
  function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.remove();
  }
  
  // Show error message
  function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    
    setTimeout(() => errorEl.remove(), 3000);
  }

  // Validate the add review form
  function validateAddReviewForm(form) {
    const courseInput = form.querySelector('#course');
    const instructorInput = form.querySelector('#instructor');
    const ratingInput = form.querySelector('#rating');
    const reviewInput = form.querySelector('#review');
    const difficultyInput = form.querySelector('#difficulty');
    const departmentInput = form.querySelector('#department');
    let isValid = true;
    
    // Reset previous error messages
    form.querySelectorAll('.error-text').forEach(el => el.remove());
    
    // Validate course code
    if (!courseInput.value.trim()) {
      showInputError(courseInput, 'Course code is required');
      isValid = false;
    }
    
    // Validate instructor name
    if (!instructorInput.value.trim()) {
      showInputError(instructorInput, 'Instructor name is required');
      isValid = false;
    }
    
    // Validate rating
    if (!ratingInput.value.trim()) {
      showInputError(ratingInput, 'Rating is required');
      isValid = false;
    } else {
      const rating = parseInt(ratingInput.value);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        showInputError(ratingInput, 'Rating must be between 1 and 5');
        isValid = false;
      }
    }
    
    // Validate review text
    if (!reviewInput.value.trim()) {
      showInputError(reviewInput, 'Review is required');
      isValid = false;
    }
    
    // Validate difficulty selection
    if (!difficultyInput.value) {
      showInputError(difficultyInput, 'Please select a difficulty level');
      isValid = false;
    }

    if (!departmentInput.value) {
        showInputError(departmentInput, 'Please select a department');
        isValid = false;
    }
    return isValid;
  }
  
  // Show validation error message
  function showInputError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-text';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '0.8rem';
    
    input.parentNode.insertBefore(errorElement, input.nextSibling);
    input.style.borderColor = 'red';
    
    input.addEventListener('input', function() {
      this.style.borderColor = '';
      const errorEl = this.nextElementSibling;
      if (errorEl && errorEl.className === 'error-text') errorEl.remove();
    });
  }

  // Initialize the main page
  function initMainPage() {
    fetchReviews().then(reviews => {
      renderReviewCards(reviews);
      
      // Set up search functionality
      const searchInput = document.querySelector('.search-bar input');
      const searchButton = document.querySelector('.search-bar .btn');
      
      if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
          state.filters.search = searchInput.value;
          applyFiltersAndSort();
        });
        
        // Add enter key search functionality
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            state.filters.search = searchInput.value;
            applyFiltersAndSort();
          }
        });
      }
      
      // Set up filter functionality
      const departmentSelect = document.querySelector('.filter-options select:nth-child(1)');
      const levelSelect = document.querySelector('.filter-options select:nth-child(2)');
      const ratingSelect = document.querySelector('.filter-options select:nth-child(3)');
      const sortSelect = document.querySelector('.filter-options select:nth-child(4)');
      
      if (departmentSelect) {
        departmentSelect.addEventListener('change', () => {
          state.filters.department = departmentSelect.value;
          applyFiltersAndSort();
        });
      }
      
      if (levelSelect) {
        levelSelect.addEventListener('change', () => {
          state.filters.level = levelSelect.value;
          applyFiltersAndSort();
        });
      }
      
      if (ratingSelect) {
        ratingSelect.addEventListener('change', () => {
          state.filters.rating = ratingSelect.value;
          applyFiltersAndSort();
        });
      }
      
      if (sortSelect) {
        sortSelect.addEventListener('change', () => {
          state.sortOption = sortSelect.value;
          applyFiltersAndSort();
        });
      }
    });
  }
  
  // Initialize the detail page
  function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const reviewId = urlParams.get('id');
    
    if (reviewId) {
      fetchReviewById(reviewId).then(review => {
        if (review) {
          renderReviewDetail(review);
        }
      });
    }
  }
  
  // Initialize the add review page
  function initAddReviewPage() {
    const form = document.querySelector('form');
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateAddReviewForm(form)) {
          alert('Review submitted successfully!');
          form.reset();
        }
      });
    }
  }

  // Add comment functionality
  function initCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    if (!commentForm) return;
    
    const commentButton = commentForm.querySelector('.btn');
    const commentTextarea = commentForm.querySelector('textarea');
    
    if (commentButton && commentTextarea) {
      commentButton.addEventListener('click', () => {
        const commentText = commentTextarea.value.trim();
        
        if (commentText) {
          // In a real app, we would save this to a database
          // For demo purposes, we'll just add it to the UI
          const commentSection = document.querySelector('.comments-section');
          const newComment = document.createElement('div');
          newComment.className = 'comment';
          
          const today = new Date();
          const formattedDate = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
          
          newComment.innerHTML = `
            <div class="comment-author">You</div>
            <div class="comment-date">${formattedDate}</div>
            <p>${commentText}</p>
          `;
          
          // Insert before the comment form
          commentSection.insertBefore(newComment, commentForm);
          
          // Update comment count
          const commentsTitle = commentSection.querySelector('.comments-title');
          if (commentsTitle) {
            const currentCount = parseInt(commentsTitle.textContent.match(/\d+/)[0]) || 0;
            commentsTitle.textContent = `Comments (${currentCount + 1})`;
          }
          
          // Clear the textarea
          commentTextarea.value = '';
        }
      });
    }
  }

   // Initialize the appropriate page based on the current URL
   function initializeApp() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('review-detail.html')) {
      initDetailPage();
      initCommentForm();
    } else if (currentPath.includes('add-review.html')) {
      initAddReviewPage();
    } else {
      initMainPage();
    }
  }

  
  // Run the initialization when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initializeApp);