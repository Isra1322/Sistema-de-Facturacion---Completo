export class CrearFacturaUseCase {
  constructor(facturaRepository) {
    this._facturaRepository = facturaRepository;
  }

  async execute(factura) {
    factura.validarParaGuardar();
    return await this._facturaRepository.guardar(factura);
  }
}
