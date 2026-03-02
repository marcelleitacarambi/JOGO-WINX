let modoDeJogo = localStorage.getItem("modoDeJogo") || "1";
let jogadorAtual = 1;
let selecoes = {};

function escolherModo(modo) {
  localStorage.setItem("modoDeJogo", modo);
  window.location.href = "personagens.html";
}

function escolherPersonagem(nome, elementoHTML) {
  // Evita selecionar o mesmo personagem duas vezes
  if (selecoes.jogador1 && nome === selecoes.jogador1) {
    alert("Jogador 2 deve escolher uma jogadora diferente.");
    return;
  }

  if (jogadorAtual === 1 && !selecoes.jogador1) {
    selecoes.jogador1 = nome;
    elementoHTML.classList.add("selecionado");

    if (modoDeJogo === "2") {
      jogadorAtual = 2;
      document.getElementById("instrucao").innerText = "JOGADOR 2, ESCOLHA SUA JOGADORA";

      // Desativa personagem já escolhida
      const cards = document.querySelectorAll(".card");
      cards.forEach(card => {
        if (card.getAttribute("data-nome") === nome) {
          card.classList.add("desativado");
        }
      });
    } else {
      finalizarEscolhas();
    }
  } else if (jogadorAtual === 2 && !selecoes.jogador2) {
    selecoes.jogador2 = nome;
    elementoHTML.classList.add("selecionado");
    finalizarEscolhas();
  }
}

function finalizarEscolhas() {
  localStorage.setItem("selecoes", JSON.stringify(selecoes));
  window.location.href = "iniciojogo.html";
}
