const API_USUARIOS = "http://localhost:5161/api/Usuario";
const LONGITUD_MAXIMA_NOMBRE_USUARIO = 20;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$/;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PASSWORD_VALIDATION_MESSAGE = "La contrase\u00f1a debe tener entre 8 y 10 caracteres, incluir may\u00fascula, min\u00fascula, n\u00famero y car\u00e1cter especial.";

const usuarioForm = document.getElementById("usuarioForm");
const usuariosBody = document.getElementById("usuariosBody");

const idUsuarioInput = document.getElementById("idUsuario");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const btnTogglePasswordUsuario = document.getElementById("btnTogglePasswordUsuario");
const usuarioEyeOpen = document.getElementById("usuarioEyeOpen");
const usuarioEyeClosed = document.getElementById("usuarioEyeClosed");
const btnResetPasswordUsuario = document.getElementById("btnResetPasswordUsuario");
const rolInput = document.getElementById("rol");

const filtroUsuarioTabla = document.getElementById("filtroUsuarioTabla");
const valorFiltroUsuario = document.getElementById("valorFiltroUsuario");
const valorFiltroRolUsuario = document.getElementById("valorFiltroRolUsuario");
const valorFiltroEstadoUsuario = document.getElementById("valorFiltroEstadoUsuario");
const usuariosTotalBadge = document.getElementById("usuariosTotalBadge");

const btnCancelar = document.getElementById("btnCancelar");
const btnMostrarFormulario = document.getElementById("btnMostrarFormulario");
const btnCerrarFormulario = document.getElementById("btnCerrarFormulario");
const formularioUsuarioContainer = document.getElementById("formularioUsuarioContainer");
const tituloFormulario = document.getElementById("tituloFormulario");

const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const dashboardLayout = document.querySelector(".dashboard-layout");

const btnAnterior = document.getElementById("btnAnterior");
const paginaActualTexto = document.getElementById("paginaActual");
const paginacionControles = btnAnterior ? btnAnterior.parentElement : null;

let usuarios = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const usuariosPorPagina = 6;
let totalPaginas = 1;
let modoTodos = false;
let resetPasswordActivo = false;

document.addEventListener("DOMContentLoaded", () => {
  cargarDatosUsuario();
  actualizarPlaceholderFiltroUsuarios();
  cargarUsuarios();
});

if (btnToggleSidebar && dashboardLayout) {
  btnToggleSidebar.addEventListener("click", () => {
    dashboardLayout.classList.toggle("sidebar-collapsed");
  });
}

if (btnMostrarFormulario) {
  btnMostrarFormulario.addEventListener("click", abrirFormularioUsuario);
}

if (btnCerrarFormulario) {
  btnCerrarFormulario.addEventListener("click", cerrarFormularioUsuario);
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cerrarFormularioUsuario);
}

if (btnTogglePasswordUsuario) {
  btnTogglePasswordUsuario.addEventListener("click", alternarVisibilidadPassword);
}

if (btnResetPasswordUsuario) {
  btnResetPasswordUsuario.addEventListener("click", alternarResetPassword);
}

if (formularioUsuarioContainer) {
  formularioUsuarioContainer.addEventListener("click", (e) => {
    if (e.target === formularioUsuarioContainer) {
      cerrarFormularioUsuario();
    }
  });
}

nombreInput.addEventListener("input", () => {
  nombreInput.value = normalizarNombreUsuario(nombreInput.value);
});

if (filtroUsuarioTabla && valorFiltroUsuario && valorFiltroRolUsuario && valorFiltroEstadoUsuario) {
  filtroUsuarioTabla.addEventListener("change", () => {
    valorFiltroUsuario.value = "";
    valorFiltroRolUsuario.value = "";
    valorFiltroEstadoUsuario.value = "";
    actualizarPlaceholderFiltroUsuarios();
    aplicarFiltroUsuarios(true);
  });

  valorFiltroUsuario.addEventListener("input", () => {
    validarValorFiltroUsuarios();
    aplicarFiltroUsuarios(true);
  });

  valorFiltroRolUsuario.addEventListener("change", () => {
    aplicarFiltroUsuarios(true);
  });

  valorFiltroEstadoUsuario.addEventListener("change", () => {
    aplicarFiltroUsuarios(true);
  });
}

if (paginacionControles) {
  paginacionControles.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-page-action]");
    if (!boton || boton.disabled) return;

    const accion = boton.dataset.pageAction;

    if (accion === "prev" && paginaActual > 1) {
      modoTodos = false;
      paginaActual--;
      renderizarUsuarios();
      return;
    }

    if (accion === "next" && paginaActual < totalPaginas) {
      modoTodos = false;
      paginaActual++;
      renderizarUsuarios();
      return;
    }

    if (accion === "all") {
      modoTodos = true;
      paginaActual = 1;
      renderizarUsuarios();
      return;
    }

    if (accion === "page") {
      const pagina = Number(boton.dataset.page);

      if (!Number.isNaN(pagina)) {
        modoTodos = false;
        paginaActual = pagina;
        renderizarUsuarios();
      }
    }
  });
}

usuarioForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idUsuario = idUsuarioInput.value;
  const nombre = normalizarNombreUsuario(nombreInput.value);
  const correo = correoInput.value.trim();
  const password = passwordInput.value.trim();
  const rol = rolInput.value;

  nombreInput.value = nombre;

  if (!nombre || !correo || !rol) {
    mostrarToastUsuario("Nombre, correo y rol son obligatorios", "warning");
    return;
  }

  if (/\s/.test(nombre)) {
    mostrarToastUsuario("El nombre no debe contener espacios", "warning");
    return;
  }

  if (!EMAIL_REGEX.test(correo)) {
    mostrarToastUsuario("El correo electrónico no tiene un formato válido.", "warning");
    return;
  }

  try {
    let response;

    if (idUsuario) {
      const usuarioActual = usuarios.find(u => u.idUsuario == idUsuario);

      const datosActualizacion = {
        nombre,
        correo,
        rol,
        activo: usuarioActual ? usuarioActual.activo : true
      };

      if (resetPasswordActivo) {
        if (!password) {
          mostrarToastUsuario("Ingrese la nueva contrase\u00f1a para resetearla", "warning");
          return;
        }

        if (!PASSWORD_REGEX.test(password)) {
          mostrarToastUsuario(PASSWORD_VALIDATION_MESSAGE, "warning");
          return;
        }

        datosActualizacion.nuevaPassword = password;
      }

      response = await apiFetch(`${API_USUARIOS}/${idUsuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizacion)
      });
    } else {
      if (!password) {
        mostrarToastUsuario("La contrase\u00f1a es obligatoria para crear usuarios", "warning");
        return;
      }

      if (!PASSWORD_REGEX.test(password)) {
        mostrarToastUsuario(PASSWORD_VALIDATION_MESSAGE, "warning");
        return;
      }

      response = await apiFetch(API_USUARIOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          correo,
          password,
          rol
        })
      });
    }

    if (!response || !response.ok) {
      let mensaje = "No se pudo guardar el usuario";

      try {
        const errorData = await response.json();
        mensaje = errorData.mensaje || errorData.error || mensaje;
      } catch {}

      throw new Error(mensaje);
    }

    cerrarFormularioUsuario();
    await cargarUsuarios();

    mostrarToastUsuario(
      idUsuario ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
      "success"
    );

  } catch (error) {
    mostrarToastUsuario(error.message, "error");
  }
});

function mostrarToastUsuario(mensaje, tipo = "info") {
  const mensajeNormalizado = String(mensaje || "").trim();
  const toastExistente = Array.from(document.querySelectorAll(".toast .toast-message"))
    .some(toastMensaje => toastMensaje.textContent.trim() === mensajeNormalizado);

  if (toastExistente) return;

  mostrarToast(mensajeNormalizado, tipo);
}

async function obtenerMensajeError(response, mensajePorDefecto) {
  if (!response) return mensajePorDefecto;

  try {
    const data = await response.json();
    return data.mensaje || data.error || mensajePorDefecto;
  } catch {
    return mensajePorDefecto;
  }
}

async function cargarUsuarios() {
  try {
    usuariosBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Cargando usuarios...</td>
      </tr>
    `;

    const response = await apiFetch(API_USUARIOS);

    if (!response || !response.ok) {
      throw new Error("No se pudieron cargar los usuarios");
    }

    usuarios = await response.json();
    aplicarFiltroUsuarios(false);
    renderizarUsuarios();

  } catch (error) {
    usuarios = [];
    usuariosFiltrados = [];

    usuariosBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Error al cargar usuarios</td>
      </tr>
    `;

    actualizarContadorUsuarios();
    actualizarPaginacion();
    mostrarToastUsuario(error.message, "error");
  }
}

function aplicarFiltroUsuarios(reiniciarPagina) {
  const filtro = filtroUsuarioTabla ? filtroUsuarioTabla.value : "nombre";
  let valor = valorFiltroUsuario ? valorFiltroUsuario.value.trim().toLowerCase() : "";

  if (filtro === "rol") {
    valor = valorFiltroRolUsuario ? valorFiltroRolUsuario.value.trim().toLowerCase() : "";
  }

  if (filtro === "estado") {
    valor = valorFiltroEstadoUsuario ? valorFiltroEstadoUsuario.value.trim().toLowerCase() : "";
  }

  if (!valor) {
    usuariosFiltrados = [...usuarios];
  } else {
    usuariosFiltrados = usuarios.filter(usuario => {
      const idUsuario = String(usuario.idUsuario || "");
      const nombre = String(usuario.nombre || "").toLowerCase();
      const rol = String(usuario.rol || "").toLowerCase();
      const estado = obtenerEstadoUsuario(usuario).texto.toLowerCase();

      if (filtro === "id") return idUsuario.includes(valor);
      if (filtro === "rol") return rol === valor;
      if (filtro === "estado") return estado === valor;

      return nombre.includes(valor);
    });
  }

  if (reiniciarPagina) {
    paginaActual = 1;
    modoTodos = false;
    renderizarUsuarios();
  }
}

function renderizarUsuarios() {
  totalPaginas = obtenerTotalPaginas();

  if (!modoTodos && paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const inicio = (paginaActual - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = modoTodos ? usuariosFiltrados : usuariosFiltrados.slice(inicio, fin);

  usuariosBody.innerHTML = "";

  if (usuariosPagina.length === 0) {
    usuariosBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          ${hayFiltroActivo() ? "No se encontraron usuarios" : "No hay usuarios registrados"}
        </td>
      </tr>
    `;

    actualizarContadorUsuarios();
    actualizarPaginacion();
    return;
  }

  usuariosPagina.forEach(usuario => {
    usuariosBody.appendChild(crearFilaUsuario(usuario));
  });

  completarFilasPagina(usuariosPagina.length);
  actualizarContadorUsuarios();
  actualizarPaginacion();
}

function crearFilaUsuario(usuario) {
  const fila = document.createElement("tr");
  const estadoUsuario = obtenerEstadoUsuario(usuario);

  fila.innerHTML = `
    <td>${usuario.idUsuario}</td>
    <td>${usuario.nombre}</td>
    <td>${usuario.correo}</td>
    <td>
      <span class="role-badge ${usuario.rol === "Administrador" ? "admin" : "vendedor"}">
        ${usuario.rol}
      </span>
    </td>
    <td>
      <span class="status-badge ${estadoUsuario.clase}"
            title="${estadoUsuario.titulo}">
        ${estadoUsuario.texto}
      </span>
    </td>
    <td>
      <div class="action-row">
        <button class="icon-action edit"
                onclick="editarUsuario(${usuario.idUsuario})"
                title="Editar usuario">
          &#9998;
        </button>

        <button class="icon-action ${usuario.activo ? "delete" : "success"}"
                onclick="cambiarEstadoUsuario(${usuario.idUsuario})"
                title="${usuario.activo ? "Desactivar" : "Activar"}">
          ${usuario.activo ? "&#128465;" : "&#10004;"}
        </button>

        ${usuario.bloqueado ? `
          <button class="icon-action unlock"
                  onclick="desbloquearUsuario(${usuario.idUsuario})"
                  title="Desbloquear usuario">
            &#128275;
          </button>
        ` : ""}
      </div>
    </td>
  `;

  return fila;
}

function completarFilasPagina(cantidadRegistros) {
  if (modoTodos || cantidadRegistros >= usuariosPorPagina) return;

  const filasFaltantes = usuariosPorPagina - cantidadRegistros;

  for (let i = 0; i < filasFaltantes; i++) {
    const fila = document.createElement("tr");
    fila.className = "table-placeholder-row";
    fila.setAttribute("aria-hidden", "true");
    fila.innerHTML = `
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    `;

    usuariosBody.appendChild(fila);
  }
}

function obtenerEstadoUsuario(usuario) {
  if (usuario.bloqueado) {
    return {
      texto: "Bloqueado",
      clase: "bloqueado",
      titulo: `Intentos fallidos: ${usuario.intentosFallidos || 0}`
    };
  }

  if (usuario.activo) {
    return {
      texto: "Activo",
      clase: "activo",
      titulo: "Usuario activo"
    };
  }

  return {
    texto: "Inactivo",
    clase: "inactivo",
    titulo: "Usuario inactivo"
  };
}

function actualizarContadorUsuarios() {
  if (!usuariosTotalBadge) return;

  const totalUsuarios = usuarios.length;
  const totalFiltrados = usuariosFiltrados.length;

  usuariosTotalBadge.textContent = hayFiltroActivo()
    ? `Mostrando ${totalFiltrados} de ${totalUsuarios} usuarios`
    : formatearTotalUsuarios(totalUsuarios);
}

function actualizarPaginacion() {
  window.renderizarPaginacionNumerica({
    contenedor: paginacionControles,
    textoElemento: paginaActualTexto,
    paginaActual,
    totalPaginas,
    modoTodos,
    estadoDentro: true
  });
}

function obtenerTotalPaginas() {
  return Math.max(1, Math.ceil(usuariosFiltrados.length / usuariosPorPagina));
}

function actualizarPlaceholderFiltroUsuarios() {
  if (!filtroUsuarioTabla || !valorFiltroUsuario || !valorFiltroRolUsuario || !valorFiltroEstadoUsuario) return;

  const filtro = filtroUsuarioTabla.value;
  const esRol = filtro === "rol";
  const esEstado = filtro === "estado";

  valorFiltroUsuario.classList.toggle("oculto", esRol || esEstado);
  valorFiltroRolUsuario.classList.toggle("oculto", !esRol);
  valorFiltroEstadoUsuario.classList.toggle("oculto", !esEstado);

  const placeholders = {
    id: "Ej: 2",
    nombre: "Ej: Administrador",
    estado: "Ej: Activo"
  };

  valorFiltroUsuario.placeholder = placeholders[filtro] || placeholders.nombre;
  valorFiltroUsuario.inputMode = filtro === "id" ? "numeric" : "text";
}

function validarValorFiltroUsuarios() {
  if (!filtroUsuarioTabla || !valorFiltroUsuario) return;

  const filtro = filtroUsuarioTabla.value;

  if (filtro === "id") {
    valorFiltroUsuario.value = valorFiltroUsuario.value.replace(/\D/g, "");
    return;
  }

  if (filtro === "nombre") {
    valorFiltroUsuario.value = normalizarNombreUsuario(valorFiltroUsuario.value);
    return;
  }

}

function hayFiltroActivo() {
  if (!filtroUsuarioTabla) return false;

  if (filtroUsuarioTabla.value === "rol") {
    return Boolean(valorFiltroRolUsuario && valorFiltroRolUsuario.value.trim().length > 0);
  }

  if (filtroUsuarioTabla.value === "estado") {
    return Boolean(valorFiltroEstadoUsuario && valorFiltroEstadoUsuario.value.trim().length > 0);
  }

  return Boolean(valorFiltroUsuario && valorFiltroUsuario.value.trim().length > 0);
}

function formatearTotalUsuarios(total) {
  return total === 1
    ? "1 usuario registrado"
    : `${total} usuarios registrados`;
}

function normalizarNombreUsuario(valor) {
  const textoSinEspacios = valor
    .replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "")
    .replace(/\s+/g, "")
    .slice(0, LONGITUD_MAXIMA_NOMBRE_USUARIO);

  if (!textoSinEspacios) return "";

  const textoMinusculas = textoSinEspacios.toLocaleLowerCase("es-EC");
  return textoMinusculas.charAt(0).toLocaleUpperCase("es-EC") + textoMinusculas.slice(1);
}

function abrirFormularioUsuario() {
  limpiarFormulario();

  tituloFormulario.textContent = "Registrar Usuario";
  formularioUsuarioContainer.classList.remove("oculto");
}

function alternarVisibilidadPassword() {
  if (!passwordInput || passwordInput.disabled) return;

  const mostrarPassword = passwordInput.type === "password";
  passwordInput.type = mostrarPassword ? "text" : "password";
  actualizarBotonPassword(mostrarPassword);
}

function actualizarBotonPassword(passwordVisible) {
  if (!btnTogglePasswordUsuario) return;

  btnTogglePasswordUsuario.setAttribute(
    "aria-label",
    passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
  );
  btnTogglePasswordUsuario.title = passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña";

  if (usuarioEyeOpen && usuarioEyeClosed) {
    usuarioEyeOpen.classList.toggle("oculto", passwordVisible);
    usuarioEyeClosed.classList.toggle("oculto", !passwordVisible);
  }
}

function alternarResetPassword() {
  configurarResetPassword(!resetPasswordActivo);
}

function configurarResetPassword(activo) {
  resetPasswordActivo = activo;
  passwordInput.disabled = false;
  passwordInput.value = "";
  passwordInput.type = "password";
  passwordInput.placeholder = activo ? "Ingrese la nueva contraseña" : "No se cambia desde edición";

  if (btnTogglePasswordUsuario) {
    btnTogglePasswordUsuario.classList.toggle("oculto", !activo);
    btnTogglePasswordUsuario.disabled = !activo;
    actualizarBotonPassword(false);
  }

  if (btnResetPasswordUsuario) {
    btnResetPasswordUsuario.textContent = activo ? "Cancelar reset" : "Resetear contraseña";
  }

  passwordInput.disabled = !activo;

  if (activo) {
    passwordInput.focus();
  }
}

function cerrarFormularioUsuario() {
  formularioUsuarioContainer.classList.add("oculto");
  limpiarFormulario();
}

window.editarUsuario = function(id) {
  const usuario = usuarios.find(u => u.idUsuario === id);

  if (!usuario) {
    mostrarToastUsuario("Usuario no encontrado", "error");
    return;
  }

  idUsuarioInput.value = usuario.idUsuario;
  nombreInput.value = normalizarNombreUsuario(usuario.nombre || "");
  correoInput.value = usuario.correo;
  passwordInput.value = "";
  rolInput.value = usuario.rol;

  passwordInput.disabled = true;
  passwordInput.placeholder = "No se cambia desde edici\u00f3n";
  passwordInput.type = "password";

  configurarResetPassword(false);

  if (btnResetPasswordUsuario) {
    btnResetPasswordUsuario.classList.remove("oculto");
    btnResetPasswordUsuario.disabled = false;
    btnResetPasswordUsuario.textContent = "Resetear contraseña";
  }

  tituloFormulario.textContent = "Editar Usuario";
  formularioUsuarioContainer.classList.remove("oculto");
};

window.cambiarEstadoUsuario = async function(id) {
  try {
    const response = await apiFetch(`${API_USUARIOS}/${id}/estado`, {
      method: "PATCH"
    });

    if (!response || !response.ok) {
      const mensaje = await obtenerMensajeError(response, "No se pudo cambiar el estado del usuario");
      throw new Error(mensaje);
    }

    await cargarUsuarios();
    mostrarToastUsuario("Estado actualizado correctamente", "success");

  } catch (error) {
    mostrarToastUsuario(error.message, "error");
  }
};

window.desbloquearUsuario = async function(id) {
  try {
    const response = await apiFetch(`${API_USUARIOS}/${id}/desbloquear`, {
      method: "PATCH"
    });

    if (!response || !response.ok) {
      const mensaje = await obtenerMensajeError(response, "No se pudo desbloquear el usuario");
      throw new Error(mensaje);
    }

    await cargarUsuarios();
    mostrarToastUsuario("Usuario desbloqueado correctamente", "success");

  } catch (error) {
    mostrarToastUsuario(error.message, "error");
  }
};

function limpiarFormulario() {
  usuarioForm.reset();

  idUsuarioInput.value = "";
  resetPasswordActivo = false;
  passwordInput.disabled = false;
  passwordInput.type = "password";
  passwordInput.placeholder = "Ingrese la contrase\u00f1a";

  if (btnTogglePasswordUsuario) {
    btnTogglePasswordUsuario.classList.remove("oculto");
    btnTogglePasswordUsuario.disabled = false;
    actualizarBotonPassword(false);
  }

  if (btnResetPasswordUsuario) {
    btnResetPasswordUsuario.classList.add("oculto");
    btnResetPasswordUsuario.disabled = false;
    btnResetPasswordUsuario.textContent = "Resetear contraseña";
  }
}

function cargarDatosUsuario() {
  const nombre = localStorage.getItem("nombre");
  const rol = localStorage.getItem("rol");

  const usuarioNombre = document.getElementById("usuarioNombre");
  const usuarioRol = document.getElementById("usuarioRol");
  const userAvatar = document.querySelector(".user-avatar");

  if (usuarioNombre && nombre) {
    usuarioNombre.textContent = nombre;
  }

  if (usuarioRol && rol) {
    usuarioRol.textContent = rol;
  }

  if (userAvatar && nombre) {
    userAvatar.textContent = nombre.charAt(0).toUpperCase();
  }
}
