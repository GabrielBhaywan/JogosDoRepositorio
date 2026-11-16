/**
 * Portal de Jogos - IGNITE GAMES
 * Lógica principal de gerenciamento, filtros, pesquisa e modal
 */

// Jogos padrão pré-cadastrados
const DEFAULT_GAMES = [
  {
    id: "game-1",
    title: "Cyber Strike: Vengeance",
    category: "FPS",
    badge: "POPULAR",
    badgeColor: "red",
    rating: 4.9,
    players: "142k ativos",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80",
    description: "Confrontos táticos frenéticos em arenas cyberpunk com arsenais de plasma e habilidades de pulso elétrico.",
    platform: "PC / Web",
    releaseDate: "2024",
    developer: "Ignite Studio"
  },
  {
    id: "game-2",
    title: "Shadow Ronin: Crimson Sun",
    category: "Ação",
    badge: "NOVO",
    badgeColor: "yellow",
    rating: 4.8,
    players: "89k ativos",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80",
    description: "Um samurai solitário empunha lâminas incendiárias em um império futurista tomado pela tirania robótica.",
    platform: "PC / Consoles",
    releaseDate: "2024",
    developer: "Kurogane Interactive"
  },
  {
    id: "game-3",
    title: "Inferno League Arena",
    category: "MOBA",
    badge: "ESPORTS",
    badgeColor: "red",
    rating: 4.9,
    players: "310k ativos",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80",
    description: "Batalhas multiplayer 5v5 intensas com heróis elementais e campeonatos ranqueados globais.",
    platform: "Web / Mobile",
    releaseDate: "2023",
    developer: "Apex Core"
  },
  {
    id: "game-4",
    title: "Aetheria: Dragon's Legacy",
    category: "RPG",
    badge: "DESTAQUE",
    badgeColor: "yellow",
    rating: 4.7,
    players: "64k ativos",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=80",
    description: "Explore terras lendárias banhadas pelo fogo ancestral, dominando magias dracônicas e montarias aladas.",
    platform: "Multiplataforma",
    releaseDate: "2024",
    developer: "Mythic Realms"
  },
  {
    id: "game-5",
    title: "Hyper Drift: Neon Fuel",
    category: "Corrida",
    badge: "HOT",
    badgeColor: "red",
    rating: 4.6,
    players: "52k ativos",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80",
    description: "Velocidades extremas, curvas de tirar o fôlego e nitro flamejante em circuitos noturnos futuristas.",
    platform: "PC / Web",
    releaseDate: "2024",
    developer: "Velocity Works"
  },
  {
    id: "game-6",
    title: "Titan Vanguard: Mech Wars",
    category: "Estratégia",
    badge: "TÁTICO",
    badgeColor: "yellow",
    rating: 4.8,
    players: "41k ativos",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80",
    description: "Comande batalhões de robôs gigantescos e execute táticas de cerco com artilharia pesada e drones.",
    platform: "PC",
    releaseDate: "2024",
    developer: "Iron Forge"
  },
  {
    id: "game-7",
    title: "Pixel Rogue: Dungeon Fire",
    category: "Indie",
    badge: "RETRO",
    badgeColor: "yellow",
    rating: 4.9,
    players: "78k ativos",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80",
    description: "Roguelike com visual retrô requintado, centenas de itens sinérgicos e calabouços procedurais implacáveis.",
    platform: "Web / PC",
    releaseDate: "2024",
    developer: "8Bit Pulse"
  },
  {
    id: "game-8",
    title: "Vortex Clash: Ultimate",
    category: "Luta",
    badge: "COMPETITIVO",
    badgeColor: "red",
    rating: 4.7,
    players: "95k ativos",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=700&q=80",
    description: "Combos avassaladores e contra-ataques cirúrgicos no torneio de artes marciais mais veloz da galáxia.",
    platform: "PC / Consoles",
    releaseDate: "2023",
    developer: "Red Fist Games"
  }
];

class GamesPortal {
  constructor() {
    this.games = [];
    this.currentFilter = 'todos';
    this.searchQuery = '';
    this.favorites = new Set(JSON.parse(localStorage.getItem('portal_favorites') || '[]'));
    
    this.initData();
    this.initElements();
    this.initEventListeners();
    this.render();

    // Minigame Engine instance
    this.miniGame = new MiniGameEngine('minigameCanvas');
  }

  initData() {
    const savedGames = localStorage.getItem('portal_custom_games');
    if (savedGames) {
      try {
        const parsed = JSON.parse(savedGames);
        // Junta os padrões com os cadastrados pelo usuário sem duplicar ids
        const existingIds = new Set(DEFAULT_GAMES.map(g => g.id));
        const userCustoms = parsed.filter(g => !existingIds.has(g.id));
        this.games = [...DEFAULT_GAMES, ...userCustoms];
      } catch (e) {
        this.games = [...DEFAULT_GAMES];
      }
    } else {
      this.games = [...DEFAULT_GAMES];
    }
  }

  saveCustomGames() {
    const customOnes = this.games.filter(g => !DEFAULT_GAMES.some(dg => dg.id === g.id));
    localStorage.setItem('portal_custom_games', JSON.stringify(customOnes));
  }

  saveFavorites() {
    localStorage.setItem('portal_favorites', JSON.stringify([...this.favorites]));
  }

  initElements() {
    // Containers
    this.gamesGrid = document.getElementById('gamesGrid');
    this.searchInput = document.getElementById('searchInput');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.header = document.querySelector('.header');
    
    // Modals
    this.gameDetailsModal = document.getElementById('gameDetailsModal');
    this.addGameModal = document.getElementById('addGameModal');
    this.minigameModal = document.getElementById('minigameModal');
    
    // Forms & Buttons
    this.addGameForm = document.getElementById('addGameForm');
    this.openAddGameBtn = document.getElementById('openAddGameBtn');
    this.heroPlayBtn = document.getElementById('heroPlayBtn');
    this.heroDetailsBtn = document.getElementById('heroDetailsBtn');
    
    // Toast
    this.toast = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');

    // Stats
    this.totalGamesStat = document.getElementById('totalGamesStat');
  }

  initEventListeners() {
    // Header Scroll Effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    });

    // Mobile Menu
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
    }

    // Busca em tempo real
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // Filtros de Categoria
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.category;
        this.render();
      });
    });

    // Abrir Modal de Adicionar Jogo
    if (this.openAddGameBtn) {
      this.openAddGameBtn.addEventListener('click', () => {
        this.openModal(this.addGameModal);
      });
    }

    // Submissão do Formulário de Novo Jogo
    if (this.addGameForm) {
      this.addGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddNewGame();
      });
    }

    // Botões do Hero
    if (this.heroPlayBtn) {
      this.heroPlayBtn.addEventListener('click', () => {
        this.launchMiniGame(this.games[0]);
      });
    }

    if (this.heroDetailsBtn) {
      this.heroDetailsBtn.addEventListener('click', () => {
        this.openGameDetails(this.games[0]);
      });
    }

    // Fechar modais ao clicar no botão de fechar ou no overlay de fundo
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        this.closeModal(modal);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Botão de reiniciar minigame
    const restartMiniGameBtn = document.getElementById('restartMiniGameBtn');
    if (restartMiniGameBtn) {
      restartMiniGameBtn.addEventListener('click', () => {
        if (this.miniGame) this.miniGame.restart();
      });
    }

    // Newsletter submit feedback
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showToast('Inscrição efetuada com sucesso! Bem-vindo ao clan!', 'yellow');
        newsletterForm.reset();
      });
    }
  }

  openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Se fechou o modal de minigame, interrompe o loop
    if (modal === this.minigameModal && this.miniGame) {
      this.miniGame.stop();
    }
  }

  showToast(message, color = 'yellow') {
    if (!this.toast) return;
    this.toastMessage.textContent = message;
    this.toast.className = 'toast-notification active ' + (color === 'red' ? 'red' : '');

    setTimeout(() => {
      this.toast.classList.remove('active');
    }, 3800);
  }

  handleAddNewGame() {
    const title = document.getElementById('gameTitleInput').value.trim();
    const category = document.getElementById('gameCategoryInput').value;
    const badge = document.getElementById('gameBadgeInput').value.trim() || 'NOVO';
    const badgeColor = document.getElementById('gameBadgeColorInput').value || 'yellow';
    const imageInput = document.getElementById('gameImageInput').value.trim();
    const description = document.getElementById('gameDescInput').value.trim();
    const platform = document.getElementById('gamePlatformInput').value.trim() || 'Web / PC';

    if (!title || !description) {
      this.showToast('Por favor, preencha o título e a descrição do jogo.', 'red');
      return;
    }

    // Imagem fallback caso vazia
    const defaultPlaceholder = "https://images.unsplash.com/photo-1552824722-ddab1374e622?auto=format&fit=crop&w=700&q=80";
    const image = imageInput.length > 5 ? imageInput : defaultPlaceholder;

    const newGame = {
      id: 'game-' + Date.now(),
      title,
      category,
      badge: badge.toUpperCase(),
      badgeColor,
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      players: `${Math.floor(Math.random() * 80 + 10)}k ativos`,
      image,
      description,
      platform,
      releaseDate: new Date().getFullYear().toString(),
      developer: 'Comunidade Ignite'
    };

    // Adiciona no topo da lista
    this.games.unshift(newGame);
    this.saveCustomGames();
    this.addGameForm.reset();
    this.closeModal(this.addGameModal);
    this.showToast(`Jogo "${title}" publicado com sucesso no portal!`, 'yellow');
    this.render();

    // Rola suavemente até o catálogo
    const catalogSec = document.getElementById('catalogo');
    if (catalogSec) {
      catalogSec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleFavorite(gameId, event) {
    if (event) event.stopPropagation();

    if (this.favorites.has(gameId)) {
      this.favorites.delete(gameId);
      this.showToast('Removido dos favoritos.', 'red');
    } else {
      this.favorites.add(gameId);
      this.showToast('Adicionado aos seus favoritos!', 'yellow');
    }

    this.saveFavorites();
    this.render();
  }

  openGameDetails(game) {
    if (!game) return;

    document.getElementById('modalBannerImg').src = game.image;
    document.getElementById('modalBannerImg').alt = game.title;
    document.getElementById('modalGameGenre').textContent = game.category;
    document.getElementById('modalGameTitle').textContent = game.title;
    document.getElementById('modalGameRating').textContent = `${game.rating} ★`;
    document.getElementById('modalGamePlatform').textContent = game.platform;
    document.getElementById('modalGamePlayers').textContent = game.players;
    document.getElementById('modalGameDesc').textContent = game.description;

    const playBtn = document.getElementById('modalPlayNowBtn');
    playBtn.onclick = () => {
      this.closeModal(this.gameDetailsModal);
      this.launchMiniGame(game);
    };

    this.openModal(this.gameDetailsModal);
  }

  launchMiniGame(game) {
    document.getElementById('minigameTitle').textContent = `JOGANDO: ${game.title}`;
    this.openModal(this.minigameModal);
    if (this.miniGame) {
      this.miniGame.start(game.title);
    }
  }

  filterGames() {
    return this.games.filter(game => {
      // Filtro de Categoria
      const matchesCategory = 
        this.currentFilter === 'todos' || 
        (this.currentFilter === 'favoritos' && this.favorites.has(game.id)) ||
        game.category.toLowerCase() === this.currentFilter.toLowerCase();

      // Filtro de Busca
      const matchesSearch = 
        !this.searchQuery ||
        game.title.toLowerCase().includes(this.searchQuery) ||
        game.category.toLowerCase().includes(this.searchQuery) ||
        game.description.toLowerCase().includes(this.searchQuery);

      return matchesCategory && matchesSearch;
    });
  }

  updateCategoryCounts() {
    this.filterButtons.forEach(btn => {
      const cat = btn.dataset.category;
      let count = 0;
      if (cat === 'todos') {
        count = this.games.length;
      } else if (cat === 'favoritos') {
        count = this.favorites.size;
      } else {
        count = this.games.filter(g => g.category.toLowerCase() === cat.toLowerCase()).length;
      }
      const countEl = btn.querySelector('.cat-count');
      if (countEl) countEl.textContent = count;
    });

    if (this.totalGamesStat) {
      this.totalGamesStat.innerHTML = `${this.games.length}<span>+</span>`;
    }
  }

  render() {
    this.updateCategoryCounts();
    const filtered = this.filterGames();

    if (!this.gamesGrid) return;

    if (filtered.length === 0) {
      this.gamesGrid.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-gamepad"></i>
          <h3>Nenhum jogo encontrado</h3>
          <p>Tente ajustar seus termos de pesquisa ou mudar a categoria selecionada.</p>
          <button class="btn btn-primary-yellow" style="margin-top: 1.2rem;" onclick="portal.resetFilters()">Limpar Filtros</button>
        </div>
      `;
      return;
    }

    this.gamesGrid.innerHTML = filtered.map(game => {
      const isFav = this.favorites.has(game.id);
      const badgeCls = game.badgeColor === 'yellow' ? 'badge-yellow' : 'badge-red';

      return `
        <article class="game-card" data-id="${game.id}">
          <div class="game-thumb-wrapper">
            <img class="game-thumb" src="${game.image}" alt="${game.title}" loading="lazy" />
            <span class="game-badge ${badgeCls}">${game.badge}</span>
            <button class="game-favorite-btn ${isFav ? 'favorited' : ''}" 
                    title="${isFav ? 'Remover dos Favoritos' : 'Favoritar Jogo'}" 
                    onclick="portal.toggleFavorite('${game.id}', event)">
              <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
            </button>
          </div>
          
          <div class="game-info">
            <span class="game-category-tag">${game.category} • ${game.platform}</span>
            <h3 class="game-title">${game.title}</h3>
            <p class="game-desc">${game.description}</p>
            
            <div class="game-meta">
              <span class="game-rating">
                <i class="fa-solid fa-star"></i> ${game.rating}
              </span>
              <button class="game-play-btn" onclick="portal.openGameDetailsById('${game.id}')">
                <i class="fa-solid fa-play"></i> Jogar
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  openGameDetailsById(id) {
    const game = this.games.find(g => g.id === id);
    if (game) this.openGameDetails(game);
  }

  resetFilters() {
    this.currentFilter = 'todos';
    this.searchQuery = '';
    if (this.searchInput) this.searchInput.value = '';
    this.filterButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'todos');
    });
    this.render();
  }
}

// Inicializar após carregamento do DOM
let portal;
document.addEventListener('DOMContentLoaded', () => {
  portal = new GamesPortal();
  window.portal = portal;
});
