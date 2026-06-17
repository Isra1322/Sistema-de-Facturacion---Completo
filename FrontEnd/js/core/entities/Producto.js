import { DomainException } from "../exceptions/DomainException.js";

export class Producto {
  constructor({ idProducto = 0, nombre, precio, stock, categoria, aplicaIva = false, porcentajeIva = 0, estado = "Activo" }) {
    this.idProducto = idProducto;
    this.nombre = this._normalizeName(nombre);
    
    const parsedPrecio = parseFloat(precio);
    if (isNaN(parsedPrecio) || parsedPrecio <= 0) {
      throw new DomainException("El precio debe ser mayor a 0.");
    }
    this.precio = parsedPrecio;

    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      throw new DomainException("El stock no puede ser negativo.");
    }
    this.stock = parsedStock;

    if (!categoria || !categoria.trim()) {
      throw new DomainException("La categoría es obligatoria.");
    }
    this.categoria = categoria.trim();
    this.estado = estado;

    // Reglas de negocio para IVA
    if (this.categoria === "Tecnologia") {
      this.aplicaIva = true;
      this.porcentajeIva = 15;
    } else {
      this.aplicaIva = Boolean(aplicaIva);
      if (!this.aplicaIva) {
        this.porcentajeIva = 0;
      } else {
        const parsedIva = parseFloat(porcentajeIva);
        if (isNaN(parsedIva) || parsedIva < 0 || parsedIva > 100) {
          throw new DomainException("El porcentaje de IVA debe estar entre 0 y 100.");
        }
        this.porcentajeIva = parsedIva;
      }
    }
  }

  _normalizeName(val) {
    if (!val || !val.trim()) {
      throw new DomainException("El nombre del producto es obligatorio.");
    }
    
    const clean = val
      .replace(/\s+/g, " ")
      .trimStart()
      .slice(0, 60);

    return clean.split(" ").map(word => {
      if (!word) return "";
      // Formatear palabra
      if (/\d/.test(word) && /[A-Z]{2,}/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      const lowered = word.toLowerCase();
      return lowered.charAt(0).toUpperCase() + lowered.slice(1);
    }).join(" ");
  }

  validarStockDisponible(cantidad) {
    if (this.stock < cantidad) {
      throw new DomainException(
        `El producto '${this.nombre}' tiene stock insuficiente. Solicitado: ${cantidad}, disponible: ${this.stock}.`
      );
    }
  }
}
