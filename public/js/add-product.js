// ================== AUTH TOKEN ==================
const token = localStorage.getItem('token');

if (!token) {
  alert('Please login as admin');
  window.location.href = '/admin-login.html';
}

let currentPage = 1;

// ================== ADD PRODUCT ==================
if (typeof document !== 'undefined') {
  const form = document.getElementById('addProductForm');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const product = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value.trim(),
        price: document.getElementById("price").value,
        description: document.getElementById("description").value.trim(),
        image: document.getElementById("image").value.trim(),
        image2: document.getElementById("image2").value.trim(),
        quantity: document.getElementById("quantity")?.value || 0
      };

      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(product)
        });

        const data = await res.json();

        if (res.ok) {
          alert('✅ Product added successfully');
          form.reset();
          loadProducts(); // refresh admin list
        } else {
          alert(data.message || '❌ Failed to add product');
        }
      } catch (err) {
        console.error(err);
        alert('❌ Server error');
      }
    });
  }
}

// ================== PAGINATION RENDER ==================
function renderProductPagination(page, totalPages) {
  const pagination = document.getElementById("products-pagination");
  if (!pagination) return;
  pagination.innerHTML = "";

  // Ensure at least 1 page is recognized
  if (!totalPages) totalPages = 1;

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = page === 1;
  prevBtn.onclick = () => loadProducts(page - 1);
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = page === i ? "active" : "";
    btn.onclick = () => loadProducts(i);
    pagination.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = page === totalPages;
  nextBtn.onclick = () => loadProducts(page + 1);
  pagination.appendChild(nextBtn);
}

// ================== LOAD PRODUCTS ==================
async function loadProducts(page = 1) {
  currentPage = page;
  try {
    const res = await fetch(`/api/products?page=${page}&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Fetch failed');
    }

    const result = await res.json();
    // Handle both paginated { data: [...] } and flat [...] responses
    const products = result.data || (Array.isArray(result) ? result : []);
    const totalPages = result.totalPages || 0;
    const currentPageNum = result.page || 1;
    const tbody = document.querySelector('#products-table tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!products || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found</td></tr>';
      return;
    }

    products.forEach(p => {
      const row = document.createElement('tr');

      const imageUrl = p.image ? `/uploads/${p.image}` : '/images/default.jpg';
      const image2Url = p.image2 ? `/uploads/${p.image2}` : '/images/default.jpg';

      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.category}</td>
        <td>${p.quantity}</td>
        <td><img src="${imageUrl}" alt="${p.name}" style="width: 50px; height: 50px;"></td>
        <td><img src="${image2Url}" alt="${p.name} 2" style="width: 50px; height: 50px;"></td>
        <td>
          <button onclick="updateProduct(${p.id})">Edit</button>
          <button onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Render pagination
    renderProductPagination(currentPageNum, totalPages);

  } catch (err) {
    console.error(err);
    const tbody = document.querySelector('#products-table tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Failed to load products: ${err.message}</td></tr>`;
  }
}

// ================== DELETE PRODUCT ==================
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (res.ok) {
      alert(data.message || '🗑️ Product deleted');
      loadProducts(currentPage);
    } else {
      alert(data.message || `❌ Delete failed (${res.status})`);
    }

  } catch (err) {
    console.error(err);
    alert('❌ Server error');
  }
}

// ================== UPDATE PRODUCT ==================
async function updateProduct(id) {
  const name = prompt('New name:');
  const price = parseFloat(prompt('New price:'));
  const category = prompt('New category:');
  const quantity = parseInt(prompt('New quantity:'));
  const image = prompt('New image URL:');
  const image2 = prompt('New image2 URL:');
  const description = prompt('New description:');

  if (!name || isNaN(price) || !category || !image || isNaN(quantity)) {
    alert('Invalid input');
    return;
  }

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, category, image, image2, description, quantity })
    });

    const data = await res.json();

    if (res.ok) {
      alert('✏️ Product updated');
      loadProducts(currentPage);
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

// ================== INIT ==================
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});
