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

const toastsUnicosGlobalesActivos = new Set();

function mostrarToastUnico(mensaje, tipo = "success", duracion = 3500) {
  if (toastsUnicosGlobalesActivos.has(mensaje)) {
    return;
  }

  if (existeToastVisibleConMensaje(mensaje)) {
    toastsUnicosGlobalesActivos.add(mensaje);
    observarCierreToastUnico(mensaje);
    return;
  }

  toastsUnicosGlobalesActivos.add(mensaje);
  mostrarToast(mensaje, tipo, duracion);
  observarCierreToastUnico(mensaje);
}

function existeToastVisibleConMensaje(mensaje) {
  return Array.from(document.querySelectorAll(".toast .toast-message"))
    .some(elemento => elemento.textContent.trim() === mensaje);
}

function observarCierreToastUnico(mensaje) {
  const container = document.getElementById("toast-container");
  if (!container) {
    toastsUnicosGlobalesActivos.delete(mensaje);
    return;
  }

  const observer = new MutationObserver(() => {
    if (!existeToastVisibleConMensaje(mensaje)) {
      toastsUnicosGlobalesActivos.delete(mensaje);
      observer.disconnect();
    }
  });

  observer.observe(container, { childList: true });
}
