import { ProductoRepository } from "../../infrastructure/repositories/ProductoRepository.js";
import { ObtenerProductosUseCase } from "../../application/useCases/productos/ObtenerProductosUseCase.js";
import { GuardarProductoUseCase } from "../../application/useCases/productos/GuardarProductoUseCase.js";
import { EliminarProductoUseCase } from "../../application/useCases/productos/EliminarProductoUseCase.js";
import { ToastNotifier } from "../../infrastructure/notifiers/ToastNotifier.js";
import { resaltarCoincidencia, escaparHtml, mostrarConfirmacion } from "../../shared/helpers/domHelpers.js";

export class ProductosPage {
  constructor() {
    this.productoRepository = new ProductoRepository();
    this.obtenerProductosUC = new ObtenerProductosUseCase(this.productoRepository);
    this.guardarProductoUC = new GuardarProductoUseCase(this.productoRepository);
    this.eliminarProductoUC = new EliminarProductoUseCase(this.productoRepository);

    this.productosTodos = [];
    this.productosFiltrados = [];
    this.paginaActual = 1;
    this.tamanioPagina = 6;
    this.totalPaginas = 1;
    this.modoTodos = false;
    
    this.rolUsuario = localStorage.getItem("rol") || sessionStorage.getItem("rol") || "";
    this.esAdministrador = this.rolUsuario === "Administrador";
  }

  init() {
    this._bindElements();
    this._bindEvents();
    this._configurePermissions();
    this.cargarProductos();
    this._setupGlobalCallbacks();
  }

  _bindElements() {
    this.form = document.getElementById("productoForm");
    this.body = document.getElementById("productosBody");
    this.buscarInput = document.getElementById("valorFiltroProducto");
    this.filtroSelect = document.getElementById("filtroProductoTabla");
    this.filtroEstadoContainer = document.getElementById("filtroEstadoProductoContainer");
    this.filtroEstado = document.getElementById("filtroEstadoProducto");

    this.idInput = document.getElementById("idProducto");
    this.nombreInput = document.getElementById("nombre");
    this.precioInput = document.getElementById("precio");
    this.stockInput = document.getElementById("stock");
    this.categoriaSelect = document.getElementById("categoria");
    this.aplicaIvaInput = document.getElementById("aplicaIva");
    this.porcentajeIvaInput = document.getElementById("porcentajeIva");

    this.btnMostrarForm = document.getElementById("btnMostrarFormulario");
    this.btnCerrarForm = document.getElementById("btnCerrarFormulario");
    this.formContainer = document.getElementById("formularioProductoContainer");
    this.tituloForm = document.getElementById("tituloFormulario");
    this.btnGuardar = document.getElementById("btnGuardarProducto");

    this.btnAnterior = document.getElementById("btnAnterior");
    this.btnSiguiente = document.getElementById("btnSiguiente");
    this.paginaActualTexto = document.getElementById("paginaActual");
    this.paginacionControles = this.btnAnterior ? this.btnAnterior.parentElement : null;
    this.totalBadge = document.getElementById("productosTotalBadge");
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
        this.cargarProductos();
      });
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.guardarProducto(e));
    }

    if (this.paginacionControles) {
      this.paginacionControles.addEventListener("click", (e) => this.manejarPaginacion(e));
    }

    if (this.categoriaSelect && this.aplicaIvaInput && this.porcentajeIvaInput) {
      this.categoriaSelect.addEventListener("change", () => this.aplicarReglasIvaFormulario());
      this.aplicaIvaInput.addEventListener("change", () => this.aplicarReglasIvaFormulario());
    }

    if (this.nombreInput) {
      this.nombreInput.addEventListener("input", (e) => {
        e.target.value = this.normalizarNombreProducto(e.target.value);
      });
    }
  }

  _setupGlobalCallbacks() {
    window.editarProducto = (id) => this.editarProducto(id);
    window.eliminarProducto = (id) => this.eliminarProducto(id);
    window.reactivarProducto = (id) => this.reactivarProducto(id);
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
    if (this.btnMostrarForm) {
      this.btnMostrarForm.classList.toggle("oculto", !this.esAdministrador);
    }
  }

  normalizarNombreProducto(valor) {
    return valor
      .replace(/\s+/g, " ")
      .trimStart()
      .slice(0, 60)
      .split(" ")
      .map(palabra => {
        if (!palabra) return "";
        if (/\d/.test(palabra) && /[A-Z]{2,}/.test(palabra)) {
          return palabra.charAt(0).toLocaleUpperCase("es-EC") + palabra.slice(1);
        }
        const palabraMinuscula = palabra.toLocaleLowerCase("es-EC");
        return palabraMinuscula.charAt(0).toLocaleUpperCase("es-EC") + palabraMinuscula.slice(1);
      })
      .join(" ");
  }

  async cargarProductos(opciones = {}) {
    try {
      this.body.innerHTML = `<tr><td colspan="8" class="empty-state">Cargando productos...</td></tr>`;
      const estadoFiltro = (!this.esAdministrador || !this.filtroEstado) ? "Activo" : (this.filtroEstado.value || "Activo");
      
      this.productosTodos = await this.obtenerProductosUC.execute({ estado: estadoFiltro });
      this.aplicarFiltro(false);

      if (opciones.irUltima && this.productosFiltrados.length > 0) {
        this.modoTodos = false;
        this.totalPaginas = Math.max(1, Math.ceil(this.productosFiltrados.length / this.tamanioPagina));
        this.paginaActual = this.totalPaginas;
      }

      this.render();
    } catch (err) {
      this.productosTodos = [];
      this.productosFiltrados = [];
      this.body.innerHTML = `<tr><td colspan="8" class="empty-state">Error al cargar productos</td></tr>`;
      this.actualizarContadores();
      ToastNotifier.error("Error al cargar productos");
    }
  }

  aplicarFiltro(reiniciarPagina = false) {
    const filtro = this.filtroSelect ? this.filtroSelect.value : "nombre";
    const valor = this.buscarInput ? this.buscarInput.value.trim().toLowerCase() : "";

    if (!valor) {
      this.productosFiltrados = [...this.productosTodos];
    } else {
      this.productosFiltrados = this.productosTodos.filter(p => {
        const id = String(p.idProducto || "");
        const nom = String(p.nombre || "").toLowerCase();
        const cat = String(p.categoria || "Otros").toLowerCase();

        if (filtro === "id") return id.includes(valor);
        if (filtro === "nombre") return nom.includes(valor);
        if (filtro === "categoria") return cat.includes(valor);
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
    this.totalPaginas = Math.max(1, Math.ceil(this.productosFiltrados.length / this.tamanioPagina));
    if (!this.modoTodos && this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const items = this.modoTodos
      ? this.productosFiltrados
      : this.productosFiltrados.slice((this.paginaActual - 1) * this.tamanioPagina, this.paginaActual * this.tamanioPagina);

    this.body.innerHTML = "";

    if (items.length === 0) {
      this.body.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            ${this.buscarInput && this.buscarInput.value.trim() ? "No se encontraron productos" : "No existen productos registrados"}
          </td>
        </tr>
      `;
      this.actualizarContadores();
      return;
    }

    items.forEach(p => {
      const estaInactivo = p.estado === "Inactivo";
      const tr = document.createElement("tr");

      const resId = this.resaltar("id", String(p.idProducto));
      const resNom = this.resaltar("nombre", p.nombre);
      const resCat = this.resaltar("categoria", p.categoria || "Otros");

      tr.innerHTML = `
        <td>${resId}</td>
        <td>
          <div class="product-name">
            <span class="product-avatar">&#128230;</span>
            <span>${resNom}</span>
          </div>
        </td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td><span class="stock-badge">${p.stock}</span></td>
        <td>${resCat}</td>
        <td>${p.aplicaIva ? "Sí" : "No"}</td>
        <td>${Number(p.porcentajeIva || 0).toFixed(2)}%</td>
        <td>
          <div class="actions">
            ${this._renderAccionesHtml(p.idProducto, estaInactivo)}
          </div>
        </td>
      `;
      this.body.appendChild(tr);
    });

    this.completarFilas(items.length);
    this.actualizarContadores();
  }

  resaltar(filtroObjetivo, texto) {
    const filtroActivo = this.filtroSelect ? this.filtroSelect.value : "nombre";
    const valor = this.buscarInput ? this.buscarInput.value.trim() : "";
    if (filtroActivo !== filtroObjetivo || !valor) {
      return escaparHtml(texto);
    }
    return resaltarCoincidencia(texto, valor);
  }

  _renderAccionesHtml(id, estaInactivo) {
    if (!this.esAdministrador) return "";
    if (estaInactivo) {
      return `<button class="btn-edit" onclick="reactivarProducto(${id})">🔄</button>`;
    }
    return `
      <button class="btn-edit" onclick="editarProducto(${id})">✏</button>
      <button class="btn-delete" onclick="eliminarProducto(${id})">🗑</button>
    `;
  }

  completarFilas(cantidad) {
    if (this.modoTodos || cantidad >= this.tamanioPagina) return;
    const faltantes = this.tamanioPagina - cantidad;
    for (let i = 0; i < faltantes; i++) {
      const tr = document.createElement("tr");
      tr.className = "table-placeholder-row";
      tr.setAttribute("aria-hidden", "true");
      tr.innerHTML = `<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>`;
      this.body.appendChild(tr);
    }
  }

  actualizarContadores() {
    if (this.totalBadge) {
      this.totalBadge.textContent = this.buscarInput && this.buscarInput.value.trim()
        ? `Mostrando ${this.productosFiltrados.length} de ${this.productosTodos.length} productos`
        : (this.productosTodos.length === 1 ? "1 producto registrado" : `${this.productosTodos.length} productos registrados`);
    }

    if (window.renderizarPaginacionNumerica) {
      window.renderizarPaginacionNumerica({
        contenedor: this.paginacionControles,
        textoElemento: this.paginaActualTexto,
        paginaActual: this.paginaActual,
        totalPaginas: this.totalPaginas,
        modoTodos: this.modoTodos
      });
    }
  }

  manejarPaginacion(e) {
    const btn = e.target.closest("button[data-page-action]");
    if (!btn || btn.disabled) return;

    const action = btn.dataset.pageAction;
    if (action === "prev" && this.paginaActual > 1) {
      this.modoTodos = false;
      this.paginaActual--;
    } else if (action === "next" && this.paginaActual < this.totalPaginas) {
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
    const placeholders = { id: "Ej: 15", nombre: "Ej: Laptop", categoria: "Ej: Tecnologia" };
    this.buscarInput.placeholder = placeholders[this.filtroSelect.value] || placeholders.nombre;
  }

  validarFiltroInput() {
    if (!this.filtroSelect || !this.buscarInput) return;
    const filtro = this.filtroSelect.value;
    if (filtro === "id") {
      this.buscarInput.value = this.buscarInput.value.replace(/\D/g, "");
    } else if (filtro === "nombre") {
      this.buscarInput.value = this.buscarInput.value.replace(/[^A-Za-z0-9\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "");
    } else {
      this.buscarInput.value = this.buscarInput.value.replace(/[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00d1\u00f1\s]/g, "");
    }
  }

  limpiarFormulario() {
    this.form.reset();
    this.idInput.value = "";
    if (this.categoriaSelect) this.categoriaSelect.value = "";
    if (this.aplicaIvaInput) this.aplicaIvaInput.checked = false;
    if (this.porcentajeIvaInput) {
      this.porcentajeIvaInput.value = "0";
      this.porcentajeIvaInput.disabled = true;
    }
    this.tituloForm.textContent = "Registrar Producto";
    this.btnGuardar.textContent = "Guardar Producto";
  }

  aplicarReglasIvaFormulario() {
    if (!this.categoriaSelect || !this.aplicaIvaInput || !this.porcentajeIvaInput) return;

    if (this.categoriaSelect.value === "Tecnologia") {
      this.aplicaIvaInput.checked = true;
      this.aplicaIvaInput.disabled = true;
      this.porcentajeIvaInput.value = "15";
      this.porcentajeIvaInput.disabled = true;
      return;
    }

    this.aplicaIvaInput.disabled = false;

    if (!this.aplicaIvaInput.checked) {
      this.porcentajeIvaInput.value = "0";
      this.porcentajeIvaInput.disabled = true;
      return;
    }

    this.porcentajeIvaInput.disabled = false;
    if (!this.porcentajeIvaInput.value || Number(this.porcentajeIvaInput.value) === 0) {
      this.porcentajeIvaInput.value = "15";
    }
  }

  async editarProducto(id) {
    try {
      const p = await this.productoRepository.obtenerPorId(id);
      
      this.idInput.value = p.idProducto;
      this.nombreInput.value = p.nombre;
      this.precioInput.value = p.precio;
      this.stockInput.value = p.stock;
      if (this.categoriaSelect) this.categoriaSelect.value = p.categoria || "Otros";
      if (this.aplicaIvaInput) this.aplicaIvaInput.checked = Boolean(p.aplicaIva);
      if (this.porcentajeIvaInput) this.porcentajeIvaInput.value = Number(p.porcentajeIva || 0);
      
      this.aplicarReglasIvaFormulario();

      this.tituloForm.textContent = "Editar Producto";
      this.btnGuardar.textContent = "Actualizar Producto";
      this.formContainer.classList.remove("oculto");
      this.nombreInput.focus();
    } catch (err) {
      ToastNotifier.error(err.message);
    }
  }

  async guardarProducto(e) {
    e.preventDefault();
    const id = this.idInput.value ? Number(this.idInput.value) : 0;

    try {
      this.btnGuardar.disabled = true;
      this.btnGuardar.textContent = "Guardando...";

      await this.guardarProductoUC.execute({
        idProducto: id,
        nombre: this.nombreInput.value,
        precio: parseFloat(this.precioInput.value),
        stock: parseInt(this.stockInput.value),
        categoria: this.categoriaSelect ? this.categoriaSelect.value : "",
        aplicaIva: this.aplicaIvaInput ? this.aplicaIvaInput.checked : false,
        porcentajeIva: this.porcentajeIvaInput ? parseFloat(this.porcentajeIvaInput.value) : 0
      });

      this.formContainer.classList.add("oculto");
      this.limpiarFormulario();
      await this.cargarProductos({ irUltima: id === 0 });
      ToastNotifier.success(id > 0 ? "Producto actualizado correctamente" : "Producto guardado correctamente");
    } catch (err) {
      ToastNotifier.error(err.message);
    } finally {
      this.btnGuardar.disabled = false;
      this.btnGuardar.textContent = id > 0 ? "Actualizar Producto" : "Guardar Producto";
    }
  }

  async eliminarProducto(id) {
    const confirm = await mostrarConfirmacion("Eliminar producto", "¿Seguro que deseas eliminar este producto?");
    if (!confirm) return;

    try {
      await this.eliminarProductoUC.execute(id);
      await this.cargarProductos();
      ToastNotifier.success("Producto eliminado correctamente");
    } catch (err) {
      ToastNotifier.error(err.message);
    }
  }

  async reactivarProducto(id) {
    const confirm = await mostrarConfirmacion("Reactivar producto", "¿Seguro que deseas reactivar este producto?");
    if (!confirm) return;

    try {
      await this.eliminarProductoUC.reactivar(id);
      await this.cargarProductos();
      ToastNotifier.success("Producto reactivado correctamente");
    } catch (err) {
      ToastNotifier.error(err.message);
    }
  }
}
