// === CONFIGURAÇÃO ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbylru1rRon1qq1FeNyWWju7rhHcmo4-Vs6XqRxooyzOjQW5saqdU0Za4jOUBfD5cc08rg/exec";

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

// === 1️⃣ Modo A: Pedido de recuperação de password ===
if (!token) {
  container.innerHTML = `
    <form id="requestForm">
      <label for="email">E-mail</label>
      <input type="email" id="email" required>
      <button type="submit">Enviar link de recuperação</button>
    </form>
  `;

  document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "requestReset", email }),
      });
      const data = await res.json();
      showToast(data.message, data.ok);
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

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", token, newPassword }),
      });

      const data = await res.json();
      if (data.ok) {
        showToast("Password atualizada com sucesso!", true);
        setTimeout(() => window.location.href = "index.html", 2000);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast("Erro ao redefinir password.");
    }
  });
}
