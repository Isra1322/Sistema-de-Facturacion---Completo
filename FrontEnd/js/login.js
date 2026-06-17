const API_URL = "http://localhost:5161/api/Auth/login";

const form = document.getElementById("loginForm");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");
const LOGIN_ERROR_MESSAGE = "Correo o contrase\u00f1a incorrectos";

// 👁️ Funcionalidad para mostrar/ocultar contraseña
if (togglePassword) {
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        // Alternar iconos
        eyeOpen.classList.toggle("hidden");
        eyeClosed.classList.toggle("hidden");
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                password
            })
        });

        if (!response.ok) {
            const mensaje = await obtenerMensajeErrorLogin(response);
            mostrarToastLogin(mensaje || LOGIN_ERROR_MESSAGE, "error");
            return;
        }

        const data = await response.json();

        // 🔹 Guardar sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("nombre", data.nombre);

        // 🔹 Redireccionar
        window.location.href = "index.html";

    } catch (error) {

        console.error(error);
        mostrarToastLogin("Error al iniciar sesi\u00f3n", "error");

    }
});

function mostrarToastLogin(mensaje, tipo = "error") {
    const mensajeNormalizado = String(mensaje || "").trim();
    const toastExistente = Array.from(document.querySelectorAll(".toast .toast-message"))
        .some(toastMensaje => toastMensaje.textContent.trim() === mensajeNormalizado);

    if (toastExistente) return;

    mostrarToast(mensajeNormalizado, tipo);
}

async function obtenerMensajeErrorLogin(response) {
    try {
        const data = await response.json();
        return data.mensaje || data.error || "";
    } catch (error) {
        return "";
    }
}
