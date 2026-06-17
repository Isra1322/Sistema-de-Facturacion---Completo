function mostrarToast(mensaje, tipo = "success", duracion = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-message">${mensaje}</div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    </div>
  `;

  container.appendChild(toast);

  const cerrar = () => {
    toast.style.animation = "toastOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".toast-close").addEventListener("click", cerrar);

  setTimeout(cerrar, duracion);
}