using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class ProductoRepository : IProductoRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Producto>> ObtenerTodosAsync()
        {
            return await _context.Productos
                .Where(p => p.Estado == "Activo")
                .ToListAsync();
        }

        public async Task<Producto?> ObtenerPorIdAsync(int idProducto)
        {
            return await _context.Productos
                .FirstOrDefaultAsync(p => p.IdProducto == idProducto && p.Estado == "Activo");
        }

        public async Task<Producto?> ObtenerPorIdIncluyendoInactivosAsync(int idProducto)
        {
            return await _context.Productos
                .FirstOrDefaultAsync(p => p.IdProducto == idProducto);
        }

        public async Task<IEnumerable<Producto>> ObtenerDisponiblesParaVentaAsync()
        {
            return await _context.Productos
                .Where(p => p.Estado == "Activo" && p.Stock > 0)
                .OrderBy(p => p.IdProducto)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> BuscarAsync(string textoBusqueda, string estado, int pagina, int tamanioPagina)
        {
            var query = AplicarFiltroEstado(_context.Productos.AsQueryable(), estado);

            if (!string.IsNullOrWhiteSpace(textoBusqueda))
            {
                query = query.Where(p =>
                    p.Nombre.Contains(textoBusqueda));
            }

            return await query
                .OrderBy(p => p.IdProducto)
                .Skip((pagina - 1) * tamanioPagina)
                .Take(tamanioPagina)
                .ToListAsync();
        }

        public async Task<int> ContarBusquedaAsync(string textoBusqueda, string estado)
        {
            var query = AplicarFiltroEstado(_context.Productos.AsQueryable(), estado);

            if (!string.IsNullOrWhiteSpace(textoBusqueda))
            {
                query = query.Where(p =>
                    p.Nombre.Contains(textoBusqueda));
            }

            return await query.CountAsync();
        }

        public async Task<bool> ExistePorNombreAsync(string nombre)
        {
            return await _context.Productos
                .AnyAsync(p => p.Nombre.ToLower() == nombre.ToLower());
        }

        public async Task AgregarAsync(Producto producto)
        {
            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(Producto producto)
        {
            var productoExistente = await _context.Productos
                .FirstOrDefaultAsync(p => p.IdProducto == producto.IdProducto);

            if (productoExistente == null)
            {
                return;
            }

            productoExistente.Nombre = producto.Nombre;
            productoExistente.Precio = producto.Precio;
            productoExistente.Stock = producto.Stock;
            productoExistente.Categoria = producto.Categoria;
            productoExistente.AplicaIva = producto.AplicaIva;
            productoExistente.PorcentajeIva = producto.PorcentajeIva;
            productoExistente.Estado = producto.Estado;

            await _context.SaveChangesAsync();
        }

        private static IQueryable<Producto> AplicarFiltroEstado(IQueryable<Producto> query, string estado)
        {
            if (estado == "Todos")
            {
                return query;
            }

            if (estado == "Inactivo")
            {
                return query.Where(p => p.Estado == "Inactivo");
            }

            return query.Where(p => p.Estado == "Activo");
        }

        public async Task EjecutarEnTransaccionAsync(Func<Task> operacion)
        {
            await using var transaccion = await _context.Database.BeginTransactionAsync();

            try
            {
                await operacion();
                await transaccion.CommitAsync();
            }
            catch
            {
                await transaccion.RollbackAsync();
                throw;
            }
        }
    }
}
