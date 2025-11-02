// ===== CONFIGURAÇÃO =====
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzBKjVRYWf1SLT8UfTKFEO-KAS1J5mezMiAFZ5TTZpykH4Cb1nV-6lbPQ_91sApniTpwg/exec";

// ===== TOAST =====
function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `show ${type}`;
  setTimeout(() => (toast.className = toast.className.replace("show", "").trim()), 3500);
}

// ===== READY =====
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const sendBtn = document.getElementById("sendOtpBtn");

  // Enviar com ENTER
  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Clique do botão
  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Por favor, insere o teu e-mail profissional.", "error");
      return;
    }

    try {
      sendBtn.disabled = true;
      showToast("A enviar código de acesso...", "info");

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "sendOtp", email })
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { success: false, message: text }; }

      if (data.success) {
        showToast("Código enviado para o e-mail.", "ok");
        // document.getElementById("otpSection").classList.remove("hidden");
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
});
