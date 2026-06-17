const API_CLIENTES = "http://localhost:5161/api/Cliente/buscar";
const API_CLIENTES_BASE = "http://localhost:5161/api/Cliente";
const API_PRODUCTOS = "http://localhost:5161/api/Producto/buscar";
const API_PRODUCTOS_BASE = "http://localhost:5161/api/Producto";
const API_FACTURA = "http://localhost:5161/api/Factura";

const dashboardLayout = document.getElementById("dashboardLayout");
const btnToggleSidebar = document.getElementById("btnToggleSidebar");

const usuarioNombreVista = document.getElementById("usuarioNombreVista");
const usuarioRolVista = document.getElementById("usuarioRolVista");
const fechaActualFactura = document.getElementById("fechaActualFactura");
const horaActualFactura = document.getElementById("horaActualFactura");

const buscarClienteInput = document.getElementById("buscarCliente");
const clienteSeleccionadoTexto = document.getElementById("clienteSeleccionadoTexto");
const clienteSeleccionadoBody = document.getElementById("clienteSeleccionadoBody");

const btnAbrirBusquedaCliente = document.getElementById("btnAbrirBusquedaCliente");
const modalBusquedaClientesFactura = document.getElementById("modalBusquedaClientesFactura");
const btnCerrarBusquedaClienteFactura = document.getElementById("btnCerrarBusquedaClienteFactura");
const filtroClienteFactura = document.getElementById("filtroClienteFactura");
const valorBusquedaClienteFactura = document.getElementById("valorBusquedaClienteFactura");
const resultadosBusquedaClientesFacturaBody = document.getElementById("resultadosBusquedaClientesFacturaBody");
const clientesFacturaTotalTexto = document.getElementById("clientesFacturaTotalTexto");
const paginaClientesFacturaTexto = document.getElementById("paginaClientesFacturaTexto");
const paginacionClientesFacturaControles = document.getElementById("paginacionClientesFacturaControles");
const btnAnteriorClientesFactura = document.getElementById("btnAnteriorClientesFactura");
const btnSiguienteClientesFactura = document.getElementById("btnSiguienteClientesFactura");

const btnAbrirRegistroClienteFactura = document.getElementById("btnAbrirRegistroClienteFactura");
const modalRegistroClienteFactura = document.getElementById("modalRegistroClienteFactura");
const btnCerrarRegistroClienteFactura = document.getElementById("btnCerrarRegistroClienteFactura");
const formRegistroClienteFactura = document.getElementById("formRegistroClienteFactura");
const registroClienteNombreFactura = document.getElementById("registroClienteNombreFactura");
const registroClienteApellidoFactura = document.getElementById("registroClienteApellidoFactura");
const registroClienteTelefonoFactura = document.getElementById("registroClienteTelefonoFactura");
const registroClienteCorreoFactura = document.getElementById("registroClienteCorreoFactura");
const registroClienteDireccionFactura = document.getElementById("registroClienteDireccionFactura");
const btnGuardarRegistroClienteFactura = document.getElementById("btnGuardarRegistroClienteFactura");

const btnAbrirBusquedaProducto = document.getElementById("btnAbrirBusquedaProducto");
const modalBusquedaProductosFactura = document.getElementById("modalBusquedaProductosFactura");
const btnCerrarBusquedaProductoFactura = document.getElementById("btnCerrarBusquedaProductoFactura");
const filtroProductoFactura = document.getElementById("filtroProductoFactura");
const valorBusquedaProductoFactura = document.getElementById("valorBusquedaProductoFactura");
const resultadosBusquedaProductosFacturaBody = document.getElementById("resultadosBusquedaProductosFacturaBody");
const productosFacturaTotalTexto = document.getElementById("productosFacturaTotalTexto");
const paginaProductosFacturaTexto = document.getElementById("paginaProductosFacturaTexto");
const paginacionProductosFacturaControles = document.getElementById("paginacionProductosFacturaControles");
const btnAnteriorProductosFactura = document.getElementById("btnAnteriorProductosFactura");
const btnSiguienteProductosFactura = document.getElementById("btnSiguienteProductosFactura");

const buscarProductoInput = document.getElementById("buscarProducto");
const productoNombre = document.getElementById("productoNombre");
const productoPrecio = document.getElementById("productoPrecio");
const productoStock = document.getElementById("productoStock");
const productoIva = document.getElementById("productoIva");
const cantidadProductoInput = document.getElementById("cantidadProducto");
const btnRestarCantidad = document.getElementById("btnRestarCantidad");
const btnSumarCantidad = document.getElementById("btnSumarCantidad");
const btnAgregarProducto = document.getElementById("btnAgregarProducto");

const btnGuardarFactura = document.getElementById("btnGuardarFactura");
const btnCancelarFactura = document.getElementById("btnCancelarFactura");
const detalleFacturaBody = document.getElementById("detalleFacturaBody");
const subtotalFacturaTexto = document.getElementById("subtotalFactura");
const ivaFacturaTexto = document.getElementById("ivaFactura");
const totalFacturaTexto = document.getElementById("totalFactura");

let clienteSeleccionado = null;
let productoSeleccionado = null;
let productoSeleccionadoDesdeDetalleId = null;
let detalleFactura = [];
let clientesFacturaTodos = [];
let clientesFacturaFiltrados = [];
let paginaClientesFactura = 1;
const CLIENTES_FACTURA_POR_PAGINA = 5;
const LONGITUD_MAXIMA_NOMBRE_APELLIDO_FACTURA = 20;
let modoTodosClientesFactura = false;
const toastsUnicosActivos = new Set();
let productosFacturaDisponibles = [];
let productosFacturaFiltrados = [];
let paginaProductosFactura = 1;
const PRODUCTOS_FACTURA_POR_PAGINA = 5;
let modoTodosProductosFactura = false;

document.addEventListener("DOMContentLoaded", () => {
  usuarioNombreVista.textContent = localStorage.getItem("nombre") || "Usuario";
  usuarioRolVista.textContent = localStorage.getItem("rol") || "Rol";

  inicializarTemaFactura();
  iniciarFechaHoraFactura();
  renderClienteSeleccionado();
  renderProductoSeleccionado();
  renderDetalleFactura();
});

function inicializarTemaFactura() {
  const botonTema = document.getElementById("btnToggleTheme");

  if (!botonTema || botonTema.dataset.themeReady === "true") return;

  const aplicarTema = (tema) => {
    document.body.classList.toggle("dark-mode", tema === "dark");
  };

  const esTemaOscuro = () => document.body.classList.contains("dark-mode");

  const actualizarBoton = () => {
    botonTema.textContent = esTemaOscuro() ? "\u2600\uFE0F" : "\uD83C\uDF19";
    botonTema.setAttribute(
      "aria-label",
      esTemaOscuro() ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
    botonTema.title = esTemaOscuro() ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  };

  aplicarTema(localStorage.getItem("theme"));
  actualizarBoton();

  botonTema.dataset.themeReady = "true";
  botonTema.addEventListener("click", () => {
    const siguienteTema = esTemaOscuro() ? "light" : "dark";

    aplicarTema(siguienteTema);
    localStorage.setItem("theme", siguienteTema);
    actualizarBoton();
  });
}

function iniciarFechaHoraFactura() {
  actualizarFechaHoraFactura();
  setInterval(actualizarFechaHoraFactura, 1000);
}

function actualizarFechaHoraFactura() {
  if (!fechaActualFactura || !horaActualFactura) return;

  const ahora = new Date();

  fechaActualFactura.textContent = ahora.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  horaActualFactura.textContent = ahora.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

btnToggleSidebar.addEventListener("click", () => {
  dashboardLayout.classList.toggle("sidebar-collapsed");
});

/* =========================
   CLIENTES
========================= */

btnAbrirBusquedaCliente.addEventListener("click", async () => {
  if (btnAbrirBusquedaCliente.disabled) return;
  await abrirBusquedaClienteFactura();
});

async function abrirBusquedaClienteFactura() {
  modalBusquedaClientesFactura.classList.remove("oculto");
  filtroClienteFactura.value = "nombre";
  valorBusquedaClienteFactura.value = "";
  modoTodosClientesFactura = false;
  paginaClientesFactura = 1;
  actualizarPlaceholderBusquedaCliente();
  await cargarClientesModalFactura();
  valorBusquedaClienteFactura.focus();
}

btnCerrarBusquedaClienteFactura.addEventListener("click", () => {
  modalBusquedaClientesFactura.classList.add("oculto");
});

filtroClienteFactura.addEventListener("change", () => {
  valorBusquedaClienteFactura.value = "";
  actualizarPlaceholderBusquedaCliente();
  aplicarFiltroClientesFactura();
  valorBusquedaClienteFactura.focus();
});

valorBusquedaClienteFactura.addEventListener("keydown", bloquearCaracterBusquedaCliente);
valorBusquedaClienteFactura.addEventListener("input", () => {
  sanitizarValorBusquedaCliente();
  buscarClientesFactura();
});

btnAbrirRegistroClienteFactura.addEventListener("click", abrirRegistroClienteFactura);
btnCerrarRegistroClienteFactura.addEventListener("click", cerrarRegistroClienteFactura);

registroClienteNombreFactura.addEventListener("input", validarNombreApellidoRegistroFactura);
registroClienteApellidoFactura.addEventListener("input", validarNombreApellidoRegistroFactura);
registroClienteTelefonoFactura.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
});

formRegistroClienteFactura.addEventListener("submit", guardarClienteDesdeFactura);

if (paginacionClientesFacturaControles) {
  paginacionClientesFacturaControles.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-page-action]");
    if (!boton || boton.disabled) return;

    const accion = boton.dataset.pageAction;

    if (accion === "prev" && paginaClientesFactura > 1) {
      modoTodosClientesFactura = false;
      paginaClientesFactura--;
      renderClientesFacturaPaginados();
      return;
    }

    if (accion === "next" && paginaClientesFactura < obtenerTotalPaginasClientesFactura()) {
      modoTodosClientesFactura = false;
      paginaClientesFactura++;
      renderClientesFacturaPaginados();
      return;
    }

    if (accion === "all") {
      modoTodosClientesFactura = true;
      paginaClientesFactura = 1;
      renderClientesFacturaPaginados();
      return;
    }

    if (accion === "page") {
      const pagina = Number(boton.dataset.page);

      if (!Number.isNaN(pagina)) {
        modoTodosClientesFactura = false;
        paginaClientesFactura = pagina;
        renderClientesFacturaPaginados();
      }
    }
  });
}

function abrirRegistroClienteFactura() {
  limpiarRegistroClienteFactura();
  modalRegistroClienteFactura.classList.remove("oculto");
  registroClienteNombreFactura.focus();
}

function cerrarRegistroClienteFactura() {
  modalRegistroClienteFactura.classList.add("oculto");
  limpiarRegistroClienteFactura();
}

function limpiarRegistroClienteFactura() {
  formRegistroClienteFactura.reset();
  btnGuardarRegistroClienteFactura.disabled = false;
  btnGuardarRegistroClienteFactura.textContent = "Guardar Cliente";
}

function validarNombreApellidoRegistroFactura(event) {
  event.target.value = normalizarNombreApellidoRegistroFactura(event.target.value);
}

function normalizarNombreApellidoRegistroFactura(valor) {
  const textoSinEspacios = valor
    .replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "")
    .replace(/\s+/g, "")
    .slice(0, LONGITUD_MAXIMA_NOMBRE_APELLIDO_FACTURA);

  if (!textoSinEspacios) {
    return "";
  }

  return textoSinEspacios.charAt(0).toUpperCase() + textoSinEspacios.slice(1);
}

async function guardarClienteDesdeFactura(event) {
  event.preventDefault();

  const cliente = {
    nombre: normalizarNombreApellidoRegistroFactura(registroClienteNombreFactura.value),
    apellido: normalizarNombreApellidoRegistroFactura(registroClienteApellidoFactura.value),
    direccion: registroClienteDireccionFactura.value.trim(),
    telefono: registroClienteTelefonoFactura.value.trim(),
    correo: registroClienteCorreoFactura.value.trim()
  };

  registroClienteNombreFactura.value = cliente.nombre;
  registroClienteApellidoFactura.value = cliente.apellido;

  if (!cliente.nombre || !cliente.apellido || !cliente.direccion || !cliente.telefono || !cliente.correo) {
    mostrarToast("Todos los campos son obligatorios", "warning");
    return;
  }

  if (!/^09\d{8}$/.test(cliente.telefono)) {
    mostrarToast("El tel\u00e9fono debe iniciar con 09 y tener 10 d\u00edgitos", "warning");
    return;
  }

  try {
    btnGuardarRegistroClienteFactura.disabled = true;
    btnGuardarRegistroClienteFactura.textContent = "Guardando...";

    const response = await apiFetch(API_CLIENTES_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cliente)
    });

    if (!response || !response.ok) {
      const mensaje = await obtenerMensajeErrorClienteFactura(response);
      throw new Error(mensaje || "No se pudo guardar el cliente");
    }

    const data = await obtenerJsonSeguroFactura(response);
    const clienteCreado = await resolverClienteCreadoFactura(data, cliente);

    modalRegistroClienteFactura.classList.add("oculto");
    limpiarRegistroClienteFactura();
    registrarClienteEnCacheFactura(clienteCreado);
    seleccionarCliente(clienteCreado);
    mostrarToast("Cliente registrado correctamente", "success");

  } catch (error) {
    btnGuardarRegistroClienteFactura.disabled = false;
    btnGuardarRegistroClienteFactura.textContent = "Guardar Cliente";
    mostrarToast(error.message || "No se pudo guardar el cliente", "error");
  }
}

async function obtenerJsonSeguroFactura(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function obtenerMensajeErrorClienteFactura(response) {
  if (!response) return "";

  try {
    const errorData = await response.json();
    return errorData.mensaje || errorData.error || errorData.title || "";
  } catch (error) {
    try {
      return await response.text();
    } catch (textError) {
      return "";
    }
  }
}

async function resolverClienteCreadoFactura(data, cliente) {
  const clienteDesdeRespuesta = normalizarClienteCreadoDesdeRespuesta(data);

  if (clienteDesdeRespuesta && clienteDesdeRespuesta.idCliente) {
    return clienteDesdeRespuesta;
  }

  const clienteDesdeBusqueda = await buscarClienteCreadoFactura(cliente);

  return clienteDesdeBusqueda || {
    idCliente: clienteDesdeRespuesta?.idCliente || "",
    ...cliente
  };
}

function normalizarClienteCreadoDesdeRespuesta(data) {
  if (!data) return null;

  if (data.idCliente || data.nombre || data.correo) {
    return data;
  }

  if (data.datos && !Array.isArray(data.datos)) {
    return data.datos;
  }

  if (data.cliente) {
    return data.cliente;
  }

  return null;
}

async function buscarClienteCreadoFactura(cliente) {
  try {
    const url = `${API_CLIENTES}?nombre=&correo=${encodeURIComponent(cliente.correo)}&pagina=1&tamanioPagina=10&_=${Date.now()}`;
    const response = await apiFetch(url, { cache: "no-store" });

    if (!response || !response.ok) {
      return null;
    }

    const data = await response.json();
    const clientes = Array.isArray(data) ? data : (data.datos || []);
    const correoCliente = cliente.correo.toLowerCase();

    return clientes.find(item =>
      String(item.correo || "").toLowerCase() === correoCliente &&
      String(item.nombre || "").toLowerCase() === cliente.nombre.toLowerCase() &&
      String(item.apellido || "").toLowerCase() === cliente.apellido.toLowerCase()
    ) || clientes.find(item => String(item.correo || "").toLowerCase() === correoCliente) || null;

  } catch (error) {
    return null;
  }
}

function registrarClienteEnCacheFactura(cliente) {
  if (!cliente) return;

  clientesFacturaTodos = [
    cliente,
    ...clientesFacturaTodos.filter(item => item.idCliente !== cliente.idCliente)
  ];
  clientesFacturaFiltrados = [...clientesFacturaTodos];
  paginaClientesFactura = 1;
  modoTodosClientesFactura = false;
}

function actualizarPlaceholderBusquedaCliente() {
  const placeholders = {
    id: "Ej: 2",
    nombre: "Ej: Juan",
    apellido: "Ej: Pérez",
    correo: "Ej: juan@gmail.com",
    direccion: "Ej: Av. Bolívar"
  };

  valorBusquedaClienteFactura.placeholder =
    placeholders[filtroClienteFactura.value] || placeholders.nombre;

  valorBusquedaClienteFactura.inputMode =
    filtroClienteFactura.value === "id" ? "numeric" : "text";
}

function bloquearCaracterBusquedaCliente(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const teclasPermitidas = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
    "Enter"
  ];

  if (teclasPermitidas.includes(event.key)) return;
  if (event.key.length !== 1) return;

  const filtro = filtroClienteFactura.value;

  if (filtro === "id" && !/^\d$/.test(event.key)) {
    event.preventDefault();
    return;
  }

  if ((filtro === "nombre" || filtro === "apellido") && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]$/.test(event.key)) {
    event.preventDefault();
  }
}

function sanitizarValorBusquedaCliente() {
  const filtro = filtroClienteFactura.value;
  const valorActual = valorBusquedaClienteFactura.value;
  let valorSanitizado = valorActual;

  if (filtro === "id") {
    valorSanitizado = valorActual.replace(/\D/g, "");
  }

  if (filtro === "nombre" || filtro === "apellido") {
    valorSanitizado = valorActual.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
  }

  if (valorSanitizado !== valorActual) {
    valorBusquedaClienteFactura.value = valorSanitizado;
  }
}

async function buscarClientesFactura() {
  aplicarFiltroClientesFactura();
}

async function cargarClientesModalFactura() {
  renderCargandoClientesFactura();

  try {
    clientesFacturaTodos = await obtenerTodosClientesFactura();
    clientesFacturaFiltrados = [...clientesFacturaTodos];
    paginaClientesFactura = 1;
    modoTodosClientesFactura = false;
    renderClientesFacturaPaginados();

  } catch (error) {
    clientesFacturaTodos = [];
    clientesFacturaFiltrados = [];

    resultadosBusquedaClientesFacturaBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Error al cargar clientes</td>
      </tr>
    `;
    actualizarResumenClientesFactura();
    actualizarPaginacionClientesFactura();
  }
}

async function obtenerTodosClientesFactura() {
  const url = `${API_CLIENTES}?nombre=&correo=&pagina=1&tamanioPagina=1000&_=${Date.now()}`;
  const response = await apiFetch(url, { cache: "no-store" });

  if (!response || !response.ok) {
    throw new Error("No se pudieron cargar los clientes");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.datos || []);
}

function aplicarFiltroClientesFactura() {
  const filtro = filtroClienteFactura.value;
  const valor = valorBusquedaClienteFactura.value.trim().toLocaleLowerCase("es-EC");

  if (!valor) {
    clientesFacturaFiltrados = [...clientesFacturaTodos];
  } else {
    clientesFacturaFiltrados = clientesFacturaTodos.filter(cliente => {
      const idCliente = String(cliente.idCliente || "");
      const nombre = String(cliente.nombre || "").toLocaleLowerCase("es-EC");
      const apellido = String(cliente.apellido || "").toLocaleLowerCase("es-EC");
      const correo = String(cliente.correo || "").toLocaleLowerCase("es-EC");
      const direccion = String(cliente.direccion || "").toLocaleLowerCase("es-EC");

      if (filtro === "id") {
        return idCliente.includes(valor);
      }

      if (filtro === "nombre") {
        return nombre.includes(valor);
      }

      if (filtro === "apellido") {
        return apellido.includes(valor);
      }

      if (filtro === "correo") {
        return correo.includes(valor);
      }

      if (filtro === "direccion") {
        return direccion.includes(valor);
      }

      return true;
    });
  }

  paginaClientesFactura = 1;
  modoTodosClientesFactura = false;
  renderClientesFacturaPaginados();
}

function renderClientesFacturaPaginados() {
  const totalPaginas = obtenerTotalPaginasClientesFactura();

  if (!modoTodosClientesFactura && paginaClientesFactura > totalPaginas) {
    paginaClientesFactura = totalPaginas;
  }

  resultadosBusquedaClientesFacturaBody.innerHTML = "";

  if (!clientesFacturaFiltrados || clientesFacturaFiltrados.length === 0) {
    resultadosBusquedaClientesFacturaBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No se encontraron clientes</td>
      </tr>
    `;
    actualizarResumenClientesFactura();
    actualizarPaginacionClientesFactura();
    return;
  }

  const clientesPagina = modoTodosClientesFactura
    ? clientesFacturaFiltrados
    : clientesFacturaFiltrados.slice(
      (paginaClientesFactura - 1) * CLIENTES_FACTURA_POR_PAGINA,
      paginaClientesFactura * CLIENTES_FACTURA_POR_PAGINA
    );

  clientesPagina.forEach(cliente => {
    const fila = document.createElement("tr");
    fila.classList.add("fila-cliente-seleccionable");
    fila.title = "Seleccionar cliente";
    const idCliente = String(cliente.idCliente || "");
    const nombre = String(cliente.nombre || "");
    const apellido = String(cliente.apellido || "");
    const correo = String(cliente.correo || "");
    const direccion = String(cliente.direccion || "");

    fila.innerHTML = `
      <td>${obtenerTextoClienteFacturaResaltado("id", idCliente)}</td>
      <td>${obtenerTextoClienteFacturaResaltado("nombre", nombre)}</td>
      <td>${obtenerTextoClienteFacturaResaltado("apellido", apellido)}</td>
      <td>${escaparHtmlFactura(cliente.telefono || "Sin teléfono")}</td>
      <td>${obtenerTextoClienteFacturaResaltado("correo", correo || "Sin correo")}</td>
      <td>${obtenerTextoClienteFacturaResaltado("direccion", direccion || "Sin dirección")}</td>
    `;

    fila.addEventListener("click", () => seleccionarCliente(cliente));

    resultadosBusquedaClientesFacturaBody.appendChild(fila);
  });

  completarFilasClientesFactura(clientesPagina.length);
  actualizarResumenClientesFactura();
  actualizarPaginacionClientesFactura();
}

function obtenerTextoClienteFacturaResaltado(filtroObjetivo, texto) {
  const filtroActivo = filtroClienteFactura.value;
  const valor = valorBusquedaClienteFactura.value.trim();

  if (filtroActivo !== filtroObjetivo || !valor) {
    return escaparHtmlFactura(texto);
  }

  return resaltarCoincidenciaClienteFactura(texto, valor);
}

function resaltarCoincidenciaClienteFactura(texto, valor) {
  const textoOriginal = String(texto || "");
  const valorNormalizado = valor.toLocaleLowerCase("es-EC");
  const textoNormalizado = textoOriginal.toLocaleLowerCase("es-EC");
  const longitudValor = valor.length;
  let indice = textoNormalizado.indexOf(valorNormalizado);
  let posicionActual = 0;
  let textoResaltado = "";

  if (indice === -1) {
    return escaparHtmlFactura(textoOriginal);
  }

  while (indice !== -1) {
    textoResaltado += escaparHtmlFactura(textoOriginal.slice(posicionActual, indice));
    textoResaltado += `<span class="highlight-match">${escaparHtmlFactura(textoOriginal.slice(indice, indice + longitudValor))}</span>`;
    posicionActual = indice + longitudValor;
    indice = textoNormalizado.indexOf(valorNormalizado, posicionActual);
  }

  return textoResaltado + escaparHtmlFactura(textoOriginal.slice(posicionActual));
}

function escaparHtmlFactura(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function completarFilasClientesFactura(cantidadRegistros) {
  if (modoTodosClientesFactura || cantidadRegistros >= CLIENTES_FACTURA_POR_PAGINA) return;

  const filasFaltantes = CLIENTES_FACTURA_POR_PAGINA - cantidadRegistros;

  for (let i = 0; i < filasFaltantes; i++) {
    const fila = document.createElement("tr");
    fila.className = "modal-placeholder-row";
    fila.setAttribute("aria-hidden", "true");
    fila.innerHTML = `
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    `;

    resultadosBusquedaClientesFacturaBody.appendChild(fila);
  }
}

function renderCargandoClientesFactura() {
  resultadosBusquedaClientesFacturaBody.innerHTML = `
    <tr>
      <td colspan="6" class="empty-state">
        Cargando clientes...
      </td>
    </tr>
  `;

  if (clientesFacturaTotalTexto) {
    clientesFacturaTotalTexto.textContent = "Cargando clientes...";
  }

  if (paginaClientesFacturaTexto) {
    paginaClientesFacturaTexto.textContent = "Mostrando página 1 de 1";
  }

  actualizarPaginacionClientesFactura();
}

function actualizarResumenClientesFactura() {
  if (!clientesFacturaTotalTexto) return;

  const totalClientes = clientesFacturaTodos.length;
  const totalFiltrados = clientesFacturaFiltrados.length;
  const hayFiltro = valorBusquedaClienteFactura.value.trim().length > 0;

  clientesFacturaTotalTexto.textContent = hayFiltro
    ? `Mostrando ${totalFiltrados} resultados de ${totalClientes} clientes`
    : `${totalClientes} clientes registrados`;
}

function actualizarPaginacionClientesFactura() {
  const totalPaginas = obtenerTotalPaginasClientesFactura();

  if (window.renderizarPaginacionNumerica) {
    window.renderizarPaginacionNumerica({
      contenedor: paginacionClientesFacturaControles,
      textoElemento: paginaClientesFacturaTexto,
      paginaActual: paginaClientesFactura,
      totalPaginas,
      modoTodos: modoTodosClientesFactura
    });

    if (paginaClientesFacturaTexto) {
      paginaClientesFacturaTexto.textContent = modoTodosClientesFactura
        ? "Mostrando todos los clientes"
        : `P\u00e1gina ${paginaClientesFactura} de ${totalPaginas}`;
    }

    return;
  }

  if (paginaClientesFacturaTexto) {
    paginaClientesFacturaTexto.textContent =
      `Mostrando página ${paginaClientesFactura} de ${totalPaginas}`;
  }

  if (btnAnteriorClientesFactura) {
    btnAnteriorClientesFactura.disabled = paginaClientesFactura <= 1;
  }

  if (btnSiguienteClientesFactura) {
    btnSiguienteClientesFactura.disabled = paginaClientesFactura >= totalPaginas;
  }
}

function obtenerTotalPaginasClientesFactura() {
  return Math.max(
    1,
    Math.ceil(clientesFacturaFiltrados.length / CLIENTES_FACTURA_POR_PAGINA)
  );
}

function seleccionarCliente(cliente) {
  clienteSeleccionado = cliente;

  clienteSeleccionadoTexto.textContent = `${cliente.nombre} ${cliente.apellido}`;
  buscarClienteInput.value = `${cliente.nombre} ${cliente.apellido}`;

  modalBusquedaClientesFactura.classList.add("oculto");
  renderClienteSeleccionado();
}

function renderClienteSeleccionado() {
  if (!clienteSeleccionado) {
    btnAbrirBusquedaCliente.disabled = false;
    btnAbrirBusquedaCliente.setAttribute("aria-disabled", "false");

    clienteSeleccionadoBody.innerHTML = `
      <p class="empty-state">
        Ning&uacute;n cliente seleccionado
      </p>
    `;
    return;
  }

  btnAbrirBusquedaCliente.disabled = true;
  btnAbrirBusquedaCliente.setAttribute("aria-disabled", "true");

  clienteSeleccionadoBody.innerHTML = `
    <div class="cliente-info-grid">
      <div class="cliente-data-item">
        <label>ID</label>
        <span>${clienteSeleccionado.idCliente}</span>
      </div>

      <div class="cliente-data-item">
        <label>Nombre</label>
        <span>${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}</span>
      </div>

      <div class="cliente-data-item">
        <label>Direcci&oacute;n</label>
        <span>${clienteSeleccionado.direccion || "Sin direcci&oacute;n"}</span>
      </div>

      <div class="cliente-data-item">
        <label>Tel&eacute;fono</label>
        <span>${clienteSeleccionado.telefono || "Sin tel&eacute;fono"}</span>
      </div>

      <div class="cliente-data-item">
        <label>Correo</label>
        <span>${clienteSeleccionado.correo || "Sin correo"}</span>
      </div>

      <button type="button" class="btn-cambiar-cliente">
        Cambiar cliente
      </button>
    </div>
  `;

  const btnCambiarCliente = clienteSeleccionadoBody.querySelector(".btn-cambiar-cliente");

  if (btnCambiarCliente) {
    btnCambiarCliente.addEventListener("click", async () => {
      await abrirBusquedaClienteFactura();
    });
  }
}

/* =========================
   PRODUCTOS
========================= */

btnAbrirBusquedaProducto.addEventListener("click", async () => {
  if (!clienteSeleccionado) {
    mostrarToastUnico("Primero selecciona un cliente", "warning");
    return;
  }

  modalBusquedaProductosFactura.classList.remove("oculto");
  filtroProductoFactura.value = "nombre";
  valorBusquedaProductoFactura.value = "";
  modoTodosProductosFactura = false;
  paginaProductosFactura = 1;
  actualizarPlaceholderBusquedaProducto();
  await cargarProductosModalFactura();
  valorBusquedaProductoFactura.focus();
});

btnCerrarBusquedaProductoFactura.addEventListener("click", () => {
  modalBusquedaProductosFactura.classList.add("oculto");
});

filtroProductoFactura.addEventListener("change", () => {
  valorBusquedaProductoFactura.value = "";
  actualizarPlaceholderBusquedaProducto();
  aplicarFiltroProductosFactura();
  valorBusquedaProductoFactura.focus();
});

valorBusquedaProductoFactura.addEventListener("keydown", bloquearCaracterBusquedaProducto);
valorBusquedaProductoFactura.addEventListener("input", () => {
  sanitizarValorBusquedaProducto();
  buscarProductosFactura();
});

if (paginacionProductosFacturaControles) {
  paginacionProductosFacturaControles.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-page-action]");
    if (!boton || boton.disabled) return;

    const accion = boton.dataset.pageAction;

    if (accion === "prev" && paginaProductosFactura > 1) {
      modoTodosProductosFactura = false;
      paginaProductosFactura--;
      renderProductosFacturaPaginados();
      return;
    }

    if (accion === "next" && paginaProductosFactura < obtenerTotalPaginasProductosFactura()) {
      modoTodosProductosFactura = false;
      paginaProductosFactura++;
      renderProductosFacturaPaginados();
      return;
    }

    if (accion === "all") {
      modoTodosProductosFactura = true;
      paginaProductosFactura = 1;
      renderProductosFacturaPaginados();
      return;
    }

    if (accion === "page") {
      const pagina = Number(boton.dataset.page);

      if (!Number.isNaN(pagina)) {
        modoTodosProductosFactura = false;
        paginaProductosFactura = pagina;
        renderProductosFacturaPaginados();
      }
    }
  });
}

function actualizarPlaceholderBusquedaProducto() {
  const placeholders = {
    id: "Ej: 15",
    nombre: "Ej: Laptop",
    categoria: "Ej: Tecnologia"
  };

  valorBusquedaProductoFactura.placeholder =
    placeholders[filtroProductoFactura.value] || placeholders.nombre;

  valorBusquedaProductoFactura.inputMode =
    filtroProductoFactura.value === "id" ? "numeric" : "text";
}

function bloquearCaracterBusquedaProducto(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const teclasPermitidas = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
    "Enter"
  ];

  if (teclasPermitidas.includes(event.key)) return;
  if (event.key.length !== 1) return;

  const filtro = filtroProductoFactura.value;

  if (filtro === "id" && !/^\d$/.test(event.key)) {
    event.preventDefault();
    return;
  }

  if (filtro === "nombre" && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]$/.test(event.key)) {
    event.preventDefault();
  }
}

function sanitizarValorBusquedaProducto() {
  const filtro = filtroProductoFactura.value;
  const valorActual = valorBusquedaProductoFactura.value;
  let valorSanitizado = valorActual;

  if (filtro === "id") {
    valorSanitizado = valorActual.replace(/\D/g, "");
  }

  if (filtro === "nombre") {
    valorSanitizado = valorActual.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/g, "");
  }

  if (valorSanitizado !== valorActual) {
    valorBusquedaProductoFactura.value = valorSanitizado;
  }
}

async function buscarProductosFactura() {
  aplicarFiltroProductosFactura();
}

async function cargarProductosModalFactura() {
  renderCargandoProductosFactura();

  try {
    productosFacturaDisponibles = await obtenerProductosDisponiblesFactura();
    productosFacturaFiltrados = [...productosFacturaDisponibles];
    paginaProductosFactura = 1;
    modoTodosProductosFactura = false;
    renderProductosFacturaPaginados();

  } catch (error) {
    productosFacturaDisponibles = [];
    productosFacturaFiltrados = [];

    resultadosBusquedaProductosFacturaBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Error al cargar productos</td>
      </tr>
    `;
    actualizarResumenProductosFactura();
    actualizarPaginacionProductosFactura();
  }
}

async function obtenerProductosDisponiblesFactura() {
  const url = `${API_PRODUCTOS_BASE}/disponibles-venta?_=${Date.now()}`;
  const response = await apiFetch(url, { cache: "no-store" });

  if (!response || !response.ok) {
    throw new Error("No se pudieron cargar productos");
  }

  const data = await response.json();
  const productos = Array.isArray(data) ? data : (data.datos || []);

  return productos.filter(producto => Number(producto.stock || 0) > 0);
}

function aplicarFiltroProductosFactura() {
  const filtro = filtroProductoFactura.value;
  const valor = valorBusquedaProductoFactura.value.trim().toLowerCase();

  if (!valor) {
    productosFacturaFiltrados = [...productosFacturaDisponibles];
  } else {
    productosFacturaFiltrados = productosFacturaDisponibles.filter(producto => {
      const idProducto = String(producto.idProducto || "");
      const nombre = String(producto.nombre || "").toLowerCase();
      const categoria = String(producto.categoria || "").toLowerCase();

      if (filtro === "id") {
        return idProducto.includes(valor);
      }

      if (filtro === "categoria") {
        return categoria.includes(valor);
      }

      return nombre.includes(valor);
    });
  }

  paginaProductosFactura = 1;
  modoTodosProductosFactura = false;
  renderProductosFacturaPaginados();
}

function renderProductosFacturaPaginados() {
  const totalPaginas = obtenerTotalPaginasProductosFactura();

  if (!modoTodosProductosFactura && paginaProductosFactura > totalPaginas) {
    paginaProductosFactura = totalPaginas;
  }

  resultadosBusquedaProductosFacturaBody.innerHTML = "";

  if (!productosFacturaFiltrados || productosFacturaFiltrados.length === 0) {
    resultadosBusquedaProductosFacturaBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No se encontraron productos</td>
      </tr>
    `;
    actualizarResumenProductosFactura();
    actualizarPaginacionProductosFactura();
    return;
  }

  const productosPagina = modoTodosProductosFactura
    ? productosFacturaFiltrados
    : productosFacturaFiltrados.slice(
      (paginaProductosFactura - 1) * PRODUCTOS_FACTURA_POR_PAGINA,
      paginaProductosFactura * PRODUCTOS_FACTURA_POR_PAGINA
    );

  productosPagina.forEach(producto => {
    const fila = document.createElement("tr");
    fila.classList.add("fila-producto-seleccionable");
    fila.title = "Seleccionar producto";

    fila.innerHTML = `
      <td>${producto.idProducto}</td>
      <td>${producto.nombre}</td>
      <td>${producto.categoria || "Otros"}</td>
      <td>$${Number(producto.precio).toFixed(2)}</td>
      <td>${producto.stock}</td>
      <td>${formatearIvaProducto(producto)}</td>
    `;

    fila.addEventListener("click", () => seleccionarProducto(producto));

    resultadosBusquedaProductosFacturaBody.appendChild(fila);
  });

  completarFilasProductosFactura(productosPagina.length);
  actualizarResumenProductosFactura();
  actualizarPaginacionProductosFactura();
}

function completarFilasProductosFactura(cantidadRegistros) {
  if (modoTodosProductosFactura || cantidadRegistros >= PRODUCTOS_FACTURA_POR_PAGINA) return;

  const filasFaltantes = PRODUCTOS_FACTURA_POR_PAGINA - cantidadRegistros;

  for (let i = 0; i < filasFaltantes; i++) {
    const fila = document.createElement("tr");
    fila.className = "modal-placeholder-row";
    fila.setAttribute("aria-hidden", "true");
    fila.innerHTML = `
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    `;

    resultadosBusquedaProductosFacturaBody.appendChild(fila);
  }
}

function renderCargandoProductosFactura() {
  resultadosBusquedaProductosFacturaBody.innerHTML = `
    <tr>
      <td colspan="6" class="empty-state">
        Cargando productos...
      </td>
    </tr>
  `;

  if (productosFacturaTotalTexto) {
    productosFacturaTotalTexto.textContent = "Cargando productos...";
  }

  if (paginaProductosFacturaTexto) {
    paginaProductosFacturaTexto.textContent = "Mostrando página 1 de 1";
  }

  actualizarPaginacionProductosFactura();
}

function actualizarResumenProductosFactura() {
  if (!productosFacturaTotalTexto) return;

  const totalProductos = productosFacturaDisponibles.length;
  const totalFiltrados = productosFacturaFiltrados.length;
  const hayFiltro = valorBusquedaProductoFactura.value.trim().length > 0;

  productosFacturaTotalTexto.textContent = hayFiltro
    ? `Mostrando ${totalFiltrados} de ${totalProductos} productos disponibles`
    : `${totalProductos} productos disponibles`;
}

function actualizarPaginacionProductosFactura() {
  const totalPaginas = obtenerTotalPaginasProductosFactura();

  if (window.renderizarPaginacionNumerica) {
    window.renderizarPaginacionNumerica({
      contenedor: paginacionProductosFacturaControles,
      textoElemento: paginaProductosFacturaTexto,
      paginaActual: paginaProductosFactura,
      totalPaginas,
      modoTodos: modoTodosProductosFactura
    });

    if (paginaProductosFacturaTexto) {
      paginaProductosFacturaTexto.textContent = modoTodosProductosFactura
        ? "Mostrando todos los productos"
        : `P\u00e1gina ${paginaProductosFactura} de ${totalPaginas}`;
    }

    return;
  }

  if (paginaProductosFacturaTexto) {
    paginaProductosFacturaTexto.textContent =
      `Mostrando página ${paginaProductosFactura} de ${totalPaginas}`;
  }

  if (btnAnteriorProductosFactura) btnAnteriorProductosFactura.disabled = true;
  if (btnSiguienteProductosFactura) btnSiguienteProductosFactura.disabled = true;
}

function obtenerTotalPaginasProductosFactura() {
  return Math.max(
    1,
    Math.ceil(productosFacturaFiltrados.length / PRODUCTOS_FACTURA_POR_PAGINA)
  );
}

function seleccionarProducto(producto) {
  productoSeleccionado = producto;
  productoSeleccionadoDesdeDetalleId = null;
  buscarProductoInput.value = producto.nombre;
  cantidadProductoInput.value = "1";

  modalBusquedaProductosFactura.classList.add("oculto");
  renderProductoSeleccionado();
}

function renderProductoSeleccionado() {
  if (!productoSeleccionado) {
    productoNombre.textContent = "Ninguno";
    productoPrecio.textContent = "0.00";
    productoStock.textContent = "0";
    if (productoIva) productoIva.textContent = "0%";
    return;
  }

  productoNombre.textContent = productoSeleccionado.nombre;
  productoPrecio.textContent = Number(productoSeleccionado.precio).toFixed(2);
  productoStock.textContent = productoSeleccionado.stock;
  if (productoIva) productoIva.textContent = formatearIvaProducto(productoSeleccionado);
}

/* =========================
   CANTIDAD
========================= */

btnRestarCantidad.addEventListener("click", () => {
  let cantidad = parseInt(cantidadProductoInput.value) || 1;

  if (cantidad > 1) cantidad--;

  cantidadProductoInput.value = cantidad;
});

btnSumarCantidad.addEventListener("click", () => {
  let cantidad = parseInt(cantidadProductoInput.value) || 1;

  if (productoSeleccionado && cantidad >= productoSeleccionado.stock) {
    mostrarToast("No puedes superar el stock disponible", "warning");
    return;
  }

  cantidad++;
  cantidadProductoInput.value = cantidad;
});

cantidadProductoInput.addEventListener("input", () => {
  let cantidad = parseInt(cantidadProductoInput.value);

  if (!cantidad || cantidad < 1) {
    cantidadProductoInput.value = "1";
    return;
  }

  if (productoSeleccionado && cantidad > productoSeleccionado.stock) {
    cantidadProductoInput.value = productoSeleccionado.stock;
    mostrarToastUnico("La cantidad no puede superar el stock disponible", "warning");
  }
});

/* =========================
   DETALLE
========================= */

btnAgregarProducto.addEventListener("click", () => {
  if (!clienteSeleccionado) {
    mostrarToastUnico("Primero selecciona un cliente", "warning");
    return;
  }

  if (!productoSeleccionado) {
    mostrarToastUnico("Selecciona un producto", "warning");
    return;
  }

  const cantidad = parseInt(cantidadProductoInput.value);

  if (!cantidad || cantidad <= 0) {
    mostrarToastUnico("Ingresa una cantidad válida", "warning");
    return;
  }

  const stockDisponible = Number(productoSeleccionado.stock || 0);
  const calculoLinea = calcularDetalleProducto(productoSeleccionado, cantidad);

  if (cantidad > stockDisponible) {
    mostrarToastUnico("La cantidad no puede superar el stock disponible", "error");
    return;
  }

  const existente = detalleFactura.find(
    d => d.idProducto === productoSeleccionado.idProducto
  );

  if (existente) {
    const esEdicionDesdeDetalle =
      productoSeleccionadoDesdeDetalleId === productoSeleccionado.idProducto;

    if (esEdicionDesdeDetalle) {
      existente.nombre = productoSeleccionado.nombre;
      existente.precioUnitario = calculoLinea.precioUnitario;
      existente.stockDisponible = stockDisponible;
      existente.cantidad = cantidad;
      existente.porcentajeIva = calculoLinea.porcentajeIva;
      existente.subtotalLinea = calculoLinea.subtotalLinea;
      existente.ivaLinea = calculoLinea.ivaLinea;
      existente.totalLinea = calculoLinea.totalLinea;
    } else {
      if (existente.cantidad + cantidad > stockDisponible) {
        mostrarToastUnico("La cantidad total supera el stock disponible", "error");
        return;
      }

      existente.cantidad += cantidad;
      existente.stockDisponible = stockDisponible;
      const calculoExistente = calcularDetalleProducto(
        {
          precio: existente.precioUnitario,
          aplicaIva: existente.porcentajeIva > 0,
          porcentajeIva: existente.porcentajeIva
        },
        existente.cantidad
      );
      existente.subtotalLinea = calculoExistente.subtotalLinea;
      existente.ivaLinea = calculoExistente.ivaLinea;
      existente.totalLinea = calculoExistente.totalLinea;
    }
  } else {
    detalleFactura.push({
      idProducto: productoSeleccionado.idProducto,
      nombre: productoSeleccionado.nombre,
      precioUnitario: calculoLinea.precioUnitario,
      stockDisponible: stockDisponible,
      cantidad: cantidad,
      porcentajeIva: calculoLinea.porcentajeIva,
      subtotalLinea: calculoLinea.subtotalLinea,
      ivaLinea: calculoLinea.ivaLinea,
      totalLinea: calculoLinea.totalLinea
    });
  }

  renderDetalleFactura();
  limpiarProductoSeleccionado();
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

async function seleccionarProductoDesdeDetalle(item) {
  const productoActualizado = await obtenerProductoActualizadoParaDetalle(item);
  const stockDisponible = Number(productoActualizado.stock ?? item.stockDisponible ?? 0);

  productoSeleccionado = {
    idProducto: item.idProducto,
    nombre: productoActualizado.nombre || item.nombre,
    precio: Number(item.precioUnitario ?? productoActualizado.precio ?? 0),
    stock: stockDisponible,
    aplicaIva: productoActualizado.aplicaIva ?? item.porcentajeIva > 0,
    porcentajeIva: Number(productoActualizado.porcentajeIva ?? item.porcentajeIva ?? 0)
  };
  productoSeleccionadoDesdeDetalleId = item.idProducto;
  buscarProductoInput.value = productoSeleccionado.nombre;
  cantidadProductoInput.value = String(item.cantidad);

  renderProductoSeleccionado();
}

async function obtenerProductoActualizadoParaDetalle(item) {
  try {
    const response = await apiFetch(`${API_PRODUCTOS_BASE}/${item.idProducto}`, {
      cache: "no-store"
    });

    if (!response || !response.ok) {
      throw new Error("No se pudo obtener el stock actualizado");
    }

    return await response.json();

  } catch (error) {
    return {
      nombre: item.nombre,
      precio: item.precioUnitario,
      stock: item.stockDisponible,
      aplicaIva: item.porcentajeIva > 0,
      porcentajeIva: item.porcentajeIva || 0
    };
  }
}

function renderDetalleFactura() {
  detalleFacturaBody.innerHTML = "";

  if (detalleFactura.length === 0) {
    detalleFacturaBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          No hay productos agregados
        </td>
      </tr>
    `;
  }

  let subtotal = 0;
  let iva = 0;

  detalleFactura.forEach((item, index) => {
    subtotal += item.subtotalLinea;
    iva += item.ivaLinea;

    const fila = document.createElement("tr");
    fila.classList.add("fila-detalle-seleccionable");
    fila.title = "Cargar producto para editar cantidad";

    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.nombre}</td>
      <td>${Number(item.precioUnitario).toFixed(2)}</td>
      <td>${item.cantidad}</td>
      <td>${Number(item.subtotalLinea).toFixed(2)}</td>
      <td>${Number(item.totalLinea).toFixed(2)}</td>
      <td>
        <button class="btn-quitar" type="button">
          Quitar
        </button>
      </td>
    `;

    fila.addEventListener("click", () => seleccionarProductoDesdeDetalle(item));

    const btnQuitar = fila.querySelector(".btn-quitar");
    btnQuitar.addEventListener("click", (event) => {
      event.stopPropagation();
      eliminarDetalle(index);
    });

    detalleFacturaBody.appendChild(fila);
  });

  const total = subtotal + iva;

  subtotalFacturaTexto.textContent = `$${subtotal.toFixed(2)}`;
  ivaFacturaTexto.textContent = `$${iva.toFixed(2)}`;
  totalFacturaTexto.textContent = `$${total.toFixed(2)}`;
}

function calcularDetalleProducto(producto, cantidad) {
  const precioUnitario = Number(producto.precio || producto.precioUnitario || 0);
  const porcentajeIva = obtenerPorcentajeIvaProducto(producto);
  const subtotalLinea = precioUnitario * cantidad;
  const ivaLinea = Math.round((subtotalLinea * porcentajeIva / 100) * 100) / 100;

  return {
    precioUnitario,
    porcentajeIva,
    subtotalLinea,
    ivaLinea,
    totalLinea: Math.round((subtotalLinea + ivaLinea) * 100) / 100
  };
}

function obtenerPorcentajeIvaProducto(producto) {
  const aplicaIva = Boolean(producto.aplicaIva);
  const porcentajeIva = Number(producto.porcentajeIva || 0);

  return aplicaIva ? porcentajeIva : 0;
}

function formatearIvaProducto(producto) {
  const porcentajeIva = obtenerPorcentajeIvaProducto(producto);
  return `${porcentajeIva.toFixed(2).replace(/\.00$/, "")}%`;
}

window.eliminarDetalle = async function(index) {
  const confirmar = await mostrarConfirmacionQuitarProducto();

  if (!confirmar) return;

  const itemEliminado = detalleFactura[index];
  detalleFactura.splice(index, 1);

  if (
    itemEliminado &&
    productoSeleccionadoDesdeDetalleId === itemEliminado.idProducto
  ) {
    limpiarProductoSeleccionado();
  }

  renderDetalleFactura();

  mostrarToast("Producto quitado del detalle", "info");
};

function mostrarConfirmacionQuitarProducto() {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalConfirmacionDetalle");
    const btnCancelar = document.getElementById("btnCancelarQuitar");
    const btnAceptar = document.getElementById("btnAceptarQuitar");

    modal.classList.remove("oculto");

    btnCancelar.onclick = () => {
      modal.classList.add("oculto");
      resolve(false);
    };

    btnAceptar.onclick = () => {
      modal.classList.add("oculto");
      resolve(true);
    };
  });
}

function limpiarProductoSeleccionado() {
  productoSeleccionado = null;
  productoSeleccionadoDesdeDetalleId = null;
  buscarProductoInput.value = "";
  cantidadProductoInput.value = "1";
  renderProductoSeleccionado();
}

/* =========================
   GUARDAR FACTURA
========================= */

btnCancelarFactura.addEventListener("click", async () => {
  const confirmar = await mostrarConfirmacionCancelarFactura();

  if (!confirmar) return;

  limpiarFactura();
  mostrarToast("Factura cancelada", "info");
});

btnGuardarFactura.addEventListener("click", async () => {
  if (!clienteSeleccionado) {
    mostrarToastUnico("Selecciona un cliente", "warning");
    return;
  }

  if (detalleFactura.length === 0) {
    mostrarToastUnico("Agrega al menos un producto", "warning");
    return;
  }

  const factura = {
    idCliente: clienteSeleccionado.idCliente,
    detalles: detalleFactura.map(d => ({
      idProducto: d.idProducto,
      cantidad: d.cantidad
    }))
  };

  try {
    const response = await apiFetch(API_FACTURA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(factura)
    });

    if (!response || !response.ok) {
      const mensajeError = await obtenerMensajeErrorFactura(response);
      throw new Error(mensajeError || "Error al guardar la factura.");
    }

    const data = await response.json();

    if (data.numeroFactura) {
      await abrirPdfFactura(data.numeroFactura);
      mostrarToast("Factura guardada y PDF generado correctamente", "success");
    }

    limpiarFactura();

  } catch (error) {
    mostrarToast(error.message || "Error al guardar la factura.", "error");
  }
});

async function obtenerMensajeErrorFactura(response) {
  if (!response) return "";

  try {
    const data = await response.json();
    return extraerMensajeErrorFactura(data);
  } catch (error) {
    return "";
  }
}

function extraerMensajeErrorFactura(data) {
  if (!data) return "";

  if (typeof data === "string") {
    return data;
  }

  if (data.error) {
    return Array.isArray(data.error) ? data.error.join(" ") : String(data.error);
  }

  if (data.mensaje) {
    return String(data.mensaje);
  }

  if (data.message) {
    return String(data.message);
  }

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      return data.errors.join(" ");
    }

    if (typeof data.errors === "object") {
      return Object.values(data.errors)
        .flat()
        .map(error => String(error))
        .join(" ");
    }

    return String(data.errors);
  }

  return "";
}

async function abrirPdfFactura(numeroFactura) {
  const response = await apiFetch(
    `http://localhost:5161/api/Factura/pdf/${numeroFactura}`
  );

  if (!response || !response.ok) {
    throw new Error("La factura se guardó, pero no se pudo generar el PDF");
  }

  const blob = await response.blob();
  const pdfUrl = URL.createObjectURL(blob);

  window.open(pdfUrl, "_blank");
}

function mostrarConfirmacionCancelarFactura() {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalConfirmacionCancelarFactura");
    const btnCancelar = document.getElementById("btnCancelarLimpiezaFactura");
    const btnAceptar = document.getElementById("btnAceptarLimpiezaFactura");
    const mensaje = modal.querySelector("p");

    mensaje.textContent = "¿Está seguro de cancelar la factura actual?";
    btnAceptar.textContent = "Sí, cancelar";

    modal.classList.remove("oculto");

    btnCancelar.onclick = () => {
      modal.classList.add("oculto");
      resolve(false);
    };

    btnAceptar.onclick = () => {
      modal.classList.add("oculto");
      resolve(true);
    };
  });
}

function limpiarFactura() {
  detalleFactura = [];
  clienteSeleccionado = null;
  clienteSeleccionadoTexto.textContent = "Ninguno";
  buscarClienteInput.value = "";

  limpiarProductoSeleccionado();
  renderClienteSeleccionado();
  renderDetalleFactura();
}
