namespace SistemaFacturacion.Domain.Entities
{
    public class Factura
    {
        public int IdFactura { get; set; }
        public int NumeroFactura { get; set; }
        public DateTime Fecha { get; set; }
        public int IdCliente { get; set; }
        public int? IdUsuario { get; set; }


        public decimal Subtotal { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }
        public string? ClienteNombreHistorico { get; set; }
        public string? ClienteApellidoHistorico { get; set; }
        public string? ClienteCorreoHistorico { get; set; }
        public string? ClienteTelefonoHistorico { get; set; }
        public string? ClienteDireccionHistorico { get; set; }
        public string? VendedorNombreHistorico { get; set; }
        public string? VendedorCorreoHistorico { get; set; }
        public string? VendedorRolHistorico { get; set; }


        public Cliente? Cliente { get; set; }
        public Usuario? Usuario { get; set; }
        public ICollection<DetalleFactura> DetallesFactura { get; set; } = new List<DetalleFactura>();
    }
}
