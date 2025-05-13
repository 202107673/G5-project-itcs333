<?php

class DatabaseHelper {
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $pdo;

   
    public function __construct($host, $dbName, $username, $password) {
        $this->host = $host;
        $this->dbName = $dbName;
        $this->username = $username;
        $this->password = $password;
    }

   
    public function getPDO() {
        if (!$this->pdo) {
            try {
                
                $this->pdo = new PDO("mysql:host={$this->host}", 
                                    $this->username, 
                                    $this->password);

               
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Create database if it doesn't exist
                $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->dbName}`");
                $this->pdo->exec("USE `{$this->dbName}`");

                // Create tables if they don't exist
                $this->createTables();

                // Check if reviews table is empty and populate with sample data if needed
                $this->populateSampleData();

            } catch (PDOException $e) {
                throw new PDOException("Database connection failed: " . $e->getMessage());
            }
        }

        return $this->pdo;
    }

   
    public function query($sql) {
        return $this->getPDO()->query($sql);
    }

   
    public function prepare($sql) {
        return $this->getPDO()->prepare($sql);
    }

   
    public function exec($sql) {
        return $this->getPDO()->exec($sql);
    }

   
    private function createTables() {
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
            `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        return true;
    }

    
    private function populateSampleData() {
        // Check if reviews table is empty
        $stmt = $this->query("SELECT COUNT(*) FROM `reviews`");
        $count = $stmt->fetchColumn();

        if ($count == 0) {
            // Sample review data (from your courses.json)
            $sampleReviews = [
                [
                    'courseCode' => 'ITCS101',
                    'courseTitle' => 'Introduction to Programming',
                    'instructor' => 'Dr. Abdullah Subah',
                    'department' => 'Computer Science',
                    'difficulty' => 'Easy',
                    'rating' => 5,
                    'content' => 'Great for beginners, helpful professor.',
                    'fullContent' => 'This course was a great introduction to programming. The professor was very helpful and the assignments were challenging but fair. The exams were straightforward if you attended the lectures. Highly recommended for anyone new to programming.'
                ],
                [
                    'courseCode' => 'BIO205',
                    'courseTitle' => 'Cell Biology',
                    'instructor' => 'Dr. Sarah Ahmed',
                    'department' => 'Biology',
                    'difficulty' => 'Moderate',
                    'rating' => 4,
                    'content' => 'Interesting material but heavy workload.',
                    'fullContent' => 'The course covers fascinating material about cell structure and function. Dr. Sara is knowledgeable and passionate about the subject. However, be prepared for weekly lab reports and extensive reading. The midterm and final exams require thorough preparation.'
                ],
                [
                    'courseCode' => 'MATH301',
                    'courseTitle' => 'Calculus III',
                    'instructor' => 'Dr. Mustafa Ali',
                    'department' => 'Mathematics',
                    'difficulty' => 'Hard',
                    'rating' => 3,
                    'content' => 'Challenging course with complex topics.',
                    'fullContent' => 'This course covers multivariable calculus and is quite challenging. Dr. Mustafa explains concepts clearly but moves quickly through the material. The homework is time-consuming and the exams are difficult. Recommend taking only if you\'re strong in previous calculus courses.'
                ],
                [
                    'courseCode' => 'ENG220',
                    'courseTitle' => 'Creative Writing',
                    'instructor' => 'Prof. Taher mohammed',
                    'department' => 'English',
                    'difficulty' => 'Easy',
                    'rating' => 5,
                    'content' => 'Great environment for developing writing skills.',
                    'fullContent' => 'Professor Taher creates a supportive environment for developing creative writing skills. The workshops are helpful, and the feedback is constructive. The assignments encourage creativity and exploration. Highly recommended for anyone interested in writing.'
                ],
                [
                    'courseCode' => 'ITCS214',
                    'courseTitle' => 'Data Structures',
                    'instructor' => 'Dr. Faisal Alqayed',
                    'department' => 'Computer Science',
                    'difficulty' => 'Moderate',
                    'rating' => 4,
                    'content' => 'Essential course for CS majors, challenging but rewarding.',
                    'fullContent' => 'This course covers essential concepts for computer science majors. Dr. Faisal is clear in his explanations and provides good examples. The programming assignments can be challenging but help to reinforce the concepts. The exams test both theoretical understanding and practical application.'
                ],
                [
                    'courseCode' => 'PHYS102',
                    'courseTitle' => 'Physics II: Electricity & Magnetism',
                    'instructor' => 'Dr. Ahmed Saleh',
                    'department' => 'Physics',
                    'difficulty' => 'Hard',
                    'rating' => 3,
                    'content' => 'Complex material, requires strong math background.',
                    'fullContent' => 'This course covers electricity and magnetism at an advanced level. Dr. Ahmed is knowledgeable but sometimes moves quickly through difficult concepts. The labs are interesting but the lab reports are time-consuming. Be prepared to spend extra time outside of class to grasp the material fully.'
                ]
            ];

            // Prepared statement for reviews
            $stmt = $this->prepare("INSERT INTO `reviews` 
                (`courseCode`, `courseTitle`, `instructor`, `department`, `difficulty`, `rating`, `content`, `fullContent`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

            // Insert sample reviews
            foreach ($sampleReviews as $review) {
                $stmt->execute([
                    $review['courseCode'],
                    $review['courseTitle'],
                    $review['instructor'],
                    $review['department'],
                    $review['difficulty'],
                    $review['rating'],
                    $review['content'],
                    $review['fullContent']
                ]);

                // Get the review ID for inserting comments
                $reviewId = $this->getPDO()->lastInsertId();

                // Sample comments for each review
                $sampleComments = [];

                if ($review['courseCode'] === 'ITCS101') {
                    $sampleComments = [
                        [
                            'author' => 'Ahmed',
                            'text' => 'Dr. Abdullah Subah is the best doctor I\'ve had. He explains concepts clearly and is always available during office hours.'
                        ],
                        [
                            'author' => 'Sara',
                            'text' => 'The course materials were really helpful. I had no programming experience but could follow along easily.'
                        ]
                    ];
                } elseif ($review['courseCode'] === 'BIO205') {
                    $sampleComments = [
                        [
                            'author' => 'Fatima',
                            'text' => 'The lab work is intense but worth it. You learn so much through the practical application.'
                        ],
                        [
                            'author' => 'Mohammed',
                            'text' => 'Does Dr. Sara curve the grades? I\'m worried about the final exam.'
                        ]
                    ];
                } elseif ($review['courseCode'] === 'MATH301') {
                    $sampleComments = [
                        [
                            'author' => 'Ali',
                            'text' => 'The assignments take a lot of time, but they prepare you well for the exams.'
                        ],
                        [
                            'author' => 'Noor',
                            'text' => 'I find the textbook confusing. Are there any recommended supplementary resources?'
                        ]
                    ];
                } elseif ($review['courseCode'] === 'ENG220') {
                    $sampleComments = [
                        [
                            'author' => 'Layla',
                            'text' => 'This class completely changed how I approach writing. Prof. Taher gives amazing feedback.'
                        ],
                        [
                            'author' => 'Yusuf',
                            'text' => 'The peer review workshops were incredibly helpful. I learned as much from reviewing others\' work as I did from writing my own.'
                        ]
                    ];
                } elseif ($review['courseCode'] === 'ITCS214') {
                    $sampleComments = [
                        [
                            'author' => 'Omar',
                            'text' => 'The programming assignments are tough but really help cement the concepts. Start them early!'
                        ],
                        [
                            'author' => 'Reem',
                            'text' => 'Dr. Faisal is always willing to help during office hours. Don\'t be afraid to ask questions.'
                        ]
                    ];
                } elseif ($review['courseCode'] === 'PHYS102') {
                    $sampleComments = [
                        [
                            'author' => 'Khalid',
                            'text' => 'The concepts are difficult but fascinating. I recommend forming a study group for this course.'
                        ],
                        [
                            'author' => 'Amina',
                            'text' => 'The textbook problems are much easier than the exam questions. Make sure to do the practice exams.'
                        ]
                    ];
                }
                  // Insert comments for this review
                if (!empty($sampleComments)) {
                    $commentStmt = $this->prepare("INSERT INTO `comments` (`review_id`, `author`, `text`) VALUES (?, ?, ?)");

                    foreach ($sampleComments as $comment) {
                        $commentStmt->execute([$reviewId, $comment['author'], $comment['text']]);
                    }
                }
            }

            return true;
        }

        return false;
    }

   
    public function getReviews($page = 1, $limit = 3, $search = '', $department = '', $difficulty = '', $rating = 0, $sort = 'recent') {
        // Build the query
        $sql = "SELECT * FROM `reviews` WHERE 1=1";
        $params = [];

        // Add search condition if provided
        if (!empty($search)) {
            $sql .= " AND (`courseCode` LIKE ? OR `courseTitle` LIKE ? OR `instructor` LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
        }

        // Add department filter if provided
        if (!empty($department)) {
            $sql .= " AND `department` = ?";
            $params[] = $department;
        }

        // Add difficulty filter if provided
        if (!empty($difficulty)) {
            $sql .= " AND `difficulty` = ?";
            $params[] = $difficulty;
        }

        // Add rating filter if provided
        if ($rating > 0) {
            $sql .= " AND `rating` >= ?";
            $params[] = $rating;
        }

        // Add sorting
        switch ($sort) {
            case 'rating-high':
                $sql .= " ORDER BY `rating` DESC";
                break;
            case 'rating-low':
                $sql .= " ORDER BY `rating` ASC";
                break;
            case 'recent':
            default:
                $sql .= " ORDER BY `id` DESC";
                break;
        }

        // Add pagination
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT ?, ?";
        $params[] = $offset;
        $params[] = $limit;

        // Execute the query
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
            $review['comments'] = $this->getCommentsByReviewId($review['id']);
        }

        return $reviews;
    }

    
    public function getTotalReviews($search = '', $department = '', $difficulty = '', $rating = 0) {
        // Build the query
        $sql = "SELECT COUNT(*) FROM `reviews` WHERE 1=1";
        $params = [];

        // Add search condition if provided
        if (!empty($search)) {
            $sql .= " AND (`courseCode` LIKE ? OR `courseTitle` LIKE ? OR `instructor` LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
        }

        // Add department filter if provided
        if (!empty($department)) {
            $sql .= " AND `department` = ?";
            $params[] = $department;
        }

        // Add difficulty filter if provided
        if (!empty($difficulty)) {
            $sql .= " AND `difficulty` = ?";
            $params[] = $difficulty;
        }

        // Add rating filter if provided
        if ($rating > 0) {
            $sql .= " AND `rating` >= ?";
            $params[] = $rating;
        }

        // Execute the query
        $stmt = $this->prepare($sql);
        $stmt->execute($params);

        return (int)$stmt->fetchColumn();
    }

   
    public function getReviewById($id) {
        $stmt = $this->prepare("SELECT * FROM `reviews` WHERE `id` = ?");
        $stmt->execute([$id]);

        $review = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($review) {
            // Get comments for this review
            $review['comments'] = $this->getCommentsByReviewId($id);
        }

        return $review;
    }

   
    public function createReview($courseCode, $courseTitle, $instructor, $department, $difficulty, $rating, $content, $fullContent) {
        $stmt = $this->prepare("INSERT INTO `reviews` 
            (`courseCode`, `courseTitle`, `instructor`, `department`, `difficulty`, `rating`, `content`, `fullContent`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        $result = $stmt->execute([
            $courseCode,
            $courseTitle,
            $instructor,
            $department,
            $difficulty,
            $rating,
            $content,
            $fullContent
        ]);

        if ($result) {
            return $this->getPDO()->lastInsertId();
        }

        return false;
    }

   
    public function updateReview($id, $courseCode, $courseTitle, $instructor, $department, $difficulty, $rating, $content, $fullContent) {
        $stmt = $this->prepare("UPDATE `reviews` SET 
            `courseCode` = ?, 
            `courseTitle` = ?, 
            `instructor` = ?, 
            `department` = ?, 
            `difficulty` = ?, 
            `rating` = ?, 
            `content` = ?, 
            `fullContent` = ? 
            WHERE `id` = ?");

        return $stmt->execute([
            $courseCode,
            $courseTitle,
            $instructor,
            $department,
            $difficulty,
            $rating,
            $content,
            $fullContent,
            $id
        ]);
    }

   
    public function deleteReview($id) {
        $stmt = $this->prepare("DELETE FROM `reviews` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }

   
    public function getCommentsByReviewId($reviewId) {
        $stmt = $this->prepare("SELECT * FROM `comments` WHERE `review_id` = ? ORDER BY `date` DESC");
        $stmt->execute([$reviewId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

   
    public function getCommentById($id) {
        $stmt = $this->prepare("SELECT * FROM `comments` WHERE `id` = ?");
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

   
    public function addComment($reviewId, $author, $text) {
        $stmt = $this->prepare("INSERT INTO `comments` (`review_id`, `author`, `text`) VALUES (?, ?, ?)");

        $result = $stmt->execute([$reviewId, $author, $text]);

        if ($result) {
            return $this->getPDO()->lastInsertId();
        }

        return false;
    }

   
    public function getDepartments() {
        $stmt = $this->query("SELECT DISTINCT `department` FROM `reviews` ORDER BY `department` ASC");

        $departments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $departments[] = $row['department'];
        }

        return $departments;
    }
}
?>