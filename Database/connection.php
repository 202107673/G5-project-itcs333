<?php
// Database connection file

// Database configuration
$host = 'localhost';
$dbname = 'college';
$username = 'root';
$password = '';

try {
    // Create a new PDO instance
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Set PDO error mode to exception
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
   
} catch (PDOException $e) {
    // Catch any connection error
    echo "Connection failed: " . $e->getMessage();
    exit;
}
?>