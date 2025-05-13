<?php
header('Content-Type: application/json');

require_once '../Database/connection.php';

if (isset($_GET['course_code'])) {
    $course_code = $_GET['course_code'];
    
    try {
        $stmt = $db->prepare("SELECT * FROM notes WHERE course_code = :course_code");
        $stmt->bindParam(':course_code', $course_code);
        $stmt->execute();
        
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($course) {
            $formattedCourse = [
                'courseCode' => $course['course_code'],
                'title' => $course['course_name'],
                'description' => $course['course_description'],
                'course' => $course['course_type'],
                'createdAt' => $course['course_date']
            ];
            
            echo json_encode($formattedCourse);
        } else {
            echo json_encode(['error' => 'Note not found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Course code is required']);
}
?>
