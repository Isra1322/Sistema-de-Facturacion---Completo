function obtenerToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

async function apiFetch(url, options = {}) {
  const token = obtenerToken();

  const headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    if (typeof cerrarSesion === "function") {
      cerrarSesion();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      localStorage.removeItem("nombre");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("rol");
      sessionStorage.removeItem("nombre");
      window.location.href = "../pages/login.html";
    }

    return;
  }

  return response;
}
