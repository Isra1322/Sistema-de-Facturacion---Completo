namespace SistemaFacturacion.Application.Interfaces
{
    public interface IErrorLogService
    {
        Task RegistrarErrorAsync(
            Exception exception,
            string? ruta,
            string? metodoHttp,
            string? usuario);
    }
}
