const fetch = require('node-fetch');

async function testOrder() {
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '1234567890',
        location: 'Test Location',
        payment_method: 'cash',
        products: [{
          name: 'Test Product',
          price: 10.00,
          quantity: 2
        }]
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testOrder();
