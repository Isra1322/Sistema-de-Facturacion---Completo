using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IFacturaRepository
    {
        Task<Factura?> ObtenerPorIdAsync(int idFactura);
        Task<Factura?> ObtenerPorNumeroAsync(int numeroFactura, int? idUsuario = null);

        Task<IEnumerable<Factura>> ObtenerPorFechaAsync(DateTime fecha, int pagina, int tamanioPagina, int? idUsuario = null);
        Task<int> ContarPorFechaAsync(DateTime fecha, int? idUsuario = null);

        Task<IEnumerable<Factura>> BuscarAsync(
            int? idCliente,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int pagina,
            int tamanioPagina,
            int? idUsuario = null
        );

        Task<int> ContarBusquedaAsync(
            int? idCliente,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? idUsuario = null
        );

        Task<int> ContarTotalAsync(int? idUsuario = null);
        Task<decimal> ObtenerTotalVentasAsync(int? idUsuario = null);
        Task<decimal> ObtenerTotalVentasHoyAsync(int? idUsuario = null);
        Task<Factura?> ObtenerUltimaFacturaAsync(int? idUsuario = null);
        Task<int> ContarFacturasHoyAsync(int? idUsuario = null);
        Task<int> ObtenerSiguienteNumeroFacturaAsync();

        Task AgregarAsync(Factura factura);
    }
}
