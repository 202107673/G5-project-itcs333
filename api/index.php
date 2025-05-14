<?php
/**
 * This file provides REST API endpoints for the course reviews application.
 * It handles requests for course reviews including listing, creating, updating, and deleting.
 */

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

require_once 'DatabaseHelper.php';

// Database configuration
$db_host = 'localhost';
$db_name = getenv('db_name') ?? 'campus_hub';
$db_user = getenv('db_user') ?? 'root';
$db_pass = getenv('db_pass') ?? '';

// Create database helper instance
$db = new DatabaseHelper($db_host, $db_name, $db_user, $db_pass);

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Helper function to send JSON response
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Process the request
try {
    if ($method === 'GET') {
        $action = isset($_GET['action']) ? filter_var($_GET['action'], FILTER_SANITIZE_SPECIAL_CHARS) : 'reviews';
        $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;

        if ($action === 'reviews') {
            if (isset($id) && $id !== false) {
                // Get a single review
                $review = $db->getReview($id);
                $review ? respond($review) : respond(['status' => 'error', 'message' => 'Review not found'], 404);
            } else {
                // Get multiple reviews with pagination and filters
                $page = isset($_GET['page']) ? filter_var($_GET['page'], FILTER_VALIDATE_INT) : 1;
                $limit = isset($_GET['limit']) ? filter_var($_GET['limit'], FILTER_VALIDATE_INT) : 3;
                
                // Build filters array
                $filters = [];
                if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
                if (isset($_GET['department'])) $filters['department'] = $_GET['department'];
                if (isset($_GET['difficulty'])) $filters['difficulty'] = $_GET['difficulty'];
                if (isset($_GET['rating'])) $filters['rating'] = $_GET['rating'];
                
                // Set sort option
                $sort = isset($_GET['sort']) ? $_GET['sort'] : 'recent';
                
                // Get reviews and total count
                $reviews = $db->getAllReviews($page, $limit, $filters, $sort);
                $totalReviews = $db->getReviewCount($filters);
                
                // Prepare response with pagination metadata
                $response = [
                    'status' => 'success',
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $totalReviews,
                    'total_pages' => ceil($totalReviews / $limit),
                    'data' => $reviews
                ];
                
                respond($response);
            }
        } elseif ($action === 'comments') {
            if (isset($id) && $id !== false) {
                $comments = $db->getComments($id);
                respond(['status' => 'success', 'data' => $comments]);
            } else {
                respond(['status' => 'error', 'message' => 'Missing or invalid review ID'], 400);
            }
        } elseif ($action === 'departments') {
            $departments = $db->getDepartments();
            respond(['status' => 'success', 'data' => $departments]);
        } else {
            respond(['status' => 'error', 'message' => 'Invalid action'], 400);
        }
    } elseif ($method === 'POST') {
        // Get JSON data from request body
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data) {
            // Try to get data from POST parameters if JSON is empty
            $data = $_POST;
        }
        
        $action = isset($data['action']) ? filter_var($data['action'], FILTER_SANITIZE_SPECIAL_CHARS) : 'reviews';
        
        if ($action === 'reviews') {
            // Create a new review
            if (isset($data['courseCode'], $data['instructor'], $data['department'], $data['difficulty'], $data['rating'], $data['content'])) {
                // Set courseTitle to courseCode if not provided
                if (!isset($data['courseTitle']) || empty($data['courseTitle'])) {
                    $data['courseTitle'] = $data['courseCode'];
                }
                
                // Set fullContent to content if not provided
                if (!isset($data['fullContent']) || empty($data['fullContent'])) {
                    $data['fullContent'] = $data['content'];
                }
                
                if ($db->createReview($data)) {
                    respond(['status' => 'success', 'message' => 'Review created successfully'], 201);
                } else {
                    respond(['status' => 'error', 'message' => 'Failed to create review. Please check your input data.'], 400);
                }
            } else {
                respond(['status' => 'error', 'message' => 'Missing required fields'], 400);
            }
        } elseif ($action === 'comments') {
            // Add a comment to a review
            $reviewId = isset($data['review_id']) ? filter_var($data['review_id'], FILTER_VALIDATE_INT) : null;
            $author = isset($data['author']) ? trim($data['author']) : '';
            $text = isset($data['text']) ? trim($data['text']) : '';
            if ($reviewId && !empty($author) && !empty($text)) {
                if ($db->addComment($reviewId, $author, $text)) {
                    respond(['status' => 'success', 'message' => 'Comment added successfully'], 201);
                } else {
                    respond(['status' => 'error', 'message' => 'Failed to add comment'], 400);
                }
            } else {
                respond(['status' => 'error', 'message' => 'Missing or invalid required fields'], 400);
            }
        } else {
            respond(['status' => 'error', 'message' => 'Invalid action'], 400);
        }
    } elseif ($method === 'PUT') {
        // Get JSON data from request body
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
        
        if ($id && $data) {
            if ($db->updateReview($id, $data)) {
                respond(['status' => 'success', 'message' => 'Review updated successfully']);
            } else {
                respond(['status' => 'error', 'message' => 'Failed to update review or review not found'], 400);
            }
        } else {
            respond(['status' => 'error', 'message' => 'Missing review ID or update data'], 400);
        }
    } elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
        
        if ($id) {
            if ($db->deleteReview($id)) {
                respond(['status' => 'success', 'message' => 'Review deleted successfully']);
            } else {
                respond(['status' => 'error', 'message' => 'Failed to delete review or review not found'], 400);
            }
        } else {
            respond(['status' => 'error', 'message' => 'Missing review ID'], 400);
        }
    } else {
        respond(['status' => 'error', 'message' => 'Invalid HTTP method'], 405);
    }
} catch (Exception $e) {
    respond(['status' => 'error', 'message' => $e->getMessage()], 500);
}
?>