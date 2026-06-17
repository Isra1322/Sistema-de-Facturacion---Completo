# Sistema de Facturación - Backend

## Descripción General
El backend de este sistema de facturación es una API RESTful desarrollada con **.NET 8** (C#). Utiliza **Entity Framework Core** como ORM para la persistencia de datos en una base de datos SQL Server y **JWT (JSON Web Tokens)** para la autenticación y autorización basada en roles.

## Estructura de Clean Architecture
El proyecto está estructurado en 4 capas fundamentales siguiendo los principios de la Arquitectura Limpia:

1. **Domain (Dominio):** Contiene las entidades principales del negocio (Cliente, Producto, Factura, DetalleFactura), objetos de valor y excepciones de dominio. Es el núcleo de la aplicación y no tiene dependencias de ninguna otra capa.
2. **Application (Aplicación):** Contiene los casos de uso (Interfaces y Servicios) y los DTOs. Coordina la lógica de negocio consumiendo las entidades del dominio y definiendo interfaces (contratos) para los repositorios. Depende únicamente de la capa Domain.
3. **Infrastructure (Infraestructura):** Implementa los repositorios definidos en la capa de aplicación, maneja el contexto de base de datos (`DbContext`) usando Entity Framework, configuraciones de JWT y servicios externos (ej. generación de PDF). Depende de Application y Domain.
4. **WebAPI (Presentación/API):** Contiene los Controladores REST, configuración de inyección de dependencias (DI), middlewares (manejo de errores globales) y configuración de Swagger. Depende de Application e Infrastructure.

## Diagrama de Flujo HTTP
```text
[Cliente HTTP] 
      │
      ▼ (Petición HTTP: POST /api/Factura)
[Controlador (WebAPI)] ───► Valida la entrada y delega al servicio.
      │
      ▼
[Servicio (Application)] ───► Aplica reglas de negocio (ej. verificar stock).
      │
      ▼
[Repositorio (Infrastructure)] ───► Traduce la operación a consultas SQL.
      │
      ▼
[Base de Datos (SQL Server)] ───► Guarda los datos.
      │
      ▼
[Repositorio] ◄─── Retorna la entidad persistida.
      │
      ▼
[Servicio] ◄─── Retorna un DTO/Resultado.
      │
      ▼
[Controlador] ◄─── Formatea la respuesta HTTP (ej. 200 OK).
      │
      ▼ (Respuesta HTTP)
[Cliente HTTP]
```

## Ejemplo Concreto: Crear Factura
1. **Controlador recibe la petición:** `FacturaController` recibe un POST con un DTO que contiene el `IdCliente` y la lista de `Detalles` (IdProducto, Cantidad).
2. **Servicio de aplicación procesa la lógica:** `FacturaService` valida que el cliente exista, que los productos tengan stock suficiente, calcula subtotales, IVA y total de la factura.
3. **Repositorio guarda en BD:** `FacturaRepository` añade la nueva `Factura` (y sus detalles) al `DbContext` y ejecuta `SaveChangesAsync()`. Al mismo tiempo, actualiza el stock de los productos.
4. **Respuesta vuelve al cliente:** El servicio retorna la factura creada con su nuevo ID/Número y el controlador responde con un `201 Created`.

## Patrones SOLID Aplicados
- **Single Responsibility Principle (SRP):** Cada clase tiene una única responsabilidad. Por ejemplo, `FacturaController` solo maneja peticiones HTTP, mientras que `FacturaService` solo maneja la lógica de negocio de las facturas.
- **Dependency Inversion Principle (DIP):** El `FacturaController` depende de la interfaz `IFacturaService`, no de su implementación concreta. La inyección de dependencias (DI) provee la instancia en tiempo de ejecución.
- **Open/Closed Principle (OCP):** Las entidades de dominio pueden ser extendidas sin modificar su código interno. La validación de negocio se encapsula en servicios que pueden crecer mediante nuevas implementaciones de interfaces.

## Cómo Levantar el Backend
Para ejecutar el servidor localmente, asegúrate de tener el SDK de .NET instalado y ejecuta:
```bash
cd BackEnd/WebAPI
dotnet run
```
El servidor normalmente se levantará en `http://localhost:5161` o el puerto configurado en `launchSettings.json`.

## Endpoints Principales
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/Auth/login` | `POST` | Autenticación y generación de JWT |
| `/api/Cliente` | `GET` | Obtener lista de clientes |
| `/api/Cliente` | `POST` | Crear un nuevo cliente |
| `/api/Producto` | `GET` | Obtener lista de productos |
| `/api/Factura` | `POST` | Registrar una nueva factura |
| `/api/Factura/{numero}` | `GET` | Obtener el detalle de una factura |
| `/api/Factura/pdf/{numero}` | `GET` | Generar y descargar el PDF de la factura |

## Diagrama de Base de Datos
```text
+-------------------+       +-------------------+
|     Usuario       |       |     Cliente       |
+-------------------+       +-------------------+
| IdUsuario (PK)    |       | IdCliente (PK)    |
| Nombre            |       | Nombre            |
| Correo            |       | Apellido          |
| Rol               |       | Identificacion    |
+-------------------+       +-------------------+
        │                             │
        │ 1                           │ 1
        │                             │
        │ N                           │ N
+-------------------+       +-------------------+
|     Factura       |       |    Producto       |
+-------------------+       +-------------------+
| IdFactura (PK)    |       | IdProducto (PK)   |
| NumeroFactura     |       | Nombre            |
| FechaEmision      |       | Precio            |
| IdCliente (FK)    |       | Stock             |
| IdUsuario (FK)    |       | Categoria         |
| Subtotal          |       | AplicaIva         |
| Iva               |       | PorcentajeIva     |
| Total             |       | Estado            |
+-------------------+       +-------------------+
        │                             │
        │ 1                           │ 1
        │                             │
        │ N                           │ N
+-------------------+                 │
| DetalleFactura    |                 │
+-------------------+                 │
| IdDetalle (PK)    |                 │
| IdFactura (FK)    |◄────────────────┘
| IdProducto (FK)   |
| Cantidad          |
| PrecioUnitario    |
| Subtotal          |
+-------------------+
```
