using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IStockMovementRepository
    {
        Task AgregarAsync(StockMovement stockMovement);
        Task<IEnumerable<StockMovement>> ListarPorProductoAsync(int idProducto);
    }
}
