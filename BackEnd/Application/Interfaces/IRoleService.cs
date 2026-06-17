using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IRoleService
    {
        Task<ServiceResult<IEnumerable<Role>>> ObtenerRolesAsync();
        Task<ServiceResult<object>> CrearRolAsync(Role role);
    }
}
