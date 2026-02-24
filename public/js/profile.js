document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    alert('Please login to view your profile');
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);
  
  // Render User Info
  const userInfoDiv = document.getElementById('user-info');
  userInfoDiv.innerHTML = `
    <p><strong>Name:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
  `;

  // Fetch Orders
  try {
    const res = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Failed to fetch orders');

    const orders = await res.json();
    const tbody = document.getElementById('orders-list');
    tbody.innerHTML = '';

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No orders found.</td></tr>';
      return;
    }

    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      const statusClass = `status-${order.status.toLowerCase()}`;
      
      const row = `
        <tr>
          <td>#${order.id}</td>
          <td>${date}</td>
          <td>KES ${order.total}</td>
          <td class="${statusClass}">${order.status}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });

  } catch (err) {
    console.error(err);
    document.getElementById('orders-list').innerHTML = '<tr><td colspan="4" style="color:red">Error loading orders</td></tr>';
  }
});