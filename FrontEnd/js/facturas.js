const API_FACTURAS = "http://localhost:5161/api/Factura";
const TAMANIO_PAGINA = 6;
const TAMANIO_TODOS = 100000;

const dashboardLayout = document.getElementById("dashboardLayout");
const btnToggleSidebar = document.getElementById("btnToggleSidebar");

const usuarioNombreVista = document.getElementById("usuarioNombreVista");
const usuarioRolVista = document.getElementById("usuarioRolVista");

const totalFacturasResumen = document.getElementById("totalFacturasResumen");
const totalVentasResumen = document.getElementById("totalVentasResumen");
const ventasHoyResumen = document.getElementById("ventasHoyResumen");
const ultimaFacturaResumen = document.getElementById("ultimaFacturaResumen");
const facturasHoyResumen = document.getElementById("facturasHoyResumen");
const totalFacturasTexto = document.getElementById("totalFacturasTexto");

const buscarIdCliente = document.getElementById("buscarIdCliente");
const fechaDesde = document.getElementById("fechaDesde");
const fechaHasta = document.getElementById("fechaHasta");
const mensajeErrorFechas = document.getElementById("mensajeErrorFechas");

const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

const tablaFacturas = document.getElementById("tablaFacturas");
const textoResultados = document.getElementById("textoResultados");
const resultsCard = document.querySelector(".results-card");

const paginaActualTexto = document.getElementById("paginaActual");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const paginacionControles = btnAnterior ? btnAnterior.parentElement : null;

let paginaActual = 1;
let totalPaginas = 1;
let modoTodos = false;
let temporizadorFiltros = null;
let secuenciaCarga = 0;
const toastsUnicosActivos = new Set();

function inicializarPaginaFacturas() {
  if (usuarioNombreVista) {
    usuarioNombreVista.textContent = localStorage.getItem("nombre") || "Usuario";
  }

  if (usuarioRolVista) {
    usuarioRolVista.textContent = localStorage.getItem("rol") || "Rol";
  }

  if (existenElementosResumen()) {
    cargarResumen();
  }

  cargarFacturas();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarPaginaFacturas, { once: true });
} else {
  inicializarPaginaFacturas();
}

if (btnToggleSidebar && dashboardLayout) {
  btnToggleSidebar.addEventListener("click", () => {
    dashboardLayout.classList.toggle("sidebar-collapsed");
  });
}

function existenElementosResumen() {
  return totalFacturasResumen
    && totalVentasResumen
    && ventasHoyResumen
    && ultimaFacturaResumen
    && facturasHoyResumen;
}

async function cargarResumen() {
  try {
    const response = await apiFetch(`${API_FACTURAS}/resumen`);

    if (!response || !response.ok) {
      throw new Error("No se pudo cargar el resumen");
    }

    const data = await response.json();

    totalFacturasResumen.textContent = data.totalFacturas;
    totalVentasResumen.textContent = `$${Number(data.totalVentas).toFixed(2)}`;
    ventasHoyResumen.textContent = `$${Number(data.totalVentasHoy || 0).toFixed(2)}`;

    ultimaFacturaResumen.textContent = data.ultimaFactura
      ? `#${data.ultimaFactura.numeroFactura}`
      : "Ninguna";

    facturasHoyResumen.textContent = data.facturasHoy;

  } catch (error) {
    mostrarToast(error.message, "error");
  }
}

buscarIdCliente.addEventListener("input", programarFiltroAutomatico);
fechaDesde.addEventListener("change", aplicarFiltroAutomatico);
fechaHasta.addEventListener("change", aplicarFiltroAutomatico);

btnLimpiarFiltros.addEventListener("click", async () => {
  clearTimeout(temporizadorFiltros);

  buscarIdCliente.value = "";
  fechaDesde.value = "";
  fechaHasta.value = "";
  limpiarErrorFechas();

  paginaActual = 1;
  modoTodos = false;
  await cargarFacturas();

  mostrarToastUnico("Filtros limpiados correctamente", "info");
});

function mostrarToastUnico(mensaje, tipo = "success") {
  if (toastsUnicosActivos.has(mensaje)) {
    return;
  }

  if (existeToastVisibleConMensaje(mensaje)) {
    toastsUnicosActivos.add(mensaje);
    observarCierreToastUnico(mensaje);
    return;
  }

  toastsUnicosActivos.add(mensaje);
  mostrarToast(mensaje, tipo);
  observarCierreToastUnico(mensaje);
}

function existeToastVisibleConMensaje(mensaje) {
  return Array.from(document.querySelectorAll(".toast .toast-message"))
    .some(elemento => elemento.textContent.trim() === mensaje);
}

function observarCierreToastUnico(mensaje) {
  const toastMensaje = Array.from(document.querySelectorAll(".toast .toast-message"))
    .reverse()
    .find(elemento => elemento.textContent.trim() === mensaje);
  const toast = toastMensaje ? toastMensaje.closest(".toast") : null;

  if (!toast || !toast.parentElement) {
    liberarToastUnicoConEspera(mensaje);
    return;
  }

  const contenedor = toast.parentElement;
  const observer = new MutationObserver(() => {
    if (!contenedor.contains(toast)) {
      toastsUnicosActivos.delete(mensaje);
      observer.disconnect();
    }
  });

  observer.observe(contenedor, { childList: true });
  liberarToastUnicoConEspera(mensaje, observer, toast, contenedor);
}

function liberarToastUnicoConEspera(mensaje, observer = null, toast = null, contenedor = null) {
  setTimeout(() => {
    if (!toast || !contenedor || !contenedor.contains(toast)) {
      toastsUnicosActivos.delete(mensaje);
      if (observer) observer.disconnect();
    }
  }, 3900);
}

function programarFiltroAutomatico() {
  clearTimeout(temporizadorFiltros);
  temporizadorFiltros = setTimeout(aplicarFiltroAutomatico, 300);
}

async function aplicarFiltroAutomatico() {
  paginaActual = 1;
  modoTodos = false;

  if (!validarFechas()) {
    return;
  }

  await cargarFacturas();
}

function validarFechas() {
  const { desde, hasta } = obtenerFiltrosFacturas();

  if (desde && hasta && desde > hasta) {
    mostrarErrorFechas("La fecha desde no puede ser mayor que la fecha hasta.");
    return false;
  }

  limpiarErrorFechas();
  return true;
}

function mostrarErrorFechas(mensaje) {
  if (!mensajeErrorFechas) return;

  mensajeErrorFechas.textContent = mensaje;
  mensajeErrorFechas.classList.add("visible");
}

function limpiarErrorFechas() {
  if (!mensajeErrorFechas) return;

  mensajeErrorFechas.textContent = "";
  mensajeErrorFechas.classList.remove("visible");
}

async function cargarFacturas() {
  if (!validarFechas()) {
    return;
  }

  const secuenciaActual = ++secuenciaCarga;

  try {
    tablaFacturas.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Cargando facturas...</td>
      </tr>
    `;

    const { idCliente, desde, hasta } = obtenerFiltrosFacturas();

    let response;

    if (modoTodos) {
      response = await apiFetch(
        construirUrlBusqueda(idCliente, desde, hasta, 1, TAMANIO_TODOS)
      );
    } else {
      response = await apiFetch(
        construirUrlBusqueda(idCliente, desde, hasta, paginaActual, TAMANIO_PAGINA)
      );
    }

    if (secuenciaActual !== secuenciaCarga) return;

    if (!response || !response.ok) {
      throw new Error("No se pudieron cargar las facturas");
    }

    const data = await response.json();

    totalPaginas = modoTodos
      ? Math.max(1, Math.ceil((data.totalRegistros || data.datos?.length || 0) / TAMANIO_PAGINA))
      : Math.max(1, data.totalPaginas || Math.ceil((data.totalRegistros || 0) / TAMANIO_PAGINA));

    if (!modoTodos && paginaActual > totalPaginas) {
      paginaActual = totalPaginas;
      await cargarFacturas();
      return;
    }

    renderFacturas(data.datos || []);
    actualizarPaginacion();

    if (totalFacturasTexto) {
      totalFacturasTexto.textContent = `${data.totalRegistros} registradas`;
    }

  } catch (error) {
    if (secuenciaActual !== secuenciaCarga) return;

    tablaFacturas.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Error al cargar facturas</td>
      </tr>
    `;

    mostrarToast(error.message, "error");
  }
}

function construirUrlBusqueda(idCliente, desde, hasta, pagina, tamanioPagina) {
  const params = new URLSearchParams();

  if (idCliente) params.append("idCliente", idCliente);
  if (desde) params.append("fechaDesde", desde);
  if (hasta) params.append("fechaHasta", hasta);

  params.append("pagina", pagina);
  params.append("tamanioPagina", tamanioPagina);

  return `${API_FACTURAS}/buscar?${params.toString()}`;
}

function obtenerFiltrosFacturas() {
  const idCliente = normalizarIdCliente(buscarIdCliente.value);
  const desde = normalizarFecha(fechaDesde.value);
  const hasta = normalizarFecha(fechaHasta.value);

  return { idCliente, desde, hasta };
}

function normalizarIdCliente(valor) {
  const idCliente = String(valor || "").trim();

  return /^\d+$/.test(idCliente) && Number(idCliente) > 0
    ? idCliente
    : "";
}

function normalizarFecha(valor) {
  const fecha = String(valor || "").trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ? fecha
    : "";
}

function renderFacturas(facturas) {
  tablaFacturas.innerHTML = "";

  if (facturas.length === 0) {
    tablaFacturas.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No se encontraron facturas</td>
      </tr>
    `;
    return;
  }

  facturas.forEach(factura => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td class="factura-numero">#${factura.numeroFactura}</td>
      <td>${formatearFecha(factura.fecha)}</td>
      <td>${factura.idCliente}</td>
      <td>${factura.cliente}</td>
      <td class="factura-total">$${Number(factura.total).toFixed(2)}</td>
      <td>
        <div class="actions">
          <button 
            class="btn-view"
            onclick="verFactura(${factura.numeroFactura})"
            title="Ver factura">
            👁 Ver
          </button>

          <button 
            class="btn-print"
            onclick="imprimirFactura(${factura.numeroFactura})"
            title="Imprimir PDF">
            🖨 Imprimir
          </button>
        </div>
      </td>
    `;

    tablaFacturas.appendChild(fila);
  });
}

if (paginacionControles) {
  paginacionControles.addEventListener("click", async (e) => {
    const boton = e.target.closest("button[data-page-action]");
    if (!boton || boton.disabled) return;

    const accion = boton.dataset.pageAction;

    if (accion === "prev" && paginaActual > 1) {
      modoTodos = false;
      paginaActual--;
      await cargarFacturas();
      return;
    }

    if (accion === "next" && paginaActual < totalPaginas) {
      modoTodos = false;
      paginaActual++;
      await cargarFacturas();
      return;
    }

    if (accion === "all") {
      modoTodos = true;
      paginaActual = 1;
      await cargarFacturas();
      return;
    }

    if (accion === "page") {
      const pagina = Number(boton.dataset.page);

      if (!Number.isNaN(pagina)) {
        modoTodos = false;
        paginaActual = pagina;
        await cargarFacturas();
      }
    }
  });
}

function actualizarPaginacion() {
  if (resultsCard) {
    resultsCard.classList.toggle("modo-todos", modoTodos);
  }

  if (paginaActualTexto) {
    paginaActualTexto.textContent = String(paginaActual);
  }

  window.renderizarPaginacionNumerica({
    contenedor: paginacionControles,
    textoElemento: textoResultados,
    paginaActual,
    totalPaginas,
    modoTodos
  });

  if (modoTodos && textoResultados) {
    textoResultados.textContent = "Mostrando todas las facturas";
  }
}

window.verFactura = function(numeroFactura) {
  window.location.href = `./ver-factura.html?numero=${numeroFactura}`;
};

window.imprimirFactura = async function(numeroFactura) {
  try {
    const response = await apiFetch(`${API_FACTURAS}/pdf/${numeroFactura}`);

    if (!response || !response.ok) {
      throw new Error("No se pudo generar el PDF");
    }

    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);

    window.open(pdfUrl, "_blank");

  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}
