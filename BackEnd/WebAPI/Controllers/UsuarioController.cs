using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos()
        {
            var resultado = await _usuarioService.ObtenerTodosAsync();
            return Ok(resultado.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var resultado = await _usuarioService.ObtenerPorIdAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearUsuarioDto dto)
        {
            var resultado = await _usuarioService.CrearAsync(dto);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarUsuarioDto dto)
        {
            var resultado = await _usuarioService.ActualizarAsync(id, dto);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id)
        {
            var resultado = await _usuarioService.CambiarEstadoAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPatch("{id}/desbloquear")]
        public async Task<IActionResult> Desbloquear(int id)
        {
            var resultado = await _usuarioService.DesbloquearAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        private IActionResult CrearRespuestaError<T>(ServiceResult<T> resultado)
        {
            var respuesta = new { mensaje = resultado.Message };

            return resultado.StatusCode switch
            {
                400 => BadRequest(respuesta),
                401 => Unauthorized(respuesta),
                404 => NotFound(respuesta),
                _ => StatusCode(resultado.StatusCode, respuesta)
            };
        }
    }
}
