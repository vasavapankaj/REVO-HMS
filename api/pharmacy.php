<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['admin_id'])) {
    header('HTTP/1.1 401 Unauthorized');
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM pharmacy ORDER BY name ASC");
    echo json_encode($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $stmt = $pdo->prepare("INSERT INTO pharmacy (name, stock, price) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['stock'], $data['price']]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM pharmacy WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);
    if ($id && $data) {
        $stmt = $pdo->prepare("UPDATE pharmacy SET name=?, stock=?, price=? WHERE id=?");
        $stmt->execute([$data['name'], $data['stock'], $data['price'], $id]);
        echo json_encode(['success' => true]);
    }
}
?>
