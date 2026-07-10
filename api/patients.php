<?php
session_start();
require_once 'db_connect.php';

// Only allow logged in admins
if (!isset($_SESSION['admin_id'])) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM patients ORDER BY admitted_at DESC");
    echo json_encode($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $stmt = $pdo->prepare("INSERT INTO patients (name, age, status) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['age'], $data['status']]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM patients WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);
    if ($id && $data) {
        $stmt = $pdo->prepare("UPDATE patients SET name=?, age=?, status=? WHERE id=?");
        $stmt->execute([$data['name'], $data['age'], $data['status'], $id]);
        echo json_encode(['success' => true]);
    }
}
?>
