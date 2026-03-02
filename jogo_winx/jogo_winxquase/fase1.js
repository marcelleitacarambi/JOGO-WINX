// Recupera seleções do localStorage
const selecoes = JSON.parse(localStorage.getItem("selecoes") || "{}");
let nome1 = selecoes.jogador1?.toLowerCase() || "flora";
let nome2 = selecoes.jogador2?.toLowerCase() || null;

const imagensValidas = ["flora", "bloom", "musa", "stella"];
if (!imagensValidas.includes(nome1)) nome1 = "flora";
if (!imagensValidas.includes(nome2)) nome2 = null;

const modoDeJogo = localStorage.getItem("modoDeJogo") || "1";
let faseConcluida = false;
let gameOver = false;

const personagem1 = document.getElementById("personagem1");
const personagem2 = document.getElementById("personagem2");
const cenario = document.getElementById("cenario");

// ALTERADO: Agora vamos carregar a sprite sheet correspondente
personagem1.style.backgroundImage = `url('personagens/${nome1}_sprite.png')`;
if (modoDeJogo === "2" && nome2 && personagem2) {
  personagem2.style.backgroundImage = `url('personagens/${nome2}_sprite.png')`;
  personagem2.style.display = "block";
}

// --- Variáveis de Física do Personagem ---
const posX1 = 150;
let posY1 = 0, velY1 = 0, noChao1 = true;
const gravidade = 1;
const alturaChao = 0;
const forcaPulo = 20;
const teclasPressionadas = {};

// --- NOVO: Variáveis de Animação ---
let frameAtual = 0;
const totalFramesRun = 3; // O seu sprite tem 3 frames de corrida
const larguraFrame = 149;  // A largura de um frame
const alturaFrame = 0;   // A altura de um frame
let contadorAnimacao = 0;
const velocidadeAnimacao = 11; // Mude este valor para animar mais rápido ou mais devagar

document.addEventListener("keydown", (e) => {
  teclasPressionadas[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  teclasPressionadas[e.key.toLowerCase()] = false;
});

// --- NOVO: Função dedicada para animar o personagem ---
function animarPersonagem() {
  contadorAnimacao++;

  // Só muda o frame quando o contador atingir o valor da 'velocidadeAnimacao'
  if (contadorAnimacao >= velocidadeAnimacao) {
    contadorAnimacao = 0;
    
    // Avança para o próximo frame, voltando ao início (0) quando chegar no último
    frameAtual = (frameAtual + 1) % totalFramesRun;

    // Calcula o deslocamento do background. Multiplicamos por -1 para mover o fundo para a esquerda.
    const backgroundPosX = -frameAtual * larguraFrame;
    
    // A animação de corrida está na primeira linha (Y = 0)
    const backgroundPosY = 0;

    // Aplica a nova posição do background no personagem
    personagem1.style.backgroundPosition = `${backgroundPosX}px ${backgroundPosY}px`;
  }
}


function verificarColisaoChao(x, y, velY) {
  // ... (função sem alterações)
  const obstaculos = document.querySelectorAll(".obstaculo-barril, .obstaculo-arbusto");
  for (const obs of obstaculos) {
    const obsX = parseInt(obs.style.left);
    const largura = obs.offsetWidth;
    const altura = obs.offsetHeight;

    const personagemLeft = x;
    const personagemRight = x + 60;
    const personagemBottom = 50 + y;

    const topoObstaculoY = 30 + altura;

    const dentroDoIntervaloX = personagemRight > obsX && personagemLeft < obsX + largura;
    const tocandoTopo = personagemBottom >= (topoObstaculoY - 20) && personagemBottom <= topoObstaculoY;

    if (dentroDoIntervaloX && velY <= 0 && tocandoTopo) {
      return (topoObstaculoY - 50);
    }
  }
  return null;
}

function verificarColisaoObstaculo(x, y) {
  // ... (função sem alterações)
  const obstaculos = document.querySelectorAll(".obstaculo-barril, .obstaculo-arbusto");
  for (const obs of obstaculos) {
    const obsX = parseInt(obs.style.left);
    const largura = obs.offsetWidth;
    const altura = obs.offsetHeight;
    const tocandoHorizontal = x + 60 > obsX && x < obsX + largura;
    const tocandoVertical = 50 + y < altura + 30;
    if (tocandoHorizontal && tocandoVertical) {
      if (!gameOver) {
        gameOver = true;
        alert("💀 Fim de jogo!");  
        window.location.reload();
      }
    }
  }
}

function pegarItem(x, y) {
    // ... (função sem alterações, usando a correção anterior)
  const itens = document.querySelectorAll(".item");
  for (const item of itens) {
    if (item.dataset.coletado === "true") continue;
    const itemX = parseInt(item.style.left);
    if (x + 60 > itemX && x < itemX + 60 && y + 50 >= 120) {
      item.style.display = "none";
      item.dataset.coletado = "true";

      teclasPressionadas["w"] = false;
      teclasPressionadas["arrowup"] = false;
      
      alert("💖 Você ganhou um poder!");
    }
  }
}

function entrarNoPortal(x1, x2, y1, y2) {
  // ... (função sem alterações)
  if (faseConcluida || gameOver) return;
  const portal = document.querySelector(".portal");
  const portalX = parseInt(portal.style.left);
  const entrou1 = x1 + 60 > portalX && x1 < portalX + 80 && y1 <= 20;
  if (entrou1) {
    faseConcluida = true;
    alert("✨ Fase 1 concluída!");
    window.location.href = "fase2.html";
  }
}

function atualizar() {
  if (gameOver) return;

  const velocidadeCenario = 5;

  // --- Lógica de Pulo ---
  if ((teclasPressionadas["w"] || teclasPressionadas["arrowup"]) && noChao1) {
    velY1 = forcaPulo;
    noChao1 = false;
  }

  // --- Lógica de Física ---
  velY1 -= gravidade;
  posY1 += velY1;

  const novaPosY1 = verificarColisaoChao(posX1, posY1, velY1);
  if (novaPosY1 !== null) {
    posY1 = novaPosY1;
    velY1 = 0;
    noChao1 = true;
  } 
  else if (posY1 <= alturaChao) { 
    posY1 = alturaChao;
    velY1 = 0;
    noChao1 = true;
  } else {
    noChao1 = false;
  }

  // --- Atualização Visual da Posição ---
  personagem1.style.left = `${posX1}px`;
  personagem1.style.bottom = `${50 + posY1}px`;

  // --- NOVO: Chama a função de animação a cada quadro ---
  animarPersonagem();

  // --- Movimentação do Cenário ---
  document.querySelectorAll(".obstaculo-barril, .obstaculo-arbusto, .item, .portal").forEach(obj => {
    if (obj) {
        const posAtual = parseInt(obj.style.left);
        obj.style.left = `${posAtual - velocidadeCenario}px`;
    }
  });

  // --- Verificações de Jogo ---
  pegarItem(posX1, posY1);
  verificarColisaoObstaculo(posX1, posY1);
  entrarNoPortal(posX1, null, posY1, null);

  requestAnimationFrame(atualizar);
}

// Inicia o loop do jogo
atualizar();