namespace SistemaFacturacion.Application.DTOs
{
    public class ActualizarUsuarioDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public string? NuevaPassword { get; set; }
    }
}
