const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx3VXG71YwMF2-B7zvs0jtTS_vyhcuw7P6HfTvzbTaMLNvOVQUxSZ9l0rW9qXxtC1703A/exec";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password, ua: navigator.userAgent })
    });
    const data = await res.json();

    if (data.ok) {
      setSession(email);
      window.location = 'parceiros.html';
    } else if (data.code === 'NO_PASSWORD') {
      if (confirm('Ainda não tem password. Pretende criar agora?')) {
        const pw = prompt('Defina uma nova password (mínimo 10 caracteres):');
        if (pw && pw.length >= 10) {
          const create = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createUser', email, password: pw })
          });
          const r = await create.json();
          showToast(r.message);
        } else showToast('Password demasiado curta.');
      }
    } else showToast(data.message || 'Erro no login.');
  } catch {
    showToast('Falha de ligação. Verifique a Internet ou antivírus.');
  }
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show';
  setTimeout(() => (t.className = ''), 3500);
}

function setSession(email, ttlMs = 60 * 60 * 1000) {
  const expires = Date.now() + ttlMs;
  localStorage.setItem('session', JSON.stringify({ email, expires }));
}
