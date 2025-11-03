// script.js (ES Module)
import { setSession, getSession } from "./auth.js";

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
  // Se já tiver sessão válida, segue direto para a área interna
  const existing = getSession?.();
  if (existing) {
    window.location.href = "parceiros.html";
    return;
  }

  const emailInput = $("#emailInput");
  const otpInput = $("#otpInput");
  const sendBtn = $("#sendOtpBtn");
  const validateBtn = $("#validateOtpBtn");

  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); sendBtn.click(); }
  });

  otpInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); validateBtn.click(); }
  });

  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Indica o teu e-mail profissional.", "error");
      emailInput.focus();
      return;
    }

    setLoading(sendBtn, true, "A enviar código…", "Enviar código de acesso");
    try {
      const resp = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOtp", email }),
      });

      const text = await resp.text();
      let result = {};
      try { result = JSON.parse(text); } catch {}

      if (!resp.ok) {
        showToast("Não foi possível comunicar com o servidor.", "error");
        return;
      }

      if (result?.success) {
        showToast("Código enviado por e-mail.");
        showOtpSection(true);
      } else {
        const msg = result?.message || "Não foi possível enviar o código.";
        if (/não autorizado|nao autorizado/i.test(msg)) {
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

  validateBtn.addEventListener("click", async () => {
    const email = $("#emailInput").value.trim();
    const code  = $("#otpInput").value.trim();

    if (!email) { showToast("Indica o e-mail primeiro.", "error"); return; }
    if (!/^\d{6}$/.test(code)) { showToast("Código inválido. Usa 6 dígitos.", "error"); return; }

    setLoading(validateBtn, true, "A validar…", "Validar código");
    try {
      const resp = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validateOtp", email, code }),
      });

      const text = await resp.text();
      let result = {};
      try { result = JSON.parse(text); } catch {}

      if (!resp.ok) {
        showToast("Não foi possível validar o código.", "error");
        return;
      }

      if (result?.success) {
        // cria sessão por 60 minutos e segue
        setSession(email, 60 * 60 * 1000);
        showToast("Login autorizado.");
        window.location.href = "parceiros.html";
      } else {
        showToast(result?.message || "Código inválido ou expirado.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Falha de ligação. Tenta de novo.", "error");
    } finally {
      setLoading(validateBtn, false, "", "Validar código");
    }
  });
});
