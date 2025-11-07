/**
 * script.js — Portal Parceiros MQS
 * Login com password + integração com auth.js
 * António Ferreira – 2025
 */

// === CONFIGURAÇÃO ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbylru1rRon1qq1FeNyWWju7rhHcmo4-Vs6XqRxooyzOjQW5saqdU0Za4jOUBfD5cc08rg/exec";

// === ELEMENTOS ===
const form = document.getElementById("loginForm");
const toast = document.getElementById("toast");
const submitButton = form.querySelector("button[type='submit']");

// === FUNÇÃO: Mostrar mensagens ===
function showToast(msg, success = false) {
  toast.textContent = msg;
  toast.style.background = success ? "#28a745" : "#d9534f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Aguarde..." : "Entrar";
}

// === FUNÇÃO: Submeter login ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showToast("Por favor, preencha todos os campos.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });

    const data = await res.json();

    // === Respostas possíveis ===
    if (data.ok) {
      showToast("Login com sucesso!", true);
      setSession(email); // guarda sessão local
      setTimeout(() => (window.location.href = "parceiros.html"), 1000);
    } else if (data.status === "NO_PASSWORD") {
      // Primeiro acesso — encaminhar utilizador para recuperação manual
      sessionStorage.setItem("mqs_pending_email", email);
      showToast(
        "Primeiro acesso detetado. Irá ser redirecionado para definir a password.",
        true
      );
      setTimeout(() => (window.location.href = "reset.html?from=first-access"), 1500);
    } else {
      showToast(data.message || "Falha no login.");
    }
  } catch (err) {
    showToast("Erro ao comunicar com o servidor.");
  } finally {
    setLoading(false);
  }
});

// === FUNÇÃO: Link de recuperação de password ===
document.getElementById("forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  if (email) {
    sessionStorage.setItem("mqs_pending_email", email);
  }
  window.location.href = "reset.html";
});

// === FUNÇÕES DE SESSÃO (compatíveis com auth.js) ===
function setSession(email) {
  const sessionData = {
    email,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("mqs_session", JSON.stringify(sessionData));
}
