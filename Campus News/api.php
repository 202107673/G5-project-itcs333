<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'campus_news');
define('DB_USER', 'root');
define('DB_PASS', '');

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class NewsAPI {
    private $conn;
    private $table = 'news_articles';

    public function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
            die();
        }
    }

    // Get all news articles with pagination and search
    public function getArticles($page = 1, $limit = 6, $search = '', $category = '') {
        try {
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT a.*, c.name as category_name 
                     FROM {$this->table} a 
                     LEFT JOIN categories c ON a.category_id = c.id 
                     WHERE 1=1";
            
            $params = [];
            
            if ($search) {
                $query .= " AND (a.title LIKE ? OR a.content LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            if ($category) {
                $query .= " AND c.name = ?";
                $params[] = $category;
            }
            
            // Get total count for pagination
            $countStmt = $this->conn->prepare(str_replace('a.*, c.name as category_name', 'COUNT(*)', $query));
            $countStmt->execute($params);
            $totalItems = $countStmt->fetchColumn();
            
            // Get paginated results
            $query .= " ORDER BY a.created_at DESC LIMIT ? OFFSET ?";
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'status' => 'success',
                'data' => $articles,
                'pagination' => [
                    'page' => (int)$page,
                    'limit' => (int)$limit,
                    'total' => (int)$totalItems,
                    'total_pages' => ceil($totalItems / $limit)
                ]
            ];
        } catch(PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    // Get single article
    public function getArticle($id) {
        try {
            $query = "SELECT a.*, c.name as category_name 
                     FROM {$this->table} a 
                     LEFT JOIN categories c ON a.category_id = c.id 
                     WHERE a.id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id]);
            $article = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($article) {
                // Update view count
                $updateStmt = $this->conn->prepare("UPDATE {$this->table} SET views = views + 1 WHERE id = ?");
                $updateStmt->execute([$id]);
                
                return ['status' => 'success', 'data' => $article];
            }
            
            return ['status' => 'error', 'message' => 'Article not found'];
        } catch(PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    // Create article
    public function createArticle($data) {
        try {
            // Get category ID
            $categoryStmt = $this->conn->prepare("SELECT id FROM categories WHERE name = ?");
            $categoryStmt->execute([$data['category']]);
            $categoryId = $categoryStmt->fetchColumn();
            
            if (!$categoryId) {
                return ['status' => 'error', 'message' => 'Invalid category'];
            }
            
            $query = "INSERT INTO {$this->table} (title, content, category_id, author) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['title'],
                $data['content'],
                $categoryId,
                $data['author'] ?? 'Anonymous'
            ]);
            
            $newId = $this->conn->lastInsertId();
            return ['status' => 'success', 'message' => 'Article created', 'id' => $newId];
        } catch(PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    // Update article
    public function updateArticle($id, $data) {
        try {
            // Get category ID if category is being updated
            $categoryId = null;
            if (isset($data['category'])) {
                $categoryStmt = $this->conn->prepare("SELECT id FROM categories WHERE name = ?");
                $categoryStmt->execute([$data['category']]);
                $categoryId = $categoryStmt->fetchColumn();
                
                if (!$categoryId) {
                    return ['status' => 'error', 'message' => 'Invalid category'];
                }
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($data['title'])) {
                $updateFields[] = 'title = ?';
                $params[] = $data['title'];
            }
            
            if (isset($data['content'])) {
                $updateFields[] = 'content = ?';
                $params[] = $data['content'];
            }
            
            if ($categoryId) {
                $updateFields[] = 'category_id = ?';
                $params[] = $categoryId;
            }
            
            if (empty($updateFields)) {
                return ['status' => 'error', 'message' => 'No fields to update'];
            }
            
            $params[] = $id;
            $query = "UPDATE {$this->table} SET " . implode(', ', $updateFields) . " WHERE id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            if ($stmt->rowCount()) {
                return ['status' => 'success', 'message' => 'Article updated'];
            }
            
            return ['status' => 'error', 'message' => 'Article not found or no changes made'];
        } catch(PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    // Delete article
    public function deleteArticle($id) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount()) {
                return ['status' => 'success', 'message' => 'Article deleted'];
            }
            
            return ['status' => 'error', 'message' => 'Article not found'];
        } catch(PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    // Get categories
    public function getCategories() {
        try {
            $stmt = $this->conn->query("SELECT * FROM categories ORDER BY name");
            return ['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch(PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}

// Initialize API
$api = new NewsAPI();
$method = $_SERVER['REQUEST_METHOD'];

// Handle API requests
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'categories':
            // Get categories
            echo json_encode($api->getCategories());
            break;
            
        case 'articles':
            switch ($method) {
                case 'GET':
                    // Get single article
                    if (isset($_GET['id'])) {
                        echo json_encode($api->getArticle($_GET['id']));
                        break;
                    }
                    
                    // Get articles list with pagination and search
                    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;
                    $search = isset($_GET['search']) ? $_GET['search'] : '';
                    $category = isset($_GET['category']) ? $_GET['category'] : '';
                    
                    echo json_encode($api->getArticles($page, $limit, $search, $category));
                    break;
                    
                case 'POST':
                    // Create new article
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    if (!$data) {
                        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
                        break;
                    }
                    
                    // Validate required fields
                    if (empty($data['title']) || empty($data['content']) || empty($data['category'])) {
                        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
                        break;
                    }
                    
                    echo json_encode($api->createArticle($data));
                    break;
                    
                case 'PUT':
                    // Update article
                    if (!isset($_GET['id'])) {
                        echo json_encode(['status' => 'error', 'message' => 'Article ID required']);
                        break;
                    }
                    
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    if (!$data) {
                        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
                        break;
                    }
                    
                    echo json_encode($api->updateArticle($_GET['id'], $data));
                    break;
                    
                case 'DELETE':
                    // Delete article
                    if (!isset($_GET['id'])) {
                        echo json_encode(['status' => 'error', 'message' => 'Article ID required']);
                        break;
                    }
                    
                    echo json_encode($api->deleteArticle($_GET['id']));
                    break;
                    
                default:
                    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
                    break;
            }
            break;
            
        default:
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            break;
    }
} else {
    // API Documentation
    header('Content-Type: text/html');
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campus News API Documentation</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .endpoint { margin-bottom: 30px; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>Campus News API Documentation</h1>
        
        <div class="endpoint">
            <h2>List Articles</h2>
            <p><code>GET /api.php?action=articles</code></p>
            <p>Parameters:</p>
            <ul>
                <li><code>page</code> (optional) - Page number (default: 1)</li>
                <li><code>limit</code> (optional) - Items per page (default: 6)</li>
                <li><code>search</code> (optional) - Search term</li>
                <li><code>category</code> (optional) - Filter by category name</li>
            </ul>
        </div>

        <div class="endpoint">
            <h2>Get Single Article</h2>
            <p><code>GET /api.php?action=articles&id={id}</code></p>
        </div>

        <div class="endpoint">
            <h2>Create Article</h2>
            <p><code>POST /api.php?action=articles</code></p>
            <p>Request body:</p>
            <pre>{
    "title": "Article Title",
    "content": "Article Content",
    "category": "Category Name",
    "author": "Author Name" (optional)
}</pre>
        </div>

        <div class="endpoint">
            <h2>Update Article</h2>
            <p><code>PUT /api.php?action=articles&id={id}</code></p>
            <p>Request body (all fields optional):</p>
            <pre>{
    "title": "New Title",
    "content": "New Content",
    "category": "New Category"
}</pre>
        </div>

        <div class="endpoint">
            <h2>Delete Article</h2>
            <p><code>DELETE /api.php?action=articles&id={id}</code></p>
        </div>

        <div class="endpoint">
            <h2>List Categories</h2>
            <p><code>GET /api.php?action=categories</code></p>
        </div>
    </body>
    </html>
    <?php
}
