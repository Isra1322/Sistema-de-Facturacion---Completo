using SistemaFacturacion.Application.DTOs;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IPdfFacturaService
    {
        byte[] GenerarPdf(FacturaResponseDto factura);
    }
}
