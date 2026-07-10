<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['admin_id'])) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM doctors ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $stmt = $pdo->prepare("INSERT INTO doctors (name, specialization, status) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['spec'], $data['status']]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM doctors WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);
    if ($id && $data) {
        $stmt = $pdo->prepare("UPDATE doctors SET name=?, specialization=?, status=? WHERE id=?");
        $stmt->execute([$data['name'], $data['spec'], $data['status'], $id]);
        echo json_encode(['success' => true]);
    }
}
?>
