const adminToken = localStorage.getItem('token');

if (!adminToken) {
    window.location.href = '/admin-login';
}

async function updateDashboardStats() {
    try {
        const res = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();

        // Update basic UI elements (Ensure these IDs exist in your dashboard.html)
        if (document.getElementById('total-users')) document.getElementById('total-users').textContent = data.users;
        if (document.getElementById('total-orders')) document.getElementById('total-orders').textContent = data.orders;
        if (document.getElementById('total-revenue')) document.getElementById('total-revenue').textContent = `KES ${Number(data.revenue).toLocaleString()}`;

        // Handle Alerts for New Activity
        showAlerts(data);

    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

function showAlerts(data) {
    const alertContainer = document.getElementById('dashboard-alerts');
    if (!alertContainer) return;

    alertContainer.innerHTML = '';

    if (data.newOrdersToday > 0) {
        const orderAlert = document.createElement('div');
        orderAlert.className = 'alert alert-info';
        orderAlert.style.padding = '15px';
        orderAlert.style.margin = '10px 0';
        orderAlert.style.backgroundColor = '#e1f5fe';
        orderAlert.style.borderLeft = '5px solid #03a9f4';
        orderAlert.innerHTML = `🔔 <strong>${data.newOrdersToday}</strong> new order(s) today! <a href="#orders">View Orders</a>`;
        alertContainer.appendChild(orderAlert);
    }

    if (data.newUsersToday > 0) {
        const userAlert = document.createElement('div');
        userAlert.className = 'alert alert-success';
        userAlert.style.padding = '15px';
        userAlert.style.margin = '10px 0';
        userAlert.style.backgroundColor = '#e8f5e9';
        userAlert.style.borderLeft = '5px solid #4caf50';
        userAlert.innerHTML = `👤 <strong>${data.newUsersToday}</strong> new user(s) registered today! <a href="#users">View Users</a>`;
        alertContainer.appendChild(userAlert);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
    // Refresh every 60 seconds to check for new activity
    setInterval(updateDashboardStats, 60000); 
});