// ====== CONFIG ======
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx09NFICUUQGva7euQ7I4KzJp3AdnEeBJBBEd_ZklmIxp2t_RHdXnSuBPF2zT9hxg_B/exec";

// ====== UI helpers ======
const toastEl = document.getElementById("toast");
function showToast(msg, type = "ok") {
  toastEl.textContent = msg;
  toastEl.className = type ? type : "ok";
  toastEl.style.display = "block";
  setTimeout(() => (toastEl.style.display = "none"), 3500);
}
function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = !!isLoading;
  btn.setAttribute("aria-busy", String(!!isLoading));
}

// ====== API ======
// Envia como "text/plain" para evitar preflight CORS (OPTIONS)
async function callApi(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body
  });

  // Se falhar, lança o texto para termos mais detalhe no console
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} – ${txt || "sem detalhe"}`);
  }
  // Apps Script devolve JSON em doPost
  return res.json();
}

// ====== App ======
const emailInput     = document.getElementById("emailInput");
const sendOtpBtn     = document.getElementById("sendOtpBtn");
const otpSection     = document.getElementById("otpSection");
const otpInput       = document.getElementById("otpInput");
const validateOtpBtn = document.getElementById("validateOtpBtn");

// Enter no e-mail => clica no botão
emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendOtpBtn.click();
  }
});

sendOtpBtn.addEventListener("click", async () => {
  const email = (emailInput.value || "").trim();
  if (!email) {
    showToast("Indica o teu e-mail profissional.", "warn");
    return;
  }

  setLoading(sendOtpBtn, true);
  try {
    const r = await callApi("sendOtp", { email });
    if (r.ok) {
      showToast("Código enviado para o e-mail.", "ok");
      otpSection.classList.remove("hidden");
      otpInput.focus();
    } else if (r.code === "UNAUTHORIZED") {
      showToast("Email não autorizado para aceder ao portal.", "warn");
      otpSection.classList.add("hidden");
    } else {
      showToast(r.message || "Não foi possível enviar o código.", "warn");
      otpSection.classList.add("hidden");
    }
  } catch (err) {
    console.error("Erro no fetch:", err);
    showToast("Falha de ligação. Verifica a Internet.", "error");
  } finally {
    setLoading(sendOtpBtn, false);
  }
});

// Enter no OTP => validar
otpInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    validateOtpBtn.click();
  }
});

validateOtpBtn?.addEventListener("click", async () => {
  const email = (emailInput.value || "").trim();
  const code  = (otpInput.value || "").trim();

  if (!code || code.length !== 6) {
    showToast("Indica um código de 6 dígitos.", "warn");
    return;
  }

  setLoading(validateOtpBtn, true);
  try {
    const r = await callApi("validateOtp", { email, code });
    if (r.ok) {
      showToast("Autenticação confirmada. Bem-vindo!", "ok");
      // TODO: redirecionar para o dashboard real
      // window.location.href = "/dashboard.html";
    } else {
      showToast(r.message || "Código inválido.", "warn");
    }
  } catch (err) {
    console.error("Erro no fetch:", err);
    showToast("Falha de ligação. Verifica a Internet.", "error");
  } finally {
    setLoading(validateOtpBtn, false);
  }
});
