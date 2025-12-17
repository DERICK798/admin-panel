<?php
session_start();

if (isset($_SESSION['admin'])) {
    header("Location: /admin-panel/admin/dashboard.php");
    exit;
} else {
    header("Location: /admin-panel/admin/admin-login.php");
    exit;
}
