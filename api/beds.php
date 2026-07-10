<?php
session_start();
require_once 'db_connect.php';

// Ensure table exists
$pdo->exec("CREATE TABLE IF NOT EXISTS beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bed_no VARCHAR(20) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    ward VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }
    $stmt = $pdo->query("SELECT * FROM beds ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $stmt = $pdo->prepare("INSERT INTO beds (bed_no, patient_name, ward, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['bed_no'], 
            $data['patient_name'], 
            $data['ward'], 
            $data['status']
        ]);
        echo json_encode(['success' => true]);
    }
}
elseif ($method === 'PUT') {
    if (!isset($_SESSION['admin_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data && isset($_GET['id'])) {
        $stmt = $pdo->prepare("UPDATE beds SET bed_no=?, patient_name=?, ward=?, status=? WHERE id=?");
        $stmt->execute([
            $data['bed_no'], 
            $data['patient_name'], 
            $data['ward'], 
            $data['status'],
            $_GET['id']
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
        $stmt = $pdo->prepare("DELETE FROM beds WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success' => true]);
    }
}
?>
