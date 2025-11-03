// ===== CONFIG =====
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwA-gJTIbYx90r-zQU0zUxFTiPIC8iItxZZPIkSqkE4iwesXtaI0otxN8jerY7rekaR/exec";

// ===== Toast =====
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `show ${type}`;
  setTimeout(() => (toast.className = toast.className.replace("show", "").trim()), 3500);
}

// ===== Ready =====
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const sendBtn = document.getElementById("sendOtpBtn");
  const otpSection = document.getElementById("otpSection");
  const otpInput = document.getElementById("otpInput");
  const validateBtn = document.getElementById("validateOtpBtn");
  const viewLogin = document.getElementById("view-login");
  const viewSuccess = document.getElementById("view-success");
  const partnerEmailBadge = document.getElementById("partnerEmailBadge");

  // Enter no email envia
  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Enter no OTP valida
  otpInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateBtn.click();
    }
  });

  // Enviar código
  sendBtn.addEventListener("click", async () => {
    const email = (emailInput.value || "").trim();
    if (!email) return showToast("Por favor, insere o teu e-mail profissional.", "error");

    try {
      sendBtn.disabled = true;
      showToast("A enviar código de acesso...", "info");

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // CORS simples
        body: JSON.stringify({ action: "sendOtp", email })
      });

      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { success:false, message:raw }; }

      if (data.success) {
        showToast("Código enviado para o e-mail.", "ok");
        otpSection.classList.remove("hidden");
        otpInput.value = "";
        otpInput.focus();
      } else {
        showToast(data.message || "Erro ao enviar o código.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de ligação ao servidor.", "error");
    } finally {
      sendBtn.disabled = false;
    }
  });

  // Validar código
  validateBtn.addEventListener("click", async () => {
    const email = (emailInput.value || "").trim();
    const code = (otpInput.value || "").trim();
    if (!email || !code) return showToast("Preenche o e-mail e o código.", "error");

    try {
      validateBtn.disabled = true;
      showToast("A validar código...", "info");

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "validateOtp", email, code })
      });

      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { success:false, message:raw }; }

      if (data.success) {
        showToast("Login autorizado.", "ok");
        partnerEmailBadge.textContent = email;
        viewLogin.classList.add("hidden");
        viewSuccess.classList.remove("hidden");
      } else {
        showToast(data.message || "Código inválido ou expirado.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de ligação ao servidor.", "error");
    } finally {
      validateBtn.disabled = false;
    }
  });
});
