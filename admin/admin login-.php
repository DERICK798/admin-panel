<?php
session_start();
require '../config/db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = $_POST['password']; // plain

    $query = "SELECT * FROM admins WHERE username='$username' LIMIT 1";
    $result = mysqli_query($conn, $query);

    if ($result && mysqli_num_rows($result) == 1) {

        $admin = mysqli_fetch_assoc($result);

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
}
?>
