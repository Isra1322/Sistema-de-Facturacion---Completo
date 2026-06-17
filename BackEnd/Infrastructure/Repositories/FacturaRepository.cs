using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class FacturaRepository : IFacturaRepository
    {
        private readonly ApplicationDbContext _context;

        public FacturaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Factura?> ObtenerPorIdAsync(int idFactura)
        {
            return await _context.Facturas
                .Include(f => f.Cliente)
                .Include(f => f.Usuario)
                .Include(f => f.DetallesFactura)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(f => f.IdFactura == idFactura);
        }

        public async Task<Factura?> ObtenerPorNumeroAsync(int numeroFactura, int? idUsuario = null)
        {
            var query = _context.Facturas
                .Include(f => f.Cliente)
                .Include(f => f.Usuario)
                .Include(f => f.DetallesFactura)
                    .ThenInclude(d => d.Producto)
                .AsQueryable();

            query = AplicarFiltroUsuario(query, idUsuario);

            return await query.FirstOrDefaultAsync(f => f.NumeroFactura == numeroFactura);
        }

        public async Task<IEnumerable<Factura>> ObtenerPorFechaAsync(DateTime fecha, int pagina, int tamanioPagina, int? idUsuario = null)
        {
            var query = _context.Facturas
                .Include(f => f.Cliente)
                .Where(f => f.Fecha.Date == fecha.Date);

            query = AplicarFiltroUsuario(query, idUsuario);

            return await query
                .OrderByDescending(f => f.Fecha)
                .Skip((pagina - 1) * tamanioPagina)
                .Take(tamanioPagina)
                .ToListAsync();
        }

        public async Task<int> ContarPorFechaAsync(DateTime fecha, int? idUsuario = null)
        {
            var query = _context.Facturas
                .Where(f => f.Fecha.Date == fecha.Date);

            query = AplicarFiltroUsuario(query, idUsuario);

            return await query.CountAsync();
        }

        public async Task<IEnumerable<Factura>> BuscarAsync(
            int? idCliente,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int pagina,
            int tamanioPagina,
            int? idUsuario = null)
        {
            var query = _context.Facturas
                .Include(f => f.Cliente)
                .AsQueryable();

            query = AplicarFiltroUsuario(query, idUsuario);

            if (idCliente.HasValue)
                query = query.Where(f => f.IdCliente == idCliente.Value);

            if (fechaDesde.HasValue)
                query = query.Where(f => f.Fecha.Date >= fechaDesde.Value.Date);

            if (fechaHasta.HasValue)
                query = query.Where(f => f.Fecha.Date <= fechaHasta.Value.Date);

            return await query
                .OrderByDescending(f => f.Fecha)
                .Skip((pagina - 1) * tamanioPagina)
                .Take(tamanioPagina)
                .ToListAsync();
        }

        public async Task<int> ContarBusquedaAsync(
            int? idCliente,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? idUsuario = null)
        {
            var query = _context.Facturas.AsQueryable();

            query = AplicarFiltroUsuario(query, idUsuario);

            if (idCliente.HasValue)
                query = query.Where(f => f.IdCliente == idCliente.Value);

            if (fechaDesde.HasValue)
                query = query.Where(f => f.Fecha.Date >= fechaDesde.Value.Date);

            if (fechaHasta.HasValue)
                query = query.Where(f => f.Fecha.Date <= fechaHasta.Value.Date);

            return await query.CountAsync();
        }

        public async Task<int> ContarTotalAsync(int? idUsuario = null)
        {
            var query = AplicarFiltroUsuario(_context.Facturas.AsQueryable(), idUsuario);

            return await query.CountAsync();
        }

        public async Task<decimal> ObtenerTotalVentasAsync(int? idUsuario = null)
        {
            var query = AplicarFiltroUsuario(_context.Facturas.AsQueryable(), idUsuario);

            return await query.SumAsync(f => (decimal?)f.Total) ?? 0;
        }

        public async Task<decimal> ObtenerTotalVentasHoyAsync(int? idUsuario = null)
        {
            var inicioHoy = DateTime.Today;
            var finHoy = inicioHoy.AddDays(1);

            var query = _context.Facturas
                .Where(f => f.Fecha >= inicioHoy && f.Fecha < finHoy)
                .AsQueryable();

            query = AplicarFiltroUsuario(query, idUsuario);

            return await query.SumAsync(f => (decimal?)f.Total) ?? 0;
        }

        public async Task<Factura?> ObtenerUltimaFacturaAsync(int? idUsuario = null)
        {
            var query = _context.Facturas
                .Include(f => f.Cliente)
                .AsQueryable();

            query = AplicarFiltroUsuario(query, idUsuario);

            return await query
                .OrderByDescending(f => f.Fecha)
                .FirstOrDefaultAsync();
        }

        public async Task<int> ContarFacturasHoyAsync(int? idUsuario = null)
        {
            var inicioHoy = DateTime.Today;
            var finHoy = inicioHoy.AddDays(1);

            var query = _context.Facturas
                .Where(f => f.Fecha >= inicioHoy && f.Fecha < finHoy)
                .AsQueryable();

            query = AplicarFiltroUsuario(query, idUsuario);

            return await query.CountAsync();
        }

        public async Task<int> ObtenerSiguienteNumeroFacturaAsync()
        {
            var conexion = _context.Database.GetDbConnection();
            var estabaAbierta = conexion.State == ConnectionState.Open;

            if (!estabaAbierta)
            {
                await conexion.OpenAsync();
            }

            try
            {
                await using var comando = conexion.CreateCommand();
                comando.CommandText = "SELECT NEXT VALUE FOR SeqNumeroFactura";

                var transaccionActual = _context.Database.CurrentTransaction;
                if (transaccionActual != null)
                {
                    comando.Transaction = transaccionActual.GetDbTransaction();
                }

                var resultado = await comando.ExecuteScalarAsync();
                return Convert.ToInt32(resultado);
            }
            finally
            {
                if (!estabaAbierta)
                {
                    await conexion.CloseAsync();
                }
            }
        }

        public async Task AgregarAsync(Factura factura)
        {
            await _context.Facturas.AddAsync(factura);
            await _context.SaveChangesAsync();
        }

        private static IQueryable<Factura> AplicarFiltroUsuario(IQueryable<Factura> query, int? idUsuario)
        {
            return idUsuario.HasValue
                ? query.Where(f => f.IdUsuario == idUsuario.Value)
                : query;
        }
    }
}
