// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzBuhMRRFfXJFnrfIyaKBgD_4Dkd66n-SynmKyvX72ElSDqOHj9POx3PiOyXKf8EIIP/exec";

// === UTILITÁRIOS ===
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 4000);
}

// === EVENTOS PRINCIPAIS ===
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpSection = document.getElementById("otpSection");
  const otpInput = document.getElementById("otpInput");
  const validateOtpBtn = document.getElementById("validateOtpBtn");

  // Permite enviar com Enter no campo de e-mail
  emailInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendOtpBtn.click();
    }
  });

  // === Envio do código OTP ===
  sendOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Por favor insere o teu e-mail profissional.", "error");
      return;
    }

    showToast("A enviar código de acesso...", "info");
    sendOtpBtn.disabled = true;

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOtp", email }),
      });

      if (!response.ok) throw new Error("Falha de comunicação com o servidor");

      const result = await response.json();
      console.log("Resposta:", result);

      if (result.success) {
        showToast("Código enviado com sucesso!", "ok");
        otpSection.classList.remove("hidden");
      } else {
        showToast(result.message || "Erro ao enviar o código.", "error");
      }
    } catch (err) {
      console.error("Erro:", err);
      showToast("Erro de ligação ao servidor.", "error");
    } finally {
      sendOtpBtn.disabled = false;
    }
  });

  // === Validação do código OTP ===
  validateOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const code = otpInput.value.trim();

    if (!code) {
      showToast("Insere o código recebido por e-mail.", "error");
      return;
    }

    showToast("A validar código...", "info");
    validateOtpBtn.disabled = true;

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validateOtp", email, code }),
      });

      if (!response.ok) throw new Error("Falha de comunicação com o servidor");

      const result = await response.json();

      if (result.success) {
        showToast("Login autorizado! A redirecionar...", "ok");
        setTimeout(() => {
          window.location.href = "dashboard.html"; // Página interna futura
        }, 1500);
      } else {
        showToast(result.message || "Código inválido ou expirado.", "error");
      }
    } catch (err) {
      console.error("Erro:", err);
      showToast("Erro de ligação ao servidor.", "error");
    } finally {
      validateOtpBtn.disabled = false;
    }
  });
});
