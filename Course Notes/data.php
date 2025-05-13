<?php
header('Content-Type: application/json');

require_once '../Database/connection.php';

try {
    $stmt = $db->query("SELECT * FROM notes");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formattedCourses = [];
    foreach ($courses as $course) {
        $formattedCourses[] = [
            'courseCode' => $course['course_code'],
            'title' => $course['course_name'],
            'description' => $course['course_description'],
            'course' => $course['course_type'],
            'createdAt' => $course['course_date']
        ];
    }
    
    echo json_encode($formattedCourses);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
