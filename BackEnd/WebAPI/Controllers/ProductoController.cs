using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;

        public ProductoController(IProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Vendedor")]
        public async Task<IActionResult> ObtenerTodos()
        {
            var resultado = await _productoService.ObtenerTodosAsync();
            return Ok(resultado.Data);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Vendedor")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var resultado = await _productoService.ObtenerPorIdAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("buscar")]
        [Authorize(Roles = "Administrador,Vendedor")]
        public async Task<IActionResult> Buscar(
            [FromQuery] string texto = "",
            [FromQuery] string estado = "Activo",
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanioPagina = 5)
        {
            var resultado = await _productoService.BuscarAsync(
                texto,
                estado,
                pagina,
                tamanioPagina,
                User.IsInRole("Vendedor"));

            return Ok(resultado.Data);
        }

        [HttpGet("disponibles-venta")]
        [Authorize(Roles = "Administrador,Vendedor")]
        public async Task<IActionResult> ObtenerDisponiblesParaVenta()
        {
            var resultado = await _productoService.ObtenerDisponiblesParaVentaAsync();
            return Ok(resultado.Data);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Agregar([FromBody] CrearProductoDto dto)
        {
            var resultado = await _productoService.AgregarAsync(dto);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarProductoDto dto)
        {
            var resultado = await _productoService.ActualizarAsync(id, dto);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var resultado = await _productoService.EliminarAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpPut("{id}/reactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Reactivar(int id)
        {
            var resultado = await _productoService.ReactivarAsync(id);

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        private IActionResult CrearRespuestaError<T>(ServiceResult<T> resultado)
        {
            return resultado.StatusCode switch
            {
                400 => BadRequest(new { error = resultado.Message }),
                404 => NotFound(new { mensaje = resultado.Message }),
                _ => StatusCode(resultado.StatusCode, new { mensaje = resultado.Message })
            };
        }
    }
}
