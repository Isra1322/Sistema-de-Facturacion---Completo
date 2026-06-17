namespace SistemaFacturacion.Application.DTOs
{
    public class ProductoResponseDto
    {
        public int IdProducto { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string Categoria { get; set; } = "Otros";
        public bool AplicaIva { get; set; }
        public decimal PorcentajeIva { get; set; }
        public string Estado { get; set; } = "Activo";
    }
}
