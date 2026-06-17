using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.Application.Services
{
    public class AuthService : IAuthService
    {
        private const int MaxIntentosFallidos = 3;
        private const string CredencialesInvalidasMensaje = "Correo o contraseña incorrectos.";
        private const string UnicoAdministradorMensaje = "No se puede bloquear al único administrador activo del sistema.";

        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPasswordService _passwordService;
        private readonly JwtService _jwtService;

        public AuthService(
            IUsuarioRepository usuarioRepository,
            IPasswordService passwordService,
            JwtService jwtService)
        {
            _usuarioRepository = usuarioRepository;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        public async Task<ServiceResult<LoginResponseDto>> LoginAsync(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Correo) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return ServiceResult<LoginResponseDto>.Fail(400, "Correo y contraseña son obligatorios");
            }

            var usuario = await _usuarioRepository.ObtenerPorCorreoAsync(dto.Correo);

            if (usuario == null)
            {
                return ServiceResult<LoginResponseDto>.Fail(401, CredencialesInvalidasMensaje);
            }

            if (usuario.Bloqueado)
            {
                return ServiceResult<LoginResponseDto>.Fail(401, "Usuario bloqueado. Contacte al administrador.");
            }

            if (!usuario.Activo)
            {
                return ServiceResult<LoginResponseDto>.Fail(401, "Usuario desactivado");
            }

            var passwordValida = _passwordService.VerifyPassword(dto.Password, usuario.PasswordHash);

            if (!passwordValida)
            {
                usuario.IntentosFallidos++;

                if (usuario.IntentosFallidos >= MaxIntentosFallidos)
                {
                    if (usuario.Rol == "Administrador" &&
                        !await _usuarioRepository.ExisteOtroAdministradorConAccesoAsync(usuario.IdUsuario))
                    {
                        usuario.IntentosFallidos = MaxIntentosFallidos - 1;
                        usuario.Bloqueado = false;
                        await _usuarioRepository.GuardarCambiosAsync();

                        return ServiceResult<LoginResponseDto>.Fail(401, UnicoAdministradorMensaje);
                    }

                    usuario.Bloqueado = true;
                    await _usuarioRepository.GuardarCambiosAsync();

                    return ServiceResult<LoginResponseDto>.Fail(401, "Usuario bloqueado por demasiados intentos fallidos.");
                }

                await _usuarioRepository.GuardarCambiosAsync();
                return ServiceResult<LoginResponseDto>.Fail(401, CredencialesInvalidasMensaje);
            }

            usuario.IntentosFallidos = 0;
            usuario.Bloqueado = false;
            await _usuarioRepository.GuardarCambiosAsync();

            var response = new LoginResponseDto
            {
                Token = _jwtService.GenerarToken(usuario),
                Nombre = usuario.Nombre,
                Correo = usuario.Correo,
                Rol = usuario.Rol
            };

            return ServiceResult<LoginResponseDto>.Ok(response);
        }
    }
}
