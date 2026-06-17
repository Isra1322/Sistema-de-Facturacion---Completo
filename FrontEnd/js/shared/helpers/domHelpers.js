/**
 * DOM Helper utilities
 */

/**
 * Escapes special HTML characters to prevent XSS
 * @param {string} val 
 * @returns {string}
 */
export function escaparHtml(val) {
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Highlights a search query inside a text string by wrapping matches in <span class="highlight-match">
 * @param {string} texto 
 * @param {string} query 
 * @returns {string}
 */
export function resaltarCoincidencia(texto, query) {
  const textoOriginal = String(texto || "");
  if (!query) return escaparHtml(textoOriginal);

  const valorNormalizado = query.toLocaleLowerCase("es-EC");
  const textoNormalizado = textoOriginal.toLocaleLowerCase("es-EC");
  const longitudValor = query.length;
  let indice = textoNormalizado.indexOf(valorNormalizado);
  let posicionActual = 0;
  let textoResaltado = "";

  if (indice === -1) {
    return escaparHtml(textoOriginal);
  }

  while (indice !== -1) {
    textoResaltado += escaparHtml(textoOriginal.slice(posicionActual, indice));
    textoResaltado += `<span class="highlight-match">${escaparHtml(textoOriginal.slice(indice, indice + longitudValor))}</span>`;
    posicionActual = indice + longitudValor;
    indice = textoNormalizado.indexOf(valorNormalizado, posicionActual);
  }

  return textoResaltado + escaparHtml(textoOriginal.slice(posicionActual));
}

/**
 * Displays a beautiful custom confirm modal
 * @param {string} titulo 
 * @param {string} mensaje 
 * @returns {Promise<boolean>}
 */
export function mostrarConfirmacion(titulo, mensaje) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalConfirmacion");
    const confirmTitulo = document.getElementById("confirmTitulo");
    const confirmMensaje = document.getElementById("confirmMensaje");
    const btnCancelar = document.getElementById("btnCancelarConfirmacion");
    const btnAceptar = document.getElementById("btnAceptarConfirmacion");

    if (!modal || !confirmTitulo || !confirmMensaje || !btnCancelar || !btnAceptar) {
      resolve(confirm(mensaje));
      return;
    }

    confirmTitulo.textContent = titulo;
    confirmMensaje.textContent = mensaje;

    modal.classList.remove("oculto");

    const onCancelar = () => {
      cleanup();
      resolve(false);
    };

    const onAceptar = () => {
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      modal.classList.add("oculto");
      btnCancelar.removeEventListener("click", onCancelar);
      btnAceptar.removeEventListener("click", onAceptar);
    };

    btnCancelar.addEventListener("click", onCancelar);
    btnAceptar.addEventListener("click", onAceptar);
  });
}
