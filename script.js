// === CONFIGURAÇÃO PRINCIPAL ===
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzBuhMRRFfXJFnrfIyaKBgD_4Dkd66n-SynmKyvX72ElSDqOHj9POx3PiOyXKf8EIIP/exec";

// === UTILITÁRIOS ===
const $ = (sel) => document.querySelector(sel);

function showToast(msg, type = "ok") {
  const toast = $("#toast");
  toast.textContent = msg;
  toast.className = `toast ${type === "error" ? "error" : type === "info" ? "info" : ""} show`;
  setTimeout(() => (toast.className = "toast"), 3500);
}

function setLoading(btn, isLoading, textLoading = "A enviar…", textNormal = "Enviar") {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = textLoading;
    btn.classList.add("btn-disabled");
    btn.disabled = true;
  } else {
    btn.textContent = textNormal || btn.dataset.originalText || btn.textContent;
    btn.classList.remove("btn-disabled");
    btn.disabled = false;
  }
}

function showOtpSection(show) {
  const sec = $("#otpSection");
  if (show) {
    sec.classList.remove("hidden");
    $("#otpInput").focus();
  } else {
    sec.classList.add("hidden");
    $("#otpInput").value = "";
  }
}

// === EVENTO PRINCIPAL ===
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = $("#emailInput");
  const otpInput = $("#otpInput");
  const sendBtn = $("#sendOtpBtn");
  const validateBtn = $("#validateOtpBtn");

  // Enter no campo de e-mail → enviar OTP
  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Enter no campo de código → validar
  otpInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateBtn.click();
    }
  });

  // Clicar em Enviar código
  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Indica o teu e-mail profissional.", "error");
      emailInput.focus();
      return;
    }

    setLoading(sendBtn, true, "A enviar código…");
    try {
      const resp = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOtp", email }),
      });

      // Pode vir 200 com JSON, ou erro com texto
      let result = {};
      const text = await resp.text();
      try { result = JSON.parse(text); } catch { /* mantém vazio */ }

      if (!resp.ok) {
        showToast("Não foi possível comunicar com o servidor.", "error");
        setLoading(sendBtn, false);
        return;
      }

      if (result && result.success) {
        showToast("Código enviado por e-mail.");
        showOtpSection(true);
      } else {
        const msg = (result && result.message) || "Não foi possível enviar o código.";
        if (/não autorizado|nao autorizado|nao autorizado/i.test(msg)) {
          showToast("Este e-mail não tem permissão para entrar no portal.", "error");
        } else {
          showToast(msg, "error");
        }
        showOtpSection(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Falha de ligação. Verifica a Internet.", "error");
    } finally {
      setLoading(sendBtn, false, "", "Enviar código de acesso");
    }
  });

  // Clicar em Validar código
  validateBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const code = otpInput.value.trim();

    if (!email) { showToast("Indica o e-mail primeiro.", "error"); return; }
    if (!/^\d{6}$/.test(code)) { showToast("Código inválido. Usa 6 dígitos.", "error"); return; }

    setLoading(validateBtn, true, "A validar…");
    try {
      const resp = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validateOtp", email, code }),
      });

      let result = {};
      const text = await resp.text();
      try { result = JSON.parse(text); } catch {}

      if (!resp.ok) {
        showToast("Não foi possível validar o código.", "error");
        return;
      }

      if (result && result.success) {
        showToast("Login autorizado.");
        // 👉 Aqui podes redirecionar para a área interna:
        // window.location.href = "/dashboard.html";
      } else {
        showToast((result && result.message) || "Código inválido ou expirado.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Falha de ligação. Tenta de novo.", "error");
    } finally {
      setLoading(validateBtn, false, "", "Validar código");
    }
  });
});
