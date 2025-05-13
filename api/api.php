<?php


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include the DatabaseHelper class
require_once 'DatabaseHelper.php';

// Database configuration
$db_host = 'localhost';
$db_name = getenv('db_name') ?? 'campus_hub';
$db_user = getenv('db_user') ?? 'root';
$db_pass = getenv('db_pass') ?? '';

// Create database helper instance
$dbHelper = new DatabaseHelper($db_host, $db_name, $db_user, $db_pass);

// Get URL path components
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = explode('/', trim($request_uri, '/'));

// The endpoint is the first part of the path after the base URL
$endpoint = $path[count($path) - 1];

// Get ID from URL if present (for GET, PUT, DELETE specific review)
$id = null;
if (isset($path[count($path)]) && is_numeric($path[count($path)])) {
    $id = (int)$path[count($path)];
}

// Route the request based on the endpoint and method
try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Handle GET requests
            if ($endpoint === 'reviews') {
                // Get query parameters for filtering and searching
                $search = isset($_GET['search']) ? trim($_GET['search']) : '';
                $department = isset($_GET['department']) ? $_GET['department'] : '';
                $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : '';
                $rating = isset($_GET['rating']) ? (int)$_GET['rating'] : 0;
                $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'recent';
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 3;
                
                if ($id) {
                    // Get a specific review
                    $review = $dbHelper->getReviewById($id);
                    if ($review) {
                        echo json_encode([
                            'status' => 'success',
                            'data' => $review
                        ]);
                    } else {
                        throw new Exception('Review not found');
                    }
                } else {
                    // Get all reviews with optional filtering
                    $reviews = $dbHelper->getReviews($search, $department, $difficulty, $rating, $sortBy, $page, $limit);
                    $total = $dbHelper->getTotalReviews($search, $department, $difficulty, $rating);
                    
                    echo json_encode([
                        'status' => 'success',
                        'count' => count($reviews),
                        'total' => $total,
                        'pages' => ceil($total / $limit),
                        'currentPage' => $page,
                        'data' => $reviews
                    ]);
                }
            } elseif ($endpoint === 'comments' && $id) {
              