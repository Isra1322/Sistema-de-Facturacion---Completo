using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IErrorLogRepository
    {
        Task AgregarAsync(ErrorLog errorLog);
        Task<IEnumerable<ErrorLog>> ObtenerTodosAsync();
    }
}
