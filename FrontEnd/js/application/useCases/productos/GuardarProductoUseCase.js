import { Producto } from "../../../core/entities/Producto.js";

export class GuardarProductoUseCase {
  constructor(productoRepository) {
    this._productoRepository = productoRepository;
  }

  async execute({ idProducto = 0, nombre, precio, stock, categoria, aplicaIva, porcentajeIva }) {
    const producto = new Producto({
      idProducto,
      nombre,
      precio,
      stock,
      categoria,
      aplicaIva,
      porcentajeIva
    });

    return await this._productoRepository.guardar(producto);
  }
}
