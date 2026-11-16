/**
 * Mini-Game Arcade "Cyber Strike: Red & Gold"
 * Jogo embutido HTML5 Canvas com temática Vermelho & Amarelo
 */

class MiniGameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Dimensões lógicas
    this.width = 600;
    this.height = 360;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.isRunning = false;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('minigame_highscore') || '0', 10);
    this.gameOver = false;
    
    // Player
    this.player = {
      x: this.width / 2 - 15,
      y: this.height - 50,
      width: 30,
      height: 30,
      speed: 6,
      vx: 0,
      bullets: [],
      shootCooldown: 0
    };

    // Inimigos e Partículas
    this.enemies = [];
    this.particles = [];
    this.enemySpawnTimer = 0;
    this.stars = [];

    // Inicializar estrelas de fundo
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.5 ? '#ff334b' : '#ffb800'
      });
    }

    this.keys = {};
    this.initEvents();
  }

  initEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        if (this.isRunning) e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mobile touch
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      this.shoot();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const diff = e.touches[0].clientX - touchStartX;
      this.player.x += diff * 0.1;
      this.clampPlayer();
    });
  }

  start(gameTitle = 'Cyber Strike') {
    this.currentGameTitle = gameTitle;
    this.isRunning = true;
    this.gameOver = false;
    this.score = 0;
    this.enemies = [];
    this.player.bullets = [];
    this.particles = [];
    this.player.x = this.width / 2 - 15;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.isRunning = false;
  }

  restart() {
    this.start(this.currentGameTitle);
  }

  clampPlayer() {
    if (this.player.x < 10) this.player.x = 10;
    if (this.player.x > this.width - this.player.width - 10) {
      this.player.x = this.width - this.player.width - 10;
    }
  }

  shoot() {
    if (this.player.shootCooldown <= 0) {
      this.player.bullets.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y - 5,
        width: 4,
        height: 12,
        speed: 9
      });
      this.player.shootCooldown = 12; // taxa de disparo
    }
  }

  spawnEnemy() {
    const size = 26;
    const x = Math.random() * (this.width - size - 20) + 10;
    const isGold = Math.random() > 0.75;
    this.enemies.push({
      x: x,
      y: -30,
      width: size,
      height: size,
      speed: isGold ? 2.8 : 1.8 + Math.random() * 1.2,
      hp: isGold ? 2 : 1,
      isGold: isGold
    });
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 3 + 1,
        life: 1,
        decay: Math.random() * 0.04 + 0.02,
        color: color || (Math.random() > 0.5 ? '#ff334b' : '#ffb800')
      });
    }
  }

  update() {
    if (!this.isRunning || this.gameOver) return;

    // Movimentação do jogador
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.x += this.player.speed;
    }
    this.clampPlayer();

    // Disparo
    if (this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.shoot();
    }
    if (this.player.shootCooldown > 0) this.player.shootCooldown--;

    // Fundo animado estrelas
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    });

    // Bullets
    for (let i = this.player.bullets.length - 1; i >= 0; i--) {
      const b = this.player.bullets[i];
      b.y -= b.speed;
      if (b.y < -10) {
        this.player.bullets.splice(i, 1);
      }
    }

    // Spawn Inimigos
    this.enemySpawnTimer++;
    if (this.enemySpawnTimer > 45) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Update Inimigos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speed;

      // Colisão bala x inimigo
      for (let j = this.player.bullets.length - 1; j >= 0; j--) {
        const b = this.player.bullets[j];
        if (
          b.x < e.x + e.width &&
          b.x + b.width > e.x &&
          b.y < e.y + e.height &&
          b.y + b.height > e.y
        ) {
          // Hit
          this.player.bullets.splice(j, 1);
          e.hp--;
          this.createExplosion(b.x, b.y, '#ffd24d');

          if (e.hp <= 0) {
            this.createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.isGold ? '#ffb800' : '#ff334b');
            this.score += e.isGold ? 50 : 20;
            this.enemies.splice(i, 1);
            break;
          }
        }
      }

      // Colisão inimigo x jogador
      if (
        e &&
        this.player.x < e.x + e.width &&
        this.player.x + this.player.width > e.x &&
        this.player.y < e.y + e.height &&
        this.player.y + this.player.height > e.y
      ) {
        this.createExplosion(this.player.x + 15, this.player.y + 15, '#ff334b');
        this.gameOver = true;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('minigame_highscore', this.highScore.toString());
        }
      }

      // Saiu da tela
      if (e && e.y > this.height) {
        this.enemies.splice(i, 1);
      }
    }

    // Update Partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.fillStyle = '#06080d';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Estrelas
    this.stars.forEach(s => {
      this.ctx.fillStyle = s.color;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Jogador (Nave Futurista Vermelha com detalhes Dourados)
    if (!this.gameOver) {
      this.ctx.save();
      this.ctx.translate(this.player.x, this.player.y);

      // Efeito de propulsão
      this.ctx.fillStyle = Math.random() > 0.5 ? '#ffb800' : '#ff334b';
      this.ctx.beginPath();
      this.ctx.moveTo(10, 30);
      this.ctx.lineTo(15, 38 + Math.random() * 6);
      this.ctx.lineTo(20, 30);
      this.ctx.fill();

      // Corpo da nave
      this.ctx.fillStyle = '#ff334b';
      this.ctx.beginPath();
      this.ctx.moveTo(15, 0);
      this.ctx.lineTo(30, 28);
      this.ctx.lineTo(15, 22);
      this.ctx.lineTo(0, 28);
      this.ctx.closePath();
      this.ctx.fill();

      // Detalhe Dourado no Cockpit
      this.ctx.fillStyle = '#ffb800';
      this.ctx.beginPath();
      this.ctx.moveTo(15, 8);
      this.ctx.lineTo(20, 18);
      this.ctx.lineTo(10, 18);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }

    // Tiros (Feixe de Plasma Amarelo-Ouro com brilho)
    this.player.bullets.forEach(b => {
      this.ctx.fillStyle = '#ffb800';
      this.ctx.shadowColor = '#ffb800';
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(b.x, b.y, b.width, b.height);
      this.ctx.shadowBlur = 0;
    });

    // Inimigos
    this.enemies.forEach(e => {
      this.ctx.save();
      this.ctx.translate(e.x, e.y);
      this.ctx.fillStyle = e.isGold ? '#ffb800' : '#e6233b';
      this.ctx.shadowColor = e.isGold ? 'rgba(255,184,0,0.5)' : 'rgba(255,51,75,0.5)';
      this.ctx.shadowBlur = 6;

      // Forma do drone inimigo
      this.ctx.beginPath();
      this.ctx.moveTo(e.width / 2, e.height);
      this.ctx.lineTo(e.width, 0);
      this.ctx.lineTo(e.width / 2, e.height * 0.3);
      this.ctx.lineTo(0, 0);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    });

    // Partículas
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    // HUD (Pontuação & High Score)
    this.ctx.font = '700 14px Oxanium, sans-serif';
    this.ctx.fillStyle = '#ffb800';
    this.ctx.fillText(`SCORE: ${this.score}`, 15, 25);

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`RECORD: ${this.highScore}`, this.width - 130, 25);

    // Game Over Overlay
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.font = '900 28px Oxanium, sans-serif';
      this.ctx.fillStyle = '#ff334b';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#ff334b';
      this.ctx.shadowBlur = 12;
      this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
      this.ctx.shadowBlur = 0;

      this.ctx.font = '600 16px Inter, sans-serif';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(`Pontuação Final: ${this.score}`, this.width / 2, this.height / 2 + 15);

      this.ctx.font = '700 13px Oxanium, sans-serif';
      this.ctx.fillStyle = '#ffb800';
      this.ctx.fillText('Pressione [R] ou clique no botão para Reiniciar', this.width / 2, this.height / 2 + 50);
      this.ctx.textAlign = 'start';
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    if (this.keys['KeyR'] && this.gameOver) {
      this.restart();
    }
    requestAnimationFrame(() => this.loop());
  }
}

window.MiniGameEngine = MiniGameEngine;
