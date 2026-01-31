// ---------- REGISTER ----------
const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // ✅ VALIDATION (INSIDE FUNCTION)
    if (!username || !phone || !email || !password) {
      alert('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number (e.g., 0712345678).');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // ✅ SEND TO BACKEND
    try {
      const res = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, email, password }),
        credentials: 'include',
      });

      const result = await res.json();

      console.log(result); // muhimu sana
if( res.ok){
      window.location.href = '/login.html';
}
else{
  alert(result.message || 'Registration failed');
}
    } catch (err) {
      console.error(err);
      alert('Server not responding');
    }
  });
}