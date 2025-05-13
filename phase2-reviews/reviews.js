// state object with properties
const state = {
    reviews: [], //when your application first loads, there are no course reviews loaded yet.
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

  // API base URL - replace with your Replit URL
  const API_BASE_URL = 'https://c3a143ca-9ea1-47c4-b047-92244630af62-00-spw7mnp6b1m0.sisko.replit.dev';
  
  // Fetch all reviews from our API
  async function fetchReviews() {
    try {
      showLoading();
      
      // Build query parameters based on filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', state.currentPage);
      queryParams.append('limit', state.reviewsPerPage);
      
      if (state.filters.search) {
        queryParams.append('search', state.filters.search);
      }
      
      if (state.filters.department) {
        // Convert short department code to full name if needed
        const departmentMap = {
          'cs': 'Computer Science',
          'bio': 'Biology',
          'eng': 'English',
          'math': 'Mathematics',
          'phys': 'Physics'
        };
        
        const departmentValue = departmentMap[state.filters.department] || state.filters.department;
        queryParams.append('department', departmentValue);
      }
      
      if (state.filters.level) {
        queryParams.append('difficulty', state.filters.level);
      }
      
      if (state.filters.rating) {
        queryParams.append('rating', state.filters.rating);
      }
      
      queryParams.append('sort', state.sortOption);
      
      // Fetch reviews from the API
      const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if the response is successful and has the expected structure
      if (result.status !== 'success' || !result.data) {
        throw new Error('Invalid API response format');
      }
      
      // Update state with the received data
      state.reviews = result.data;
      state.filteredReviews = [...state.reviews];
      
      // Update total reviews count and pagination
      if (result.total) {
        state.totalReviews = result.total;
        state.totalPages = result.total_pages;
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
      
      // If we already have the review in our state, return it
      const cachedReview = state.reviews.find(review => review.id === parseInt(id));
      if (cachedReview) {
        hideLoading();
        return cachedReview;
      }
      
      // Otherwise, fetch from API
      const response = await fetch(`${API_BASE_URL}?id=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if the response is successful and has the expected structure
      if (result.status !== 'success' || !result.data) {
        throw new Error('Invalid API response format');
      }
      
      const review = result.data;
      hideLoading();
      return review;
    } catch (error) {
      console.error('Error fetching review:', error);
      hideLoading();
      showError('Failed to load review. Please try again later.');
      return null;
    }
  }

  // Submit a new review
  async function submitReview(reviewData) {
    try {
      showLoading();
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to submit review');
      }
      
      hideLoading();
      return result.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      hideLoading();
      showError(error.message || 'Failed to submit review. Please try again later.');
      return null;
    }
  }

  // Submit a new comment
  async function submitComment(reviewId, author, text) {
    try {
      showLoading();
      
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          review_id: reviewId,
          author: author,
          text: text
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to submit comment');
      }
      
      hideLoading();
      return result.data;
    } catch (error) {
      console.error('Error submitting comment:', error);
      hideLoading();
      showError('Failed to submit comment. Please try again later.');
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
    
    renderPagination(state.totalReviews || reviews.length);
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
    
    const totalPages = state.totalPages || Math.ceil(totalItems / state.reviewsPerPage);
    
    // Clear existing buttons
    paginationDiv.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = state.currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        fetchReviews().then(reviews => {
          renderReviewCards(reviews);
        });
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
        fetchReviews().then(reviews => {
          renderReviewCards(reviews);
        });
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

    // Set up edit and delete buttons
    const editButton = document.querySelector('.review-detail button:nth-child(1)');
    if (editButton) {
      editButton.addEventListener('click', () => {
        // Redirect to add review page with review id as parameter for editing
        window.location.href = `add-review.html?edit=${review.id}`;
      });
    }

    const deleteButton = document.querySelector('.review-detail button.btn-danger');
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this review?')) {
          try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}?id=${review.id}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status !== 'success') {
              throw new Error(result.message || 'Failed to delete review');
            }
            
            hideLoading();
            alert('Review deleted successfully!');
            window.location.href = 'Review.html';
          } catch (error) {
            console.error('Error deleting review:', error);
            hideLoading();
            showError('Failed to delete review. Please try again later.');
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
        <div class="comment-date">${new Date(comment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <p>${comment.text}</p>
      `;
      
      // Insert before the comment form
      commentsSection.insertBefore(commentElement, commentForm);
    });
  }

  // Apply filters and sort the reviews by fetching from the API
  function applyFiltersAndSort() {
    state.currentPage = 1;
    fetchReviews().then(reviews => {
      renderReviewCards(reviews);
    });
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
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (form) {
      // If we're editing an existing review, fill the form with its data
      if (editId) {
        fetchReviewById(editId).then(review => {
          if (review) {
            // Fill the form with the review data
            const courseInput = form.querySelector('#course');
            const instructorInput = form.querySelector('#instructor');
            const ratingInput = form.querySelector('#rating');
            const reviewInput = form.querySelector('#review');
            const difficultyInput = form.querySelector('#difficulty');
            const departmentInput = form.querySelector('#department');
            
            if (courseInput) courseInput.value = review.courseCode;
            if (instructorInput) instructorInput.value = review.instructor;
            if (ratingInput) ratingInput.value = review.rating;
            if (reviewInput) reviewInput.value = review.fullContent;
            if (difficultyInput) difficultyInput.value = review.difficulty;
            if (departmentInput) {
              // Find and select the matching option
              const options = departmentInput.options;
              for (let i = 0; i < options.length; i++) {
                if (options[i].textContent === review.department) {
                  departmentInput.selectedIndex = i;
                  break;
                }
              }
            }
            
            // Change submit button text to indicate editing
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) submitButton.textContent = 'Update Review';
          }
        });
      }
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateAddReviewForm(form)) {
          // Gather form data
          const courseCode = form.querySelector('#course').value;
          const instructor = form.querySelector('#instructor').value;
          const rating = parseInt(form.querySelector('#rating').value);
          const content = form.querySelector('#review').value;
          const difficulty = form.querySelector('#difficulty').value;
          const departmentSelect = form.querySelector('#department');
          const department = departmentSelect.options[departmentSelect.selectedIndex].text;
          
          // Prepare the review data
          const reviewData = {
            courseCode: courseCode,
            courseTitle: courseCode, // You may want to add a separate field for course title
            instructor: instructor,
            department: department,
            difficulty: difficulty,
            rating: rating,
            content: content.substring(0, 255), // Short description (limited to 255 chars)
            fullContent: content
          };
          
          try {
            if (editId) {
              // Update an existing review
              const response = await fetch(`${API_BASE_URL}?id=${editId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
              });
              
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              
              const result = await response.json();
              
              if (result.status !== 'success') {
                throw new Error(result.message || 'Failed to update review');
              }
              
              alert('Review updated successfully!');
            } else {
              // Create a new review
              const result = await submitReview(reviewData);
              if (result) {
                alert('Review submitted successfully!');
                form.reset();
              }
            }
          } catch (error) {
            console.error('Error saving review:', error);
            showError('Failed to save review. Please try again later.');
          }
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
      commentButton.addEventListener('click', async () => {
        const commentText = commentTextarea.value.trim();
        
        if (commentText) {
          // Get the review ID from the URL
          const urlParams = new URLSearchParams(window.location.search);
          const reviewId = urlParams.get('id');
          
          if (!reviewId) {
            showError('Cannot add comment: Review ID not found');
            return;
          }
          
          try {
            const comment = await submitComment(reviewId, 'You', commentText);
            
            if (comment) {
              // Add the new comment to the UI
              const commentSection = document.querySelector('.comments-section');
              const newComment = document.createElement('div');
              newComment.className = 'comment';
              
              newComment.innerHTML = `
                <div class="comment-author">${comment.author}</div>
                <div class="comment-date">${new Date(comment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <p>${comment.text}</p>
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
          } catch (error) {
            console.error('Error adding comment:', error);
            showError('Failed to add comment. Please try again later.');
          }
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