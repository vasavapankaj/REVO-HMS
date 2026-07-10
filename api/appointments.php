<?php
session_start();
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Admin only
    if (!isset($_SESSION['admin_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }
    $stmt = $pdo->query("SELECT * FROM appointments ORDER BY appointment_date ASC");
    echo json_encode($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $stmt = $pdo->prepare("INSERT INTO appointments (patient_name, email, phone, department, appointment_date) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'], 
            $data['email'], 
            $data['phone'], 
            $data['department'], 
            $data['date']
        ]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'DELETE') {
    if (!isset($_SESSION['admin_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success' => true]);
    }
}
?>
