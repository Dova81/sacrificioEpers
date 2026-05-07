const output = document.getElementById("output");
const form = document.getElementById("terminal-form");
const input = document.getElementById("terminal-input");

// === ZONA EDITABLE DEL ACERTIJO ===
const RIDDLE_TEXT =
  "Tengo siglos de historia pero no envejezco. Guardo secretos pero no hablo. Soy invocado en la oscuridad pero no soy un demonio. ¿Qué soy?";
const RIDDLE_ANSWERS = ["libro", "un libro", "grimorio", "un grimorio"];
// ================================

const SECRET_COMMAND = "abaddon";
const SOUND_ENABLED = false;
const PROMPT_PREFIX = "C:\\RITUAL>";
let audioContext = null;
let lastTypeBeepAt = 0;

const bootLines = [
  "[OK] Iniciando Protocolo de Invocación IX...",
  "[OK] Cargando sellos de protección...",
  "[OK] Sincronizando grimorios sellados...",
  "",
  "   /\\",
  "  /  \\",
  " / /\\ \\",
  "/_/  \\_\\",
  "\\ \\  / /",
  " \\ \\/ /",
  "  \\  /",
  "   \\/",
  "",
  "Bienvenido, iniciado.",
  "Escribe 'help' para ver comandos.",
];

let challengeStarted = false;
let solved = false;
let writing = Promise.resolve();

function playBeep(frequency = 880, duration = 0.03, volume = 0.015) {
  if (!SOUND_ENABLED) return;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctx = audioContext;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function scrollToBottom() {
  output.scrollTop = output.scrollHeight;
}

function appendLine(text = "", className = "") {
  const line = document.createElement("div");
  if (className) line.className = className;
  line.textContent = text;
  output.appendChild(line);
  scrollToBottom();
}

function typeLine(text = "", className = "", speed = 12) {
  writing = writing.then(
    () =>
      new Promise((resolve) => {
        const line = document.createElement("div");
        if (className) line.className = className;
        output.appendChild(line);
        let index = 0;

        const tick = () => {
          const char = text[index] || "";
          line.textContent += char;
          if (char && char !== " ") {
            const now = performance.now();
            if (now - lastTypeBeepAt > 25) {
              playBeep(700, 0.01, 0.008);
              lastTypeBeepAt = now;
            }
          }
          index += 1;
          scrollToBottom();
          if (index <= text.length) {
            setTimeout(tick, speed);
          } else {
            resolve();
          }
        };

        tick();
      })
  );

  return writing;
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function boot() {
  for (const line of bootLines) {
    await typeLine(line);
  }
}

function printHelp() {
  appendLine("Comandos disponibles:");
  appendLine("  help  - Muestra esta ayuda");
  appendLine("  start - Inicia la prueba iniciática");
  appendLine("  clear - Limpia la terminal");
}

async function startChallenge() {
  if (solved) {
    appendLine("El sello ya ha sido roto. Tu acceso permanece abierto.", "success");
    return;
  }

  challengeStarted = true;
  await typeLine("RITUAL DE ACCESO // NIVEL: NEOFITO");
  await typeLine(RIDDLE_TEXT);
  appendLine("Escribe tu respuesta en una sola palabra o frase corta.");
}

async function grantAccess() {
  solved = true;
  await typeLine("ACCESO CONCEDIDO", "success", 22);
  appendLine("", "success");
  appendLine("      .-.", "success");
  appendLine("   .-'   '-.", "success");
  appendLine("  /  .-.-.  \\", "success");
  appendLine(" |  /  |  \\  |", "success");
  appendLine(" |  \\  |  /  |", "success");
  appendLine("  \\  '-'  /", "success");
  appendLine("   '-.___.-'", "success");
  appendLine("", "success");
  appendLine("El grimorio te reconoce. Cruza el umbral.", "success");
}

function denyAccess() {
  appendLine("Las sombras no repiten tu palabra. Intenta de nuevo.", "error");
}

async function runCommand(rawValue) {
  const cmd = normalize(rawValue);
  if (!cmd) return;

  appendLine(`${PROMPT_PREFIX} ${rawValue}`);

  if (cmd === "help") {
    printHelp();
    return;
  }

  if (cmd === "clear") {
    output.textContent = "";
    return;
  }

  if (cmd === "start") {
    await startChallenge();
    return;
  }

  if (cmd === SECRET_COMMAND) {
    appendLine("[EASTER EGG] El Ojo del Vacío pestañea y luego calla.");
    return;
  }

  if (!challengeStarted) {
    appendLine("Comando no reconocido. Usa 'help' para orientación.");
    return;
  }

  const isCorrect = RIDDLE_ANSWERS.map(normalize).includes(cmd);
  if (isCorrect) {
    await grantAccess();
    return;
  }

  denyAccess();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = input.value;
  input.disabled = true;
  playBeep(980, 0.02, 0.01);
  try {
    await runCommand(value);
    input.value = "";
  } finally {
    input.disabled = false;
    input.focus();
  }
});

input.addEventListener("keydown", () => playBeep(440, 0.008, 0.006));

boot();
