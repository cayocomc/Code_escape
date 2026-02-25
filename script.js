const levels = [
  {
    title: "Sala 1: Variáveis",
    concept: "variáveis",
    type: "single",
    prompt: "Qual linha cria a variável 'chave' com valor numérico 7?",
    code: "// Escolha a declaração correta",
    options: [
      "let chave = 7;",
      "if chave == 7",
      "chave: 7",
      "print(chave = 7)",
    ],
    answer: "let chave = 7;",
    hint: "Use let + nome + '=' + valor + ';'.",
  },
  {
    title: "Sala 2: Condições if/else",
    concept: "if/else",
    type: "single",
    prompt: "Complete a condição para abrir a porta quando senha estiver correta.",
    code: "let senha = 'leo123';\nif (senha ____ 'leo123') {\n  abrirPorta();\n} else {\n  bloquear();\n}",
    options: ["=", "===", "!", "=>"],
    answer: "===",
    hint: "Comparação estrita em JavaScript usa três iguais.",
  },
  {
    title: "Sala 3: Operadores",
    concept: "operadores matemáticos",
    type: "single",
    prompt: "Qual saída esse código gera?",
    code: "let energia = 10;\nenergia = energia * 2 - 6;\nconsole.log(energia);",
    options: ["26", "14", "8", "20"],
    answer: "14",
    hint: "Resolva multiplicação antes da subtração.",
  },
  {
    title: "Sala 4: Loop for",
    concept: "loops",
    type: "single",
    prompt: "Qual opção substitui ??? para repetir 4 vezes?",
    code: "for (let i = 0; i < ???; i++) {\n  console.log('RUN');\n}",
    options: ["3", "4", "5", "i"],
    answer: "4",
    hint: "Começando em 0, o laço para quando i não for menor que o limite.",
  },
  {
    title: "Sala 5: Funções",
    concept: "funções",
    type: "single",
    prompt: "Qual retorno falta para a função somar funcionar?",
    code: "function somar(a, b) {\n  // linha faltando\n}\nconsole.log(somar(4, 3));",
    options: ["return a + b;", "console.log(a+b);", "a + b;", "break;"],
    answer: "return a + b;",
    hint: "Sem return, a função não entrega um valor para fora.",
  },
  {
    title: "Sala 6: Debug final",
    concept: "depuração",
    type: "multi",
    prompt: "Escolha as 2 correções necessárias para o código rodar e mostrar ESCAPE.",
    code: "function mensagem() {\n  let texto = 'ESCAPE'\n  return texto\n}\nconsole.log(mensage());",
    options: [
      "Adicionar ';' após let texto = 'ESCAPE';",
      "Trocar mensage() por mensagem();",
      "Trocar return por break;",
      "Trocar let por for;",
    ],
    answer: ["Adicionar ';' após let texto = 'ESCAPE';", "Trocar mensage() por mensagem();"],
    hint: "Há um erro de escrita no nome da função e um ajuste de sintaxe recomendado.",
  },
];

const state = {
  started: false,
  currentLevel: 0,
  time: 90,
  baseTime: 90,
  score: 0,
  tries: 0,
  usedHint: false,
  timerInterval: null,
};

const ui = {
  levelNumber: document.getElementById("levelNumber"),
  timer: document.getElementById("timer"),
  score: document.getElementById("score"),
  mascotSpeech: document.getElementById("mascotSpeech"),
  challengeTitle: document.getElementById("challengeTitle"),
  challengePrompt: document.getElementById("challengePrompt"),
  codeSnippet: document.getElementById("codeSnippet"),
  answerForm: document.getElementById("answerForm"),
  feedback: document.getElementById("feedback"),
  submitBtn: document.getElementById("submitBtn"),
  hintBtn: document.getElementById("hintBtn"),
  startBtn: document.getElementById("startBtn"),
  skipBtn: document.getElementById("skipBtn"),
  doorVisual: document.getElementById("doorVisual"),
  doorState: document.getElementById("doorState"),
  finalModal: document.getElementById("finalModal"),
  finalText: document.getElementById("finalText"),
  restartGame: document.getElementById("restartGame"),
};

function setSpeech(text) {
  ui.mascotSpeech.textContent = text;
}

function updateStats() {
  ui.levelNumber.textContent = String(state.currentLevel + 1);
  ui.timer.textContent = `${state.time}s`;
  ui.score.textContent = String(state.score);
}

function currentLevelData() {
  return levels[state.currentLevel];
}

function renderLevel() {
  const level = currentLevelData();

  ui.challengeTitle.textContent = level.title;
  ui.challengePrompt.textContent = level.prompt;
  ui.codeSnippet.textContent = level.code;
  ui.answerForm.innerHTML = "";
  ui.feedback.textContent = "";
  ui.feedback.classList.remove("ok");
  ui.doorVisual.classList.remove("open");
  ui.doorState.textContent = "TRANCADA";

  level.options.forEach((option, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "answer-option";
    const type = level.type === "multi" ? "checkbox" : "radio";
    const inputId = `opt-${index}`;
    wrapper.innerHTML = `
      <label for="${inputId}">
        <input type="${type}" id="${inputId}" name="answer" value="${option}" />
        <span>${option}</span>
      </label>
    `;
    ui.answerForm.appendChild(wrapper);
  });

  setSpeech(`Conceito desta sala: ${level.concept}. Leia o código e escolha com calma.`);
  updateStats();
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.time -= 1;
    updateStats();
    if (state.time <= 0) {
      clearInterval(state.timerInterval);
      ui.feedback.textContent = "Tempo esgotado! Reinicie o nível para tentar novamente.";
      setSpeech("O tempo acabou! Todo programador aprende com repetição. Tente novamente.");
      ui.submitBtn.disabled = true;
    }
  }, 1000);
}

function getSelectedAnswers() {
  const selected = Array.from(ui.answerForm.querySelectorAll("input:checked")).map(
    (input) => input.value
  );
  return selected;
}

function applyTimePenalty(seconds, reason) {
  state.time = Math.max(0, state.time - seconds);
  ui.feedback.textContent = reason;
  updateStats();
}

function evaluateAnswer() {
  if (!state.started || state.time <= 0) {
    return;
  }

  const level = currentLevelData();
  const selected = getSelectedAnswers();

  if (selected.length === 0) {
    ui.feedback.textContent = "Selecione uma resposta antes de testar o código.";
    return;
  }

  state.tries += 1;

  let isCorrect = false;
  if (level.type === "multi") {
    const expected = [...level.answer].sort();
    const actual = [...selected].sort();
    isCorrect = JSON.stringify(expected) === JSON.stringify(actual);
  } else {
    isCorrect = selected[0] === level.answer;
  }

  if (isCorrect) {
    ui.feedback.textContent = "Código correto! Porta desbloqueada.";
    ui.feedback.classList.add("ok");
    ui.doorVisual.classList.add("open");
    ui.doorState.textContent = "ABERTA";

    const bonus = Math.max(0, state.time * 5) + (state.tries === 1 ? 50 : 0) - (state.usedHint ? 20 : 0);
    state.score += bonus;
    updateStats();

    clearInterval(state.timerInterval);
    ui.submitBtn.disabled = true;
    ui.hintBtn.disabled = true;

    if (state.currentLevel === levels.length - 1) {
      finishGame();
      return;
    }

    setSpeech("Excelente! Você aplicou lógica de programação como um verdadeiro dev.");
    setTimeout(() => {
      state.currentLevel += 1;
      resetRound();
      renderLevel();
      startTimer();
      ui.submitBtn.disabled = false;
      ui.hintBtn.disabled = false;
      ui.skipBtn.disabled = false;
    }, 1250);
  } else {
    applyTimePenalty(10, "Resposta incorreta! -10s no cronômetro.");
    setSpeech("Erro faz parte do aprendizado. Revise a lógica e tente outra vez.");
  }
}

function useHint() {
  if (!state.started || state.time <= 0 || state.usedHint) {
    return;
  }
  const level = currentLevelData();
  applyTimePenalty(12, `Dica: ${level.hint}`);
  state.usedHint = true;
  setSpeech("Dica liberada! Use com estratégia para manter uma boa pontuação.");
}

function resetRound() {
  state.tries = 0;
  state.usedHint = false;
  state.time = state.baseTime;
}

function restartLevel() {
  if (!state.started) {
    return;
  }
  resetRound();
  renderLevel();
  startTimer();
  ui.submitBtn.disabled = false;
  ui.hintBtn.disabled = false;
  setSpeech("Nível reiniciado. Respire fundo e depure o desafio passo a passo.");
}

function startGame() {
  state.started = true;
  state.currentLevel = 0;
  state.score = 0;
  resetRound();
  renderLevel();
  startTimer();

  ui.submitBtn.disabled = false;
  ui.skipBtn.disabled = false;
  ui.hintBtn.disabled = false;
  ui.startBtn.textContent = "Recomeçar jogo";
  setSpeech("Cronômetro iniciado! Seu objetivo é abrir todas as portas antes do tempo zerar.");
}

function finishGame() {
  state.started = false;
  clearInterval(state.timerInterval);

  ui.finalText.textContent = `Pontuação final: ${state.score}. Você concluiu ${levels.length} salas de lógica e programação!`;
  ui.finalModal.classList.remove("hidden");
  setSpeech("Você escapou com maestria! Continue treinando para se tornar um mestre do código.");
}

ui.startBtn.addEventListener("click", startGame);
ui.submitBtn.addEventListener("click", evaluateAnswer);
ui.hintBtn.addEventListener("click", useHint);
ui.skipBtn.addEventListener("click", restartLevel);
ui.restartGame.addEventListener("click", () => {
  ui.finalModal.classList.add("hidden");
  startGame();
});

renderLevel();
updateStats();
