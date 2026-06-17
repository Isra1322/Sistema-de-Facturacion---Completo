import { Dinero } from "../valueObjects/Dinero.js";
import { DomainException } from "../exceptions/DomainException.js";
import { DetalleFactura } from "./DetalleFactura.js";

export class Factura {
  constructor({ idFactura = 0, numeroFactura = 0, fecha = new Date(), cliente = null, idUsuario = null }) {
    this.idFactura = idFactura;
    this.numeroFactura = numeroFactura;
    this.fecha = fecha instanceof Date ? fecha : new Date(fecha);
    this.cliente = cliente;
    this.idUsuario = idUsuario;
    this.detallesFactura = [];
    
    this.subtotal = 0;
    this.iva = 0;
    this.total = 0;
  }

  setCliente(cliente) {
    if (!cliente) {
      throw new DomainException("El cliente es obligatorio para la factura.");
    }
    this.cliente = cliente;
  }

  agregarProducto(producto, cantidad) {
    if (!this.cliente) {
      throw new DomainException("Debe seleccionar un cliente antes de agregar productos.");
    }
    if (!producto) {
      throw new DomainException("El producto es obligatorio.");
    }
    producto.validarStockDisponible(cantidad);

    // Si ya existe en el detalle, sumamos la cantidad
    const existenteIdx = this.detallesFactura.findIndex(d => d.idProducto === producto.idProducto);
    if (existenteIdx !== -1) {
      const nuevaCantidad = this.detallesFactura[existenteIdx].cantidad + cantidad;
      producto.validarStockDisponible(nuevaCantidad);
      
      // Reemplazar la línea por una nueva con cantidad acumulada
      this.detallesFactura[existenteIdx] = new DetalleFactura({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: nuevaCantidad,
        aplicaIva: producto.aplicaIva,
        porcentajeIva: producto.porcentajeIva
      });
    } else {
      this.detallesFactura.push(new DetalleFactura({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: cantidad,
        aplicaIva: producto.aplicaIva,
        porcentajeIva: producto.porcentajeIva
      }));
    }

    this.calcularTotales();
  }

  quitarDetalle(idProducto) {
    this.detallesFactura = this.detallesFactura.filter(d => d.idProducto !== idProducto);
    this.calcularTotales();
  }

  calcularTotales() {
    let subtotalAcumulado = 0;
    let ivaAcumulado = 0;

    this.detallesFactura.forEach(d => {
      subtotalAcumulado += d.subtotal;
      ivaAcumulado += d.ivaLinea;
    });

    this.subtotal = Dinero.round(subtotalAcumulado);
    this.iva = Dinero.round(ivaAcumulado);
    this.total = Dinero.round(this.subtotal + this.iva);
  }

  validarParaGuardar() {
    if (!this.cliente) {
      throw new DomainException("Debe seleccionar un cliente.");
    }
    if (this.detallesFactura.length === 0) {
      throw new DomainException("La factura debe tener al menos un producto.");
    }
  }
}
