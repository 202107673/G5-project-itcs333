<?php

// Set proper headers for API
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // GET all groups (add ?page=x later if you want pagination)
        $stmt = $pdo->query("SELECT * FROM study_groups ORDER BY id DESC");
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($groups);
        break;

    case 'POST':
        // Create new group
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['name'], $data['subject'], $data['description'], $data['location'], $data['meeting_time'], $data['contact_email'])) {
            $stmt = $pdo->prepare("INSERT INTO study_groups (name, subject, description, location, meeting_time, contact_email) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['name'], $data['subject'], $data['description'],
                $data['location'], $data['meeting_time'], $data['contact_email']
            ]);
            echo json_encode(['message' => 'Group created successfully', 'id' => $pdo->lastInsertId()]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
        }
        break;

    case 'PUT':
        // Update a group
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['id'])) {
            $stmt = $pdo->prepare("UPDATE study_groups SET name = ?, subject = ?, description = ?, location = ?, meeting_time = ?, contact_email = ? WHERE id = ?");
            $stmt->execute([
                $data['name'], $data['subject'], $data['description'],
                $data['location'], $data['meeting_time'], $data['contact_email'],
                $data['id']
            ]);
            echo json_encode(['message' => 'Group updated']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
        }
        break;

    case 'DELETE':
        // Delete a group
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['id'])) {
            $stmt = $pdo->prepare("DELETE FROM study_groups WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(['message' => 'Group deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}