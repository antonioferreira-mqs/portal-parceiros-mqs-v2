// === CONFIGURAÇÃO ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx3VXG71YwMF2-B7zvs0jtTS_vyhcuw7P6HfTvzbTaMLNvOVQUxSZ9l0rW9qXxtC1703A/exec";

// === HELPERS ===
const toast = document.getElementById("toast");

function showToast(msg, type = "ok") {
  toast.textContent = msg;
  toast.style.background = type === "ok" ? "#1C7C54" : "#d9534f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}

// === LOGIN HANDLER ===
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.getElementById("btnLogin");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showToast("Preenche todos os campos.", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "A entrar...";

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email,
        password
      })
    });

    const data = await res.json();

    if (data.ok) {
      showToast("Login efetuado com sucesso!", "ok");

      // ✅ Exemplo: redirecionar após login
      setTimeout(() => {
        window.location.href = "parceiros.html";
      }, 1500);

    } else {
      showToast(data.message || "Credenciais inválidas.", "error");
    }

  } catch (err) {
    console.error(err);
    showToast("Erro de ligação. Tenta novamente.", "error");
  }

  btn.disabled = false;
  btn.textContent = "Entrar";
});
