// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbysYsVETNbBfKhQX8yNgwyX6PPWS9ABlNtQ4DQrBlfU4-usHJKGVYuko7mx8Ozk2hU6rw/exec";

// === UTILITÁRIOS ===
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show" + (type === "error" ? " error" : "");
  setTimeout(() => (toast.className = "toast"), 3200);
}

function swapView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(viewId).classList.remove("hidden");
}

// === LOGIN (PEDIR CÓDIGO) ===
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  showToast("A enviar código de acesso...");
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sendOtp", email })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("partnerEmail", email);
      swapView("view-otp");
      showToast("Código enviado para o teu e-mail!");
    } else showToast(data.message || "Erro ao enviar código.", "error");
  } catch {
    showToast("Erro de ligação ao servidor.", "error");
  }
});

// === VALIDAR CÓDIGO ===
const otpForm = document.getElementById("otpForm");
otpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = localStorage.getItem("partnerEmail");
  const code = document.getElementById("otp").value.trim();

  showToast("A validar código...");
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validateOtp", email, code })
    });
    const data = await res.json();
    if (data.success) {
      swapView("view-home");
      document.getElementById("partnerEmailBadge").textContent = email;
      document.getElementById("partnerStatus").hidden = false;
      showToast("Acesso autorizado!");
    } else showToast(data.message || "Código inválido.", "error");
  } catch {
    showToast("Erro de validação.", "error");
  }
});

// === LOGOUT ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  swapView("view-login");
  document.getElementById("partnerStatus").hidden = true;
  showToast("Sessão terminada.");
});

// === AUTOLOGIN SE ATIVO ===
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("partnerEmail")) {
    swapView("view-home");
    document.getElementById("partnerEmailBadge").textContent = localStorage.getItem("partnerEmail");
    document.getElementById("partnerStatus").hidden = false;
  } else swapView("view-login");
});
