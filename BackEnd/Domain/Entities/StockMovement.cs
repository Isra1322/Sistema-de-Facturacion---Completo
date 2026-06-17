namespace SistemaFacturacion.Domain.Entities
{
    public class StockMovement
    {
        public int IdStockMovement { get; set; }
        public int IdProducto { get; set; }
        public string TipoMovimiento { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public int StockAnterior { get; set; }
        public int StockNuevo { get; set; }
        public DateTime Fecha { get; set; }
        public string Motivo { get; set; } = string.Empty;
        public int? NumeroFactura { get; set; }
        public int? IdUsuario { get; set; }

        public Producto? Producto { get; set; }
        public Usuario? Usuario { get; set; }
    }
}
