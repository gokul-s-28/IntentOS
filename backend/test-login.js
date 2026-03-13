async function test() {
  try {
    const res = await fetch('http://localhost:5001/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mukul@example.com', password: 'password123' })
    });
    const data = await res.json();
    console.log('[STATUS]', res.status);
    console.log('[BODY]', data);
  } catch (err) {
    console.log('[ERROR]', err.message);
  }
}
test();
