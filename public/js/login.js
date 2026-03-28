document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Store token for subsequent API calls in dashboard.html
        localStorage.setItem('token', data.token);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        errorMessage.textContent = data.message || 'Invalid admin credentials';
      }
    } catch (err) {
      errorMessage.textContent = 'Server error. Please try again later.';
    }
  });
});