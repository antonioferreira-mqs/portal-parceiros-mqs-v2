/**
 * script.js — Portal Parceiros MQS
 * Login com password + integração com auth.js
 * António Ferreira – 2025
 */

// === CONFIGURAÇÃO ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbymt_l6kczmHB8gcTpMUd9-OyF0rHvyc_c73dUdKVC9nZLA_M8zG_lt7SH00qsBTzQ7jQ/exec";

// === ELEMENTOS ===
const form = document.getElementById("loginForm");
const toast = document.getElementById("toast");

// === FUNÇÃO: Mostrar mensagens ===
function showToast(msg, success = false) {
  toast.textContent = msg;
  toast.style.background = success ? "#28a745" : "#d9534f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
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
      // primeiro login — pedir criação de password
      showToast("Primeiro acesso. Por favor defina uma password.", true);
      setTimeout(() => {
        window.location.href = `reset.html?token=FIRST-${btoa(email)}`;
      }, 1500);
    } else {
      showToast(data.message || "Falha no login.");
    }
  } catch (err) {
    showToast("Erro ao comunicar com o servidor.");
  }
});

// === FUNÇÃO: Link de recuperação de password ===
document.getElementById("forgotLink").addEventListener("click", () => {
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
