const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx3VXG71YwMF2-B7zvs0jtTS_vyhcuw7P6HfTvzbTaMLNvOVQUxSZ9l0rW9qXxtC1703A/exec";
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const container = document.getElementById('formContainer');

if (token) {
  container.innerHTML = `
    <form id="resetForm">
      <label for="pw1">Nova password</label>
      <input type="password" id="pw1" required minlength="10">
      <label for="pw2">Confirmar password</label>
      <input type="password" id="pw2" required minlength="10">
      <button type="submit">Definir password</button>
    </form>`;
  document.getElementById('resetForm').addEventListener('submit', resetPassword);
} else {
  container.innerHTML = `
    <form id="reqForm">
      <label for="email">E-mail</label>
      <input type="email" id="email" required>
      <button type="submit">Pedir link de recuperação</button>
    </form>`;
  document.getElementById('reqForm').addEventListener('submit', requestReset);
}

async function requestReset(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'requestReset', email })
    });
    const data = await res.json();
    showToast(data.message);
  } catch {
    showToast('Erro de ligação. Verifique a Internet.');
  }
}

async function resetPassword(e) {
  e.preventDefault();
  const pw1 = document.getElementById('pw1').value;
  const pw2 = document.getElementById('pw2').value;
  if (pw1 !== pw2) return showToast('As passwords não coincidem.');
  if (pw1.length < 10) return showToast('A password deve ter pelo menos 10 caracteres.');

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetPassword', token, newPassword: pw1 })
    });
    const data = await res.json();
    showToast(data.message);
    if (data.ok) setTimeout(() => (window.location = 'index.html'), 3000);
  } catch {
    showToast('Erro de ligação.');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show';
  setTimeout(() => (t.className = ''), 3500);
}
