using System.Text.RegularExpressions;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Application.Services
{
    public class ClienteService : IClienteService
    {
        private readonly IClienteRepository _clienteRepository;

        public ClienteService(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        public async Task<ServiceResult<IEnumerable<Cliente>>> ObtenerTodosAsync()
        {
            var clientes = await _clienteRepository.ObtenerTodosAsync();
            return ServiceResult<IEnumerable<Cliente>>.Ok(clientes);
        }

        public async Task<ServiceResult<Cliente>> ObtenerPorIdAsync(int id)
        {
            var cliente = await _clienteRepository.ObtenerPorIdAsync(id);

            if (cliente == null)
                return ServiceResult<Cliente>.Fail(404, "Cliente no encontrado");

            return ServiceResult<Cliente>.Ok(cliente);
        }

        public async Task<ServiceResult<object>> BuscarAsync(
            string nombre,
            string correo,
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

            var clientes = await _clienteRepository.BuscarAsync(nombre, correo, estado, pagina, tamanioPagina);
            var totalRegistros = await _clienteRepository.ContarBusquedaAsync(nombre, correo, estado);

            return ServiceResult<object>.Ok(new
            {
                pagina,
                tamanioPagina,
                totalRegistros,
                totalPaginas = (int)Math.Ceiling((double)totalRegistros / tamanioPagina),
                datos = clientes
            });
        }

        public async Task<ServiceResult<object>> AgregarAsync(Cliente cliente)
        {
            NormalizarCliente(cliente);

            var errorValidacion = ValidarCliente(cliente);

            if (errorValidacion != null)
                return ServiceResult<object>.Fail(400, errorValidacion);

            if (await _clienteRepository.ExisteCorreoAsync(cliente.Correo))
                return ServiceResult<object>.Fail(400, "El correo ya esta registrado");

            cliente.IdCliente = 0;
            cliente.Estado = "Activo";

            await _clienteRepository.AgregarAsync(cliente);

            return ServiceResult<object>.Ok(new { mensaje = "Cliente agregado correctamente" });
        }

        public async Task<ServiceResult<object>> ActualizarAsync(int id, Cliente cliente)
        {
            var clienteExistente = await _clienteRepository.ObtenerPorIdAsync(id);

            if (clienteExistente == null)
                return ServiceResult<object>.Fail(404, "Cliente no encontrado");

            NormalizarCliente(cliente);

            var errorValidacion = ValidarCliente(cliente);

            if (errorValidacion != null)
                return ServiceResult<object>.Fail(400, errorValidacion);

            if (await _clienteRepository.ExisteCorreoAsync(cliente.Correo, id))
                return ServiceResult<object>.Fail(400, "El correo ya esta registrado");

            clienteExistente.Nombre = cliente.Nombre;
            clienteExistente.Apellido = cliente.Apellido;
            clienteExistente.Direccion = cliente.Direccion;
            clienteExistente.Telefono = cliente.Telefono;
            clienteExistente.Correo = cliente.Correo;

            await _clienteRepository.ActualizarAsync(clienteExistente);

            return ServiceResult<object>.Ok(new { mensaje = "Cliente actualizado correctamente" });
        }

        public async Task<ServiceResult<object>> EliminarAsync(int id)
        {
            var clienteExistente = await _clienteRepository.ObtenerPorIdAsync(id);

            if (clienteExistente == null)
                return ServiceResult<object>.Fail(404, "Cliente no encontrado");

            clienteExistente.Estado = "Inactivo";
            await _clienteRepository.ActualizarAsync(clienteExistente);

            return ServiceResult<object>.Ok(new { mensaje = "Cliente eliminado correctamente" });
        }

        public async Task<ServiceResult<object>> ReactivarAsync(int id)
        {
            var cliente = await _clienteRepository.ObtenerPorIdIncluyendoInactivosAsync(id);

            if (cliente == null)
                return ServiceResult<object>.Fail(404, "Cliente no encontrado");

            cliente.Estado = "Activo";
            await _clienteRepository.ActualizarAsync(cliente);

            return ServiceResult<object>.Ok(new { mensaje = "Cliente reactivado correctamente" });
        }

        private static void NormalizarCliente(Cliente cliente)
        {
            cliente.Nombre = NormalizarNombreApellido(cliente.Nombre);
            cliente.Apellido = NormalizarNombreApellido(cliente.Apellido);
            cliente.Direccion = cliente.Direccion?.Trim() ?? string.Empty;
            cliente.Telefono = cliente.Telefono?.Trim() ?? string.Empty;
            cliente.Correo = cliente.Correo?.Trim() ?? string.Empty;
        }

        private static string NormalizarNombreApellido(string? valor)
        {
            return Regex.Replace(valor?.Trim() ?? string.Empty, @"\s+", "");
        }

        private static string? ValidarCliente(Cliente cliente)
        {
            if (string.IsNullOrWhiteSpace(cliente.Nombre) ||
                string.IsNullOrWhiteSpace(cliente.Apellido) ||
                string.IsNullOrWhiteSpace(cliente.Direccion) ||
                string.IsNullOrWhiteSpace(cliente.Telefono) ||
                string.IsNullOrWhiteSpace(cliente.Correo))
            {
                return "Todos los campos son obligatorios";
            }

            if (TieneEspacios(cliente.Nombre) || TieneEspacios(cliente.Apellido))
            {
                return "Nombre y apellido no deben contener espacios";
            }

            if (!Regex.IsMatch(cliente.Telefono, @"^09\d{8}$"))
            {
                return "El telefono debe iniciar con 09 y tener 10 dígitos";
            }

            if (!Regex.IsMatch(cliente.Correo, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return "El correo no es válido";
            }

            return null;
        }

        private static bool TieneEspacios(string valor)
        {
            return Regex.IsMatch(valor, @"\s");
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
    }
}
