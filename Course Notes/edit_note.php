<?php
require_once '../Database/connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_code = $_POST['course_code'] ?? '';
    $course_name = $_POST['course_title'] ?? '';
    $course_description = $_POST['description'] ?? '';
    $course_type = $_POST['course_type'] ?? '';
    $course_date = $_POST['created_at'] ?? '';
    
    $errors = [];
    
    if (empty($course_code)) {
        $errors[] = "Course code is required";
    }
    
    if (empty($course_name)) {
        $errors[] = "Course name is required";
    }
    
    if (empty($course_description) || strlen($course_description) < 10) {
        $errors[] = "Description must be at least 10 characters";
    }
    
    if (empty($course_type)) {
        $errors[] = "Course type is required";
    }
    
    if (empty($course_date)) {
        $errors[] = "Date is required";
    }

    if (empty($errors)) {
        try {
            $stmt = $db->prepare("UPDATE notes SET 
                                course_name = :course_name, 
                                course_description = :course_description, 
                                course_type = :course_type, 
                                course_date = :course_date 
                                WHERE course_code = :course_code");
            
            $stmt->bindParam(':course_code', $course_code);
            $stmt->bindParam(':course_name', $course_name);
            $stmt->bindParam(':course_description', $course_description);
            $stmt->bindParam(':course_type', $course_type);
            $stmt->bindParam(':course_date', $course_date);
            
            $stmt->execute();
            
            header('Location: detail.php?code=' . urlencode($course_code));
            exit;
        } catch (PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
    
    if (!empty($errors)) {
        session_start();
        $_SESSION['errors'] = $errors;
        $_SESSION['form_data'] = $_POST;
        header('Location: create.php?code=' . urlencode($course_code) . '&edit=1');
        exit;
    }
}
?>
