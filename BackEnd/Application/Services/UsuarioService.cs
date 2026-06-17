using System.Text.RegularExpressions;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class UsuarioService : IUsuarioService
    {
        private const string PasswordRegex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$";
        private const string PasswordValidationMessage = "La contraseña debe tener entre 8 y 10 caracteres, incluir mayúscula, minúscula, número y carácter especial.";
        private const string UnicoAdministradorDesactivarMensaje = "No se puede desactivar al único administrador activo del sistema.";
        private const string UnicoAdministradorRolMensaje = "No se puede cambiar el rol del único administrador activo del sistema.";

        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPasswordService _passwordService;

        public UsuarioService(IUsuarioRepository usuarioRepository, IPasswordService passwordService)
        {
            _usuarioRepository = usuarioRepository;
            _passwordService = passwordService;
        }

        public async Task<ServiceResult<IEnumerable<UsuarioResponseDto>>> ObtenerTodosAsync()
        {
            var usuarios = await _usuarioRepository.ObtenerTodosAsync();
            return ServiceResult<IEnumerable<UsuarioResponseDto>>.Ok(usuarios.Select(MapearUsuarioResponse));
        }

        public async Task<ServiceResult<UsuarioResponseDto>> ObtenerPorIdAsync(int id)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

            if (usuario == null)
                return ServiceResult<UsuarioResponseDto>.Fail(404, "Usuario no encontrado");

            return ServiceResult<UsuarioResponseDto>.Ok(MapearUsuarioResponse(usuario));
        }

        public async Task<ServiceResult<object>> CrearAsync(CrearUsuarioDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre) ||
                string.IsNullOrWhiteSpace(dto.Correo) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.Rol))
            {
                return ServiceResult<object>.Fail(400, "Todos los campos son obligatorios");
            }

            var passwordError = ValidarPassword(dto.Password);

            if (passwordError != null)
                return ServiceResult<object>.Fail(400, passwordError);

            if (!RolValido(dto.Rol))
            {
                return ServiceResult<object>.Fail(400, "Rol no valido");
            }

            var correo = dto.Correo.Trim();

            if (!CorreoValido(correo))
                return ServiceResult<object>.Fail(400, "El correo electrónicamente no tiene un formato válido.");

            var existeCorreo = await _usuarioRepository.ExisteCorreoAsync(correo);

            if (existeCorreo)
            {
                return ServiceResult<object>.Fail(400, "El correo ya está registrado");
            }

            var usuario = new Usuario
            {
                Nombre = dto.Nombre.Trim(),
                Correo = correo,
                PasswordHash = _passwordService.HashPassword(dto.Password),
                Rol = dto.Rol,
                Activo = true,
                IntentosFallidos = 0,
                Bloqueado = false
            };

            await _usuarioRepository.AgregarAsync(usuario);

            return ServiceResult<object>.Ok(new { mensaje = "Usuario creado correctamente" });
        }

        public async Task<ServiceResult<object>> ActualizarAsync(int id, ActualizarUsuarioDto dto)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

            if (usuario == null)
                return ServiceResult<object>.Fail(404, "Usuario no encontrado");

            if (string.IsNullOrWhiteSpace(dto.Nombre) ||
                string.IsNullOrWhiteSpace(dto.Correo) ||
                string.IsNullOrWhiteSpace(dto.Rol))
            {
                return ServiceResult<object>.Fail(400, "Nombre, correo y rol son obligatorios");
            }

            if (!RolValido(dto.Rol))
            {
                return ServiceResult<object>.Fail(400, "Rol no valido");
            }

            var passwordError = string.IsNullOrWhiteSpace(dto.NuevaPassword)
                ? null
                : ValidarPassword(dto.NuevaPassword);

            if (passwordError != null)
                return ServiceResult<object>.Fail(400, passwordError);

            var correo = dto.Correo.Trim();

            if (!CorreoValido(correo))
                return ServiceResult<object>.Fail(400, "El correo electrónicamente no tiene un formato válido.");

            var correoExiste = await _usuarioRepository.ExisteCorreoAsync(correo, id);

            if (correoExiste)
            {
                return ServiceResult<object>.Fail(400, "El correo ya está registrado");
            }

            var esAdministradorConAcceso = usuario.Rol == "Administrador" && usuario.Activo && !usuario.Bloqueado;

            if (esAdministradorConAcceso &&
                !dto.Activo &&
                !await _usuarioRepository.ExisteOtroAdministradorConAccesoAsync(id))
            {
                return ServiceResult<object>.Fail(400, UnicoAdministradorDesactivarMensaje);
            }

            if (esAdministradorConAcceso &&
                dto.Rol == "Vendedor" &&
                !await _usuarioRepository.ExisteOtroAdministradorConAccesoAsync(id))
            {
                return ServiceResult<object>.Fail(400, UnicoAdministradorRolMensaje);
            }

            usuario.Nombre = dto.Nombre.Trim();
            usuario.Correo = correo;
            usuario.Rol = dto.Rol;
            usuario.Activo = dto.Activo;

            if (!string.IsNullOrWhiteSpace(dto.NuevaPassword))
            {
                usuario.PasswordHash = _passwordService.HashPassword(dto.NuevaPassword);
            }

            await _usuarioRepository.GuardarCambiosAsync();

            return ServiceResult<object>.Ok(new { mensaje = "Usuario actualizado correctamente" });
        }

        public async Task<ServiceResult<object>> CambiarEstadoAsync(int id)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

            if (usuario == null)
                return ServiceResult<object>.Fail(404, "Usuario no encontrado");

            if (usuario.Activo &&
                usuario.Rol == "Administrador" &&
                !usuario.Bloqueado &&
                !await _usuarioRepository.ExisteOtroAdministradorConAccesoAsync(id))
            {
                return ServiceResult<object>.Fail(400, UnicoAdministradorDesactivarMensaje);
            }

            usuario.Activo = !usuario.Activo;
            await _usuarioRepository.GuardarCambiosAsync();

            return ServiceResult<object>.Ok(new
            {
                mensaje = usuario.Activo
                    ? "Usuario activado correctamente"
                    : "Usuario desactivado correctamente",
                activo = usuario.Activo
            });
        }

        public async Task<ServiceResult<object>> DesbloquearAsync(int id)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

            if (usuario == null)
                return ServiceResult<object>.Fail(404, "Usuario no encontrado");

            usuario.Bloqueado = false;
            usuario.IntentosFallidos = 0;

            await _usuarioRepository.GuardarCambiosAsync();

            return ServiceResult<object>.Ok(new { mensaje = "Usuario desbloqueado correctamente" });
        }

        private static string? ValidarPassword(string password)
        {
            return Regex.IsMatch(password, PasswordRegex)
                ? null
                : PasswordValidationMessage;
        }

        private static bool CorreoValido(string correo)
        {
            return Regex.IsMatch(correo, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }

        private static bool RolValido(string rol)
        {
            return rol == "Administrador" || rol == "Vendedor";
        }

        private static UsuarioResponseDto MapearUsuarioResponse(Usuario usuario)
        {
            return new UsuarioResponseDto
            {
                IdUsuario = usuario.IdUsuario,
                Nombre = usuario.Nombre,
                Correo = usuario.Correo,
                Rol = usuario.Rol,
                Activo = usuario.Activo,
                IntentosFallidos = usuario.IntentosFallidos,
                Bloqueado = usuario.Bloqueado
            };
        }
    }
}
