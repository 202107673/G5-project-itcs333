// state object with properties
const state = {
    reviews: [], 
    filteredReviews: [],
    currentPage: 1,
    reviewsPerPage: 3,
    isLoading: false,
    sortOption: 'recent',
    filters: {
      search: '',
      department: '',
      level: '',
      rating: ''
    }
  };
  
  // API base URL - update this to match your server configuration
  const API_BASE_URL = 'https://c3a143ca-9ea1-47c4-b047-92244630af62-00-spw7mnp6b1m0.sisko.replit.dev/index.php';
  
  // Fetch all reviews from our API
  async function fetchReviews() {
    try {
      showLoading();
      
      // Build query parameters for filtering and pagination
      const queryParams = new URLSearchParams();
      queryParams.append('page', state.currentPage);
      queryParams.append('limit', state.reviewsPerPage);
      
      // Add filters if they exist
      if (state.filters.search) queryParams.append('search', state.filters.search);
      if (state.filters.department) queryParams.append('department', state.filters.department);
      if (state.filters.level) queryParams.append('difficulty', state.filters.level);
      if (state.filters.rating) queryParams.append('rating', state.filters.rating);
      
      // Add sort option
      queryParams.append('sort', state.sortOption);
      
      // Debug log to see what's being sent to the API
      console.log('Sending API request with params:', queryParams.toString());
      
      // Fetch reviews from API
      const response = await fetch(`${API_BASE_URL}?action=reviews&${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API response:', responseData);
      
      // Update state with received data
      if (responseData.status === 'success') {
        state.reviews = responseData.data || [];
        state.filteredReviews = [...state.reviews];
        
        // Update total pages for pagination
        state.totalPages = responseData.total_pages || 1;
      } else {
        throw new Error(responseData.message || 'Failed to load reviews');
      }
      
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
      
      // Fetch from API
      const response = await fetch(`${API_BASE_URL}?action=reviews&id=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const review = await response.json();
      
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
    
    reviews.forEach(review => {
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
    
    renderPagination();
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
  function renderPagination() {
    const paginationDiv = document.querySelector('div[style="text-align: center; margin-top: 2rem;"]');
    
    if (!paginationDiv) return;
    
    // Clear existing buttons
    paginationDiv.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = state.currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        fetchReviews().then(reviews => renderReviewCards(reviews));
      }
    });
    paginationDiv.appendChild(prevButton);
    
    // Page number display
    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Page ${state.currentPage} of ${state.totalPages || 1} `;
    pageInfo.style.margin = '0 10px';
    paginationDiv.appendChild(pageInfo);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = state.currentPage === (state.totalPages || 1);
    nextButton.addEventListener('click', () => {
      if (state.currentPage < (state.totalPages || 1)) {
        state.currentPage++;
        fetchReviews().then(reviews => renderReviewCards(reviews));
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

    // Add event listeners for editing and deleting
    setupEditDeleteButtons(review.id);

    // Render course-specific comments
    renderComments(review.comments);
    
    // Set up comment form submission
    setupCommentForm(review.id);
  }

  // Set up edit and delete buttons
  function setupEditDeleteButtons(reviewId) {
    const editButton = document.querySelector('.review-detail button:first-of-type');
    const deleteButton = document.querySelector('.review-detail button.btn-danger');
    
    if (editButton) {
      editButton.addEventListener('click', () => {
        window.location.href = `add-review.html?edit=${reviewId}`;
      });
    }
    
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this review?')) {
          try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}?id=${reviewId}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
              alert('Review deleted successfully!');
              window.location.href = 'Review.html';
            } else {
              throw new Error(result.message || 'Failed to delete review');
            }
          } catch (error) {
            console.error('Error deleting review:', error);
            showError('Failed to delete review. Please try again later.');
          } finally {
            hideLoading();
          }
        }
      });
    }
  }

  // Set up comment form submission
  function setupCommentForm(reviewId) {
    const commentForm = document.querySelector('.comment-form');
    if (!commentForm) return;
    
    const commentButton = commentForm.querySelector('.btn');
    const commentTextarea = commentForm.querySelector('textarea');
    
    if (commentButton && commentTextarea) {
      commentButton.addEventListener('click', async () => {
        const commentText = commentTextarea.value.trim();
        
        if (commentText) {
          try {
            showLoading();
            
            const response = await fetch(`${API_BASE_URL}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                action: 'comments',
                review_id: reviewId,
                author: 'Anonymous User', // You might want to get the author name from a form input
                text: commentText
              })
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
              // Reload the review to show the new comment
              const updatedReview = await fetchReviewById(reviewId);
              renderComments(updatedReview.comments);
              
              // Clear the textarea
              commentTextarea.value = '';
            } else {
              throw new Error(result.message || 'Failed to add comment');
            }
          } catch (error) {
            console.error('Error adding comment:', error);
            showError('Failed to add comment. Please try again later.');
          } finally {
            hideLoading();
          }
        }
      });
    }
  }

  // Render comments for a specific course
  function renderComments(comments) {
    const commentsSection = document.querySelector('.comments-section');
    if (!commentsSection) return;
    
    // Update comments title
    const commentsTitle = commentsSection.querySelector('.comments-title');
    if (commentsTitle) {
      commentsTitle.textContent = `Comments (${comments ? comments.length : 0})`;
    }
    
    // Clear existing comments
    const existingComments = commentsSection.querySelectorAll('.comment');
    existingComments.forEach(comment => comment.remove());
    
    // Add new comments
    const commentForm = commentsSection.querySelector('.comment-form');
    
    if (comments && comments.length > 0) {
      comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        // Format the date if it's not already formatted
        let formattedDate = comment.date;
        if (comment.date && !comment.date.includes(' ')) {
          // If we have a raw date from the database, format it nicely
          const date = new Date(comment.date);
          formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;
        }
        
        commentElement.innerHTML = `
          <div class="comment-author">${comment.author}</div>
          <div class="comment-date">${formattedDate}</div>
          <p>${comment.text}</p>
        `;
        
        // Insert before the comment form
        commentsSection.insertBefore(commentElement, commentForm);
      });
    }
  }

  // Apply filters and sort the reviews by fetching from API
  function applyFiltersAndSort() {
    state.currentPage = 1; // Reset to first page when applying new filters
    fetchReviews().then(reviews => renderReviewCards(reviews));
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
    
    input.parentNode.insertBefore(errorElement, input.nextSibling);
    input.style.borderColor = 'red';
    
    input.addEventListener('input', function() {
      this.style.borderColor = '';
      const errorEl = this.nextElementSibling;
      if (errorEl && errorEl.className === 'error-text') errorEl.remove();
    });
  }

  // Fill form with review data for editing
  async function fillFormForEdit(reviewId) {
    try {
      showLoading();
      const review = await fetchReviewById(reviewId);
      hideLoading();
      
      if (!review) {
        showError('Could not load review for editing');
        return;
      }
      
      const form = document.querySelector('form');
      if (!form) return;
      
      // Set form values
      form.querySelector('#course').value = review.courseCode || '';
      form.querySelector('#instructor').value = review.instructor || '';
      form.querySelector('#rating').value = review.rating || 3;
      form.querySelector('#review').value = review.fullContent || '';
      
      const difficultySelect = form.querySelector('#difficulty');
      if (difficultySelect) {
        for (let i = 0; i < difficultySelect.options.length; i++) {
          if (difficultySelect.options[i].value === review.difficulty) {
            difficultySelect.selectedIndex = i;
            break;
          }
        }
      }
      
      const departmentSelect = form.querySelector('#department');
      if (departmentSelect) {
        for (let i = 0; i < departmentSelect.options.length; i++) {
          if (departmentSelect.options[i].value === review.department) {
            departmentSelect.selectedIndex = i;
            break;
          }
        }
      }
      
      // Add a hidden field to indicate editing
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.id = 'editingReviewId';
      hiddenField.value = reviewId;
      form.appendChild(hiddenField);
      
      // Change submit button text
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Update Review';
      }
      
      // Change form title
      const formTitle = document.querySelector('.form-container h2');
      if (formTitle) {
        formTitle.textContent = 'Edit Course Review';
      }
    } catch (error) {
      console.error('Error filling form for edit:', error);
      hideLoading();
      showError('Failed to load review for editing');
    }
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
          console.log('Department filter changed to:', state.filters.department);
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
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    // If we're editing an existing review
    if (editId) {
      fillFormForEdit(editId);
    }
    
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateAddReviewForm(form)) {
          try {
            showLoading();
            
            // Get form data
            const formData = {
              courseCode: form.querySelector('#course').value,
              courseTitle: form.querySelector('#course').value, // Use course code as title if not specified
              instructor: form.querySelector('#instructor').value,
              department: form.querySelector('#department').value,
              difficulty: form.querySelector('#difficulty').value,
              rating: parseInt(form.querySelector('#rating').value),
              content: form.querySelector('#review').value.substring(0, 100) + '...', // Short summary
              fullContent: form.querySelector('#review').value
            };
            
            // Check if we're editing or creating
            const editingId = form.querySelector('#editingReviewId')?.value;
            let response;
            
            if (editingId) {
              // Update existing review
              response = await fetch(`${API_BASE_URL}?id=${editingId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              });
            } else {
              // Create new review
              response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...formData,
                  action: 'reviews'
                })
              });
            }
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
              alert(editingId ? 'Review updated successfully!' : 'Review submitted successfully!');
              window.location.href = 'Review.html';
            } else {
              throw new Error(result.message || 'Failed to save review');
            }
          } catch (error) {
            console.error('Error saving review:', error);
            showError('Failed to save review. Please try again later.');
          } finally {
            hideLoading();
          }
        }
      });
    }
  }

   // Initialize the appropriate page based on the current URL
   function initializeApp() {
    const currentPath = window.location.pathname;
    
    if (currentPath.endsWith('review-detail.html')) {
      initDetailPage();
    } else if (currentPath.endsWith('add-review.html')) {
      initAddReviewPage();
    } else {
      initMainPage();
    }
  }

  
  // Run the initialization when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initializeApp);