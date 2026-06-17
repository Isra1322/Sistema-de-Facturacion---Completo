using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Interfaces
{
    public interface IClienteRepository
    {
        Task<IEnumerable<Cliente>> ObtenerTodosAsync();
        Task<Cliente?> ObtenerPorIdAsync(int idCliente);
        Task<Cliente?> ObtenerPorIdIncluyendoInactivosAsync(int idCliente);
        Task<IEnumerable<Cliente>> BuscarAsync(string nombre, string correo, string estado, int pagina, int tamanioPagina);
        Task<int> ContarBusquedaAsync(string nombre, string correo, string estado);
        Task<bool> ExisteCorreoAsync(string correo, int? excluirIdCliente = null);
        Task AgregarAsync(Cliente cliente);
        Task ActualizarAsync(Cliente cliente);
    }
}
