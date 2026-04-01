const SESSION_KEY = "inventario.session";

function getStoredSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(authResponse) {
  const expiresAt = Date.now() + Number(authResponse?.expiresInMs ?? 0);
  const session = {
    token: authResponse?.token,
    email: authResponse?.email,
    rol: authResponse?.rol,
    type: authResponse?.type ?? "Bearer",
    expiresInMs: authResponse?.expiresInMs,
    expiresAt,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  const session = getStoredSession();
  if (!session || isTokenExpired(session)) {
    clearSession();
    return null;
  }

  return session;
}

export function getToken() {
  return getSession()?.token ?? null;
}

export function getRol() {
  return getSession()?.rol ?? null;
}

export function isAdmin() {
  return getRol() === "ADMIN";
}

export function isAuthenticated() {
  return Boolean(getSession()?.token);
}

export function isTokenExpired(session = getStoredSession()) {
  if (!session?.expiresAt) {
    return true;
  }

  return Date.now() >= session.expiresAt;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function redirectToLogin() {
  if (!window.location.pathname.endsWith("login.html")) {
    window.location.href = "./login.html";
  }
}

export function logout() {
  clearSession();
  redirectToLogin();
}

export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = "./index.html";
  }
}

export function requireAuth() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return false;
  }

  return true;
}

export function requireAdmin() {
  if (!requireAuth()) {
    return false;
  }

  if (!isAdmin()) {
    window.location.href = "./index.html?error=forbidden";
    return false;
  }

  return true;
}