using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class ClienteRepository : IClienteRepository
    {
        private readonly ApplicationDbContext _context;

        public ClienteRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Cliente>> ObtenerTodosAsync()
        {
            return await _context.Clientes
                .Where(c => c.Estado == "Activo")
                .ToListAsync();
        }

        public async Task<Cliente?> ObtenerPorIdAsync(int idCliente)
        {
            return await _context.Clientes
                .FirstOrDefaultAsync(c => c.IdCliente == idCliente && c.Estado == "Activo");
        }

        public async Task<Cliente?> ObtenerPorIdIncluyendoInactivosAsync(int idCliente)
        {
            return await _context.Clientes
                .FirstOrDefaultAsync(c => c.IdCliente == idCliente);
        }

        public async Task<IEnumerable<Cliente>> BuscarAsync(string nombre, string correo, string estado, int pagina, int tamanioPagina)
        {
            var query = AplicarFiltroEstado(_context.Clientes.AsQueryable(), estado);

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                nombre = nombre.ToLower();

                query = query.Where(c =>
                    (c.Nombre + " " + c.Apellido).ToLower().Contains(nombre) ||
                    c.Nombre.ToLower().Contains(nombre) ||
                    c.Apellido.ToLower().Contains(nombre));
            }

            if (!string.IsNullOrWhiteSpace(correo))
            {
                correo = correo.ToLower();

                query = query.Where(c =>
                    c.Correo.ToLower().Contains(correo));
            }

            return await query
                .OrderBy(c => c.IdCliente)
                .Skip((pagina - 1) * tamanioPagina)
                .Take(tamanioPagina)
                .ToListAsync();
        }

        public async Task<int> ContarBusquedaAsync(string nombre, string correo, string estado)
        {
            var query = AplicarFiltroEstado(_context.Clientes.AsQueryable(), estado);

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                nombre = nombre.ToLower();

                query = query.Where(c =>
                    (c.Nombre + " " + c.Apellido).ToLower().Contains(nombre) ||
                    c.Nombre.ToLower().Contains(nombre) ||
                    c.Apellido.ToLower().Contains(nombre));
            }

            if (!string.IsNullOrWhiteSpace(correo))
            {
                correo = correo.ToLower();

                query = query.Where(c =>
                    c.Correo.ToLower().Contains(correo));
            }

            return await query.CountAsync();
        }

        public async Task<bool> ExisteCorreoAsync(string correo, int? excluirIdCliente = null)
        {
            var query = _context.Clientes.Where(c => c.Correo == correo);

            if (excluirIdCliente.HasValue)
            {
                query = query.Where(c => c.IdCliente != excluirIdCliente.Value);
            }

            return await query.AnyAsync();
        }

        public async Task AgregarAsync(Cliente cliente)
        {
            await _context.Clientes.AddAsync(cliente);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(Cliente cliente)
        {
            var clienteExistente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.IdCliente == cliente.IdCliente);

            if (clienteExistente == null)
            {
                return;
            }

            clienteExistente.Nombre = cliente.Nombre;
            clienteExistente.Apellido = cliente.Apellido;
            clienteExistente.Direccion = cliente.Direccion;
            clienteExistente.Telefono = cliente.Telefono;
            clienteExistente.Correo = cliente.Correo;
            clienteExistente.Estado = cliente.Estado;

            await _context.SaveChangesAsync();
        }

        private static IQueryable<Cliente> AplicarFiltroEstado(IQueryable<Cliente> query, string estado)
        {
            if (estado == "Todos")
            {
                return query;
            }

            if (estado == "Inactivo")
            {
                return query.Where(c => c.Estado == "Inactivo");
            }

            return query.Where(c => c.Estado == "Activo");
        }
    }
}
