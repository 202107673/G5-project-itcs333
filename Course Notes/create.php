<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="script.js"></script>
    <link rel="stylesheet" href="style.css">
    <title>New Note</title>
</head>
<body>
    <main class="create-body">
        <div id="loader">
            Loading...
        </div>
        <section class="create-section">
            <section id="head-create">
                <h2>Add New Note</h2>
                <p>Create a new course note entry</p>
            </section>

            <form method="post" class="form">
                <label for="course-code">
                    Course Code
                    <input id="course-code" name="course_code" type="text" placeholder="Enter Course Code">
                </label>
                <label for="course-title">
                    Course Title
                    <input id="title" name="course_title" type="text" placeholder="Enter Course Title">
                </label>
                <div>
                    <label for="description">
                        Description
                        <textarea id="description" name="description" placeholder="Enter Description"></textarea>
                    </label>
                    <label for="course-type">
                        Course Type
                        <input id="course-type" name="course_type" type="text" placeholder="Enter Course type">
                    </label>
                    <label for="createdAt">
                        Created Date
                        <input id="createdAt" name="created_at" type="date">
                    </label>
                </div>
                <section class="create-btn">
                    <input id="add-btn" type="submit" value="Add Note">
                    <a href="index.php">Cancel</a>
                </section>
            </form>

        </section>
    </main>
</body>
</html>