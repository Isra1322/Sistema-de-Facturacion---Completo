using Microsoft.AspNetCore.Mvc;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var resultado = await _authService.LoginAsync(dto);

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
