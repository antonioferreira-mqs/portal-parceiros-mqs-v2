// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzBKjVRYWf1SLT8UfTKFEO-KAS1J5mezMiAFZ5TTZpykH4Cb1nV-6lbPQ_91sApniTpwg/exec";

// === UTILITÁRIOS ===
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.style.opacity = "1";
  setTimeout(() => (toast.style.opacity = "0"), 4000);
}

function setLoading(btn, isLoading, textDefault) {
  if (isLoading) {
    btn.classList.add("btn-loading");
    btn.textContent = "";
    btn.disabled = true;
  } else {
    btn.classList.remove("btn-loading");
    btn.textContent = textDefault;
    btn.disabled = false;
  }
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
    setLoading(sendOtpBtn, true, "Enviar código de acesso");

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
        otpSection.classList.add("show");
        otpSection.classList.remove("hidden");
      } else if (
        result.message &&
        result.message.toLowerCase().includes("não autorizado")
      ) {
        showToast(
          "Este e-mail não tem permissão para aceder ao Portal de Parceiros MQS.",
          "error"
        );
      } else {
        showToast(result.message || "Erro ao enviar o código.", "error");
      }
    } catch (err) {
      console.error("Erro:", err);
      showToast("Erro de ligação ao servidor.", "error");
    } finally {
      setLoading(sendOtpBtn, false, "Enviar código de acesso");
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
    setLoading(validateOtpBtn, true, "Validar código");

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
          window.location.href = "dashboard.html"; // página seguinte
        }, 1500);
      } else {
        showToast(result.message || "Código inválido ou expirado.", "error");
      }
    } catch (err) {
      console.error("Erro:", err);
      showToast("Erro de ligação ao servidor.", "error");
    } finally {
      setLoading(validateOtpBtn, false, "Validar código");
    }
  });
});
