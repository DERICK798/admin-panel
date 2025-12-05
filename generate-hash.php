<?php
// Temporary file to generate password hashes
// Usage: Change 'your_password' to your desired password, then visit this file in your browser
// Copy the generated hash and paste it into your database admins table

echo "Password Hash Generator\n\n";

// Generate hash for different passwords
$passwords = [
    'admin' => 'admin123',      // username => password
];

foreach ($passwords as $user => $pass) {
    $hash = password_hash($pass, PASSWORD_DEFAULT);
    echo "Username: $user\n";
    echo "Password: $pass\n";
    echo "Hash: $hash\n";
    echo "---\n\n";
}

echo "Copy the hash above and insert it into your 'admins' table in the 'password' column.\n";
echo "Then DELETE this file for security.";
?>
