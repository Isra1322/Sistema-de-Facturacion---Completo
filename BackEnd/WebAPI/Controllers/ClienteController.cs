using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador,Vendedor")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos()
        {
            var resultado = await _clienteService.ObtenerTodosAsync();
            return Ok(resultado.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var resultado = await _clienteService.ObtenerPorIdAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> Buscar(
            [FromQuery] string nombre = "",
            [FromQuery] string correo = "",
            [FromQuery] string estado = "Activo",
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanioPagina = 10)
        {
            var resultado = await _clienteService.BuscarAsync(
                nombre,
                correo,
                estado,
                pagina,
                tamanioPagina,
                User.IsInRole("Vendedor"));

            return Ok(resultado.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Agregar([FromBody] Cliente cliente)
        {
            var resultado = await _clienteService.AgregarAsync(cliente);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] Cliente cliente)
        {
            var resultado = await _clienteService.ActualizarAsync(id, cliente);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var resultado = await _clienteService.EliminarAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPut("{id}/reactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Reactivar(int id)
        {
            var resultado = await _clienteService.ReactivarAsync(id);

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
                404 => NotFound(respuesta),
                _ => StatusCode(resultado.StatusCode, respuesta)
            };
        }
    }
}
