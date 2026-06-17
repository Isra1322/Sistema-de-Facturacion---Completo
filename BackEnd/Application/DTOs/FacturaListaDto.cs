namespace SistemaFacturacion.Application.DTOs
{
    public class FacturaListaDto
    {
        public int NumeroFactura { get; set; }
        public DateTime Fecha { get; set; }
        public int IdCliente { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}
