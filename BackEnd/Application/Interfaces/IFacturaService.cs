using SistemaFacturacion.Application.DTOs;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IFacturaService
    {
        Task<ServiceResult<object>> CrearFacturaAsync(CrearFacturaDto dto, int? idUsuario);
        Task<ServiceResult<FacturaResponseDto>> ObtenerPorNumeroAsync(int numeroFactura, string? rol, int? idUsuario);
        Task<ServiceResult<object>> BuscarAsync(
            int? idCliente,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int pagina,
            int tamanioPagina,
            string? rol,
            int? idUsuario);
        Task<ServiceResult<object>> ObtenerResumenAsync(string? rol, int? idUsuario);
        Task<ServiceResult<object>> ObtenerPorFechaAsync(DateTime fecha, int pagina, int tamanioPagina, string? rol, int? idUsuario);
        Task<ServiceResult<byte[]>> GenerarPdfAsync(int numeroFactura, string? rol, int? idUsuario);
    }
}
