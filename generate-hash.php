<?php
// Temporary file to generate password hashes
// Usage: Add your users and passwords below, visit this file in your browser
// Copy the generated hash and paste it into your database admins table
// Then DELETE this file for security.

echo "<h2>Password Hash Generator</h2>\n\n";

// Add all your admin users here: username => password
$passwords = [
    'admin' => 'admin123',
    // Add more users below:
    // 'user2' => 'password2',
];

echo "<pre>";
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
