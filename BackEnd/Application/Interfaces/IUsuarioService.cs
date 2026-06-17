using SistemaFacturacion.Application.DTOs;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IUsuarioService
    {
        Task<ServiceResult<IEnumerable<UsuarioResponseDto>>> ObtenerTodosAsync();
        Task<ServiceResult<UsuarioResponseDto>> ObtenerPorIdAsync(int id);
        Task<ServiceResult<object>> CrearAsync(CrearUsuarioDto dto);
        Task<ServiceResult<object>> ActualizarAsync(int id, ActualizarUsuarioDto dto);
        Task<ServiceResult<object>> CambiarEstadoAsync(int id);
        Task<ServiceResult<object>> DesbloquearAsync(int id);
    }
}
