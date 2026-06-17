using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<ServiceResult<IEnumerable<Role>>> ObtenerRolesAsync()
        {
            var roles = await _roleRepository.ObtenerTodosAsync();
            return ServiceResult<IEnumerable<Role>>.Ok(roles);
        }

        public async Task<ServiceResult<object>> CrearRolAsync(Role role)
        {
            if (string.IsNullOrWhiteSpace(role.Nombre))
                return ServiceResult<object>.Fail(400, "El nombre del rol es obligatorio");

            role.Nombre = role.Nombre.Trim();
            role.Descripcion = role.Descripcion?.Trim();
            role.Activo = true;

            if (await _roleRepository.ExistePorNombreAsync(role.Nombre))
                return ServiceResult<object>.Fail(400, "Ya existe un rol con ese nombre");

            await _roleRepository.AgregarAsync(role);

            return ServiceResult<object>.Ok(new { mensaje = "Rol creado correctamente" });
        }
    }
}
