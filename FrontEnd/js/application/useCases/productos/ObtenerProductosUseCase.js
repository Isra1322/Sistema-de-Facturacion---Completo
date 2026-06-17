export class ObtenerProductosUseCase {
  constructor(productoRepository) {
    this._productoRepository = productoRepository;
  }

  async execute({ texto = "", estado = "Activo" } = {}) {
    return await this._productoRepository.buscar({ texto, estado });
  }
}
