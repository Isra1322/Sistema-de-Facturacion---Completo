namespace SistemaFacturacion.Application.Interfaces
{
    public interface IFileStorageService
    {
        Task GuardarAsync(string nombreArchivo, byte[] contenido);
    }
}
