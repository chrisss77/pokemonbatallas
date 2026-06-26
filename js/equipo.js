// equipo.js
// Muestra equipos guardados (desde localStorage) y permite editar / eliminar.
// Respeta la estructura .team-list y las clases/IDs del HTML.

document.addEventListener("DOMContentLoaded", () => {
  const teamList = document.querySelector(".team-list");
  const filters = document.querySelectorAll(".filter");

  const STORAGE_KEY = "equipos";
  const FALLBACK_IMG = "../img/fallback.png";

  function obtenerEquipos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }

  function guardarEquipos(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function crearElementoEquipo(equipo, idx) {
    const wrapper = document.createElement("div");
    wrapper.className = "team";
    wrapper.dataset.index = idx;
    wrapper.dataset.name = equipo.nombreEquipo || `Equipo ${idx+1}`;

    // top row: title and action buttons (edit/delete) at top-right
    const topRow = document.createElement("div");
    topRow.style.display = "flex";
    topRow.style.justifyContent = "space-between";
    topRow.style.alignItems = "center";

    const title = document.createElement("h2");
    title.textContent = equipo.nombreEquipo || `Equipo ${idx+1}`;
    title.style.margin = "0";
    title.style.paddingRight = "8px";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.className = "btn-edit-equipo";
    editBtn.style.cursor = "pointer";

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "btn-delete-equipo";
    deleteBtn.style.cursor = "pointer";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    topRow.appendChild(title);
    topRow.appendChild(actions);

    wrapper.appendChild(topRow);

    // pokemon row
    const pokemonRow = document.createElement("div");
    pokemonRow.className = "pokemon-row";

    (equipo.pokemones || []).forEach(p => {
      const pokeDiv = document.createElement("div");
      pokeDiv.className = "pokemon";

      const img = document.createElement("img");
      img.src = p.img || FALLBACK_IMG;
      img.alt = p.name || p.nombre || "pokemon";
      img.style.width = "64px";
      img.style.height = "64px";
      img.style.objectFit = "contain";

      const nameP = document.createElement("p");
      nameP.className = "name";
      nameP.textContent = p.nickname || p.name || p.nombre || "Sin nombre";

      const nickP = document.createElement("p");
      nickP.className = "nickname";
      nickP.textContent = p.name || p.nombre || "";

      pokeDiv.appendChild(img);
      pokeDiv.appendChild(nameP);
      // optional: show species name below
      // pokeDiv.appendChild(nickP);

      pokemonRow.appendChild(pokeDiv);
    });

    wrapper.appendChild(pokemonRow);

    // bind actions
    editBtn.addEventListener("click", () => {
      // set equipoSeleccionado and redirect to creaPoke.html to edit
      localStorage.setItem("equipoSeleccionado", idx.toString());
      // open creador
      window.location.href = "./crearPoke.html";
    });

    deleteBtn.addEventListener("click", () => {
      if (!confirm(`¿Eliminar equipo "${equipo.nombreEquipo}"?`)) return;
      const arr = obtenerEquipos();
      arr.splice(idx, 1);
      guardarEquipos(arr);
      renderEquipos();
    });

    return wrapper;
  }

  function renderEquipos() {
    const arr = obtenerEquipos();
    if (!teamList) return;
    teamList.innerHTML = "";

    if (!arr || arr.length === 0) {
      teamList.innerHTML = `<p style="padding:20px;">No hay equipos guardados.</p>`;
      return;
    }

    arr.forEach((equipo, idx) => {
      const el = crearElementoEquipo(equipo, idx);
      teamList.appendChild(el);
    });
  }

  // Filtering handlers (if filters exist)
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      const key = btn.textContent.trim();
      let arr = obtenerEquipos();
      switch (key) {
        case "Creado":
          // assume each team may have fecha property; otherwise keep as is
          arr = arr.slice().sort((a,b) => {
            const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
            const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
            return fb - fa;
          });
          break;
        case "Nombre":
          arr = arr.slice().sort((a,b) => (a.nombreEquipo || "").localeCompare(b.nombreEquipo || ""));
          break;
        case "Generación":
          // if you have generation metadata, use it; default keep as is
          arr = arr.slice().sort((a,b) => 0);
          break;
      }
      // render sorted
      teamList.innerHTML = "";
      arr.forEach((equipo, idx) => teamList.appendChild(crearElementoEquipo(equipo, idx)));
    });
  });

  // init
  renderEquipos();
});
