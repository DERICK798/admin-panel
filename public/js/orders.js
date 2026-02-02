// ================== AUTH TOKEN ==================
if (!token) {
  alert('Please login as admin');
  window.location.href = '/admin-login.html';
}

// ================== LOAD ORDERS ==================
async function loadOrders() {
  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Fetch failed');

    const orders = await res.json();
    const tbody = document.querySelector('#orders-table tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No orders found</td>
        </tr>
      `;
      return;
    }

    orders.forEach(o => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${o.id}</td>
        <td>${o.phone}</td>
        <td>${o.location || '-'}</td>
        <td>${o.payment_method}</td>
        <td>${o.status}</td>
        <td>${o.total}</td>
        <td>${new Date(o.created_at).toLocaleString()}</td>
        <td>
          <button onclick="deleteOrder(${o.id})">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    const tbody = document.querySelector('#orders-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">Failed to load orders</td>
        </tr>
      `;
    }
  }
}

// ================== DELETE ORDER ==================
async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    let data = {};
    try { data = await res.json(); } catch {}

    if (res.ok) {
      alert(data.message || '🗑️ Order deleted');
      loadOrders();
    } else {
      alert(data.message || `❌ Delete failed (${res.status})`);
    }

  } catch (err) {
    console.error(err);
    alert('❌ Server error');
  }
}

// ================== INIT ==================
window.addEventListener('DOMContentLoaded', loadOrders);
