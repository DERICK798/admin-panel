
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const showPassword = document.getElementById('show-password');
  const passwordEl = document.getElementById('password');

  showPassword.addEventListener('change', () => {
    passwordEl.type = showPassword.checked ? 'text' : 'password';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'http://localhost:3000/dashboard.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
});