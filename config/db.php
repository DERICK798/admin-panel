<?php
$host = "localhost";     // Server name
$user = "root";          // MySQL username
$pass = "";              // MySQL password (mostly empty kwa XAMPP)
$db   = "agrogrow";     // Database name yako

$conn = mysqli_connect($host, $user, $pass, $db, 3307);

if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}
?>
