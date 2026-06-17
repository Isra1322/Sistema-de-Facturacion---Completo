function obtenerDatosUsuarioSidebar() {
  const nombre = localStorage.getItem("nombre")
    || localStorage.getItem("usuarioNombre")
    || sessionStorage.getItem("nombre")
    || sessionStorage.getItem("usuarioNombre")
    || "Usuario";
  const rol = localStorage.getItem("rol")
    || localStorage.getItem("usuarioRol")
    || sessionStorage.getItem("rol")
    || sessionStorage.getItem("usuarioRol")
    || "Rol";

  return { nombre, rol };
}

function actualizarUsuarioSidebar() {
  const { nombre, rol } = obtenerDatosUsuarioSidebar();
  const sidebarNombre = document.getElementById("sidebarUsuarioNombre");
  const sidebarRol = document.getElementById("sidebarUsuarioRol");
  const sidebarAvatar = document.getElementById("sidebarUserAvatar");
  const inicial = nombre && nombre !== "Usuario" ? nombre.charAt(0).toUpperCase() : "";

  if (sidebarNombre) sidebarNombre.textContent = nombre;
  if (sidebarRol) sidebarRol.textContent = rol;
  if (sidebarAvatar) sidebarAvatar.textContent = inicial;
}

actualizarUsuarioSidebar();

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split("/").pop();
  const dashboardLayout = document.querySelector(".dashboard-layout");
  const sidebar = document.querySelector(".sidebar");
  const btnToggleSidebar = document.getElementById("btnToggleSidebar");

  const { nombre, rol } = obtenerDatosUsuarioSidebar();
  const paginasAdmin = ["clientes.html", "productos.html", "usuarios.html"];
  const esAdministrador = rol === "Administrador";
  const esVendedor = rol === "Vendedor";

  actualizarUsuarioSidebar();

  document.querySelectorAll(".role-admin-only").forEach(element => {
    element.classList.toggle("hidden-by-role", !esAdministrador);
  });

  links.forEach(link => {
    const href = link.getAttribute("href");

    if (!href) return;

    const linkPage = href.split("/").pop();

    if (currentPage === linkPage) {
      link.classList.add("active");
    }
  });

  if (esVendedor) {
    document
      .querySelectorAll(".nav-admin, .card-productos, .card-usuarios, .card-clientes")
      .forEach(element => element.remove());

    links.forEach(link => {
      const href = link.getAttribute("href");
      const linkPage = href ? href.split("/").pop() : "";

      if (paginasAdmin.includes(linkPage)) {
        link.classList.add("hidden-by-role");
      }
    });
  }

  const navContainer = document.querySelector(".top-nav-container");

  if (navContainer && nombre && rol && !document.getElementById("btnLogout")) {
    const userInfo = document.createElement("div");

    userInfo.className = "nav-user-info";
    userInfo.innerHTML = `
      <span>${nombre} (${rol})</span>
      <button id="btnLogout" type="button">Cerrar sesión</button>
    `;

    navContainer.appendChild(userInfo);
  }

  const btnLogout = document.getElementById("btnLogout");

  if (btnLogout && btnLogout.dataset.logoutReady !== "true") {
    btnLogout.addEventListener("click", () => {
      if (typeof cerrarSesion === "function") cerrarSesion();
    });
  }

  if (dashboardLayout && sidebar && btnToggleSidebar) {
    let btnCerrarSidebar = sidebar.querySelector(".sidebar-close-button");

    if (!btnCerrarSidebar) {
      btnCerrarSidebar = document.createElement("button");
      btnCerrarSidebar.id = "btnCerrarSidebar";
      btnCerrarSidebar.className = "sidebar-close-button";
      btnCerrarSidebar.type = "button";
      btnCerrarSidebar.setAttribute("aria-label", "Cerrar menu lateral");
      btnCerrarSidebar.textContent = "\u00d7";
      sidebar.appendChild(btnCerrarSidebar);
    }

    btnToggleSidebar.setAttribute("aria-label", "Abrir menu lateral");

    const actualizarEstadoSidebar = (colapsado) => {
      dashboardLayout.classList.toggle("sidebar-collapsed", colapsado);
      btnToggleSidebar.setAttribute("aria-expanded", String(!colapsado));
    };

    if (window.matchMedia("(max-width: 900px)").matches) {
      actualizarEstadoSidebar(true);
    } else {
      actualizarEstadoSidebar(dashboardLayout.classList.contains("sidebar-collapsed"));
    }

    btnToggleSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      actualizarEstadoSidebar(false);
    }, true);

    btnCerrarSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      actualizarEstadoSidebar(true);
    });
  }
});
