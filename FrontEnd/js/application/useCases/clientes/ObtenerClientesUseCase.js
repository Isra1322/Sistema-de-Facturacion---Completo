export class ObtenerClientesUseCase {
  constructor(clienteRepository) {
    this._clienteRepository = clienteRepository;
  }

  async execute({ nombre = "", correo = "", estado = "Activo" } = {}) {
    return await this._clienteRepository.buscar({ nombre, correo, estado });
  }
}
