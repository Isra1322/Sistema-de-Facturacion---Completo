import { Cliente } from "../../../core/entities/Cliente.js";

export class CrearClienteUseCase {
  constructor(clienteRepository) {
    this._clienteRepository = clienteRepository;
  }

  async execute({ idCliente = 0, nombre, apellido, direccion, telefono, correo }) {
    const cliente = new Cliente({ idCliente, nombre, apellido, direccion, telefono, correo });
    return await this._clienteRepository.guardar(cliente);
  }
}
