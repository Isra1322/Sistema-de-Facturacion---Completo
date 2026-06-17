using SistemaFacturacion.Application.DTOs;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IProductoService
    {
        Task<ServiceResult<IEnumerable<ProductoResponseDto>>> ObtenerTodosAsync();
        Task<ServiceResult<ProductoResponseDto>> ObtenerPorIdAsync(int id);
        Task<ServiceResult<IEnumerable<ProductoResponseDto>>> ObtenerDisponiblesParaVentaAsync();
        Task<ServiceResult<object>> BuscarAsync(string texto, string estado, int pagina, int tamanioPagina, bool esVendedor);
        Task<ServiceResult<object>> AgregarAsync(CrearProductoDto dto);
        Task<ServiceResult<object>> ActualizarAsync(int id, ActualizarProductoDto dto);
        Task<ServiceResult<object>> EliminarAsync(int id);
        Task<ServiceResult<object>> ReactivarAsync(int id);
    }
}
