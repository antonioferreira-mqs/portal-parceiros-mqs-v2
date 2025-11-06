// === Portal Parceiros MQS – Login ===
// Compatível com Backend vFinal (Nov 2025)

const BACKEND_URL = "https://script.google.com/macros/s/AKfycbymt_l6kczmHB8gcTpMUd9-OyF0rHvyc_c73dUdKVC9nZLA_M8zG_lt7SH00qsBTzQ7jQ/exec"; // <-- substitui pelo teu URL real

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email) return showToast("Por favor, introduza o e-mail.");
  if (!password) return showToast("Por favor, introduza a password.");

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });

    const data = await res.json();

    if (data.ok) {
      showToast("✅ Login com sucesso!");
      setSession(email);
      setTimeout(() => window.location.href = "parceiros.html", 600);
      return;
    }

    // Caso seja o primeiro acesso (sem password)
    if (data.status === "NO_PASSWORD") {
      const criar = confirm("Primeiro acesso — deseja criar a sua password agora?");
      if (criar) {
        window.location.href = `reset.html?email=${encodeURIComponent(email)}`;
      }
      return;
    }

    // Caso de erro geral
    showToast("⚠️ " + (data.message || "Falha no login."));

  } catch (err) {
    console.error(err);
    showToast("Erro de ligação ao servidor.");
  }
});


// === Funções auxiliares ===
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setSession(email) {
  sessionStorage.setItem('userEmail', email);
}
