# 🧾Sistema de Facturación

Sistema de facturación profesional desarrollado con Clean Architecture, ASP.NET Core Web API y SQL Server.  
Incluye autenticación JWT, gestión de clientes, productos, facturación, control de inventario, generación de PDFs y trazabilidad de movimientos de stock.

## 📌 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

GitHub Descktop link: https://desktop.github.com/download/

## 🚀 Instalación y Configuración

### 1.- Configurar la cadena de conexión
Abre el archivo appsettings.json y modifica la cadena de conexión:

json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=SistemaFacturacionDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True;"
  },
 
### 2.- Restaurar paquetes NuGet
dotnet restore

### 3.- Script de Base de Datos

Ejecuta el siguiente script en SQL Server Management Studio (SSMS)
```
-- ============================================================
-- SISTEMA DE FACTURACIÓN - SCRIPT COMPLETO
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'SistemaFacturacionDB')
BEGIN
    ALTER DATABASE SistemaFacturacionDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SistemaFacturacionDB;
END
GO

CREATE DATABASE SistemaFacturacionDB;
GO

USE SistemaFacturacionDB;
GO

-- TABLA: Usuarios
CREATE TABLE Usuarios (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(30) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    IntentosFallidos INT NOT NULL DEFAULT 0,
    Bloqueado BIT NOT NULL DEFAULT 0
);
GO

-- TABLA: Roles
CREATE TABLE Roles (
    IdRole INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE,
    Descripcion NVARCHAR(150) NULL,
    Activo BIT NOT NULL DEFAULT 1
);
GO

-- TABLA: Clientes
CREATE TABLE Clientes (
    IdCliente INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Direccion NVARCHAR(200) NOT NULL,
    Telefono NVARCHAR(20) NOT NULL,
    Correo NVARCHAR(100) NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Activo',
    CONSTRAINT UQ_Clientes_Correo UNIQUE (Correo)
);
GO

-- TABLA: Productos
CREATE TABLE Productos (
    IdProducto INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(150) NOT NULL,
    Precio DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Activo',
    Categoria NVARCHAR(50) NOT NULL DEFAULT 'Tecnologia',
    AplicaIva BIT NOT NULL DEFAULT 1,
    PorcentajeIva DECIMAL(5,2) NOT NULL DEFAULT 15,
    CONSTRAINT UQ_Productos_Nombre UNIQUE (Nombre),
    CONSTRAINT CHK_Productos_Precio CHECK (Precio > 0),
    CONSTRAINT CHK_Productos_Stock CHECK (Stock >= 0)
);
GO

-- TABLA: Facturas
CREATE TABLE Facturas (
    IdFactura INT IDENTITY(1,1) PRIMARY KEY,
    NumeroFactura INT NOT NULL,
    Fecha DATETIME NOT NULL DEFAULT GETDATE(),
    IdCliente INT NOT NULL,
    IdUsuario INT NULL,
    Subtotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    Iva DECIMAL(18,2) NOT NULL DEFAULT 0,
    Total DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT UQ_Facturas_NumeroFactura UNIQUE (NumeroFactura),
    CONSTRAINT CHK_Facturas_Total CHECK (Total >= 0),
    CONSTRAINT FK_Facturas_Clientes FOREIGN KEY (IdCliente) REFERENCES Clientes(IdCliente),
    CONSTRAINT FK_Facturas_Usuarios FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario) ON DELETE SET NULL
);
GO

-- TABLA: DetalleFactura
CREATE TABLE DetalleFactura (
    IdDetalleFactura INT IDENTITY(1,1) PRIMARY KEY,
    IdFactura INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(18,2) NOT NULL,
    TotalLinea DECIMAL(18,2) NOT NULL,
    PorcentajeIva DECIMAL(5,2) NOT NULL DEFAULT 15,
    IvaLinea DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT CHK_DetalleFactura_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CHK_DetalleFactura_PrecioUnitario CHECK (PrecioUnitario > 0),
    CONSTRAINT CHK_DetalleFactura_TotalLinea CHECK (TotalLinea >= 0),
    CONSTRAINT FK_DetalleFactura_Facturas FOREIGN KEY (IdFactura) REFERENCES Facturas(IdFactura),
    CONSTRAINT FK_DetalleFactura_Productos FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
);
GO

-- TABLA: ErrorLogs
CREATE TABLE ErrorLogs (
    IdErrorLog INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Fecha DATETIME2 NOT NULL,
    Nivel NVARCHAR(50) NOT NULL,
    Mensaje NVARCHAR(500) NOT NULL,
    Detalle NVARCHAR(MAX) NULL,
    Ruta NVARCHAR(300) NULL,
    MetodoHttp NVARCHAR(20) NULL,
    Usuario NVARCHAR(150) NULL,
    StackTrace NVARCHAR(MAX) NULL
);
GO

-- TABLA: StockMovements
CREATE TABLE StockMovements (
    IdStockMovement INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    IdProducto INT NOT NULL,
    TipoMovimiento NVARCHAR(30) NOT NULL,
    Cantidad INT NOT NULL,
    StockAnterior INT NOT NULL,
    StockNuevo INT NOT NULL,
    Fecha DATETIME2 NOT NULL,
    Motivo NVARCHAR(100) NOT NULL,
    NumeroFactura INT NULL,
    IdUsuario INT NULL,
    CONSTRAINT FK_StockMovements_Productos FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
    CONSTRAINT FK_StockMovements_Usuarios FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario) ON DELETE SET NULL
);
GO

-- SEQUENCE para número de factura
CREATE SEQUENCE SeqNumeroFactura AS INT START WITH 1 INCREMENT BY 1;
GO

-- ÍNDICE ÚNICO
CREATE UNIQUE INDEX UX_Facturas_NumeroFactura ON Facturas(NumeroFactura);
GO

-- DATOS INICIALES: Roles
INSERT INTO Roles (Nombre, Descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Vendedor', 'Acceso limitado a ventas');
GO

-- DATOS INICIALES: Usuarios (contraseña: root)
INSERT INTO Usuarios (Nombre, Correo, PasswordHash, Rol, Activo) VALUES
('Administrador', 'admin@gmail.com', 'root', 'Administrador', 1);
GO

INSERT INTO Usuarios (Nombre, Correo, PasswordHash, Rol, Activo) VALUES
('Vendedor', 'vendedor@gmail.com', 'root', 'Vendedor', 1);
GO

-- DATOS INICIALES: Clientes
INSERT INTO Clientes (Nombre, Apellido, Direccion, Telefono, Correo, Estado) VALUES 
('Juan', 'Perez', 'Ambato - Ficoa', '0991111111', 'juan.perez@gmail.com', 'Activo'),
('Maria', 'Lopez', 'Ambato - Huachi', '0992222222', 'maria.lopez@gmail.com', 'Activo'),
('Carlos', 'Mendoza', 'Ambato - Atocha', '0993333333', 'carlos.mendoza@gmail.com', 'Activo'),
('Ana', 'Villacis', 'Ambato - Izamba', '0994444444', 'ana.villacis@gmail.com', 'Activo'),
('Luis', 'Quispe', 'Ambato - Centro', '0995555555', 'luis.quispe@gmail.com', 'Activo');
GO

-- DATOS INICIALES: Productos
INSERT INTO Productos (Nombre, Precio, Stock, Estado, Categoria, AplicaIva, PorcentajeIva) VALUES
('Laptop Lenovo', 650.00, 10, 'Activo', 'Tecnologia', 1, 15),
('Mouse Logitech', 15.50, 30, 'Activo', 'Tecnologia', 1, 15),
('Teclado Redragon', 28.75, 20, 'Activo', 'Tecnologia', 1, 15),
('Monitor Samsung 24', 180.00, 8, 'Activo', 'Tecnologia', 1, 15),
('Memoria USB 32GB', 9.99, 50, 'Activo', 'Tecnologia', 1, 15),
('Disco SSD 500GB', 55.00, 15, 'Activo', 'Tecnologia', 1, 15),
('Audifonos Sony', 35.90, 12, 'Activo', 'Tecnologia', 1, 15),
('Impresora Epson', 210.00, 5, 'Activo', 'Tecnologia', 1, 15);
GO

-- VISTAS
CREATE VIEW VistaFacturasCompletas AS
SELECT 
    F.IdFactura,
    F.NumeroFactura,
    F.Fecha,
    C.Nombre + ' ' + C.Apellido AS Cliente,
    C.Correo AS CorreoCliente,
    U.Nombre AS Vendedor,
    F.Subtotal,
    F.Iva,
    F.Total
FROM Facturas F
INNER JOIN Clientes C ON F.IdCliente = C.IdCliente
LEFT JOIN Usuarios U ON F.IdUsuario = U.IdUsuario;
GO

CREATE VIEW VistaDetalleFacturas AS
SELECT 
    D.IdDetalleFactura,
    F.NumeroFactura,
    P.Nombre AS Producto,
    D.Cantidad,
    D.PrecioUnitario,
    D.PorcentajeIva,
    D.IvaLinea,
    D.TotalLinea
FROM DetalleFactura D
INNER JOIN Facturas F ON D.IdFactura = F.IdFactura
INNER JOIN Productos P ON D.IdProducto = P.IdProducto;
GO
```

### 3.- Compilar el proyecto
dotnet run

🔐 Credenciales de Acceso
```
Rol	Correo	Contraseña
Administrador	admin@gmail.com	root
Vendedor	vendedor@gmail.com	root

Contraseña cifrada: $2a$11$NF9/ttwLqKUOakzEwKhFGuWSam17pk3z4guk/.pXlwnso5JcQHQp6
```
