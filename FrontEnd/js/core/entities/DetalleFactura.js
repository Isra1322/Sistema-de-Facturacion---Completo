import { Cantidad } from "../valueObjects/Cantidad.js";
import { Dinero } from "../valueObjects/Dinero.js";

export class DetalleFactura {
  constructor({ idProducto, nombreProducto, precioUnitario, cantidad, aplicaIva, porcentajeIva }) {
    this.idProducto = idProducto;
    this.nombreProducto = nombreProducto;
    this.precioUnitario = new Dinero(precioUnitario).value;
    this.cantidad = new Cantidad(cantidad).value;
    this.aplicaIva = Boolean(aplicaIva);
    this.porcentajeIva = parseFloat(porcentajeIva || 0);

    // Calcular valores de la línea
    this.subtotal = Dinero.round(this.precioUnitario * this.cantidad);
    const taxRate = this.aplicaIva ? this.porcentajeIva : 0;
    this.ivaLinea = Dinero.round((this.subtotal * taxRate) / 100);
    this.totalLinea = Dinero.round(this.subtotal + this.ivaLinea);
  }
}
