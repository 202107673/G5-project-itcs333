<?php
require_once '../Database/connection.php';

if (isset($_GET['course_code'])) {
    $course_code = $_GET['course_code'];
    
    try {
        $stmt = $db->prepare("DELETE FROM notes WHERE course_code = :course_code");
        $stmt->bindParam(':course_code', $course_code);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            header('Location: index.php');
            exit;
        } else {
            echo "Note not found.";
        }
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
} else {
    echo "Course code is required.";
}
?>
