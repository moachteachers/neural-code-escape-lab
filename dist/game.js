let worldModulePromise = null;

function loadWorldModule() {
  if (!worldModulePromise) {
    worldModulePromise = import("./world3d.js?v=48").catch((error) => {
      worldModulePromise = null;
      throw error;
    });
  }
  return worldModulePromise;
}

const STORAGE_KEY = "neural-code-escape.floor1.v2";
const LEGACY_STORAGE_KEY = "neural-code-escape.v1";
const SAVE_VERSION = 4;
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const AVATARS = [
  { id: "noa", name: "ד״ר נועה לוין", role: "חוקרת חישוביות עצבית" },
  { id: "amir", name: "ד״ר אמיר אופק", role: "חוקר פיזיולוגיה של המוח" },
  { id: "maya", name: "ד״ר מאיה טנאקה", role: "חוקרת קידוד חושי" },
  { id: "daniel", name: "ד״ר דניאל רוזן", role: "חוקר ממשקי מוח–מחשב" },
  { id: "leila", name: "ד״ר ליילה ראו", role: "חוקרת רשתות ביולוגיות" },
  { id: "yoav", name: "ד״ר יואב שטיין", role: "מוביל מעבדת הקוד העצבי" }
];

let ROOMS = [
  "חדר החישוביות",
  "חדר הקולטנים",
  "מעבדת הסידן",
  "ליבת האינטגרציה"
];

let PUZZLES = [
  {
    id: "twins",
    title: "חידה 1: איתן ועמית",
    riddleSrc: "puzzles/dendritic-riddle-1.html?v=54",
    item: "key"
  },
  {
    id: "basketball",
    title: "חידה 2: הכדורסלן",
    riddleSrc: "puzzles/dendritic-riddle-2.html?v=54",
    item: "cell"
  },
  {
    id: "songs",
    title: "חידה 3: השירים האהובים",
    riddleSrc: "puzzles/dendritic-riddle-3.html?v=54",
    item: "code"
  },
  {
    id: "jungle",
    title: "חידה 4: הקוף בג׳ונגל",
    riddleSrc: "puzzles/dendritic-riddle-4.html?v=54",
    item: "relic"
  }
];

let ITEMS = {
  key: {
    flag: "keyPicked",
    usedFlag: "keyUsed",
    name: "פריט קסום",
    slot: 0,
    artwork: "key",
    revealedBy: 0,
    destination: "הדלת"
  },
  cell: {
    flag: "cellPicked",
    usedFlag: "cellUsed",
    name: "פריט קסום",
    slot: 1,
    artwork: "cell",
    revealedBy: 1,
    destination: "הדלת"
  },
  code: {
    flag: "codePicked",
    usedFlag: "codeUsed",
    name: "פריט קסום",
    slot: 2,
    artwork: "code",
    revealedBy: 2,
    destination: "הדלת"
  },
  relic: {
    flag: "relicPicked",
    usedFlag: null,
    name: "פריט קסום",
    slot: 3,
    artwork: "relic",
    revealedBy: 3,
    destination: "המעלית"
  }
};

let ITEM_ORDER = ["key", "cell", "code", "relic"];

const FLOOR1_CONFIG = {
  id: 1,
  theme: "dendrite",
  floorOrdinal: "קומה ראשונה",
  floorName: "חישוביות דנדריטית",
  rooms: ROOMS,
  puzzles: PUZZLES,
  items: ITEMS,
  itemOrder: ITEM_ORDER,
  itemLabels: Object.fromEntries(Object.entries(ITEMS).map(([id, item]) => [id, item.name]))
};

const FLOOR2_ROOMS = [
  "שער הפולסים",
  "חדר התדרים",
  "מעבדת הצפנים",
  "ליבת הסיגנל"
];

const FLOOR2_PUZZLES = [
  {
    id: "skin-temperature",
    title: "פענוח טמפרטורת העור",
    riddleSrc: "puzzles/floor2/skin-temperature.html?v=52",
    item: "key"
  },
  {
    id: "movement-direction",
    title: "פענוח כיוון התנועה",
    riddleSrc: "puzzles/floor2/movement-direction.html?v=52",
    item: "cell"
  },
  {
    id: "hippocampal-object",
    title: "נוירון אובייקטים בהיפוקמפוס",
    riddleSrc: "puzzles/floor2/hippocampal-object-neuron.html?v=53",
    item: "code"
  },
  {
    id: "language-neuron",
    title: "פענוח פעילות נוירון השפה",
    riddleSrc: "puzzles/floor2/language-neuron.html?v=52",
    item: "relic"
  }
];

const FLOOR2_ITEMS = {
  key: {
    flag: "keyPicked",
    usedFlag: "keyUsed",
    name: "פריט קסום",
    slot: 0,
    artwork: "floor2-key",
    revealedBy: 0,
    destination: "הדלת"
  },
  cell: {
    flag: "cellPicked",
    usedFlag: "cellUsed",
    name: "פריט קסום",
    slot: 1,
    artwork: "floor2-cell",
    revealedBy: 1,
    destination: "הדלת"
  },
  code: {
    flag: "codePicked",
    usedFlag: "codeUsed",
    name: "פריט קסום",
    slot: 2,
    artwork: "floor2-code",
    revealedBy: 2,
    destination: "הדלת"
  },
  relic: {
    flag: "relicPicked",
    usedFlag: null,
    name: "פריט קסום",
    slot: 3,
    artwork: "floor2-relic",
    revealedBy: 3,
    destination: "המעלית"
  }
};

const FLOOR2_CONFIG = {
  id: 2,
  theme: "cipher",
  floorOrdinal: "קומה שנייה",
  floorName: "הצפנה ופיענוח",
  rooms: FLOOR2_ROOMS,
  puzzles: FLOOR2_PUZZLES,
  items: FLOOR2_ITEMS,
  itemOrder: ITEM_ORDER,
  itemLabels: Object.fromEntries(Object.entries(FLOOR2_ITEMS).map(([id, item]) => [id, item.name]))
};

const FLOOR3_ROOMS = [
  "מבואת הצמתים",
  "חדר השכבות",
  "מעבדת המשקולות",
  "ליבת הרשת"
];

const FLOOR3_PUZZLES = [
  {
    id: "mouse-place-cells",
    title: "תאי מיקום",
    riddleSrc: "puzzles/floor3/mouse-place-cells.html?v=52",
    item: "key"
  },
  {
    id: "wormmind",
    title: "WormMind — מוח, חיווט והתנהגות",
    riddleSrc: "puzzles/floor3/wormmind.html?v=52",
    item: "cell"
  }
];

const FLOOR3_ITEMS = {
  key: {
    flag: "keyPicked",
    usedFlag: "keyUsed",
    name: "פריט קסום",
    slot: 0,
    artwork: "floor3-key",
    revealedBy: 0,
    destination: "הדלת"
  },
  cell: {
    flag: "cellPicked",
    usedFlag: "cellUsed",
    name: "פריט קסום",
    slot: 1,
    artwork: "floor3-cell",
    revealedBy: 1,
    destination: "הדלת"
  }
};

const FLOOR3_ITEM_ORDER = ["key", "cell"];

const FLOOR3_CONFIG = {
  id: 3,
  theme: "network",
  floorOrdinal: "קומה שלישית",
  floorName: "רשתות נוירונים",
  rooms: FLOOR3_ROOMS,
  puzzles: FLOOR3_PUZZLES,
  items: FLOOR3_ITEMS,
  itemOrder: FLOOR3_ITEM_ORDER,
  itemLabels: Object.fromEntries(Object.entries(FLOOR3_ITEMS).map(([id, item]) => [id, item.name]))
};

let activeFloorConfig = FLOOR1_CONFIG;
const FLOOR_EXIT_PASSWORDS = { 1: "6652", 2: "2101" };
const TEST_MODE_CODE = "2580";
const TEST_CHECKPOINTS = [
  { id: "floor1-start", label: "קומה 1 · לפני חידה 1", description: "התחנה הראשונה פעילה", floor: 1 },
  { id: "floor1-puzzle2", label: "קומה 1 · לפני חידה 2", description: "חידה 1 פתורה, התחנה השנייה פעילה", floor: 1 },
  { id: "floor1-puzzle3", label: "קומה 1 · לפני חידה 3", description: "שתי החידות הראשונות פתורות, התחנה השלישית פעילה", floor: 1 },
  { id: "floor1-puzzle4", label: "קומה 1 · לפני חידה 4", description: "שלוש החידות הראשונות פתורות, התחנה הרביעית פעילה", floor: 1 },
  { id: "floor1-room2", label: "קומה 1 · אחרי הדלת הראשונה", description: "חדר 2, עם התחנה הבאה פעילה", floor: 1 },
  { id: "floor1-elevator", label: "קומה 1 · לפני המעלית", description: "כל החידות פתורות והדרך למעלית פתוחה", floor: 1 },
  { id: "floor1-password", label: "קומה 1 · סיסמת מעבר", description: "חלון הסיסמה לקומה 2", floor: 1 },
  { id: "floor2-start", label: "קומה 2 · לפני חידה 1", description: "התחנה הראשונה פעילה", floor: 2 },
  { id: "floor2-puzzle2", label: "קומה 2 · לפני חידה 2", description: "חידה 1 פתורה, התחנה השנייה פעילה", floor: 2 },
  { id: "floor2-puzzle3", label: "קומה 2 · לפני חידה 3", description: "שתי החידות הראשונות פתורות, התחנה השלישית פעילה", floor: 2 },
  { id: "floor2-puzzle4", label: "קומה 2 · לפני חידה 4", description: "שלוש החידות הראשונות פתורות, התחנה הרביעית פעילה", floor: 2 },
  { id: "floor2-room2", label: "קומה 2 · אחרי הדלת הראשונה", description: "חדר 2, עם התחנה הבאה פעילה", floor: 2 },
  { id: "floor2-elevator", label: "קומה 2 · לפני המעלית", description: "כל החידות פתורות והדרך למעלית פתוחה", floor: 2 },
  { id: "floor2-password", label: "קומה 2 · סיסמת מעבר", description: "חלון הסיסמה לקומה 3", floor: 2 },
  { id: "floor3-start", label: "קומה 3 · לפני חידה 1", description: "התחנה הראשונה פעילה", floor: 3 },
  { id: "floor3-puzzle2", label: "קומה 3 · לפני חידה 2", description: "חידה 1 פתורה, התחנה השנייה פעילה", floor: 3 },
  { id: "floor3-final-door", label: "קומה 3 · לפני הדלת למעלית", description: "החידה האחרונה פתורה, הפריט מחכה לשימוש", floor: 3 },
  { id: "floor3-elevator", label: "קומה 3 · לפני היציאה", description: "המעלית החוצה נגישה", floor: 3 },
  { id: "ending", label: "סיום המשחק", description: "היציאה אל נוף הטבע", floor: 3 }
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSimpleProblem(index) {
  switch (index % 4) {
    case 0: {
      const a = randomInt(1, 9);
      const b = randomInt(1, 9);
      return { question: `${a} + ${b} = ?`, answer: String(a + b) };
    }
    case 1: {
      const a = randomInt(5, 12);
      const b = randomInt(1, a);
      return { question: `${a} − ${b} = ?`, answer: String(a - b) };
    }
    case 2: {
      const a = randomInt(2, 5);
      const b = randomInt(2, 5);
      return { question: `${a} × ${b} = ?`, answer: String(a * b) };
    }
    default: {
      const divisor = randomInt(2, 5);
      const quotient = randomInt(2, 6);
      return {
        question: `${divisor * quotient} ÷ ${divisor} = ?`,
        answer: String(quotient)
      };
    }
  }
}

function randomizePuzzleSet(templates, previousPuzzles = null) {
  const previousQuestions = Array.isArray(previousPuzzles)
    ? previousPuzzles.map((puzzle) => String(puzzle?.question || ""))
    : [];
  let next = [];
  for (let attempt = 0; attempt < 24; attempt += 1) {
    next = templates.map((template, index) => ({
      ...template,
      ...randomSimpleProblem(index)
    }));
    const questions = next.map((puzzle) => puzzle.question);
    if (questions.join("|") !== previousQuestions.join("|")) return next;
  }
  return next;
}

function sanitizePuzzleSet(candidate, config) {
  if (config.puzzles.every((template) => template.riddleSrc)) {
    return config.puzzles.map((template) => ({ ...template }));
  }
  if (!Array.isArray(candidate) || candidate.length !== config.puzzles.length) {
    return randomizePuzzleSet(config.puzzles, candidate);
  }
  const isStaticDefault = candidate.every((saved, index) =>
    String(saved?.question || "") === config.puzzles[index].question &&
    String(saved?.answer || "") === config.puzzles[index].answer
  );
  if (isStaticDefault) return randomizePuzzleSet(config.puzzles, candidate);
  return config.puzzles.map((template, index) => {
    const saved = candidate[index];
    const question = String(saved?.question || "");
    const answer = String(saved?.answer || "");
    return {
      ...template,
      question: /^\d+\s*[+−×÷-]\s*\d+\s*=\s*\?$/.test(question) ? question : template.question,
      answer: /^\d+$/.test(answer) ? answer : template.answer
    };
  });
}

function floorConfigFor(floor) {
  return floor === 3 ? FLOOR3_CONFIG : floor === 2 ? FLOOR2_CONFIG : FLOOR1_CONFIG;
}

function applyFloorConfig(config, puzzleSet = null) {
  activeFloorConfig = config?.id === 3
    ? FLOOR3_CONFIG
    : config?.id === 2
      ? FLOOR2_CONFIG
      : FLOOR1_CONFIG;
  ROOMS = activeFloorConfig.rooms;
  PUZZLES = Array.isArray(puzzleSet) && puzzleSet.length === activeFloorConfig.puzzles.length
    ? puzzleSet
    : activeFloorConfig.puzzles;
  ITEMS = activeFloorConfig.items;
  ITEM_ORDER = activeFloorConfig.itemOrder;
}
const MOVE_CONTROLS = ["forward", "backward", "left", "right"];

const systemMotionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");

function $(id) {
  return document.getElementById(id);
}

const refs = {
  startScreen: $("startScreen"),
  avatarScreen: $("avatarScreen"),
  gameScreen: $("gameScreen"),
  endingScreen: $("endingScreen"),
  newGameBtn: $("newGameBtn"),
  continueBtn: $("continueBtn"),
  howToBtn: $("howToBtn"),
  avatarGrid: $("avatarGrid"),
  avatarPreviewArt: $("avatarPreviewArt"),
  avatarPreviewName: $("avatarPreviewName"),
  avatarPreviewField: $("avatarPreviewField"),
  avatarConfirmBtn: $("avatarConfirmBtn"),
  avatarBackBtn: $("avatarBackBtn"),
  playRegion: $("playRegion"),
  worldCanvas: $("worldCanvas"),
  reticle: $("reticle"),
  hudAvatarArt: $("hudAvatarArt"),
  floorOrdinal: $("floorOrdinal"),
  floorName: $("floorName"),
  roomName: $("roomName"),
  puzzleProgress: $("puzzleProgress"),
  objectiveText: $("objectiveText"),
  messageCard: $("messageCard"),
  messageKicker: $("messageKicker"),
  messageText: $("messageText"),
  messageArt: $("messageArt"),
  inventoryItems: $("inventoryItems"),
  puzzlePanel: $("puzzlePanel"),
  riddlePuzzleView: $("riddlePuzzleView"),
  mathPuzzleView: $("mathPuzzleView"),
  riddleFrame: $("riddleFrame"),
  riddleStatus: $("riddleStatus"),
  puzzleTitle: $("puzzleTitle"),
  puzzleQuestion: $("puzzleQuestion"),
  puzzleAnswer: $("puzzleAnswer"),
  puzzleForm: $("puzzleForm"),
  puzzleFeedback: $("puzzleFeedback"),
  closePuzzleBtn: $("closePuzzleBtn"),
  elevatorCodePanel: $("elevatorCodePanel"),
  elevatorCodeTitle: $("elevatorCodeTitle"),
  elevatorCodePrompt: $("elevatorCodePrompt"),
  elevatorCodeLabel: $("elevatorCodeLabel"),
  elevatorCodeInput: $("elevatorCodeInput"),
  elevatorCodeForm: $("elevatorCodeForm"),
  elevatorCodeFeedback: $("elevatorCodeFeedback"),
  closeElevatorCodeBtn: $("closeElevatorCodeBtn"),
  menuPanel: $("menuPanel"),
  menuBtn: $("menuBtn"),
  resumeBtn: $("resumeBtn"),
  testModeBtn: $("testModeBtn"),
  testModeMenuBtn: $("testModeMenuBtn"),
  endingTestModeBtn: $("endingTestModeBtn"),
  testModePasswordBtn: $("testModePasswordBtn"),
  testModeDialog: $("testModeDialog"),
  testModeCloseBtn: $("testModeCloseBtn"),
  testModeLockedView: $("testModeLockedView"),
  testModeUnlockedView: $("testModeUnlockedView"),
  testModeForm: $("testModeForm"),
  testModeCodeInput: $("testModeCodeInput"),
  testModeFeedback: $("testModeFeedback"),
  testCheckpointGrid: $("testCheckpointGrid"),
  testModeExitBtn: $("testModeExitBtn"),
  musicToggle: $("musicToggle"),
  effectsToggle: $("effectsToggle"),
  motionToggle: $("motionToggle"),
  restartBtn: $("restartBtn"),
  homeBtn: $("homeBtn"),
  controlsZone: $("controlsZone"),
  interactBtn: $("interactBtn"),
  completionPanel: $("completionPanel"),
  completionTitle: $("completionTitle"),
  completionText: $("completionText"),
  completionRestartBtn: $("completionRestartBtn"),
  completionHomeBtn: $("completionHomeBtn"),
  endingBackdrop: $("endingBackdrop"),
  endingAvatar: $("endingAvatar"),
  endingCard: $("endingCard"),
  endingTitle: $("endingTitle"),
  endingText: $("endingText"),
  playAgainBtn: $("playAgainBtn"),
  endingHomeBtn: $("endingHomeBtn"),
  infoModal: $("infoModal"),
  navigationStatus: $("navigationStatus")
};

let state = loadState();
applyFloorConfig(floorConfigFor(state.floor), state.puzzles);
let world = null;
let currentScreen = "start";
let selectedAvatar = Math.max(0, AVATARS.findIndex((avatar) => avatar.id === state.avatar));
let avatarSelectionMode = "new";
let activePuzzle = null;
let currentRoom = 0;
let nearbyId = null;
let hudMode = "default";
let pendingFloorPassword = null;
let clockStartedAt = null;
let poseSaveTimer = 0;
let saveInterval = 0;
let turnTimers = new Map();
let lastPointerTurnAt = 0;
let infoOpener = null;
let completionTimer = 0;
let endingWalkTimer = 0;
let endingFrameTimer = 0;
let testModeUnlocked = false;
let testModeActive = false;
let testModeSnapshot = null;
let testModeDialogPreviousMode = "default";

function freshFlags() {
  return {
    keyPicked: false,
    keyUsed: false,
    cellPicked: false,
    cellUsed: false,
    codePicked: false,
    codeUsed: false,
    relicPicked: false,
    passwordDoor0Used: false,
    passwordDoor1Used: false,
    elevatorUnlocked: false
  };
}

function randomDigit() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % 10;
  }
  return Math.floor(Math.random() * 10);
}

function generateElevatorCode(previousCode = null) {
  let next = Array.from({ length: 4 }, randomDigit);
  const previous = Array.isArray(previousCode)
    ? previousCode.map((digit) => Number(digit))
    : null;
  while (previous && previous.length === 4 && next.every((digit, index) => digit === previous[index])) {
    next = Array.from({ length: 4 }, randomDigit);
  }
  return next;
}

function sanitizeElevatorCode(candidate, previousCode = null) {
  if (!Array.isArray(candidate) || candidate.length !== 4) {
    return generateElevatorCode(previousCode);
  }
  const clean = candidate.map((digit) => Number(digit));
  return clean.every((digit) => Number.isInteger(digit) && digit >= 0 && digit <= 9)
    ? clean
    : generateElevatorCode(previousCode);
}

function freshState(settings = {}, previousCode = null, previousPuzzles = null) {
  const legacySoundEnabled = settings.sound !== false;
  return {
    version: SAVE_VERSION,
    avatar: null,
    started: false,
    finished: false,
    awaitingFloorPassword: null,
    floor: 1,
    completed: [false, false, false, false],
    flags: freshFlags(),
    elevatorCode: generateElevatorCode(previousCode),
    puzzles: FLOOR1_CONFIG.puzzles.map((puzzle) => ({ ...puzzle })),
    pose: { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 },
    settings: {
      music: typeof settings.music === "boolean" ? settings.music : legacySoundEnabled,
      effects: typeof settings.effects === "boolean" ? settings.effects : legacySoundEnabled,
      reducedMotion:
        typeof settings.reducedMotion === "boolean"
          ? settings.reducedMotion
          : Boolean(systemMotionPreference?.matches)
    },
    stats: {
      wrong: 0,
      activeMs: 0
    }
  };
}

function sanitizePose(candidate) {
  const fallback = { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 };
  const clean = {};
  for (const key of Object.keys(fallback)) {
    const number = Number(candidate?.[key]);
    clean[key] = Number.isFinite(number) ? number : fallback[key];
  }
  clean.x = Math.max(-40, Math.min(40, clean.x));
  clean.z = Math.max(-40, Math.min(40, clean.z));
  return clean;
}

function sanitizeState(saved) {
  const clean = freshState(saved?.settings || {}, saved?.elevatorCode);
  if (!saved || typeof saved !== "object") return clean;

  clean.avatar = AVATARS.some((avatar) => avatar.id === saved.avatar)
    ? saved.avatar
    : null;
  clean.started = Boolean(saved.started && clean.avatar);
  clean.floor = saved.floor === 3 ? 3 : saved.floor === 2 ? 2 : 1;
  clean.awaitingFloorPassword = saved.awaitingFloorPassword === 1 || saved.awaitingFloorPassword === 2
    ? saved.awaitingFloorPassword
    : null;
  const floorConfig = floorConfigFor(clean.floor);
  const puzzleCount = floorConfig.puzzles.length;
  clean.puzzles = sanitizePuzzleSet(saved.puzzles, floorConfig);
  const oldFirstFloorMath = clean.floor === 1 && Array.isArray(saved.puzzles)
    && saved.puzzles.some((puzzle) => puzzle && ("question" in puzzle || "answer" in puzzle));
  if (oldFirstFloorMath) {
    clean.completed = [false, false, false, false];
    clean.flags = freshFlags();
    clean.elevatorCode = generateElevatorCode(saved.elevatorCode);
    clean.finished = false;
    clean.pose = { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 };
  } else {
    clean.completed = Array.from({ length: puzzleCount }, (_, index) =>
      Boolean(saved.completed?.[index])
    );
    for (const key of Object.keys(clean.flags)) {
      clean.flags[key] = Boolean(saved.flags?.[key]);
    }
    // Older saves used the teacher passwords on room doors. Treat those
    // completed door steps as already-used magical items after the flow change.
    clean.flags.keyUsed = clean.flags.keyUsed || clean.flags.passwordDoor0Used;
    clean.flags.cellUsed = clean.flags.cellUsed || clean.flags.passwordDoor1Used;
    clean.elevatorCode = sanitizeElevatorCode(saved.elevatorCode, clean.elevatorCode);
    clean.pose = sanitizePose(saved.pose);
  }
  clean.stats.wrong = Number.isFinite(Number(saved.stats?.wrong))
    ? Math.max(0, Math.floor(Number(saved.stats.wrong)))
    : 0;
  clean.stats.activeMs = Number.isFinite(Number(saved.stats?.activeMs))
    ? Math.max(0, Number(saved.stats.activeMs))
    : 0;
  clean.finished = oldFirstFloorMath
    ? false
    : Boolean(
      saved.finished &&
      clean.completed.slice(0, puzzleCount).every(Boolean) &&
      clean.flags.elevatorUnlocked
    );
  return clean;
}

function migrateVersion3(saved) {
  const migrated = sanitizeState(saved);
  const completedOldFloor = Boolean(
    saved?.finished &&
    Array.isArray(saved.completed) &&
    saved.completed.length >= 4 &&
    saved.completed.slice(0, 4).every(Boolean) &&
    saved.flags?.elevatorUnlocked
  );
  if (completedOldFloor) {
    migrated.floor = 2;
    migrated.finished = false;
    migrated.completed = [false, false, false, false];
    migrated.flags = freshFlags();
    migrated.elevatorCode = generateElevatorCode(migrated.elevatorCode);
    migrated.puzzles = FLOOR2_CONFIG.puzzles.map((puzzle) => ({ ...puzzle }));
    migrated.pose = { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 };
  }
  migrated.version = SAVE_VERSION;
  return migrated;
}

function migratePreviousFlow(saved) {
  const migrated = freshState(saved?.settings || {});
  if (!saved || typeof saved !== "object") return migrated;
  migrated.avatar = AVATARS.some((avatar) => avatar.id === saved.avatar)
    ? saved.avatar
    : null;
  // The room flow changed substantially: keep the chosen researcher and
  // preferences, but start the new station-to-code route from room one.
  migrated.started = Boolean(saved.started && migrated.avatar);
  return migrated;
}

function migrateLegacy(saved) {
  return migratePreviousFlow(saved);
}

function loadState() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (current?.version === SAVE_VERSION) return sanitizeState(current);
    if (current?.version === 3) return migrateVersion3(current);
    if (current?.version === 2) return migratePreviousFlow(current);

    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
    return migrateLegacy(legacy);
  } catch (error) {
    console.warn("לא ניתן היה לקרוא את השמירה המקומית.", error);
    return freshState();
  }
}

function saveState() {
  // Test checkpoints are intentionally ephemeral. This keeps the player's
  // real saved progress intact while allowing visual and interaction checks.
  if (testModeActive) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("לא ניתן היה לשמור את המשחק.", error);
  }
}

function startClock() {
  if (clockStartedAt === null) clockStartedAt = performance.now();
}

function captureClock(keepRunning = false) {
  if (clockStartedAt !== null) {
    state.stats.activeMs += Math.max(0, performance.now() - clockStartedAt);
  }
  clockStartedAt = keepRunning ? performance.now() : null;
}

function avatarIndex() {
  const index = AVATARS.findIndex((avatar) => avatar.id === state.avatar);
  return index < 0 ? 0 : index;
}

function setPanelVisible(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("is-active", visible);
  element.setAttribute("aria-hidden", String(!visible));
  if (element === refs.puzzlePanel && !visible) {
    document.body.classList.remove("has-open-riddle");
  }
}

function showScreen(name) {
  currentScreen = name;
  if (name !== "ending") {
    delete document.body.dataset.ending;
    clearEndingAnimation();
  }
  const screens = {
    start: refs.startScreen,
    avatar: refs.avatarScreen,
    game: refs.gameScreen,
    ending: refs.endingScreen
  };
  Object.entries(screens).forEach(([screenName, element]) => {
    setPanelVisible(element, screenName === name);
  });
  document.body.dataset.screen = name;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  if (name !== "game") {
    releaseAllControls();
    world?.stop?.();
    captureClock(false);
  }
}

function endingAtlasPosition(column, row, columns, rows) {
  const x = columns <= 1 ? 0 : (column / (columns - 1)) * 100;
  const y = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
  return `${x}% ${y}%`;
}

function clearEndingAnimation() {
  window.clearTimeout(endingWalkTimer);
  window.clearInterval(endingFrameTimer);
  endingWalkTimer = 0;
  endingFrameTimer = 0;
  refs.endingAvatar?.classList.remove("is-walking", "is-celebrating");
  if (refs.endingCard) refs.endingCard.hidden = false;
}

function setEndingWalkFrame(frame = 0) {
  if (!refs.endingAvatar) return;
  const index = avatarIndex();
  const row = index % 3;
  refs.endingAvatar.style.backgroundImage = `url("assets/3d/walk-back-atlas-${index < 3 ? "a" : "b"}.png")`;
  refs.endingAvatar.style.backgroundSize = "400% 300%";
  refs.endingAvatar.style.backgroundPosition = endingAtlasPosition(frame % 4, row, 4, 3);
}

function setEndingCelebrationPose() {
  if (!refs.endingAvatar) return;
  const index = avatarIndex();
  refs.endingAvatar.style.backgroundImage = 'url("assets/3d/ending-celebration-atlas.png")';
  refs.endingAvatar.style.backgroundSize = "300% 200%";
  refs.endingAvatar.style.backgroundPosition = endingAtlasPosition(index % 3, Math.floor(index / 3), 3, 2);
  refs.endingAvatar.classList.remove("is-walking");
  refs.endingAvatar.classList.add("is-celebrating");
}

function setAvatarArtwork(element, index, label = "") {
  if (!element) return;
  const column = index % 3;
  const row = Math.floor(index / 3);
  element.dataset.avatarIndex = String(index);
  element.style.setProperty("--avatar-column", String(column));
  element.style.setProperty("--avatar-row", String(row));
  element.style.backgroundImage = 'url("assets/avatar-sheet-family-cgi.png")';
  element.style.backgroundSize = "300% 200%";
  element.style.backgroundPosition = `${column * 50}% ${row * 100}%`;
  element.style.backgroundRepeat = "no-repeat";
  if (element instanceof HTMLImageElement) {
    element.src = TRANSPARENT_PIXEL;
    element.alt = label;
  } else if (label) {
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", label);
  }
}

function renderAvatarGallery() {
  if (!refs.avatarGrid) return;
  refs.avatarGrid.replaceChildren();
  AVATARS.forEach((avatar, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-card";
    button.dataset.avatarIndex = String(index);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(index === selectedAvatar));
    button.setAttribute("aria-pressed", String(index === selectedAvatar));
    button.classList.toggle("is-selected", index === selectedAvatar);

    const portrait = document.createElement("span");
    portrait.className = "avatar-art avatar-card__portrait";
    portrait.setAttribute("aria-hidden", "true");
    setAvatarArtwork(portrait, index);

    const copy = document.createElement("span");
    copy.className = "avatar-card-label avatar-card__copy";
    const name = document.createElement("strong");
    name.textContent = avatar.name;
    const role = document.createElement("small");
    role.textContent = avatar.role;
    copy.append(name, role);
    button.append(portrait, copy);
    button.addEventListener("click", () => selectAvatar(index));
    refs.avatarGrid.append(button);
  });
  renderAvatarPreview();
}

function selectAvatar(index) {
  selectedAvatar = Math.max(0, Math.min(AVATARS.length - 1, index));
  refs.avatarGrid?.querySelectorAll(".avatar-card").forEach((card, cardIndex) => {
    const selected = cardIndex === selectedAvatar;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-checked", String(selected));
    card.setAttribute("aria-pressed", String(selected));
  });
  renderAvatarPreview();
}

function renderAvatarPreview() {
  const avatar = AVATARS[selectedAvatar];
  setAvatarArtwork(refs.avatarPreviewArt, selectedAvatar, avatar.name);
  if (refs.avatarPreviewName) refs.avatarPreviewName.textContent = avatar.name;
  if (refs.avatarPreviewField) refs.avatarPreviewField.textContent = avatar.role;
  if (refs.avatarConfirmBtn) {
    refs.avatarConfirmBtn.textContent =
      avatarSelectionMode === "change" ? "שמירת הדמות" : "כניסה למשחק";
  }
}

function openAvatarSelection(mode = "new") {
  avatarSelectionMode = mode;
  selectedAvatar = Math.max(
    0,
    AVATARS.findIndex((avatar) => avatar.id === state.avatar)
  );
  renderAvatarGallery();
  showScreen("avatar");
  requestAnimationFrame(() => {
    refs.avatarGrid?.querySelector(".is-selected")?.focus();
  });
}

function confirmAvatar() {
  sound.unlock();
  const selected = AVATARS[selectedAvatar];
  if (avatarSelectionMode === "new") {
    const settings = { ...state.settings };
    state = freshState(settings, state.elevatorCode, state.puzzles);
    applyFloorConfig(FLOOR1_CONFIG, state.puzzles);
    state.avatar = selected.id;
    state.started = true;
  } else {
    state.avatar = selected.id;
  }
  saveState();
  enterGame(avatarSelectionMode === "change" ? "הדמות עודכנה. אפשר להמשיך לחקור." : null);
}

function currentObjective() {
  const flags = state.flags;
  if (state.finished) return "הקומה הושלמה.";
  for (let index = 0; index < PUZZLES.length; index += 1) {
    const itemId = ITEM_ORDER[index];
    const item = itemId ? ITEMS[itemId] : null;
    if (!state.completed[index]) {
      return `מצאו את תחנת החידה ${index + 1} ופתרו אותה.`;
    }
    if (item && !flags[item.flag]) {
      return "הפריט הקסום הופיע. התקרבו אליו ואספו אותו לכיס.";
    }
    if (item?.usedFlag && !flags[item.usedFlag]) {
      return "השתמשו בפריט הקסום בדלת כדי לפתוח את המעבר.";
    }
  }
  if (activeFloorConfig.id === 3 && !flags.codeUsed) {
    return "המעבר האחרון עדיין נעול. המשיכו אל הדלת והשלימו את פתיחתה.";
  }
  return state.floor === 3
    ? "הגיעו למעלית הרשת וצאו אל נוף הטבע."
    : "הגיעו למעלית ופתחו את היציאה מהקומה.";
}

function setSpriteCrop(element, slot) {
  if (!element) return;
  const column = slot % 4;
  const row = Math.floor(slot / 4);
  element.style.backgroundImage = 'url("assets/props-dendrite-sheet.png")';
  element.style.backgroundSize = "400% 200%";
  element.style.backgroundPosition = `${column * (100 / 3)}% ${row * 100}%`;
  element.style.backgroundRepeat = "no-repeat";
}

function renderInventory() {
  if (!refs.inventoryItems) return;
  refs.inventoryItems.replaceChildren();
  ITEM_ORDER.forEach((id) => {
    const item = ITEMS[id];
    const collected = state.flags[item.flag];
    const used = Boolean(item.usedFlag && state.flags[item.usedFlag]);
    const slot = document.createElement("div");
    slot.className = "inventory-item inventory-slot";
    slot.dataset.item = id;
    slot.classList.toggle("is-collected", collected);
    slot.classList.toggle("is-used", used);
    slot.setAttribute(
      "aria-label",
      !collected ? "תא ריק" : used ? `${item.name}, נעשה בו שימוש` : `${item.name}, בכיס`
    );

    const picture = document.createElement("span");
    picture.className = "inventory-item-art inventory-slot__image";
    picture.setAttribute("aria-hidden", "true");
    if (collected) {
      picture.classList.add(`inventory-item-art--${item.artwork || id}`);
    } else {
      picture.style.backgroundImage = "none";
      picture.textContent = "?";
    }

    const label = document.createElement("span");
    label.className = "inventory-item-label";
    label.textContent = collected ? item.name : "ריק";

    const status = document.createElement("span");
    status.className = "inventory-item-status";
    status.textContent = used ? "✓" : "";
    status.setAttribute("aria-hidden", "true");
    slot.append(picture, label, status);
    refs.inventoryItems.append(slot);
  });
}

function renderCodeProgress() {
  // Digits are no longer collected or displayed. This function remains as a
  // harmless compatibility hook for saved games from the previous flow.
}

function renderHud() {
  const avatar = AVATARS[avatarIndex()];
  setAvatarArtwork(refs.hudAvatarArt, avatarIndex(), avatar.name);
  document.body.dataset.floor = String(activeFloorConfig.id);
  refs.gameScreen?.setAttribute("aria-label", activeFloorConfig.floorName);
  if (refs.floorOrdinal) refs.floorOrdinal.textContent = activeFloorConfig.floorOrdinal;
  if (refs.floorName) refs.floorName.textContent = activeFloorConfig.floorName;
  if (refs.roomName) refs.roomName.textContent = ROOMS[currentRoom] || ROOMS[0];
  if (refs.puzzleProgress) {
    const puzzleCount = PUZZLES.length;
    const solvedCount = state.completed.slice(0, puzzleCount).filter(Boolean).length;
    refs.puzzleProgress.textContent = `${solvedCount} / ${puzzleCount}`;
    refs.puzzleProgress.setAttribute("aria-label", `${solvedCount} מתוך ${puzzleCount} חידות הושלמו`);
  }
  if (refs.objectiveText) refs.objectiveText.textContent = currentObjective();
  renderCodeProgress();
  renderInventory();
  renderSettings();
  updateInteractionButton();
}

function setMessage(kicker, text, itemId = null) {
  if (refs.messageKicker) refs.messageKicker.textContent = kicker;
  if (refs.messageText) refs.messageText.textContent = text;
  if (refs.messageCard) {
    refs.messageCard.dataset.kind = itemId ? "item" : "status";
  }
  if (refs.messageArt) {
    refs.messageArt.hidden = !itemId;
    refs.messageArt.classList.toggle("is-visible", Boolean(itemId));
    ["key", "cell", "code", "relic", "floor2-key", "floor2-cell", "floor2-code", "floor2-relic", "floor3-key", "floor3-cell", "floor3-code", "floor3-relic"].forEach((artwork) => {
      refs.messageArt.classList.remove(`message-item-art--${artwork}`);
    });
    if (itemId && ITEMS[itemId]) {
      refs.messageArt.setAttribute("aria-label", ITEMS[itemId].name);
      refs.messageArt.classList.add(`message-item-art--${ITEMS[itemId].artwork || itemId}`);
      refs.messageArt.style.backgroundImage = "";
    } else {
      refs.messageArt.removeAttribute("aria-label");
      refs.messageArt.style.backgroundImage = "none";
    }
  }
}

function interactionLabel(id) {
  if (!id) return "פעולה";
  if (/^puzzle\d$/.test(id)) {
    const index = Number(id.at(-1));
    return state.completed[index] ? "החידה כבר נפתרה" : "פתיחת החידה";
  }
  if (ITEMS[id]) return state.flags[ITEMS[id].flag] ? "הפריט כבר נאסף" : "איסוף הפריט";
  if (id === "exit") return state.flags.elevatorUnlocked ? "כניסה למעלית" : "פתיחת היציאה";
  if (id === "lockedDoor3") return "פתיחת היציאה";
  if (id === "lockedDoor0" || id === "lockedDoor1" || id === "lockedDoor2") return "פתיחת הדלת";
  if (id.startsWith("lockedDoor")) return "בדיקת הדלת";
  return "פעולה";
}

function updateInteractionButton() {
  if (!refs.interactBtn) return;
  let primary = refs.interactBtn.querySelector("span");
  let secondary = refs.interactBtn.querySelector("small");
  if (!primary) {
    primary = document.createElement("span");
    refs.interactBtn.append(primary);
  }
  if (!secondary) {
    secondary = document.createElement("small");
    refs.interactBtn.append(secondary);
  }
  primary.textContent = interactionLabel(nearbyId);
    secondary.textContent = nearbyId ? "E או Enter" : "אין חפץ קרוב";
  refs.interactBtn.disabled = !nearbyId || hudMode !== "default" || state.finished;
  refs.interactBtn.setAttribute(
    "aria-label",
      nearbyId ? `${interactionLabel(nearbyId)}. מקש E או Enter.` : "אין כרגע חפץ בטווח פעולה"
  );
}

function worldState() {
  return {
    completed: [...state.completed],
    puzzleCount: PUZZLES.length,
    flags: {
      ...state.flags,
      doorOpen: state.flags.keyUsed,
      socketOn: state.flags.cellUsed,
      elevatorUnlocked: state.flags.elevatorUnlocked
    },
    avatarIndex: avatarIndex(),
    reducedMotion: state.settings.reducedMotion
  };
}

function syncWorldState() {
  world?.setGameState?.(worldState());
  renderHud();
  saveState();
}

async function createWorld() {
  world?.dispose?.();
  world = null;
  if (!refs.worldCanvas) {
    setMessage("שגיאה", "אזור התלת־ממד לא נמצא בעמוד.");
    return;
  }

  try {
    const { createDendriteWorld } = await loadWorldModule();
    if (currentScreen !== "game") return;
    refs.worldCanvas?.setAttribute(
      "aria-label",
      `העולם התלת־ממדי של ${activeFloorConfig.floorName}. נווטו באמצעות מקשי התנועה או בקרי המסך.`
    );
    world = createDendriteWorld({
      canvas: refs.worldCanvas,
      theme: activeFloorConfig.theme,
      floor: activeFloorConfig.id,
      roomNames: [...ROOMS],
      itemLabels: { ...activeFloorConfig.itemLabels },
      initialState: { pose: { ...state.pose } },
      completed: [...state.completed],
      puzzleCount: PUZZLES.length,
      flags: { ...state.flags },
      avatarIndex: avatarIndex(),
      reducedMotion: state.settings.reducedMotion,
      onInteract: (id, detail) => handleWorldInteract(id, detail),
      onRoomChange: (roomIndex) => {
        currentRoom = Math.max(0, Math.min(3, Number(roomIndex) || 0));
        if (refs.roomName) refs.roomName.textContent = ROOMS[currentRoom];
      },
      onNearbyChange: (id) => {
        nearbyId = id || null;
        if (refs.navigationStatus) {
          refs.navigationStatus.textContent = nearbyId
            ? `אפשר לפעול: ${interactionLabel(nearbyId)}`
            : "אין כרגע חפץ בטווח פעולה";
        }
        updateInteractionButton();
      },
      onFootstep: () => sound.footstep(),
      onPoseChange: (pose) => queuePoseSave(pose)
    });
    world.setGameState?.(worldState());
  } catch (error) {
    console.error("יצירת העולם התלת־ממדי נכשלה.", error);
    setMessage(
      "לא ניתן להציג את העולם",
      "הדפדפן לא הצליח להפעיל תצוגת תלת־ממד. נסו לרענן את העמוד או להפעיל האצת חומרה."
    );
  }
}

function queuePoseSave(pose) {
  state.pose = sanitizePose(pose);
  window.clearTimeout(poseSaveTimer);
  poseSaveTimer = window.setTimeout(saveState, 450);
}

function enterGame(announcement = null) {
  if (!state.avatar) {
    openAvatarSelection("new");
    return;
  }
  state.started = true;
  showScreen("game");
  hudMode = "default";
  activePuzzle = null;
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.elevatorCodePanel, false);
  setPanelVisible(refs.menuPanel, false);
  setPanelVisible(refs.completionPanel, false);
  renderHud();
  if (announcement) {
    setMessage("עדכון", announcement);
  } else {
    setMessage(
      "תדריך תנועה",
      "נועו עם W A S D או החיצים; Shift+חץ ימינה/שמאלה מסובב את המבט. גררו את התמונה כדי להביט סביב."
    );
  }
  saveState();
  if (!state.finished) sound.startFloorMusic(state.floor);
  requestAnimationFrame(async () => {
    await createWorld();
    if (currentScreen !== "game") return;
    if (!state.finished) {
      world?.start?.();
      startClock();
    } else if (state.awaitingFloorPassword) {
      openFloorExitPassword(state.awaitingFloorPassword);
    } else {
      showCompletion();
    }
    refs.worldCanvas?.focus?.({ preventScroll: true });
  });
}

function prerequisiteForPuzzle(index) {
  if (index === 0) return true;
  if (index === 1) return state.flags.keyUsed;
  if (index === 2) return state.flags.cellUsed;
  return state.flags.codeUsed;
}

function missingPrerequisiteMessage(index) {
  if (index === 1) return "תחנת החידה עדיין כבויה. פתחו קודם את הדלת באמצעות הפריט הקסום הראשון.";
  if (index === 2) return "תחנת החידה עדיין כבויה. פתחו קודם את הדלת באמצעות הפריט הקסום השני.";
  if (index === 3) return "תחנת החידה עדיין כבויה. פתחו קודם את הדלת באמצעות הפריט הקסום השלישי.";
  return "התחנה עדיין אינה פעילה.";
}

function fitEmbeddedPuzzleFrame() {
  const frame = refs.riddleFrame;
  const doc = frame?.contentDocument;
  if (!frame || !doc?.head || !doc.body) return;

  frame.__neuralFitObserver?.disconnect?.();
  if (frame.__neuralFitWindow && frame.__neuralFitResizeHandler) {
    frame.__neuralFitWindow.removeEventListener("resize", frame.__neuralFitResizeHandler);
  }
  window.clearTimeout(frame.__neuralFitTimer);

  let fitStyle = doc.getElementById("neuralEscapeFrameFit");
  if (!fitStyle) {
    fitStyle = doc.createElement("style");
    fitStyle.id = "neuralEscapeFrameFit";
    fitStyle.textContent = `
      html, body {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden !important;
      }
      html { overflow-y: auto !important; }
      body {
        margin: 0 !important;
        zoom: 1 !important;
        overflow-y: auto !important;
      }
    `;
    doc.head.append(fitStyle);
  }

  doc.body.style.removeProperty("zoom");
  doc.documentElement.style.overflowY = "auto";
  doc.body.style.overflowY = "auto";
}

const embeddedPuzzleScrollDocs = new WeakSet();

function installEmbeddedPuzzleAutoScroll() {
  const frame = refs.riddleFrame;
  const doc = frame?.contentDocument;
  if (!frame || !doc?.body || embeddedPuzzleScrollDocs.has(doc)) return;
  embeddedPuzzleScrollDocs.add(doc);

  const isAnswerField = (element) =>
    element instanceof doc.defaultView?.Element &&
    (element.matches("textarea, input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]):not([type=radio]):not([type=checkbox]), [contenteditable='true']"));

  const isVisible = (element) => {
    if (!element || element.hidden || element.getAttribute("aria-hidden") === "true") return false;
    const style = doc.defaultView?.getComputedStyle(element);
    if (!style || style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const visibility = new WeakMap();
  const scrollToField = (field) => {
    window.setTimeout(() => {
      if (isVisible(field) && !field.disabled) {
        field.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }, 50);
  };

  const scan = (initial = false) => {
    doc.querySelectorAll("textarea, input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]):not([type=radio]):not([type=checkbox]), [contenteditable='true']").forEach((field) => {
      const nowVisible = isVisible(field) && !field.disabled;
      const wasVisible = visibility.get(field);
      if (!initial && nowVisible && wasVisible === false) scrollToField(field);
      visibility.set(field, nowVisible);
    });
  };

  scan(true);
  const observer = new MutationObserver(() => scan(false));
  observer.observe(doc.body, {
    attributes: true,
    attributeFilter: ["hidden", "style", "class", "disabled", "aria-hidden"],
    childList: true,
    subtree: true
  });
  doc.addEventListener("focusin", (event) => {
    if (isAnswerField(event.target)) scrollToField(event.target);
  }, true);
  frame.__neuralPuzzleScrollObserver = observer;
  window.setTimeout(() => scan(false), 120);
}

function openPuzzle(index) {
  index = Number(index);
  if (!Number.isInteger(index) || index < 0 || index >= PUZZLES.length) return false;
  if (state.completed[index]) {
    setMessage("החידה הושלמה", "התחנה הזו כבר פעילה. המשיכו אל היעד המסומן במשימה.");
    sound.tap();
    return false;
  }
  if (!prerequisiteForPuzzle(index)) {
    setMessage("התחנה אינה פעילה", missingPrerequisiteMessage(index));
    sound.error();
    return false;
  }

  sound.station();
  releaseAllControls();
  activePuzzle = index;
  hudMode = "puzzle";
  world?.stop?.();
  const puzzle = PUZZLES[index];
  if (refs.puzzleTitle) refs.puzzleTitle.textContent = puzzle.title;
  const isEmbeddedRiddle = Boolean(puzzle.riddleSrc);
  document.body.classList.toggle("has-open-riddle", isEmbeddedRiddle);
  refs.puzzlePanel?.classList.toggle("riddle-puzzle-panel", isEmbeddedRiddle);
  setPanelVisible(refs.riddlePuzzleView, isEmbeddedRiddle);
  setPanelVisible(refs.mathPuzzleView, !isEmbeddedRiddle);
  if (isEmbeddedRiddle) {
    sound.stopBackgroundMusic();
    if (refs.riddleFrame) {
      refs.riddleFrame.title = puzzle.title;
      refs.riddleFrame.src = puzzle.riddleSrc;
    }
  } else if (refs.riddleFrame) {
    refs.riddleFrame.src = "about:blank";
  }
  if (!isEmbeddedRiddle) {
    if (refs.puzzleQuestion) refs.puzzleQuestion.textContent = puzzle.question;
    if (refs.puzzleAnswer) {
      refs.puzzleAnswer.value = "";
      refs.puzzleAnswer.setAttribute("inputmode", /[A-Za-z]/.test(puzzle.answer) ? "text" : "numeric");
      refs.puzzleAnswer.setAttribute("autocomplete", "off");
    }
    if (refs.puzzleFeedback) refs.puzzleFeedback.textContent = "";
  }
  setPanelVisible(refs.menuPanel, false);
  setPanelVisible(refs.puzzlePanel, true);
  updateInteractionButton();
  if (isEmbeddedRiddle) {
    requestAnimationFrame(() => refs.riddleFrame?.focus({ preventScroll: true }));
  } else {
    requestAnimationFrame(() => refs.puzzleAnswer?.focus());
  }
  return true;
}

function closePuzzle({ resume = true, resumeMusic = true } = {}) {
  activePuzzle = null;
  hudMode = "default";
  document.body.classList.remove("has-open-riddle");
  refs.puzzlePanel?.classList.remove("riddle-puzzle-panel");
  setPanelVisible(refs.riddlePuzzleView, false);
  setPanelVisible(refs.mathPuzzleView, true);
  if (refs.riddleFrame) refs.riddleFrame.src = "about:blank";
  setPanelVisible(refs.puzzlePanel, false);
  updateInteractionButton();
  if (resume && currentScreen === "game" && !state.finished) {
    world?.start?.();
    if (resumeMusic) sound.resumeMusic();
  }
  refs.interactBtn?.focus?.({ preventScroll: true });
}

function normalizeAnswer(value) {
  return String(value ?? "")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s+/g, "")
    .toUpperCase();
}

function solvePuzzle(index, suppliedAnswer) {
  index = Number(index);
  if (!Number.isInteger(index) || index < 0 || index >= PUZZLES.length) return false;
  if (state.completed[index]) return true;
  if (!prerequisiteForPuzzle(index)) {
    setMessage("התחנה אינה פעילה", missingPrerequisiteMessage(index));
    return false;
  }

  if (PUZZLES[index].riddleSrc) {
    return completeRiddle(index);
  }

  const answer = normalizeAnswer(suppliedAnswer);
  if (answer !== PUZZLES[index].answer) {
    state.stats.wrong += 1;
    saveState();
    if (refs.puzzleFeedback) refs.puzzleFeedback.textContent = "עדיין לא. נסו שוב.";
    sound.error();
    refs.puzzleAnswer?.select();
    return false;
  }

  state.completed[index] = true;
  sound.solve();
  closePuzzle({ resume: true });
  syncWorldState();
  sound.reveal();
  setMessage(
    "החידה נפתרה",
    "פריט קסום הופיע בחדר. אספו אותו לכיס והמשיכו אל הדלת.",
    null
  );
  return true;
}

function completeRiddle(index) {
  index = Number(index);
  if (!Number.isInteger(index) || index < 0 || index >= PUZZLES.length) return false;
  if (state.completed[index]) return true;
  state.completed[index] = true;
  saveState();
  sound.solveThen(() => {
    sound.reveal();
    window.setTimeout(() => sound.resumeMusic(), 1100);
  });
  closePuzzle({ resume: true, resumeMusic: false });
  syncWorldState();
  setMessage(
    "החידה נפתרה",
    "פריט קסום הופיע בחדר. אספו אותו לכיס והמשיכו אל הדלת.",
    null
  );
  return true;
}

function collectItem(id) {
  const item = ITEMS[id];
  if (!item) return false;
  if (!state.completed[item.revealedBy]) {
    setMessage("אין כאן פריט עדיין", "פתרו קודם את החידה שבחדר.");
    sound.error();
    return false;
  }
  if (state.flags[item.flag]) {
    setMessage("כבר בכיס", `${item.name} כבר נמצא בכיס שלכם. היעד שלו: ${item.destination}.`, id);
    sound.tap();
    return true;
  }

  state.flags[item.flag] = true;
  sound.collect();
  syncWorldState();
  setMessage(
    "פריט נאסף לכיס",
    item.usedFlag
      ? `אספתם ${item.name}. קחו אותו אל ${item.destination} כדי לפתוח את המעבר.`
      : `אספתם ${item.name}. המשיכו אל ${item.destination}.`,
    id
  );
  return true;
}

function explainLockedDoor(id) {
  const match = String(id).match(/(\d)$/);
  const index = match ? Number(match[1]) : currentRoom;
  const puzzleCount = PUZZLES.length;
  const solved = state.completed.slice(0, puzzleCount).every(Boolean);
  if (activeFloorConfig.id === 3 && puzzleCount <= 2 && index === 2) {
    if (!solved) {
      setMessage("המעבר נעול", `פתרו את כל ${puzzleCount} תחנות החידה לפני המעבר האחרון.`);
    } else if (!state.flags.cellPicked) {
      setMessage("המעבר נעול", "אספו קודם את הפריט הקסום השני שהופיע לאחר פתרון התחנה.");
    } else if (!state.flags.cellUsed) {
      setMessage("המעבר נעול", "השתמשו בפריט הקסום השני כדי לפתוח את המעבר האחרון.");
    } else {
      setMessage("המעבר נעול", "השלימו את פתיחת המעבר והמשיכו אל המעלית.");
    }
    sound.error();
    return;
  }
  if (index >= 0 && index < Math.min(3, puzzleCount)) {
    const item = ITEMS[ITEM_ORDER[index]];
    if (!state.completed[index]) {
      setMessage("הדלת נעולה", `פתרו קודם את תחנת החידה ${index + 1}.`);
    } else if (item && !state.flags[item.flag]) {
      setMessage("הדלת נעולה", `אספו קודם את ${item.name} שהופיע לאחר פתרון התחנה.`);
    } else if (item?.usedFlag && !state.flags[item.usedFlag]) {
      setMessage("הדלת נעולה", `השתמשו ב${item.name} כדי לפתוח את המעבר.`);
    } else {
      setMessage("המעבר נעול", "השלימו את התחנות הקודמות והמשיכו לפי המשימה.");
    }
    sound.error();
    return;
  }
  const allSolved = state.completed.slice(0, puzzleCount).every(Boolean);
  const finalItem = ITEMS[ITEM_ORDER[puzzleCount - 1]];
  if (!allSolved) {
    setMessage("המעלית נעולה", `פתרו את כל ${puzzleCount} תחנות החידה לפני היציאה.`);
  } else if (finalItem && !state.flags[finalItem.flag]) {
    setMessage("המעלית נעולה", "אספו קודם את הפריט הקסום האחרון שהופיע בחדר.");
  } else if (activeFloorConfig.id === 3 && !state.flags.codeUsed) {
    setMessage("המעלית נעולה", "פתחו קודם את המעבר האחרון באמצעות הפריט הקסום השני.");
  } else {
    setMessage("המעלית ממתינה", "הגיעו אליה כדי לצאת מהקומה.");
  }
  sound.error();
}

function openFloor3FinalDoor() {
  const puzzleCount = PUZZLES.length;
  if (!state.completed.slice(0, puzzleCount).every(Boolean)) {
    explainLockedDoor("lockedDoor2");
    return false;
  }
  if (!state.flags.cellPicked) {
    setMessage("המעבר נעול", "אספו קודם את הפריט הקסום שהופיע לאחר פתרון חידה 2.");
    sound.error();
    return false;
  }

  state.flags.cellUsed = true;
  state.flags.codeUsed = true;
  // The second-floor-3 door is the final passage: opening it also unlocks
  // the elevator door, so there is no hidden third room or second obstacle.
  state.flags.elevatorUnlocked = true;
  sound.door();
  syncWorldState();
  setMessage("הדלת נפתחה", "המעבר מוביל ישירות למעלית. המעלית תוציא אתכם החוצה.");

  window.clearTimeout(completionTimer);
  completionTimer = window.setTimeout(() => {
    if (state.finished) return;
    const elevatorPose = { x: 25.9, z: 0, yaw: Math.PI / 2, cameraYaw: 0 };
    const movedPose = world?.setPose?.(elevatorPose) || elevatorPose;
    state.pose = sanitizePose(movedPose);
    saveState();
    finishFloor();
  }, state.settings.reducedMotion ? 140 : 820);
  return true;
}

function useLockedDoor(id) {
  const match = String(id).match(/(\d)$/);
  const index = match ? Number(match[1]) : currentRoom;
  // On floor 3 there are only two puzzles. Any gate after the second puzzle
  // is the same final passage, including the exit gate itself: the magical
  // item must never leave the player facing another locked doorway.
  if (activeFloorConfig.id === 3 && PUZZLES.length <= 2 && index >= 1) {
    return openFloor3FinalDoor();
  }
  if (index === 3) {
    return openElevatorCode();
  }
  if (index < 0 || index > 2) {
    explainLockedDoor(id);
    return false;
  }
  const item = ITEMS[ITEM_ORDER[index]];
  if (!item || !state.completed[index] || !state.flags[item.flag]) {
    explainLockedDoor(id);
    return false;
  }
  if (item.usedFlag && state.flags[item.usedFlag]) {
    setMessage("הדלת פתוחה", `${item.name} כבר פתח את המעבר לחדר הבא.`);
    sound.tap();
    return true;
  }
  if (item.usedFlag) state.flags[item.usedFlag] = true;
  sound.door();
  syncWorldState();
  setMessage(
    "הפריט הקסום פתח את הדלת",
    "המעבר נפתח. המשיכו לחדר הבא.",
    item.flag ? ITEM_ORDER[index] : null
  );
  return true;
}

function handleWorldInteract(id) {
  if (!id || hudMode !== "default" || state.finished) return false;
  sound.unlock();
  if (/^puzzle\d$/.test(id)) return openPuzzle(Number(id.at(-1)));
  if (ITEMS[id]) return collectItem(id);
  if (id.startsWith("lockedDoor")) {
    return useLockedDoor(id);
  }
  if (id === "exit") {
    return openElevatorCode();
  }
  return false;
}

function openElevatorCode() {
  const puzzleCount = PUZZLES.length;
  if (!state.completed.slice(0, puzzleCount).every(Boolean)) {
    explainLockedDoor("lockedDoor3");
    return false;
  }
  const finalItem = ITEMS[ITEM_ORDER[puzzleCount - 1]];
  if (finalItem && !state.flags[finalItem.flag]) {
    explainLockedDoor("lockedDoor3");
    return false;
  }
  if (activeFloorConfig.id === 3 && !state.flags.codeUsed) {
    explainLockedDoor("lockedDoor2");
    return false;
  }
  if (state.flags.elevatorUnlocked) {
    finishFloor();
    return true;
  }
  state.flags.elevatorUnlocked = true;
  syncWorldState();
  finishFloor();
  return true;
}

function openFloorExitPassword(leavingFloor) {
  const expected = FLOOR_EXIT_PASSWORDS[leavingFloor];
  if (!expected) return false;
  pendingFloorPassword = { leavingFloor, expected };
  releaseAllControls();
  hudMode = "floor-password";
  world?.stop?.();
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.menuPanel, false);
  if (refs.elevatorCodeTitle) refs.elevatorCodeTitle.textContent = leavingFloor === 1
    ? "סיסמת הכניסה לקומה השנייה"
    : "סיסמת הכניסה לקומה השלישית";
  if (refs.elevatorCodePrompt) refs.elevatorCodePrompt.textContent = "הזינו את הסיסמה שקיבלתם מהמורה כדי להמשיך.";
  if (refs.elevatorCodeLabel) refs.elevatorCodeLabel.textContent = "סיסמה";
  if (refs.elevatorCodeInput) {
    refs.elevatorCodeInput.value = "";
    refs.elevatorCodeInput.setAttribute("aria-label", "סיסמת המעבר לקומה הבאה");
  }
  if (refs.elevatorCodeFeedback) refs.elevatorCodeFeedback.textContent = "";
  setPanelVisible(refs.elevatorCodePanel, true);
  updateInteractionButton();
  requestAnimationFrame(() => refs.elevatorCodeInput?.focus());
  return true;
}

function closeElevatorCode({ resume = true } = {}) {
  if (hudMode !== "elevator-code" && hudMode !== "floor-password") return;
  if (hudMode === "floor-password" && pendingFloorPassword) {
    if (refs.elevatorCodeFeedback) refs.elevatorCodeFeedback.textContent = "הזינו את הסיסמה כדי להמשיך לקומה הבאה.";
    refs.elevatorCodeInput?.focus();
    return;
  }
  pendingFloorPassword = null;
  hudMode = "default";
  setPanelVisible(refs.elevatorCodePanel, false);
  updateInteractionButton();
  if (resume && currentScreen === "game" && !state.finished) world?.start?.();
  refs.interactBtn?.focus?.({ preventScroll: true });
}

function submitElevatorCode(suppliedCode) {
  const answer = normalizeAnswer(suppliedCode).replace(/\D/g, "");
  if (pendingFloorPassword) {
    const { leavingFloor, expected } = pendingFloorPassword;
    if (answer !== expected) {
      state.stats.wrong += 1;
      saveState();
      if (refs.elevatorCodeFeedback) refs.elevatorCodeFeedback.textContent = "הסיסמה לא נכונה. בקשו מהמורה את הסיסמה המתאימה.";
      sound.error();
      refs.elevatorCodeInput?.select();
      return false;
    }
    pendingFloorPassword = null;
    state.awaitingFloorPassword = null;
    saveState();
    sound.door();
    closeElevatorCode({ resume: false });
    if (leavingFloor === 1) {
      beginFloorTwo();
    } else if (leavingFloor === 2) {
      beginFloorThree();
    }
    return true;
  }
  if (refs.elevatorCodeFeedback) refs.elevatorCodeFeedback.textContent = "פתחו את חלון הסיסמה ליד הדלת המתאימה.";
  sound.error();
  return false;
}

function openMenu() {
  if (hudMode !== "default" || state.finished) return;
  releaseAllControls();
  hudMode = "menu";
  world?.stop?.();
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.menuPanel, true);
  refs.menuBtn?.setAttribute("aria-expanded", "true");
  updateInteractionButton();
  requestAnimationFrame(() => refs.resumeBtn?.focus());
}

function closeMenu() {
  if (hudMode !== "menu") return;
  hudMode = "default";
  setPanelVisible(refs.menuPanel, false);
  refs.menuBtn?.setAttribute("aria-expanded", "false");
  updateInteractionButton();
  if (!state.finished) world?.start?.();
  refs.menuBtn?.focus?.({ preventScroll: true });
}

function renderSettings() {
  if (refs.musicToggle) {
    refs.musicToggle.setAttribute("aria-pressed", String(state.settings.music));
    const label = refs.musicToggle.querySelector("span");
    const value = refs.musicToggle.querySelector("strong");
    if (label && value) {
      label.textContent = "מוזיקה";
      value.textContent = state.settings.music ? "פועלת" : "כבויה";
    } else {
      refs.musicToggle.textContent = state.settings.music ? "מוזיקה: פועלת" : "מוזיקה: כבויה";
    }
  }
  if (refs.effectsToggle) {
    refs.effectsToggle.setAttribute("aria-pressed", String(state.settings.effects));
    const label = refs.effectsToggle.querySelector("span");
    const value = refs.effectsToggle.querySelector("strong");
    if (label && value) {
      label.textContent = "אפקטים";
      value.textContent = state.settings.effects ? "פועלים" : "כבויים";
    } else {
      refs.effectsToggle.textContent = state.settings.effects ? "אפקטים: פועלים" : "אפקטים: כבויים";
    }
  }
  if (refs.motionToggle) {
    refs.motionToggle.setAttribute("aria-pressed", String(state.settings.reducedMotion));
    refs.motionToggle.textContent = state.settings.reducedMotion
      ? "תנועה מופחתת: פעילה"
      : "תנועה מופחתת: כבויה";
  }
}

function toggleMusic() {
  state.settings.music = !state.settings.music;
  saveState();
  renderSettings();
  if (state.settings.music) {
    sound.unlock();
    sound.setMusicEnabled(true);
    if (currentScreen === "game" && !state.finished) sound.startFloorMusic(state.floor);
  } else {
    sound.setMusicEnabled(false);
  }
}

function toggleEffects() {
  state.settings.effects = !state.settings.effects;
  saveState();
  renderSettings();
  if (state.settings.effects) {
    sound.unlock();
    sound.tap();
  }
}

function toggleMotion() {
  state.settings.reducedMotion = !state.settings.reducedMotion;
  document.documentElement.classList.toggle("reduced-motion", state.settings.reducedMotion);
  syncWorldState();
}

function finishFloor() {
  if (state.finished) return;
  const leavingFloor = state.floor;
  state.finished = true;
  state.awaitingFloorPassword = leavingFloor === 1 || leavingFloor === 2 ? leavingFloor : null;
  captureClock(false);
  saveState();
  releaseAllControls();
  const elevatorDuration = state.settings.reducedMotion ? 850 : 4200;
  sound.stopBackgroundMusic();
  sound.elevator();
  world?.beginElevator?.(elevatorDuration);
  setMessage(
    leavingFloor === 3 ? "המדען בדרך החוצה" : "המדען נכנס למעלית",
    leavingFloor === 1
      ? "המדען עולה למעלית. מיד לאחר מכן המעלית תעלה לקומה השנייה."
      : leavingFloor === 2
        ? "המדען עולה למעלית. מיד לאחר מכן המעלית תעלה לקומה השלישית."
        : "המדען יוצא מהמעלית וצועד אל נוף הטבע."
  );
  window.clearTimeout(completionTimer);
  completionTimer = window.setTimeout(
    leavingFloor === 1 || leavingFloor === 2
      ? () => openFloorExitPassword(leavingFloor)
      : showNatureEnding,
    elevatorDuration + 180
  );
}

function beginFloorTwo() {
  window.clearTimeout(completionTimer);
  completionTimer = 0;
  world?.dispose?.();
  world = null;
  state.floor = 2;
  state.finished = false;
  state.awaitingFloorPassword = null;
  state.completed = [false, false, false, false];
  state.flags = freshFlags();
  state.puzzles = FLOOR2_CONFIG.puzzles.map((puzzle) => ({ ...puzzle }));
  state.pose = { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 };
  applyFloorConfig(FLOOR2_CONFIG, state.puzzles);
  currentRoom = 0;
  nearbyId = null;
  hudMode = "default";
  activePuzzle = null;
  state.started = true;
  saveState();
  enterGame("המעלית נפתחה. ברוכים הבאים לקומה השנייה — הצפנה ופיענוח.");
}

function beginFloorThree() {
  window.clearTimeout(completionTimer);
  completionTimer = 0;
  world?.dispose?.();
  world = null;
  state.floor = 3;
  state.finished = false;
  state.awaitingFloorPassword = null;
  state.completed = [false, false];
  state.flags = freshFlags();
  state.puzzles = FLOOR3_CONFIG.puzzles.map((puzzle) => ({ ...puzzle }));
  state.pose = { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 };
  applyFloorConfig(FLOOR3_CONFIG, state.puzzles);
  currentRoom = 0;
  nearbyId = null;
  hudMode = "default";
  activePuzzle = null;
  state.started = true;
  saveState();
  enterGame("המעלית נפתחה. ברוכים הבאים לקומה השלישית — רשתות נוירונים.");
}

function showNatureEnding() {
  window.clearTimeout(completionTimer);
  completionTimer = 0;
  clearEndingAnimation();
  world?.dispose?.();
  world = null;
  captureClock(false);
  if (refs.endingBackdrop) {
    refs.endingBackdrop.src = "assets/3d/floor3/nature-exit.png";
    refs.endingBackdrop.alt = "נוף טבע יפיפה מחוץ למעבדה";
  }
  if (refs.endingTitle) refs.endingTitle.textContent = "הצלחת לפתור את כל חידות הנוירונים ולצאת מהמעבדה!";
  if (refs.endingText) {
    refs.endingText.textContent = "";
    refs.endingText.hidden = true;
  }
  if (refs.endingCard) refs.endingCard.hidden = true;
  document.body.dataset.ending = "nature";
  setEndingWalkFrame(0);
  sound.stopBackgroundMusic();
  sound.finish();
  showScreen("ending");
  const walkDuration = state.settings.reducedMotion ? 650 : 4200;
  endingFrameTimer = window.setInterval(() => {
    setEndingWalkFrame((performance.now() / 115) | 0);
  }, 115);
  endingWalkTimer = window.setTimeout(() => {
    window.clearInterval(endingFrameTimer);
    endingFrameTimer = 0;
    setEndingCelebrationPose();
    const celebrationHold = 5000;
    endingWalkTimer = window.setTimeout(() => {
      if (refs.endingCard) refs.endingCard.hidden = false;
      requestAnimationFrame(() => refs.playAgainBtn?.focus());
    }, celebrationHold);
  }, walkDuration);
}

function showCompletion() {
  if (state.floor === 3) {
    showNatureEnding();
    return;
  }
  window.clearTimeout(completionTimer);
  completionTimer = 0;
  world?.stop?.();
  sound.stopBackgroundMusic();
  sound.finish();
  hudMode = "completion";
  if (refs.completionTitle) {
    refs.completionTitle.textContent = state.floor === 2
      ? "פיצחתם את קומת הצפנים!"
      : "המעלית עלתה לקומה הבאה!";
  }
  if (refs.completionText) {
    const puzzleCount = PUZZLES.length;
    refs.completionText.textContent = state.floor === 2
      ? `פתרתם ${puzzleCount} חידות ההצפנה, פתחתם את כל הדלתות והשלמתם את מסלול ההצפנה והפיענוח ` +
        `ב־${formatTime(state.stats.activeMs)}. טעויות: ${state.stats.wrong}.`
      : `פתרתם ${puzzleCount} חידות, פתחתם את כל הדלתות והשלמתם את מסלול החישוביות הדנדריטית ` +
        `ב־${formatTime(state.stats.activeMs)}. טעויות: ${state.stats.wrong}.`;
  }
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.elevatorCodePanel, false);
  setPanelVisible(refs.menuPanel, false);
  setPanelVisible(refs.completionPanel, true);
  updateInteractionButton();
  requestAnimationFrame(() => refs.completionRestartBtn?.focus());
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function restartGame() {
  const settings = { ...state.settings };
  const avatar = state.avatar || AVATARS[selectedAvatar]?.id || AVATARS[0].id;
  state = freshState(settings, state.elevatorCode, state.puzzles);
  applyFloorConfig(FLOOR1_CONFIG, state.puzzles);
  delete document.body.dataset.ending;
  state.avatar = avatar;
  state.started = true;
  currentRoom = 0;
  nearbyId = null;
  hudMode = "default";
  saveState();
  enterGame("הניסוי אותחל. מצאו את תחנת החידה בחדר הראשון.");
}

function goHome() {
  if (testModeActive) {
    exitTestMode();
    return;
  }
  captureClock(false);
  saveState();
  releaseAllControls();
  sound.stopBackgroundMusic();
  world?.stop?.();
  hudMode = "default";
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.elevatorCodePanel, false);
  setPanelVisible(refs.menuPanel, false);
  setPanelVisible(refs.completionPanel, false);
  renderStart();
  delete document.body.dataset.ending;
  showScreen("start");
  refs.continueBtn?.focus?.();
}

function renderStart() {
  if (!refs.continueBtn) return;
  const canContinue = Boolean(state.started && state.avatar && !state.finished);
  refs.continueBtn.hidden = !canContinue;
  refs.continueBtn.disabled = !canContinue;
  if (canContinue) {
    const floorLabel = state.floor === 3 ? "קומה 3" : state.floor === 2 ? "קומה 2" : "קומה 1";
    const puzzleCount = floorConfigFor(state.floor).puzzles.length;
    refs.continueBtn.textContent = `המשך משחק — ${floorLabel}, ${state.completed.slice(0, puzzleCount).filter(Boolean).length}/${puzzleCount} חידות`;
  }
}

function cloneStateValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function renderTestModeAvailability() {
  if (refs.testModeBtn) refs.testModeBtn.hidden = false;
  const unlockedVisible = testModeUnlocked;
  if (refs.testModeMenuBtn) refs.testModeMenuBtn.hidden = !unlockedVisible;
  if (refs.endingTestModeBtn) refs.endingTestModeBtn.hidden = !unlockedVisible;
  if (refs.testModePasswordBtn) refs.testModePasswordBtn.hidden = !unlockedVisible;
}

function renderTestModeDialog() {
  setPanelVisible(refs.testModeLockedView, !testModeUnlocked);
  setPanelVisible(refs.testModeUnlockedView, testModeUnlocked);
  if (testModeUnlocked) {
    if (refs.testModeCodeInput) refs.testModeCodeInput.value = "";
    if (refs.testModeFeedback) refs.testModeFeedback.textContent = "";
  }
}

function renderTestCheckpointGrid() {
  if (!refs.testCheckpointGrid) return;
  refs.testCheckpointGrid.replaceChildren();
  TEST_CHECKPOINTS.forEach((checkpoint) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "test-checkpoint ui-skin ui-status-skin";
    button.dataset.checkpoint = checkpoint.id;
    const label = document.createElement("strong");
    label.textContent = checkpoint.label;
    const description = document.createElement("small");
    description.textContent = checkpoint.description;
    button.append(label, description);
    button.addEventListener("click", () => beginTestCheckpoint(checkpoint.id));
    refs.testCheckpointGrid.append(button);
  });
}

function openTestModeDialog() {
  if (!refs.testModeDialog) return false;
  testModeDialogPreviousMode = hudMode;
  if (currentScreen === "game" && hudMode === "default") {
    releaseAllControls();
    world?.stop?.();
  }
  renderTestModeAvailability();
  renderTestModeDialog();
  renderTestCheckpointGrid();
  setPanelVisible(refs.testModeDialog, true);
  requestAnimationFrame(() => {
    if (testModeUnlocked) {
      refs.testCheckpointGrid?.querySelector("button")?.focus();
    } else {
      refs.testModeCodeInput?.focus();
    }
  });
  return true;
}

function closeTestModeDialog({ resume = true } = {}) {
  if (!refs.testModeDialog || refs.testModeDialog.hidden) return;
  setPanelVisible(refs.testModeDialog, false);
  if (
    resume &&
    currentScreen === "game" &&
    testModeDialogPreviousMode === "default" &&
    hudMode === "default" &&
    !state.finished
  ) {
    world?.start?.();
  }
  if (testModeDialogPreviousMode === "menu" && currentScreen === "game") {
    hudMode = "menu";
  }
}

function submitTestModeCode(value) {
  const answer = normalizeAnswer(value).replace(/\D/g, "");
  if (answer !== TEST_MODE_CODE) {
    if (refs.testModeFeedback) refs.testModeFeedback.textContent = "הקוד שגוי.";
    refs.testModeCodeInput?.select();
    return false;
  }
  testModeUnlocked = true;
  if (refs.testModeFeedback) refs.testModeFeedback.textContent = "מצב הבדיקה נפתח.";
  renderTestModeAvailability();
  renderTestModeDialog();
  requestAnimationFrame(() => refs.testCheckpointGrid?.querySelector("button")?.focus());
  return true;
}

function testStateForFloor(floor) {
  const config = floorConfigFor(floor);
  const next = freshState({ ...state.settings }, state.elevatorCode, state.puzzles);
  next.avatar = state.avatar || AVATARS[0].id;
  next.started = true;
  next.finished = false;
  next.awaitingFloorPassword = null;
  next.floor = config.id;
  next.completed = Array.from({ length: config.puzzles.length }, () => false);
  next.flags = freshFlags();
  next.puzzles = config.puzzles.map((puzzle) => ({ ...puzzle }));
  next.pose = { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 };
  next.stats = { wrong: 0, activeMs: state.stats?.activeMs || 0 };
  return next;
}

function applyTestProgress(next, solvedCount, openedCount) {
  const config = floorConfigFor(next.floor);
  config.itemOrder.forEach((itemId, index) => {
    const item = config.items[itemId];
    if (index < solvedCount) {
      next.completed[index] = true;
      if (item?.flag) next.flags[item.flag] = true;
    }
    if (index < openedCount && item?.usedFlag) next.flags[item.usedFlag] = true;
  });
}

function buildTestCheckpointState(id) {
  if (id === "ending") {
    const next = testStateForFloor(3);
    applyTestProgress(next, 2, 2);
    next.flags.codeUsed = true;
    next.flags.elevatorUnlocked = true;
    next.finished = true;
    next.pose = { x: 20, z: 0, yaw: Math.PI / 2, cameraYaw: 0 };
    return next;
  }

  const checkpoint = TEST_CHECKPOINTS.find((entry) => entry.id === id);
  const next = testStateForFloor(checkpoint?.floor || 1);
  const poses = {
    "floor1-start": { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 },
    "floor1-puzzle2": { x: 0, z: -14.2, yaw: Math.PI, cameraYaw: 0 },
    "floor1-puzzle3": { x: 18, z: -14.2, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor1-puzzle4": { x: 18, z: 3.6, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor1-room2": { x: 0, z: -14.2, yaw: Math.PI, cameraYaw: 0 },
    "floor1-elevator": { x: 20, z: 0, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor1-password": { x: 20, z: 0, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor2-start": { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 },
    "floor2-puzzle2": { x: 0, z: -14.2, yaw: Math.PI, cameraYaw: 0 },
    "floor2-puzzle3": { x: 18, z: -14.2, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor2-puzzle4": { x: 18, z: 3.6, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor2-room2": { x: 0, z: -14.2, yaw: Math.PI, cameraYaw: 0 },
    "floor2-elevator": { x: 20, z: 0, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor2-password": { x: 20, z: 0, yaw: Math.PI / 2, cameraYaw: 0 },
    "floor3-start": { x: 0, z: 3.6, yaw: Math.PI, cameraYaw: 0 },
    "floor3-puzzle2": { x: 0, z: -14.2, yaw: Math.PI, cameraYaw: 0 },
    "floor3-final-door": { x: 0, z: -14.2, yaw: Math.PI, cameraYaw: 0 },
    "floor3-elevator": { x: 20, z: 0, yaw: Math.PI / 2, cameraYaw: 0 }
  };
  next.pose = poses[id] || next.pose;

  const puzzleCheckpoint = id.match(/^floor\d+-puzzle(\d+)$/);
  if (puzzleCheckpoint) {
    const puzzleNumber = Number(puzzleCheckpoint[1]);
    const previousPuzzles = Math.max(0, Math.min(next.completed.length, puzzleNumber - 1));
    applyTestProgress(next, previousPuzzles, previousPuzzles);
  } else if (id.endsWith("-start")) {
    applyTestProgress(next, 0, 0);
  } else if (id.endsWith("-room2")) {
    applyTestProgress(next, 1, 1);
  } else if (id === "floor3-final-door") {
    applyTestProgress(next, 2, 1);
  } else if (id.endsWith("-elevator")) {
    applyTestProgress(next, next.completed.length, next.completed.length === 2 ? 2 : next.completed.length - 1);
    if (next.floor === 3) next.flags.codeUsed = true;
  } else if (id.endsWith("-password")) {
    applyTestProgress(next, next.completed.length, next.completed.length - 1);
    next.flags.elevatorUnlocked = true;
    next.finished = true;
    next.awaitingFloorPassword = next.floor;
  }
  return next;
}

function beginTestCheckpoint(id) {
  if (!testModeUnlocked) return false;
  if (!testModeSnapshot) testModeSnapshot = cloneStateValue(state);
  testModeActive = true;
  closeTestModeDialog({ resume: false });
  window.clearTimeout(completionTimer);
  completionTimer = 0;
  clearEndingAnimation();
  delete document.body.dataset.ending;
  sound.stopBackgroundMusic();
  world?.dispose?.();
  world = null;

  state = buildTestCheckpointState(id);
  applyFloorConfig(floorConfigFor(state.floor), state.puzzles);
  const puzzleCheckpoint = id.match(/^floor\d+-puzzle(\d+)$/);
  currentRoom = puzzleCheckpoint
    ? Math.min(3, Math.max(0, Number(puzzleCheckpoint[1]) - 1))
    : id.includes("room2") || id === "floor3-final-door"
      ? 1
      : id.includes("elevator") || id.includes("password") || id === "ending"
        ? 3
        : 0;
  nearbyId = null;
  pendingFloorPassword = null;
  activePuzzle = null;
  hudMode = "default";

  if (id === "ending") {
    showNatureEnding();
    return true;
  }

  const label = TEST_CHECKPOINTS.find((entry) => entry.id === id)?.label || "נקודת בדיקה";
  enterGame(`מצב בדיקה: ${label}`);
  return true;
}

function exitTestMode() {
  if (!testModeActive && !testModeSnapshot) {
    closeTestModeDialog({ resume: false });
    return;
  }
  window.clearTimeout(completionTimer);
  completionTimer = 0;
  clearEndingAnimation();
  world?.dispose?.();
  world = null;
  sound.stopBackgroundMusic();
  testModeActive = false;
  if (testModeSnapshot) state = sanitizeState(testModeSnapshot);
  testModeSnapshot = null;
  pendingFloorPassword = null;
  activePuzzle = null;
  nearbyId = null;
  currentRoom = 0;
  hudMode = "default";
  applyFloorConfig(floorConfigFor(state.floor), state.puzzles);
  closeTestModeDialog({ resume: false });
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.elevatorCodePanel, false);
  setPanelVisible(refs.menuPanel, false);
  setPanelVisible(refs.completionPanel, false);
  renderStart();
  renderTestModeAvailability();
  delete document.body.dataset.ending;
  saveState();
  showScreen("start");
  refs.continueBtn?.focus?.();
}

function showInfo() {
  if (!refs.infoModal) return;
  infoOpener = document.activeElement;
  if (typeof refs.infoModal.showModal === "function") {
    if (!refs.infoModal.open) refs.infoModal.showModal();
  } else {
    setPanelVisible(refs.infoModal, true);
  }
  requestAnimationFrame(() => {
    refs.infoModal.querySelector("button, [href], input, [tabindex='0']")?.focus();
  });
}

function closeInfo() {
  if (!refs.infoModal) return;
  if (typeof refs.infoModal.close === "function" && refs.infoModal.open) {
    refs.infoModal.close();
  } else {
    setPanelVisible(refs.infoModal, false);
  }
  infoOpener?.focus?.();
  infoOpener = null;
}

function releaseAllControls() {
  MOVE_CONTROLS.forEach((control) => world?.setControl?.(control, false));
  turnTimers.forEach((timer) => window.clearInterval(timer));
  turnTimers.clear();
  document.querySelectorAll("[data-control].is-pressed").forEach((button) => {
    button.classList.remove("is-pressed");
  });
}

function bindControlButtons() {
  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;
    const isTurn = control === "turn-left" || control === "turn-right";
    const release = (event) => {
      if (event && button.hasPointerCapture?.(event.pointerId)) {
        button.releasePointerCapture(event.pointerId);
      }
      button.classList.remove("is-pressed");
      if (isTurn) {
        const timer = turnTimers.get(button);
        if (timer) window.clearInterval(timer);
        turnTimers.delete(button);
      } else if (MOVE_CONTROLS.includes(control)) {
        world?.setControl?.(control, false);
      }
    };

    button.addEventListener("pointerdown", (event) => {
      if (hudMode !== "default" || state.finished) return;
      event.preventDefault();
      sound.unlock();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("is-pressed");
      if (isTurn) {
        const amount = control === "turn-left" ? -Math.PI / 16 : Math.PI / 16;
        lastPointerTurnAt = performance.now();
        world?.turn?.(amount);
        const timer = window.setInterval(() => world?.turn?.(amount), 90);
        turnTimers.set(button, timer);
      } else if (MOVE_CONTROLS.includes(control)) {
        world?.setControl?.(control, true);
      }
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("click", (event) => {
      if (event.detail !== 0 || hudMode !== "default" || state.finished) return;
      if (isTurn) {
        if (performance.now() - lastPointerTurnAt > 300) {
          world?.turn?.(control === "turn-left" ? -Math.PI / 12 : Math.PI / 12);
        }
      } else if (MOVE_CONTROLS.includes(control)) {
        world?.setControl?.(control, true);
        window.setTimeout(() => world?.setControl?.(control, false), 180);
      }
    });
  });
}

class SoundEngine {
  constructor() {
    this.context = null;
    this.lastStep = 0;
    this.musicBus = null;
    this.musicTrack = null;
    this.musicVolume = 0.22;
    this.floorMusic = {
      1: new Audio("assets/audio/floor-1.mp3"),
      2: new Audio("assets/audio/floor-2.mp3"),
      3: new Audio("assets/audio/floor-3.mp3")
    };
    this.clips = {
      solve: new Audio("assets/audio/solve-puzzle.wav"),
      collect: new Audio("assets/audio/collect-magic-item.mp3"),
      door: new Audio("assets/audio/door-open.ogg"),
      elevator: new Audio("assets/audio/elevator-rise.mp3")
    };
    Object.entries(this.clips).forEach(([name, clip]) => {
      clip.preload = "auto";
      clip.volume = name === "solve" ? 0.46 : 0.9;
    });
    Object.values(this.floorMusic).forEach((track) => {
      track.preload = "auto";
      track.loop = true;
      track.volume = this.musicVolume;
    });
  }

  unlock() {
    if (!state.settings.music && !state.settings.effects) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!this.context) this.context = new Context();
    if (!this.musicBus) {
      this.musicBus = this.context.createGain();
      this.musicBus.gain.value = state.settings.music ? 1 : 0;
      this.musicBus.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume().catch(() => {});
  }

  setMusicEnabled(enabled) {
    if (this.musicBus && this.context) {
      this.musicBus.gain.setTargetAtTime(
        enabled ? 1 : 0,
        this.context.currentTime,
        0.025
      );
    }
    if (!enabled) this.stopBackgroundMusic();
  }

  stopBackgroundMusic() {
    if (!this.musicTrack) return;
    try {
      this.musicTrack.pause();
      this.musicTrack.currentTime = 0;
    } catch (error) {
      // A track may still be loading; stopping it is best effort.
    }
    this.musicTrack = null;
  }

  startFloorMusic(floor = state.floor) {
    if (!state.settings.music) return;
    const track = this.floorMusic[String(floor)];
    if (!track) return;
    if (this.musicTrack === track && !track.paused) return;
    this.stopBackgroundMusic();
    this.musicTrack = track;
    track.loop = true;
    track.volume = this.musicVolume;
    try {
      track.currentTime = 0;
      const playback = track.play();
      playback?.catch?.(() => {});
    } catch (error) {
      // The next user gesture will retry after the browser unlocks audio.
    }
  }

  resumeMusic() {
    if (currentScreen === "game" && !state.finished) this.startFloorMusic(state.floor);
  }

  playClip(name) {
    if (!state.settings.effects) return null;
    this.unlock();
    const clip = this.clips[name];
    if (!clip) return null;
    try {
      clip.currentTime = 0;
      const playback = clip.play();
      playback?.catch?.(() => {});
      return clip;
    } catch (error) {
      // Browsers may reject a clip until the first user gesture; the
      // synthesized fallback remains available for the other UI sounds.
      console.warn("Audio clip could not be played.", name, error);
      return null;
    }
  }

  tone(frequency, duration = 0.1, options = {}) {
    if (options.music ? !state.settings.music : !state.settings.effects) return;
    this.unlock();
    if (!this.context) return;
    const now = this.context.currentTime + (options.delay || 0);
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = options.type || "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    if (options.detune) oscillator.detune.setValueAtTime(options.detune, now);
    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, now + duration);
    }
    const volume = options.volume ?? 0.045;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + Math.min(0.018, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    const destination = options.music && this.musicBus
      ? this.musicBus
      : this.context.destination;
    const output = options.pan !== undefined && this.context.createStereoPanner
      ? this.context.createStereoPanner()
      : null;
    if (output) {
      output.pan.setValueAtTime(options.pan, now);
      oscillator.connect(gain).connect(output).connect(destination);
    } else {
      oscillator.connect(gain).connect(destination);
    }
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  chime(frequency, options = {}) {
    const delay = options.delay || 0;
    const duration = options.duration || 0.32;
    const volume = options.volume || 0.026;
    this.tone(frequency, duration, {
      type: "sine",
      volume,
      delay,
      pan: options.pan || 0,
      detune: options.detune || 0,
      endFrequency: options.endFrequency,
      music: options.music
    });
    this.tone(frequency * 2, duration * 0.72, {
      type: "triangle",
      volume: volume * 0.42,
      delay: delay + 0.018,
      pan: (options.pan || 0) * -0.72,
      detune: options.detune ? options.detune * -0.5 : -4,
      endFrequency: options.endFrequency ? options.endFrequency * 2 : undefined,
      music: options.music
    });
    this.tone(frequency * 3, duration * 0.46, {
      type: "sine",
      volume: volume * 0.22,
      delay: delay + 0.045,
      pan: (options.pan || 0) * 0.55,
      detune: options.detune ? options.detune * 0.35 : 7,
      music: options.music
    });
  }

  tap() {
    this.tone(360, 0.07, { type: "sine", volume: 0.025 });
  }

  footstep() {
    const now = performance.now();
    if (now - this.lastStep < 235) return;
    this.lastStep = now;
    this.tone(92, 0.075, { type: "triangle", volume: 0.018, endFrequency: 62 });
  }

  error() {
    this.tone(170, 0.13, { type: "sawtooth", volume: 0.025, endFrequency: 115 });
  }

  collect() {
    this.playClip("collect");
  }

  use() {
    this.tone(280, 0.17, { type: "triangle", volume: 0.04, endFrequency: 560 });
    this.tone(720, 0.17, { type: "sine", volume: 0.03, delay: 0.14 });
  }

  station() {
    this.tone(146.83, 0.9, {
      type: "triangle",
      volume: 0.024,
      endFrequency: 293.66,
      pan: -0.12
    });
    [261.63, 392, 523.25, 783.99, 1046.5, 1318.51].forEach((frequency, index) => {
      this.chime(frequency, {
        duration: 0.36,
        volume: 0.019,
        delay: 0.12 + index * 0.085,
        pan: (index - 2.5) * 0.13,
        detune: index % 2 ? 8 : -8
      });
    });
  }

  solve() {
    return this.playClip("solve");
  }

  solveThen(callback) {
    const clip = this.solve();
    if (!clip) {
      window.setTimeout(callback, 120);
      return;
    }
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      clip.removeEventListener("ended", finish);
      callback();
    };
    clip.addEventListener("ended", finish, { once: true });
    const durationMs = Number.isFinite(clip.duration) && clip.duration > 0
      ? clip.duration * 1000 + 120
      : 1250;
    window.setTimeout(finish, Math.max(900, durationMs));
  }

  reveal() {
    [261.63, 329.63, 440, 659.25, 987.77].forEach((frequency, index) => {
      this.chime(frequency, {
        duration: 0.34,
        volume: 0.018,
        delay: index * 0.085,
        pan: (index - 2) * 0.17,
        detune: index % 2 ? -5 : 5
      });
    });
    this.tone(130.81, 0.9, {
      type: "sine",
      volume: 0.014,
      endFrequency: 523.25,
      delay: 0.04,
      pan: 0.2
    });
  }

  elevator() {
    this.playClip("elevator");
  }

  door() {
    this.playClip("door");
  }

  code() {
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      this.chime(frequency, {
        duration: 0.3,
        volume: 0.024,
        delay: index * 0.12,
        pan: (index - 1) * 0.2,
        detune: index === 1 ? 4 : -4
      });
    });
    this.tone(261.63, 0.95, {
      type: "triangle",
      volume: 0.02,
      endFrequency: 1046.5,
      delay: 0.18,
      pan: -0.1
    });
  }

  finish() {
    const melody = [
      523.25, 659.25, 783.99, 1046.5,
      783.99, 659.25, 587.33, 783.99,
      659.25, 783.99, 1046.5, 1174.66,
      1046.5, 783.99, 659.25, 523.25
    ];
    melody.forEach((frequency, index) => {
      this.chime(frequency, {
        duration: 0.42,
        volume: 0.034,
        delay: index * 0.24,
        pan: (index % 5 - 2) * 0.12,
        detune: index % 2 ? 4 : -4,
        music: true
      });
    });
    this.tone(130.81, 4.1, {
      type: "sine",
      volume: 0.012,
      endFrequency: 196,
      delay: 0.08,
      music: true
    });
    this.chime(523.25, {
      duration: 1.1,
      volume: 0.044,
      delay: 3.95,
      pan: 0,
      music: true
    });
  }
}

const sound = new SoundEngine();

function bindEvents() {
  refs.newGameBtn?.addEventListener("click", () => openAvatarSelection("new"));
  refs.continueBtn?.addEventListener("click", () => enterGame("המשחק נטען מהמקום שבו עצרתם."));
  refs.howToBtn?.addEventListener("click", showInfo);
  refs.testModeBtn?.addEventListener("click", openTestModeDialog);
  refs.avatarConfirmBtn?.addEventListener("click", confirmAvatar);
  refs.avatarBackBtn?.addEventListener("click", () => {
    if (avatarSelectionMode === "change" && state.started) enterGame();
    else {
      renderStart();
      showScreen("start");
      refs.newGameBtn?.focus();
    }
  });

  refs.hudAvatarArt?.addEventListener?.("click", () => openAvatarSelection("change"));
  refs.interactBtn?.addEventListener("click", () => {
    sound.unlock();
    world?.interact?.();
  });
  refs.puzzleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (activePuzzle === null) return;
    solvePuzzle(activePuzzle, refs.puzzleAnswer?.value);
  });
  refs.puzzleAnswer?.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    event.preventDefault();
    refs.puzzleForm?.requestSubmit?.();
  });
  refs.closePuzzleBtn?.addEventListener("click", () => closePuzzle());
  refs.elevatorCodeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitElevatorCode(refs.elevatorCodeInput?.value);
  });
  refs.elevatorCodeInput?.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    event.preventDefault();
    refs.elevatorCodeForm?.requestSubmit?.();
  });
  refs.closeElevatorCodeBtn?.addEventListener("click", () => closeElevatorCode());
  refs.riddleFrame?.addEventListener("load", () => {
    fitEmbeddedPuzzleFrame();
    installEmbeddedPuzzleAutoScroll();
  });
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.source !== "neural-code-riddle" || data.type !== "submitted") return;
    if (!refs.riddleFrame || event.source !== refs.riddleFrame.contentWindow) return;
    const index = Number(activePuzzle);
    if (!Number.isInteger(index) || hudMode !== "puzzle" || !PUZZLES[index]?.riddleSrc) return;
    if (data.puzzleId && data.puzzleId !== PUZZLES[index].id) return;
    window.setTimeout(() => {
      if (activePuzzle === index && !state.completed[index]) completeRiddle(index);
    }, 500);
  });
  refs.menuBtn?.addEventListener("click", openMenu);
  refs.resumeBtn?.addEventListener("click", closeMenu);
  refs.testModeMenuBtn?.addEventListener("click", openTestModeDialog);
  refs.endingTestModeBtn?.addEventListener("click", openTestModeDialog);
  refs.testModePasswordBtn?.addEventListener("click", openTestModeDialog);
  refs.testModeCloseBtn?.addEventListener("click", () => closeTestModeDialog());
  refs.testModeExitBtn?.addEventListener("click", exitTestMode);
  refs.testModeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitTestModeCode(refs.testModeCodeInput?.value);
  });
  refs.musicToggle?.addEventListener("click", toggleMusic);
  refs.effectsToggle?.addEventListener("click", toggleEffects);
  refs.motionToggle?.addEventListener("click", toggleMotion);
  refs.restartBtn?.addEventListener("click", restartGame);
  refs.homeBtn?.addEventListener("click", goHome);
  refs.completionRestartBtn?.addEventListener("click", restartGame);
  refs.completionHomeBtn?.addEventListener("click", goHome);
  refs.playAgainBtn?.addEventListener("click", restartGame);
  refs.endingHomeBtn?.addEventListener("click", goHome);

  refs.infoModal?.querySelectorAll("[data-close-info], [data-close-modal], #closeInfoBtn, .close-info").forEach((button) => {
    button.addEventListener("click", closeInfo);
  });
  refs.infoModal?.addEventListener?.("cancel", (event) => {
    event.preventDefault();
    closeInfo();
  });
  refs.infoModal?.addEventListener?.("click", (event) => {
    if (event.target === refs.infoModal && refs.infoModal instanceof HTMLDialogElement) closeInfo();
  });

  document.addEventListener(
    "pointerdown",
    () => {
      sound.unlock();
      if (hudMode !== "puzzle") sound.resumeMusic();
    },
    { passive: true }
  );
  document.addEventListener("keydown", (event) => {
    if (refs.testModeDialog && !refs.testModeDialog.hidden && event.key === "Escape") {
      event.preventDefault();
      closeTestModeDialog();
      return;
    }
    if (event.key !== "Escape") return;
    if (refs.infoModal instanceof HTMLDialogElement && refs.infoModal.open) {
      event.preventDefault();
      closeInfo();
    } else if (activePuzzle !== null) {
      event.preventDefault();
      closePuzzle();
    } else if (hudMode === "elevator-code" || hudMode === "floor-password") {
      event.preventDefault();
      closeElevatorCode();
    } else if (hudMode === "menu") {
      event.preventDefault();
      closeMenu();
    } else if (currentScreen === "game" && hudMode === "default") {
      event.preventDefault();
      openMenu();
    }
  });
  window.addEventListener("blur", releaseAllControls);
  window.addEventListener("resize", () => {
    world?.resize?.();
    if (hudMode === "puzzle") fitEmbeddedPuzzleFrame();
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      releaseAllControls();
      captureClock(false);
      const snapshot = world?.getSnapshot?.();
      if (snapshot?.pose) state.pose = sanitizePose(snapshot.pose);
      saveState();
    } else if (currentScreen === "game" && !state.finished) {
      startClock();
    }
  });
  window.addEventListener("pagehide", () => {
    captureClock(false);
    const snapshot = world?.getSnapshot?.();
    if (snapshot?.pose) state.pose = sanitizePose(snapshot.pose);
    saveState();
  });
  bindControlButtons();
}

function exposeDebugApi() {
  const api = {
    get state() {
      return JSON.parse(JSON.stringify(state));
    },
    get worldSnapshot() {
      return world?.getSnapshot?.() || null;
    },
    interact(id = null) {
      return id ? handleWorldInteract(id) : world?.interact?.();
    },
    openPuzzle(index) {
      return openPuzzle(index);
    },
    solve(index, answer = PUZZLES[Number(index)]?.answer) {
      return solvePuzzle(Number(index), answer);
    },
    openElevatorCode() {
      return openElevatorCode();
    },
    submitElevatorCode(code) {
      return submitElevatorCode(code);
    },
    setControl(control, pressed) {
      world?.setControl?.(control, Boolean(pressed));
    },
    turn(radians) {
      world?.turn?.(Number(radians) || 0);
    },
    setPose(pose) {
      state.pose = sanitizePose({ ...state.pose, ...pose });
      world?.setPose?.(state.pose);
      saveState();
      return this.worldSnapshot;
    },
    restart() {
      restartGame();
    },
    save() {
      const snapshot = world?.getSnapshot?.();
      if (snapshot?.pose) state.pose = sanitizePose(snapshot.pose);
      saveState();
      return JSON.parse(JSON.stringify(state));
    }
  };
  Object.defineProperty(window, "__escapeGame", {
    configurable: true,
    value: api
  });
}

function init() {
  document.documentElement.classList.toggle("reduced-motion", state.settings.reducedMotion);
  renderAvatarGallery();
  renderStart();
  renderSettings();
  renderTestModeAvailability();
  renderTestModeDialog();
  renderTestCheckpointGrid();
  bindEvents();
  exposeDebugApi();
  showScreen("start");
  setPanelVisible(refs.puzzlePanel, false);
  setPanelVisible(refs.elevatorCodePanel, false);
  setPanelVisible(refs.menuPanel, false);
  setPanelVisible(refs.completionPanel, false);
  setPanelVisible(refs.testModeDialog, false);
  if (refs.messageCard) refs.messageCard.setAttribute("aria-live", "polite");
  if (refs.worldCanvas) {
    refs.worldCanvas.tabIndex = 0;
    refs.worldCanvas.setAttribute(
      "aria-label",
      `העולם התלת־ממדי של ${activeFloorConfig.floorName}`
    );
  }
  window.clearInterval(saveInterval);
  saveInterval = window.setInterval(() => {
    if (currentScreen !== "game" || state.finished) return;
    captureClock(true);
    const snapshot = world?.getSnapshot?.();
    if (snapshot?.pose) state.pose = sanitizePose(snapshot.pose);
    saveState();
  }, 10000);
}

init();
