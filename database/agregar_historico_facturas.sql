-- Columnas historicas para reconstruir facturas aunque cambien clientes, productos o usuarios.
-- Todas permiten NULL para no romper facturas existentes.

IF COL_LENGTH('Facturas', 'ClienteNombreHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD ClienteNombreHistorico NVARCHAR(100) NULL;');

IF COL_LENGTH('Facturas', 'ClienteApellidoHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD ClienteApellidoHistorico NVARCHAR(100) NULL;');

IF COL_LENGTH('Facturas', 'ClienteCorreoHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD ClienteCorreoHistorico NVARCHAR(100) NULL;');

IF COL_LENGTH('Facturas', 'ClienteTelefonoHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD ClienteTelefonoHistorico NVARCHAR(30) NULL;');

IF COL_LENGTH('Facturas', 'ClienteDireccionHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD ClienteDireccionHistorico NVARCHAR(200) NULL;');

IF COL_LENGTH('Facturas', 'VendedorNombreHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD VendedorNombreHistorico NVARCHAR(100) NULL;');

IF COL_LENGTH('Facturas', 'VendedorCorreoHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD VendedorCorreoHistorico NVARCHAR(100) NULL;');

IF COL_LENGTH('Facturas', 'VendedorRolHistorico') IS NULL
    EXEC(N'ALTER TABLE Facturas ADD VendedorRolHistorico NVARCHAR(30) NULL;');

IF COL_LENGTH('DetalleFactura', 'ProductoNombreHistorico') IS NULL
    EXEC(N'ALTER TABLE DetalleFactura ADD ProductoNombreHistorico NVARCHAR(150) NULL;');

IF COL_LENGTH('DetalleFactura', 'ProductoCategoriaHistorico') IS NULL
    EXEC(N'ALTER TABLE DetalleFactura ADD ProductoCategoriaHistorico NVARCHAR(30) NULL;');

IF COL_LENGTH('DetalleFactura', 'ProductoPrecioUnitarioHistorico') IS NULL
    EXEC(N'ALTER TABLE DetalleFactura ADD ProductoPrecioUnitarioHistorico DECIMAL(18,2) NULL;');

IF COL_LENGTH('DetalleFactura', 'ProductoAplicaIvaHistorico') IS NULL
    EXEC(N'ALTER TABLE DetalleFactura ADD ProductoAplicaIvaHistorico BIT NULL;');

IF COL_LENGTH('DetalleFactura', 'ProductoPorcentajeIvaHistorico') IS NULL
    EXEC(N'ALTER TABLE DetalleFactura ADD ProductoPorcentajeIvaHistorico DECIMAL(5,2) NULL;');
