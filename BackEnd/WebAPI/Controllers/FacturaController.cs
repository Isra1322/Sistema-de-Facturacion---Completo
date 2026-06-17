using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador,Vendedor")]
    public class FacturaController : ControllerBase
    {
        private readonly IFacturaService _facturaService;

        public FacturaController(IFacturaService facturaService)
        {
            _facturaService = facturaService;
        }

        [HttpPost]
        public async Task<IActionResult> CrearFactura([FromBody] CrearFacturaDto dto)
        {
            var resultado = await _facturaService.CrearFacturaAsync(dto, ObtenerIdUsuarioActual());

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("{numeroFactura}")]
        public async Task<IActionResult> ObtenerPorNumero(int numeroFactura)
        {
            var resultado = await _facturaService.ObtenerPorNumeroAsync(
                numeroFactura,
                ObtenerRolActual(),
                ObtenerIdUsuarioActual());

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> Buscar(
            [FromQuery] int? idCliente,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanioPagina = 6)
        {
            var resultado = await _facturaService.BuscarAsync(
                idCliente,
                fechaDesde,
                fechaHasta,
                pagina,
                tamanioPagina,
                ObtenerRolActual(),
                ObtenerIdUsuarioActual());

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("resumen")]
        public async Task<IActionResult> ObtenerResumen()
        {
            var resultado = await _facturaService.ObtenerResumenAsync(
                ObtenerRolActual(),
                ObtenerIdUsuarioActual());

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("fecha")]
        public async Task<IActionResult> ObtenerPorFecha(
            [FromQuery] DateTime fecha,
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanioPagina = 5)
        {
            var resultado = await _facturaService.ObtenerPorFechaAsync(
                fecha,
                pagina,
                tamanioPagina,
                ObtenerRolActual(),
                ObtenerIdUsuarioActual());

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return Ok(resultado.Data);
        }

        [HttpGet("pdf/{numeroFactura}")]
        public async Task<IActionResult> GenerarPdf(int numeroFactura)
        {
            var resultado = await _facturaService.GenerarPdfAsync(
                numeroFactura,
                ObtenerRolActual(),
                ObtenerIdUsuarioActual());

            if (!resultado.Success)
                return CrearRespuestaError(resultado);

            return File(resultado.Data!, "application/pdf");
        }

        private IActionResult CrearRespuestaError<T>(ServiceResult<T> resultado)
        {
            return resultado.StatusCode switch
            {
                400 => BadRequest(new { error = resultado.Message }),
                401 => Unauthorized(new { mensaje = resultado.Message }),
                404 => NotFound(new { mensaje = resultado.Message }),
                _ => StatusCode(resultado.StatusCode, new { mensaje = resultado.Message })
            };
        }

        private string? ObtenerRolActual()
        {
            return User.FindFirstValue(ClaimTypes.Role);
        }

        private int? ObtenerIdUsuarioActual()
        {
            var idUsuarioTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.TryParse(idUsuarioTexto, out var idUsuario)
                ? idUsuario
                : null;
        }
    }
}
