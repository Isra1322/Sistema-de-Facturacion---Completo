namespace SistemaFacturacion.Application.DTOs
{
    public class FacturaResponseDto
    {
        public int NumeroFactura { get; set; }
        public DateTime Fecha { get; set; }
        public int? IdUsuario { get; set; }
        public string VendedorNombre { get; set; } = string.Empty;
        public string VendedorCorreo { get; set; } = string.Empty;
        public string VendedorRol { get; set; } = string.Empty;
        public VendedorFacturaDto? Vendedor { get; set; }

        public int IdCliente { get; set; }
        public string Cliente { get; set; } = string.Empty;

        public decimal Subtotal { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }

        public string Correo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;

        public List<DetalleFacturaResponseDto> Detalles { get; set; } = new();
    }
}
