using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class ErrorLogService : IErrorLogService
    {
        private readonly IErrorLogRepository _errorLogRepository;

        public ErrorLogService(IErrorLogRepository errorLogRepository)
        {
            _errorLogRepository = errorLogRepository;
        }

        public async Task RegistrarErrorAsync(
            Exception exception,
            string? ruta,
            string? metodoHttp,
            string? usuario)
        {
            var errorLog = new ErrorLog
            {
                Fecha = DateTime.Now,
                Nivel = "Error",
                Mensaje = exception.Message,
                Detalle = exception.InnerException?.Message,
                Ruta = ruta,
                MetodoHttp = metodoHttp,
                Usuario = usuario,
                StackTrace = exception.ToString()
            };

            await _errorLogRepository.AgregarAsync(errorLog);
        }
    }
}
