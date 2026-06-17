const API_URL = "http://localhost:5161/api/Producto";
const LONGITUD_MAXIMA_NOMBRE_PRODUCTO = 60;

const productoForm = document.getElementById("productoForm");
const productosBody = document.getElementById("productosBody");

const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const paginaActualTexto = document.getElementById("paginaActual");
const paginacionControles = btnAnterior ? btnAnterior.parentElement : null;
const productosTotalBadge = document.getElementById("productosTotalBadge");

const filtroProductoTabla = document.getElementById("filtroProductoTabla");
const valorFiltroProducto = document.getElementById("valorFiltroProducto");
const filtroEstadoProductoContainer = document.getElementById("filtroEstadoProductoContainer");
const filtroEstadoProducto = document.getElementById("filtroEstadoProducto");

const idProductoInput = document.getElementById("idProducto");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const categoriaInput = document.getElementById("categoria");
const aplicaIvaInput = document.getElementById("aplicaIva");
const porcentajeIvaInput = document.getElementById("porcentajeIva");

const btnMostrarFormulario = document.getElementById("btnMostrarFormulario");
const btnCerrarFormulario = document.getElementById("btnCerrarFormulario");
const formularioProductoContainer = document.getElementById("formularioProductoContainer");

const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardarProducto = document.getElementById("btnGuardarProducto");

let paginaActual = 1;
const tamanioPagina = 6;
let totalPaginas = 1;
let modoTodos = false;
let productosTodos = [];
let productosFiltrados = [];
let rolUsuario = "";
let esAdministrador = false;

document.addEventListener("DOMContentLoaded", () => {
  const usuarioNombre = document.getElementById("usuarioNombre");
  const usuarioRol = document.getElementById("usuarioRol");

  rolUsuario = localStorage.getItem("rol") || sessionStorage.getItem("rol") || "";
  esAdministrador = rolUsuario === "Administrador";

  if (usuarioNombre) usuarioNombre.textContent = localStorage.getItem("nombre") || sessionStorage.getItem("nombre") || "Usuario";
  if (usuarioRol) usuarioRol.textContent = rolUsuario;
  configurarFiltroEstadoProductos();
  configurarPermisosProductos();

  const btnToggleSidebar = document.getElementById("btnToggleSidebar");
  const dashboardLayout = document.querySelector(".dashboard-layout");

  if (btnToggleSidebar && dashboardLayout) {
    btnToggleSidebar.addEventListener("click", () => {
      dashboardLayout.classList.toggle("sidebar-collapsed");
    });
  }

  actualizarPlaceholderFiltroProductos();
  cargarProductos();
});

nombreInput.addEventListener("input", () => {
  nombreInput.value = normalizarNombreProducto(nombreInput.value);
});

if (categoriaInput && aplicaIvaInput && porcentajeIvaInput) {
  categoriaInput.addEventListener("change", aplicarReglasIvaFormulario);
  aplicaIvaInput.addEventListener("change", aplicarReglasIvaFormulario);
}

btnMostrarFormulario.addEventListener("click", () => {
  limpiarFormulario();
  formularioProductoContainer.classList.remove("oculto");
});

btnCerrarFormulario.addEventListener("click", () => {
  formularioProductoContainer.classList.add("oculto");
});

if (filtroProductoTabla && valorFiltroProducto) {
  filtroProductoTabla.addEventListener("change", () => {
    valorFiltroProducto.value = "";
    actualizarPlaceholderFiltroProductos();
    aplicarFiltroProductos(true);
    valorFiltroProducto.focus();
  });

  valorFiltroProducto.addEventListener("input", () => {
    validarValorFiltroProductos();
    aplicarFiltroProductos(true);
  });
}

if (filtroEstadoProducto) {
  filtroEstadoProducto.addEventListener("change", () => {
    paginaActual = 1;
    modoTodos = false;
    cargarProductos();
  });
}

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idProducto = idProductoInput.value.trim();

  const producto = {
    idProducto: idProducto ? Number(idProducto) : 0,
    nombre: normalizarNombreProducto(nombreInput.value),
    precio: parseFloat(precioInput.value),
    stock: parseInt(stockInput.value),
    categoria: categoriaInput ? categoriaInput.value : "",
    aplicaIva: aplicaIvaInput ? aplicaIvaInput.checked : false,
    porcentajeIva: porcentajeIvaInput ? parseFloat(porcentajeIvaInput.value) : 0
  };

  nombreInput.value = producto.nombre;

  if (!producto.nombre) {
    mostrarToast("El nombre del producto es obligatorio", "warning");
    return;
  }

  if (isNaN(producto.precio) || producto.precio <= 0) {
    mostrarToast("El precio debe ser mayor a 0", "warning");
    return;
  }

  if (isNaN(producto.stock) || producto.stock < 0) {
    mostrarToast("El stock no puede ser negativo", "warning");
    return;
  }

  if (!producto.categoria) {
    mostrarToast("La categoría es obligatoria", "warning");
    return;
  }

  if (producto.categoria === "Tecnologia") {
    producto.aplicaIva = true;
    producto.porcentajeIva = 15;
  } else if (!producto.aplicaIva) {
    producto.porcentajeIva = 0;
  } else if (isNaN(producto.porcentajeIva)) {
    producto.porcentajeIva = 15;
  }

  if (producto.porcentajeIva < 0 || producto.porcentajeIva > 100) {
    mostrarToast("El porcentaje de IVA debe estar entre 0 y 100", "warning");
    return;
  }

  try {
    const esEdicion = producto.idProducto > 0;

    const response = await apiFetch(
      esEdicion ? `${API_URL}/${producto.idProducto}` : API_URL,
      {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
      }
    );

    if (!response || !response.ok) {
      let mensaje = "No se pudo guardar el producto";

      try {
        const errorData = await response.json();
        mensaje = errorData.mensaje || errorData.error || errorData.title || mensaje;
      } catch {
        try {
          mensaje = await response.text();
        } catch {}
      }

      throw new Error(mensaje);
    }

    formularioProductoContainer.classList.add("oculto");
    limpiarFormulario();

    await cargarProductos({
      irUltima: !esEdicion && !hayFiltroActivo()
    });

    mostrarToast(
      esEdicion ? "Producto actualizado correctamente" : "Producto guardado correctamente",
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
      renderProductos();
      return;
    }

    if (accion === "next" && paginaActual < totalPaginas) {
      modoTodos = false;
      paginaActual++;
      renderProductos();
      return;
    }

    if (accion === "all") {
      modoTodos = true;
      paginaActual = 1;
      renderProductos();
      return;
    }

    if (accion === "page") {
      const pagina = Number(boton.dataset.page);

      if (!Number.isNaN(pagina)) {
        modoTodos = false;
        paginaActual = pagina;
        renderProductos();
      }
    }
  });
}

async function cargarProductos(opciones = {}) {
  try {
    productosBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Cargando productos...</td>
      </tr>
    `;

    const response = await apiFetch(
      `${API_URL}/buscar?texto=&estado=${encodeURIComponent(obtenerEstadoFiltroProductos())}&pagina=1&tamanioPagina=100000&_=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response || !response.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const data = await response.json();
    productosTodos = Array.isArray(data) ? data : (data.datos || []);

    aplicarFiltroProductos(false);

    if (opciones.irUltima && productosFiltrados.length > 0) {
      modoTodos = false;
      totalPaginas = obtenerTotalPaginas();
      paginaActual = totalPaginas;
    }

    renderProductos();

  } catch (error) {
    productosTodos = [];
    productosFiltrados = [];
    productosBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Error al cargar productos</td>
      </tr>
    `;
    actualizarContadorProductos();
    actualizarPaginacion();
    mostrarToast("Error al cargar productos", "error");
  }
}

function aplicarFiltroProductos(reiniciarPagina) {
  const filtro = filtroProductoTabla ? filtroProductoTabla.value : "nombre";
  const valor = valorFiltroProducto ? valorFiltroProducto.value.trim().toLocaleLowerCase("es-EC") : "";

  if (!valor) {
    productosFiltrados = [...productosTodos];
  } else {
    productosFiltrados = productosTodos.filter(producto => {
      const idProducto = String(producto.idProducto || "");
      const nombreProducto = String(producto.nombre || "").toLocaleLowerCase("es-EC");
      const categoriaProducto = String(producto.categoria || "Otros").toLocaleLowerCase("es-EC");

      if (filtro === "id") {
        return idProducto.includes(valor);
      }

      if (filtro === "categoria") {
        return categoriaProducto.includes(valor);
      }

      if (filtro === "nombre") {
        return nombreProducto.includes(valor);
      }

      return true;
    });
  }

  if (reiniciarPagina) {
    paginaActual = 1;
    modoTodos = false;
    renderProductos();
  }
}

function renderProductos() {
  totalPaginas = obtenerTotalPaginas();

  if (!modoTodos && paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const productosPagina = modoTodos
    ? productosFiltrados
    : productosFiltrados.slice(
      (paginaActual - 1) * tamanioPagina,
      paginaActual * tamanioPagina
    );

  productosBody.innerHTML = "";

  if (productosPagina.length === 0) {
    productosBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          ${hayFiltroActivo() ? "No se encontraron productos" : "No existen productos registrados"}
        </td>
      </tr>
    `;
    actualizarContadorProductos();
    actualizarPaginacion();
    return;
  }

  productosPagina.forEach(producto => {
    productosBody.innerHTML += filaProducto(producto);
  });

  completarFilasPagina(productosPagina.length);
  actualizarContadorProductos();
  actualizarPaginacion();
}

function actualizarContadorProductos() {
  if (!productosTotalBadge) return;

  const totalProductos = productosTodos.length;
  const totalFiltrados = productosFiltrados.length;

  productosTotalBadge.textContent = hayFiltroActivo()
    ? `Mostrando ${totalFiltrados} de ${totalProductos} productos`
    : formatearTotalProductos(totalProductos);
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
  return Math.max(1, Math.ceil(productosFiltrados.length / tamanioPagina));
}

function actualizarPlaceholderFiltroProductos() {
  if (!filtroProductoTabla || !valorFiltroProducto) return;

  const placeholders = {
    id: "Ej: 15",
    nombre: "Ej: Laptop",
    categoria: "Ej: Tecnologia"
  };

  valorFiltroProducto.placeholder = placeholders[filtroProductoTabla.value] || placeholders.nombre;
}

function validarValorFiltroProductos() {
  if (!filtroProductoTabla || !valorFiltroProducto) return;

  const filtro = filtroProductoTabla.value;

  if (filtro === "id") {
    valorFiltroProducto.value = valorFiltroProducto.value.replace(/\D/g, "");
    return;
  }

  if (filtro === "nombre") {
    valorFiltroProducto.value = valorFiltroProducto.value.replace(/[^A-Za-z0-9\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "");
    return;
  }

  if (filtro === "categoria") {
    valorFiltroProducto.value = valorFiltroProducto.value.replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "");
  }
}

function normalizarNombreProducto(valor) {
  return valor
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, LONGITUD_MAXIMA_NOMBRE_PRODUCTO)
    .split(" ")
    .map(formatearPalabraProducto)
    .join(" ");
}

function formatearPalabraProducto(palabra) {
  if (!palabra) return "";

  if (esTokenTecnicoProducto(palabra)) {
    return palabra.charAt(0).toLocaleUpperCase("es-EC") + palabra.slice(1);
  }

  const palabraMinuscula = palabra.toLocaleLowerCase("es-EC");
  return palabraMinuscula.charAt(0).toLocaleUpperCase("es-EC") + palabraMinuscula.slice(1);
}

function esTokenTecnicoProducto(palabra) {
  return /\d/.test(palabra) && /[A-Z]{2,}/.test(palabra);
}

function hayFiltroActivo() {
  return Boolean(valorFiltroProducto && valorFiltroProducto.value.trim().length > 0) ||
    (esAdministrador && obtenerEstadoFiltroProductos() !== "Activo");
}

function formatearTotalProductos(total) {
  return total === 1
    ? "1 producto registrado"
    : `${total} productos registrados`;
}

function filaProducto(producto) {
  const estadoProducto = producto.estado || "Activo";
  const estaInactivo = estadoProducto === "Inactivo";
  const idProducto = String(producto.idProducto || "");
  const nombreProducto = String(producto.nombre || "");
  const categoriaProducto = String(producto.categoria || "Otros");

  return `
    <tr>
      <td>${obtenerTextoProductoResaltado("id", idProducto)}</td>

      <td>
        <div class="product-name">
          <span class="product-avatar">&#128230;</span>
          <span>${obtenerTextoProductoResaltado("nombre", nombreProducto)}</span>
        </div>
      </td>

      <td>$${Number(producto.precio).toFixed(2)}</td>

      <td>
        <span class="stock-badge">${producto.stock}</span>
      </td>

      <td>${obtenerTextoProductoResaltado("categoria", categoriaProducto)}</td>

      <td>${producto.aplicaIva ? "Sí" : "No"}</td>

      <td>${Number(producto.porcentajeIva || 0).toFixed(2)}%</td>

      <td>
        <div class="actions">
          ${renderAccionesProducto(producto.idProducto, estaInactivo)}
        </div>
      </td>
    </tr>
  `;
}

function obtenerTextoProductoResaltado(filtroObjetivo, texto) {
  const filtroActivo = filtroProductoTabla ? filtroProductoTabla.value : "nombre";
  const valor = valorFiltroProducto ? valorFiltroProducto.value.trim() : "";

  if (filtroActivo !== filtroObjetivo || !valor) {
    return escaparHtmlProducto(texto);
  }

  return resaltarCoincidenciaProducto(texto, valor);
}

function resaltarCoincidenciaProducto(texto, valor) {
  const textoOriginal = String(texto || "");
  const valorNormalizado = valor.toLocaleLowerCase("es-EC");
  const textoNormalizado = textoOriginal.toLocaleLowerCase("es-EC");
  const longitudValor = valor.length;
  let indice = textoNormalizado.indexOf(valorNormalizado);
  let posicionActual = 0;
  let textoResaltado = "";

  if (indice === -1) {
    return escaparHtmlProducto(textoOriginal);
  }

  while (indice !== -1) {
    textoResaltado += escaparHtmlProducto(textoOriginal.slice(posicionActual, indice));
    textoResaltado += `<span class="highlight-match">${escaparHtmlProducto(textoOriginal.slice(indice, indice + longitudValor))}</span>`;
    posicionActual = indice + longitudValor;
    indice = textoNormalizado.indexOf(valorNormalizado, posicionActual);
  }

  return textoResaltado + escaparHtmlProducto(textoOriginal.slice(posicionActual));
}

function escaparHtmlProducto(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAccionesProducto(idProducto, estaInactivo) {
  if (!esAdministrador) {
    return "";
  }

  if (estaInactivo) {
    return `<button class="btn-edit" onclick="reactivarProducto(${idProducto})">&#8635;</button>`;
  }

  return `
    <button class="btn-edit" onclick="editarProducto(${idProducto})">&#9998;</button>
    <button class="btn-delete" onclick="eliminarProducto(${idProducto})">&#128465;</button>
  `;
}

function completarFilasPagina(cantidadRegistros) {
  if (modoTodos || cantidadRegistros >= tamanioPagina) return;

  const filasFaltantes = tamanioPagina - cantidadRegistros;

  for (let i = 0; i < filasFaltantes; i++) {
    productosBody.innerHTML += `
      <tr class="table-placeholder-row" aria-hidden="true">
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `;
  }
}

window.editarProducto = async function(id) {
  try {
    const response = await apiFetch(`${API_URL}/${id}`);

    if (!response || !response.ok) {
      throw new Error("No se pudo obtener el producto");
    }

    const producto = await response.json();

    idProductoInput.value = producto.idProducto;
    nombreInput.value = normalizarNombreProducto(producto.nombre || "");
    precioInput.value = producto.precio;
    stockInput.value = producto.stock;
    if (categoriaInput) categoriaInput.value = producto.categoria || "Otros";
    if (aplicaIvaInput) aplicaIvaInput.checked = Boolean(producto.aplicaIva);
    if (porcentajeIvaInput) porcentajeIvaInput.value = Number(producto.porcentajeIva || 0);
    aplicarReglasIvaFormulario();

    tituloFormulario.textContent = "Editar Producto";
    btnGuardarProducto.textContent = "Actualizar Producto";

    formularioProductoContainer.classList.remove("oculto");

  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

window.eliminarProducto = async function(id) {
  const confirmar = await mostrarConfirmacion(
    "Eliminar producto",
    "Seguro que deseas eliminar este producto?"
  );

  if (!confirmar) return;

  try {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response || !response.ok) {
      let mensaje = "No se puede eliminar el producto porque ya esta asociado a una factura.";

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

    await cargarProductos();
    mostrarToast("Producto eliminado correctamente", "success");

  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

window.reactivarProducto = async function(id) {
  const confirmar = await mostrarConfirmacion(
    "Reactivar producto",
    "Seguro que deseas reactivar este producto?"
  );

  if (!confirmar) return;

  try {
    const response = await apiFetch(`${API_URL}/${id}/reactivar`, {
      method: "PUT"
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo reactivar el producto";

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

    await cargarProductos();
    mostrarToast("Producto reactivado correctamente", "success");

  } catch (error) {
    mostrarToast(error.message, "error");
  }
};

function configurarFiltroEstadoProductos() {
  if (!filtroEstadoProductoContainer || !filtroEstadoProducto) return;

  if (esAdministrador) {
    filtroEstadoProductoContainer.classList.remove("oculto");
    return;
  }

  filtroEstadoProducto.value = "Activo";
  filtroEstadoProductoContainer.classList.add("oculto");
}

function configurarPermisosProductos() {
  if (!btnMostrarFormulario) return;

  btnMostrarFormulario.classList.toggle("oculto", !esAdministrador);
}

function obtenerEstadoFiltroProductos() {
  if (!esAdministrador || !filtroEstadoProducto) {
    return "Activo";
  }

  return filtroEstadoProducto.value || "Activo";
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
  productoForm.reset();
  idProductoInput.value = "";
  if (categoriaInput) categoriaInput.value = "";
  if (aplicaIvaInput) aplicaIvaInput.checked = false;
  if (porcentajeIvaInput) {
    porcentajeIvaInput.value = "0";
    porcentajeIvaInput.disabled = true;
  }
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardarProducto.textContent = "Guardar Producto";
}

function aplicarReglasIvaFormulario() {
  if (!categoriaInput || !aplicaIvaInput || !porcentajeIvaInput) return;

  if (categoriaInput.value === "Tecnologia") {
    aplicaIvaInput.checked = true;
    aplicaIvaInput.disabled = true;
    porcentajeIvaInput.value = "15";
    porcentajeIvaInput.disabled = true;
    return;
  }

  aplicaIvaInput.disabled = false;

  if (!aplicaIvaInput.checked) {
    porcentajeIvaInput.value = "0";
    porcentajeIvaInput.disabled = true;
    return;
  }

  porcentajeIvaInput.disabled = false;

  if (!porcentajeIvaInput.value || Number(porcentajeIvaInput.value) === 0) {
    porcentajeIvaInput.value = "15";
  }
}
