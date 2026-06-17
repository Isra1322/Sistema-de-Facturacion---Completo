namespace SistemaFacturacion.Application.DTOs
{
    public class ActualizarProductoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public bool AplicaIva { get; set; }
        public decimal PorcentajeIva { get; set; }
    }
}
