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
    answers: ["consistency", "consistencia"],
  },
];
// ================================

const SECRET_COMMAND = "abaddon";
const RDJ_COMMANDS = ["rdj"];
const SOUND_ENABLED = true;
const PROMPT_PREFIX = "C:\\RITUAL>";
const AMBIENT_VOLUME_LEVEL = 0.022;
const WOBBLE_FREQUENCY = 0.1;
const WOBBLE_FREQUENCY_DEVIATION = 3;
const AMBIENT_FADE_OUT_DURATION = 0.25;
const AMBIENT_STOP_DELAY = 0.28;
const VOICE_LOADING_TIMEOUT_MS = 800;
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

const RDJ_NARRATION = [
  "Un maremoto de terror primigenio nos devoró tras la apertura del ataúd en las entrañas húmedas del cementerio. En ese breve instante, asfixiados por el temor hacia lo inefable, sentimos como algo dentro nuestro se había desaparecido y transferido a otro lugar. Algo tan sutil como un aliento, tan definitivo la extinción de una estrella.",
  "Cuando la sensación finalmente cedió, sólo quedó la certeza inquietante de que algo muy peligroso había sucedido, aunque no sabíamos qué. En la tumba no encontramos nada.",
  "Al salir de la catacumba, el cementerio parecía normal. Aunque nos sintiéramos bien, terminamos ese día con la certeza de que algo que guardábamos con recelo sin saberlo había sido arrebatado de nosotros.",
  "Las semanas subsiguientes transcurrieron en una espiral descendente hacia la comprensión de lo incomprensible. La sensación de pérdida de algo esencial en nosotros no desapareció, pero nos acostumbramos lo suficiente para continuar con nuestra misión. Los informes de desapariciones nocturnas aumentaban exponencialmente día tras día, y lo más inquietante: una parodia grotesca del milagro de Lázaro; las personas aparecían al día siguiente, pero diferentes.",
  "Los bautizamos como \"los poseídos\". Cuando previas desapariciones solo resultaban en fenómenos extraños desarrollándose alrededor de los desaparecidos, estos poseídos ya eran hombres directamente dominados por demonios y despojados de su humanidad, sembrando el caos por la ciudad, destruyendo todo a su paso, creando más poseídos de manera forzosa, corrompiendo almas inocentes y asesinando o torturando a quienes se resistían. Sea lo que sea que robaron de nosotros, los demonios lo estaban utilizando para forzar su conexión sobre almas inocentes.",
  "A espaldas del caos, refugiado en mi lecho, una pregunta me atormentaba noche tras noche como una espada de Damocles suspendida sobre mi cordura: ¿Por qué osamos introducirnos en aquellos dominios ocultos? ¡Todo esto era nuestra culpa! ¿Por qué volamos hacia el sol del conocimiento prohibido cuando sabíamos que nuestras alas eran de cera y plumas?",
  "Oh sabiduría profana, oh llama del saber, volamos hacia tu abrazo incandescente y no solo nuestras frágiles alas se consumieron en tu resplandor, sino que la negra cera que las unía ahora caía como lluvia de brea ardiente sobre las cabezas de corderos, ajenos a nuestras transgresiones, transformando su carne, deformando sus huesos, pervirtiendo sus almas inocentes. Y sin embargo he aquí mi más horrible confesión: ¿Por qué persistía aún en mí este anhelo febril por saber más? ¿Por qué no podía parar de sentir el sabor metálico y tibio de mi propia sangre al morder fuertemente mis dedos, incapaz de sostener la ansiedad provocada por el éxtasis liberador de encajar una pieza más en este terrible rompecabezas infernal?",
  "Podía ver en los rostros fantasmales de mis compañeros que no era el único cuyos párpados se negaban a cerrarse ante el terror de los sueños que aguardaban. Teníamos que terminar con esta pesadilla. Ya habíamos probado buscando respuestas en cementerios, y los resultados habían sido funestos. ¿Por qué no probar ahora en los santuarios? Abrimos Google Maps y encontramos un viejo santuario francés aislado en las afueras de la ciudad. Según investigaciones posteriores, allí residían varios ángeles que podrían protegernos del continuo deterioro mental del cual ya no podíamos escapar. Ese sería nuestro próximo destino.",
  "Fuimos allí y nos refugiamos en el santuario. La noche profundizaba su cernir sobre nosotros y el viento arremetía con tal intensidad que temíamos que el santuario pudiera derrumbarse. El tiempo era nuestro enemigo; los poseídos se multiplicaban sin cesar, y cada segundo perdido nos acercaba más a nuestra perdición y a la de todos.",
  "Ya entrada la media noche, tras testear una simulación finalmente fallida en la que habíamos estado trabajando durante horas, las puertas del santuario se abrieron de golpe, dejando entrar de manera violenta el viento de la tormenta, volcando todo y apagando las luces. La oscuridad nos envolvió, rota únicamente por el pálido brillo de la luna que se filtraba a través de las puertas abiertas.",
  "En esa tenue iluminación, distinguimos una silueta humanoide avanzando por el pasillo de entrada. Pero no caminaba; flotaba en el aire. Jamás habíamos visto algo así, y apenas tuvimos tiempo de asimilarlo antes de que todo a nuestro alrededor comenzara a levitar y a arder en llamas. Este poseído mostraba poderes que superaban cualquier cosa que hubiéramos visto antes.",
  "El terror por nuestras vidas y la posibilidad de que todo hubiera sido en vano nos paralizó. Pero entonces, de repente, todo... se detuvo. Las llamas se extinguieron como si nunca hubieran existido, los objetos flotantes cayeron estrepitosamente al suelo, y el poseído se desplomó de rodillas frente a nosotros.",
  "Una figura extraña emergió detrás de él, empapada como si hubiera surgido de las entrañas de la tormenta. Se acercó al poseído con una calma inquietante, posó sus dedos sobre su frente, y en un instante, el poseído cayó al suelo, inmóvil, incapacitado, exorcizado.",
  "La figura nos miró entonces, sus ojos profundos y antiguos como abismos, y comenzó a caminar hacia nosotros.",
  "Un solo paso.",
  "Nuestros corazones se estremecieron. ¿Era salvación o condena lo que traía consigo? No lo sabíamos, pero de su ser emanaba una dualidad imposible: una pureza angelical y una corrupción demoníaca que se entrelazaban en un torbellino de energías opuestas.",
  "Dio un paso más.",
  "Detrás de él, una sombra danzaba, girando como un remolino de humo oscuro, adquiriendo formas grotescas y retorcidas, una silueta que mutaba con cada latido, volviéndose cada vez más monstruosa, más tangible.",
  "Otro paso.",
  "El aire se volvió espeso, pesado, y un sudor frío comenzó a formarse detrás de nuestras nucas.",
  "Otro paso.",
  "Una sensación de opresión y temor forzó a más de uno a caer de rodillas al suelo, incapaces de soportar el peso de lo que se acercaba. La sombra que lo seguía ahora se contorsionaba en una forma demoníaca, afilada, retorcida, hambrienta.",
  "Finalmente, la figura llegó lo suficientemente cerca como para que podamos distinguir sus rasgos. Era un muchacho. Estaba agotado, con los ojos cargados de una preocupación insondable, como si su misma existencia fuera una carga demasiado pesada.",
  "Mantuvo una distancia cautelosa, pero su presencia lo llenaba todo.",
  "\"Verán, yo soy RDJ.\"",
  "\"Aunque no me comporte como tal, yo también soy un poseído.\"",
  "RDJ se veía como un muchacho joven, no muy distinto que cualquiera si se ignoraba su antebrazo, o mejor dicho, la ausencia de él. Su extremidad había sido brutalmente arrancada, dejando un muñón grotesco que aún chorreaba sangre oscura. Cada paso que RDJ daba parecía dejar una huella de sangre detrás, como si la propia tierra estuviera marcada por su dolor y su lucha.",
  "\"Estuve allí, cuando llegaron a la catacumba. Intenté detenerlos, golpeé en las puertas de la catacumba gritando sus nombres, pero fue demasiado tarde. Algo sucedió allí que me expulsó del cementerio, pero ahora estoy aquí para ayudarlos a arreglar este apocalipsis.\" - les dice, forzando una sutil sonrisa - \"Todo esto tiene solución. Necesito que me acompañen a donde comenzó todo.\"",
  "Detrás de RDJ, el demonio observaba. Él también había estado allí, él fue quien robó algo de nosotros. No lo habíamos visto, pero lo sabíamos. Su figura oscura se contorsionaba en el aire como una sombra viva, imposible de definir con claridad, pero su único ojo, brillante y maligno, lo veía todo. Una sonrisa torcida se dibujó en su rostro, sus colmillos reluciendo con una malevolencia palpable. Por más que RDJ les prometiera salvación, el demonio, en su risa cruel, nos recordaba que estábamos jugando un juego cuyo desenlace ya había sido escrito, y no a favor de nosotros.",
  "Mis dedos aún lacerados se movían inquietos en mis bolsillos; al final, no pude evitar sonreír.",
];

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
  appendLine("  rdj - Desbloquea la narración secreta");
}

function narrateWithSpeechSynthesis(text) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    appendLine("Audio no disponible en este navegador.", "error");
    return;
  }

  const speech = window.speechSynthesis;
  if (speech.speaking || speech.pending) {
    speech.cancel();
  }

  const chunks = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!chunks.length) return;

  const speakChunks = (voice) => {
    const queue = [...chunks];
    const speakNext = () => {
      const nextText = queue.shift();
      if (!nextText) return;
      const utterance = new SpeechSynthesisUtterance(nextText);
      utterance.lang = "es-ES";
      utterance.rate = 0.95;
      utterance.pitch = 0.85;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;
      utterance.onend = speakNext;
      speech.speak(utterance);
    };
    speakNext();
  };

  const trySpeakWithVoice = () => {
    const voices = speech.getVoices();
    if (!voices.length) return false;
    const spanishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("es"));
    speakChunks(spanishVoice ?? null);
    return true;
  };

  if (!trySpeakWithVoice()) {
    const onVoicesReady = () => {
      if (!trySpeakWithVoice()) return;
      speech.removeEventListener("voiceschanged", onVoicesReady);
    };
    speech.addEventListener("voiceschanged", onVoicesReady);
    setTimeout(() => {
      speech.removeEventListener("voiceschanged", onVoicesReady);
      if (!speech.speaking && !speech.pending) {
        speakChunks(null);
      }
    }, VOICE_LOADING_TIMEOUT_MS);
  }
}

function runRdjEasterEgg() {
  appendLine("[EASTER EGG] Protocolo RDJ activado.", "success");
  appendLine("");
  RDJ_NARRATION.forEach((paragraph) => {
    appendLine(paragraph);
    appendLine("");
  });
  narrateWithSpeechSynthesis(RDJ_NARRATION.join("\n\n"));
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

  if (RDJ_COMMANDS.includes(cmd)) {
    runRdjEasterEgg();
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
