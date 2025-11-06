// ====== CONFIG ======
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbx09NFICUUQGva7euQ7I4KzJp3AdnEeBJBBEd_ZklmIxp2t_RHdXnSuBPF2zT9hxg_B/exec";

// ====== UI helpers ======
const toastEl = document.getElementById("toast");
function showToast(msg, type = "ok") {
  toastEl.textContent = msg;
  toastEl.className = `toast ${type}`;
  toastEl.style.display = "block";
  // torna o toast “auto-dismiss”
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toastEl.style.display = "none"), 4000);
}

function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = !!isLoading;
  btn.setAttribute("aria-busy", String(!!isLoading));
}

// ====== API ======
// Evita preflight CORS (usa text/plain). Timeout robusto para não “travar” o botão.
async function callApi(action, payload, { timeoutMs = 10000 } = {}) {
  const body = JSON.stringify({ action, ...payload });

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
      signal: ctrl.signal,
      // Não enviamos cookies nem credenciais
      credentials: "omit",
      cache: "no-store",
      redirect: "follow"
    });

    // Quando um antivírus bloqueia, às vezes o fetch resolve mas sem corpo válido.
    // Se status não for 200, tentamos ler o texto para diagnóstico.
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} – ${txt || "sem detalhe"}`);
    }

    // Apps Script devolve JSON em doPost
    return await res.json();
  } catch (err) {
    // Uniformiza mensagens de bloqueio por antivírus/proxy
    const msg = String(err && err.message ? err.message : err);

    if (
      /IO_SUSPENDED|ERR_NETWORK_IO_SUSPENDED|ERR_BLOCKED_BY_CLIENT|ERR_FAILED/i.test(
        msg
      ) ||
      /network.*changed/i.test(msg)
    ) {
      const advice =
        "Falha de ligação. Se tiver Kaspersky/antivírus, adicione este site e script.google.com à lista de confiança.";
      const e = new Error(advice);
      e._isAvBlock = true;
      throw e;
    }

    if (/AbortError/i.test(msg)) {
      const e = new Error("Tempo de espera esgotado. Tente novamente.");
      e._isTimeout = true;
      throw e;
    }

    throw err;
  } finally {
    clearTimeout(t);
  }
}

// ====== App ======
const emailInput     = document.getElementById("emailInput");
const sendOtpBtn     = document.getElementById("sendOtpBtn");
const otpSection     = document.getElementById("otpSection");
const otpInput       = document.getElementById("otpInput");
const validateOtpBtn = document.getElementById("validateOtpBtn");

// Enter no e-mail => clicar no botão
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

    if (r && r.ok) {
      showToast("Código enviado para o e-mail.", "ok");
      otpSection.classList.remove("hidden");
      otpInput.value = "";
      // Foco no campo OTP para o utilizador introduzir logo o código
      setTimeout(() => otpInput.focus(), 50);
    } else if (r && r.code === "UNAUTHORIZED") {
      otpSection.classList.add("hidden");
      showToast("Email não autorizado para aceder ao portal.", "warn");
    } else {
      otpSection.classList.add("hidden");
      showToast(r?.message || "Não foi possível enviar o código.", "warn");
    }
  } catch (err) {
    console.error("Erro no fetch:", err);
    showToast(err?._isAvBlock ? err.message : "Falha de ligação. Verifica a Internet.", "error");
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

    if (r && r.ok) {
      showToast("Autenticação confirmada. A entrar…", "ok");
      // Aqui podes guardar sessão e redirecionar
      // window.location.href = "parceiros.html";
    } else {
      showToast(r?.message || "Código inválido ou expirado.", "warn");
    }
  } catch (err) {
    console.error("Erro no fetch:", err);
    showToast(err?._isAvBlock ? err.message : "Falha de ligação. Verifica a Internet.", "error");
  } finally {
    setLoading(validateOtpBtn, false);
  }
});
