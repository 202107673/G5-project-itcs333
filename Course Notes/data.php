<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'notes';
$user = 'root';
$pass = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT * FROM notes");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($courses);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
