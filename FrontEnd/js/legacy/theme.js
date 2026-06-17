(() => {
  const STORAGE_KEY = "theme";
  const DARK_CLASS = "dark-mode";

  const getSavedTheme = () => localStorage.getItem(STORAGE_KEY);
  const isDarkTheme = () => document.body.classList.contains(DARK_CLASS);

  const applyTheme = theme => {
    document.body.classList.toggle(DARK_CLASS, theme === "dark");
  };

  const updateButton = button => {
    if (!button) return;

    button.textContent = isDarkTheme() ? "☀️" : "🌙";
    button.setAttribute(
      "aria-label",
      isDarkTheme() ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
    button.title = isDarkTheme() ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  };

  const inicializarTema = () => {
    applyTheme(getSavedTheme());

    const button = document.getElementById("btnToggleTheme");
    updateButton(button);

    if (!button || button.dataset.themeReady === "true") return;

    button.dataset.themeReady = "true";
    button.addEventListener("click", () => {
      const nextTheme = isDarkTheme() ? "light" : "dark";

      applyTheme(nextTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
      updateButton(button);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarTema);
  } else {
    inicializarTema();
  }
})();
