/**
 * auth.js — Gestão de sessão e proteção de páginas privadas
 * Portal Parceiros MQS
 * António Ferreira – 2025
 */

// === Verificação automática de sessão ===
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const session = JSON.parse(localStorage.getItem("mqs_session") || "null");

  // 🔒 Bloqueia acesso à área privada se não estiver autenticado
  if (currentPage === "parceiros.html" && !session) {
    window.location.href = "index.html";
    return;
  }

  // 🔐 Evita voltar à página de login se já estiver autenticado
  if (currentPage === "index.html" && session) {
    window.location.href = "parceiros.html";
    return;
  }

  // 👤 Atualiza nome do utilizador (se houver placeholder)
  if (session && document.getElementById("userEmail")) {
    document.getElementById("userEmail").textContent = session.email;
  }

  // 🔘 Liga o botão de logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});

// === Guardar sessão após login ===
function setSession(email) {
  const sessionData = {
    email,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("mqs_session", JSON.stringify(sessionData));
}

// === Eliminar sessão (logout) ===
function logout() {
  localStorage.removeItem("mqs_session");
  window.location.href = "index.html";
}

// === Mostrar notificações (toast) ===
function showToast(msg, success = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.background = success ? "#28a745" : "#d9534f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
