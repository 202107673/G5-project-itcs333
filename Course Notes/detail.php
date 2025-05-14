<?php
require_once '../Database/connection.php';

$course_code = $_GET['code'] ?? '';

if (!empty($course_code)) {
    try {
        $stmt = $db->prepare("SELECT * FROM notes WHERE course_code = :course_code");
        $stmt->bindParam(':course_code', $course_code);
        $stmt->execute();
        
        $note = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $error = "Database error: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Note Details</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <a href="index.php">← Back to all notes</a>
        <h1>Course Notes</h1>
    </header>

    <main class="main-detail">
        <?php if (isset($error)): ?>
            <div style="color: red; text-align: center;">
                <p><?php echo htmlspecialchars($error); ?></p>
            </div>
        <?php elseif (empty($note)): ?>
            <div style="text-align: center;">
                <p>Note not found. Please go back to <a href="index.php">all notes</a>.</p>
            </div>
        <?php else: ?>
            <section class="note-detail">
                <section class="note-detail-header">
                    <div id="note-detail">
                        <div id="head">
                            <h2><?php echo htmlspecialchars($note['course_name']); ?></h2>
                            <h3><?php echo htmlspecialchars($note['course_code']); ?></h3>
                            <p>created: <?php echo htmlspecialchars($note['course_date']); ?></p>
                        </div>
                        <div id="body">
                            <h3>More About:</h3>
                            <p><?php echo htmlspecialchars($note['course_description']); ?></p>
                        </div>
                    </div>
                </section>
                
                <section class="btn-detail">
                    <a id="edit-btn" href="create.php?code=<?php echo urlencode($note['course_code']); ?>&edit=1" style="background-color: #007bff; color: white;">Edit</a>
                    <a href="delete_note.php?course_code=<?php echo urlencode($note['course_code']); ?>" onclick="return confirm('Are you sure you want to delete this note?');">Delete</a>
                </section>

                <section class="comments">
                    <div id="comments">
                        <label for="comment-section">Comments Section</label>
                    </div>
                    <div id="comment">
                        <h4>Ali</h4>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta, molestias. Dolore quo enim eligendi architecto consequatur quam voluptatibus accusantium, rem sapiente voluptatem eveniet facilis sint aperiam inventore adipisci molestias cum?</p>
                    </div>
                    <div id="comment">
                        <h4>Mahdi</h4>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta, molestias. Dolore quo enim eligendi architecto consequatur quam voluptatibus accusantium, rem sapiente voluptatem eveniet facilis sint aperiam inventore adipisci molestias cum?</p>
                    </div>

                    <label for="new-comment">Add comment</label>
                    <textarea class="comment-input" rows="6" required placeholder="Write your comment..."></textarea>
                </section>
            </section>
        <?php endif; ?>
    </main>

    <footer>
        <h3>&copy; 2025 Your University. All rights reserved.</h3>
    </footer>
</body>
</html>