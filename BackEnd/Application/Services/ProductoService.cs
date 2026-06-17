using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class ProductoService : IProductoService
    {
        private static readonly HashSet<string> CategoriasPermitidas = new(StringComparer.OrdinalIgnoreCase)
        {
            "Tecnologia",
            "Alimentos",
            "Medicamentos",
            "Servicios",
            "Ropa",
            "Otros"
        };

        private readonly IProductoRepository _productoRepository;

        public ProductoService(IProductoRepository productoRepository)
        {
            _productoRepository = productoRepository;
        }

        public async Task<ServiceResult<IEnumerable<ProductoResponseDto>>> ObtenerTodosAsync()
        {
            var productos = await _productoRepository.ObtenerTodosAsync();
            return ServiceResult<IEnumerable<ProductoResponseDto>>.Ok(productos.Select(MapearProductoResponse));
        }

        public async Task<ServiceResult<ProductoResponseDto>> ObtenerPorIdAsync(int id)
        {
            var producto = await _productoRepository.ObtenerPorIdAsync(id);

            if (producto == null)
                return ServiceResult<ProductoResponseDto>.Fail(404, "Producto no encontrado");

            return ServiceResult<ProductoResponseDto>.Ok(MapearProductoResponse(producto));
        }

        public async Task<ServiceResult<IEnumerable<ProductoResponseDto>>> ObtenerDisponiblesParaVentaAsync()
        {
            var productos = await _productoRepository.ObtenerDisponiblesParaVentaAsync();

            var productosDisponibles = productos
                .Where(p => p.Estado == "Activo" && p.Stock > 0)
                .Select(MapearProductoResponse);

            return ServiceResult<IEnumerable<ProductoResponseDto>>.Ok(productosDisponibles);
        }

        public async Task<ServiceResult<object>> BuscarAsync(
            string texto,
            string estado,
            int pagina,
            int tamanioPagina,
            bool esVendedor)
        {
            if (esVendedor)
            {
                estado = "Activo";
            }

            estado = NormalizarEstadoBusqueda(estado);

            var productos = await _productoRepository.BuscarAsync(texto, estado, pagina, tamanioPagina);
            var totalRegistros = await _productoRepository.ContarBusquedaAsync(texto, estado);

            return ServiceResult<object>.Ok(new
            {
                pagina,
                tamanioPagina,
                totalRegistros,
                totalPaginas = (int)Math.Ceiling((double)totalRegistros / tamanioPagina),
                datos = productos.Select(MapearProductoResponse)
            });
        }

        public async Task<ServiceResult<object>> AgregarAsync(CrearProductoDto dto)
        {
            var errorValidacion = ValidarProducto(dto.Nombre, dto.Precio, dto.Stock, dto.Categoria, dto.PorcentajeIva);

            if (errorValidacion != null)
                return ServiceResult<object>.Fail(400, errorValidacion);

            var producto = CrearProductoDesdeDto(dto);
            producto.Estado = "Activo";

            var existe = await _productoRepository.ExistePorNombreAsync(producto.Nombre);

            if (existe)
                return ServiceResult<object>.Fail(400, "Ya existe un producto con ese nombre");

            await _productoRepository.AgregarAsync(producto);

            return ServiceResult<object>.Ok(new { mensaje = "Producto agregado correctamente" });
        }

        public async Task<ServiceResult<object>> ActualizarAsync(int id, ActualizarProductoDto dto)
        {
            var productoExistente = await _productoRepository.ObtenerPorIdAsync(id);

            if (productoExistente == null)
                return ServiceResult<object>.Fail(404, "Producto no encontrado");

            var errorValidacion = ValidarProducto(dto.Nombre, dto.Precio, dto.Stock, dto.Categoria, dto.PorcentajeIva);

            if (errorValidacion != null)
                return ServiceResult<object>.Fail(400, errorValidacion);

            productoExistente.Nombre = dto.Nombre.Trim();
            productoExistente.Precio = dto.Precio;
            productoExistente.Stock = dto.Stock;
            productoExistente.Categoria = NormalizarCategoria(dto.Categoria);
            productoExistente.AplicaIva = dto.AplicaIva;
            productoExistente.PorcentajeIva = dto.PorcentajeIva;

            AplicarReglasIva(productoExistente);

            await _productoRepository.ActualizarAsync(productoExistente);

            return ServiceResult<object>.Ok(new { mensaje = "Producto actualizado correctamente" });
        }

        public async Task<ServiceResult<object>> EliminarAsync(int id)
        {
            var productoExistente = await _productoRepository.ObtenerPorIdAsync(id);

            if (productoExistente == null)
                return ServiceResult<object>.Fail(404, "Producto no encontrado");

            productoExistente.Estado = "Inactivo";
            await _productoRepository.ActualizarAsync(productoExistente);

            return ServiceResult<object>.Ok(new { mensaje = "Producto eliminado correctamente" });
        }

        public async Task<ServiceResult<object>> ReactivarAsync(int id)
        {
            var producto = await _productoRepository.ObtenerPorIdIncluyendoInactivosAsync(id);

            if (producto == null)
                return ServiceResult<object>.Fail(404, "Producto no encontrado");

            producto.Estado = "Activo";
            await _productoRepository.ActualizarAsync(producto);

            return ServiceResult<object>.Ok(new { mensaje = "Producto reactivado correctamente" });
        }

        private static string NormalizarEstadoBusqueda(string estado)
        {
            return estado switch
            {
                "Inactivo" => "Inactivo",
                "Todos" => "Todos",
                _ => "Activo"
            };
        }

        private static string? ValidarProducto(string nombre, decimal precio, int stock, string categoria, decimal porcentajeIva)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return "El nombre del producto es obligatorio";

            if (string.IsNullOrWhiteSpace(categoria))
                return "La categoria es obligatoria";

            if (!CategoriasPermitidas.Contains(categoria.Trim()))
                return "La categoria no es valida";

            if (precio <= 0)
                return "El precio debe ser mayor a 0";

            if (stock < 0)
                return "El stock no puede ser negativo";

            if (porcentajeIva < 0 || porcentajeIva > 100)
                return "El porcentaje de IVA debe estar entre 0 y 100";

            return null;
        }

        private static Producto CrearProductoDesdeDto(CrearProductoDto dto)
        {
            var producto = new Producto
            {
                Nombre = dto.Nombre.Trim(),
                Precio = dto.Precio,
                Stock = dto.Stock,
                Categoria = NormalizarCategoria(dto.Categoria),
                AplicaIva = dto.AplicaIva,
                PorcentajeIva = dto.PorcentajeIva
            };

            AplicarReglasIva(producto);
            return producto;
        }

        private static void AplicarReglasIva(Producto producto)
        {
            if (producto.Categoria == "Tecnologia")
            {
                producto.AplicaIva = true;
                producto.PorcentajeIva = 15m;
                return;
            }

            if (!producto.AplicaIva)
            {
                producto.PorcentajeIva = 0m;
            }
        }

        private static string NormalizarCategoria(string categoria)
        {
            var categoriaLimpia = categoria.Trim();

            return CategoriasPermitidas.First(c =>
                string.Equals(c, categoriaLimpia, StringComparison.OrdinalIgnoreCase));
        }

        private static ProductoResponseDto MapearProductoResponse(Producto producto)
        {
            var categoria = string.IsNullOrWhiteSpace(producto.Categoria)
                ? "Otros"
                : producto.Categoria;

            return new ProductoResponseDto
            {
                IdProducto = producto.IdProducto,
                Nombre = producto.Nombre,
                Precio = producto.Precio,
                Stock = producto.Stock,
                Categoria = categoria,
                AplicaIva = producto.AplicaIva,
                PorcentajeIva = producto.AplicaIva ? producto.PorcentajeIva : 0m,
                Estado = producto.Estado
            };
        }
    }
}
