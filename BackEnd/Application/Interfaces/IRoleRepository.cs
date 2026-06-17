using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> ObtenerTodosAsync();
        Task<Role?> ObtenerPorNombreAsync(string nombre);
        Task<bool> ExistePorNombreAsync(string nombre);
        Task AgregarAsync(Role role);
    }
}
