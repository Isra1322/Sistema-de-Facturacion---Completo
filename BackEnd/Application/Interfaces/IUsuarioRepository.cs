using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<IEnumerable<Usuario>> ObtenerTodosAsync();
        Task<Usuario?> ObtenerPorIdAsync(int idUsuario);
        Task<Usuario?> ObtenerPorCorreoAsync(string correo);
        Task<bool> ExisteCorreoAsync(string correo, int? excluirIdUsuario = null);
        Task<bool> ExisteOtroAdministradorConAccesoAsync(int idUsuario);
        Task AgregarAsync(Usuario usuario);
        Task GuardarCambiosAsync();
    }
}
