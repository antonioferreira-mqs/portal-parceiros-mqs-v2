// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbw60mMDFt6EHH_EI0tpkM6Eyc-lYMAEkOwNStJmjfuuQu5EmvO0bagCvGVHePyLAo7McQ/exec";

// === UTILITÁRIOS ===
function showToast(msg, type = "error") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show " + (type === "ok" ? "ok" : "");
  setTimeout(() => (toast.className = ""), 3200);
}

async function request(action, data) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: "Erro de ligação ao servidor." };
  }
}

// === AÇÕES DE LOGIN ===
async function handleSendOtp() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) return showToast("Por favor, insere o teu e-mail.");
  showToast("A enviar código...", "ok");

  const res = await request("sendOtp", { email });
  if (res.success) {
    showToast("Código enviado para o e-mail!", "ok");
    document.getElementById("otpSection").classList.remove("hidden");
    document.getElementById("otpInput").focus();
  } else {
    showToast(res.message || "Erro no envio do código.");
  }
}

async function handleValidateOtp() {
  const email = document.getElementById("emailInput").value.trim();
  const code = document.getElementById("otpInput").value.trim();
  if (!email || !code) return showToast("Preenche ambos os campos.");

  const res = await request("validateOtp", { email, code });
  if (res.success) {
    showToast("Login autorizado!", "ok");

    // 🟢 Aqui futuramente poderás redirecionar para o painel pós-login:
    // window.location.href = "dashboard.html";
  } else {
    showToast(res.message || "Código inválido.");
  }
}

// === EVENTOS ===
document.getElementById("sendOtpBtn").addEventListener("click", handleSendOtp);
document.getElementById("validateOtpBtn").addEventListener("click", handleValidateOtp);

// Pressionar Enter no campo de e-mail → Envia código
document.getElementById("emailInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSendOtp();
  }
});

// Pressionar Enter no campo de OTP → Valida acesso
document.getElementById("otpInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleValidateOtp();
  }
});
