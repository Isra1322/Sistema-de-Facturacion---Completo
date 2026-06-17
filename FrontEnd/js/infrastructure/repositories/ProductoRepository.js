import { ApiClient } from "../api/apiClient.js";
import { Producto } from "../../core/entities/Producto.js";

export class ProductoRepository {
  constructor() {
    this.baseUrl = "http://localhost:5161/api/Producto";
  }

  async buscar({ texto = "", estado = "Activo", pagina = 1, tamanioPagina = 100000 }) {
    const url = `${this.baseUrl}/buscar?texto=${encodeURIComponent(texto)}&estado=${encodeURIComponent(estado)}&pagina=${pagina}&tamanioPagina=${tamanioPagina}&_=${Date.now()}`;
    const response = await ApiClient.fetch(url, { cache: "no-store" });

    if (!response || !response.ok) {
      throw new Error("No se pudieron cargar los productos.");
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.datos || []);

    return list.map(item => new Producto({
      idProducto: item.idProducto,
      nombre: item.nombre,
      precio: item.precio,
      stock: item.stock,
      categoria: item.categoria,
      aplicaIva: item.aplicaIva,
      porcentajeIva: item.porcentajeIva,
      estado: item.estado
    }));
  }

  async obtenerPorId(id) {
    const response = await ApiClient.fetch(`${this.baseUrl}/${id}`);
    
    if (!response || !response.ok) {
      throw new Error("No se pudo obtener el producto.");
    }

    const item = await response.json();
    return new Producto({
      idProducto: item.idProducto,
      nombre: item.nombre,
      precio: item.precio,
      stock: item.stock,
      categoria: item.categoria,
      aplicaIva: item.aplicaIva,
      porcentajeIva: item.porcentajeIva,
      estado: item.estado
    });
  }

  async guardar(producto) {
    const isEdit = producto.idProducto > 0;
    const url = isEdit ? `${this.baseUrl}/${producto.idProducto}` : this.baseUrl;
    const response = await ApiClient.fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        aplicaIva: producto.aplicaIva,
        porcentajeIva: producto.porcentajeIva
      })
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo guardar el producto.";
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

    return await response.json();
  }

  async eliminar(id) {
    const response = await ApiClient.fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE"
    });

    if (!response || !response.ok) {
      let mensaje = "No se puede eliminar el producto.";
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
  }

  async reactivar(id) {
    const response = await ApiClient.fetch(`${this.baseUrl}/${id}/reactivar`, {
      method: "PUT"
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo reactivar el producto.";
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
  }
}
