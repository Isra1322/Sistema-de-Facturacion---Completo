import { ClienteRepository } from "../../infrastructure/repositories/ClienteRepository.js";
import { ObtenerClientesUseCase } from "../../application/useCases/clientes/ObtenerClientesUseCase.js";
import { CrearClienteUseCase } from "../../application/useCases/clientes/CrearClienteUseCase.js";
import { ToastNotifier } from "../../infrastructure/notifiers/ToastNotifier.js";
import { resaltarCoincidencia, escaparHtml, mostrarConfirmacion } from "../../shared/helpers/domHelpers.js";

export class ClientesPage {
  constructor() {
    this.clienteRepository = new ClienteRepository();
    this.obtenerClientesUC = new ObtenerClientesUseCase(this.clienteRepository);
    this.crearClienteUC = new CrearClienteUseCase(this.clienteRepository);

    this.clientesTodos = [];
    this.clientesFiltrados = [];
    this.paginaActual = 1;
    this.tamanioPagina = 6;
    this.modoTodos = false;

    this.rolUsuario = localStorage.getItem("rol") || sessionStorage.getItem("rol") || "";
    this.esAdministrador = this.rolUsuario === "Administrador";
  }

  init() {
    this._bindElements();
    this._bindEvents();
    this._configurePermissions();
    this._setupGlobalCallbacks();
    this.cargarClientes();
  }

  _bindElements() {
    this.form = document.getElementById("clienteForm");
    this.body = document.getElementById("clientesBody");
    this.buscarInput = document.getElementById("valorFiltroCliente");
    this.filtroSelect = document.getElementById("filtroClienteTabla");
    this.filtroEstadoContainer = document.getElementById("filtroEstadoClienteContainer");
    this.filtroEstado = document.getElementById("filtroEstadoCliente");
    
    this.idInput = document.getElementById("idCliente");
    this.nombreInput = document.getElementById("nombre");
    this.apellidoInput = document.getElementById("apellido");
    this.direccionInput = document.getElementById("direccion");
    this.telefonoInput = document.getElementById("telefono");
    this.correoInput = document.getElementById("correo");

    this.btnMostrarForm = document.getElementById("btnMostrarFormulario");
    this.btnCerrarForm = document.getElementById("btnCerrarFormulario");
    this.formContainer = document.getElementById("formularioClienteContainer");
    this.tituloForm = document.getElementById("tituloFormulario");
    this.btnGuardar = document.getElementById("btnGuardarCliente");

    this.btnAnterior = document.getElementById("btnAnterior");
    this.btnSiguiente = document.getElementById("btnSiguiente");
    this.paginaActualTexto = document.getElementById("paginaActual");
    this.paginacionControles = this.btnAnterior ? this.btnAnterior.parentElement : null;
    this.totalBadge = document.getElementById("clientesTotalBadge");
  }

  _bindEvents() {
    if (this.btnMostrarForm) {
      this.btnMostrarForm.addEventListener("click", () => {
        this.limpiarFormulario();
        this.formContainer.classList.remove("oculto");
        this.nombreInput.focus();
      });
    }

    if (this.btnCerrarForm) {
      this.btnCerrarForm.addEventListener("click", () => {
        this.formContainer.classList.add("oculto");
      });
    }

    if (this.filtroSelect && this.buscarInput) {
      this.filtroSelect.addEventListener("change", () => {
        this.buscarInput.value = "";
        this.actualizarPlaceholderFiltro();
        this.aplicarFiltro(true);
        this.buscarInput.focus();
      });

      this.buscarInput.addEventListener("input", () => {
        this.validarFiltroInput();
        this.aplicarFiltro(true);
      });
    }

    if (this.filtroEstado) {
      this.filtroEstado.addEventListener("change", () => {
        this.paginaActual = 1;
        this.modoTodos = false;
        this.cargarClientes();
      });
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.guardarCliente(e));
    }

    if (this.paginacionControles) {
      this.paginacionControles.addEventListener("click", (e) => this.manejarPaginacion(e));
    }

    // Normalizaciones y validaciones dinámicas idénticas al legacy
    if (this.nombreInput) {
      this.nombreInput.addEventListener("input", (e) => {
        e.target.value = this.normalizarNombreApellido(e.target.value);
      });
    }
    if (this.apellidoInput) {
      this.apellidoInput.addEventListener("input", (e) => {
        e.target.value = this.normalizarNombreApellido(e.target.value);
      });
    }
    if (this.telefonoInput) {
      this.telefonoInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      });
    }
  }

  _setupGlobalCallbacks() {
    window.editarCliente = (id) => this.editarCliente(id);
    window.eliminarCliente = (id) => this.eliminarCliente(id);
    window.reactivarCliente = (id) => this.reactivarCliente(id);
  }

  _configurePermissions() {
    if (this.filtroEstadoContainer && this.filtroEstado) {
      if (this.esAdministrador) {
        this.filtroEstadoContainer.classList.remove("oculto");
      } else {
        this.filtroEstado.value = "Activo";
        this.filtroEstadoContainer.classList.add("oculto");
      }
    }
  }

  normalizarNombreApellido(valor) {
    const textoSinEspacios = valor
      .replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "")
      .replace(/\s+/g, "")
      .slice(0, 20);

    if (!textoSinEspacios) return "";
    const textoMinusculas = textoSinEspacios.toLocaleLowerCase("es-EC");
    return textoMinusculas.charAt(0).toLocaleUpperCase("es-EC") + textoMinusculas.slice(1);
  }

  async cargarClientes(opciones = {}) {
    try {
      this.body.innerHTML = `<tr><td colspan="6" class="empty-state">Cargando clientes...</td></tr>`;
      
      const estadoFiltro = (!this.esAdministrador || !this.filtroEstado) ? "Activo" : (this.filtroEstado.value || "Activo");
      
      this.clientesTodos = await this.obtenerClientesUC.execute({ estado: estadoFiltro });
      this.aplicarFiltro(false);

      if (opciones.irUltima && this.clientesFiltrados.length > 0) {
        this.modoTodos = false;
        const total = Math.max(1, Math.ceil(this.clientesFiltrados.length / this.tamanioPagina));
        this.paginaActual = total;
      }
      this.render();
    } catch (err) {
      this.clientesTodos = [];
      this.clientesFiltrados = [];
      this.body.innerHTML = `<tr><td colspan="6" class="empty-state">Error al cargar clientes</td></tr>`;
      this.actualizarContadores();
      ToastNotifier.error("Error al cargar clientes");
    }
  }

  aplicarFiltro(reiniciarPagina = false) {
    const filtro = this.filtroSelect ? this.filtroSelect.value : "nombre";
    const valor = this.buscarInput ? this.buscarInput.value.trim().toLowerCase() : "";

    if (!valor) {
      this.clientesFiltrados = [...this.clientesTodos];
    } else {
      this.clientesFiltrados = this.clientesTodos.filter(c => {
        const id = String(c.idCliente || "");
        const nom = String(c.nombre || "").toLowerCase();
        const ape = String(c.apellido || "").toLowerCase();
        const dir = String(c.direccion || "").toLowerCase();
        const cor = String(c.correo || "").toLowerCase();

        if (filtro === "id") return id.includes(valor);
        if (filtro === "nombre") return nom.includes(valor);
        if (filtro === "apellido") return ape.includes(valor);
        if (filtro === "direccion") return dir.includes(valor);
        if (filtro === "correo") return cor.includes(valor);
        return true;
      });
    }

    if (reiniciarPagina) {
      this.paginaActual = 1;
      this.modoTodos = false;
      this.render();
    }
  }

  render() {
    const totalPaginas = Math.max(1, Math.ceil(this.clientesFiltrados.length / this.tamanioPagina));
    if (!this.modoTodos && this.paginaActual > totalPaginas) {
      this.paginaActual = totalPaginas;
    }

    const items = this.modoTodos
      ? this.clientesFiltrados
      : this.clientesFiltrados.slice((this.paginaActual - 1) * this.tamanioPagina, this.paginaActual * this.tamanioPagina);

    this.body.innerHTML = "";

    if (items.length === 0) {
      this.body.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            ${this.buscarInput && this.buscarInput.value.trim() ? "No se encontraron clientes" : "No existen clientes registrados"}
          </td>
        </tr>
      `;
      this.actualizarContadores(totalPaginas);
      return;
    }

    items.forEach(c => {
      const tr = document.createElement("tr");
      const iniciales = `${c.nombre?.[0] || ""}${c.apellido?.[0] || ""}`.toUpperCase();
      
      const resId = this.resaltar("id", String(c.idCliente));
      const resNom = this.resaltar("nombre", c.nombre);
      const resApe = this.resaltar("apellido", c.apellido);
      const resCor = this.resaltar("correo", c.correo);
      const resDir = this.resaltar("direccion", c.direccion);

      const nombreCompleto = `${resNom}${c.nombre && c.apellido ? " " : ""}${resApe}`;
      const estaInactivo = c.estado === "Inactivo";

      tr.innerHTML = `
        <td>${resId}</td>
        <td>
          <div class="client-name">
            <span class="client-avatar">${iniciales}</span>
            <span>${nombreCompleto}</span>
          </div>
        </td>
        <td>
          <span class="phone-cell">
            <span class="phone-icon">☎</span>
            <span>${c.telefono}</span>
          </span>
        </td>
        <td>${resCor}</td>
        <td>${resDir}</td>
        <td>
          <div class="actions">
            ${estaInactivo && this.esAdministrador
              ? `<button class="btn-edit" onclick="reactivarCliente(${c.idCliente})">↻</button>`
              : `
                <button class="btn-edit" onclick="editarCliente(${c.idCliente})">✎</button>
                <button class="btn-delete" onclick="eliminarCliente(${c.idCliente})">🗑</button>
              `}
          </div>
        </td>
      `;
      this.body.appendChild(tr);
    });

    this.completarFilas(items.length);
    this.actualizarContadores(totalPaginas);
  }

  resaltar(filtroObjetivo, texto) {
    const filtroActivo = this.filtroSelect ? this.filtroSelect.value : "nombre";
    const valor = this.buscarInput ? this.buscarInput.value.trim() : "";
    if (filtroActivo !== filtroObjetivo || !valor) {
      return escaparHtml(texto);
    }
    return resaltarCoincidencia(texto, valor);
  }

  completarFilas(cantidad) {
    if (this.modoTodos || cantidad >= this.tamanioPagina) return;
    const faltantes = this.tamanioPagina - cantidad;
    for (let i = 0; i < faltantes; i++) {
      const tr = document.createElement("tr");
      tr.className = "table-placeholder-row";
      tr.setAttribute("aria-hidden", "true");
      tr.innerHTML = `<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>`;
      this.body.appendChild(tr);
    }
  }

  actualizarContadores(totalPaginas) {
    if (this.totalBadge) {
      this.totalBadge.textContent = this.buscarInput && this.buscarInput.value.trim()
        ? `Mostrando ${this.clientesFiltrados.length} de ${this.clientesTodos.length} clientes`
        : (this.clientesTodos.length === 1 ? "1 cliente registrado" : `${this.clientesTodos.length} clientes registrados`);
    }

    if (window.renderizarPaginacionNumerica) {
      window.renderizarPaginacionNumerica({
        contenedor: this.paginacionControles,
        textoElemento: this.paginaActualTexto,
        paginaActual: this.paginaActual,
        totalPaginas,
        modoTodos: this.modoTodos
      });
    }
  }

  manejarPaginacion(e) {
    const btn = e.target.closest("button[data-page-action]");
    if (!btn || btn.disabled) return;

    const action = btn.dataset.pageAction;
    const totalPaginas = Math.max(1, Math.ceil(this.clientesFiltrados.length / this.tamanioPagina));

    if (action === "prev" && this.paginaActual > 1) {
      this.modoTodos = false;
      this.paginaActual--;
    } else if (action === "next" && this.paginaActual < totalPaginas) {
      this.modoTodos = false;
      this.paginaActual++;
    } else if (action === "all") {
      this.modoTodos = true;
      this.paginaActual = 1;
    } else if (action === "page") {
      this.modoTodos = false;
      this.paginaActual = Number(btn.dataset.page);
    }
    this.render();
  }

  actualizarPlaceholderFiltro() {
    if (!this.filtroSelect || !this.buscarInput) return;
    const placeholders = {
      id: "Ej: 2",
      nombre: "Ej: Juan",
      apellido: "Ej: Pérez",
      correo: "Ej: juan@gmail.com",
      direccion: "Ej: Av. Bolívar"
    };
    this.buscarInput.placeholder = placeholders[this.filtroSelect.value] || placeholders.nombre;
  }

  validarFiltroInput() {
    if (!this.filtroSelect || !this.buscarInput) return;
    const filtro = this.filtroSelect.value;
    if (filtro === "id") {
      this.buscarInput.value = this.buscarInput.value.replace(/\D/g, "");
    } else if (filtro === "nombre" || filtro === "apellido") {
      this.buscarInput.value = this.buscarInput.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }
  }

  limpiarFormulario() {
    if (this.form) this.form.reset();
    if (this.idInput) this.idInput.value = "";
    if (this.tituloForm) this.tituloForm.textContent = "Registrar Cliente";
    if (this.btnGuardar) this.btnGuardar.textContent = "Guardar Cliente";
  }

  async editarCliente(id) {
    try {
      // El cliente ya está cargado en memoria — búscalo en la lista local
      const cliente = this.clientesTodos.find(c => c.idCliente === id);
      if (!cliente) {
        throw new Error("No se pudo obtener el cliente");
      }

      this.idInput.value = cliente.idCliente;
      this.nombreInput.value = this.normalizarNombreApellido(cliente.nombre || "");
      this.apellidoInput.value = this.normalizarNombreApellido(cliente.apellido || "");
      this.direccionInput.value = cliente.direccion;
      this.telefonoInput.value = cliente.telefono;
      this.correoInput.value = cliente.correo;

      this.tituloForm.textContent = "Editar Cliente";
      this.btnGuardar.textContent = "Actualizar Cliente";
      this.formContainer.classList.remove("oculto");
      this.nombreInput.focus();
    } catch (err) {
      ToastNotifier.error(err.message);
    }
  }

  async guardarCliente(e) {
    e.preventDefault();
    const id = this.idInput.value ? Number(this.idInput.value) : 0;
    
    const clientePayload = {
      idCliente: id,
      nombre: this.normalizarNombreApellido(this.nombreInput.value),
      apellido: this.normalizarNombreApellido(this.apellidoInput.value),
      direccion: this.direccionInput.value.trim(),
      telefono: this.telefonoInput.value.trim(),
      correo: this.correoInput.value.trim()
    };

    if (!clientePayload.nombre || !clientePayload.apellido || !clientePayload.direccion || !clientePayload.telefono || !clientePayload.correo) {
      ToastNotifier.warning("Todos los campos son obligatorios");
      return;
    }

    if (!/^09\d{8}$/.test(clientePayload.telefono)) {
      ToastNotifier.warning("El teléfono debe iniciar con 09 y tener 10 dígitos");
      return;
    }

    try {
      this.btnGuardar.disabled = true;
      this.btnGuardar.textContent = "Guardando...";

      await this.crearClienteUC.execute(clientePayload);

      this.formContainer.classList.add("oculto");
      this.limpiarFormulario();
      await this.cargarClientes({ irUltima: id === 0 });
      ToastNotifier.success(id > 0 ? "Cliente actualizado correctamente" : "Cliente guardado correctamente");
    } catch (err) {
      ToastNotifier.error(err.message);
    } finally {
      this.btnGuardar.disabled = false;
      this.btnGuardar.textContent = id > 0 ? "Actualizar Cliente" : "Guardar Cliente";
    }
  }

  async eliminarCliente(id) {
    const confirm = await mostrarConfirmacion("Eliminar cliente", "¿Seguro que deseas eliminar este cliente?");
    if (!confirm) return;

    try {
      await this.clienteRepository.eliminar(id);
      await this.cargarClientes();
      ToastNotifier.success("Cliente eliminado correctamente");
    } catch (err) {
      ToastNotifier.error(err.message);
    }
  }

  async reactivarCliente(id) {
    const confirm = await mostrarConfirmacion("Reactivar cliente", "¿Seguro que deseas reactivar este cliente?");
    if (!confirm) return;

    try {
      await this.clienteRepository.reactivar(id);
      await this.cargarClientes();
      ToastNotifier.success("Cliente reactivado correctamente");
    } catch (err) {
      ToastNotifier.error(err.message);
    }
  }
}
