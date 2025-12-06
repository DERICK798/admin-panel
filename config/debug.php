<?php
echo "1. Starting...<br>";

echo "2. Including DB...<br>";
include '../config/db.php';
echo "3. DB included.<br>";

echo "4. Testing connection...<br>";
if (!$conn) {
    die("4A. DB NOT connected.");
}
echo "4B. Connected.<br>";

echo "5. Running test query...<br>";
$q = $conn->query("SELECT 1");
if ($q) {
    echo "5B. Query OK.<br>";
} else {
    echo "5A. Query FAILED.<br>";
}

echo "6. DONE.<br>";
