<?php
/**
 * Database Helper Class for Course Reviews
 * 
 * This class provides methods for database operations related to course reviews
 * using PDO for MySQL connections.
 */
class DatabaseHelper {
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $pdo;

    /**
     * Constructor
     * 
     * @param string $host Database host
     * @param string $dbName Database name
     * @param string $username Database username
     * @param string $password Database password
     */
    public function __construct($host, $dbName, $username, $password) {
        $this->host = $host;
        $this->dbName = $dbName;
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * Get PDO connection
     * 
     * @return PDO The PDO connection object
     * @throws PDOException If connection fails
     */
    public function getPDO() {
        if (!$this->pdo) {
            try {
                $this->pdo = new PDO("mysql:host={$this->host};charset=utf8mb4", 
                                    $this->username, 
                                    $this->password);

                // Set error mode to exceptions
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Create database if it doesn't exist
                $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->dbName}`");
                $this->pdo->exec("USE `{$this->dbName}`");

                // Create tables if they don't exist
                $this->createAndPopulateReviewTables();

            } catch (PDOException $e) {
                throw new PDOException("Database connection failed: " . $e->getMessage());
            }
        }

        return $this->pdo;
    }

    /**
     * Execute a query
     * 
     * @param string $sql SQL query to execute
     * @return PDOStatement The result of the query
     * @throws PDOException If query fails
     */
    public function query($sql) {
        return $this->getPDO()->query($sql);
    }

    /**
     * Prepare a statement
     * 
     * @param string $sql SQL statement to prepare
     * @return PDOStatement The prepared statement
     * @throws PDOException If preparation fails
     */
    public function prepare($sql) {
        return $this->getPDO()->prepare($sql);
    }

    /**
     * Execute a SQL statement directly
     * 
     * @param string $sql SQL statement to execute
     * @return int Number of affected rows
     * @throws PDOException If execution fails
     */
    public function exec($sql) {
        return $this->getPDO()->exec($sql);
    }

    /**
     * Create the necessary tables if they don't exist and populate with sample data
     * 
     * @return bool True if successful
     * @throws PDOException If creation fails
     */
    public function createAndPopulateReviewTables() {
        // Create reviews table
        $this->exec("CREATE TABLE IF NOT EXISTS `reviews` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `courseCode` VARCHAR(20) NOT NULL,
            `courseTitle` VARCHAR(100) NOT NULL,
            `instructor` VARCHAR(100) NOT NULL,
            `department` VARCHAR(50) NOT NULL,
            `difficulty` ENUM('Easy', 'Moderate', 'Hard') NOT NULL,
            `rating` INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            `content` VARCHAR(255) NOT NULL,
            `fullContent` TEXT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Create comments table
        $this->exec("CREATE TABLE IF NOT EXISTS `comments` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `review_id` INT NOT NULL,
            `author` VARCHAR(100) NOT NULL,
            `text` TEXT NOT NULL,
            `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Check if reviews table is empty
        $stmt = $this->query("SELECT COUNT(*) FROM `reviews`");
        $count = $stmt->fetchColumn();

        if ($count == 0) {
            // Sample review data (from your courses.json)
            $sampleReviews = [
                [
                    'id' => 1,
                    'courseCode' => 'ITCS101',
                    'courseTitle' => 'Introduction to Programming',
                    'instructor' => 'Dr. Abdullah Subah',
                    'department' => 'Computer Science',
                    'difficulty' => 'Easy',
                    'rating' => 5,
                    'content' => 'Great for beginners, helpful professor.',
                    'fullContent' => 'This course was a great introduction to programming. The professor was very helpful and the assignments were challenging but fair. The exams were straightforward if you attended the lectures. Highly recommended for anyone new to programming.',
                    'comments' => [
                        [
                            'id' => 1,
                            'author' => 'Ahmed',
                            'text' => 'Dr. Abdullah Subah is the best doctor I\'ve had. He explains concepts clearly and is always available during office hours.',
                            'date' => '2025-04-10'
                        ],
                        [
                            'id' => 2,
                            'author' => 'Sara',
                            'text' => 'The course materials were really helpful. I had no programming experience but could follow along easily.',
                            'date' => '2025-03-15'
                        ]
                    ]
                ],
                [
                    'id' => 2,
                    'courseCode' => 'BIO205',
                    'courseTitle' => 'Cell Biology',
                    'instructor' => 'Dr. Sarah Ahmed',
                    'department' => 'Biology',
                    'difficulty' => 'Moderate',
                    'rating' => 4,
                    'content' => 'Interesting material but heavy workload.',
                    'fullContent' => 'The course covers fascinating material about cell structure and function. Dr. Sara is knowledgeable and passionate about the subject. However, be prepared for weekly lab reports and extensive reading. The midterm and final exams require thorough preparation.',
                    'comments' => [
                        [
                            'id' => 3,
                            'author' => 'Fatima',
                            'text' => 'The lab work is intense but worth it. You learn so much through the practical application.',
                            'date' => '2025-04-02'
                        ],
                        [
                            'id' => 4,
                            'author' => 'Mohammed',
                            'text' => 'Does Dr. Sara curve the grades? I\'m worried about the final exam.',
                            'date' => '2025-02-28'
                        ]
                    ]
                ],
                [
                    'id' => 3,
                    'courseCode' => 'MATH301',
                    'courseTitle' => 'Calculus III',
                    'instructor' => 'Dr. Mustafa Ali',
                    'department' => 'Mathematics',
                    'difficulty' => 'Hard',
                    'rating' => 3,
                    'content' => 'Challenging course with complex topics.',
                    'fullContent' => 'This course covers multivariable calculus and is quite challenging. Dr. Mustafa explains concepts clearly but moves quickly through the material. The homework is time-consuming and the exams are difficult. Recommend taking only if you\'re strong in previous calculus courses.',
                    'comments' => [
                        [
                            'id' => 5,
                            'author' => 'Ali',
                            'text' => 'The assignments take a lot of time, but they prepare you well for the exams.',
                            'date' => '2025-04-05'
                        ],
                        [
                            'id' => 6,
                            'author' => 'Noor',
                            'text' => 'I find the textbook confusing. Are there any recommended supplementary resources?',
                            'date' => '2025-03-22'
                        ]
                    ]
                ],
                [
                    'id' => 4,
                    'courseCode' => 'ENG220',
                    'courseTitle' => 'Creative Writing',
                    'instructor' => 'Prof. Taher mohammed',
                    'department' => 'English',
                    'difficulty' => 'Easy',
                    'rating' => 5,
                    'content' => 'Great environment for developing writing skills.',
                    'fullContent' => 'Professor Taher creates a supportive environment for developing creative writing skills. The workshops are helpful, and the feedback is constructive. The assignments encourage creativity and exploration. Highly recommended for anyone interested in writing.',
                    'comments' => [
                        [
                            'id' => 7,
                            'author' => 'Layla',
                            'text' => 'This class completely changed how I approach writing. Prof. Taher gives amazing feedback.',
                            'date' => '2025-04-15'
                        ],
                        [
                            'id' => 8,
                            'author' => 'Yusuf',
                            'text' => 'The peer review workshops were incredibly helpful. I learned as much from reviewing others\' work as I did from writing my own.',
                            'date' => '2025-03-30'
                        ]
                    ]
                ],
                [
                    'id' => 5,
                    'courseCode' => 'ITCS214',
                    'courseTitle' => 'Data Structures',
                    'instructor' => 'Dr. Faisal Alqayed',
                    'department' => 'Computer Science',
                    'difficulty' => 'Moderate',
                    'rating' => 4,
                    'content' => 'Essential course for CS majors, challenging but rewarding.',
                    'fullContent' => 'This course covers essential concepts for computer science majors. Dr. Faisal is clear in his explanations and provides good examples. The programming assignments can be challenging but help to reinforce the concepts. The exams test both theoretical understanding and practical application.',
                    'comments' => [
                        [
                            'id' => 9,
                            'author' => 'Omar',
                            'text' => 'The programming assignments are tough but really help cement the concepts. Start them early!',
                            'date' => '2025-04-08'
                        ],
                        [
                            'id' => 10,
                            'author' => 'Reem',
                            'text' => 'Dr. Faisal is always willing to help during office hours. Don\'t be afraid to ask questions.',
                            'date' => '2025-03-25'
                        ]
                    ]
                ],
                [
                    'id' => 6,
                    'courseCode' => 'PHYS102',
                    'courseTitle' => 'Physics II: Electricity & Magnetism',
                    'instructor' => 'Dr. Ahmed Saleh',
                    'department' => 'Physics',
                    'difficulty' => 'Hard',
                    'rating' => 3,
                    'content' => 'Complex material, requires strong math background.',
                    'fullContent' => 'This course covers electricity and magnetism at an advanced level. Dr. Ahmed is knowledgeable but sometimes moves quickly through difficult concepts. The labs are interesting but the lab reports are time-consuming. Be prepared to spend extra time outside of class to grasp the material fully.',
                    'comments' => [
                        [
                            'id' => 11,
                            'author' => 'Khalid',
                            'text' => 'The concepts are difficult but fascinating. I recommend forming a study group for this course.',
                            'date' => '2025-04-12'
                        ],
                        [
                            'id' => 12,
                            'author' => 'Amina',
                            'text' => 'The textbook problems are much easier than the exam questions. Make sure to do the practice exams.',
                            'date' => '2025-03-18'
                        ]
                    ]
                ]
            ];

            // Insert reviews
            $reviewStmt = $this->prepare("INSERT INTO `reviews` 
                (id, courseCode, courseTitle, instructor, department, difficulty, rating, content, fullContent) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $commentStmt = $this->prepare("INSERT INTO `comments` 
                (id, review_id, author, text, date) 
                VALUES (?, ?, ?, ?, ?)");

            foreach ($sampleReviews as $review) {
                $reviewStmt->execute([
                    $review['id'],
                    $review['courseCode'],
                    $review['courseTitle'],
                    $review['instructor'],
                    $review['department'],
                    $review['difficulty'],
                    $review['rating'],
                    $review['content'],
                    $review['fullContent']
                ]);

                if (isset($review['comments']) && is_array($review['comments'])) {
                    foreach ($review['comments'] as $comment) {
                        $commentDate = date('Y-m-d H:i:s', strtotime($comment['date']));

                        $commentStmt->execute([
                            $comment['id'],
                            $review['id'],
                            $comment['author'],
                            $comment['text'],
                            $commentDate
                        ]);
                    }
                }
            }

            return true;
        }

        return true;
    }

    /**
     * Get all reviews with optional pagination and filtering
     * 
     * @param int|null $page Page number for pagination
     * @param int|null $limit Items per page for pagination
     * @param array $filters Filters to apply (search, department, difficulty, rating)
     * @param string $sort Sort option (recent, rating-high, rating-low)
     * @return array Array of reviews
     */
    public function getAllReviews($page = null, $limit = null, $filters = [], $sort = 'recent') {
        $this->createAndPopulateReviewTables();

        $sql = "SELECT * FROM `reviews` WHERE 1=1";
        $params = [];

        // Apply filters
        if (!empty($filters['search'])) {
            $sql .= " AND (courseCode LIKE ? OR courseTitle LIKE ? OR instructor LIKE ?)";
            $searchTerm = "%{$filters['search']}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['department'])) {
            $sql .= " AND department = ?";
            $params[] = $filters['department'];
        }

        if (!empty($filters['difficulty'])) {
            $sql .= " AND difficulty = ?";
            $params[] = $filters['difficulty'];
        }

        if (!empty($filters['rating'])) {
            $sql .= " AND rating >= ?";
            $params[] = (int)$filters['rating'];
        }

        // Apply sorting
        switch ($sort) {
            case 'rating-high':
                $sql .= " ORDER BY rating DESC";
                break;
            case 'rating-low':
                $sql .= " ORDER BY rating ASC";
                break;
            case 'recent':
            default:
                $sql .= " ORDER BY id DESC";
                break;
        }

        // Add pagination if specified
        if ($page !== null && $limit !== null) {
            $page = filter_var($page, FILTER_VALIDATE_INT);
            $limit = filter_var($limit, FILTER_VALIDATE_INT);

            // Ensure valid pagination parameters
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 3;

            $offset = ($page - 1) * $limit;
            $sql .= " LIMIT ?, ?";
            $params[] = $offset;
            $params[] = $limit;
        }

        $stmt = $this->prepare($sql);

        // Bind parameters with their types
        for ($i = 0; $i < count($params); $i++) {
            $paramIndex = $i + 1;
            if (is_int($params[$i])) {
                $stmt->bindValue($paramIndex, $params[$i], PDO::PARAM_INT);
            } else {
                $stmt->bindValue($paramIndex, $params[$i], PDO::PARAM_STR);
            }
        }

        $stmt->execute();
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get comments for each review
        foreach ($reviews as &$review) {
            $review['comments'] = $this->getComments($review['id']);
        }

        return $reviews;
    }

    /**
     * Get the total number of reviews matching the filters
     * 
     * @param array $filters Filters to apply (search, department, difficulty, rating)
     * @return int Total number of matching reviews
     */
    public function getReviewCount($filters = []) {
        $sql = "SELECT COUNT(*) FROM `reviews` WHERE 1=1";
        $params = [];

        // Apply filters
        if (!empty($filters['search'])) {
            $sql .= " AND (courseCode LIKE ? OR courseTitle LIKE ? OR instructor LIKE ?)";
            $searchTerm = "%{$filters['search']}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['department'])) {
            $sql .= " AND department = ?";
            $params[] = $filters['department'];
        }

        if (!empty($filters['difficulty'])) {
            $sql .= " AND difficulty = ?";
            $params[] = $filters['difficulty'];
        }

        if (!empty($filters['rating'])) {
            $sql .= " AND rating >= ?";
            $params[] = (int)$filters['rating'];
        }

        $stmt = $this->prepare($sql);
        $stmt->execute($params);

        return (int)$stmt->fetchColumn();
    }

    /**
     * Get a single review by ID with its comments
     * 
     * @param int $id Review ID
     * @return array|bool Review data or false if not found
     */
    public function getReview($id) {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return false;
        }

        $stmt = $this->prepare("SELECT * FROM `reviews` WHERE id = ?");
        $stmt->execute([$id]);
        $review = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($review) {
            $review['comments'] = $this->getComments($id);
        }

        return $review;
    }

    /**
     * Create a new review
     * 
     * @param array $reviewData Review data
     * @return bool True if successful
     */
    public function createReview($reviewData) {
        $sanitizedData = $this->sanitizeReviewData($reviewData);
        if (!$this->validateReviewData($sanitizedData)) {
            return false;
        }

        $stmt = $this->prepare("INSERT INTO `reviews` 
            (courseCode, courseTitle, instructor, department, difficulty, rating, content, fullContent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        return $stmt->execute([
            $sanitizedData['courseCode'],
            $sanitizedData['courseTitle'],
            $sanitizedData['instructor'],
            $sanitizedData['department'],
            $sanitizedData['difficulty'],
            $sanitizedData['rating'],
            $sanitizedData['content'],
            $sanitizedData['fullContent']
        ]);
    }

    /**
     * Update an existing review
     * 
     * @param int $id Review ID
     * @param array $reviewData Updated review data
     * @return bool True if successful
     */
    public function updateReview($id, $reviewData) {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return false;
        }

        $checkStmt = $this->prepare("SELECT COUNT(*) FROM `reviews` WHERE id = ?");
        $checkStmt->execute([$id]);
        $reviewExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$reviewExists) {
            return false;
        }

        $sanitizedData = $this->sanitizeReviewData($reviewData);
        if (!$this->validateReviewData($sanitizedData)) {
            return false;
        }

        $stmt = $this->prepare("UPDATE `reviews` SET 
            courseCode = ?, 
            courseTitle = ?, 
            instructor = ?, 
            department = ?, 
            difficulty = ?, 
            rating = ?, 
            content = ?, 
            fullContent = ? 
            WHERE id = ?");

        return $stmt->execute([
            $sanitizedData['courseCode'],
            $sanitizedData['courseTitle'],
            $sanitizedData['instructor'],
            $sanitizedData['department'],
            $sanitizedData['difficulty'],
            $sanitizedData['rating'],
            $sanitizedData['content'],
            $sanitizedData['fullContent'],
            $id
        ]);
    }

    /**
     * Delete a review and its comments
     * 
     * @param int $id Review ID
     * @return bool True if successful
     */
    public function deleteReview($id) {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return false;
        }

        $checkStmt = $this->prepare("SELECT COUNT(*) FROM `reviews` WHERE id = ?");
        $checkStmt->execute([$id]);
        $reviewExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$reviewExists) {
            return false;
        }

        // First delete all comments for this review
        $this->prepare("DELETE FROM `comments` WHERE review_id = ?")->execute([$id]);

        // Then delete the review
        $stmt = $this->prepare("DELETE FROM `reviews` WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Get comments for a review
     * 
     * @param int $reviewId Review ID
     * @return array Array of comments
     */
    public function getComments($reviewId) {
        $reviewId = filter_var($reviewId, FILTER_VALIDATE_INT);
        if (!$reviewId) {
            return [];
        }

        $stmt = $this->prepare("SELECT * FROM `comments` WHERE review_id = ? ORDER BY date ASC");
        $stmt->execute([$reviewId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Add a comment to a review
     * 
     * @param int $reviewId Review ID
     * @param string $author Author name
     * @param string $text Comment text
     * @return bool True if successful
     */
    public function addComment($reviewId, $author, $text) {
        $reviewId = filter_var($reviewId, FILTER_VALIDATE_INT);
        if (!$reviewId) {
            return false;
        }

        $author = trim(htmlspecialchars($author));
        $text = trim(htmlspecialchars($text));

        if (empty($author) || empty($text)) {
            return false;
        }

        $checkStmt = $this->prepare("SELECT COUNT(*) FROM `reviews` WHERE id = ?");
        $checkStmt->execute([$reviewId]);
        $reviewExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$reviewExists) {
            return false;
        }

        $stmt = $this->prepare("INSERT INTO `comments` (review_id, author, text) VALUES (?, ?, ?)");
        return $stmt->execute([$reviewId, $author, $text]);
    }

    /**
     * Get all unique departments
     * 
     * @return array Array of department names
     */
    public function getDepartments() {
        $stmt = $this->query("SELECT DISTINCT department FROM `reviews` ORDER BY department ASC");

        $departments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $departments[] = $row['department'];
        }

        return $departments;
    }

    /**
     * Sanitize review data
     * 
     * @param array $reviewData Raw review data
     * @return array Sanitized review data
     */
    private function sanitizeReviewData($reviewData) {
        $sanitized = [];

        $textFields = ['courseCode', 'courseTitle', 'instructor', 'department', 'content', 'fullContent'];
        foreach ($textFields as $field) {
            if (isset($reviewData[$field])) {
                $sanitized[$field] = trim(htmlspecialchars($reviewData[$field]));
            } else {
                $sanitized[$field] = '';
            }
        }

        // Handle difficulty
        if (isset($reviewData['difficulty'])) {
            $difficulty = trim($reviewData['difficulty']);
            if (in_array($difficulty, ['Easy', 'Moderate', 'Hard'])) {
                $sanitized['difficulty'] = $difficulty;
            } else {
                $sanitized['difficulty'] = 'Moderate'; // Default
            }
        } else {
            $sanitized['difficulty'] = 'Moderate'; // Default
        }

        // Handle rating
        if (isset($reviewData['rating'])) {
            $rating = (int)$reviewData['rating'];
            if ($rating >= 1 && $rating <= 5) {
                $sanitized['rating'] = $rating;
            } else {
                $sanitized['rating'] = 3; // Default
            }
        } else {
            $sanitized['rating'] = 3; // Default
        }

        return $sanitized;
    }

    /**
     * Validate review data
     * 
     * @param array $reviewData Sanitized review data
     * @return bool True if valid
     */
    private function validateReviewData($reviewData) {
        $requiredFields = ['courseCode', 'courseTitle', 'instructor', 'department', 'difficulty', 'rating', 'content', 'fullContent'];

        foreach ($requiredFields as $field) {
            if (empty($reviewData[$field])) {
                return false;
            }
        }

        if ($reviewData['rating'] < 1 || $reviewData['rating'] > 5) {
            return false;
        }

        if (!in_array($reviewData['difficulty'], ['Easy', 'Moderate', 'Hard'])) {
            return false;
        }

        return true;
    }
}
?>