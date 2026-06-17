import { ClienteRepository } from "../../infrastructure/repositories/ClienteRepository.js";
import { ProductoRepository } from "../../infrastructure/repositories/ProductoRepository.js";
import { FacturaRepository } from "../../infrastructure/repositories/FacturaRepository.js";
import { CrearFacturaUseCase } from "../../application/useCases/factura/CrearFacturaUseCase.js";
import { Factura } from "../../core/entities/Factura.js";
import { Cliente } from "../../core/entities/Cliente.js";
import { Producto } from "../../core/entities/Producto.js";
import { ToastNotifier } from "../../infrastructure/notifiers/ToastNotifier.js";
import { resaltarCoincidencia, escaparHtml } from "../../shared/helpers/domHelpers.js";

export class FacturaPage {
  constructor() {
    this.clienteRepository = new ClienteRepository();
    this.productoRepository = new ProductoRepository();
    this.facturaRepository = new FacturaRepository();
    this.crearFacturaUC = new CrearFacturaUseCase(this.facturaRepository);

    this.factura = new Factura({});
    
    // Datos cargados para modals
    this.clientesTodos = [];
    this.clientesFiltrados = [];
    this.paginaClientes = 1;
    this.clientesPorPagina = 5;

    this.productosTodos = [];
    this.productosFiltrados = [];
    this.paginaProductos = 1;
    this.productosPorPagina = 5;

    this.productoSeleccionado = null;
    this.productoIdQuitar = null;
  }

  init() {
    this._bindElements();
    this._bindEvents();
    this._iniciarFechaHora();
    this._inicializarUsuario();
  }

  _bindElements() {
    // Datos usuario
    this.usuarioNombreVista = document.getElementById("usuarioNombreVista");
    this.usuarioRolVista = document.getElementById("usuarioRolVista");
    this.fechaActualFactura = document.getElementById("fechaActualFactura");
    this.horaActualFactura = document.getElementById("horaActualFactura");

    // Clientes
    this.btnAbrirBusquedaCliente = document.getElementById("btnAbrirBusquedaCliente");
    this.modalClientes = document.getElementById("modalBusquedaClientesFactura");
    this.btnCerrarBusquedaCliente = document.getElementById("btnCerrarBusquedaClienteFactura");
    this.filtroCliente = document.getElementById("filtroClienteFactura");
    this.valorBusquedaCliente = document.getElementById("valorBusquedaClienteFactura");
    this.resultadosClientesBody = document.getElementById("resultadosBusquedaClientesFacturaBody");
    this.clientesTotalTexto = document.getElementById("clientesFacturaTotalTexto");
    this.paginaClientesTexto = document.getElementById("paginaClientesFacturaTexto");
    this.paginacionClientesControles = document.getElementById("paginacionClientesFacturaControles");
    this.clienteSeleccionadoBody = document.getElementById("clienteSeleccionadoBody");

    // Cliente registro rápido
    this.btnAbrirRegistroCliente = document.getElementById("btnAbrirRegistroClienteFactura");
    this.modalRegistroCliente = document.getElementById("modalRegistroClienteFactura");
    this.btnCerrarRegistroCliente = document.getElementById("btnCerrarRegistroClienteFactura");
    this.formRegistroCliente = document.getElementById("formRegistroClienteFactura");
    this.regNombre = document.getElementById("registroClienteNombreFactura");
    this.regApellido = document.getElementById("registroClienteApellidoFactura");
    this.regTelefono = document.getElementById("registroClienteTelefonoFactura");
    this.regCorreo = document.getElementById("registroClienteCorreoFactura");
    this.regDireccion = document.getElementById("registroClienteDireccionFactura");
    this.btnGuardarCliente = document.getElementById("btnGuardarRegistroClienteFactura");

    // Productos
    this.btnAbrirBusquedaProducto = document.getElementById("btnAbrirBusquedaProducto");
    this.modalProductos = document.getElementById("modalBusquedaProductosFactura");
    this.btnCerrarBusquedaProducto = document.getElementById("btnCerrarBusquedaProductoFactura");
    this.filtroProducto = document.getElementById("filtroProductoFactura");
    this.valorBusquedaProducto = document.getElementById("valorBusquedaProductoFactura");
    this.resultadosProductosBody = document.getElementById("resultadosBusquedaProductosFacturaBody");
    this.productosTotalTexto = document.getElementById("productosFacturaTotalTexto");
    this.paginaProductosTexto = document.getElementById("paginaProductosFacturaTexto");
    this.paginacionProductosControles = document.getElementById("paginacionProductosFacturaControles");

    this.txtProductoNombre = document.getElementById("productoNombre");
    this.txtProductoPrecio = document.getElementById("productoPrecio");
    this.txtProductoStock = document.getElementById("productoStock");
    this.txtProductoIva = document.getElementById("productoIva");
    this.inputCantidad = document.getElementById("cantidadProducto");
    this.btnRestar = document.getElementById("btnRestarCantidad");
    this.btnSumar = document.getElementById("btnSumarCantidad");
    this.btnAgregar = document.getElementById("btnAgregarProducto");

    // Totales y acciones
    this.detalleBody = document.getElementById("detalleFacturaBody");
    this.txtSubtotal = document.getElementById("subtotalFactura");
    this.txtIva = document.getElementById("ivaFactura");
    this.txtTotal = document.getElementById("totalFactura");
    this.btnGuardarFactura = document.getElementById("btnGuardarFactura");
    this.btnCancelarFactura = document.getElementById("btnCancelarFactura");

    // Modales de confirmación
    this.modalConfirmarQuitar = document.getElementById("modalConfirmacionDetalle");
    this.btnCancelarQuitar = document.getElementById("btnCancelarQuitar");
    this.btnAceptarQuitar = document.getElementById("btnAceptarQuitar");

    this.modalConfirmarCancelar = document.getElementById("modalConfirmacionCancelarFactura");
    this.btnCancelarLimpieza = document.getElementById("btnCancelarLimpiezaFactura");
    this.btnAceptarLimpieza = document.getElementById("btnAceptarLimpiezaFactura");
  }

  _bindEvents() {
    // Eventos de Clientes
    this.btnAbrirBusquedaCliente.addEventListener("click", () => this.abrirBusquedaClientes());
    this.btnCerrarBusquedaCliente.addEventListener("click", () => this.modalClientes.classList.add("oculto"));
    this.filtroCliente.addEventListener("change", () => {
      this.valorBusquedaCliente.value = "";
      this.aplicarFiltroClientes(true);
    });
    this.valorBusquedaCliente.addEventListener("input", () => this.aplicarFiltroClientes(true));
    this.paginacionClientesControles.addEventListener("click", (e) => this.manejarPaginacionClientes(e));

    // Registro rápido cliente
    this.btnAbrirRegistroCliente.addEventListener("click", () => {
      this.formRegistroCliente.reset();
      this.modalRegistroCliente.classList.remove("oculto");
    });
    this.btnCerrarRegistroCliente.addEventListener("click", () => this.modalRegistroCliente.classList.add("oculto"));
    this.formRegistroCliente.addEventListener("submit", (e) => this.guardarClienteRapido(e));
    this.regNombre.addEventListener("input", () => this.regNombre.value = this.regNombre.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").slice(0, 20));
    this.regApellido.addEventListener("input", () => this.regApellido.value = this.regApellido.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").slice(0, 20));
    this.regTelefono.addEventListener("input", () => this.regTelefono.value = this.regTelefono.value.replace(/\D/g, "").slice(0, 10));

    // Eventos de Productos
    this.btnAbrirBusquedaProducto.addEventListener("click", () => this.abrirBusquedaProductos());
    this.btnCerrarBusquedaProducto.addEventListener("click", () => this.modalProductos.classList.add("oculto"));
    this.filtroProducto.addEventListener("change", () => {
      this.valorBusquedaProducto.value = "";
      this.aplicarFiltroProductos(true);
    });
    this.valorBusquedaProducto.addEventListener("input", () => this.aplicarFiltroProductos(true));
    this.paginacionProductosControles.addEventListener("click", (e) => this.manejarPaginacionProductos(e));

    // Cantidades y Agregar
    this.btnRestar.addEventListener("click", () => {
      let val = parseInt(this.inputCantidad.value) || 1;
      if (val > 1) this.inputCantidad.value = val - 1;
    });
    this.btnSumar.addEventListener("click", () => {
      let val = parseInt(this.inputCantidad.value) || 1;
      this.inputCantidad.value = val + 1;
    });
    this.btnAgregar.addEventListener("click", () => this.agregarProductoAFactura());

    // Quitar del detalle (Modal de confirmación)
    this.btnCancelarQuitar.addEventListener("click", () => this.modalConfirmarQuitar.classList.add("oculto"));
    this.btnAceptarQuitar.addEventListener("click", () => {
      if (this.productoIdQuitar !== null) {
        this.factura.quitarDetalle(this.productoIdQuitar);
        this.renderDetalle();
        this.modalConfirmarQuitar.classList.add("oculto");
      }
    });

    // Guardar / Cancelar factura entera
    this.btnGuardarFactura.addEventListener("click", () => this.guardarFacturaCompleta());
    this.btnCancelarFactura.addEventListener("click", () => this.modalConfirmarCancelar.classList.remove("oculto"));
    this.btnCancelarLimpieza.addEventListener("click", () => this.modalConfirmarCancelar.classList.add("oculto"));
    this.btnAceptarLimpieza.addEventListener("click", () => {
      this.cancelarFactura();
      this.modalConfirmarCancelar.classList.add("oculto");
    });
  }

  _iniciarFechaHora() {
    const actualizar = () => {
      const ahora = new Date();
      this.fechaActualFactura.textContent = ahora.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
      this.horaActualFactura.textContent = ahora.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    };
    actualizar();
    setInterval(actualizar, 1000);
  }

  _inicializarUsuario() {
    this.usuarioNombreVista.textContent = localStorage.getItem("nombre") || "Usuario";
    this.usuarioRolVista.textContent = localStorage.getItem("rol") || "Rol";
  }

  // --- CLIENTES MODAL ---
  async abrirBusquedaClientes() {
    this.modalClientes.classList.remove("oculto");
    this.valorBusquedaCliente.value = "";
    this.paginaClientes = 1;
    
    this.resultadosClientesBody.innerHTML = `<tr><td colspan="6" class="empty-state">Cargando clientes...</td></tr>`;
    try {
      this.clientesTodos = await this.clienteRepository.buscar({});
      this.aplicarFiltroClientes(false);
    } catch {
      this.resultadosClientesBody.innerHTML = `<tr><td colspan="6" class="empty-state">Error al cargar clientes</td></tr>`;
    }
  }

  aplicarFiltroClientes(reiniciarPagina = false) {
    const filtro = this.filtroCliente.value;
    const valor = this.valorBusquedaCliente.value.trim().toLowerCase();

    if (!valor) {
      this.clientesFiltrados = [...this.clientesTodos];
    } else {
      this.clientesFiltrados = this.clientesTodos.filter(c => {
        const id = String(c.idCliente);
        if (filtro === "id") return id.includes(valor);
        if (filtro === "nombre") return String(c.nombre).toLowerCase().includes(valor);
        if (filtro === "apellido") return String(c.apellido).toLowerCase().includes(valor);
        if (filtro === "correo") return String(c.correo).toLowerCase().includes(valor);
        if (filtro === "direccion") return String(c.direccion).toLowerCase().includes(valor);
        return true;
      });
    }

    if (reiniciarPagina) this.paginaClientes = 1;
    this.renderClientesModal();
  }

  renderClientesModal() {
    const totalPaginas = Math.max(1, Math.ceil(this.clientesFiltrados.length / this.clientesPorPagina));
    if (this.paginaClientes > totalPaginas) this.paginaClientes = totalPaginas;

    this.resultadosClientesBody.innerHTML = "";
    const items = this.clientesFiltrados.slice((this.paginaClientes - 1) * this.clientesPorPagina, this.paginaClientes * this.clientesPorPagina);

    if (items.length === 0) {
      this.resultadosClientesBody.innerHTML = `<tr><td colspan="6" class="empty-state">No se encontraron clientes</td></tr>`;
      this._actualizarPaginacionClientes(totalPaginas);
      return;
    }

    items.forEach(c => {
      const tr = document.createElement("tr");
      tr.className = "fila-cliente-seleccionable";
      const idCliente = String(c.idCliente || "");
      const nombre = String(c.nombre || "");
      const apellido = String(c.apellido || "");
      const telefono = String(c.telefono || "Sin teléfono");
      const correo = String(c.correo || "Sin correo");
      const direccion = String(c.direccion || "Sin dirección");

      tr.innerHTML = `
        <td>${this.resaltarCliente("id", idCliente)}</td>
        <td>${this.resaltarCliente("nombre", nombre)}</td>
        <td>${this.resaltarCliente("apellido", apellido)}</td>
        <td>${escaparHtml(telefono)}</td>
        <td>${this.resaltarCliente("correo", correo)}</td>
        <td>${this.resaltarCliente("direccion", direccion)}</td>
      `;
      tr.addEventListener("click", () => this.seleccionarCliente(c));
      this.resultadosClientesBody.appendChild(tr);
    });

    this._completarFilasClientes(items.length);
    this._actualizarPaginacionClientes(totalPaginas);
  }

  resaltarCliente(filtroObjetivo, texto) {
    const filtroActivo = this.filtroCliente ? this.filtroCliente.value : "nombre";
    const valor = this.valorBusquedaCliente ? this.valorBusquedaCliente.value.trim() : "";

    return this.resaltarTextoFiltrado(filtroActivo, valor, filtroObjetivo, texto);
  }

  resaltarTextoFiltrado(filtroActivo, valor, filtroObjetivo, texto) {
    if (filtroActivo !== filtroObjetivo || !valor) {
      return escaparHtml(texto);
    }

    return resaltarCoincidencia(texto, valor);
  }

  resaltarProducto(filtroObjetivo, texto) {
    const filtroActivo = this.filtroProducto ? this.filtroProducto.value : "nombre";
    const valor = this.valorBusquedaProducto ? this.valorBusquedaProducto.value.trim() : "";

    return this.resaltarTextoFiltrado(filtroActivo, valor, filtroObjetivo, texto);
  }

  _completarFilasClientes(cant) {
    if (cant >= this.clientesPorPagina) return;
    const faltan = this.clientesPorPagina - cant;
    for (let i = 0; i < faltan; i++) {
      const tr = document.createElement("tr");
      tr.className = "modal-placeholder-row";
      tr.innerHTML = `<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>`;
      this.resultadosClientesBody.appendChild(tr);
    }
  }

  _actualizarPaginacionClientes(total) {
    this.clientesTotalTexto.textContent = `${this.clientesTodos.length} clientes registrados`;
    this.paginaClientesTexto.textContent = `Página ${this.paginaClientes} de ${total}`;
    
    if (window.renderizarPaginacionNumerica) {
      window.renderizarPaginacionNumerica({
        contenedor: this.paginacionClientesControles,
        textoElemento: this.paginaClientesTexto,
        paginaActual: this.paginaClientes,
        totalPaginas: total,
        modoTodos: false
      });
    }
  }

  manejarPaginacionClientes(e) {
    const btn = e.target.closest("button[data-page-action]");
    if (!btn || btn.disabled) return;
    const action = btn.dataset.pageAction;
    const total = Math.max(1, Math.ceil(this.clientesFiltrados.length / this.clientesPorPagina));

    if (action === "prev" && this.paginaClientes > 1) this.paginaClientes--;
    else if (action === "next" && this.paginaClientes < total) this.paginaClientes++;
    else if (action === "page") this.paginaClientes = Number(btn.dataset.page);
    
    this.renderClientesModal();
  }

  seleccionarCliente(c) {
    this.factura.setCliente(c);
    this.modalClientes.classList.add("oculto");
    const nombreCompleto = `${c.nombre || ""} ${c.apellido || ""}`.trim() || "Sin nombre";
    const iniciales = `${c.nombre?.[0] || ""}${c.apellido?.[0] || ""}`.toUpperCase() || "CL";
    this.clienteSeleccionadoBody.classList.add("cliente-info-card-selected");

    this.clienteSeleccionadoBody.innerHTML = `
      <div class="cliente-selected-summary">
        <div class="cliente-selected-avatar" aria-hidden="true">${escaparHtml(iniciales)}</div>

        <div class="cliente-selected-content">
          <div class="cliente-selected-main">
            <div class="cliente-data-item cliente-data-wide cliente-data-nombre">
              <label>Nombre</label>
              <span>${escaparHtml(nombreCompleto)}</span>
            </div>
            <div class="cliente-data-item cliente-data-wide cliente-data-direccion">
              <label>Direcci&oacute;n</label>
              <span>${escaparHtml(c.direccion || "Sin direccion")}</span>
            </div>
            <div class="cliente-data-item cliente-data-wide cliente-data-correo">
              <label>Correo</label>
              <span>${escaparHtml(c.correo || "Sin correo")}</span>
            </div>
          </div>

          <div class="cliente-selected-side">
            <div class="cliente-data-item cliente-data-id">
              <label>ID</label>
              <span>${escaparHtml(c.idCliente || "")}</span>
            </div>
            <div class="cliente-data-item cliente-data-telefono">
              <label>Tel&eacute;fono</label>
              <span>${escaparHtml(c.telefono || "Sin telefono")}</span>
            </div>
          </div>
        </div>

        <div class="cliente-selected-actions">
          <button type="button" class="btn-cambiar-cliente">
            Cambiar cliente
          </button>
        </div>
      </div>
    `;

    const btnCambiarCliente = this.clienteSeleccionadoBody.querySelector(".btn-cambiar-cliente");
    if (btnCambiarCliente) {
      btnCambiarCliente.addEventListener("click", () => this.abrirBusquedaClientes());
    }

    this.btnAbrirBusquedaCliente.disabled = true;
    this.btnAbrirBusquedaCliente.setAttribute("aria-disabled", "true");
  }

  async guardarClienteRapido(e) {
    e.preventDefault();
    try {
      this.btnGuardarCliente.disabled = true;
      this.btnGuardarCliente.textContent = "Guardando...";

      const res = await this.clienteRepository.guardar(new Cliente({
        idCliente: 0,
        nombre: this.regNombre.value,
        apellido: this.regApellido.value,
        direccion: this.regDireccion.value,
        telefono: this.regTelefono.value,
        correo: this.regCorreo.value
      }));

      // Seleccionar el cliente recién registrado
      const clienteCreado = new Cliente({
        idCliente: res.idCliente || res.datos?.idCliente || 0,
        nombre: this.regNombre.value,
        apellido: this.regApellido.value,
        direccion: this.regDireccion.value,
        telefono: this.regTelefono.value,
        correo: this.regCorreo.value
      });

      this.seleccionarCliente(clienteCreado);
      this.modalRegistroCliente.classList.add("oculto");
      ToastNotifier.success("Cliente registrado y seleccionado");
    } catch (err) {
      ToastNotifier.error(err.message);
    } finally {
      this.btnGuardarCliente.disabled = false;
      this.btnGuardarCliente.textContent = "Guardar Cliente";
    }
  }

  // --- PRODUCTOS MODAL ---
  async abrirBusquedaProductos() {
    this.modalProductos.classList.remove("oculto");
    this.valorBusquedaProducto.value = "";
    this.paginaProductos = 1;

    this.resultadosProductosBody.innerHTML = `<tr><td colspan="6" class="empty-state">Cargando productos...</td></tr>`;
    try {
      this.productosTodos = await this.productoRepository.buscar({ estado: "Activo" });
      // Filtrar solo productos con stock > 0
      this.productosTodos = this.productosTodos.filter(p => p.stock > 0);
      this.aplicarFiltroProductos(false);
    } catch {
      this.resultadosProductosBody.innerHTML = `<tr><td colspan="6" class="empty-state">Error al cargar productos</td></tr>`;
    }
  }

  aplicarFiltroProductos(reiniciarPagina = false) {
    const filtro = this.filtroProducto.value;
    const valor = this.valorBusquedaProducto.value.trim().toLowerCase();

    if (!valor) {
      this.productosFiltrados = [...this.productosTodos];
    } else {
      this.productosFiltrados = this.productosTodos.filter(p => {
        const id = String(p.idProducto);
        if (filtro === "id") return id.includes(valor);
        if (filtro === "nombre") return String(p.nombre).toLowerCase().includes(valor);
        if (filtro === "categoria") return String(p.categoria).toLowerCase().includes(valor);
        return true;
      });
    }

    if (reiniciarPagina) this.paginaProductos = 1;
    this.renderProductosModal();
  }

  renderProductosModal() {
    const total = Math.max(1, Math.ceil(this.productosFiltrados.length / this.productosPorPagina));
    if (this.paginaProductos > total) this.paginaProductos = total;

    this.resultadosProductosBody.innerHTML = "";
    const items = this.productosFiltrados.slice((this.paginaProductos - 1) * this.productosPorPagina, this.paginaProductos * this.productosPorPagina);

    if (items.length === 0) {
      this.resultadosProductosBody.innerHTML = `<tr><td colspan="6" class="empty-state">No se encontraron productos</td></tr>`;
      this._actualizarPaginacionProductos(total);
      return;
    }

    items.forEach(p => {
      const tr = document.createElement("tr");
      tr.className = "fila-cliente-seleccionable";
      const idProducto = String(p.idProducto || "");
      const nombre = String(p.nombre || "");
      const categoria = String(p.categoria || "");
      const precio = Number(p.precio || 0).toFixed(2);
      const stock = String(p.stock || 0);
      const iva = p.aplicaIva ? "Sí" : "No";

      tr.innerHTML = `
        <td>${this.resaltarProducto("id", idProducto)}</td>
        <td>${this.resaltarProducto("nombre", nombre)}</td>
        <td>${this.resaltarProducto("categoria", categoria)}</td>
        <td>$${escaparHtml(precio)}</td>
        <td>${escaparHtml(stock)}</td>
        <td>${escaparHtml(iva)}</td>
      `;
      tr.addEventListener("click", () => this.seleccionarProducto(p));
      this.resultadosProductosBody.appendChild(tr);
    });

    this._completarFilasProductos(items.length);
    this._actualizarPaginacionProductos(total);
  }

  _completarFilasProductos(cant) {
    if (cant >= this.productosPorPagina) return;
    const faltan = this.productosPorPagina - cant;
    for (let i = 0; i < faltan; i++) {
      const tr = document.createElement("tr");
      tr.className = "modal-placeholder-row";
      tr.innerHTML = `<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>`;
      this.resultadosProductosBody.appendChild(tr);
    }
  }

  _actualizarPaginacionProductos(total) {
    this.productosTotalTexto.textContent = `${this.productosTodos.length} productos disponibles`;
    this.paginaProductosTexto.textContent = `Página ${this.paginaProductos} de ${total}`;
    
    if (window.renderizarPaginacionNumerica) {
      window.renderizarPaginacionNumerica({
        contenedor: this.paginacionProductosControles,
        textoElemento: this.paginaProductosTexto,
        paginaActual: this.paginaProductos,
        totalPaginas: total,
        modoTodos: false
      });
    }
  }

  manejarPaginacionProductos(e) {
    const btn = e.target.closest("button[data-page-action]");
    if (!btn || btn.disabled) return;
    const action = btn.dataset.pageAction;
    const total = Math.max(1, Math.ceil(this.productosFiltrados.length / this.productosPorPagina));

    if (action === "prev" && this.paginaProductos > 1) this.paginaProductos--;
    else if (action === "next" && this.paginaProductos < total) this.paginaProductos++;
    else if (action === "page") this.paginaProductos = Number(btn.dataset.page);
    
    this.renderProductosModal();
  }

  seleccionarProducto(p) {
    this.productoSeleccionado = p;
    this.modalProductos.classList.add("oculto");

    this.txtProductoNombre.textContent = p.nombre;
    this.txtProductoPrecio.textContent = p.precio.toFixed(2);
    this.txtProductoStock.textContent = p.stock;
    this.txtProductoIva.textContent = p.aplicaIva ? `${p.porcentajeIva}%` : "0%";
    this.inputCantidad.value = "1";
  }

  agregarProductoAFactura() {
    if (!this.productoSeleccionado) {
      ToastNotifier.warningUnique("Por favor, seleccione un producto.");
      return;
    }
    const cant = parseInt(this.inputCantidad.value) || 0;
    if (cant <= 0) {
      ToastNotifier.warningUnique("La cantidad debe ser mayor a 0.");
      return;
    }

    try {
      this.factura.agregarProducto(this.productoSeleccionado, cant);
      this.renderDetalle();
      
      // Reset selecciones de producto
      this.productoSeleccionado = null;
      this.txtProductoNombre.textContent = "Ninguno";
      this.txtProductoPrecio.textContent = "0.00";
      this.txtProductoStock.textContent = "0";
      this.txtProductoIva.textContent = "0%";
      this.inputCantidad.value = "1";
      ToastNotifier.success("Producto agregado al detalle");
    } catch (err) {
      ToastNotifier.errorUnique(err.message);
    }
  }

  renderDetalle() {
    this.detalleBody.innerHTML = "";
    
    if (this.factura.detallesFactura.length === 0) {
      this.txtSubtotal.textContent = "$0.00";
      this.txtIva.textContent = "$0.00";
      this.txtTotal.textContent = "$0.00";
      return;
    }

    this.factura.detallesFactura.forEach((d, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${d.nombreProducto}</td>
        <td>$${d.precioUnitario.toFixed(2)}</td>
        <td>${d.cantidad}</td>
        <td>$${d.subtotal.toFixed(2)}</td>
        <td>$${d.totalLinea.toFixed(2)}</td>
        <td>
          <button class="btn-delete-item" data-quitar-id="${d.idProducto}">Quitar</button>
        </td>
      `;
      tr.querySelector("[data-quitar-id]").addEventListener("click", () => {
        this.productoIdQuitar = d.idProducto;
        this.modalConfirmarQuitar.classList.remove("oculto");
      });
      this.detalleBody.appendChild(tr);
    });

    this.txtSubtotal.textContent = `$${this.factura.subtotal.toFixed(2)}`;
    this.txtIva.textContent = `$${this.factura.iva.toFixed(2)}`;
    this.txtTotal.textContent = `$${this.factura.total.toFixed(2)}`;
  }

  async guardarFacturaCompleta() {
    try {
      this.factura.validarParaGuardar();
      this.btnGuardarFactura.disabled = true;
      this.btnGuardarFactura.textContent = "Guardando...";

      const res = await this.crearFacturaUC.execute(this.factura);
      const numeroFactura = res.numeroFactura || res.datos?.numeroFactura || 0;
      
      ToastNotifier.success("Factura generada con éxito");

      // Descargar PDF de la factura
      try {
        const blob = await this.facturaRepository.descargarPdf(numeroFactura);
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = urlBlob;
        link.download = `Factura_${numeroFactura}.pdf`;
        link.click();
        window.URL.revokeObjectURL(urlBlob);
      } catch {
        ToastNotifier.warning("Factura guardada, pero ocurrió un error al descargar el PDF");
      }

      this.cancelarFactura();
    } catch (err) {
      if (err.name === "DomainException") {
        ToastNotifier.errorUnique(err.message);
        return;
      }

      ToastNotifier.error(err.message);
    } finally {
      this.btnGuardarFactura.disabled = false;
      this.btnGuardarFactura.textContent = "Guardar factura";
    }
  }

  cancelarFactura() {
    this.factura = new Factura({});
    this.productoSeleccionado = null;

    // Reset Cliente
    this.clienteSeleccionadoBody.classList.remove("cliente-info-card-selected");
    this.clienteSeleccionadoBody.innerHTML = `<p class="empty-state">Ningún cliente seleccionado</p>`;
    this.btnAbrirBusquedaCliente.disabled = false;
    this.btnAbrirBusquedaCliente.setAttribute("aria-disabled", "false");

    // Reset Producto
    this.txtProductoNombre.textContent = "Ninguno";
    this.txtProductoPrecio.textContent = "0.00";
    this.txtProductoStock.textContent = "0";
    this.txtProductoIva.textContent = "0%";
    this.inputCantidad.value = "1";

    this.renderDetalle();
  }
}
