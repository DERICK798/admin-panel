// ================== AUTH TOKEN ==================
const orderToken = localStorage.getItem('token');

if (!orderToken || orderToken === 'undefined') {
  alert('Please login as admin');
  window.location.href = '/admin-login.html';
}
// ================== PAGINATION RENDER ==================
function renderPagination(page, totalPages) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
  pagination.innerHTML = "";

  // Ensure at least 1 page is recognized
  if (!totalPages) totalPages = 1;

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = page === 1;
  prevBtn.onclick = () => loadOrders(page - 1);
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = page === i ? "active" : "";
    btn.onclick = () => loadOrders(i);
    pagination.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = page === totalPages;
  nextBtn.onclick = () => loadOrders(page + 1);
  pagination.appendChild(nextBtn);
}

// ================== LOAD ORDERS ==================
let currentOrderPage = 1;
let currentSearchQuery = "";
const limit = 10;

async function loadOrders(page = 1, searchQuery = null) {
  currentOrderPage = page;

  if (searchQuery !== null) {
    currentSearchQuery = searchQuery;
  }
console.log("ORDER TOKEN:", orderToken);

  try {
    const res = await fetch(`http://localhost:3000/api/orders?page=${page}&limit=${limit}&search=${encodeURIComponent(currentSearchQuery)}`, {
      headers: {
        Authorization: `Bearer ${orderToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/admin-login.html';
        return;
      }
      const errText = await res.text();
      throw new Error(`Fetch failed: ${res.status} ${errText}`);
    }

    const result = await res.json();
    console.log("ORDERS RESPONSE 👉", result);

    const orders = result.data || (Array.isArray(result) ? result : []);
    const tbody = document.querySelector("#orders-table tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;">No orders found</td>
        </tr>
      `;
      return;
    }

    orders.forEach(o => {
      const row = document.createElement("tr");

      // Status Buttons Logic
      let actionButtons = '';
      if (o.status === 'Pending') {
        actionButtons = `
          <button onclick="updateOrderStatus(${o.id}, 'Delivered')" style="background:green; color:white; margin-right:5px; cursor:pointer;">Deliver</button>
          <button onclick="updateOrderStatus(${o.id}, 'Cancelled')" style="background:orange; color:white; margin-right:5px; cursor:pointer;">Cancel</button>
        `;
      }

      row.innerHTML = `
        <td>${o.id}</td>
        <td>${o.phone}</td>
        <td>${o.location || "-"}</td>
        <td>${o.payment_method}</td>
        <td style="font-weight:bold; color:${o.status === 'Pending' ? 'orange' : (o.status === 'Delivered' ? 'green' : 'red')}">${o.status}</td>
        <td>${o.total}</td>
        <td>${o.created_at ? new Date(o.created_at).toLocaleString() : 'N/A'}</td>
        <td>
          <button onclick="viewOrderItems(${o.id})" style="background:#17a2b8; color:white; margin-right:5px; cursor:pointer;">View Items</button>
          ${actionButtons}
          <button onclick="deleteOrder(${o.id})" style="background:red; color:white; cursor:pointer;">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });

    // render pagination buttons
    renderPagination(result.page, result.totalPages);

  } catch (err) {
    console.error(err);
    const tbody = document.querySelector("#orders-table tbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; color: red;">Failed to load orders: ${err.message}</td>
        </tr>
      `;
    }
  }
}

// ================== VIEW ITEMS ==================
async function viewOrderItems(id) {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${orderToken}` }
    });
    const order = await res.json();

    if (!res.ok) return alert(order.message || 'Failed to load items');

    const itemsList = (order.items && order.items.length > 0) 
      ? order.items.map(i => `- ${i.product_name} (Qty: ${i.quantity}) @ ${i.price}`).join('\n')
      : "No items found for this order.";

    alert(`📦 Order #${order.id} Items:\n\n${itemsList}\n\n💰 Total: ${order.total}`);

  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

// ================== UPDATE STATUS ==================
async function updateOrderStatus(id, status) {
  if (!confirm(`Mark order #${id} as ${status}?`)) return;

  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orderToken}` 
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      loadOrders(currentOrderPage); // Refresh table
    } else {
      alert(data.message || 'Update failed');
    }

  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

// ================== DELETE ORDER ==================
async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;

  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${orderToken}` }
    });

    let data = {};
    try { data = await res.json(); } catch {}

    if (res.ok) {
      alert(data.message || '🗑️ Order deleted');
      loadOrders(currentOrderPage);
    } else {
      alert(data.message || `❌ Delete failed (${res.status})`);
    }

  } catch (err) {
    console.error(err);
    alert('❌ Server error');
  }
}

// ================== INIT ==================
window.addEventListener('DOMContentLoaded', () => {
  loadOrders();

  const searchInput = document.getElementById('order-search');
  const clearBtn = document.getElementById('clear-search');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => loadOrders(1, e.target.value));
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      loadOrders(1, '');
    });
  }
});
