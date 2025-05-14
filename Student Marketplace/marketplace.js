
let items = [];
let currentPage = 1;
const itemsPerPage = 6;
let filteredItems = [];

const listingSection = document.querySelector("#item-listing");
const paginationSection = document.querySelector("#pagination-controls");
const searchInput = document.querySelector("#listing input[type='text']");
const filterSelect = document.querySelectorAll("#listing select")[0];
const sortSelect = document.querySelectorAll("#listing select")[1];
const form = document.querySelector("#item-form");

function fetchItemsFromServer() {
  fetch('https://yaya05773.my-app-1.repl.co/api/get_items.php')  // Replace with your Replit URL
    .then(response => response.json())
    .then(data => {
      items = data;
      filteredItems = [...items];
      populateFilterOptions();
      renderItems();
      renderPagination();
    })
    .catch(err => {
      console.error("Error fetching items:", err);
    });
}

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
      <p class="text-sm text-gray-600">Condition: ${item.condition || 'New'}</p>
      <a href="#detail" class="text-blue-500 text-sm" onclick="viewDetail('${item.id}')">View Details</a>
    </div>
  `).join('');
}

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

function populateFilterOptions() {
  const categories = [...new Set(items.map(item => item.category))];
  filterSelect.innerHTML = <option value="">Filter by Category</option> +
    categories.map(cat => <option value="${cat}">${cat}</option>).join('');
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
  currentPage = 1;
  renderItems();
  renderPagination();
});

filterSelect.addEventListener('change', () => {
  const category = filterSelect.value;
  filteredItems = category ? items.filter(item => item.category === category) : [...items];
  currentPage = 1;
  renderItems();
  renderPagination();
});

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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value || Date.now().toString();
  const name = document.getElementById('name').value.trim();
  const category = document.getElementById('category').value.trim();
  const description = document.getElementById('description').value.trim();
  const price = parseFloat(document.getElementById('price').value.trim());

  if (!name || !category || isNaN(price)) {
    alert('Please fill all required fields.');
    return;
  }

  const existingIndex = items.findIndex(i => i.id === id);

  const newItem = { id, name, category, description, price, condition: 'New' };

  if (existingIndex !== -1) {
    items[existingIndex] = newItem;
  } else {
    items.unshift(newItem);
  }

  filteredItems = [...items];
  populateFilterOptions();
  renderItems();
  renderPagination();
  form.reset();
  document.getElementById('edit-id').value = '';
  alert('Item saved successfully!');
});

// Cancel button clears form
const cancelBtn = document.getElementById('cancel-btn');
cancelBtn.addEventListener('click', () => {
  form.reset();
  document.getElementById('edit-id').value = '';
});

function viewDetail(id) {
  const item = items.find(it => it.id == id);
  if (!item) return;

  const detailSection = document.querySelector("#item-detail");
  detailSection.innerHTML = `
    <h3 class="text-lg font-semibold">${item.name}</h3>
    <p><strong>Category:</strong> ${item.category}</p>
    <p><strong>Description:</strong> ${item.description || 'No description'}</p>
    <p><strong>Price:</strong> ${item.price} BHD</p>

    <div class="flex gap-4 mt-4">
      <button onclick="editItem('${item.id}')" class="bg-yellow-400 text-white px-4 py-2 rounded">Edit</button>
      <button onclick="deleteItem('${item.id}')" class="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
    </div>

    <div class="mt-6">
      <h4 class="font-semibold">Comments</h4>
      <div class="border-t pt-2 mt-2 text-sm text-gray-600 italic">No comments yet.</div>
    </div>

    <a href="#listing" class="block mt-4 text-blue-600">Back to Listing</a>
  `;
}

function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  filteredItems = [...items];
  renderItems();
  renderPagination();
  document.querySelector("#item-detail").innerHTML = '<p class="italic text-gray-500">Item deleted. Select another to view details.</p>';
}

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('edit-id').value = item.id;
  document.getElementById('name').value = item.name;
  document.getElementById('category').value = item.category;
  document.getElementById('description').value = item.description;
  document.getElementById('price').value = item.price;
  window.location.href = "#create";
}

function init() {
  filteredItems = [...items];
  populateFilterOptions();
  renderItems();
  renderPagination();
}

init();
