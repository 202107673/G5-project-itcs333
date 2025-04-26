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