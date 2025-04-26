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