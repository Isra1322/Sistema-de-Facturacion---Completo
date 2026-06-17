// js/dashboard.js
const DASHBOARD_API_BASE_URL = window.API_BASE_URL || "http://localhost:5161/api";
const API_CLIENTES_DASHBOARD = `${DASHBOARD_API_BASE_URL}/Cliente`;
const API_PRODUCTOS_DASHBOARD = `${DASHBOARD_API_BASE_URL}/Producto`;
const API_FACTURAS_DASHBOARD = `${DASHBOARD_API_BASE_URL}/Factura`;
const DASHBOARD_PAGE_SIZE = 100000;

const dashboardState = {
  clientes: [],
  productos: [],
  facturas: [],
  resumenFacturas: null,
  rol: localStorage.getItem("rol") || sessionStorage.getItem("rol") || ""
};

document.addEventListener("DOMContentLoaded", cargarDashboard);

async function cargarDashboard() {
  pintarFechaActual();
  pintarAlcanceDashboard();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return;

  const [clientes, productos, resumenFacturas, facturas] = await Promise.all([
    cargarClientesDashboard(),
    cargarProductosDashboard(),
    cargarResumenFacturasDashboard(),
    cargarFacturasDashboard()
  ]);

  dashboardState.clientes = clientes;
  dashboardState.productos = productos;
  dashboardState.resumenFacturas = resumenFacturas;
  dashboardState.facturas = facturas;

  pintarMetricas();
  pintarResumenVentas();
  pintarGraficoVentasPorFecha();
  pintarCategoriasProductos();
  pintarUltimasFacturas();
  pintarResumenGeneral();
}

async function cargarClientesDashboard() {
  try {
    const response = await apiFetch(
      `${API_CLIENTES_DASHBOARD}/buscar?nombre=&correo=&estado=Activo&pagina=1&tamanioPagina=${DASHBOARD_PAGE_SIZE}&_=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response || !response.ok) throw new Error("No se pudieron cargar clientes");

    const data = await response.json();
    return extraerLista(data);
  } catch (error) {
    console.warn("Dashboard clientes:", error);
    return [];
  }
}

async function cargarProductosDashboard() {
  try {
    const response = await apiFetch(
      `${API_PRODUCTOS_DASHBOARD}/buscar?texto=&estado=Activo&pagina=1&tamanioPagina=${DASHBOARD_PAGE_SIZE}&_=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response || !response.ok) throw new Error("No se pudieron cargar productos");

    const data = await response.json();
    return extraerLista(data);
  } catch (error) {
    console.warn("Dashboard productos:", error);
    return [];
  }
}

async function cargarResumenFacturasDashboard() {
  try {
    const response = await apiFetch(`${API_FACTURAS_DASHBOARD}/resumen?_=${Date.now()}`, { cache: "no-store" });

    if (!response || !response.ok) throw new Error("No se pudo cargar el resumen de facturas");

    return await response.json();
  } catch (error) {
    console.warn("Dashboard resumen facturas:", error);
    return null;
  }
}

async function cargarFacturasDashboard() {
  try {
    const response = await apiFetch(
      `${API_FACTURAS_DASHBOARD}/buscar?pagina=1&tamanioPagina=${DASHBOARD_PAGE_SIZE}&_=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response || !response.ok) throw new Error("No se pudieron cargar facturas");

    const data = await response.json();
    return extraerLista(data);
  } catch (error) {
    console.warn("Dashboard facturas:", error);
    return [];
  }
}

function extraerLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.datos)) return data.datos;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function pintarMetricas() {
  const resumen = dashboardState.resumenFacturas || {};
  const totalVentasCalculado = sumarTotalesFacturas(dashboardState.facturas);

  setText("totalClientes", dashboardState.clientes.length);
  setText("totalProductos", dashboardState.productos.length);
  setText("totalFacturas", Number(resumen.totalFacturas ?? dashboardState.facturas.length));
  setText("totalVentas", formatearMoneda(resumen.totalVentas ?? totalVentasCalculado));
  setText("ventasHoy", formatearMoneda(resumen.totalVentasHoy ?? obtenerVentasHoy(dashboardState.facturas)));
}

function pintarResumenVentas() {
  const resumen = dashboardState.resumenFacturas || {};
  const totalFacturas = Number(resumen.totalFacturas ?? dashboardState.facturas.length);
  const totalVentas = Number(resumen.totalVentas ?? sumarTotalesFacturas(dashboardState.facturas));
  const facturasHoy = Number(resumen.facturasHoy ?? obtenerFacturasHoy(dashboardState.facturas));

  setText("ventasResumenTexto", totalFacturas > 0
    ? `${totalFacturas} facturas por ${formatearMoneda(totalVentas)}`
    : "Sin datos disponibles");
  setText("facturasHoyBadge", `${facturasHoy} hoy`);
}

function pintarGraficoVentasPorFecha() {
  const chart = document.getElementById("ventasPorFechaChart");
  if (!chart) return;

  const ventasPorFecha = agruparVentasPorFecha(dashboardState.facturas).slice(-12);

  if (ventasPorFecha.length === 0) {
    chart.innerHTML = `<div class="empty-panel">Sin datos disponibles</div>`;
    setText("rangoVentasTexto", "Sin registros");
    return;
  }

  const width = 640;
  const height = 196;
  const padding = { top: 38, right: 18, bottom: 32, left: 34 };
  const valores = ventasPorFecha.map(item => item.total);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const rango = maximo - minimo || 1;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const baseline = height - padding.bottom;
  const step = ventasPorFecha.length > 1 ? plotWidth / (ventasPorFecha.length - 1) : 0;

  const puntos = ventasPorFecha.map((item, index) => {
    const x = ventasPorFecha.length === 1
      ? padding.left + (plotWidth / 2)
      : padding.left + (index * step);
    const y = minimo === maximo
      ? padding.top + (plotHeight / 2)
      : padding.top + ((maximo - item.total) / rango) * plotHeight;

    return { ...item, x, y };
  });

  const linePath = puntos
    .map((punto, index) => `${index === 0 ? "M" : "L"} ${punto.x.toFixed(2)} ${punto.y.toFixed(2)}`)
    .join(" ");

  const areaPath = puntos.length === 1
    ? `M ${puntos[0].x.toFixed(2)} ${puntos[0].y.toFixed(2)} L ${(puntos[0].x + 1).toFixed(2)} ${puntos[0].y.toFixed(2)} L ${(puntos[0].x + 1).toFixed(2)} ${baseline} L ${puntos[0].x.toFixed(2)} ${baseline} Z`
    : `${linePath} L ${puntos[puntos.length - 1].x.toFixed(2)} ${baseline} L ${puntos[0].x.toFixed(2)} ${baseline} Z`;
  const gridLines = [0, 0.5, 1]
    .map(valor => padding.top + (plotHeight * valor))
    .map(y => `<line class="trend-grid-line" x1="${padding.left}" y1="${y.toFixed(2)}" x2="${width - padding.right}" y2="${y.toFixed(2)}"></line>`)
    .join("");
  const dots = puntos
    .map(punto => `
      <g class="trend-point">
        <circle cx="${punto.x.toFixed(2)}" cy="${punto.y.toFixed(2)}" r="4.5"></circle>
        <title>${escaparHtml(punto.label)} - ${formatearMoneda(punto.total)}</title>
      </g>
    `)
    .join("");
  const valueLabels = puntos
    .map(punto => `<text class="trend-value" x="${punto.x.toFixed(2)}" y="${Math.max(16, punto.y - 12).toFixed(2)}" text-anchor="middle">${escaparHtml(formatearMonedaCompacta(punto.total))}</text>`)
    .join("");
  const labels = puntos
    .map(punto => `<text class="trend-label" x="${punto.x.toFixed(2)}" y="${height - 9}" text-anchor="middle">${escaparHtml(punto.labelCorto)}</text>`)
    .join("");

  setText("rangoVentasTexto", ventasPorFecha.length === 1 ? "1 fecha" : `${ventasPorFecha.length} fechas`);

  chart.innerHTML = `
    <div class="trend-chart">
      <svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolucion de ventas por fecha">
        <defs>
          <linearGradient id="ventasAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.22"></stop>
            <stop offset="100%" stop-color="#2563eb" stop-opacity="0.02"></stop>
          </linearGradient>
        </defs>
        ${gridLines}
        <path class="trend-area" d="${areaPath}"></path>
        <path class="trend-line" d="${linePath}"></path>
        ${valueLabels}
        ${dots}
        ${labels}
      </svg>
      <div class="trend-summary">
        <span>Min. ${formatearMonedaCompacta(minimo)}</span>
        <strong>Max. ${formatearMonedaCompacta(maximo)}</strong>
      </div>
    </div>
  `;
}

function pintarCategoriasProductos() {
  const contenedor = document.getElementById("categoriasProductos");
  if (!contenedor) return;

  const categorias = agruparProductosPorCategoria(dashboardState.productos);

  if (categorias.length === 0) {
    contenedor.innerHTML = `<div class="empty-panel">Sin datos disponibles</div>`;
    return;
  }

  const total = categorias.reduce((sum, item) => sum + item.cantidad, 0);

  contenedor.innerHTML = categorias.map(item => {
    const porcentaje = total > 0 ? Math.round((item.cantidad / total) * 100) : 0;

    return `
      <div class="category-item">
        <div class="category-row">
          <span>${escaparHtml(item.categoria)}</span>
          <strong>${item.cantidad}</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${porcentaje}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function pintarUltimasFacturas() {
  const tbody = document.getElementById("ultimasFacturasBody");
  if (!tbody) return;

  const facturas = [...dashboardState.facturas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  if (facturas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Sin datos disponibles</td></tr>`;
    return;
  }

  tbody.innerHTML = facturas.map(factura => `
    <tr>
      <td class="invoice-number">#${escaparHtml(factura.numeroFactura ?? "-")}</td>
      <td>${formatearFecha(factura.fecha)}</td>
      <td>${escaparHtml(factura.cliente || "Sin cliente")}</td>
      <td class="invoice-total">${formatearMoneda(factura.total || 0)}</td>
    </tr>
  `).join("");
}

function pintarResumenGeneral() {
  const resumen = dashboardState.resumenFacturas || {};
  const facturasHoy = Number(resumen.facturasHoy ?? obtenerFacturasHoy(dashboardState.facturas));
  const ultimaFactura = resumen.ultimaFactura || obtenerUltimaFactura(dashboardState.facturas);

  setText("clientesMes", calcularNuevosEsteMes(dashboardState.clientes));
  setText("productosMes", calcularNuevosEsteMes(dashboardState.productos));
  setText("facturasHoy", facturasHoy);
  setText("ultimaFactura", ultimaFactura ? `#${ultimaFactura.numeroFactura}` : "Sin datos");
}

function pintarFechaActual() {
  setText("fechaActualDashboard", new Date().toLocaleDateString("es-EC", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit"
  }));
}

function pintarAlcanceDashboard() {
  const texto = dashboardState.rol === "Vendedor"
    ? "Datos permitidos para vendedor"
    : "Resumen general del sistema";

  setText("alcanceDashboardTexto", texto);
}

function agruparVentasPorFecha(facturas) {
  const mapa = new Map();

  facturas.forEach(factura => {
    const fecha = normalizarFechaClave(factura.fecha);
    if (!fecha) return;

    mapa.set(fecha, (mapa.get(fecha) || 0) + Number(factura.total || 0));
  });

  return Array.from(mapa.entries())
    .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
    .map(([fecha, total]) => ({
      fecha,
      total,
      label: formatearFecha(fecha),
      labelCorto: formatearFechaCorta(fecha)
    }));
}

function agruparProductosPorCategoria(productos) {
  const mapa = new Map();

  productos.forEach(producto => {
    const categoria = producto.categoria || "Otros";
    mapa.set(categoria, (mapa.get(categoria) || 0) + 1);
  });

  return Array.from(mapa.entries())
    .map(([categoria, cantidad]) => ({ categoria, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
}

function calcularNuevosEsteMes(registros) {
  const camposFecha = ["fechaCreacion", "fechaRegistro", "creadoEn", "createdAt"];
  const ahora = new Date();
  const mes = ahora.getMonth();
  const anio = ahora.getFullYear();
  let encontroCampoFecha = false;

  const total = registros.reduce((contador, registro) => {
    const campo = camposFecha.find(nombre => registro[nombre]);
    if (!campo) return contador;

    encontroCampoFecha = true;
    const fecha = new Date(registro[campo]);

    if (Number.isNaN(fecha.getTime())) return contador;
    return fecha.getMonth() === mes && fecha.getFullYear() === anio ? contador + 1 : contador;
  }, 0);

  return encontroCampoFecha ? total : 0;
}

function obtenerUltimaFactura(facturas) {
  return [...facturas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0] || null;
}

function obtenerFacturasHoy(facturas) {
  const hoy = normalizarFechaClave(new Date());
  return facturas.filter(factura => normalizarFechaClave(factura.fecha) === hoy).length;
}

function obtenerVentasHoy(facturas) {
  const hoy = normalizarFechaClave(new Date());
  return facturas
    .filter(factura => normalizarFechaClave(factura.fecha) === hoy)
    .reduce((sum, factura) => sum + Number(factura.total || 0), 0);
}

function sumarTotalesFacturas(facturas) {
  return facturas.reduce((sum, factura) => sum + Number(factura.total || 0), 0);
}

function normalizarFechaClave(fecha) {
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatearFecha(fecha) {
  const date = crearFechaLocal(fecha);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatearFechaCorta(fecha) {
  const date = crearFechaLocal(fecha);
  if (Number.isNaN(date.getTime())) return "--";

  const dia = date.getDate();
  const mes = date.toLocaleDateString("en-US", { month: "short" });

  return `${dia} ${mes}`;
}

function crearFechaLocal(fecha) {
  if (fecha instanceof Date) return fecha;

  const texto = String(fecha || "");
  const soloFecha = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (soloFecha) {
    return new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]));
  }

  return new Date(fecha);
}

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  });
}

function formatearMonedaCompacta(valor) {
  const numero = Number(valor || 0);

  if (numero >= 1000000) return `$${(numero / 1000000).toFixed(1)}M`;
  if (numero >= 1000) return `$${(numero / 1000).toFixed(1)}k`;

  return `$${numero.toFixed(0)}`;
}

function setText(id, value) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = value;
}

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
