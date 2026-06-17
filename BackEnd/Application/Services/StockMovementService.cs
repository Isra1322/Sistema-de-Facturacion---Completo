using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class StockMovementService : IStockMovementService
    {
        private readonly IStockMovementRepository _stockMovementRepository;

        public StockMovementService(IStockMovementRepository stockMovementRepository)
        {
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task RegistrarSalidaPorVentaAsync(
            int idProducto,
            int cantidad,
            int stockAnterior,
            int stockNuevo,
            int numeroFactura,
            int idUsuario)
        {
            var stockMovement = new StockMovement
            {
                IdProducto = idProducto,
                TipoMovimiento = "Salida",
                Cantidad = cantidad,
                StockAnterior = stockAnterior,
                StockNuevo = stockNuevo,
                Fecha = DateTime.Now,
                Motivo = "Venta",
                NumeroFactura = numeroFactura,
                IdUsuario = idUsuario
            };

            await _stockMovementRepository.AgregarAsync(stockMovement);
        }
    }
}
