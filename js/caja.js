document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      const filter = btn.textContent.trim();

      const container = document.querySelector(".cajaPokemon");
      const cards = Array.from(container.querySelectorAll(".tarjetaPokemon"));

      let sortedCards;

      switch (filter) {
        case "Creado":
          sortedCards = cards;
          break;
        case "Nombre":
          sortedCards = cards.slice().sort((a, b) => {
            const aName = a.querySelector(".nombrePokemon").textContent.trim();
            const bName = b.querySelector(".nombrePokemon").textContent.trim();
            return aName.localeCompare(bName);
          });
          break;
        case "Generación":
          sortedCards = cards.slice().sort((a, b) => {
            const aGen = parseInt(a.dataset.gen) || 0;
            const bGen = parseInt(b.dataset.gen) || 0;
            return aGen - bGen;
          });
          break;
        default:
          sortedCards = cards;
      }

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      sortedCards.forEach(card => container.appendChild(card));
    });
  });

  const cajaData = [
    {
      name: "Caja 1",
      gen: 1,
      pokemons: [
        { name: "Charizard", nickname: "DRAGONOIDE", img: "https://img.pokemondb.net/sprites/home/normal/charizard.png" },
        { name: "Pikachu", nickname: "RATA ELÉCTRICA", img: "https://img.pokemondb.net/sprites/home/normal/pikachu.png" },
        { name: "Pachirisu", nickname: "ARDILLA GATO", img: "https://img.pokemondb.net/sprites/home/normal/pachirisu.png" },
        { name: "Vaporeon", nickname: "Ajolote", img: "https://img.pokemondb.net/sprites/home/normal/vaporeon.png" },
        { name: "Charmander", nickname: "MI HERMANO", img: "https://img.pokemondb.net/sprites/home/normal/charmander.png" },
        { name: "Rillaboom", nickname: "MONO", img: "https://img.pokemondb.net/sprites/home/normal/rillaboom.png" },
        { name: "Bibarel", nickname: "un capibaya", img: "https://img.pokemondb.net/sprites/home/normal/bibarel.png" },
        { name: "Gholdengo", nickname: "el de art attack", img: "https://img.pokemondb.net/sprites/home/normal/gholdengo.png" },
        { name: "Ursaluna", nickname: "un oso guacho", img: "https://img.pokemondb.net/sprites/home/normal/ursaluna.png" },
        { name: "Porygon-Z", nickname: "PÁJARO GIRATORIO", img: "https://img.pokemondb.net/sprites/home/normal/porygon-z.png" },
        { name: "Krookodile", nickname: "UNO COCODRILOS", img: "https://img.pokemondb.net/sprites/home/normal/krookodile.png" },
        { name: "Hatterene", nickname: "brujita", img: "https://img.pokemondb.net/sprites/home/normal/hatterene.png" },
        { name: "Glimmora", nickname: "sonico envuelto", img: "https://img.pokemondb.net/sprites/home/normal/glimmora.png" },
        { name: "Landorus", nickname: "garfield mamado", img: "https://img.pokemondb.net/sprites/home/normal/landorus.png" },
        { name: "Ting-Lu", nickname: "este sí parece malo", img: "https://img.pokemondb.net/sprites/home/normal/ting-lu.png" },
        { name: "Aegislash", nickname: "un spinner adentro", img: "https://img.pokemondb.net/sprites/home/normal/aegislash.png" },
        { name: "Kartana", nickname: "se agrandó el wacho", img: "https://img.pokemondb.net/sprites/home/normal/kartana.png" },
        { name: "Sirfetchd", nickname: "tas mamado penguin", img: "https://img.pokemondb.net/sprites/home/normal/sirfetchd.png" }
      ]
    }
  ];

  const allPokemons = cajaData.flatMap(equipo =>
    equipo.pokemons.map(p => ({
      ...p,
      gen: equipo.gen
    }))
  );

  const cards = document.querySelectorAll(".tarjetaPokemon");
  cards.forEach((card, i) => {
    const data = allPokemons[i % allPokemons.length];
    card.dataset.gen = data.gen;

    const imgDiv = card.querySelector(".spritePokemon");
    imgDiv.innerHTML = `<img src="${data.img}" alt="${data.name}">`;

    card.querySelector(".nombrePokemon").textContent = data.name;
    card.querySelector(".descripcionPokemon").textContent = data.nickname;
  });
});
