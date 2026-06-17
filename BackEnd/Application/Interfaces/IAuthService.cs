using SistemaFacturacion.Application.DTOs;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult<LoginResponseDto>> LoginAsync(LoginDto dto);
    }
}
