document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phone = document.getElementById('phone').value.trim();
        const location = document.getElementById('location').value.trim();
        const payment = document.getElementById('payment').value;

        const data = new FormData();
        data.append('phone', phone);
        data.append('location', location);
        data.append('payment', payment);

        const response = await fetch('create_order.php', {
            method: 'POST',
            body: data
        });

        const text = await response.text();
        alert(text);
    });
});
