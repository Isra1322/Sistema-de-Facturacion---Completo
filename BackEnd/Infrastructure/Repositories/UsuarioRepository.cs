using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly ApplicationDbContext _context;

        public UsuarioRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Usuario>> ObtenerTodosAsync()
        {
            return await _context.Usuarios.ToListAsync();
        }

        public async Task<Usuario?> ObtenerPorIdAsync(int idUsuario)
        {
            return await _context.Usuarios.FindAsync(idUsuario);
        }

        public async Task<Usuario?> ObtenerPorCorreoAsync(string correo)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo);
        }

        public async Task<bool> ExisteCorreoAsync(string correo, int? excluirIdUsuario = null)
        {
            var query = _context.Usuarios.Where(u => u.Correo == correo);

            if (excluirIdUsuario.HasValue)
            {
                query = query.Where(u => u.IdUsuario != excluirIdUsuario.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> ExisteOtroAdministradorConAccesoAsync(int idUsuario)
        {
            return await _context.Usuarios.AnyAsync(u =>
                u.IdUsuario != idUsuario &&
                u.Rol == "Administrador" &&
                u.Activo &&
                !u.Bloqueado);
        }

        public async Task AgregarAsync(Usuario usuario)
        {
            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
        }

        public async Task GuardarCambiosAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
