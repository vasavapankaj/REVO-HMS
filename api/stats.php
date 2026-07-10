<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['admin_id'])) {
    header('HTTP/1.1 401 Unauthorized');
    exit;
}

try {
    $patientCount = $pdo->query("SELECT COUNT(*) FROM patients")->fetchColumn();
    $appointmentCount = $pdo->query("SELECT COUNT(*) FROM appointments")->fetchColumn();
    $lowStockCount = $pdo->query("SELECT COUNT(*) FROM pharmacy WHERE stock < 10")->fetchColumn();
    
    $totalBeds = $pdo->query("SELECT COUNT(*) FROM beds")->fetchColumn();
    $availableBeds = $pdo->query("SELECT COUNT(*) FROM beds WHERE status = 'Available'")->fetchColumn();
    $bedStr = $totalBeds > 0 ? "$availableBeds/$totalBeds" : "0/0";

    $weeklyPatients = $pdo->query("SELECT DATE(admitted_at) as date, COUNT(*) as count FROM patients WHERE admitted_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(admitted_at) ORDER BY date ASC")->fetchAll(PDO::FETCH_ASSOC);
    if (empty($weeklyPatients)) {
        $weeklyPatients = [
            ['date' => date('Y-m-d'), 'count' => 0],
        ];
    }

    $deptAppointments = $pdo->query("SELECT department, COUNT(*) as count FROM appointments GROUP BY department")->fetchAll(PDO::FETCH_ASSOC);
    if (empty($deptAppointments)) {
        $deptAppointments = [
            ['department' => 'Cardiology', 'count' => 0],
            ['department' => 'Neurology', 'count' => 0],
            ['department' => 'Orthopaedics', 'count' => 0],
            ['department' => 'General Medicine', 'count' => 0],
        ];
    }

    $patientStatus = $pdo->query("SELECT status, COUNT(*) as count FROM patients GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
    if (empty($patientStatus)) {
        $patientStatus = [
            ['status' => 'In-Patient', 'count' => 0],
            ['status' => 'Out-Patient', 'count' => 0],
            ['status' => 'Discharged', 'count' => 0],
        ];
    }

    echo json_encode([
        'patients' => $patientCount,
        'appointments' => $appointmentCount,
        'lowStock' => $lowStockCount,
        'availableBeds' => $bedStr,
        'weeklyPatients' => $weeklyPatients,
        'deptAppointments' => $deptAppointments,
        'patientStatus' => $patientStatus
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error']);
}
?>
