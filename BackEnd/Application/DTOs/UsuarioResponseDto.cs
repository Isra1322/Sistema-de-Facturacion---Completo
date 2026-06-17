namespace SistemaFacturacion.Application.DTOs
{
    public class UsuarioResponseDto
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public int IntentosFallidos { get; set; }
        public bool Bloqueado { get; set; }
    }
}
