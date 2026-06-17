import { ClientesPage } from "./presentation/pages/ClientesPage.js";
import { ProductosPage } from "./presentation/pages/ProductosPage.js";
import { FacturaPage } from "./presentation/pages/FacturaPage.js";

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("clientes.html")) {
    const page = new ClientesPage();
    page.init();
  } else if (path.includes("productos.html")) {
    const page = new ProductosPage();
    page.init();
  } else if (path.includes("factura.html")) {
    const page = new FacturaPage();
    page.init();
  }
});
