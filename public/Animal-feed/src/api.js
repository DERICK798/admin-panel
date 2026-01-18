const API = import.meta.env.VITE_API_URL;

export const getProducts = async () => {
  const res = await fetch(`${API}/client/products`);
  return res.json();
};

export const placeOrder = async (data) => {
  const res = await fetch(`${API}/client/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};
