const listContainer = document.getElementById('pokeLista');
const detailContainer = document.getElementById('Detalle');
const moreBtn = document.getElementById('loadMoreBtn');

// 📌 Lista de creadores
const creadores = {
  juan: {
    nombre: "Juan Facundo Sárate Alonso",
    foto: "../img/juan.jpg",
    redes: {
      github: "https://github.com/juan",
      twitter: "https://twitter.com/juan",
      instagram: "https://instagram.com/juan"
    }
  },
  christian: {
    nombre: "Christian Sharon Ramos Alarcón",
    foto: "../img/Christian.png",
    redes: {
      github: "https://github.com/christian",
      twitter: "https://twitter.com/christian",
      instagram: "https://instagram.com/chrisswaak"
    }
  },
  thiago: {
    nombre: "Thiago Paul Troncoso Laranga",
    foto: "../img/thiago.jpg",
    redes: {
      github: "https://github.com/thiago",
      twitter: "https://twitter.com/thiago",
      instagram: "https://instagram.com/thiago"
    }
  },
  lucas: {
    nombre: "Lucas Valentín Cazal Ledesma",
    foto: "../img/lucas.jpg",
    redes: {
      github: "https://github.com/lucas",
      twitter: "https://twitter.com/lucas",
      instagram: "https://instagram.com/luucaasss7.__"
    }
  },
  ariel: {
    nombre: "Ariel Jose Garcia",
    foto: "../img/easterEgg.webp",
    redes: {
      github: "https://github.com/ariel",
      twitter: "https://twitter.com/ariel",
      instagram: "https://instagram.com/ariel"
    }
  },
  thiahot: {
    nombre: "Aquel que mora",
    foto: "img/easterEgg.webp"
  },
  agustina: {
    nombre: "Agustina Centeno",
    foto: "../img/easterEgg.webp",
    redes: {
      github: "https://github.com/ariel",
      twitter: "https://twitter.com/ariel",
      instagram: "https://instagram.com/ariel"
    }

  }
}
// 📝 Variables de control para la carga de más Pokémon
let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100'; // Inicializa con los primeros 100 Pokémon
let loadedPokemon = 0; // Contador de los Pokémon ya cargados

// 📌 Cargar Pokémon
async function cargarPokemon() {
  try {
    const res = await fetch(nextUrl);
    const data = await res.json();
    const pokemons = data.results;

    for (const poke of pokemons) {
      const pokeRes = await fetch(poke.url);
      const pokeData = await pokeRes.json();

      // 🎨 Asignar color de borde según el tipo principal del Pokémon
const tipoPrincipal = pokeData.types?.[0]?.type?.name || "normal";
const coloresTipo = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0",
  electric: "#F7D02C", grass: "#7AC74C", ice: "#96D9D6",
  fighting: "#C22E28", poison: "#A33EA1", ground: "#E2BF65",
  flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC",
  dark: "#705746", steel: "#B7B7CE", fairy: "#D685AD"
};

// Crear item en la lista con borde de color según tipo
const div = document.createElement('div');
div.className = 'pokeCard';
div.style.border = `4px solid ${coloresTipo[tipoPrincipal] || "#ccc"}`; // 👈 Borde completo
div.style.borderRadius = "12px"; // Opcional para suavizar las esquinas

div.innerHTML = `
  <img src="${pokeData.sprites.front_default}" alt="${pokeData.name}" />
  <div>${pokeData.name}</div>
`;
div.addEventListener('click', () => mostrarDetalle(pokeData));
listContainer.appendChild(div);

      div.addEventListener('click', () => mostrarDetalle(pokeData));
      listContainer.appendChild(div);
    }

    // Actualizar URL para cargar los siguientes 50 Pokémon
    nextUrl = data.next; // La API devuelve el URL de la siguiente página de Pokémon

    // Si no hay más Pokémon, deshabilitamos el botón "Mostrar más"
    if (!nextUrl) {
      moreBtn.disabled = true;
      moreBtn.textContent = "No hay más Pokémon";
    }

    loadedPokemon += pokemons.length; // Actualiza el contador de Pokémon cargados
  } catch (error) {
    console.error('Error cargando Pokémon:', error);
    listContainer.innerHTML = '<p>Error al cargar la lista de Pokémon.</p>';
  }
}

// 📌 Mostrar detalles del Pokémon
async function mostrarDetalle(pokemon) {
  detailContainer.innerHTML = `
    <div class="detalle-card">
      <h2>${pokemon.name.toUpperCase()} (ID: ${pokemon.id})</h2>
      <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" />
      
      <div class="tipos">
        <strong>Tipos:</strong>
        <div class="tipo-lista">
          ${pokemon.types.map(t => `
            <div class="tipo ${t.type.name}">${t.type.name}</div>
          `).join('')}
        </div>
      </div>

      <div class="habilidades">
        <h3>Habilidades</h3>
        <div class="habilidad-lista">
          ${pokemon.abilities.map(a => `
            <div class="habilidad">${a.ability.name}${a.is_hidden ? " (Oculta)" : ""}</div>
          `).join('')}
        </div>
      </div>
      
      <section class="stats">
        <h3>Stats</h3>
        ${pokemon.stats.map(s => {
          const width = Math.min(Math.ceil(s.base_stat / 10) * 10, 100);
          let color;
          if (s.base_stat < 50) color = '#FF4C4C';
          else if (s.base_stat < 100) color = '#FFCE4C';
          else color = '#4CAF50';
          return `
          <div class="stat-container">
            <span class="stat-name">${s.stat.name}</span>
            <div class="stat-bar-background">
              <div class="stat-bar" style="width:${width}%; background-color:${color}"></div>
            </div>
            <span class="stat-value">${s.base_stat}</span>
          </div>
          `;
        }).join('')}
      </section>
      
      <div class="ataques">
        <button id="toggleAtaques">Mostrar ataques</button>
        <div id="listaAtaques" class="oculto"></div>
      </div>
    </div>
  `;

  // 📌 Scroll suave hacia el detalle
  detailContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Toggle ataques
  const btnAtaques = document.getElementById("toggleAtaques");
  const listaAtaques = document.getElementById("listaAtaques");

  listaAtaques.innerHTML = '';
  listaAtaques.classList.remove('visible');

  let loaded = false; 

  btnAtaques.addEventListener("click", async () => {
    if (!loaded) {
      const movesLimit = pokemon.moves.slice(0, 100);
      const movesData = await Promise.all(
        movesLimit.map(async m => {
          const res = await fetch(m.move.url);
          const data = await res.json();
          return { name: m.move.name, type: data.type.name };
        })
      );

      listaAtaques.innerHTML = movesData.map(m => `
        <div class="ataque ${m.type}" id="ataque">${m.name}</div>
      `).join('');

      loaded = true;
    }

    listaAtaques.classList.toggle("visible");
    btnAtaques.textContent = listaAtaques.classList.contains("visible") ? "Ocultar ataques" : "Mostrar ataques";
  });
}

// Evento de carga de más Pokémon
moreBtn.addEventListener('click', cargarPokemon);

// Inicializar la carga inicial
cargarPokemon();

// ✅ Función para mostrar detalle de un creador
function mostrarCreador(creador) {
  detailContainer.innerHTML = `
    <div class="detalle-card creador-card">
      <h2>${creador.nombre}</h2>
      <img src="${creador.foto}" alt="${creador.nombre}" class="foto-creador"/>
      <div class="redes">
        <a href="${creador.redes.github}" target="_blank">GitHub</a>
        <a href="${creador.redes.twitter}" target="_blank">Twitter</a>
        <a href="${creador.redes.instagram}" target="_blank">Instagram</a>
      </div>
    </div>
  `;
  detailContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 🔍 Evento del buscador
const searchInput = document.getElementById('pokeBusqueda');
const searchBtn = document.getElementById('searchBtn');

// ==================== AUTOCOMPLETADO (versión mejorada) ====================

let allPokemonNames = [];
const suggestionsList = document.getElementById("suggestions");

// 🔹 Cargar todos los nombres de Pokémon (sin los easter eggs)
async function fetchAllPokemonNames() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
    const data = await res.json();
    allPokemonNames = data.results.map(p => p.name.toLowerCase());
  } catch (err) {
    console.error("Error cargando nombres de Pokémon:", err);
  }
}
fetchAllPokemonNames();

// 🔹 Mostrar sugerencias al escribir
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  suggestionsList.innerHTML = "";

  // Si no hay texto, ocultamos el menú
  if (!query || query.length < 2) {
    suggestionsList.style.display = "none";
    return;
  }

  // Ignorar guiones en nombres de Pokémon
  const normalizedQuery = query.replace(/[-_]/g, "");

  const filtered = allPokemonNames
    .filter(name => name.replace(/[-_]/g, "").includes(normalizedQuery))
    .slice(0, 10);

  // Si no hay coincidencias, no mostrar nada
  if (filtered.length === 0) {
    suggestionsList.style.display = "none";
    return;
  }

  filtered.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => {
      searchInput.value = name;
      suggestionsList.innerHTML = "";
      suggestionsList.style.display = "none";
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.style.display = "block";
});

// 🔹 Ocultar menú al hacer clic fuera del contenedor
document.addEventListener("click", e => {
  if (!e.target.closest(".search-container")) {
    suggestionsList.innerHTML = "";
    suggestionsList.style.display = "none";
  }
});

// Verificar que los elementos existan antes de añadir eventos
if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', async () => {
    const name = searchInput.value.toLowerCase().trim();

    if (!name) return;  // Si el campo está vacío, no hacer nada

    // Verificar si el nombre coincide con un creador
    if (creadores[name]) {
      mostrarCreador(creadores[name]);
      return;
    }

    // Si no es un creador, buscar un Pokémon
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) {
        throw new Error('Pokémon no encontrado');
      }
      const pokemon = await res.json();
      mostrarDetalle(pokemon);
    } catch (error) {
      detailContainer.innerHTML = `<h2>No se encontró "${name}".</h2>`;
    }
  });

  // Permitir Enter como búsqueda también
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });
} else {
  console.error("El botón o el input de búsqueda no están presentes.");
}
