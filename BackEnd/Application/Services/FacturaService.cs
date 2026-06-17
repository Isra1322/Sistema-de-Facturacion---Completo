using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class FacturaService : IFacturaService
    {
        private readonly IClienteRepository _clienteRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IFacturaRepository _facturaRepository;
        private readonly IPdfFacturaService _pdfFacturaService;
        private readonly IFileStorageService _fileStorageService;
        private readonly IStockMovementService _stockMovementService;
        private readonly IUsuarioRepository _usuarioRepository;

        public FacturaService(
            IClienteRepository clienteRepository,
            IProductoRepository productoRepository,
            IFacturaRepository facturaRepository,
            IPdfFacturaService pdfFacturaService,
            IFileStorageService fileStorageService,
            IStockMovementService stockMovementService,
            IUsuarioRepository usuarioRepository)
        {
            _clienteRepository = clienteRepository;
            _productoRepository = productoRepository;
            _facturaRepository = facturaRepository;
            _pdfFacturaService = pdfFacturaService;
            _fileStorageService = fileStorageService;
            _stockMovementService = stockMovementService;
            _usuarioRepository = usuarioRepository;
        }

        public async Task<ServiceResult<object>> CrearFacturaAsync(CrearFacturaDto dto, int? idUsuario)
        {
            if (!idUsuario.HasValue)
                return ServiceResult<object>.Fail(401, "Usuario no identificado");

            try
            {
                var numeroFactura = 0;

                await _productoRepository.EjecutarEnTransaccionAsync(async () =>
                {
                    var cliente = await _clienteRepository.ObtenerPorIdAsync(dto.IdCliente);

                    if (cliente == null)
                        throw new Exception("Cliente no existe");

                    var vendedor = await _usuarioRepository.ObtenerPorIdAsync(idUsuario.Value);

                    if (vendedor == null)
                        throw new Exception("Usuario vendedor no existe");

                    if (dto.Detalles == null || !dto.Detalles.Any())
                        throw new Exception("La factura debe tener al menos un producto");

                    foreach (var item in dto.Detalles)
                    {
                        if (item.Cantidad <= 0)
                            throw new Exception("Cantidad invalida");
                    }

                    var cantidadesPorProducto = dto.Detalles
                        .GroupBy(d => d.IdProducto)
                        .ToDictionary(g => g.Key, g => g.Sum(d => d.Cantidad));

                    var productosActuales = new Dictionary<int, Producto>();

                    foreach (var item in cantidadesPorProducto)
                    {
                        var producto = await _productoRepository.ObtenerPorIdAsync(item.Key);

                        if (producto == null)
                        {
                            throw new Exception(
                                $"No se pudo guardar la factura. El producto con ID {item.Key} ya no esta disponible o fue eliminado. Eliminalo del detalle y vuelve a intentarlo.");
                        }

                        if (producto.Stock < item.Value)
                        {
                            if (producto.Stock <= 0)
                            {
                                throw new Exception(
                                    $"No se pudo guardar la factura. El producto '{producto.Nombre}' ya no tiene stock disponible. Solicitado: {item.Value}, disponible: {producto.Stock}.");
                            }

                            throw new Exception(
                                $"No se pudo guardar la factura. El producto '{producto.Nombre}' tiene stock insuficiente. Solicitado: {item.Value}, disponible: {producto.Stock}.");
                        }

                        productosActuales[producto.IdProducto] = producto;
                    }

                    var factura = new Factura
                    {
                        IdCliente = dto.IdCliente,
                        IdUsuario = idUsuario.Value,
                        ClienteNombreHistorico = cliente.Nombre,
                        ClienteApellidoHistorico = cliente.Apellido,
                        ClienteCorreoHistorico = cliente.Correo,
                        ClienteTelefonoHistorico = cliente.Telefono,
                        ClienteDireccionHistorico = cliente.Direccion,
                        VendedorNombreHistorico = vendedor.Nombre,
                        VendedorCorreoHistorico = vendedor.Correo,
                        VendedorRolHistorico = vendedor.Rol,
                        Fecha = DateTime.Now,
                        NumeroFactura = await _facturaRepository.ObtenerSiguienteNumeroFacturaAsync(),
                        DetallesFactura = new List<DetalleFactura>()
                    };

                    decimal subtotalFactura = 0;
                    decimal ivaFactura = 0;

                    foreach (var item in dto.Detalles)
                    {
                        var producto = productosActuales[item.IdProducto];
                        var subtotalLinea = producto.Precio * item.Cantidad;
                        var porcentajeIva = producto.AplicaIva ? producto.PorcentajeIva : 0m;
                        var ivaLinea = Math.Round(subtotalLinea * porcentajeIva / 100m, 2);
                        var totalLinea = Math.Round(subtotalLinea + ivaLinea, 2);

                        factura.DetallesFactura.Add(new DetalleFactura
                        {
                            IdProducto = producto.IdProducto,
                            Cantidad = item.Cantidad,
                            PrecioUnitario = producto.Precio,
                            PorcentajeIva = porcentajeIva,
                            IvaLinea = ivaLinea,
                            TotalLinea = totalLinea,
                            ProductoNombreHistorico = producto.Nombre,
                            ProductoCategoriaHistorico = producto.Categoria,
                            ProductoPrecioUnitarioHistorico = producto.Precio,
                            ProductoAplicaIvaHistorico = producto.AplicaIva,
                            ProductoPorcentajeIvaHistorico = producto.PorcentajeIva
                        });

                        subtotalFactura += subtotalLinea;
                        ivaFactura += ivaLinea;
                    }

                    foreach (var item in cantidadesPorProducto)
                    {
                        var producto = productosActuales[item.Key];
                        var stockAnterior = producto.Stock;
                        producto.Stock -= item.Value;
                        var stockNuevo = producto.Stock;

                        await _productoRepository.ActualizarAsync(producto);
                        await _stockMovementService.RegistrarSalidaPorVentaAsync(
                            producto.IdProducto,
                            item.Value,
                            stockAnterior,
                            stockNuevo,
                            factura.NumeroFactura,
                            idUsuario.Value);
                    }

                    factura.Subtotal = Math.Round(subtotalFactura, 2);
                    factura.Iva = Math.Round(ivaFactura, 2);
                    factura.Total = Math.Round(factura.Subtotal + factura.Iva, 2);

                    await _facturaRepository.AgregarAsync(factura);
                    numeroFactura = factura.NumeroFactura;
                });

                return ServiceResult<object>.Ok(new
                {
                    mensaje = "Factura creada correctamente",
                    numeroFactura
                });
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.Fail(400, ex.Message);
            }
        }

        public async Task<ServiceResult<FacturaResponseDto>> ObtenerPorNumeroAsync(int numeroFactura, string? rol, int? idUsuario)
        {
            var filtro = ObtenerIdUsuarioFiltro(rol, idUsuario);

            if (!filtro.Success)
                return ServiceResult<FacturaResponseDto>.Fail(filtro.StatusCode, filtro.Message!);

            var factura = await _facturaRepository.ObtenerPorNumeroAsync(numeroFactura, filtro.Data);

            if (factura == null)
                return ServiceResult<FacturaResponseDto>.Fail(404, "Factura no encontrada");

            return ServiceResult<FacturaResponseDto>.Ok(await MapearFacturaResponseAsync(factura));
        }

        public async Task<ServiceResult<object>> BuscarAsync(
            int? idCliente,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int pagina,
            int tamanioPagina,
            string? rol,
            int? idUsuario)
        {
            var filtro = ObtenerIdUsuarioFiltro(rol, idUsuario);

            if (!filtro.Success)
                return ServiceResult<object>.Fail(filtro.StatusCode, filtro.Message!);

            var facturas = await _facturaRepository.BuscarAsync(
                idCliente,
                fechaDesde,
                fechaHasta,
                pagina,
                tamanioPagina,
                filtro.Data);

            var totalRegistros = await _facturaRepository.ContarBusquedaAsync(
                idCliente,
                fechaDesde,
                fechaHasta,
                filtro.Data);

            var datos = facturas.Select(MapearFacturaLista).ToList();

            return ServiceResult<object>.Ok(new
            {
                pagina,
                tamanioPagina,
                totalRegistros,
                totalPaginas = (int)Math.Ceiling((double)totalRegistros / tamanioPagina),
                datos
            });
        }

        public async Task<ServiceResult<object>> ObtenerResumenAsync(string? rol, int? idUsuario)
        {
            var filtro = ObtenerIdUsuarioFiltro(rol, idUsuario);

            if (!filtro.Success)
                return ServiceResult<object>.Fail(filtro.StatusCode, filtro.Message!);

            var totalFacturas = await _facturaRepository.ContarTotalAsync(filtro.Data);
            var totalVentas = await _facturaRepository.ObtenerTotalVentasAsync(filtro.Data);
            var totalVentasHoy = await _facturaRepository.ObtenerTotalVentasHoyAsync(filtro.Data);
            var ultimaFactura = await _facturaRepository.ObtenerUltimaFacturaAsync(filtro.Data);
            var facturasHoy = await _facturaRepository.ContarFacturasHoyAsync(filtro.Data);

            return ServiceResult<object>.Ok(new
            {
                totalFacturas,
                totalVentas,
                totalVentasHoy,
                ultimaFactura = ultimaFactura == null ? null : new
                {
                    numeroFactura = ultimaFactura.NumeroFactura,
                    fecha = ultimaFactura.Fecha
                },
                facturasHoy,
                fechaHoy = DateTime.Today
            });
        }

        public async Task<ServiceResult<object>> ObtenerPorFechaAsync(DateTime fecha, int pagina, int tamanioPagina, string? rol, int? idUsuario)
        {
            var filtro = ObtenerIdUsuarioFiltro(rol, idUsuario);

            if (!filtro.Success)
                return ServiceResult<object>.Fail(filtro.StatusCode, filtro.Message!);

            var facturas = await _facturaRepository.ObtenerPorFechaAsync(fecha, pagina, tamanioPagina, filtro.Data);
            var total = await _facturaRepository.ContarPorFechaAsync(fecha, filtro.Data);
            var datos = facturas.Select(MapearFacturaLista).ToList();

            return ServiceResult<object>.Ok(new
            {
                pagina,
                tamanioPagina,
                totalRegistros = total,
                totalPaginas = (int)Math.Ceiling((double)total / tamanioPagina),
                datos
            });
        }

        public async Task<ServiceResult<byte[]>> GenerarPdfAsync(int numeroFactura, string? rol, int? idUsuario)
        {
            var facturaResult = await ObtenerPorNumeroAsync(numeroFactura, rol, idUsuario);

            if (!facturaResult.Success)
                return ServiceResult<byte[]>.Fail(facturaResult.StatusCode, facturaResult.Message!);

            var pdfBytes = _pdfFacturaService.GenerarPdf(facturaResult.Data!);
            await _fileStorageService.GuardarAsync($"Factura_{numeroFactura}.pdf", pdfBytes);

            return ServiceResult<byte[]>.Ok(pdfBytes);
        }

        private static ServiceResult<int?> ObtenerIdUsuarioFiltro(string? rol, int? idUsuario)
        {
            if (rol == "Vendedor")
            {
                return idUsuario.HasValue
                    ? ServiceResult<int?>.Ok(idUsuario.Value)
                    : ServiceResult<int?>.Fail(401, "Usuario no identificado");
            }

            return ServiceResult<int?>.Ok(null);
        }

        private static FacturaListaDto MapearFacturaLista(Factura factura)
        {
            return new FacturaListaDto
            {
                NumeroFactura = factura.NumeroFactura,
                Fecha = factura.Fecha,
                IdCliente = factura.IdCliente,
                Cliente = ObtenerNombreClienteFactura(factura),
                Total = factura.Total
            };
        }

        private async Task<FacturaResponseDto> MapearFacturaResponseAsync(Factura factura)
        {
            var vendedorNombre = factura.VendedorNombreHistorico;
            var vendedorCorreo = factura.VendedorCorreoHistorico;
            var vendedorRol = factura.VendedorRolHistorico;
            var tieneVendedorHistorico = TieneValor(factura.VendedorNombreHistorico)
                || TieneValor(factura.VendedorCorreoHistorico)
                || TieneValor(factura.VendedorRolHistorico);

            if (!tieneVendedorHistorico)
            {
                var vendedor = factura.Usuario;

                if (vendedor == null && factura.IdUsuario.HasValue)
                {
                    vendedor = await _usuarioRepository.ObtenerPorIdAsync(factura.IdUsuario.Value);
                }

                vendedorNombre = vendedor?.Nombre;
                vendedorCorreo = vendedor?.Correo;
                vendedorRol = vendedor?.Rol;
            }

            vendedorNombre = ValorDisponible(vendedorNombre);
            vendedorCorreo = ValorDisponible(vendedorCorreo);
            vendedorRol = ValorDisponible(vendedorRol);

            var clienteNombre = ObtenerNombreClienteFactura(factura);

            return new FacturaResponseDto
            {
                NumeroFactura = factura.NumeroFactura,
                Fecha = factura.Fecha,
                IdUsuario = factura.IdUsuario,
                VendedorNombre = vendedorNombre,
                VendedorCorreo = vendedorCorreo,
                VendedorRol = vendedorRol,
                Vendedor = new VendedorFacturaDto
                {
                    Nombre = vendedorNombre,
                    Correo = vendedorCorreo,
                    Rol = vendedorRol
                },
                IdCliente = factura.IdCliente,
                Cliente = clienteNombre,
                Correo = ValorDisponible(factura.ClienteCorreoHistorico, factura.Cliente?.Correo),
                Telefono = ValorDisponible(factura.ClienteTelefonoHistorico, factura.Cliente?.Telefono),
                Direccion = ValorDisponible(factura.ClienteDireccionHistorico, factura.Cliente?.Direccion),
                Subtotal = factura.Subtotal,
                Iva = factura.Iva,
                Total = factura.Total,
                Detalles = factura.DetallesFactura.Select(d => new DetalleFacturaResponseDto
                {
                    IdProducto = d.IdProducto,
                    Producto = ValorDisponible(d.ProductoNombreHistorico, d.Producto?.Nombre),
                    ProductoCategoria = ValorDisponible(d.ProductoCategoriaHistorico, d.Producto?.Categoria),
                    AplicaIva = d.ProductoAplicaIvaHistorico ?? d.Producto?.AplicaIva ?? d.PorcentajeIva > 0,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.ProductoPrecioUnitarioHistorico ?? d.PrecioUnitario,
                    PorcentajeIva = d.ProductoPorcentajeIvaHistorico ?? d.PorcentajeIva,
                    IvaLinea = d.IvaLinea,
                    TotalLinea = d.TotalLinea
                }).ToList()
            };
        }

        private static string ObtenerNombreClienteFactura(Factura factura)
        {
            var nombreHistorico = UnirPartes(factura.ClienteNombreHistorico, factura.ClienteApellidoHistorico);

            if (TieneValor(nombreHistorico))
                return nombreHistorico;

            return factura.Cliente != null
                ? UnirPartes(factura.Cliente.Nombre, factura.Cliente.Apellido)
                : "No disponible";
        }

        private static string UnirPartes(params string?[] partes)
        {
            return string.Join(" ", partes
                .Where(TieneValor)
                .Select(p => p!.Trim()));
        }

        private static string ValorDisponible(params string?[] valores)
        {
            return valores.FirstOrDefault(TieneValor)?.Trim() ?? "No disponible";
        }

        private static bool TieneValor(string? valor)
        {
            return !string.IsNullOrWhiteSpace(valor);
        }
    }
}
