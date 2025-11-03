// ====== CONFIG ======
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxSDzbklMf--MmrKhcdznSoNoDwWi70MgrOjv9En0izr7hC0H1cOO0EvSC9HPX2PwkU/exec"; // <- atualiza!

// ====== UI helpers ======
const toastEl = document.getElementById("toast");
function showToast(msg, type = "ok") {
  toastEl.textContent = msg;
  toastEl.className = type ? type : "ok";
  toastEl.style.display = "block";
  setTimeout(() => (toastEl.style.display = "none"), 3500);
}
function setLoading(btn, isLoading) {
  btn.disabled = !!isLoading;
  btn.setAttribute("aria-busy", String(!!isLoading));
}

// ====== Bridge helpers (iframe + postMessage) ======
const bridgeForm = document.getElementById("bridgeForm");

// envia para o Apps Script via <form target=iframe>
function bridgePost(action, payload = {}) {
  bridgeForm.action = BACKEND_URL;
  bridgeForm.elements.action.value = action;
  bridgeForm.elements.email.value  = payload.email || "";
  bridgeForm.elements.code.value   = payload.code  || "";
  bridgeForm.submit();
}

// recebe as respostas do Apps Script
window.addEventListener("message", (ev) => {
  const data = ev.data || {};
  // data = { ok:boolean, code?:string, message?:string }
  if (!("ok" in data)) return;

  if (pendingAction === "sendOtp") {
    if (data.ok) {
      showToast("Código enviado para o e-mail.", "ok");
      otpSection.classList.remove("hidden");
      otpInput.value = "";
      otpInput.focus();
    } else if (data.code === "UNAUTHORIZED") {
      showToast("Email não autorizado para aceder ao portal.", "warn");
      otpSection.classList.add("hidden");
    } else {
      showToast(data.message || "Não foi possível enviar o código.", "warn");
      otpSection.classList.add("hidden");
    }
    setLoading(sendOtpBtn, false);
    pendingAction = null;
  }

  if (pendingAction === "validateOtp") {
    if (data.ok) {
      showToast("Autenticação confirmada. Bem-vindo!", "ok");
      setTimeout(() => (window.location.href = "parceiros.html"), 600);
    } else {
      showToast(data.message || "Código inválido.", "warn");
    }
    setLoading(validateOtpBtn, false);
    pendingAction = null;
  }
});

// ====== App ======
const emailInput     = document.getElementById("emailInput");
const sendOtpBtn     = document.getElementById("sendOtpBtn");
const otpSection     = document.getElementById("otpSection");
const otpInput       = document.getElementById("otpInput");
const validateOtpBtn = document.getElementById("validateOtpBtn");

let pendingAction = null;

// Enter no e-mail => clica no botão
emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendOtpBtn.click();
  }
});

sendOtpBtn.addEventListener("click", () => {
  const email = (emailInput.value || "").trim();
  if (!email) {
    showToast("Indica o teu e-mail profissional.", "warn");
    return;
  }
  setLoading(sendOtpBtn, true);
  pendingAction = "sendOtp";
  bridgePost("sendOtp", { email });
});

otpInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    validateOtpBtn.click();
  }
});

validateOtpBtn.addEventListener("click", () => {
  const email = (emailInput.value || "").trim();
  const code  = (otpInput.value || "").trim();
  if (!/^\d{6}$/.test(code)) {
    showToast("Indica um código de 6 dígitos.", "warn");
    return;
  }
  setLoading(validateOtpBtn, true);
  pendingAction = "validateOtp";
  bridgePost("validateOtp", { email, code });
});
