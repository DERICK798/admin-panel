<?php
$host = '127.0.0.1';
$db   = 'agrogrow';   // badilisha na DB yako
$user = 'root';
$pass = '';
$port = '3306';          // ⚠️ port yako halisi

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    die("DB connection failed: " . $e->getMessage());
}
