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

  // Permite enviar com Enter
  emailInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendButton.click();
    }
  });

  // Ação do botão
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
      } else {
        showToast(result.message || "Erro ao enviar o código.", "error");
      }

    } catch (error) {
      console.error("Erro de ligação ao servidor:", error);
      showToast("Erro de ligação ao servidor.", "error");
    }
  });
});
