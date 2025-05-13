<?php

try {
    // Connect to MySQL server
    $db = new PDO('mysql:host=localhost;charset=utf8', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $db->exec("CREATE DATABASE IF NOT EXISTS college");

    // Connect to the newly created database
    $db->exec("USE college");

    // SQL statements to create tables
    $sql = "
    CREATE TABLE IF NOT EXISTS notes (
        course_code CHAR(7) PRIMARY KEY,
        course_name VARCHAR(50) NOT NULL,
        course_description TEXT NOT NULL,
        course_type VARCHAR(20) NOT NULL,
        course_date DATE NOT NULL
    );
    ";

    // Execute the SQL
    $db->exec($sql);
    $db = null; // Close the connection
} catch (PDOException $ex) {
    echo "Error occurred! " . $ex->getMessage();
    exit;
}
?>
