import { ApiClient } from "../api/apiClient.js";

export class FacturaRepository {
  constructor() {
    this.baseUrl = "http://localhost:5161/api/Factura";
  }

  async guardar(factura) {
    // Preparar el DTO para el backend
    const dto = {
      idCliente: factura.cliente.idCliente,
      detalles: factura.detallesFactura.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad
      }))
    };

    const response = await ApiClient.fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo guardar la factura.";
      try {
        const errorData = await response.json();
        mensaje = errorData.mensaje || errorData.error || errorData.title || mensaje;
      } catch {
        try {
          const text = await response.text();
          if (text) mensaje = text;
        } catch {}
      }
      throw new Error(mensaje);
    }

    const data = await response.json();
    return data;
  }

  async buscar({ idCliente = null, fechaDesde = null, fechaHasta = null, pagina = 1, tamanioPagina = 6 }) {
    let url = `${this.baseUrl}/buscar?pagina=${pagina}&tamanioPagina=${tamanioPagina}`;
    
    if (idCliente) url += `&idCliente=${idCliente}`;
    if (fechaDesde) url += `&fechaDesde=${fechaDesde}`;
    if (fechaHasta) url += `&fechaHasta=${fechaHasta}`;
    url += `&_=${Date.now()}`;

    const response = await ApiClient.fetch(url, { cache: "no-store" });
    if (!response || !response.ok) {
      throw new Error("No se pudieron cargar las facturas.");
    }

    return await response.json();
  }

  async obtenerResumen() {
    const url = `${this.baseUrl}/resumen?_=${Date.now()}`;
    const response = await ApiClient.fetch(url, { cache: "no-store" });
    if (!response || !response.ok) {
      throw new Error("No se pudo obtener el resumen de facturas.");
    }
    return await response.json();
  }

  async obtenerPorNumero(numeroFactura) {
    const url = `${this.baseUrl}/${numeroFactura}?_=${Date.now()}`;
    const response = await ApiClient.fetch(url, { cache: "no-store" });
    if (!response || !response.ok) {
      throw new Error("No se pudo obtener la factura.");
    }
    return await response.json();
  }

  async descargarPdf(numeroFactura) {
    const url = `${this.baseUrl}/pdf/${numeroFactura}?_=${Date.now()}`;
    const response = await ApiClient.fetch(url, { cache: "no-store" });
    if (!response || !response.ok) {
      throw new Error("No se pudo descargar el PDF de la factura.");
    }
    return await response.blob();
  }
}
