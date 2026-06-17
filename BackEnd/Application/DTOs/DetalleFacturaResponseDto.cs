namespace SistemaFacturacion.Application.DTOs
{
    public class DetalleFacturaResponseDto
    {
        public int IdProducto { get; set; }
        public string Producto { get; set; } = string.Empty;
        public string ProductoCategoria { get; set; } = string.Empty;
        public bool AplicaIva { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal PorcentajeIva { get; set; }
        public decimal IvaLinea { get; set; }
        public decimal TotalLinea { get; set; }
    }
}
