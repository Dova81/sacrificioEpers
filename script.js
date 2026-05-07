const output = document.getElementById("output");
const form = document.getElementById("terminal-form");
const input = document.getElementById("terminal-input");

// === ZONA EDITABLE DE ACERTIJOS ===
const RIDDLES = [
  {
    text: "Soy un guardián de la verdad en una accion: o todo se cumple o nada sucede.",
    answers: ["atomicidad", "atómica", "atomicity"],
  },
  {
    text: "Aunque dos rituales se lancen al mismo tiempo, impido que se corrompan entre sí.",
    answers: ["aislamiento", "aislado", "isolation", "isolated"],
  },
  {
    text: "Tras existir, nada puede destruirme.",
    answers: ["durabilidad", "durability"],
  },
  {
    text: "Donde sea que soy invocdo, soy siempre el mismo.",
    answers: ["estado persistente", "persistencia", "durable state", "estado durable"],
  },
];
// ================================

const SECRET_COMMAND = "abaddon";
const SOUND_ENABLED = true;
const PROMPT_PREFIX = "C:\\RITUAL>";
const AMBIENT_VOLUME_LEVEL = 0.022;
const WOBBLE_FREQUENCY = 0.1;
const WOBBLE_FREQUENCY_DEVIATION = 3;
const AMBIENT_FADE_OUT_DURATION = 0.25;
const AMBIENT_STOP_DELAY = 0.28;
let audioContext = null;
let lastTypeBeepAt = 0;
let ambientStarted = false;
let ambientNodes = null;

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
  "Tip: usa 'sound on' o 'sound off' para el ambiente.",
];

let challengeStarted = false;
let solved = false;
let writing = Promise.resolve();
let currentRiddleIndex = 0;

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function startAmbientSound() {
  if (!SOUND_ENABLED || ambientStarted) return;
  const ctx = ensureAudioContext();
  const master = ctx.createGain();
  const droneA = ctx.createOscillator();
  const droneB = ctx.createOscillator();
  const wobble = ctx.createOscillator();
  const wobbleGain = ctx.createGain();

  master.gain.value = AMBIENT_VOLUME_LEVEL;
  droneA.type = "triangle";
  droneA.frequency.value = 58;
  droneB.type = "sine";
  droneB.frequency.value = 87;
  wobble.type = "sine";
  wobble.frequency.value = WOBBLE_FREQUENCY;
  wobbleGain.gain.value = WOBBLE_FREQUENCY_DEVIATION;

  wobble.connect(wobbleGain);
  wobbleGain.connect(droneB.frequency);
  droneA.connect(master);
  droneB.connect(master);
  master.connect(ctx.destination);

  droneA.start();
  droneB.start();
  wobble.start();

  ambientNodes = { master, droneA, droneB, wobble, wobbleGain };
  ambientStarted = true;
}

function stopAmbientSound() {
  if (!ambientStarted || !ambientNodes) return;
  const { droneA, droneB, wobble, master } = ambientNodes;
  const now = audioContext?.currentTime ?? 0;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + AMBIENT_FADE_OUT_DURATION);
  droneA.stop(now + AMBIENT_STOP_DELAY);
  droneB.stop(now + AMBIENT_STOP_DELAY);
  wobble.stop(now + AMBIENT_STOP_DELAY);
  ambientNodes = null;
  ambientStarted = false;
}

function playBeep(frequency = 880, duration = 0.03, volume = 0.015) {
  if (!SOUND_ENABLED) return;
  const ctx = ensureAudioContext();
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
  appendLine("  restart - Reinicia la prueba iniciática");
  appendLine("  clear - Limpia la terminal");
  appendLine("  sound on/off - Activa o desactiva sonido ambiente");
}

function formatRiddleLabel(index) {
  if (index < 0 || index >= RIDDLES.length) {
    return `ACERTIJO ?/${RIDDLES.length}`;
  }
  return `ACERTIJO ${index + 1}/${RIDDLES.length}`;
}

async function askCurrentRiddle() {
  const riddle = getCurrentRiddle();
  if (!riddle) {
    appendLine("Estado de acertijo inválido. Usa 'restart' para reintentar.", "error");
    return;
  }
  await typeLine(formatRiddleLabel(currentRiddleIndex));
  await typeLine(riddle.text);
  appendLine("Responde con una palabra o frase corta.");
}

async function startChallenge(forceRestart = false) {
  if (solved) {
    appendLine("El sello ya ha sido roto. Tu acceso permanece abierto.", "success");
    return;
  }

  if (challengeStarted && !forceRestart) {
    appendLine("La prueba ya está en curso. Responde el acertijo actual.");
    await askCurrentRiddle();
    return;
  }

  if (challengeStarted && forceRestart) {
    appendLine("Reiniciando prueba iniciática...");
  }

  challengeStarted = true;
  currentRiddleIndex = 0;
  await typeLine("RITUAL DE ACCESO // NIVEL: NEOFITO");
  await askCurrentRiddle();
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

async function processChallengeAnswer(cmd) {
  const riddle = getCurrentRiddle();
  if (!riddle) {
    appendLine("Secuencia de acertijos desincronizada. Usa 'restart'.", "error");
    return;
  }

  const isCorrect = riddle.answers.map(normalize).includes(cmd);
  if (!isCorrect) {
    denyAccess();
    return;
  }

  appendLine(`Sello ${currentRiddleIndex + 1} quebrado.`, "success");
  currentRiddleIndex += 1;

  if (currentRiddleIndex >= RIDDLES.length) {
    await grantAccess();
    return;
  }

  await askCurrentRiddle();
}

function getCurrentRiddle() {
  return RIDDLES[currentRiddleIndex] ?? null;
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

  if (cmd === "restart") {
    await startChallenge(true);
    return;
  }

  if (cmd === "sound on" || cmd === "sonido on") {
    startAmbientSound();
    appendLine("Sonido ambiente activado.");
    return;
  }

  if (cmd === "sound off" || cmd === "sonido off") {
    stopAmbientSound();
    appendLine("Sonido ambiente desactivado.");
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

  await processChallengeAnswer(cmd);
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

input.addEventListener("keydown", () => {
  playBeep(440, 0.008, 0.006);
  startAmbientSound();
});

boot();
