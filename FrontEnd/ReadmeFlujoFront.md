# Sistema de Facturación - Frontend

## Descripción General
El frontend es una aplicación construida con **Vanilla JS** (JavaScript puro, sin frameworks como React o Angular), HTML5 y CSS3. Recientemente fue refactorizada utilizando **Clean Architecture** y módulos nativos de ES6 para lograr un código mantenible, escalable y fuertemente desacoplado.

## Estructura de Clean Architecture
La lógica JavaScript está organizada en `FrontEnd/js/` con las siguientes capas:

- **`core/` (Dominio):** Contiene entidades puras (`Cliente`, `Producto`, `Factura`) y Value Objects (`Email`, `Dinero`). No sabe nada del DOM, fetch o localStorage. Solo valida reglas de negocio (ej. IVA).
- **`application/` (Casos de Uso):** Contiene clases con un único método `execute()`. Orquestan el flujo entre las entidades y los repositorios (ej. `CrearClienteUseCase`).
- **`infrastructure/` (Infraestructura):** Implementa llamadas a la API (`apiClient.js`), acceso a local/session storage y wrappers de notificaciones (`ToastNotifier`). Aquí residen los Repositorios que hacen `fetch` al backend.
- **`presentation/` (Presentación):** Controladores de página (ej. `FacturaPage.js`). Son los únicos que interactúan con el DOM (`document.getElementById`), escuchan eventos y actualizan la interfaz gráfica.
- **`shared/`:** Utilidades genéricas de formateo (moneda, fechas) y helpers para el DOM (escapar HTML para evitar XSS).

## Diagrama de Flujo
```text
[Usuario hace clic en "Agregar"]
      │
      ▼
[Evento en la página (FacturaPage.js)] ───► Captura el ID del producto y la cantidad.
      │
      ▼
[Caso de Uso (AgregarProductoUseCase)] ───► Orquesta la acción.
      │
      ▼
[Entidad (Factura.js)] ───► Valida el stock y recalcula subtotales/IVA.
      │
      ▼
[Repositorio (Infrastructure)] ───► (Si requiere validación extra en el backend) Realiza la petición HTTP.
      │
      ▼
[Backend (.NET API)] ───► Procesa y responde.
      │
      ▼
[Respuesta de la API] ◄─── Repositorio devuelve datos al Caso de Uso.
      │
      ▼
[Actualización de UI (FacturaPage.js)] ◄─── Renderiza la nueva fila en la tabla y actualiza los totales.
```

## Ejemplo Concreto: Agregar producto a factura
1. **FacturaPage.js captura el clic:** El usuario presiona el botón "+" en la tabla de búsqueda de productos. El evento onClick llama al método `agregarProducto` del controlador de la página.
2. **Llama al Use Case:** La página delega la acción a la entidad/caso de uso, pasando el objeto `Producto` y la cantidad deseada.
3. **Validación de Reglas de Negocio:** La entidad `Factura` llama a `producto.validarStockDisponible(cantidad)`. Si no hay stock, lanza una `DomainException`.
4. **Actualiza la entidad Factura:** Si es válido, se añade un `DetalleFactura` a la lista interna y se llama a `calcularTotales()`.
5. **FacturaPage.js re-renderiza la tabla:** Al retornar con éxito, la clase de presentación limpia la tabla de detalles en el DOM y la vuelve a dibujar con los datos actualizados, modificando los `<span>` de subtotal, IVA y total.

## Principios SOLID Aplicados en Vanilla JS
- **Single Responsibility Principle (SRP):** Las clases son pequeñas y enfocadas. `Producto.js` solo maneja la lógica de un producto. `ProductoRepository.js` solo maneja peticiones a `/api/Producto`.
- **Dependency Inversion Principle (DIP):** Los Casos de Uso reciben los repositorios por constructor (`constructor(productoRepository)`), lo que permite inyectar mocks para testing o cambiar la implementación sin alterar la lógica de aplicación.
- **Open/Closed Principle (OCP):** El enrutador en `main.js` permite agregar nuevas páginas y controladores fácilmente sin modificar los existentes, simplemente añadiendo una nueva entrada al diccionario de rutas.

## Cómo Levantar el Frontend
Debido al uso de módulos ES6 (`<script type="module">`), la aplicación **no funcionará si abres el archivo HTML haciendo doble clic**. 
Es obligatorio usar un servidor HTTP local. Se recomienda la extensión **Live Server** de VS Code.

1. Abre la carpeta `FrontEnd` en VS Code.
2. Haz clic derecho sobre `index.html` (o ve a `pages/login.html`).
3. Selecciona **"Open with Live Server"**.
4. La aplicación se abrirá en `http://127.0.0.1:5500`.

### Requerimiento Importante: Políticas CORS y `file://`
El protocolo `file://` está fuertemente restringido por los navegadores por motivos de seguridad. Cuando intentas importar un módulo JS usando `import { Cliente } from './core/Cliente.js'`, el navegador lo bloquea bajo CORS (Cross-Origin Resource Sharing) si se abre localmente sin un servidor web. El servidor HTTP (`http://127.0.0.1:5500`) provee el contexto adecuado para que los módulos ES6 sean descargados y resueltos correctamente por el navegador.

## Páginas y Controladores
| Archivo HTML | Archivo JS (Controlador) | Descripción |
|--------------|--------------------------|-------------|
| `clientes.html` | `ClientesPage.js` | CRUD, filtrado y validación de clientes |
| `productos.html`| `ProductosPage.js`| CRUD, reglas de IVA y gestión de stock |
| `factura.html` | `FacturaPage.js` | Flujo principal de venta, modales y carrito |

## Comparación Antes / Después
La refactorización redujo drásticamente el tamaño de los archivos al delegar responsabilidades en módulos pequeños:

| Archivo Original (Monolito) | Líneas | Archivos Refactorizados (Clean Arch) | Líneas Promedio |
|-----------------------------|--------|--------------------------------------|-----------------|
| `legacy/factura.js` | ~1,716 | `FacturaPage.js`, `Factura.js`, `FacturaRepository.js`, `DetalleFactura.js` | ~150 - 400 |
| `legacy/productos.js` | ~767 | `ProductosPage.js`, `Producto.js`, `ProductoRepository.js` | ~100 - 300 |
| `legacy/clientes.js` | ~656 | `ClientesPage.js`, `Cliente.js`, `ClienteRepository.js` | ~80 - 450 |
