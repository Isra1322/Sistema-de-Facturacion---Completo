export class EliminarProductoUseCase {
  constructor(productoRepository) {
    this._productoRepository = productoRepository;
  }

  async execute(id) {
    return await this._productoRepository.eliminar(id);
  }

  async reactivar(id) {
    return await this._productoRepository.reactivar(id);
  }
}
