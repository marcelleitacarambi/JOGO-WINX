// fase2.js - Versão com rolagem, colisão precisa e transição automática de fase

const selecoes = JSON.parse(localStorage.getItem("selecoes") || "{}");
let nome1 = selecoes.jogador1?.toLowerCase() || "flora";

const personagem = document.getElementById("personagem");
const vidaContainer = document.getElementById("vida");
let vidas = 3;
let gameOver = false;
let faseConcluida = false;

personagem.style.backgroundImage = `url('personagens/${nome1}_sprite.png')`;

let posX1 = 100;
let posY1 = 0;
let velY1 = 0;
let noChao1 = true;

const gravidade = 1;
const alturaChao = 0;
const forcaPulo = 20;
const velocidade = 5;
const teclasPressionadas = {};

let frameAtual = 0;
const totalFramesRun = 3;
const larguraFrame = 149;
let contadorAnimacao = 0;
const velocidadeAnimacao = 11;

document.addEventListener("keydown", (e) => {
  teclasPressionadas[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  teclasPressionadas[e.key.toLowerCase()] = false;
});

function animarPersonagem() {
  const estaCorrendo = teclasPressionadas["arrowright"] || teclasPressionadas["d"] || teclasPressionadas["arrowleft"] || teclasPressionadas["a"];
  if (!estaCorrendo) return;

  contadorAnimacao++;
  if (contadorAnimacao >= velocidadeAnimacao) {
    contadorAnimacao = 0;
    frameAtual = (frameAtual + 1) % totalFramesRun;
    const backgroundPosX = -frameAtual * larguraFrame;
    personagem.style.backgroundPosition = `${backgroundPosX}px 0px`;
  }
}

function moverInimigos() {
  document.querySelectorAll(".inimigo").forEach(inimigo => {
    let dir = parseInt(inimigo.dataset.direcao);
    let left = parseInt(inimigo.style.left);
    inimigo.style.left = `${left + dir * 2}px`;

    if (left < 700) inimigo.dataset.direcao = 1;
    if (left > 1500) inimigo.dataset.direcao = -1;
  });
}

function moverPlataformas() {
  document.querySelectorAll(".plataforma").forEach(p => {
    let dir = parseInt(p.dataset.direcao);
    let left = parseInt(p.style.left);
    p.style.left = `${left + dir * 2}px`;

    if (left < 500) p.dataset.direcao = 1;
    if (left > 1600) p.dataset.direcao = -1;
  });
}

// Detecção de colisão precisa (AABB)
function colisaoRetangulos(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw &&
         ax + aw > bx &&
         ay < by + bh &&
         ay + ah > by;
}

function checarColisoes() {
  if (faseConcluida) return;

  // Checa colisão com inimigos
  document.querySelectorAll(".inimigo").forEach(inimigo => {
    let inimigoX = parseInt(inimigo.style.left);
    let inimigoY = 0;
    let inimigoW = 10;
    let inimigoH = 10;

    let personagemW = 10;
    let personagemH = 10;

    if (colisaoRetangulos(posX1, posY1, personagemW, personagemH, inimigoX, inimigoY, inimigoW, inimigoH)) {
      perderVida();
    }
  });

  // Barras agora são plataformas
  document.querySelectorAll(".buraco").forEach(b => {
    let bX = parseInt(b.style.left);
    let bY = 0;
    let bW = 100;
    let bH = 20;

    if (
      posX1 + 60 > bX &&
      posX1 < bX + bW &&
      posY1 <= bY + bH &&
      velY1 <= 0
    ) {
      posY1 = bY + bH;
      velY1 = 0;
      noChao1 = true;
    }
  });

  // Portal → troca de fase automática
  const portal = document.querySelector(".portal");
  const portalX = parseInt(portal.style.left);
  const portalW = 80;
  const portalY = 0;
  const portalH = 150;

  if (colisaoRetangulos(posX1, posY1, 60, 100, portalX, portalY, portalW, portalH)) {
    faseConcluida = true;
    window.location.href = "final.html"; // Trocar para sua próxima fase
  }
}

function perderVida() {
  if (vidas <= 0 || faseConcluida) return;

  vidas--;
  vidaContainer.children[vidas].style.display = "none";

  if (vidas === 0) {
    alert("☠️ Game Over!");
    window.location.reload();
    return;
  }

  posX1 = 100;
  posY1 = 0;
  velY1 = 0;
}

function atualizar() {
  if (gameOver || faseConcluida) return;

  if ((teclasPressionadas["w"] || teclasPressionadas["arrowup"] || teclasPressionadas[" "]) && noChao1) {
    velY1 = forcaPulo;
    noChao1 = false;
  }

  if (teclasPressionadas["arrowright"] || teclasPressionadas["d"]) {
    posX1 += velocidade;
  }
  if (teclasPressionadas["arrowleft"] || teclasPressionadas["a"]) {
    posX1 -= velocidade;
  }

  velY1 -= gravidade;
  posY1 += velY1;

  if (posY1 <= alturaChao) {
    posY1 = alturaChao;
    velY1 = 0;
    noChao1 = true;
  }

  personagem.style.left = `${posX1}px`;
  personagem.style.bottom = `${50 + posY1}px`;
  personagem.style.width = "149px";
  personagem.style.height = "202px";

  document.documentElement.scrollLeft = posX1 - window.innerWidth / 2 + 75;

  animarPersonagem();
  moverInimigos();
  moverPlataformas();
  checarColisoes();

  requestAnimationFrame(atualizar);
}

atualizar();
