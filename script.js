// ====== CONFIG ======
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxt6uH4XBZyvTupNohkHHt7bLfw2SIO1t_5ixmB5nLKa3wMurvIFzNFrBGyv7cxXcMR/exec"; // <- atualiza se mudares a implantação

// ====== UI helpers ======
const toastEl = document.getElementById("toast");
function showToast(msg, type = "ok") {
  toastEl.textContent = msg;
  toastEl.className = type ? type : "ok";
  toastEl.style.display = "block";
  // limpa depois de 3.5s
  setTimeout(() => (toastEl.style.display = "none"), 3500);
}
function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = !!isLoading;
  btn.setAttribute("aria-busy", String(!!isLoading));
}

// ====== API ======
// Enviar como x-www-form-urlencoded (simple request, sem preflight)
async function callApi(action, payload) {
  const data = new URLSearchParams();
  data.append("data", JSON.stringify({ action, ...payload }));

  const res = await fetch(BACKEND_URL, { method: "POST", body: data });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} – ${txt || "sem detalhe"}`);
  }
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
      otpInput.value = "";
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
    otpSection.classList.add("hidden");
  } finally {
    setLoading(sendOtpBtn, false);
  }
});

// Enter no OTP => validar
otpInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    validateOtpBtn.click();
  }
});

validateOtpBtn.addEventListener("click", async () => {
  const email = (emailInput.value || "").trim();
  const code  = (otpInput.value || "").trim();

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    showToast("Indica um código de 6 dígitos.", "warn");
    return;
  }

  setLoading(validateOtpBtn, true);
  try {
    const r = await callApi("validateOtp", { email, code });
    if (r.ok) {
      showToast("Autenticação confirmada. Bem-vindo!", "ok");
      // Redirecionar para a área de parceiros
      setTimeout(() => (window.location.href = "parceiros.html"), 600);
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
