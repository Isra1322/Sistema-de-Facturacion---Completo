const API_FACTURA = "http://localhost:5161/api/Factura";

const numeroFacturaTexto = document.getElementById("numeroFactura");
const fechaFacturaTexto = document.getElementById("fechaFactura");
const clienteFacturaTexto = document.getElementById("clienteFactura");
const idClienteFacturaTexto = document.getElementById("idClienteFactura");
const direccionClienteFacturaTexto = document.getElementById("direccionClienteFactura");
const telefonoClienteFacturaTexto = document.getElementById("telefonoClienteFactura");
const correoClienteFacturaTexto = document.getElementById("correoClienteFactura");
const vendedorNombreFacturaTexto = document.getElementById("vendedorNombreFactura");
const vendedorCorreoFacturaTexto = document.getElementById("vendedorCorreoFactura");
const vendedorRolFacturaTexto = document.getElementById("vendedorRolFactura");

const detalleFacturaBody = document.getElementById("detalleFacturaBody");
const subtotalFacturaTexto = document.getElementById("subtotalFactura");
const ivaFacturaTexto = document.getElementById("ivaFactura");
const totalFacturaTexto = document.getElementById("totalFactura");
const btnImprimirFactura = document.getElementById("btnImprimirFactura");

const params = new URLSearchParams(window.location.search);
const numeroFactura = params.get("numero");

document.addEventListener("DOMContentLoaded", () => {
  if (!numeroFactura) {
    mostrarToast("No se recibió un número de factura", "error");
    return;
  }

  cargarDatosUsuario();
  cargarFactura(numeroFactura);
});

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

async function cargarFactura(numero) {
  try {
    const response = await apiFetch(`${API_FACTURA}/${numero}`);

    if (!response || !response.ok) {
      throw new Error("Factura no encontrada");
    }

    const factura = await response.json();

    pintarDatosGenerales(factura);
    pintarResumen(factura);
    pintarDetalleFactura(factura.detalles || []);

  } catch (error) {
    detalleFacturaBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          No se pudo cargar la factura.
        </td>
      </tr>
    `;

    mostrarToast(error.message, "error");
  }
}

function pintarDatosGenerales(factura) {
  numeroFacturaTexto.textContent = `#${factura.numeroFactura ?? "-"}`;

  fechaFacturaTexto.textContent = formatearFecha(factura.fecha);

  clienteFacturaTexto.textContent =
    factura.cliente ||
    factura.nombreCliente ||
    factura.clienteNombre ||
    "-";

  idClienteFacturaTexto.textContent =
    factura.idCliente ||
    factura.clienteId ||
    "-";

  direccionClienteFacturaTexto.textContent =
    factura.direccionCliente ||
    factura.clienteDireccion ||
    factura.direccion ||
    "No disponible";

  telefonoClienteFacturaTexto.textContent =
    factura.telefonoCliente ||
    factura.clienteTelefono ||
    factura.telefono ||
    "No disponible";

  correoClienteFacturaTexto.textContent =
    factura.correoCliente ||
    factura.clienteCorreo ||
    factura.correo ||
    "No disponible";

  const vendedor = factura.vendedor || factura.Vendedor || {};

  vendedorNombreFacturaTexto.textContent = obtenerTextoDisponible(
    factura.vendedorNombre,
    factura.VendedorNombre,
    vendedor.nombre,
    vendedor.Nombre,
    factura.usuarioNombre,
    factura.UsuarioNombre
  );

  vendedorCorreoFacturaTexto.textContent = obtenerTextoDisponible(
    factura.vendedorCorreo,
    factura.VendedorCorreo,
    vendedor.correo,
    vendedor.Correo,
    factura.usuarioCorreo,
    factura.UsuarioCorreo
  );

  vendedorRolFacturaTexto.textContent = obtenerTextoDisponible(
    factura.vendedorRol,
    factura.VendedorRol,
    vendedor.rol,
    vendedor.Rol,
    factura.usuarioRol,
    factura.UsuarioRol
  );
}

function obtenerTextoDisponible(...valores) {
  const valor = valores.find(item => String(item || "").trim().length > 0);

  return valor || "No disponible";
}

function pintarResumen(factura) {
  subtotalFacturaTexto.textContent =
    formatearMoneda(factura.subtotal);

  ivaFacturaTexto.textContent =
    formatearMoneda(factura.iva);

  totalFacturaTexto.textContent =
    formatearMoneda(factura.total);
}

function pintarDetalleFactura(detalles) {
  detalleFacturaBody.innerHTML = "";

  if (!detalles || detalles.length === 0) {
    detalleFacturaBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          Esta factura no tiene productos registrados.
        </td>
      </tr>
    `;

    return;
  }

  detalles.forEach((detalle, index) => {
    const fila = document.createElement("tr");

    const nombreProducto =
      detalle.producto ||
      detalle.nombreProducto ||
      "Producto";
    const cantidad = Number(detalle.cantidad || 0);
    const precioUnitario = Number(detalle.precioUnitario || 0);
    const subtotal = precioUnitario * cantidad;

    fila.innerHTML = `
      <td>
        <span class="product-id">${index + 1}</span>
      </td>

      <td>
        <div class="product-cell">
          <span class="product-icon">📦</span>
          <span>${nombreProducto}</span>
        </div>
      </td>

      <td>${formatearNumero(detalle.precioUnitario)}</td>

      <td>${detalle.cantidad ?? 0}</td>

      <td>${formatearNumero(subtotal)}</td>
      
      <td>${formatearNumero(detalle.totalLinea)}</td>
    `;

    detalleFacturaBody.appendChild(fila);
  });
}

function formatearMoneda(valor) {
  return `$${Number(valor || 0).toFixed(2)}`;
}

function formatearNumero(valor) {
  return Number(valor || 0).toFixed(2);
}

function formatearFecha(fecha) {
  if (!fecha) return "-";

  const fechaConvertida = new Date(fecha);

  if (isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return fechaConvertida.toLocaleString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

btnImprimirFactura.addEventListener("click", async () => {
  if (!numeroFactura) return;

  try {
    const response = await apiFetch(`${API_FACTURA}/pdf/${numeroFactura}`);

    if (!response || !response.ok) {
      throw new Error("No se pudo generar el PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");

    mostrarToast("Factura generada correctamente", "success");

  } catch (error) {
    mostrarToast(error.message, "error");
  }
});
// SIDEBAR RESPONSIVE

const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const dashboardLayout = document.querySelector(".dashboard-layout");

if (btnToggleSidebar && dashboardLayout) {
  btnToggleSidebar.addEventListener("click", () => {
    dashboardLayout.classList.toggle("sidebar-collapsed");
  });
}
