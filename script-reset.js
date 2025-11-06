// === Configurações ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx3VXG71YwMF2-B7zvs0jtTS_vyhcuw7P6HfTvzbTaMLNvOVQUxSZ9l0rW9qXxtC1703A/exec";

// === Helpers ===
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const container = document.getElementById("formContainer");

function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = type === "ok" ? "#1C7C54" : "#d9534f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}

// === Renderização dinâmica ===
if (token) {
  // Página com token → definir nova password
  container.innerHTML = `
    <form id="resetForm">
      <label for="pw1">Nova password</label>
      <input type="password" id="pw1" required minlength="10">

      <label for="pw2">Confirmar password</label>
      <input type="password" id="pw2" required minlength="10">

      <button type="submit">Definir password</button>
    </form>
    <p style="margin-top:1rem;"><a href="index.html">Voltar ao login</a></p>
  `;
  document.getElementById("resetForm").addEventListener("submit", resetPassword);
} else {
  // Página sem token → pedir link de recuperação
  container.innerHTML = `
    <form id="reqForm">
      <label for="email">E-mail</label>
      <input type="email" id="email" required>

      <button type="submit">Pedir link de recuperação</button>
    </form>
    <p style="margin-top:1rem;"><a href="index.html">Voltar ao login</a></p>
  `;
  document.getElementById("reqForm").addEventListener("submit", requestReset);
}

// === Pedido de link de recuperação ===
async function requestReset(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "requestReset", email })
    });
    const data = await res.json();
    if (data.ok) showToast("Enviámos um e-mail com o link de recuperação.", "ok");
    else showToast(data.message || "Não foi possível enviar o link.", "error");
  } catch {
    showToast("Erro de ligação. Verifica a tua Internet.", "error");
  }
}

// === Definir nova password ===
async function resetPassword(e) {
  e.preventDefault();
  const pw1 = document.getElementById("pw1").value;
  const pw2 = document.getElementById("pw2").value;
  if (pw1 !== pw2) return showToast("As passwords não coincidem.", "error");
  if (pw1.length < 10) return showToast("A password deve ter pelo menos 10 caracteres.", "error");
  
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetPassword", token, newPassword: pw1 })
    });
    const data = await res.json();
    if (data.ok) {
      showToast("Password redefinida com sucesso!", "ok");
      setTimeout(() => window.location.href = "index.html", 2500);
    } else {
      showToast(data.message || "Token inválido ou expirado.", "error");
    }
  } catch {
    showToast("Erro de ligação. Tenta novamente.", "error");
  }
}
