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

    $stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $admin = $result->fetch_assoc();

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

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin Login</title>
</head>
<body>

<h2>Admin Login</h2>

<form method="POST" action="">
    <label>Username</label><br>
    <input id="username" name="username" type="text" autocomplete="username" required><br><br>

    <label>Password</label><br>
    <input id="password" name="password" type="password" autocomplete="current-password" required><br>

    <label><input id="show-password" type="checkbox"> Show password</label><br><br>

    <button type="submit">Login</button>
</form>

<p style="color:red;">
    <?php echo $error; ?>
</p>

<script>
document.getElementById("show-password").addEventListener("change", function(){
    const pwd = document.getElementById("password");
    pwd.type = this.checked ? "text" : "password";
});
</script>

</body>
</html>
