// ============  AUTH CORE (localStorage)  ============
const AUTH_KEY = "mqs_partner_session"; // chave única

export function setSession(email, ttlMs = 60 * 60 * 1000) { // 60min
  const payload = {
    email,
    createdAt: Date.now(),
    expiry: Date.now() + ttlMs,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.email || !data?.expiry) return null;
    if (Date.now() > data.expiry) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

export function requireAuth({ redirectTo = "index.html" } = {}) {
  const ses = getSession();
  if (!ses) {
    window.location.href = redirectTo;
    return null;
  }
  return ses;
}
