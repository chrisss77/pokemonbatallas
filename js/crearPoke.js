// crearPoke.js
// Interfaz visual para crear/editar Pokémon en un equipo.
// Respeta IDs/clases del HTML (pokeInput, .img-top, #pokeInfo, .mov .text, .ajuste > div:nth-child(3) input.text, .btn-anadir, #floatingInputValue, etc.)

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://pokeapi.co/api/v2";

  // Elements from existing HTML
  const pokeInput = document.getElementById("pokeInput");
  const imgTop = document.querySelector(".img-top");
  const pokeInfoContainer = document.getElementById("pokeInfo");
  const moveInputs = Array.from(document.querySelectorAll(".mov .text"));
  const habilidadInputElement = document.querySelector(".ajuste > div:nth-child(3) input.text");
  const itemInputElement = document.querySelector(".ajuste > div:nth-child(2) input.text");
  const nicknameInputGlobal = document.getElementById("floatingInputValue"); // used as team name or nickname
  let addButton = document.querySelector(".btn-anadir");

  // Optional: ensure addButton exists
  if (!addButton) {
    addButton = document.createElement("button");
    addButton.className = "btn-anadir";
    addButton.textContent = "Añadir Pokémon";
    document.querySelector(".contenedor-boton-anadir")?.appendChild(addButton);
  }

  // Dynamic controls inserted but respecting existing layout (no changes to HTML files required)
  let levelInput = document.getElementById("js-level-input");
  let genderSelect = document.getElementById("js-gender-select");
  let shinyCheckbox = document.getElementById("js-shiny-checkbox");
  let equipoContainer = document.getElementById("equipoTemporal");
  let guardarEquipoBtn = document.getElementById("guardarEquipoBtn");

  // create controls if they don't exist
  if (!levelInput || !genderSelect || !shinyCheckbox || !equipoContainer || !guardarEquipoBtn) {
    // create container for extras (placed near add button)
    const extras = document.createElement("div");
    extras.id = "js-extras";
    extras.style.display = "flex";
    extras.style.alignItems = "center";
    extras.style.gap = "8px";
    extras.style.marginTop = "10px";

    // level
    levelInput = document.createElement("input");
    levelInput.id = "js-level-input";
    levelInput.type = "number";
    levelInput.min = "1";
    levelInput.max = "100";
    levelInput.value = "50";
    levelInput.style.width = "72px";

    // gender
    genderSelect = document.createElement("select");
    genderSelect.id = "js-gender-select";
    ["Macho", "Hembra", "Sin género"].forEach(g => {
      const o = document.createElement("option");
      o.value = g;
      o.textContent = g;
      genderSelect.appendChild(o);
    });

    // shiny
    shinyCheckbox = document.createElement("input");
    shinyCheckbox.id = "js-shiny-checkbox";
    shinyCheckbox.type = "checkbox";
    const shinyLabel = document.createElement("label");
    shinyLabel.style.display = "flex";
    shinyLabel.style.alignItems = "center";
    shinyLabel.style.gap = "6px";
    shinyLabel.appendChild(shinyCheckbox);
    shinyLabel.appendChild(document.createTextNode("Shiny"));

    // equipo container
    equipoContainer = document.createElement("div");
    equipoContainer.id = "equipoTemporal";
    equipoContainer.className = "team-temp-container";
    equipoContainer.style.marginTop = "12px";

    // guardar equipo
    guardarEquipoBtn = document.createElement("button");
    guardarEquipoBtn.id = "guardarEquipoBtn";
    guardarEquipoBtn.textContent = "Guardar equipo";
    guardarEquipoBtn.className = "btn-guardar";
    guardarEquipoBtn.disabled = true;

    extras.appendChild(document.createTextNode("Nivel:"));
    extras.appendChild(levelInput);
    extras.appendChild(document.createTextNode("Género:"));
    extras.appendChild(genderSelect);
    extras.appendChild(shinyLabel);
    extras.appendChild(guardarEquipoBtn);

    // place extras near add button or at bottom of form
    if (addButton && addButton.parentElement) addButton.parentElement.insertBefore(extras, addButton);
    else document.querySelector(".card")?.appendChild(extras);

    // append team container near pokeInfo or card
    if (pokeInfoContainer && pokeInfoContainer.parentElement) {
      pokeInfoContainer.parentElement.insertBefore(equipoContainer, pokeInfoContainer.nextSibling);
    } else {
      document.querySelector(".card")?.appendChild(equipoContainer);
    }
  }

  // runtime state
  let debounceTimer = null;
  let currentPokemonData = null; // latest fetched pokemon data from API
  let itemsListCache = null;
  let equipoTemporal = []; // holds pokes for the team being built
  let editTeamIndex = localStorage.getItem("equipoSeleccionado"); // if navigation from equipo to edit
  // when editing a team, we may also have editTeamMode true
  let editTeamMode = (editTeamIndex !== null && editTeamIndex !== undefined);

  // Helper: safe image getter
  function getPokemonImage(data) {
    if (!data) return "../img/fallback.png";
    return (
      data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      data.sprites?.other?.home?.front_default ||
      "../img/fallback.png"
    );
  }

  // Helper: fetch pokemon by name
  async function fetchPokemon(name) {
    try {
      const resp = await fetch(`${API_BASE}/pokemon/${name.toLowerCase()}`);
      if (!resp.ok) throw new Error("not found");
      const json = await resp.json();
      return json;
    } catch (e) {
      return null;
    }
  }

  // Helper: fetch items list (cached)
  async function fetchItemsList() {
    if (itemsListCache) return itemsListCache;
    try {
      const resp = await fetch(`${API_BASE}/item?limit=1000`);
      const json = await resp.json();
      itemsListCache = json.results.map(r => r.name);
      return itemsListCache;
    } catch (e) {
      itemsListCache = [];
      return itemsListCache;
    }
  }

  // Render sprite + stats
  function renderSpriteAndStats(pokemonData) {
    if (!pokemonData) {
      if (imgTop) imgTop.src = "../img/fallback.png";
      if (pokeInfoContainer) pokeInfoContainer.innerHTML = `<p style="color:red;">Pokémon no encontrado</p>`;
      return;
    }

    const imgSrc = getPokemonImage(pokemonData);
    if (imgTop) { imgTop.src = imgSrc; imgTop.alt = pokemonData.name; }

    // render stats
    if (pokeInfoContainer) {
      pokeInfoContainer.innerHTML = `
        <section class="stats">
          ${pokemonData.stats.map(s => {
            const width = Math.min(Math.ceil(s.base_stat / 10) * 10, 100);
            const color = s.base_stat < 50 ? '#FF4C4C' : s.base_stat < 100 ? '#FFCE4C' : '#4CAF50';
            return `
              <div class="stat-container">
                <span class="stat-name">${s.stat.name}</span>
                <div class="stat-bar-background">
                  <div class="stat-bar" style="width:${width}%; background-color:${color}"></div>
                </div>
                <span class="stat-value">${s.base_stat}</span>
              </div>
            `;
          }).join("")}
        </section>
      `;
    }
  }

  // show move suggestions (we will attach simple dropdowns to move inputs)
  function prepareMoveSuggestionsFor(pokemonData) {
    const moveNames = pokemonData ? pokemonData.moves.map(m => m.move.name) : [];
    moveInputs.forEach(mi => {
      // on focus: show list
      mi.addEventListener("focus", () => {
        openSuggestions(mi, moveNames, (picked) => mi.value = picked.replace(/-/g, " "));
      });
      mi.addEventListener("input", (ev) => {
        const q = ev.target.value.toLowerCase().trim();
        const filtered = moveNames.filter(n => n.includes(q)).slice(0, 200);
        // refresh dropdown
        openSuggestions(mi, filtered, (picked) => mi.value = picked.replace(/-/g, " "));
      });
      mi.addEventListener("blur", () => {
        setTimeout(() => closeSuggestions(mi), 150);
      });
    });
  }

  // prepare ability suggestions
  function prepareAbilitySuggestionsFor(pokemonData) {
    const abNames = pokemonData ? pokemonData.abilities.map(a => a.ability.name) : [];
    if (!habilidadInputElement) return;
    habilidadInputElement.addEventListener("focus", () => {
      openSuggestions(habilidadInputElement, abNames, (picked) => habilidadInputElement.value = picked.replace(/-/g, " "));
    });
    habilidadInputElement.addEventListener("input", (ev) => {
      const q = ev.target.value.toLowerCase().trim();
      const filtered = abNames.filter(n => n.includes(q)).slice(0, 200);
      openSuggestions(habilidadInputElement, filtered, (picked) => habilidadInputElement.value = picked.replace(/-/g, " "));
    });
    habilidadInputElement.addEventListener("blur", () => {
      setTimeout(() => closeSuggestions(habilidadInputElement), 150);
    });
  }

  // prepare item suggestions
  async function prepareItemSuggestions() {
    if (!itemInputElement) return;
    const items = await fetchItemsList();
    itemInputElement.addEventListener("focus", () => {
      openSuggestions(itemInputElement, items.slice(0, 200), (picked) => itemInputElement.value = picked.replace(/-/g, " "));
    });
    itemInputElement.addEventListener("input", (ev) => {
      const q = ev.target.value.toLowerCase().trim();
      const filtered = items.filter(n => n.includes(q)).slice(0, 200);
      openSuggestions(itemInputElement, filtered, (picked) => itemInputElement.value = picked.replace(/-/g, " "));
    });
    itemInputElement.addEventListener("blur", () => {
      setTimeout(() => closeSuggestions(itemInputElement), 150);
    });
  }

  // suggestion dropdown handling
  function openSuggestions(targetEl, items, onChoose) {
    closeSuggestions(targetEl);
    const dropdown = document.createElement("div");
    dropdown.className = "js-suggest-dropdown";
    dropdown.style.position = "absolute";
    dropdown.style.background = "#fff";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.borderRadius = "6px";
    dropdown.style.zIndex = 9999;
    dropdown.style.maxHeight = "220px";
    dropdown.style.overflowY = "auto";
    dropdown.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
    dropdown.style.padding = "6px";
    const rect = targetEl.getBoundingClientRect();
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
    dropdown.style.minWidth = `${Math.max(rect.width, 200)}px`;

    items.slice(0, 250).forEach(it => {
      const itemEl = document.createElement("div");
      itemEl.className = "js-suggest-item";
      itemEl.style.padding = "6px";
      itemEl.style.cursor = "pointer";
      itemEl.style.borderRadius = "6px";
      itemEl.textContent = it;
      itemEl.addEventListener("click", () => {
        onChoose(it);
        closeSuggestions(targetEl);
      });
      dropdown.appendChild(itemEl);
    });

    document.body.appendChild(dropdown);
    targetEl._dropdown = dropdown;
  }

  function closeSuggestions(targetEl) {
    if (targetEl && targetEl._dropdown) {
      try { targetEl._dropdown.remove(); } catch (e) {}
      targetEl._dropdown = null;
    }
  }

  // Render equipo temporal
  function renderEquipoTemporal() {
    equipoContainer.innerHTML = "";
    equipoTemporal.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "mini-pokemon";
      card.innerHTML = `
        <button class="remove-poke" data-index="${idx}" title="Eliminar" style="position:absolute;right:6px;top:6px;background:#ff5b5b;color:#fff;border:none;border-radius:6px;padding:3px 6px;cursor:pointer;">X</button>
        <img src="${p.img || '../img/fallback.png'}" alt="${p.name}" />
        <div style="font-weight:bold;margin-top:6px;">${p.nickname || p.name}</div>
        <div style="font-size:12px;color:#444;">Lv ${p.level} ${p.shiny ? '✨' : ''}</div>
      `;
      equipoContainer.appendChild(card);
    });

    // bind remove
    equipoContainer.querySelectorAll(".remove-poke").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        const idx = parseInt(ev.target.getAttribute("data-index"));
        equipoTemporal.splice(idx, 1);
        renderEquipoTemporal();
        guardarEquipoBtnState();
      });
    });

    guardarEquipoBtnState();
  }

  function guardarEquipoBtnState() {
    guardarEquipoBtn.disabled = equipoTemporal.length === 0;
  }

  // When user types pokemon name
  if (pokeInput) {
    pokeInput.addEventListener("input", () => {
      const q = pokeInput.value.trim();
      clearTimeout(debounceTimer);
      if (!q) {
        currentPokemonData = null;
        if (imgTop) imgTop.src = "../img/fallback.png";
        if (pokeInfoContainer) pokeInfoContainer.innerHTML = "";
        return;
      }
      debounceTimer = setTimeout(async () => {
        const data = await fetchPokemon(q);
        if (!data) {
          currentPokemonData = null;
          if (pokeInfoContainer) pokeInfoContainer.innerHTML = `<p style="color:red;">No se encontró ${q}</p>`;
          if (imgTop) imgTop.src = "../img/fallback.png";
          return;
        }
        currentPokemonData = data;
        renderSpriteAndStats(data);
        // populate first few move inputs with defaults (if present)
        moveInputs.forEach((mi, i) => mi.value = (data.moves[i] && data.moves[i].move.name) ? data.moves[i].move.name : "");

        // attach suggestions using current data
        prepareMoveSuggestionsFor(data);
        prepareAbilitySuggestionsFor(data);
        prepareItemSuggestions();
      }, 420);
    });
  }

  // Add Pokemon to team
  addButton.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (!currentPokemonData) {
      alert("Primero seleccioná un Pokémon válido en el campo de búsqueda.");
      return;
    }
    if (equipoTemporal.length >= 6) {
      alert("El equipo ya tiene 6 Pokémon.");
      return;
    }

    const name = currentPokemonData.name;
    const nickname = (nicknameInputGlobal && nicknameInputGlobal.value.trim()) ? nicknameInputGlobal.value.trim() : name;
    const level = parseInt(levelInput.value, 10) || 50;
    const gender = genderSelect.value || "Desconocido";
    const shiny = shinyCheckbox.checked;
    const item = (itemInputElement && itemInputElement.value) ? itemInputElement.value : "";
    const ability = (habilidadInputElement && habilidadInputElement.value) ? habilidadInputElement.value : (currentPokemonData.abilities[0]?.ability?.name || "");
    const moves = moveInputs.map(mi => mi.value).filter(Boolean);

    const img = getPokemonImage(currentPokemonData);

    const pokeObj = {
      name,
      nickname,
      level,
      genero: gender,
      shiny,
      item,
      ability,
      moves,
      img
    };

    equipoTemporal.push(pokeObj);
    renderEquipoTemporal();

    // reset small parts (keep nickname input as team-name maybe)
    pokeInput.value = "";
    currentPokemonData = null;
    if (imgTop) imgTop.src = "../img/fallback.png";
    if (pokeInfoContainer) pokeInfoContainer.innerHTML = "";
    // clear move inputs
    moveInputs.forEach(mi => mi.value = "");
    if (habilidadInputElement) habilidadInputElement.value = "";
    if (itemInputElement) itemInputElement.value = "";
    // close suggestions
    moveInputs.forEach(mi => closeSuggestions(mi));
    if (habilidadInputElement) closeSuggestions(habilidadInputElement);
    if (itemInputElement) closeSuggestions(itemInputElement);
  });

  // Save team to localStorage (multiple teams allowed, by name)
  guardarEquipoBtn.addEventListener("click", () => {
    if (equipoTemporal.length === 0) {
      alert("No hay Pokémon en el equipo para guardar.");
      return;
    }
    // team name: use floatingInputValue input as team name if provided, otherwise ask
    const teamName = (nicknameInputGlobal && nicknameInputGlobal.value.trim()) ? nicknameInputGlobal.value.trim() : (prompt("Ingrese nombre del equipo:") || `Equipo ${new Date().toLocaleString()}`);

    const stored = JSON.parse(localStorage.getItem("equipos") || "[]");
    // check if a team with the same name exists: if editTeamMode and selected index is provided, update that; else if found by name, update; else push new
    if (editTeamMode && editTeamIndex !== null && editTeamIndex !== undefined) {
      // update by index
      stored[editTeamIndex] = { nombreEquipo: teamName, pokemones: equipoTemporal.slice() };
    } else {
      // if name exists -> update, else push
      const existingIdx = stored.findIndex(e => e.nombreEquipo === teamName);
      if (existingIdx >= 0) {
        stored[existingIdx].pokemones = equipoTemporal.slice();
      } else {
        stored.push({ nombreEquipo: teamName, pokemones: equipoTemporal.slice() });
      }
    }
    localStorage.setItem("equipos", JSON.stringify(stored));
    alert(`Equipo "${teamName}" guardado correctamente.`);
    // reset temporal
    equipoTemporal = [];
    renderEquipoTemporal();
    // optionally redirect back to equipo.html:
    window.location.href = "../pags/equipo.html";
  });

  // If user arrived to editar (equipoSeleccionado set), load that team's pokes to temporal
  (function tryLoadSelectedTeamOnOpen() {
    const idxStr = localStorage.getItem("equipoSeleccionado");
    if (idxStr !== null && idxStr !== undefined) {
      const idx = parseInt(idxStr);
      const stored = JSON.parse(localStorage.getItem("equipos") || "[]");
      if (stored && stored[idx]) {
        const team = stored[idx];
        // load into equipoTemporal
        equipoTemporal = team.pokemones.map(p => Object.assign({}, p));
        renderEquipoTemporal();
        // optionally show team name in floatingInputValue
        if (nicknameInputGlobal) nicknameInputGlobal.value = team.nombreEquipo || "";
        // remove the key so future loads aren't accidental
        // but keep it if you want continuous edit: comment next line to keep
        // localStorage.removeItem("equipoSeleccionado");
      }
    }
  })();

  // final: make sure guardar button state correct initially
  guardarEquipoBtnState();
});

// =========================
// SISTEMA DE MENÚ DE MOVIMIENTOS
// =========================

let moveMenu, filterPanel;
let currentMoveInput = null;
let allMovesData = []; // almacenará los movimientos con detalles

// Crear el menú si no existe
function ensureMoveMenu() {
  if (!moveMenu) {
    moveMenu = document.createElement("div");
    moveMenu.classList.add("move-menu");
    moveMenu.innerHTML = `
      <div class="move-menu-header">
        <span>Movimientos disponibles</span>
        <button id="filterToggleBtn">Filtrar</button>
      </div>
      <div id="moveListContainer"></div>
    `;
    document.body.appendChild(moveMenu);
  }

  if (!filterPanel) {
    filterPanel = document.createElement("div");
    filterPanel.classList.add("filter-panel");
    filterPanel.innerHTML = `
      <h4>Filtros</h4>
      <label>Tipo:</label>
      <select id="filterType">
        <option value="">Todos</option>
      </select>

      <label>Categoría:</label>
      <select id="filterCategory">
        <option value="">Todas</option>
        <option value="physical">Físico</option>
        <option value="special">Especial</option>
        <option value="status">Estado</option>
      </select>

      <label>Potencia mínima:</label>
      <input type="number" id="filterPower" min="0" placeholder="Ej: 60">

      <label>Precisión mínima:</label>
      <input type="number" id="filterAcc" min="0" placeholder="Ej: 90">

      <label>PP mínimo:</label>
      <input type="number" id="filterPP" min="0" placeholder="Ej: 10">

      <button id="applyFiltersBtn">Aplicar filtros</button>
      <button id="closeFiltersBtn">Cerrar</button>
    `;
    document.body.appendChild(filterPanel);
  }

  // Eventos de botones
  document.getElementById("filterToggleBtn").onclick = () => {
    filterPanel.classList.toggle("show");
  };
  document.getElementById("closeFiltersBtn").onclick = () => {
    filterPanel.classList.remove("show");
  };
  document.getElementById("applyFiltersBtn").onclick = applyMoveFilters;
}

// Mostrar menú con movimientos del Pokémon actual
async function openMoveMenu(inputEl, moves) {
  ensureMoveMenu();
  currentMoveInput = inputEl;

  const rect = inputEl.getBoundingClientRect();
  moveMenu.style.display = "block";
  moveMenu.style.top = `${rect.bottom + window.scrollY + 5}px`;
  moveMenu.style.left = `${rect.left}px`;

  const container = document.getElementById("moveListContainer");
  container.innerHTML = `<p>Cargando movimientos...</p>`;

  // Cargar detalles si no están cargados
  if (allMovesData.length === 0) {
    allMovesData = await fetchMoveDetails(moves);
  }

  renderMoveList(allMovesData);
}

// Obtener detalles de cada movimiento desde la API
async function fetchMoveDetails(moves) {
  const moveData = [];
  for (let i = 0; i < Math.min(moves.length, 100); i++) {
    const move = moves[i].move;
    try {
      const res = await fetch(move.url);
      const data = await res.json();
      moveData.push({
        name: data.name,
        type: data.type.name,
        category: data.damage_class.name,
        power: data.power,
        pp: data.pp,
        accuracy: data.accuracy,
        desc: data.flavor_text_entries?.find(e => e.language.name === "en")?.flavor_text || "Sin descripción"
      });
    } catch (e) {
      console.warn("Error cargando move:", move.name);
    }
  }
  fillTypeFilterOptions(moveData);
  return moveData;
}

// Mostrar lista de movimientos
function renderMoveList(moves) {
  const container = document.getElementById("moveListContainer");
  container.innerHTML = "";

  moves.forEach(m => {
    const div = document.createElement("div");
    div.classList.add("move-card");
    div.innerHTML = `
      <div class="move-card-header">
        <span class="move-name">${m.name}</span>
        <span class="move-type ${m.type}">${m.type}</span>
        <span class="move-cat ${m.category}">${m.category}</span>
      </div>
      <div class="move-card-stats">
        <span>${m.power || "-"} BP</span> |
        <span>${m.accuracy || "-"}%</span> |
        <span>${m.pp || "-"} PP</span>
      </div>
      <p class="move-desc">${m.desc}</p>
    `;
    div.onclick = () => selectMove(m.name);
    container.appendChild(div);
  });
}

// Llenar opciones de tipo
function fillTypeFilterOptions(moves) {
  const uniqueTypes = [...new Set(moves.map(m => m.type))];
  const select = document.getElementById("filterType");
  select.innerHTML = `<option value="">Todos</option>` + uniqueTypes.map(t => `<option value="${t}">${t}</option>`).join("");
}

// Aplicar filtros
function applyMoveFilters() {
  const type = document.getElementById("filterType").value;
  const cat = document.getElementById("filterCategory").value;
  const power = parseInt(document.getElementById("filterPower").value) || 0;
  const acc = parseInt(document.getElementById("filterAcc").value) || 0;
  const pp = parseInt(document.getElementById("filterPP").value) || 0;

  const filtered = allMovesData.filter(m => {
    return (!type || m.type === type) &&
           (!cat || m.category === cat) &&
           (!m.power || m.power >= power) &&
           (!m.accuracy || m.accuracy >= acc) &&
           (!m.pp || m.pp >= pp);
  });

  renderMoveList(filtered);
}

// Cerrar menú
function selectMove(name) {
  if (currentMoveInput) currentMoveInput.value = name;
  moveMenu.style.display = "none";
  filterPanel.classList.remove("show");
}

// Cerrar si se hace clic afuera
document.addEventListener("click", e => {
  if (moveMenu && !moveMenu.contains(e.target) && !e.target.classList.contains("text")) {
    moveMenu.style.display = "none";
    filterPanel.classList.remove("show");
  }
});

// Detectar focus en inputs de movimientos
document.querySelectorAll(".mov .text").forEach(input => {
  input.addEventListener("focus", () => {
    if (window.currentPokemonData) {
      openMoveMenu(input, window.currentPokemonData.moves);
    }
  });
});
