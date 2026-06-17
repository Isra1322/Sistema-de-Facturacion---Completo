using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IProductoRepository
    {
        Task<IEnumerable<Producto>> ObtenerTodosAsync();
        Task<Producto?> ObtenerPorIdAsync(int idProducto);
        Task<Producto?> ObtenerPorIdIncluyendoInactivosAsync(int idProducto);
        Task<IEnumerable<Producto>> ObtenerDisponiblesParaVentaAsync();
        Task<IEnumerable<Producto>> BuscarAsync(string textoBusqueda, string estado, int pagina, int tamanioPagina);
        Task<int> ContarBusquedaAsync(string textoBusqueda, string estado);
        Task<bool> ExistePorNombreAsync(string nombre);
        Task AgregarAsync(Producto producto);
        Task ActualizarAsync(Producto producto);
        Task EjecutarEnTransaccionAsync(Func<Task> operacion);
    }
}
