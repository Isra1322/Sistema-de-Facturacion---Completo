const token = localStorage.getItem("token") || sessionStorage.getItem("token");
const rol = localStorage.getItem("rol") || sessionStorage.getItem("rol");

const currentPage = window.location.pathname.split("/").pop();

// 🔹 Páginas públicas
const paginasPublicas = [
    "login.html"
];

// 🔹 Si NO hay token y no está en una página pública
if (!token && !paginasPublicas.includes(currentPage)) {

    const estaEnPages = window.location.pathname.includes("/pages/");

    window.location.href = estaEnPages
        ? "../pages/login.html"
        : "./pages/login.html";
}

// 🔹 Protección por rol
if (rol === "Vendedor") {

    const paginasBloqueadas = [
        "index.html",
        "",
        "clientes.html",
        "productos.html",
        "usuarios.html"
    ];

    if (paginasBloqueadas.includes(currentPage)) {

        alert("No tienes permiso para acceder a esta sección");

        const estaEnPages = window.location.pathname.includes("/pages/");

        window.location.href = estaEnPages
            ? "./factura.html"
            : "./pages/factura.html";
    }
}

// 🔹 Evitar volver al login si ya inició sesión
if (token && currentPage === "login.html") {

    const estaEnPages = window.location.pathname.includes("/pages/");

    window.location.href = estaEnPages
        ? "../index.html"
        : "./index.html";
}

// 🔹 Logout
const clavesSesion = [
    "token",
    "rol",
    "nombre",
    "usuario",
    "user",
    "idUsuario",
    "email",
    "correo"
];

function limpiarDatosSesion() {
    clavesSesion.forEach((clave) => sessionStorage.removeItem(clave));
    localStorage.clear();
    sessionStorage.clear();
}

function obtenerRutaLogin() {
    const estaEnPages = window.location.pathname.includes("/pages/");

    return estaEnPages
        ? "../pages/login.html"
        : "./pages/login.html";
}

function cerrarSesion() {
    limpiarDatosSesion();
    window.location.href = obtenerRutaLogin();
}

window.cerrarSesion = cerrarSesion;

const selectorLogout = ".topbar-logout, .home-logout, #btnLogout";

function prepararBotonLogout(boton) {
    boton.textContent = "Cerrar sesi\u00f3n";

    if (boton.tagName === "BUTTON") {
        boton.setAttribute("type", "button");
    }

    if (boton.tagName === "A") {
        boton.setAttribute("href", "#");
        boton.setAttribute("role", "button");
    }

    boton.dataset.logoutReady = "true";
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelectorAll(selectorLogout)
        .forEach((boton) => {
            prepararBotonLogout(boton);
        });

    document.body.addEventListener("click", (event) => {
        if (!event.target.closest) return;

        const logoutBtn = event.target.closest(".topbar-logout, #btnLogout");

        if (!logoutBtn) return;

        event.preventDefault();
        event.stopPropagation();
        cerrarSesion();
    });
});
