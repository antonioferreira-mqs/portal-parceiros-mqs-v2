// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL = "https://script.google.com/macros/s/SEU_URL_DO_APPS_SCRIPT/exec";

// === UTILITÁRIOS ===
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = type === "error" ? "show error" : "show";
  setTimeout(() => (toast.className = ""), 3200);
}

// === ELEMENTOS ===
const views = {
  login: document.getElementById("view-login"),
  otp: document.getElementById("view-otp"),
  home: document.getElementById("view-home"),
};
const sendOtpBtn = document.getElementById("sendOtpBtn");
const validateOtpBtn = document.getElementById("validateOtpBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");

// === TROCA DE VISTAS ===
function showView(name) {
  Object.values(views).forEach(v => (v.hidden = true));
  views[name].hidden = false;
}

// === ENVIO DE OTP ===
sendOtpBtn.onclick = async () => {
  const email = document.getElementById("partnerEmail").value.trim();
  if (!email) return showToast("Preenche o e-mail profissional.", "error");

  showToast("A enviar código...");
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sendOtp", email }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("Código enviado para o teu e-mail!");
      showView("otp");
      localStorage.setItem("email", email);
    } else {
      showToast(data.message || "Email não autorizado.", "error");
    }
  } catch (err) {
    showToast("Erro de ligação ao servidor.", "error");
  }
};

// === VALIDAÇÃO DE OTP ===
validateOtpBtn.onclick = async () => {
  const code = document.getElementById("otpCode").value.trim();
  const email = localStorage.getItem("email");
  if (!code) return showToast("Insere o código recebido.", "error");

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validateOtp", email, code }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("Login efetuado com sucesso!");
      showView("home");
    } else {
      showToast(data.message || "Código inválido ou expirado.", "error");
    }
  } catch {
    showToast("Erro de ligação ao servidor.", "error");
  }
};

backToLoginBtn.onclick = () => showView("login");
