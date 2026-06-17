namespace SistemaFacturacion.Domain.Entities
{
    public class Role
    {
        public int IdRole { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public bool Activo { get; set; } = true;
    }
}
