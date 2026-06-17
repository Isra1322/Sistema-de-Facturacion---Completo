export class ApiClient {
  static async fetch(url, options = {}) {
    if (typeof window.apiFetch === "function") {
      return await window.apiFetch(url, options);
    }
    
    // Fallback nativo
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const headers = {
      ...(options.headers || {}),
      "Authorization": `Bearer ${token}`
    };
    return await fetch(url, { ...options, headers });
  }
}
