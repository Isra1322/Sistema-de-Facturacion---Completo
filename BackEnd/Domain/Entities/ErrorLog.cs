namespace SistemaFacturacion.Domain.Entities
{
    public class ErrorLog
    {
        public int IdErrorLog { get; set; }
        public DateTime Fecha { get; set; }
        public string Nivel { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public string? Detalle { get; set; }
        public string? Ruta { get; set; }
        public string? MetodoHttp { get; set; }
        public string? Usuario { get; set; }
        public string? StackTrace { get; set; }
    }
}
