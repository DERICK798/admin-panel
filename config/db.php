<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); 
// Hii inafanya ikikosea, itatupa error immediately — hakuna ku-load forever

$host = "127.0.0.1";   // BETTER than localhost (avoids socket issues)
$user = "root";
$pass = "";
$db   = "agrogrow";

try {
    $conn = new mysqli($host, $user, $pass, $db, 3306);
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    die("🔥 DATABASE ERROR: " . $e->getMessage());
}
?>
