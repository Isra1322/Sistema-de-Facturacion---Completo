# Contexto Técnico - Sistema de Facturación

## Resumen Técnico

### Tecnologías Utilizadas

**Backend:**
- **.NET 8** (C#) - Framework principal
- **Entity Framework Core** - ORM para acceso a datos
- **SQL Server** - Base de datos relacional
- **JWT (JSON Web Tokens)** - Autenticación y autorización
- **Swagger** - Documentación de API

**Frontend:**
- **Vanilla JavaScript** (ES6 modules) - Sin frameworks
- **HTML5** - Estructura de páginas
- **CSS3** - Estilos con soporte para tema oscuro/claro
- **Live Server** - Servidor de desarrollo (http://127.0.0.1:5500)

### Arquitectura del Backend

El backend sigue **Clean Architecture** con 4 capas principales:

```
BackEnd/
├── Domain/                 # Capa de Dominio (Entidades puras)
│   └── Entities/
│       ├── Cliente.cs
│       ├── Producto.cs
│       ├── Factura.cs
│       ├── DetalleFactura.cs
│       ├── Usuario.cs
│       ├── ErrorLog.cs
│       ├── StockMovement.cs
│       └── Role.cs
│
├── Application/            # Capa de Aplicación (Casos de uso)
│   ├── DTOs/               # Data Transfer Objects
│   ├── Interfaces/         # Contratos de servicios y repositorios
│   └── Services/           # Lógica de negocio
│
├── Infrastructure/         # Capa de Infraestructura (Implementaciones)
│   ├── Persistence/
│   │   └── ApplicationDbContext.cs  # DbContext de EF Core
│   ├── Repositories/       # Implementaciones de repositorios
│   └── Services/           # Servicios externos (PDF, JWT, File Storage)
│
├── WebAPI/                 # Capa de Presentación (API REST)
│   ├── Controllers/        # Controladores HTTP
│   └── Middleware/         # Middleware de manejo de errores
│
└── Helpers/                # Utilidades compartidas
```

### Frontend

El frontend también sigue **Clean Architecture** con módulos ES6:

```
FrontEnd/
├── pages/                  # Páginas HTML
│   ├── index.html          # Dashboard principal
│   ├── login.html          # Login
│   ├── clientes.html       # Gestión de clientes
│   ├── productos.html     # Gestión de productos
│   ├── factura.html        # Creación de facturas
│   ├── facturas.html       # Listado de facturas
│   ├── usuarios.html      # Gestión de usuarios
│   └── ver-factura.html    # Visualización de factura
│
├── css/                    # Estilos
│
└── js/                     # Lógica JavaScript (Clean Architecture)
    ├── core/               # Entidades de dominio
    ├── application/        # Casos de uso
    ├── infrastructure/     # Repositorios y servicios externos
    ├── presentation/       # Controladores de página
    ├── shared/             # Utilidades compartidas
    └── legacy/             # Código antiguo (refactorizado)
```

### Base de Datos

**Tablas principales:**
- `Usuarios` - Usuarios del sistema con roles
- `Roles` - Roles disponibles (Administrador, Vendedor)
- `Clientes` - Información de clientes
- `Productos` - Catálogo de productos con stock
- `Facturas` - Cabeceras de facturas con datos históricos
- `DetalleFactura` - Líneas de detalle de facturas
- `ErrorLogs` - Registro de errores
- `StockMovements` - Movimientos de inventario

**Migraciones (Entity Framework Core):**
- `20260603160815_AddFacturaHistoricalSnapshot` - Agrega campos históricos para snapshot de datos
- `20260603164753_AddVendedorCorreoHistorico` - Agrega correo histórico del vendedor

**Scripts SQL:**
- `database/init.sql` - Script completo de inicialización de BD
- `database/2026-06-08_add_factura_historicos.sql` - Actualización de campos históricos

---

## Diagrama de Flujo del Sistema

```mermaid
graph TD
    A[Usuario] --> B[Login HTML]
    B --> C[POST /api/Auth/login]
    C --> D[AuthService]
    D --> E[UsuarioRepository]
    E --> F[SQL Server]
    F --> E
    E --> D
    D --> G[JWT Service]
    G --> H[Token JWT]
    H --> I[Frontend - localStorage/sessionStorage]
    
    I --> J[Dashboard index.html]
    J --> K{Rol del Usuario}
    
    K -->|Administrador| L[Acceso Total]
    K -->|Vendedor| M[Acceso Limitado]
    
    L --> N[clientes.html]
    L --> O[productos.html]
    L --> P[usuarios.html]
    L --> Q[factura.html]
    
    M --> Q
    
    Q --> R[POST /api/Factura]
    R --> S[FacturaController]
    S --> T[FacturaService]
    T --> U[Validar Stock]
    U --> V[ProductoRepository]
    V --> F
    F --> V
    V --> T
    T --> W[Calcular Totales]
    W --> X[FacturaRepository]
    X --> F
    F --> X
    X --> T
    T --> S
    S --> Y[Respuesta HTTP 201]
    Y --> Z[Frontend - Mostrar Factura]
    
    Z --> AA[GET /api/Factura/pdf/{numero}]
    AA --> AB[PdfFacturaService]
    AB --> AC[Generar PDF]
    AC --> AD[FileStorageService]
    AD --> AE[FacturasGeneradas/]
    AE --> AB
    AB --> S
    S --> AF[Archivo PDF]
    
    style A fill:#e1f5ff
    style F fill:#ffe1e1
    style I fill:#e1ffe1
    style K fill:#fff4e1
    style AE fill:#e1f5ff
```

---

## Funcionamiento del Programa

### 1. Autenticación y Sesiones

**Flujo de Login:**
1. Usuario ingresa credenciales en `login.html`
2. Frontend envía POST a `/api/Auth/login`
3. `AuthService` valida contra `UsuarioRepository`
4. Si válido, `JwtService` genera token JWT con claims:
   - `ClaimTypes.NameIdentifier`: ID del usuario
   - `ClaimTypes.Role`: Rol del usuario
5. Token se guarda en `localStorage` o `sessionStorage`
6. Rol se guarda para control de acceso en frontend

**Protección por Rol (auth.js):**
- **Administrador**: Acceso total a todas las páginas
- **Vendedor**: Solo puede acceder a `factura.html` y `facturas.html`
- Páginas bloqueadas para vendedor: `clientes.html`, `productos.html`, `usuarios.html`

**Middleware de Autenticación:**
- Token JWT se envía en header `Authorization: Bearer {token}`
- `ErrorHandlingMiddleware` captura errores globalmente

### 2. Gestión de Clientes

**CRUD de Clientes:**
- **Crear**: POST `/api/Cliente` - Requiere validación de correo único
- **Leer**: GET `/api/Cliente` - Lista paginada de clientes
- **Actualizar**: PUT `/api/Cliente/{id}` - Modifica datos del cliente
- **Eliminar**: DELETE `/api/Cliente/{id}` - Marca como inactivo

**Validaciones:**
- Correo electrónico único
- Campos obligatorios: Nombre, Apellido, Dirección, Teléfono, Correo
- Estado por defecto: "Activo"

### 3. Gestión de Productos

**CRUD de Productos:**
- **Crear**: POST `/api/Producto` - Con validación de nombre único
- **Leer**: GET `/api/Producto` - Lista con filtros por categoría
- **Actualizar**: PUT `/api/Producto/{id}` - Modifica stock, precio, etc.
- **Eliminar**: DELETE `/api/Producto/{id}` - Marca como inactivo

**Validaciones:**
- Nombre único
- Precio > 0
- Stock >= 0
- Configuración de IVA: `AplicaIva` (bool), `PorcentajeIva` (decimal, default 15%)

**Control de Stock:**
- Cada venta genera un `StockMovement` (tipo: "Venta")
- Stock se actualiza automáticamente al crear factura
- Motivo: "Venta #{NumeroFactura}"

### 4. Generación de Facturas

**Paso a Paso:**

1. **Selección de Cliente:**
   - Usuario selecciona cliente de dropdown o búsqueda
   - Frontend valida que el cliente esté activo

2. **Agregar Productos:**
   - Usuario busca productos por nombre o categoría
   - Al agregar, se valida:
     - Stock disponible > cantidad solicitada
     - Producto esté activo
   - Se calcula subtotal línea: `PrecioUnitario * Cantidad`
   - Se calcula IVA línea: `SubtotalLinea * (PorcentajeIva / 100)`
   - Se calcula total línea: `SubtotalLinea + IvaLinea`

3. **Cálculos de Factura:**
   - Subtotal: Σ de todos los subtotales de línea
   - IVA: Σ de todos los IVAs de línea
   - Total: Subtotal + IVA

4. **Creación en Backend:**
   - POST `/api/Factura` con `CrearFacturaDto`
   - `FacturaService`:
     - Valida cliente existente
     - Valida stock de cada producto
     - Genera número de factura (sequence SQL)
     - Crea snapshot histórico:
       - `ClienteNombreHistorico`, `ClienteCorreoHistorico`, etc.
       - `VendedorNombreHistorico`, `VendedorCorreoHistorico`, etc.
     - Guarda factura y detalles
     - Actualiza stock de productos
     - Registra movimientos de stock

5. **Generación de PDF:**
   - GET `/api/Factura/pdf/{numeroFactura}`
   - `PdfFacturaService` genera PDF con:
     - Datos del cliente (históricos)
     - Datos del vendedor (históricos)
     - Lista de productos con precios e IVA
     - Totales
   - PDF se guarda en `FacturasGeneradas/`
   - Archivo se retorna al navegador para descarga

**Snapshot Histórico:**
- Las facturas guardan copia de datos al momento de creación
- Esto permite que si un cliente o producto se modifica/elimina, la factura original permanece intacta
- Campos históricos en `Factura`: ClienteNombreHistorico, ClienteCorreoHistorico, etc.
- Campos históricos en `DetalleFactura`: ProductoNombreHistorico, ProductoCategoriaHistorico, etc.

### 5. Entity Framework Core

**DbContext (ApplicationDbContext.cs):**
- Configura todas las DbSets
- Define relaciones entre entidades
- Configura validaciones y constraints
- Maneja migraciones automáticamente

**Migraciones:**
- Comando: `dotnet ef migrations add NombreMigration`
- Comando: `dotnet ef database update`
- Cada migración tiene timestamp: `YYYYMMDDHHMMSS_Descripcion.cs`
- `ApplicationDbContextModelSnapshot.cs` mantiene el estado actual del modelo

**Configuración de Connection String:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=ISRA;Database=SistemaFacturacionDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

### 6. Almacenamiento de Facturas

**Carpeta: `FacturasGeneradas/`**
- Configurada en `appsettings.json`:
```json
{
  "PdfStorage": {
    "OutputDirectory": "FacturasGeneradas"
  }
}
```
- `FileStorageService` maneja la creación de archivos
- Nombre de archivo: `Factura_{NumeroFactura}_{Timestamp}.pdf`
- Servicio: `IFileStorageService` → `FileStorageService`

---

## Notas Adicionales

### Tema Oscuro/Claro

**Implementación (theme.js):**
- Botón con ID: `btnToggleThemeSidebar`
- Estado guardado en `localStorage` con clave `"theme"`
- Clase CSS: `"dark-mode"` en `body`
- Iconos: ☀️ (modo claro) / 🌙 (modo oscuro)
- Persistencia entre sesiones

### Roles y Permisos

**Roles Definidos:**
- **Administrador**: Acceso completo a todo el sistema
  - Puede gestionar clientes, productos, usuarios, facturas
  - Puede ver todas las facturas (sin restricción)
  
- **Vendedor**: Acceso limitado
  - Solo puede crear y ver sus propias facturas
  - No puede gestionar clientes, productos, usuarios
  - Bloqueado de páginas: clientes.html, productos.html, usuarios.html

**Control en Frontend:**
- Clase CSS: `role-admin-only` para elementos exclusivos de administrador
- `auth.js` redirige si vendedor intenta acceder a páginas restringidas

**Control en Backend:**
- Atributo `[Authorize(Roles = "Administrador,Vendedor")]` en controladores
- `FacturaService` filtra facturas por rol:
  - Administrador: Ve todas las facturas
  - Vendedor: Solo ve sus facturas (`IdUsuario == usuarioActual`)

### Estructura de Carpetas Importantes

```
SistemaFacturacion/
├── BackEnd/                 # Código fuente .NET
├── FrontEnd/                # Código fuente web
├── database/                # Scripts SQL
├── Migrations/              # Migraciones EF Core
├── FacturasGeneradas/       # PDFs generados
├── Program.cs               # Punto de entrada de la API
├── appsettings.json         # Configuración
├── SistemaFacturacion.csproj # Proyecto .NET
└── docker-compose.yml       # Configuración Docker
```

### Endpoints Principales de la API

| Endpoint | Método | Descripción | Autorización |
|----------|--------|-------------|--------------|
| `/api/Auth/login` | POST | Login y generación de JWT | Pública |
| `/api/Cliente` | GET | Listar clientes | Admin, Vendedor |
| `/api/Cliente` | POST | Crear cliente | Admin |
| `/api/Cliente/{id}` | PUT | Actualizar cliente | Admin |
| `/api/Cliente/{id}` | DELETE | Eliminar cliente | Admin |
| `/api/Producto` | GET | Listar productos | Admin, Vendedor |
| `/api/Producto` | POST | Crear producto | Admin |
| `/api/Producto/{id}` | PUT | Actualizar producto | Admin |
| `/api/Producto/{id}` | DELETE | Eliminar producto | Admin |
| `/api/Factura` | POST | Crear factura | Admin, Vendedor |
| `/api/Factura/{numero}` | GET | Obtener factura por número | Admin, Vendedor |
| `/api/Factura/buscar` | GET | Buscar facturas con filtros | Admin, Vendedor |
| `/api/Factura/resumen` | GET | Resumen de facturas | Admin, Vendedor |
| `/api/Factura/fecha` | GET | Facturas por fecha | Admin, Vendedor |
| `/api/Factura/pdf/{numero}` | GET | Generar PDF | Admin, Vendedor |
| `/api/Usuario` | GET | Listar usuarios | Admin |
| `/api/Usuario` | POST | Crear usuario | Admin |
| `/api/Usuario/{id}` | PUT | Actualizar usuario | Admin |
| `/api/Usuario/{id}` | DELETE | Eliminar usuario | Admin |

### Configuración de CORS

**Program.cs:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy
            .WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
```

### Configuración de JWT

**Program.cs:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });
```

**appsettings.json:**
```json
{
  "Jwt": {
    "Key": "SISTEMA_FACTURACION_2026_API_SEGURA",
    "Issuer": "SistemaFacturacionAPI",
    "Audience": "SistemaFacturacionFrontend"
  }
}
```

### Patrones SOLID Aplicados

**Backend (.NET):**
- **SRP**: Cada clase tiene una responsabilidad única (Controller, Service, Repository)
- **DIP**: Dependencia de interfaces, no implementaciones concretas
- **OCP**: Entidades pueden extenderse sin modificar código existente

**Frontend (JavaScript):**
- **SRP**: Módulos pequeños y enfocados (Entidades, UseCases, Repositories)
- **DIP**: UseCases reciben repositorios por constructor
- **OCP**: Router en main.js permite agregar páginas sin modificar existentes

### Cómo Ejecutar el Proyecto

**Backend:**
```bash
cd BackEnd/WebAPI
dotnet run
```
- Se levanta en `http://localhost:5161` (configurable en launchSettings.json)
- Swagger disponible en `http://localhost:5161/swagger`

**Frontend:**
```bash
# Usar Live Server de VS Code
# Click derecho en FrontEnd/pages/index.html
# "Open with Live Server"
```
- Se levanta en `http://127.0.0.1:5500`
- Requiere servidor HTTP por políticas CORS de módulos ES6

**Base de Datos:**
```bash
# Ejecutar script de inicialización
sqlcmd -S ISRA -i database/init.sql
```

### Propósito de este Documento

Este archivo sirve como **documentación de onboarding** para nuevos desarrolladores que se unan al proyecto. Proporciona:

1. Visión general de la arquitectura y tecnologías
2. Flujo completo del sistema desde login hasta generación de facturas
3. Explicación detallada de cada componente y su responsabilidad
4. Guía para entender el código existente y hacer modificaciones
5. Referencia rápida de endpoints, configuraciones y patrones utilizados

**Para empezar a trabajar:**
1. Revisar la estructura de carpetas descrita arriba
2. Leer `BackEnd/ReadmeFlujoBackend.md` para detalles del backend
3. Leer `FrontEnd/ReadmeFlujoFront.md` para detalles del frontend
4. Ejecutar el proyecto siguiendo las instrucciones de "Cómo Ejecutar"
5. Revisar los controladores y servicios para entender el flujo de datos
6. Explorar las entidades de dominio para entender el modelo de datos

---

**Última actualización:** Junio 2026  
**Versión:** 1.0  
**Autor:** Sistema de Documentación Automática
