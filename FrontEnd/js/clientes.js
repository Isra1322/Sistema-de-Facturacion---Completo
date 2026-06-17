const API_URL = "http://localhost:5161/api/Cliente";
const LONGITUD_MAXIMA_NOMBRE_APELLIDO = 20;

const clienteForm = document.getElementById("clienteForm");
const clientesBody = document.getElementById("clientesBody");
const paginaActualTexto = document.getElementById("paginaActual");
const btnAnterior = document.getElementById("btnAnterior");
const paginacionControles = btnAnterior ? btnAnterior.parentElement : null;
const clientesTotalBadge = document.getElementById("clientesTotalBadge");

const filtroClienteTabla = document.getElementById("filtroClienteTabla");
const valorFiltroCliente = document.getElementById("valorFiltroCliente");
const filtroEstadoClienteContainer = document.getElementById("filtroEstadoClienteContainer");
const filtroEstadoCliente = document.getElementById("filtroEstadoCliente");

const idClienteInput = document.getElementById("idCliente");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const telefonoInput = document.getElementById("telefono");
const direccionInput = document.getElementById("direccion");
const correoInput = document.getElementById("correo");

const btnMostrarFormulario = document.getElementById("btnMostrarFormulario");
const btnCerrarFormulario = document.getElementById("btnCerrarFormulario");
const formularioClienteContainer = document.getElementById("formularioClienteContainer");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardarCliente = document.getElementById("btnGuardarCliente");

let paginaActual = 1;
const tamanioPagina = 6;
let totalPaginas = 1;
let modoTodos = false;
let clientesTodos = [];
let clientesFiltrados = [];
let rolUsuario = "";
let esAdministrador = false;

document.addEventListener("DOMContentLoaded", () => {
  const usuarioNombre = document.getElementById("usuarioNombre");
  const usuarioRol = document.getElementById("usuarioRol");

  rolUsuario = localStorage.getItem("rol") || sessionStorage.getItem("rol") || "";
  esAdministrador = rolUsuario === "Administrador";

  if (usuarioNombre) usuarioNombre.textContent = localStorage.getItem("nombre") || sessionStorage.getItem("nombre") || "Usuario";
  if (usuarioRol) usuarioRol.textContent = rolUsuario;
  configurarFiltroEstadoClientes();

  actualizarPlaceholderFiltroClientes();
  cargarClientes();
});

nombreInput.addEventListener("input", validarNombreApellido);
apellidoInput.addEventListener("input", validarNombreApellido);

telefonoInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

function validarSoloLetras(e) {
  e.target.value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
}

function validarNombreApellido(e) {
  e.target.value = normalizarNombreApellidoSinEspacios(e.target.value);
}

function normalizarNombreApellidoSinEspacios(valor) {
  const textoSinEspacios = valor
    .replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "")
    .replace(/\s+/g, "")
    .slice(0, LONGITUD_MAXIMA_NOMBRE_APELLIDO);

  if (!textoSinEspacios) {
    return "";
  }

  const textoMinusculas = textoSinEspacios.toLocaleLowerCase("es-EC");

  return textoMinusculas.charAt(0).toLocaleUpperCase("es-EC") + textoMinusculas.slice(1);
}

btnMostrarFormulario.addEventListener("click", () => {
  limpiarFormulario();
  formularioClienteContainer.classList.remove("oculto");
});

btnCerrarFormulario.addEventListener("click", () => {
  formularioClienteContainer.classList.add("oculto");
});

filtroClienteTabla.addEventListener("change", () => {
  valorFiltroCliente.value = "";
  actualizarPlaceholderFiltroClientes();
  aplicarFiltroClientes(true);
  valorFiltroCliente.focus();
});

valorFiltroCliente.addEventListener("input", () => {
  validarValorFiltroClientes();
  aplicarFiltroClientes(true);
});

if (filtroEstadoCliente) {
  filtroEstadoCliente.addEventListener("change", () => {
    paginaActual = 1;
    modoTodos = false;
    cargarClientes();
  });
}

clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idCliente = idClienteInput.value.trim();
  const cliente = {
    nombre: normalizarNombreApellidoSinEspacios(nombreInput.value),
    apellido: normalizarNombreApellidoSinEspacios(apellidoInput.value),
    direccion: direccionInput.value.trim(),
    telefono: telefonoInput.value.trim(),
    correo: correoInput.value.trim()
  };

  nombreInput.value = cliente.nombre;
  apellidoInput.value = cliente.apellido;

  if (!cliente.nombre || !cliente.apellido || !cliente.direccion || !cliente.telefono || !cliente.correo) {
    mostrarToast("Todos los campos son obligatorios", "warning");
    return;
  }

  if (!/^09\d{8}$/.test(cliente.telefono)) {
    mostrarToast("El teléfono debe iniciar con 09 y tener 10 dígitos", "warning");
    return;
  }

  try {
    const esEdicion = idCliente.length > 0;
    const payloadCliente = esEdicion
      ? { idCliente: Number(idCliente), ...cliente }
      : cliente;

    const response = await apiFetch(
      esEdicion ? `${API_URL}/${idCliente}` : API_URL,
      {
        method: esEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payloadCliente)
      }
    );

    if (!response || !response.ok) {
      let mensaje = "No se pudo guardar el cliente";

      try {
        const errorData = await response.json();
        mensaje = errorData.mensaje || errorData.error || errorData.title || mensaje;
      } catch {
        try {
          mensaje = await response.text();
        } catch {}
      }

      throw new Error(mensaje || "No se pudo guardar el cliente");
    }

    formularioClienteContainer.classList.add("oculto");
    limpiarFormulario();

    await cargarClientes({
      irUltima: !esEdicion && !hayFiltroActivo()
    });

    mostrarToast(
      esEdicion ? "Cliente actualizado correctamente" : "Cliente guardado correctamente",
      "success"
    );
  } catch (error) {
    mostrarToast(error.message, "error");
  }
});

if (paginacionControles) {
  paginacionControles.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-page-action]");
    if (!boton || boton.disabled) return;

    const accion = boton.dataset.pageAction;

    if (accion === "prev" && paginaActual > 1) {
      modoTodos = false;
      paginaActual--;
      renderClientes();
      return;
    }

    if (accion === "next" && paginaActual < totalPaginas) {
      modoTodos = false;
      paginaActual++;
      renderClientes();
      return;
    }

    if (accion === "all") {
      modoTodos = true;
      paginaActual = 1;
      renderClientes();
      return;
    }

    if (accion === "page") {
      const pagina = Number(boton.dataset.page);

      if (!Number.isNaN(pagina)) {
        modoTodos = false;
        paginaActual = pagina;
        renderClientes();
      }
    }
  });
}

async function cargarClientes(opciones = {}) {
  try {
    clientesBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Cargando clientes...</td>
      </tr>
    `;

    const response = await apiFetch(
      `${API_URL}/buscar?nombre=&correo=&estado=${encodeURIComponent(obtenerEstadoFiltroClientes())}&pagina=1&tamanioPagina=100000&_=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response || !response.ok) {
      throw new Error("No se pudieron cargar los clientes");
    }

    const data = await response.json();
    clientesTodos = Array.isArray(data) ? data : (data.datos || []);

    aplicarFiltroClientes(false);

    if (opciones.irUltima && clientesFiltrados.length > 0) {
      modoTodos = false;
      totalPaginas = obtenerTotalPaginas();
      paginaActual = totalPaginas;
    }

    renderClientes();
  } catch (error) {
    clientesTodos = [];
    clientesFiltrados = [];
    clientesBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Error al cargar clientes</td>
      </tr>
    `;
    actualizarContadorClientes();
    actualizarPaginacion();
    mostrarToast("Error al cargar clientes", "error");
  }
}

function aplicarFiltroClientes(reiniciarPagina) {
  const filtro = filtroClienteTabla.value;
  const valor = valorFiltroCliente.value.trim().toLocaleLowerCase("es-EC");

  if (!valor) {
    clientesFiltrados = [...clientesTodos];
  } else {
    clientesFiltrados = clientesTodos.filter(cliente => {
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

  if (reiniciarPagina) {
    paginaActual = 1;
    modoTodos = false;
    renderClientes();
  }
}

function renderClientes() {
  totalPaginas = obtenerTotalPaginas();

  if (!modoTodos && paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const clientesPagina = modoTodos
    ? clientesFiltrados
    : clientesFiltrados.slice(
      (paginaActual - 1) * tamanioPagina,
      paginaActual * tamanioPagina
    );

  clientesBody.innerHTML = "";

  if (clientesPagina.length === 0) {
    clientesBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          ${hayFiltroActivo() ? "No se encontraron clientes" : "No existen clientes registrados"}
        </td>
      </tr>
    `;
    actualizarContadorClientes();
    actualizarPaginacion();
    return;
  }

  clientesPagina.forEach(cliente => {
    clientesBody.innerHTML += filaCliente(cliente, true);
  });

  actualizarContadorClientes();
  actualizarPaginacion();
}

function actualizarContadorClientes() {
  if (!clientesTotalBadge) return;

  const totalClientes = clientesTodos.length;
  const totalFiltrados = clientesFiltrados.length;

  clientesTotalBadge.textContent = hayFiltroActivo()
    ? `Mostrando ${totalFiltrados} de ${totalClientes} clientes`
    : formatearTotalClientes(totalClientes);
}

function actualizarPaginacion() {
  window.renderizarPaginacionNumerica({
    contenedor: paginacionControles,
    textoElemento: paginaActualTexto,
    paginaActual,
    totalPaginas,
    modoTodos
  });
}

function obtenerTotalPaginas() {
  return Math.max(1, Math.ceil(clientesFiltrados.length / tamanioPagina));
}

function actualizarPlaceholderFiltroClientes() {
  const placeholders = {
    id: "Ej: 2",
    nombre: "Ej: Juan",
    apellido: "Ej: Pérez",
    correo: "Ej: juan@gmail.com",
    direccion: "Ej: Av. Bolívar"
  };

  valorFiltroCliente.placeholder = placeholders[filtroClienteTabla.value] || placeholders.nombre;
}

function validarValorFiltroClientes() {
  const filtro = filtroClienteTabla.value;

  if (filtro === "id") {
    valorFiltroCliente.value = valorFiltroCliente.value.replace(/\D/g, "");
    return;
  }

  if (filtro === "nombre" || filtro === "apellido") {
    valorFiltroCliente.value = valorFiltroCliente.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  }
}

function hayFiltroActivo() {
  return valorFiltroCliente.value.trim().length > 0 ||
    (esAdministrador && obtenerEstadoFiltroClientes() !== "Activo");
}

function formatearTotalClientes(total) {
  return total === 1
    ? "1 cliente registrado"
    : `${total} clientes registrados`;
}

function filaCliente(cliente, acciones = false) {
  const iniciales = `${cliente.nombre?.[0] || ""}${cliente.apellido?.[0] || ""}`.toUpperCase();
  const estadoCliente = cliente.estado || "Activo";
  const estaInactivo = estadoCliente === "Inactivo";
  const idCliente = String(cliente.idCliente || "");
  const nombre = String(cliente.nombre || "");
  const apellido = String(cliente.apellido || "");
  const correo = String(cliente.correo || "");
  const direccion = String(cliente.direccion || "");
  const nombreCompleto = `${obtenerTextoCeldaResaltado("nombre", nombre)}${nombre && apellido ? " " : ""}${obtenerTextoCeldaResaltado("apellido", apellido)}`;

  return `
    <tr>
      <td>${obtenerTextoCeldaResaltado("id", idCliente)}</td>

      <td>
        <div class="client-name">
          <span class="client-avatar">${iniciales}</span>
          <span>${nombreCompleto}</span>
        </div>
      </td>

      <td>
        <span class="phone-cell">
          <span class="phone-icon">☎</span>
          <span>${cliente.telefono}</span>
        </span>
      </td>

      <td>${obtenerTextoCeldaResaltado("correo", correo)}</td>
      <td>${obtenerTextoCeldaResaltado("direccion", direccion)}</td>

      ${acciones ? `
        <td>
          <div class="actions">
            ${estaInactivo && esAdministrador
              ? `<button class="btn-edit" onclick="reactivarCliente(${cliente.idCliente})">↻</button>`
              : `
                <button class="btn-edit" onclick="editarCliente(${cliente.idCliente})">✎</button>
                <button class="btn-delete" onclick="eliminarCliente(${cliente.idCliente})">🗑</button>
              `}
          </div>
        </td>
      ` : ""}
    </tr>
  `;
}

function obtenerTextoCeldaResaltado(filtroObjetivo, texto) {
  const filtroActivo = filtroClienteTabla.value;
  const valor = valorFiltroCliente.value.trim();

  if (filtroActivo !== filtroObjetivo || !valor) {
    return escaparHtml(texto);
  }

  return resaltarCoincidencia(texto, valor);
}

function resaltarCoincidencia(texto, valor) {
  const textoOriginal = String(texto || "");
  const valorNormalizado = valor.toLocaleLowerCase("es-EC");
  const textoNormalizado = textoOriginal.toLocaleLowerCase("es-EC");
  const longitudValor = valor.length;
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

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.editarCliente = async function(id) {
  try {
    const response = await apiFetch(`${API_URL}/${id}`);

    if (!response || !response.ok) {
      throw new Error("No se pudo obtener el cliente");
    }

    const cliente = await response.json();

    idClienteInput.value = cliente.idCliente;
    nombreInput.value = normalizarNombreApellidoSinEspacios(cliente.nombre || "");
    apellidoInput.value = normalizarNombreApellidoSinEspacios(cliente.apellido || "");
    direccionInput.value = cliente.direccion;
    telefonoInput.value = cliente.telefono;
    correoInput.value = cliente.correo;

    tituloFormulario.textContent = "Editar Cliente";
    btnGuardarCliente.textContent = "Actualizar Cliente";

    formularioClienteContainer.classList.remove("oculto");
  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

window.eliminarCliente = async function(id) {
  const confirmar = await mostrarConfirmacion(
    "Eliminar cliente",
    "¿Seguro que deseas eliminar este cliente?"
  );

  if (!confirmar) return;

  try {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo eliminar el cliente";

      try {
        const errorData = await response.json();
        mensaje = errorData.mensaje || errorData.error || errorData.title || mensaje;
      } catch {
        try {
          const texto = await response.text();
          if (texto) mensaje = texto;
        } catch {}
      }

      throw new Error(mensaje);
    }

    await cargarClientes();
    mostrarToast("Cliente eliminado correctamente", "success");
  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

window.reactivarCliente = async function(id) {
  const confirmar = await mostrarConfirmacion(
    "Reactivar cliente",
    "¿Seguro que deseas reactivar este cliente?"
  );

  if (!confirmar) return;

  try {
    const response = await apiFetch(`${API_URL}/${id}/reactivar`, {
      method: "PUT"
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo reactivar el cliente";

      try {
        const errorData = await response.json();
        mensaje = errorData.mensaje || errorData.error || errorData.title || mensaje;
      } catch {
        try {
          const texto = await response.text();
          if (texto) mensaje = texto;
        } catch {}
      }

      throw new Error(mensaje);
    }

    await cargarClientes();
    mostrarToast("Cliente reactivado correctamente", "success");
  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

function configurarFiltroEstadoClientes() {
  if (!filtroEstadoClienteContainer || !filtroEstadoCliente) return;

  if (esAdministrador) {
    filtroEstadoClienteContainer.classList.remove("oculto");
    return;
  }

  filtroEstadoCliente.value = "Activo";
  filtroEstadoClienteContainer.classList.add("oculto");
}

function obtenerEstadoFiltroClientes() {
  if (!esAdministrador || !filtroEstadoCliente) {
    return "Activo";
  }

  return filtroEstadoCliente.value || "Activo";
}

function mostrarConfirmacion(titulo, mensaje) {
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

function limpiarFormulario() {
  clienteForm.reset();
  idClienteInput.value = "";
  tituloFormulario.textContent = "Registrar Cliente";
  btnGuardarCliente.textContent = "Guardar Cliente";
}
