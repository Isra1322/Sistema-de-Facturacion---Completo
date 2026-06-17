using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _context;

        public RoleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Role>> ObtenerTodosAsync()
        {
            return await _context.Roles
                .OrderBy(r => r.Nombre)
                .ToListAsync();
        }

        public async Task<Role?> ObtenerPorNombreAsync(string nombre)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.Nombre == nombre);
        }

        public async Task<bool> ExistePorNombreAsync(string nombre)
        {
            return await _context.Roles
                .AnyAsync(r => r.Nombre == nombre);
        }

        public async Task AgregarAsync(Role role)
        {
            await _context.Roles.AddAsync(role);
            await _context.SaveChangesAsync();
        }
    }
}
