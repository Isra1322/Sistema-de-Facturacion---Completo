using System.Security.Claims;
using System.Text.Json;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.WebAPI.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;

        public ErrorHandlingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await RegistrarErrorAsync(context, ex);
                await EscribirRespuestaErrorAsync(context);
            }
        }

        private async Task RegistrarErrorAsync(HttpContext context, Exception exception)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var errorLogService = scope.ServiceProvider.GetRequiredService<IErrorLogService>();

                var usuario = context.User.FindFirstValue(ClaimTypes.Email)
                    ?? context.User.Identity?.Name;

                await errorLogService.RegistrarErrorAsync(
                    exception,
                    context.Request.Path.Value,
                    context.Request.Method,
                    usuario);
            }
            catch
            {
                // Evita que un fallo de persistencia del log reemplace el error original.
            }
        }

        private static async Task EscribirRespuestaErrorAsync(HttpContext context)
        {
            if (context.Response.HasStarted)
            {
                return;
            }

            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var respuesta = JsonSerializer.Serialize(new
            {
                mensaje = "Ocurrio un error interno en el servidor."
            });

            await context.Response.WriteAsync(respuesta);
        }
    }
}
