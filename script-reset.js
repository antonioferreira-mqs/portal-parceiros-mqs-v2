// === CONFIGURAÇÃO ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwx-C6eNh1Vag5VshB3S91ZRSPe3i8dHKqQifwJXesFHa5n_4ZAu0ZY_xde9pd7yWXE5A/exec";

// === ELEMENTOS ===
const container = document.getElementById("formContainer");

// === Função para mostrar mensagens (toast) ===
function showToast(msg, success = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = success ? "#28a745" : "#d9534f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// === Verifica se existe token na URL ===
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const presetEmail = sessionStorage.getItem("mqs_pending_email") || params.get("email");

if (presetEmail) {
  sessionStorage.removeItem("mqs_pending_email");
}

// === 1️⃣ Modo A: Pedido de recuperação de password ===
if (!token) {
  container.innerHTML = `
    <form id="requestForm">
      <label for="email">E-mail</label>
      <input type="email" id="email" required>
      <button type="submit">Enviar link de recuperação</button>
    </form>
  `;

  const emailInput = document.getElementById("email");
  if (presetEmail) {
    emailInput.value = presetEmail;
  }

  document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Indique o seu e-mail.");
      return;
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "requestReset", email }),
      });
      const data = await res.json();
      showToast(data.message || "Pedido concluído.", data.ok);
    } catch (err) {
      showToast("Erro de ligação ao servidor.");
    }
  });
}

// === 2️⃣ Modo B: Definição de nova password (via token) ===
else {
  container.innerHTML = `
    <form id="resetForm">
      <label for="newPassword">Nova password</label>
      <input type="password" id="newPassword" minlength="8" maxlength="30" required>
      <button type="submit">Definir password</button>
    </form>
  `;

  document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;

    if (!newPassword || newPassword.length < 8) {
      showToast("A password deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", token, newPassword }),
      });

      const data = await res.json();
      if (data.ok) {
        showToast("Password atualizada com sucesso!", true);
        setTimeout(() => (window.location.href = "index.html"), 2000);
      } else {
        showToast(data.message || "Não foi possível atualizar a password.");
      }
    } catch (err) {
      showToast("Erro ao redefinir password.");
    }
  });
}
