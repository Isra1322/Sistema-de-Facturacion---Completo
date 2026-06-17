using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;
using SistemaFacturacion.Infrastructure.Persistence;

namespace SistemaFacturacion.Infrastructure.Repositories
{
    public class ErrorLogRepository : IErrorLogRepository
    {
        private readonly ApplicationDbContext _context;

        public ErrorLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AgregarAsync(ErrorLog errorLog)
        {
            await _context.ErrorLogs.AddAsync(errorLog);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ErrorLog>> ObtenerTodosAsync()
        {
            return await _context.ErrorLogs
                .OrderByDescending(e => e.Fecha)
                .ToListAsync();
        }
    }
}
