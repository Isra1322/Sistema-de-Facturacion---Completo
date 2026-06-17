import { ApiClient } from "../api/apiClient.js";
import { Cliente } from "../../core/entities/Cliente.js";

export class ClienteRepository {
  constructor() {
    this.baseUrl = "http://localhost:5161/api/Cliente";
  }

  async buscar({ nombre = "", correo = "", estado = "Activo", pagina = 1, tamanioPagina = 100000 }) {
    const url = `${this.baseUrl}/buscar?nombre=${encodeURIComponent(nombre)}&correo=${encodeURIComponent(correo)}&estado=${encodeURIComponent(estado)}&pagina=${pagina}&tamanioPagina=${tamanioPagina}&_=${Date.now()}`;
    const response = await ApiClient.fetch(url, { cache: "no-store" });
    
    if (!response || !response.ok) {
      throw new Error("No se pudieron buscar los clientes.");
    }
    
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.datos || []);
    
    return list.map(item => new Cliente({
      idCliente: item.idCliente,
      nombre: item.nombre,
      apellido: item.apellido,
      direccion: item.direccion,
      telefono: item.telefono,
      correo: item.correo,
      estado: item.estado || "Activo"
    }));
  }

  async guardar(cliente) {
    const isEdit = cliente.idCliente > 0;
    const url = isEdit ? `${this.baseUrl}/${cliente.idCliente}` : this.baseUrl;
    const response = await ApiClient.fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idCliente: cliente.idCliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        correo: cliente.correo
      })
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo guardar el cliente.";
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
    // Retornar los datos parseados
    return data;
  }

  async eliminar(id) {
    const response = await ApiClient.fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE"
    });

    if (!response || !response.ok) {
      let mensaje = "No se pudo eliminar el cliente.";
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
      let mensaje = "No se pudo reactivar el cliente.";
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

