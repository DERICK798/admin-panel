# Admin Panel — Login Page (Demo)

Files added:
- `login.html` — the login page with a small accessible form.
- `css/style.css` — styles for layout, inputs, and buttons.
- `js/login.js` — client-side demo authentication and simple behaviors.

Preview locally:

1. Ensure Apache (XAMPP) is running.
2. Open in your browser: `http://localhost/admin-panel/login.html`

Notes:
- The current authentication is a client-side demo. The demo credentials are `admin` / `password` and should never be used in production.
- Replace the demo auth with a secure server-side endpoint (POST) that validates credentials and issues a server-managed session or token.
- Keep forms protected with HTTPS and add CSRF protections and rate-limiting on the server.

Next steps I can help with:
- Add a server-side endpoint (PHP) to authenticate against a database.
- Add forgot-password and password-reset flows.
- Wire the page into an existing backend session system.
