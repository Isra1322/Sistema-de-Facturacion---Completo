namespace SistemaFacturacion.Application.Interfaces
{
    public interface IStockMovementService
    {
        Task RegistrarSalidaPorVentaAsync(
            int idProducto,
            int cantidad,
            int stockAnterior,
            int stockNuevo,
            int numeroFactura,
            int idUsuario);
    }
}
