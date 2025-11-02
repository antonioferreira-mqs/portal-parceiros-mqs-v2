// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxxILEr9Tny05xlC52MTU4Y8PI1KVsYoEs-q1PA9A1ieT0SZOJXll6HNO_Qoz2UVbUmQQ/exec";

// === UTILITÁRIOS ===
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 4000);
}

// === EVENTO PRINCIPAL ===
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const sendButton = document.getElementById("sendButton");
  const otpSection = document.getElementById("otpSection");
  const otpInput = document.getElementById("otpInput");
  const validateButton = document.getElementById("validateButton");

  // Permite enviar com Enter no campo de e-mail
  emailInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendButton.click();
    }
  });

  // Permite validar com Enter no campo de código OTP
  otpInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      validateButton.click();
    }
  });

  // === Enviar código ===
  sendButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Por favor insere o teu e-mail profissional.", "error");
      return;
    }

    showToast("A enviar código de acesso...", "info");

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOtp", email }),
      });

      const result = await response.json();
      console.log("Resposta do servidor:", result);

      if (result.success) {
        showToast("Código enviado para o e-mail.", "ok");
        otpSection.classList.remove("hidden");
      } else {
        showToast(result.message || "Erro ao enviar o código.", "error");
      }

    } catch (error) {
      console.error("Erro de ligação ao servidor:", error);
      showToast("Erro de ligação ao servidor.", "error");
    }
  });

  // === Validar código ===
  validateButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const code = otpInput.value.trim();

    if (!email || !code) {
      showToast("Preenche o e-mail e o código recebido.", "error");
      return;
    }

    showToast("A validar código...", "info");

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validateOtp", email, code }),
      });

      const result = await response.json();
      console.log("Resposta do servidor:", result);

      if (result.success) {
        showToast("Login autorizado. ✅", "ok");
      } else {
        showToast(result.message || "Código inválido ou expirado.", "error");
      }

    } catch (error) {
      console.error("Erro de ligação ao servidor:", error);
      showToast("Erro de ligação ao servidor.", "error");
    }
  });
});
