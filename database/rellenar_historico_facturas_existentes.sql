-- Backfill opcional para facturas antiguas.
-- Usa los datos actuales como mejor aproximacion historica solo cuando el historico esta vacio.
-- Ejecutar despues de database/agregar_historico_facturas.sql.

UPDATE f
SET
    ClienteNombreHistorico = COALESCE(f.ClienteNombreHistorico, c.Nombre),
    ClienteApellidoHistorico = COALESCE(f.ClienteApellidoHistorico, c.Apellido),
    ClienteCorreoHistorico = COALESCE(f.ClienteCorreoHistorico, c.Correo),
    ClienteTelefonoHistorico = COALESCE(f.ClienteTelefonoHistorico, c.Telefono),
    ClienteDireccionHistorico = COALESCE(f.ClienteDireccionHistorico, c.Direccion),
    VendedorNombreHistorico = COALESCE(f.VendedorNombreHistorico, u.Nombre),
    VendedorCorreoHistorico = COALESCE(f.VendedorCorreoHistorico, u.Correo),
    VendedorRolHistorico = COALESCE(f.VendedorRolHistorico, u.Rol)
FROM Facturas f
LEFT JOIN Clientes c ON c.IdCliente = f.IdCliente
LEFT JOIN Usuarios u ON u.IdUsuario = f.IdUsuario;

UPDATE d
SET
    ProductoNombreHistorico = COALESCE(d.ProductoNombreHistorico, p.Nombre),
    ProductoCategoriaHistorico = COALESCE(d.ProductoCategoriaHistorico, p.Categoria),
    ProductoPrecioUnitarioHistorico = COALESCE(d.ProductoPrecioUnitarioHistorico, d.PrecioUnitario, p.Precio),
    ProductoAplicaIvaHistorico = COALESCE(d.ProductoAplicaIvaHistorico, p.AplicaIva),
    ProductoPorcentajeIvaHistorico = COALESCE(d.ProductoPorcentajeIvaHistorico, d.PorcentajeIva, p.PorcentajeIva)
FROM DetalleFactura d
LEFT JOIN Productos p ON p.IdProducto = d.IdProducto;
