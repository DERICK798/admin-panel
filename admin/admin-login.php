<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include '../config/db.php';

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Prepared Statement for security
    $stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {

        $admin = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $admin['password'])) {

            $_SESSION['admin'] = $admin['username'];
            $_SESSION['admin_id'] = $admin['id'];

            header("Location: dashboard.php");
            exit;

        } else {
            $error = "Invalid password";
        }

    } else {
        $error = "Invalid username";
    }
}?>