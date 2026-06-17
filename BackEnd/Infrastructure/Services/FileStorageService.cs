using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.Infrastructure.Services
{
    public class FileStorageService : IFileStorageService
    {
        private readonly string _directorioFacturas;

        public FileStorageService(IConfiguration configuration, IHostEnvironment environment)
        {
            var directorioConfigurado = configuration["PdfStorage:OutputDirectory"];
            var directorio = string.IsNullOrWhiteSpace(directorioConfigurado)
                ? "FacturasGeneradas"
                : directorioConfigurado;

            _directorioFacturas = Path.IsPathRooted(directorio)
                ? directorio
                : Path.Combine(environment.ContentRootPath, directorio);
        }

        public async Task GuardarAsync(string nombreArchivo, byte[] contenido)
        {
            Directory.CreateDirectory(_directorioFacturas);

            var rutaArchivo = Path.Combine(_directorioFacturas, nombreArchivo);
            await File.WriteAllBytesAsync(rutaArchivo, contenido);
        }
    }
}
