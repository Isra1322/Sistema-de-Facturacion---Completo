(function () {
  function renderizarPaginacionNumerica(opciones) {
    const {
      contenedor,
      textoElemento,
      paginaActual,
      totalPaginas,
      modoTodos,
      estadoDentro = false
    } = opciones;

    if (textoElemento) {
      textoElemento.textContent = modoTodos
        ? "Mostrando todos los registros"
        : `Página ${paginaActual} de ${totalPaginas}`;
    }

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const destino = estadoDentro ? document.createElement("div") : contenedor;

    if (estadoDentro) {
      destino.className = "pagination-pages";
    }

    const elementos = obtenerElementosPaginacion(paginaActual, totalPaginas);
    destino.appendChild(crearBotonPaginacion("Anterior", "prev", {
      disabled: modoTodos || paginaActual <= 1
    }));

    elementos.forEach(elemento => {
      if (elemento === "...") {
        const puntos = document.createElement("span");
        puntos.className = "pagination-ellipsis";
        puntos.textContent = "...";
        destino.appendChild(puntos);
        return;
      }

      destino.appendChild(crearBotonPaginacion(elemento, "page", {
        page: elemento,
        active: !modoTodos && elemento === paginaActual
      }));
    });

    destino.appendChild(crearBotonPaginacion("Siguiente", "next", {
      disabled: modoTodos || paginaActual >= totalPaginas
    }));
    destino.appendChild(crearBotonPaginacion("Todos", "all", {
      active: modoTodos
    }));

    if (estadoDentro) {
      contenedor.appendChild(destino);
      contenedor.appendChild(textoElemento);
    }
  }

  function crearBotonPaginacion(texto, accion, opciones = {}) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "pagination-button";
    boton.dataset.pageAction = accion;
    boton.textContent = texto;

    if (opciones.page) boton.dataset.page = opciones.page;
    if (opciones.active) boton.classList.add("active");
    if (opciones.disabled) boton.disabled = true;

    return boton;
  }

  function obtenerElementosPaginacion(pagina, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const paginas = new Set([1, total]);
    const inicio = Math.max(2, pagina - 1);
    const fin = Math.min(total - 1, pagina + 1);

    if (pagina <= 4) {
      for (let i = 2; i <= 5; i++) paginas.add(i);
    } else if (pagina >= total - 3) {
      for (let i = total - 4; i <= total - 1; i++) paginas.add(i);
    } else {
      for (let i = inicio; i <= fin; i++) paginas.add(i);
    }

    const ordenadas = [...paginas].sort((a, b) => a - b);
    const elementos = [];

    ordenadas.forEach((numero, index) => {
      if (index > 0 && numero - ordenadas[index - 1] > 1) {
        elementos.push("...");
      }

      elementos.push(numero);
    });

    return elementos;
  }

  window.renderizarPaginacionNumerica = renderizarPaginacionNumerica;
})();
