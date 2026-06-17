using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IClienteService
    {
        Task<ServiceResult<IEnumerable<Cliente>>> ObtenerTodosAsync();
        Task<ServiceResult<Cliente>> ObtenerPorIdAsync(int id);
        Task<ServiceResult<object>> BuscarAsync(string nombre, string correo, string estado, int pagina, int tamanioPagina, bool esVendedor);
        Task<ServiceResult<object>> AgregarAsync(Cliente cliente);
        Task<ServiceResult<object>> ActualizarAsync(int id, Cliente cliente);
        Task<ServiceResult<object>> EliminarAsync(int id);
        Task<ServiceResult<object>> ReactivarAsync(int id);
    }
}
