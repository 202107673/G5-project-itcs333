// marketplace.js

// Global variables
let items = [];
let currentPage = 1;
const itemsPerPage = 6;
let filteredItems = [];

// Elements
const listingSection = document.querySelector("#listing .grid");
const paginationSection = document.querySelector("#listing .mt-6.flex");
const searchInput = document.querySelector("#listing input[type='text']");
const filterSelect = document.querySelectorAll("#listing select")[0];
const sortSelect = document.querySelectorAll("#listing select")[1];
const form = document.querySelector("#create form");

// Loading indicator
function showLoading() {
  listingSection.innerHTML = '<div class="col-span-3 text-center text-gray-500">Loading...</div>';
}

// Error message
function showError(message) {
  listingSection.innerHTML = `<div class="col-span-3 text-center text-red-500">${message}</div>`;
}

// Fetch items
async function fetchItems() {
  try {
    showLoading();
    const response = await fetch('https://64f84e8d824680fd217f6fc5.mockapi.io/api/marketplace/items'); // Use MockAPI or JSONPlaceholder
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    const data = await response.json();
    items = data;
    filteredItems = [...items];
    populateFilterOptions();
    renderItems();
    renderPagination();
  } catch (error) {
    showError(error.message);
  }
}

// Populate filter options (Categories)
function populateFilterOptions() {
  const categories = [...new Set(items.map(item => item.category))];
  filterSelect.innerHTML = `<option value="">Filter by Category</option>` +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Render items
function renderItems() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const itemsToDisplay = filteredItems.slice(start, end);

  if (itemsToDisplay.length === 0) {
    listingSection.innerHTML = '<div class="col-span-3 text-center text-gray-500">No items found.</div>';
    return;
  }

  listingSection.innerHTML = itemsToDisplay.map(item => `
    <div class="bg-white p-4 shadow rounded">
      <h3 class="font-bold">${item.name}</h3>
      <p class="text-sm text-gray-600">Condition: ${item.condition || 'Unknown'}</p>
      <a href="#detail" class="text-blue-500 text-sm" onclick="viewDetail('${item.id}')">View Details</a>
    </div>
  `).join('');
}

// Render pagination
function renderPagination() {
  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  paginationSection.innerHTML = '';

  for (let i = 1; i <= pageCount; i++) {
    const button = document.createElement('button');
    button.className = 'px-3 py-1 bg-blue-100 rounded';
    button.textContent = i;
    button.onclick = () => {
      currentPage = i;
      renderItems();
    };
    paginationSection.appendChild(button);
  }
}

// Handle search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
  currentPage = 1;
  renderItems();
  renderPagination();
});

// Handle filter
filterSelect.addEventListener('change', () => {
  const category = filterSelect.value;
  filteredItems = category ? items.filter(item => item.category === category) : [...items];
  currentPage = 1;
  renderItems();
  renderPagination();
});

// Handle sort
sortSelect.addEventListener('change', () => {
  const sortType = sortSelect.value;
  if (sortType === "Name A-Z") {
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === "Name Z-A") {
    filteredItems.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortType === "Price Low-High") {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortType === "Price High-Low") {
    filteredItems.sort((a, b) => b.price - a.price);
  }
  renderItems();
});

// Validate form
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let valid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('border-red-500');
      valid = false;
    } else {
      input.classList.remove('border-red-500');
    }
  });

  if (valid) {
    alert('Item submitted successfully! (Simulation)');
    form.reset();
  } else {
    alert('Please fill all required fields.');
  }
});

// Detail view
function viewDetail(id) {
  const item = items.find(it => it.id == id);
  if (!item) return;

  const detailSection = document.querySelector("#detail .bg-white");
  detailSection.innerHTML = `
    <h3 class="text-lg font-semibold">${item.name}</h3>
    <p><strong>Category:</strong> ${item.category}</p>
    <p><strong>Description:</strong> ${item.description || 'No description'}</p>
    <p><strong>Price:</strong> ${item.price} BHD</p>

    <div class="flex gap-4 mt-4">
      <button class="bg-yellow-400 text-white px-4 py-2 rounded">Edit</button>
      <button class="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
    </div>

    <div class="mt-6">
      <h4 class="font-semibold">Comments</h4>
      <div class="border-t pt-2 mt-2 text-sm text-gray-600 italic">No comments yet.</div>
    </div>

    <a href="#listing" class="block mt-4 text-blue-600">Back to Listing</a>
  `;
}

// Initialize
fetchItems();
