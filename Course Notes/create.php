<?php
session_start();

$errors = $_SESSION['errors'] ?? [];
$form_data = $_SESSION['form_data'] ?? [];

unset($_SESSION['errors']);
unset($_SESSION['form_data']);

$is_edit_mode = isset($_GET['code']) && !empty($_GET['code']);
$course_code = $_GET['code'] ?? '';

if ($is_edit_mode && empty($form_data)) {
    require_once '../Database/connection.php';
    
    try {
        $stmt = $db->prepare("SELECT * FROM notes WHERE course_code = :course_code");
        $stmt->bindParam(':course_code', $course_code);
        $stmt->execute();
        
        $note = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($note) {
            $form_data = [
                'course_code' => $note['course_code'],
                'course_title' => $note['course_name'],
                'description' => $note['course_description'],
                'course_type' => $note['course_type'],
                'created_at' => $note['course_date']
            ];
        }
    } catch (PDOException $e) {
        $errors[] = "Database error: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="script.js"></script>
    <link rel="stylesheet" href="style.css">
    <title>New Note</title>
    <style>
        .error-message {
            color: red;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <main class="create-body">
        <div id="loader">
            Loading...
        </div>
        <section class="create-section">
            <section id="head-create">
                <?php if ($is_edit_mode): ?>
                    <h2>Edit Note</h2>
                    <p>Update existing course note</p>
                <?php else: ?>
                    <h2>Add New Note</h2>
                    <p>Create a new course note entry</p>
                <?php endif; ?>
            </section>

            <?php if (!empty($errors)): ?>
                <div class="error-message">
                    <ul>
                        <?php foreach ($errors as $error): ?>
                            <li><?php echo htmlspecialchars($error); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <form method="post" action="<?php echo $is_edit_mode ? 'edit_note.php' : 'add_note.php'; ?>" class="form">
                <label for="course-code">
                    Course Code
                    <input id="course-code" name="course_code" type="text" placeholder="Enter Course Code" value="<?php echo htmlspecialchars($form_data['course_code'] ?? ''); ?>" <?php echo $is_edit_mode ? 'readonly' : ''; ?>>
                </label>
                <label for="course-title">
                    Course Title
                    <input id="title" name="course_title" type="text" placeholder="Enter Course Title" value="<?php echo htmlspecialchars($form_data['course_title'] ?? ''); ?>">
                </label>
                <div>
                    <label for="description">
                        Description
                        <textarea id="description" name="description" placeholder="Enter Description"><?php echo htmlspecialchars($form_data['description'] ?? ''); ?></textarea>
                    </label>
                    <label for="course-type">
                        Course Type
                        <input id="course-type" name="course_type" type="text" placeholder="Enter Course type" value="<?php echo htmlspecialchars($form_data['course_type'] ?? ''); ?>">
                    </label>
                    <label for="createdAt">
                        Created Date
                        <input id="createdAt" name="created_at" type="date" value="<?php echo htmlspecialchars($form_data['created_at'] ?? ''); ?>">
                    </label>
                </div>
                <section class="create-btn">
                    <input id="add-btn" type="submit" value="<?php echo $is_edit_mode ? 'Update Note' : 'Add Note'; ?>">
                    <a href="<?php echo $is_edit_mode ? 'detail.php?code=' . urlencode($course_code) : 'index.php'; ?>">Cancel</a>
                </section>
            </form>

        </section>
    </main>
</body>
</html>