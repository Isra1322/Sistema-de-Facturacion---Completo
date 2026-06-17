namespace SistemaFacturacion.Domain.Entities
{
    public class DetalleFactura
    {
        public int IdDetalleFactura { get; set; }
        public int IdFactura { get; set; }
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal PorcentajeIva { get; set; }
        public decimal IvaLinea { get; set; }
        public decimal TotalLinea { get; set; }
        public string? ProductoNombreHistorico { get; set; }
        public string? ProductoCategoriaHistorico { get; set; }
        public decimal? ProductoPrecioUnitarioHistorico { get; set; }
        public bool? ProductoAplicaIvaHistorico { get; set; }
        public decimal? ProductoPorcentajeIvaHistorico { get; set; }

        public Factura? Factura { get; set; }
        public Producto? Producto { get; set; }
    }
}
