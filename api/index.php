<?php

    // Set headers for JSON API
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
    $db_name = getenv('db_name') ;
    $db_user = getenv('db_user');
    $db_pass = getenv('db_pass') ;

    // Create database helper instance
    $dbHelper = new DatabaseHelper($db_host, $db_name, $db_user, $db_pass);

    
// Parse the URL to determine the endpoint
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($request_uri, '/'));

// The endpoint is the last segment of the URI, or 'reviews' if accessing root
$endpoint = !empty($uri_segments) ? end($uri_segments) : 'reviews';

    // Check if we have an ID parameter
    $id = null;
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    }

    // Route the request based on the endpoint and method
    try {
        // Reviews endpoint
        if ($endpoint === 'reviews' || $endpoint === 'api.php') {
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    // Get reviews based on parameters
                    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 3;
                    $search = isset($_GET['search']) ? $_GET['search'] : '';
                    $department = isset($_GET['department']) ? $_GET['department'] : '';
                    $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : '';
                    $rating = isset($_GET['rating']) ? (int)$_GET['rating'] : 0;
                    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'recent';

                    if ($id) {
                        // Get single review
                        $review = $dbHelper->getReviewById($id);
                        if ($review) {
                            echo json_encode([
                                'status' => 'success',
                                'data' => $review
                            ]);
                        } else {
                            http_response_code(404);
                            echo json_encode([
                                'status' => 'error',
                                'message' => 'Review not found'
                            ]);
                        }
                    } else {
                        // Get multiple reviews with filters and pagination
                        $reviews = $dbHelper->getReviews($page, $limit, $search, $department, $difficulty, $rating, $sort);
                        $total = $dbHelper->getTotalReviews($search, $department, $difficulty, $rating);

                        echo json_encode([
                            'status' => 'success',
                            'current_page' => $page,
                            'per_page' => $limit,
                            'total' => $total,
                            'total_pages' => ceil($total / $limit),
                            'data' => $reviews
                        ]);
                    }
                    break;

                case 'POST':
                    // Create a new review
                    $json = file_get_contents('php://input');
                    $data = json_decode($json, true);

                    // Validate required fields
                    if (empty($data['courseCode']) || 
                        empty($data['instructor']) || 
                        empty($data['department']) || 
                        empty($data['difficulty']) || 
                        !isset($data['rating']) || 
                        empty($data['content'])) {
                        throw new Exception('Please fill in all required fields');
                    }

                    // Validate rating
                    if ($data['rating'] < 1 || $data['rating'] > 5) {
                        throw new Exception('Rating must be between 1 and 5');
                    }

                    // Insert the review
                    $reviewId = $dbHelper->createReview(
                        $data['courseCode'],
                        $data['courseTitle'] ?? $data['courseCode'],
                        $data['instructor'],
                        $data['department'],
                        $data['difficulty'],
                        $data['rating'],
                        $data['content'],
                        $data['fullContent'] ?? $data['content']
                    );

                    if ($reviewId) {
                        $review = $dbHelper->getReviewById($reviewId);
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Review created successfully',
                            'data' => $review
                        ]);
                    } else {
                        throw new Exception('Failed to create review');
                    }
                    break;

                case 'PUT':
                    // Update an existing review
                    if (!$id) {
                        throw new Exception('Review ID is required');
                    }

                    $json = file_get_contents('php://input');
                    $data = json_decode($json, true);

                    // Check if review exists
                    $review = $dbHelper->getReviewById($id);
                    if (!$review) {
                        http_response_code(404);
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Review not found'
                        ]);
                        break;
                    }

                    // Update the review
                    $result = $dbHelper->updateReview(
                        $id,
                        $data['courseCode'] ?? $review['courseCode'],
                        $data['courseTitle'] ?? $review['courseTitle'],
                        $data['instructor'] ?? $review['instructor'],
                        $data['department'] ?? $review['department'],
                        $data['difficulty'] ?? $review['difficulty'],
                        $data['rating'] ?? $review['rating'],
                        $data['content'] ?? $review['content'],
                        $data['fullContent'] ?? $review['fullContent']
                    );

                    if ($result) {
                        $updatedReview = $dbHelper->getReviewById($id);
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Review updated successfully',
                            'data' => $updatedReview
                        ]);
                    } else {
                        throw new Exception('Failed to update review');
                    }
                    break;

                case 'DELETE':
                    // Delete a review
                    if (!$id) {
                        throw new Exception('Review ID is required');
                    }

                    // Check if review exists
                    $review = $dbHelper->getReviewById($id);
                    if (!$review) {
                        http_response_code(404);
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Review not found'
                        ]);
                        break;
                    }

                    // Delete the review
                    $result = $dbHelper->deleteReview($id);

                    if ($result) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Review deleted successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to delete review');
                    }
                    break;

                default:
                    http_response_code(405);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Method not allowed'
                    ]);
            }
        } 
        // Comments endpoint
        elseif ($endpoint === 'comments') {
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    // Get comments for a review
                    if (!$id) {
                        throw new Exception('Review ID is required');
                    }

                    $comments = $dbHelper->getCommentsByReviewId($id);

                    echo json_encode([
                        'status' => 'success',
                        'data' => $comments
                    ]);
                    break;

                case 'POST':
                    // Add a comment to a review
                    $json = file_get_contents('php://input');
                    $data = json_decode($json, true);

                    if (!isset($data['review_id']) || empty($data['author']) || empty($data['text'])) {
                        throw new Exception('Review ID, author, and text are required');
                    }

                    $commentId = $dbHelper->addComment($data['review_id'], $data['author'], $data['text']);

                    if ($commentId) {
                        $comment = $dbHelper->getCommentById($commentId);
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Comment added successfully',
                            'data' => $comment
                        ]);
                    } else {
                        throw new Exception('Failed to add comment');
                    }
                    break;

                default:
                    http_response_code(405);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Method not allowed'
                    ]);
            }
        }
        // Departments endpoint
        elseif ($endpoint === 'departments') {
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $departments = $dbHelper->getDepartments();

                echo json_encode([
                    'status' => 'success',
                    'data' => $departments
                ]);
            } else {
                http_response_code(405);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Method not allowed'
                ]);
            }
        }
        else {
            // Handle invalid endpoint
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Endpoint not found'
            ]);
        }
    } catch (Exception $e) {
        // Handle errors
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
    ?>
