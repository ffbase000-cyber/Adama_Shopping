const buyersTbody = document.querySelector('#buyersTable tbody');
const sellersTbody = document.querySelector('#sellersTable tbody');
const buyersCount = document.getElementById('buyersCount');
const sellersCount = document.getElementById('sellersCount');
const errorMessage = document.getElementById('errorMessage');
const logoutBtn = document.getElementById('logoutBtn');

const token = localStorage.getItem('adminToken');
if (!token) {
  window.location.href = 'admin-login.html';
}

// Logout handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUsername');
  window.location.href = 'admin-login.html';
});

function safe(text) {
  return text == null ? '' : String(text);
}

function rowForUser(u) {
  const created = u.createdAt ? new Date(u.createdAt).toLocaleString() : '';
  const profilePic = u.profilePic || '/uploads/default-profile.png';
  return `
    <tr>
      <td><img src="${profilePic}" alt="pic" class="profile-pic" onerror="this.onerror=null;this.src='/uploads/default-profile.png'"></td>
      <td>${safe(u.fullName)}<div class="small">${safe(u.email)}</div></td>
      <td>${safe(u.username)}</td>
      <td>${safe(u.email)}</td>
      <td>${safe(u.phone)}</td>
      <td>${safe(u.bankName)}</td>
      <td>${safe(u.bankNumber)}</td>
      <td>${safe(created)}</td>
    </tr>
  `;
}

async function loadDashboard() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load data');

    // Buyers
    buyersTbody.innerHTML = '';
    if (!data.buyers || data.buyers.length === 0) {
      buyersTbody.innerHTML = '<tr><td colspan="8">No buyers found.</td></tr>';
    } else {
      buyersCount.textContent = `Total Buyers: ${data.buyers.length}`;
      data.buyers.forEach(b => buyersTbody.insertAdjacentHTML('beforeend', rowForUser(b)));
    }

    // Sellers
    sellersTbody.innerHTML = '';
    if (!data.sellers || data.sellers.length === 0) {
      sellersTbody.innerHTML = '<tr><td colspan="8">No sellers found.</td></tr>';
    } else {
      sellersCount.textContent = `Total Sellers: ${data.sellers.length}`;
      data.sellers.forEach(s => sellersTbody.insertAdjacentHTML('beforeend', rowForUser(s)));
    }

  } catch (err) {
    console.error('Load dashboard error:', err);
    errorMessage.textContent = 'Error loading dashboard: ' + (err.message || err);
    buyersTbody.innerHTML = '<tr><td colspan="8">Error loading buyers.</td></tr>';
    sellersTbody.innerHTML = '<tr><td colspan="8">Error loading sellers.</td></tr>';
  }
}

// initial load
loadDashboard();