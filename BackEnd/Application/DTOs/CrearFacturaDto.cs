namespace SistemaFacturacion.Application.DTOs
{
    public class CrearFacturaDto
    {
        public int IdCliente { get; set; }
        public List<DetalleFacturaDto> Detalles { get; set; } = new();
    }
}