const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    errorMsg.textContent = 'Please enter username and password';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Login failed');

    // Save token to localStorage
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUsername', username);

    // Redirect to dashboard
    window.location.href = 'admin-dashboard.html';
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});