// ====== CONFIG ======
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbx09NFICUUQGva7euQ7I4KzJp3AdnEeBJBBEd_ZklmIxp2t_RHdXnSuBPF2zT9hxg_B/exec"; // <- confirme o seu URL

// ====== UI helpers ======
const toastEl = document.getElementById("toast");
function showToast(msg, type = "ok") {
  toastEl.textContent = msg;
  toastEl.className = type ? type : "ok";
  toastEl.style.display = "block";
  // mantém visível mais tempo quando é erro de rede
  const ms = type === "error" ? 5000 : 3500;
  setTimeout(() => (toastEl.style.display = "none"), ms);
}

function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = !!isLoading;
  btn.setAttribute("aria-busy", String(!!isLoading));
}

// ====== Networking com timeout/abort ======
async function callApi(action, payload, { timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      // text/plain evita preflight e costuma contornar restrições de CORS
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
      cache: "no-store",
      mode: "cors",
      redirect: "follow",
      signal: controller.signal,
    });

    // Se o servidor está de pé mas respondeu com erro HTTP,
    // tentamos ler o corpo para ajudar no diagnóstico.
    if (!res.ok) {
      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch {}
      throw new Error(`HTTP ${res.status}${bodyText ? " – " + bodyText : ""}`);
    }

    // Apps Script devolve JSON
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ====== App ======
const emailInput = document.getElementById("emailInput");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");
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

    if (r?.ok) {
      showToast("Código enviado para o e-mail.", "ok");
      otpSection.classList.remove("hidden");
      otpInput.focus();
    } else if (r?.code === "UNAUTHORIZED") {
      showToast("Email não autorizado para aceder ao portal.", "warn");
      otpSection.classList.add("hidden");
    } else {
      showToast(r?.message || "Não foi possível enviar o código.", "warn");
      otpSection.classList.add("hidden");
    }
  } catch (err) {
    // Estes casos apanham bloqueios/antivírus/timeout
    if (err.name === "AbortError") {
      showToast(
        "Sem resposta do servidor. Verifica a Internet ou uma extensão de segurança.",
        "error"
      );
    } else {
      // Alguns antivírus (ex.: Kaspersky) “suspendem” o pedido.
      showToast(
        "Falha de ligação. Se tiver Kaspersky/antivírus, adicione este site à lista de confiança.",
        "error"
      );
      console.error("Erro no fetch:", err);
    }
  } finally {
    // GARANTE que o botão volta SEMPRE
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
  const code = (otpInput.value || "").trim();

  if (!code || code.length !== 6) {
    showToast("Indica um código de 6 dígitos.", "warn");
    return;
  }

  setLoading(validateOtpBtn, true);

  try {
    const r = await callApi("validateOtp", { email, code });

    if (r?.ok) {
      showToast("Autenticação confirmada. A entrar…", "ok");
      // Exemplo de prosseguimento
      window.location.href = "parceiros.html";
    } else {
      showToast(r?.message || "Código inválido ou expirado.", "warn");
    }
  } catch (err) {
    if (err.name === "AbortError") {
      showToast(
        "Sem resposta do servidor. Verifica a Internet ou uma extensão de segurança.",
        "error"
      );
    } else {
      showToast(
        "Falha de ligação. Se tiver Kaspersky/antivírus, adicione este site à lista de confiança.",
        "error"
      );
      console.error("Erro no fetch:", err);
    }
  } finally {
    setLoading(validateOtpBtn, false);
  }
});
