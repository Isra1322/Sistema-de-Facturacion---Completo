using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class StockMovementRepository : IStockMovementRepository
    {
        private readonly ApplicationDbContext _context;

        public StockMovementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AgregarAsync(StockMovement stockMovement)
        {
            await _context.StockMovements.AddAsync(stockMovement);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<StockMovement>> ListarPorProductoAsync(int idProducto)
        {
            return await _context.StockMovements
                .Where(m => m.IdProducto == idProducto)
                .OrderByDescending(m => m.Fecha)
                .ToListAsync();
        }
    }
}
