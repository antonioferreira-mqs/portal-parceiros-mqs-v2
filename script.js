/**
 * script.js — Portal Parceiros MQS
 * Login com password + integração com auth.js
 * António Ferreira – 2025
 */

// === CONFIGURAÇÃO ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxlkCSYIkMtrac8HnHfTxxJbs_WhRynkkGBC2M2I-Z3bZVRMW7lf3MJOvFOM85jdlFICw/exec";

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

  if (!email) {
    showToast("Indique o seu e-mail.");
    return;
  }

  if (!password) {
    showToast("Introduza a sua password.");
    return;
  }

  if (password.length < 8) {
    showToast("A password deve ter pelo menos 8 caracteres.");
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
      const successMessage =
        data.message ||
        (data.status === "PASSWORD_CREATED"
          ? "Password criada com sucesso!"
          : "Login com sucesso!");
      showToast(successMessage, true);
      setSession(email); // guarda sessão local
      setTimeout(() => (window.location.href = "parceiros.html"), 1000);
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
