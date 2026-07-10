<?php
session_start();
if (isset($_SESSION['admin_id'])) {
    echo json_encode(['logged_in' => true, 'username' => $_SESSION['admin_username']]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>
