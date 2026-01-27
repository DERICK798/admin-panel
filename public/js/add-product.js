// ================== AUTH TOKEN ==================
const token = localStorage.getItem('token');

if (!token) {
  alert('Please login as admin');
  window.location.href = '/admin-login.html';
}

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
        const res = await fetch('http://localhost:3000/api/products', {
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

// ================== LOAD PRODUCTS ==================
async function loadProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products');
    if (!res.ok) throw new Error('Fetch failed');

    const products = await res.json();
    const container = document.getElementById('products-container');

    if (!container) return;

    container.innerHTML = '';

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      const imageUrl = p.image
    ? `/uploads/${p.image}`
    : '/images/default.jpg';

      card.innerHTML = `
        <img src="${imageUrl}" alt="${p.name}" style="width: 100px; height: 100px;">
        <h3>${p.name}</h3>
        <p>Price: ${p.price}</p>
        <p>Quantity: ${p.quantity}</p>
        <button onclick="updateProduct(${p.id})">Edit</button>
        <button onclick="deleteProduct(${p.id})">Delete</button>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    const container = document.getElementById('products-container');
    if (container) container.innerHTML = '<p>Failed to load products</p>';
  }
}

// ================== DELETE PRODUCT ==================
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (res.ok) {
      alert(data.message || '🗑️ Product deleted');
      loadProducts();
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
  const image = prompt('New image URL:');
  const quantity = parseInt(prompt('New quantity:'));

  if (!name || isNaN(price) || !category || !image || isNaN(quantity)) {
    alert('Invalid input');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, category, image, quantity })
    });

    const data = await res.json();

    if (res.ok) {
      alert('✏️ Product updated');
      loadProducts();
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

// ================== INIT ==================
window.addEventListener('DOMContentLoaded', loadProducts);
