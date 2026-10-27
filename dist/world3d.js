/**
 * Continuous third-person world for the dendritic-computation floor.
 *
 * This module deliberately has no network dependencies. Three.js and every
 * bitmap used by the scene are served from this application's own `dist`
 * directory.
 */
import * as THREE from "./vendor/three/three.module.js";

const ROOM_SIZE = 16;
const ROOM_HALF = ROOM_SIZE / 2;
const ROOM_GAP = 2;
const ROOM_STEP = ROOM_SIZE + ROOM_GAP;
const WALL_HEIGHT = 5.8;
const WALL_THICKNESS = 0.28;
const CORRIDOR_WALL_THICKNESS = 0.24;
const CORRIDOR_LENGTH = ROOM_GAP + 0.3;
const VERTICAL_CORRIDOR_CENTER_Z = -ROOM_HALF - ROOM_GAP / 2;
const EXIT_CORRIDOR_LENGTH = CORRIDOR_LENGTH + 1.4;
const DOOR_WIDTH = 4.2;
const PLAYER_RADIUS = 1.26;
const CAMERA_CLEARANCE_RADIUS = 0.82;
const INTERACT_DISTANCE = 2.25;

const ROOM_DEFINITIONS = [
  { index: 0, name: "חדר החישוביות", center: [0, 0], color: 0x82e7d4 },
  { index: 1, name: "חדר הקולטנים", center: [0, -ROOM_STEP], color: 0x63c9d1 },
  { index: 2, name: "מעבדת הסידן", center: [ROOM_STEP, -ROOM_STEP], color: 0xf5b96a },
  { index: 3, name: "ליבת האינטגרציה", center: [ROOM_STEP, 0], color: 0xf18c74 }
];

// Rooms form a U-shaped route: north, east, south, then east to the exit.
const WALKABLE_RECTS = [
  ...ROOM_DEFINITIONS.map(({ center }) => ({
    minX: center[0] - ROOM_HALF + WALL_THICKNESS / 2,
    maxX: center[0] + ROOM_HALF - WALL_THICKNESS / 2,
    minZ: center[1] - ROOM_HALF + WALL_THICKNESS / 2,
    maxZ: center[1] + ROOM_HALF - WALL_THICKNESS / 2
  })),
  {
    minX: -DOOR_WIDTH / 2 + CORRIDOR_WALL_THICKNESS / 2,
    maxX: DOOR_WIDTH / 2 - CORRIDOR_WALL_THICKNESS / 2,
    minZ: VERTICAL_CORRIDOR_CENTER_Z - CORRIDOR_LENGTH / 2,
    maxZ: VERTICAL_CORRIDOR_CENTER_Z + CORRIDOR_LENGTH / 2
  },
  {
    minX: ROOM_HALF + ROOM_GAP / 2 - CORRIDOR_LENGTH / 2,
    maxX: ROOM_HALF + ROOM_GAP / 2 + CORRIDOR_LENGTH / 2,
    minZ: -ROOM_STEP - DOOR_WIDTH / 2 + CORRIDOR_WALL_THICKNESS / 2,
    maxZ: -ROOM_STEP + DOOR_WIDTH / 2 - CORRIDOR_WALL_THICKNESS / 2
  },
  {
    minX: ROOM_STEP - DOOR_WIDTH / 2 + CORRIDOR_WALL_THICKNESS / 2,
    maxX: ROOM_STEP + DOOR_WIDTH / 2 - CORRIDOR_WALL_THICKNESS / 2,
    minZ: VERTICAL_CORRIDOR_CENTER_Z - CORRIDOR_LENGTH / 2,
    maxZ: VERTICAL_CORRIDOR_CENTER_Z + CORRIDOR_LENGTH / 2
  },
  {
    minX: ROOM_STEP + ROOM_HALF + ROOM_GAP / 2 - EXIT_CORRIDOR_LENGTH / 2,
    maxX: ROOM_STEP + ROOM_HALF + ROOM_GAP / 2 + EXIT_CORRIDOR_LENGTH / 2,
    minZ: -DOOR_WIDTH / 2 + CORRIDOR_WALL_THICKNESS / 2,
    maxZ: DOOR_WIDTH / 2 - CORRIDOR_WALL_THICKNESS / 2
  }
];

const DOOR_DEFINITIONS = [
  { index: 0, x: 0, z: -ROOM_HALF - 0.02, orientation: "horizontal", from: 0, to: 1 },
  { index: 1, x: ROOM_HALF + 0.02, z: -ROOM_STEP, orientation: "vertical", from: 1, to: 2 },
  { index: 2, x: ROOM_STEP, z: -ROOM_STEP + ROOM_HALF + 0.02, orientation: "horizontal", from: 2, to: 3 },
  { index: 3, x: ROOM_STEP + ROOM_HALF + 0.02, z: 0, orientation: "vertical", from: 3, to: null }
];

const INTERACTABLE_DEFINITIONS = [
  { id: "puzzle0", label: "תחנת חידה 1", room: 0, x: -4.75, z: -3.95, scale: 1.0, asset: "station-stellate.png", cipherAsset: "floor2/station-cipher-pulse.png", networkAsset: "floor3/station-network-node.png", spriteScale: [2.9, 4.05], stationKind: "stellate" },
  { id: "key", label: "פריט קסום", room: 0, x: 4.65, z: -3.4, scale: 0.92, asset: "item-neuron-key.png", cipherAsset: "floor2/item-sync-key.png", networkAsset: "floor3/item-node-key.png", spriteScale: [2.15, 3.45], item: "key", digitIndex: 0, visual: "neuron-key" },
  { id: "cell", label: "ליבת הסידן", room: 1, x: -4.65, z: -14.35, scale: 0.76, asset: "item-calcium-neuron.png", cipherAsset: "floor2/item-pulse-core.png", networkAsset: "floor3/item-weight-crystal.png", spriteScale: [3.0, 3.15], item: "cell", digitIndex: 1, visual: "calcium" },
  { id: "puzzle1", label: "תחנת חידה 2", room: 1, x: -4.75, z: -22.15, scale: 1.0, asset: "station-pyramidal.png", cipherAsset: "floor2/station-cipher-matrix.png", networkAsset: "floor3/station-network-graph.png", spriteScale: [2.85, 4.35], stationKind: "pyramidal" },
  { id: "puzzle2", label: "תחנת חידה 3", room: 2, x: ROOM_STEP + 4.75, z: -22.15, scale: 1.0, asset: "station-purkinje.png", cipherAsset: "floor2/station-cipher-lock.png", networkAsset: "floor3/station-network-weight.png", spriteScale: [4.25, 3.8], stationKind: "purkinje" },
  { id: "code", label: "גביש הסכימה", room: 2, x: ROOM_STEP + 4.7, z: -14.1, scale: 0.6, asset: "item-network-neuron.png", cipherAsset: "floor2/item-cipher-shard.png", networkAsset: "floor3/item-embedding-orb.png", spriteScale: [3.15, 2.95], item: "code", digitIndex: 2, visual: "network" },
  { id: "puzzle3", label: "תחנת חידה 4", room: 3, x: ROOM_STEP + 4.7, z: 3.95, scale: 1.0, asset: "station-bipolar.png", cipherAsset: "floor2/station-cipher-orbit.png", networkAsset: "floor3/station-network-deep.png", spriteScale: [2.75, 4.25], stationKind: "bipolar" },
  { id: "relic", label: "פריט קסום", room: 3, x: ROOM_STEP - 4.7, z: -3.7, scale: 0.66, asset: "item-dendrite-talisman.png", cipherAsset: "floor2/item-signal-talisman.png", networkAsset: "floor3/item-output-talisman.png", spriteScale: [3.25, 3.05], item: "relic", digitIndex: 3, visual: "relic" },
  { id: "exit", label: "מעלית האקסון", room: 3, x: ROOM_STEP + ROOM_HALF + 1.45, z: 0, scale: 1.0, asset: "exit-neuron-gate.png", cipherAsset: "floor2/exit-cipher-elevator.png", networkAsset: "floor3/exit-network-elevator.png", spriteScale: [4.15, 5.55], exit: true, visual: "exit" }
];

const LABELS = Object.fromEntries(INTERACTABLE_DEFINITIONS.map((item) => [item.id, item.label]));
LABELS.lockedDoor0 = "הדלת לחדר הקולטנים נעולה";
LABELS.lockedDoor1 = "הדלת למעבדת הסידן נעולה";
LABELS.lockedDoor2 = "הדלת לליבת האינטגרציה נעולה";
LABELS.lockedDoor3 = "דלת היציאה נעולה";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const normalizeAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

function safeCallback(callback, ...args) {
  if (typeof callback !== "function") return;
  try {
    callback(...args);
  } catch (error) {
    // A UI callback should never be able to stop the render loop.
    console.error("Dendrite world callback failed", error);
  }
}

function isElement(value) {
  return Boolean(value && typeof value === "object" && value.nodeType === 1);
}

function isEditableTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  // Buttons are deliberately excluded: after solving a puzzle the action
  // button keeps focus, but the arrow keys must immediately resume movement.
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function pointInAnyWalkableRect(x, z) {
  return WALKABLE_RECTS.some((rect) =>
    x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ
  );
}

// Sampling the player capsule's footprint against the union of room/corridor
// rectangles avoids the artificial seams created by shrinking each rectangle.
function circleInsideWalkable(x, z, radius = PLAYER_RADIUS) {
  const samples = [[0, 0]];
  for (let index = 0; index < 32; index += 1) {
    const angle = (index / 32) * Math.PI * 2;
    samples.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return samples.every(([dx, dz]) => pointInAnyWalkableRect(x + dx, z + dz));
}

function roomForPosition(x, z) {
  for (const room of ROOM_DEFINITIONS) {
    if (Math.abs(x - room.center[0]) <= ROOM_HALF && Math.abs(z - room.center[1]) <= ROOM_HALF) {
      return room.index;
    }
  }
  if (Math.abs(x) <= DOOR_WIDTH / 2 && z < -ROOM_HALF && z > -ROOM_STEP) {
    return z < -ROOM_HALF - ROOM_GAP / 2 ? 1 : 0;
  }
  if (x > ROOM_HALF && x < ROOM_STEP && Math.abs(z + ROOM_STEP) <= DOOR_WIDTH / 2) {
    return x > ROOM_HALF + ROOM_GAP / 2 ? 2 : 1;
  }
  if (Math.abs(x - ROOM_STEP) <= DOOR_WIDTH / 2 && z > -ROOM_STEP && z < -ROOM_HALF) {
    return z > -ROOM_STEP + ROOM_GAP / 2 ? 3 : 2;
  }
  if (x >= ROOM_STEP + ROOM_HALF && Math.abs(z) <= DOOR_WIDTH / 2) return 3;

  let nearest = 0;
  let nearestDistance = Infinity;
  ROOM_DEFINITIONS.forEach((room) => {
    const distance = Math.hypot(x - room.center[0], z - room.center[1]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = room.index;
    }
  });
  return nearest;
}

function parseOptions(optionsOrContainer, maybeOptions) {
  if (isElement(optionsOrContainer)) {
    if (optionsOrContainer.tagName === "CANVAS") {
      return { ...(maybeOptions || {}), canvas: optionsOrContainer };
    }
    return { ...(maybeOptions || {}), container: optionsOrContainer };
  }
  return optionsOrContainer || {};
}

/**
 * Create the floor-one world.
 *
 * The preferred form is `createDendriteWorld({ canvas, ...callbacks })`.
 * Passing only a container is also supported and creates one canvas inside it.
 */
export function createDendriteWorld(optionsOrContainer = {}, maybeOptions = {}) {
  const options = parseOptions(optionsOrContainer, maybeOptions);
  const suppliedCanvas = isElement(options.canvas) && options.canvas.tagName === "CANVAS" ? options.canvas : null;
  const container = isElement(options.container)
    ? options.container
    : suppliedCanvas && suppliedCanvas.parentElement
      ? suppliedCanvas.parentElement
      : null;

  if (!container && !suppliedCanvas) {
    throw new Error("createDendriteWorld requires a canvas or container element");
  }

  const canvas = suppliedCanvas || document.createElement("canvas");
  const ownsCanvas = !suppliedCanvas;
  if (ownsCanvas) container.appendChild(canvas);
  canvas.classList.add("dendrite-world-canvas");
  canvas.setAttribute("role", "img");
  const cipherMode = options.theme === "cipher";
  const networkMode = options.theme === "network";
  const floorNumber = Number(options.floor) || 1;
  const authoredTheme = cipherMode || networkMode;
  const themeRoomColors = cipherMode
    ? [0x39d9ff, 0x6e7bff, 0xd35cff, 0x2de6c4]
    : networkMode
      ? [0x34e7c5, 0x70a8ff, 0xd77bff, 0xffc75a]
      : ROOM_DEFINITIONS.map((room) => room.color);
  const roomDefinitions = ROOM_DEFINITIONS.map((room, index) => ({
    ...room,
    name: options.roomNames?.[index] || room.name,
    color: themeRoomColors[index]
  }));

  canvas.setAttribute(
    "aria-label",
    `עולם תלת־ממדי של ${cipherMode ? "הצפנה ופיענוח" : networkMode ? "רשתות נוירונים" : "ארבעת חדרי החישוביות הדנדריטית"}`
  );
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "none";
  canvas.style.cursor = "grab";

  const callbacks = {
    onInteract: options.onInteract,
    onRoomChange: options.onRoomChange,
    onFootstep: options.onFootstep,
    onNearbyChange: options.onNearbyChange,
    onPoseChange: options.onPoseChange,
    onElevatorRiseComplete: options.onElevatorRiseComplete
  };

  const scene = new THREE.Scene();
  const sceneColor = cipherMode ? 0x020713 : networkMode ? 0x04150f : 0x071e29;
  scene.background = new THREE.Color(sceneColor);
  scene.fog = new THREE.FogExp2(cipherMode ? 0x071226 : networkMode ? 0x09261f : 0x082733, authoredTheme ? 0.022 : 0.025);

  const camera = new THREE.PerspectiveCamera(57, 1, 0.08, 85);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(sceneColor, 1);

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const cameraObstacles = [];
  const animatedLights = [];
  const dendriteSignals = [];
  const propRecords = new Map();
  const doorRecords = [];

  const trackGeometry = (geometry) => {
    geometries.add(geometry);
    return geometry;
  };
  const trackMaterial = (material) => {
    materials.add(material);
    return material;
  };
  const trackTexture = (texture) => {
    textures.add(texture);
    return texture;
  };

  const textureLoader = new THREE.TextureLoader();
  const loadTexture = (url, onError) => {
    const texture = textureLoader.load(
      url,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.needsUpdate = true;
      },
      undefined,
      () => {
        if (typeof onError === "function") onError(texture);
      }
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return trackTexture(texture);
  };

  const textureAtlas = loadTexture("assets/3d/dendrite-texture-atlas.png");
  const effectTexture = loadTexture("assets/effect-dendrite.png");
  const profileAtlasA = loadTexture("assets/walk-atlas-a.png");
  const profileAtlasB = loadTexture("assets/walk-atlas-b.png");
  let frontAtlasFailed = false;
  const frontAtlas = loadTexture("assets/3d/walk-front-atlas.png", () => {
    frontAtlasFailed = true;
  });
  let backAtlasAFailed = false;
  let backAtlasBFailed = false;
  const backAtlasA = loadTexture("assets/3d/walk-back-atlas-a.png", () => {
    backAtlasAFailed = true;
  });
  const backAtlasB = loadTexture("assets/3d/walk-back-atlas-b.png", () => {
    backAtlasBFailed = true;
  });

  function cropTexture(base, columns, rows, column, rowFromTop, widthInCells = 1) {
    const texture = trackTexture(base.clone());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(widthInCells / columns, 1 / rows);
    texture.offset.set(column / columns, 1 - (rowFromTop + 1) / rows);
    texture.userData.frameWidth = widthInCells / columns;
    texture.userData.frameOriginX = column / columns;
    texture.needsUpdate = true;
    return texture;
  }

  function setTextureFrame(texture, frame, mirrored = false) {
    const frameWidth = texture.userData.frameWidth ?? Math.abs(texture.repeat.x);
    const frameOriginX = texture.userData.frameOriginX ?? texture.offset.x;
    const frameIndex = Math.max(0, Math.min(3, Math.trunc(frame)));
    const frameX = frameOriginX + frameIndex * frameWidth;
    const nextRepeatX = mirrored ? -frameWidth : frameWidth;
    const nextOffsetX = mirrored ? frameX + frameWidth : frameX;
    if (texture.repeat.x !== nextRepeatX || texture.offset.x !== nextOffsetX) {
      texture.repeat.x = nextRepeatX;
      texture.offset.x = nextOffsetX;
      texture.needsUpdate = true;
    }
  }

  // The environment atlas contains the floor, ceiling, and door skins. Floors
  // two and three use authored raster artwork throughout so every theme has
  // visible material detail instead of flat or HTML-like placeholders.
  const floorTexture = cipherMode
    ? loadTexture("assets/3d/floor2/floor-cipher-plates.png")
    : networkMode
      ? loadTexture("assets/3d/floor3/floor-network.png")
      : cropTexture(textureAtlas, 2, 2, 1, 0);
  if (authoredTheme) {
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(networkMode ? 2.05 : 2.25, networkMode ? 2.05 : 2.25);
    floorTexture.needsUpdate = true;
  }
  const ceilingTexture = cropTexture(textureAtlas, 2, 2, 0, 1);
  const leftDoorTexture = cropTexture(textureAtlas, 4, 2, 2, 1);
  const rightDoorTexture = cropTexture(textureAtlas, 4, 2, 3, 1);
  const wallTextureA = cipherMode
    ? loadTexture("assets/3d/floor2/wall-cipher-bricks-clear.png")
    : networkMode
      ? loadTexture("assets/3d/floor3/wall-network.png")
      : loadTexture("assets/3d/wall-bricks-neuron-a.png");
  const wallTextureB = cipherMode
    ? loadTexture("assets/3d/floor2/wall-cipher-bricks-clear.png")
    : networkMode
      ? loadTexture("assets/3d/floor3/wall-network.png")
      : loadTexture("assets/3d/wall-bricks-neuron-b.png");
  const cipherPanelTexture = cipherMode
    ? loadTexture("assets/3d/floor2/cipher-panel.png")
    : null;
  const apRasterWallPanelTexture = cipherMode
    ? loadTexture("assets/3d/floor2/ap-raster-wall-panel.png")
    : null;
  const networkWallPanelTexture = networkMode
    ? loadTexture("assets/3d/floor3/network-wall-panel.png")
    : null;
  const signalFloorTraceTexture = cipherMode
    ? loadTexture("assets/3d/floor2/ap-raster-floor-decal.png")
    : null;
  const networkFloorTraceTexture = networkMode
    ? loadTexture("assets/3d/floor3/network-floor-decal.png")
    : null;
  const digitFrameTexture = cipherMode
    ? loadTexture("assets/3d/floor2/digit-signal-badge.png")
    : networkMode
      ? loadTexture("assets/3d/floor3/digit-network-badge.png")
      : null;
  [wallTextureA, wallTextureB].forEach((texture) => {
    texture.wrapS = authoredTheme ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    texture.wrapT = authoredTheme ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    if (authoredTheme) texture.repeat.set(networkMode ? 1.05 : 1.15, networkMode ? 1.05 : 0.92);
    texture.needsUpdate = true;
  });

  const floorMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: floorTexture,
    color: authoredTheme ? 0xffffff : 0xb2f3ee,
    roughness: cipherMode ? 0.68 : networkMode ? 0.6 : 0.48,
    metalness: cipherMode ? 0.38 : networkMode ? 0.44 : 0.16
  }));
  const ceilingMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: ceilingTexture,
    color: cipherMode ? 0x08152b : networkMode ? 0x09261f : 0x76aeb5,
    roughness: 0.72,
    metalness: 0.04,
    side: THREE.DoubleSide
  }));
  const trimMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    color: cipherMode ? 0x5168d8 : networkMode ? 0x44d7a6 : 0xb98535,
    emissive: cipherMode ? 0x151f71 : networkMode ? 0x0c563d : 0x4c2605,
    emissiveIntensity: authoredTheme ? 0.88 : 0.55,
    roughness: 0.3,
    metalness: 0.72
  }));
  const corridorWallMaterial = trackMaterial(new THREE.MeshStandardMaterial({
    map: wallTextureB,
    color: 0xffffff,
    emissive: cipherMode ? 0x071028 : networkMode ? 0x072319 : 0x000000,
    emissiveIntensity: authoredTheme ? 0.22 : 0,
    roughness: 0.7,
    metalness: 0.02
  }));

  const roomWallMaterials = roomDefinitions.map((room, index) => trackMaterial(new THREE.MeshStandardMaterial({
    map: index % 2 ? wallTextureB : wallTextureA,
    color: 0xffffff,
    emissive: cipherMode ? 0x071028 : networkMode ? 0x072319 : 0x000000,
    emissiveIntensity: authoredTheme ? 0.22 : 0,
    roughness: 0.7,
    metalness: 0.02
  })));

  const addMesh = (geometry, material, x, y, z, optionsForMesh = {}) => {
    const mesh = new THREE.Mesh(trackGeometry(geometry), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = Boolean(optionsForMesh.castShadow);
    mesh.receiveShadow = optionsForMesh.receiveShadow !== false;
    scene.add(mesh);
    if (optionsForMesh.cameraObstacle) cameraObstacles.push(mesh);
    return mesh;
  };

  function addWallSegment(centerX, centerZ, width, depth, material) {
    return addMesh(
      new THREE.BoxGeometry(width, WALL_HEIGHT, depth),
      material,
      centerX,
      WALL_HEIGHT / 2,
      centerZ,
      { castShadow: true, cameraObstacle: true }
    );
  }

  function addSplitWall(centerX, centerZ, side, open, material) {
    const thickness = WALL_THICKNESS;
    if (!open) {
      if (side === "north" || side === "south") addWallSegment(centerX, centerZ, ROOM_SIZE, thickness, material);
      else addWallSegment(centerX, centerZ, thickness, ROOM_SIZE, material);
      return;
    }

    const segment = (ROOM_SIZE - DOOR_WIDTH) / 2;
    const offset = DOOR_WIDTH / 2 + segment / 2;
    if (side === "north" || side === "south") {
      addWallSegment(centerX - offset, centerZ, segment, thickness, material);
      addWallSegment(centerX + offset, centerZ, segment, thickness, material);
    } else {
      addWallSegment(centerX, centerZ - offset, thickness, segment, material);
      addWallSegment(centerX, centerZ + offset, thickness, segment, material);
    }
  }

  function addRoom(room) {
    const [x, z] = room.center;
    const floor = addMesh(
      new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
      floorMaterial,
      x,
      0,
      z,
      { receiveShadow: true }
    );
    floor.rotation.x = -Math.PI / 2;

    const ceiling = addMesh(
      new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
      ceilingMaterial,
      x,
      WALL_HEIGHT,
      z,
      { receiveShadow: false }
    );
    ceiling.rotation.x = Math.PI / 2;

    const openings = {
      north: room.index === 0 || room.index === 3,
      east: room.index === 1 || room.index === 3,
      south: room.index === 1 || room.index === 2,
      west: room.index === 2
    };
    // R3's north opening connects to R2; R2's south opening is its other side.
    // R0 and R3 share a physical edge but intentionally have solid walls there.
    if (room.index === 0) openings.east = false;
    if (room.index === 3) openings.west = false;

    addSplitWall(x, z - ROOM_HALF, "north", openings.north, roomWallMaterials[room.index]);
    addSplitWall(x, z + ROOM_HALF, "south", openings.south, roomWallMaterials[room.index]);
    addSplitWall(x + ROOM_HALF, z, "east", openings.east, roomWallMaterials[room.index]);
    addSplitWall(x - ROOM_HALF, z, "west", openings.west, roomWallMaterials[room.index]);

    // A luminous floor ring makes each room legible without adding interface text.
    const ring = addMesh(
      new THREE.RingGeometry(5.25, 5.34, 64),
      trackMaterial(new THREE.MeshBasicMaterial({ color: room.color, transparent: true, opacity: 0.42, side: THREE.DoubleSide })),
      x,
      0.035,
      z,
      { receiveShadow: false }
    );
    ring.rotation.x = -Math.PI / 2;

    const roomLight = new THREE.PointLight(room.color, 22, 20, 2);
    roomLight.position.set(x, 4.1, z);
    // Point-light cube shadows are disproportionately expensive on phones;
    // the shared directional shadow supplies the useful depth cue instead.
    roomLight.castShadow = false;
    scene.add(roomLight);
    animatedLights.push({ light: roomLight, base: 20 + room.index * 1.8, phase: room.index * 1.37 });
  }

  function addWallNeuronMural(room, side, variant) {
    const [x, z] = room.center;
    const panelWidth = 6.2;
    const panelHeight = 3.25;
    const panelMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x092b38,
      emissive: 0x061923,
      emissiveIntensity: 0.42,
      roughness: 0.5,
      metalness: 0.18,
      side: THREE.DoubleSide
    }));
    const glowMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: room.color,
      transparent: true,
      opacity: 0.88
    }));
    const warmMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: variant % 2 ? 0xffc45b : 0x8fffe5,
      transparent: true,
      opacity: 0.95
    }));
    const panel = new THREE.Mesh(trackGeometry(new THREE.PlaneGeometry(panelWidth, panelHeight)), panelMaterial);
    const mural = new THREE.Group();
    mural.add(panel);

    const soma = new THREE.Mesh(trackGeometry(new THREE.SphereGeometry(0.23, 16, 12)), warmMaterial);
    soma.position.set(0, 0.1, 0.12);
    mural.add(soma);

    const branchSets = variant % 2
      ? [
        [[0, 0.1, 0.14], [-0.9, 0.66, 0.14], [-1.55, 0.45, 0.14]],
        [[0, 0.1, 0.14], [0.9, 0.68, 0.14], [1.55, 0.35, 0.14]],
        [[0, 0.1, 0.14], [-0.35, -0.6, 0.14], [-0.8, -1.13, 0.14]],
        [[0, 0.1, 0.14], [0.35, -0.55, 0.14], [0.9, -1.08, 0.14]]
      ]
      : [
        [[0, 0.1, 0.14], [-0.82, 0.5, 0.14], [-1.5, 0.78, 0.14]],
        [[0, 0.1, 0.14], [0.82, 0.5, 0.14], [1.48, 0.78, 0.14]],
        [[0, 0.1, 0.14], [-0.55, -0.48, 0.14], [-1.35, -0.8, 0.14]],
        [[0, 0.1, 0.14], [0.58, -0.48, 0.14], [1.35, -0.78, 0.14]]
      ];
    branchSets.forEach((points, index) => {
      const curve = new THREE.CatmullRomCurve3(points.map(([px, py, pz]) => new THREE.Vector3(px, py, pz)));
      const branch = new THREE.Mesh(trackGeometry(new THREE.TubeGeometry(curve, 18, index > 1 ? 0.045 : 0.055, 6, false)), glowMaterial);
      mural.add(branch);
    });
    const axonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.05, 0.14),
      new THREE.Vector3(0.16, -0.52, 0.14),
      new THREE.Vector3(-0.1, -1.2, 0.14)
    ]);
    mural.add(new THREE.Mesh(trackGeometry(new THREE.TubeGeometry(axonCurve, 18, 0.065, 6, false)), warmMaterial));
    mural.position.y = 2.86;

    const inset = WALL_THICKNESS / 2 + 0.024;
    if (side === "north") {
      mural.position.x = x;
      mural.position.z = z - ROOM_HALF + inset;
    } else if (side === "south") {
      mural.position.x = x;
      mural.position.z = z + ROOM_HALF - inset;
      mural.rotation.y = Math.PI;
    } else if (side === "east") {
      mural.position.x = x + ROOM_HALF - inset;
      mural.position.z = z;
      mural.rotation.y = -Math.PI / 2;
    } else {
      mural.position.x = x - ROOM_HALF + inset;
      mural.position.z = z;
      mural.rotation.y = Math.PI / 2;
    }
    scene.add(mural);
  }

  function addCipherWallMural(room, side, variant) {
    const [x, z] = room.center;
    const panelWidth = 6.35;
    const panelHeight = 3.35;
    const panelTexture = networkMode
      ? networkWallPanelTexture
      : variant % 2
        ? apRasterWallPanelTexture
        : cipherPanelTexture;
    const panelMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      map: panelTexture,
      color: 0xffffff,
      emissive: networkMode ? 0x0a3e2f : 0x111746,
      emissiveIntensity: 0.24,
      roughness: 0.42,
      metalness: 0.38,
      side: THREE.DoubleSide
    }));
    const frameMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: room.color,
      transparent: true,
      opacity: 0.88
    }));
    const mural = new THREE.Group();
    mural.add(new THREE.Mesh(trackGeometry(new THREE.PlaneGeometry(panelWidth, panelHeight)), panelMaterial));
    const horizontalFrame = new THREE.BoxGeometry(panelWidth + 0.18, 0.055, 0.055);
    const verticalFrame = new THREE.BoxGeometry(0.055, panelHeight + 0.18, 0.055);
    const top = new THREE.Mesh(trackGeometry(horizontalFrame), frameMaterial);
    const bottom = new THREE.Mesh(trackGeometry(horizontalFrame.clone()), frameMaterial);
    const left = new THREE.Mesh(trackGeometry(verticalFrame), frameMaterial);
    const right = new THREE.Mesh(trackGeometry(verticalFrame.clone()), frameMaterial);
    top.position.y = panelHeight / 2;
    bottom.position.y = -panelHeight / 2;
    left.position.x = -panelWidth / 2;
    right.position.x = panelWidth / 2;
    mural.add(top, bottom, left, right);
    mural.position.y = 2.88;

    const inset = WALL_THICKNESS / 2 + 0.032;
    if (side === "north") {
      mural.position.x = x;
      mural.position.z = z - ROOM_HALF + inset;
    } else if (side === "south") {
      mural.position.x = x;
      mural.position.z = z + ROOM_HALF - inset;
      mural.rotation.y = Math.PI;
    } else if (side === "east") {
      mural.position.x = x + ROOM_HALF - inset;
      mural.position.z = z;
      mural.rotation.y = -Math.PI / 2;
    } else {
      mural.position.x = x - ROOM_HALF + inset;
      mural.position.z = z;
      mural.rotation.y = Math.PI / 2;
    }
    scene.add(mural);
  }

  function addCipherFloorTrace(room, index) {
    const floorTraceTexture = networkMode ? networkFloorTraceTexture : signalFloorTraceTexture;
    if (!floorTraceTexture) return;
    const traceMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      map: floorTraceTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    }));
    const trace = addMesh(
      new THREE.PlaneGeometry(11.6, networkMode ? 7.72 : 5.8),
      traceMaterial,
      room.center[0],
      0.048,
      room.center[1],
      { receiveShadow: false }
    );
    trace.rotation.x = -Math.PI / 2;
    trace.rotation.z = index % 2 ? 0.12 : -0.08;
    trace.renderOrder = 1;
  }

  roomDefinitions.forEach(addRoom);
  if (authoredTheme) {
    [
      ["south", "east", "west"],
      ["north", "west"],
      ["north", "east"],
      ["south", "west"]
    ].forEach((sides, roomIndex) => {
      sides.forEach((side, sideIndex) => {
        addCipherWallMural(roomDefinitions[roomIndex], side, roomIndex + sideIndex);
      });
    });
    roomDefinitions.forEach(addCipherFloorTrace);
  }

  function addCorridor({ x, z, width, depth, orientation }) {
    const floor = addMesh(new THREE.PlaneGeometry(width, depth), floorMaterial, x, 0.012, z);
    floor.rotation.x = -Math.PI / 2;
    const ceiling = addMesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial, x, WALL_HEIGHT, z);
    ceiling.rotation.x = Math.PI / 2;
    if (orientation === "vertical") {
      addWallSegment(x - width / 2, z, CORRIDOR_WALL_THICKNESS, depth, corridorWallMaterial);
      addWallSegment(x + width / 2, z, CORRIDOR_WALL_THICKNESS, depth, corridorWallMaterial);
    } else {
      addWallSegment(x, z - depth / 2, width, CORRIDOR_WALL_THICKNESS, corridorWallMaterial);
      addWallSegment(x, z + depth / 2, width, CORRIDOR_WALL_THICKNESS, corridorWallMaterial);
    }
  }

  addCorridor({ x: 0, z: VERTICAL_CORRIDOR_CENTER_Z, width: DOOR_WIDTH, depth: CORRIDOR_LENGTH, orientation: "vertical" });
  addCorridor({ x: ROOM_HALF + ROOM_GAP / 2, z: -ROOM_STEP, width: CORRIDOR_LENGTH, depth: DOOR_WIDTH, orientation: "horizontal" });
  addCorridor({ x: ROOM_STEP, z: VERTICAL_CORRIDOR_CENTER_Z, width: DOOR_WIDTH, depth: CORRIDOR_LENGTH, orientation: "vertical" });
  addCorridor({ x: ROOM_STEP + ROOM_HALF + ROOM_GAP / 2, z: 0, width: EXIT_CORRIDOR_LENGTH, depth: DOOR_WIDTH, orientation: "horizontal" });

  function createDoor(definition, initiallyOpen) {
    const group = new THREE.Group();
    group.position.set(definition.x, 0, definition.z);
    scene.add(group);

    const panelGeometry = trackGeometry(
      definition.orientation === "horizontal"
        ? new THREE.BoxGeometry(DOOR_WIDTH / 2, 4.25, 0.22)
        : new THREE.BoxGeometry(0.22, 4.25, DOOR_WIDTH / 2)
    );
    const leftMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      map: leftDoorTexture,
      color: cipherMode ? 0x8e9cff : networkMode ? 0x7ce8c1 : 0xe7fcfa,
      emissive: cipherMode ? 0x2c3ca0 : networkMode ? 0x176b51 : 0x0c5d65,
      emissiveIntensity: authoredTheme ? 1.05 : 0.55,
      roughness: 0.3,
      metalness: 0.48
    }));
    const rightMaterial = trackMaterial(leftMaterial.clone());
    rightMaterial.map = rightDoorTexture;
    materials.add(rightMaterial);

    const panelA = new THREE.Mesh(panelGeometry, leftMaterial);
    const panelB = new THREE.Mesh(panelGeometry, rightMaterial);
    panelA.position.y = panelB.position.y = 2.13;
    panelA.castShadow = panelB.castShadow = true;
    panelA.receiveShadow = panelB.receiveShadow = true;
    group.add(panelA, panelB);
    cameraObstacles.push(panelA, panelB);

    const postGeometry = definition.orientation === "horizontal"
      ? new THREE.BoxGeometry(0.25, 4.8, 0.42)
      : new THREE.BoxGeometry(0.42, 4.8, 0.25);
    const lintelGeometry = definition.orientation === "horizontal"
      ? new THREE.BoxGeometry(DOOR_WIDTH + 0.55, 0.28, 0.42)
      : new THREE.BoxGeometry(0.42, 0.28, DOOR_WIDTH + 0.55);
    const postOffset = DOOR_WIDTH / 2 + 0.14;
    const postA = new THREE.Mesh(trackGeometry(postGeometry), trimMaterial);
    const postB = new THREE.Mesh(trackGeometry(postGeometry.clone()), trimMaterial);
    const lintel = new THREE.Mesh(trackGeometry(lintelGeometry), trimMaterial);
    if (definition.orientation === "horizontal") {
      postA.position.x = -postOffset;
      postB.position.x = postOffset;
    } else {
      postA.position.z = -postOffset;
      postB.position.z = postOffset;
    }
    postA.position.y = postB.position.y = 2.4;
    lintel.position.y = 4.66;
    postA.castShadow = postB.castShadow = lintel.castShadow = true;
    group.add(postA, postB, lintel);
    cameraObstacles.push(postA, postB, lintel);

    const statusLight = new THREE.PointLight(
      initiallyOpen ? (networkMode ? 0x7dffc3 : 0x65ffd1) : (cipherMode ? 0xf0a4ff : networkMode ? 0xffc75a : 0xff8838),
      authoredTheme ? 20 : 16,
      5.5,
      2
    );
    statusLight.position.set(0, 3.9, 0.55);
    group.add(statusLight);

    const record = {
      ...definition,
      group,
      panels: [panelA, panelB],
      materials: [leftMaterial, rightMaterial],
      light: statusLight,
      target: initiallyOpen ? 1 : 0,
      progress: initiallyOpen ? 1 : 0
    };
    doorRecords.push(record);
    positionDoorPanels(record);
    return record;
  }

  function positionDoorPanels(door) {
    const base = DOOR_WIDTH / 4;
    const travel = 1.92 * door.progress;
    if (door.orientation === "horizontal") {
      door.panels[0].position.x = -base - travel;
      door.panels[1].position.x = base + travel;
    } else {
      door.panels[0].position.z = -base - travel;
      door.panels[1].position.z = base + travel;
    }
    const openColor = new THREE.Color(cipherMode ? 0x2de6c4 : networkMode ? 0x7dffc3 : 0x65ffd1);
    const lockedColor = new THREE.Color(cipherMode ? 0xf0a4ff : networkMode ? 0xffc75a : 0xff8838);
    door.light.color.copy(lockedColor).lerp(openColor, door.progress);
    door.light.intensity = 12 + Math.sin(door.progress * Math.PI) * 14;
    door.materials.forEach((material) => {
      material.emissive.copy(
        (cipherMode ? new THREE.Color(0x2a0f5e) : networkMode ? new THREE.Color(0x311056) : new THREE.Color(0x6a2708))
          .lerp(cipherMode ? new THREE.Color(0x087c70) : networkMode ? new THREE.Color(0x087d62) : new THREE.Color(0x0a716b), door.progress)
      );
      material.emissiveIntensity = authoredTheme
        ? 0.82 + door.progress * 0.38
        : 0.48 + door.progress * 0.42;
    });
  }

  const initialData = options.initialState || {};
  let puzzleCount = clamp(
    Math.trunc(finite(options.puzzleCount ?? initialData.puzzleCount, 4)),
    1,
    4
  );
  let completed = Array.isArray(options.completed)
    ? options.completed.slice(0, 4).map(Boolean)
    : Array.isArray(initialData.completed)
      ? initialData.completed.slice(0, 4).map(Boolean)
      : [false, false, false, false];
  while (completed.length < 4) completed.push(false);
  let flags = { ...(initialData.flags || {}), ...(options.flags || {}) };
  let codeDigits = Array.isArray(options.codeDigits)
    ? options.codeDigits.slice(0, 4).map((digit) => clamp(Math.trunc(finite(digit, 0)), 0, 9))
    : [0, 0, 0, 0];
  while (codeDigits.length < 4) codeDigits.push(0);
  let avatarIndex = clamp(Math.trunc(finite(options.avatarIndex ?? initialData.avatarIndex, 0)), 0, 5);
  let reducedMotion = Boolean(options.reducedMotion ?? initialData.reducedMotion);
  const doorOpenFor = (index) => {
    if (index === 0) return Boolean(flags.keyUsed || flags.doorOpen);
    if (index === 1) return Boolean(flags.cellUsed);
    // On floor 3 the second magical item is the final key. Keep the
    // passage to the elevator open with that item so no stale door collision
    // remains between the player and the exit.
    if (index === 2 && floorNumber === 3 && puzzleCount <= 2) return Boolean(flags.cellUsed);
    if (index === 2) return Boolean(flags.codeUsed);
    return Boolean(flags.elevatorUnlocked);
  };
  DOOR_DEFINITIONS.forEach((definition, index) => createDoor(definition, doorOpenFor(index)));

  function createNeuronMaterial(color, options = {}) {
    return trackMaterial(new THREE.MeshStandardMaterial({
      color,
      emissive: options.emissive ?? color,
      emissiveIntensity: options.emissiveIntensity ?? 0.34,
      roughness: options.roughness ?? 0.34,
      metalness: options.metalness ?? 0.22,
      ...options
    }));
  }

  function addPart(group, geometry, material, x, y, z, options = {}) {
    const mesh = new THREE.Mesh(trackGeometry(geometry), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;
    if (options.scale) mesh.scale.set(...options.scale);
    if (options.rotation) mesh.rotation.set(...options.rotation);
    group.add(mesh);
    return mesh;
  }

  function addNeuronTube(group, points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const mesh = new THREE.Mesh(
      trackGeometry(new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), radius, 7, false)),
      material
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function addGroundBase(group, material, accentMaterial) {
    addPart(group, new THREE.CylinderGeometry(0.62, 0.72, 0.16, 24), material, 0, 0.08, 0);
    addPart(group, new THREE.TorusGeometry(0.46, 0.035, 8, 28), accentMaterial, 0, 0.18, 0, {
      rotation: [0, 0, 0]
    }).rotation.x = Math.PI / 2;
    addNeuronTube(group, [[0, 0.13, 0], [0, 0.46, 0], [0.06, 0.78, 0]], 0.075, accentMaterial);
  }

  function createNeuronStationVisual(definition) {
    const group = new THREE.Group();
    const roomColor = themeRoomColors[definition.room] ?? 0x82e7d4;
    const bodyMaterial = createNeuronMaterial(0xdafbf4, { emissive: 0x16454e, emissiveIntensity: 0.28 });
    const accentMaterial = createNeuronMaterial(roomColor, { emissiveIntensity: 0.7, metalness: 0.34 });
    const warmMaterial = createNeuronMaterial(0xffc45b, { emissive: 0x7d3f12, emissiveIntensity: 0.68, metalness: 0.38 });
    const accentMaterials = [accentMaterial];
    addGroundBase(group, bodyMaterial, accentMaterial);

    switch (definition.stationKind) {
      case "pyramidal":
        addPart(group, new THREE.ConeGeometry(0.64, 0.96, 5), bodyMaterial, 0, 1.24, 0);
        addNeuronTube(group, [[0, 1.67, 0], [-0.45, 2.12, 0], [-0.9, 2.28, 0]], 0.065, accentMaterial);
        addNeuronTube(group, [[0, 1.67, 0], [0.38, 2.11, 0.08], [0.86, 2.2, 0.16]], 0.065, accentMaterial);
        addNeuronTube(group, [[-0.12, 0.9, 0], [-0.15, 0.58, 0.08], [-0.08, 0.3, 0]], 0.08, warmMaterial);
        accentMaterials.push(warmMaterial);
        break;
      case "purkinje":
        addPart(group, new THREE.SphereGeometry(0.55, 20, 14), bodyMaterial, 0, 1.12, 0);
        addNeuronTube(group, [[0, 1.35, 0], [-0.72, 1.65, 0], [-1.42, 1.55, 0]], 0.06, accentMaterial);
        addNeuronTube(group, [[0, 1.4, 0], [-0.48, 1.98, 0], [-1.02, 2.18, 0]], 0.055, accentMaterial);
        addNeuronTube(group, [[0, 1.4, 0], [0.68, 1.7, 0], [1.45, 1.5, 0]], 0.06, accentMaterial);
        addNeuronTube(group, [[0, 1.42, 0], [0.48, 2.0, 0], [1.08, 2.18, 0]], 0.055, accentMaterial);
        addNeuronTube(group, [[0, 0.75, 0], [0.08, 0.42, 0.06], [0, 0.22, 0]], 0.09, warmMaterial);
        accentMaterials.push(warmMaterial);
        break;
      case "bipolar":
        addPart(group, new THREE.SphereGeometry(0.5, 20, 14), bodyMaterial, 0, 1.16, 0, { scale: [0.68, 1.35, 0.68] });
        addNeuronTube(group, [[0, 1.7, 0], [-0.24, 2.2, 0], [0, 2.62, 0]], 0.065, accentMaterial);
        addNeuronTube(group, [[0, 0.65, 0], [0.18, 0.3, 0.04], [0.05, 0.16, 0]], 0.08, warmMaterial);
        addNeuronTube(group, [[0, 1.26, 0], [0.62, 1.38, 0.05], [1.05, 1.22, 0.1]], 0.052, accentMaterial);
        addNeuronTube(group, [[0, 1.26, 0], [-0.62, 1.43, -0.05], [-1.05, 1.22, -0.1]], 0.052, accentMaterial);
        accentMaterials.push(warmMaterial);
        break;
      case "receptor":
        addPart(group, new THREE.SphereGeometry(0.5, 18, 12), bodyMaterial, 0, 1.0, 0);
        addNeuronTube(group, [[-0.15, 1.22, 0], [-0.7, 1.55, 0.08], [-1.12, 1.38, 0.1]], 0.06, accentMaterial);
        addNeuronTube(group, [[0.15, 1.22, 0], [0.7, 1.55, -0.08], [1.12, 1.38, -0.1]], 0.06, accentMaterial);
        addPart(group, new THREE.TorusGeometry(0.24, 0.055, 8, 20), warmMaterial, 0, 1.0, 0.43, { rotation: [Math.PI / 2, 0, 0] });
        accentMaterials.push(warmMaterial);
        break;
      default:
        addPart(group, new THREE.SphereGeometry(0.56, 20, 14), bodyMaterial, 0, 1.12, 0);
        addNeuronTube(group, [[0, 1.3, 0], [-0.56, 1.82, 0.08], [-1.15, 1.95, 0.12]], 0.06, accentMaterial);
        addNeuronTube(group, [[0, 1.3, 0], [0.62, 1.84, -0.08], [1.22, 1.98, -0.12]], 0.06, accentMaterial);
        addNeuronTube(group, [[0, 1.22, 0], [-0.4, 0.76, 0.04], [-0.14, 0.28, 0]], 0.085, warmMaterial);
        addNeuronTube(group, [[0, 1.3, 0], [0.05, 1.75, 0.25], [0.0, 2.18, 0.36]], 0.052, accentMaterial);
        accentMaterials.push(warmMaterial);
        break;
    }
    return { group, material: bodyMaterial, accentMaterials, accentColor: roomColor };
  }

  function createNeuronKeyVisual(definition) {
    const group = new THREE.Group();
    const bodyMaterial = createNeuronMaterial(0xffe5a0, { emissive: 0x9b5a14, emissiveIntensity: 0.74, metalness: 0.45 });
    const accentMaterial = createNeuronMaterial(0xffa83d, { emissive: 0xb3470b, emissiveIntensity: 0.9, metalness: 0.5 });
    addGroundBase(group, bodyMaterial, accentMaterial);
    addPart(group, new THREE.SphereGeometry(0.54, 20, 14), bodyMaterial, 0, 1.3, 0);
    addNeuronTube(group, [[0, 1.48, 0], [-0.58, 1.92, 0.06], [-1.03, 2.05, 0.1]], 0.07, accentMaterial);
    addNeuronTube(group, [[0, 1.48, 0], [0.58, 1.94, -0.06], [1.08, 2.04, -0.1]], 0.07, accentMaterial);
    addNeuronTube(group, [[0, 1.48, 0], [0, 1.98, 0.16], [0.15, 2.28, 0.24]], 0.062, accentMaterial);
    addNeuronTube(group, [[0, 0.94, 0], [0.04, 0.56, 0], [0.04, 0.25, 0]], 0.11, bodyMaterial);
    addPart(group, new THREE.BoxGeometry(0.16, 0.32, 0.14), accentMaterial, -0.19, 0.16, 0);
    addPart(group, new THREE.BoxGeometry(0.16, 0.22, 0.14), accentMaterial, 0.2, 0.11, 0);
    return { group, material: bodyMaterial, accentMaterials: [accentMaterial], accentColor: 0xffa83d };
  }

  function createArtifactVisual(definition) {
    const group = new THREE.Group();
    const bodyMaterial = createNeuronMaterial(definition.visual === "calcium" ? 0xbfffea : 0xd9c7ff, {
      emissive: definition.visual === "calcium" ? 0x0d846b : 0x472d9b,
      emissiveIntensity: 0.62,
      metalness: 0.42
    });
    const accentMaterial = createNeuronMaterial(definition.visual === "calcium" ? 0x64ffd0 : 0xa58cff, {
      emissiveIntensity: 0.85,
      metalness: 0.5
    });
    addGroundBase(group, bodyMaterial, accentMaterial);
    addPart(group, new THREE.IcosahedronGeometry(0.48, 1), bodyMaterial, 0, 1.12, 0);
    addNeuronTube(group, [[-0.06, 1.2, 0], [-0.64, 1.66, 0.05], [-0.98, 1.42, 0.1]], 0.055, accentMaterial);
    addNeuronTube(group, [[0.06, 1.2, 0], [0.64, 1.66, -0.05], [0.98, 1.42, -0.1]], 0.055, accentMaterial);
    return { group, material: bodyMaterial, accentMaterials: [accentMaterial], accentColor: definition.visual === "calcium" ? 0x64ffd0 : 0xa58cff };
  }

  function createExitVisual(definition) {
    const group = new THREE.Group();
    const bodyMaterial = createNeuronMaterial(0xcffeff, { emissive: 0x0a6971, emissiveIntensity: 0.56, metalness: 0.45 });
    const accentMaterial = createNeuronMaterial(0x65ffd1, { emissiveIntensity: 0.88, metalness: 0.5 });
    addGroundBase(group, bodyMaterial, accentMaterial);
    addPart(group, new THREE.CylinderGeometry(0.8, 0.92, 0.22, 28), bodyMaterial, 0, 0.24, 0);
    addPart(group, new THREE.TorusGeometry(0.62, 0.09, 12, 32), accentMaterial, 0, 1.18, 0, { rotation: [Math.PI / 2, 0, 0] });
    addNeuronTube(group, [[0, 0.36, 0], [0, 0.72, 0], [0, 1.04, 0]], 0.11, accentMaterial);
    addNeuronTube(group, [[0, 1.22, 0], [-0.56, 1.66, 0], [-0.95, 1.86, 0]], 0.055, accentMaterial);
    addNeuronTube(group, [[0, 1.22, 0], [0.56, 1.66, 0], [0.95, 1.86, 0]], 0.055, accentMaterial);
    return { group, material: bodyMaterial, accentMaterials: [accentMaterial], accentColor: 0x65ffd1 };
  }

  function createDigitBadge(digit) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 192;
    const texture = trackTexture(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    const material = trackMaterial(new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    }));
    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0.5);
    const framed = Boolean(authoredTheme && digitFrameTexture);
    sprite.scale.set(framed ? 0.72 : 1.16, framed ? 0.72 : 1.16, 1);
    sprite.position.set(framed ? 0.9 : 0, framed ? 3.28 : 3.7, framed ? 0.16 : 0);
    sprite.renderOrder = 8;

    let frameSprite = null;
    if (framed) {
      const frameMaterial = trackMaterial(new THREE.SpriteMaterial({
        map: digitFrameTexture,
        color: 0xffffff,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        opacity: 0.96
      }));
      frameSprite = new THREE.Sprite(frameMaterial);
      frameSprite.center.set(0.5, 0.5);
      frameSprite.scale.set(1.62, 1.56, 1);
      frameSprite.position.set(0.9, 3.28, 0.12);
      frameSprite.renderOrder = 7;
    }

    const paint = (value) => {
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (!framed) {
        const gradient = context.createRadialGradient(96, 86, 14, 96, 96, 88);
        gradient.addColorStop(0, "rgba(255,248,187,.98)");
        gradient.addColorStop(.46, "rgba(111,255,224,.88)");
        gradient.addColorStop(1, "rgba(18,87,107,.22)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(96, 96, 78, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "rgba(255,255,255,.82)";
        context.lineWidth = 5;
        context.stroke();
      } else {
        context.fillStyle = cipherMode ? "rgba(9,12,54,.7)" : "rgba(7,40,28,.72)";
        context.beginPath();
        context.arc(96, 96, 50, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = cipherMode ? "#f4efff" : networkMode ? "#effff5" : "#062230";
      context.font = "900 105px monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(value), 96, 99);
      texture.needsUpdate = true;
    };
    paint(digit);
    return { sprite, frameSprite, paint };
  }

  function createProp(definition) {
    const group = new THREE.Group();
    const asset = networkMode
      ? definition.networkAsset || definition.asset
      : cipherMode
        ? definition.cipherAsset || definition.asset
        : definition.asset;
    const texture = loadTexture(`assets/3d/${asset}`);
    const material = trackMaterial(new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      alphaTest: 0.025,
      depthTest: true,
      depthWrite: false,
      toneMapped: false
    }));
    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0);
    const [spriteWidth, spriteHeight] = definition.spriteScale || [2.8, 3.8];
    sprite.scale.set(spriteWidth, spriteHeight, 1);
    sprite.position.set(0, 0, 0);
    sprite.renderOrder = 4;
    group.add(sprite);
    const digitBadge = null;
    if (digitBadge) {
      if (digitBadge.frameSprite) group.add(digitBadge.frameSprite);
      group.add(digitBadge.sprite);
    }
    group.position.set(definition.x, 0.025, definition.z);
    group.scale.setScalar(definition.scale ?? 1);
    scene.add(group);

    const accentColor = definition.exit
      ? 0x65ffd1
      : definition.item === "key"
        ? 0xffb83d
        : themeRoomColors[definition.room] ?? 0x82e7d4;
    const haloMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    const halo = new THREE.Mesh(trackGeometry(new THREE.RingGeometry(0.78, 0.9, 40)), haloMaterial);
    halo.rotation.x = -Math.PI / 2;
    halo.scale.setScalar(Math.max(1, spriteWidth / 2.75));
    halo.position.set(definition.x, 0.045, definition.z);
    scene.add(halo);

    const record = {
      ...definition,
      label: definition.item
        ? options.itemLabels?.[definition.item] || definition.label
        : definition.label,
      group,
      sprite,
      material,
      accentMaterials: [],
      accentColor,
      halo,
      haloMaterial,
      digitBadge,
      baseY: 0.025,
      visible: true,
      available: true,
      active: false,
      phase: definition.room * 1.2 + (definition.x + definition.z) * 0.047
    };
    propRecords.set(definition.id, record);
    return record;
  }

  INTERACTABLE_DEFINITIONS.forEach(createProp);

  // Atmospheric dendritic silhouettes add depth without becoming HUD clutter.
  const effectMaterial = trackMaterial(new THREE.SpriteMaterial({
    map: effectTexture,
    color: 0x8bffe2,
    transparent: true,
    opacity: 0.21,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  if (!authoredTheme) {
    roomDefinitions.forEach((room, index) => {
      const sprite = new THREE.Sprite(effectMaterial.clone());
      materials.add(sprite.material);
      sprite.scale.set(9.3, 3.25, 1);
      sprite.position.set(room.center[0], 1.75, room.center[1] - (index % 2 ? 5.35 : 5.15));
      sprite.material.opacity = 0.14 + index * 0.02;
      scene.add(sprite);
    });
  }

  function createDendritePath(room, phase) {
    const [cx, cz] = room.center;
    const points = [
      new THREE.Vector3(cx - 4.5, 0.12, cz + 3.8),
      new THREE.Vector3(cx - 2.2, 0.15, cz + 1.1),
      new THREE.Vector3(cx + 0.2, 0.12, cz + 2.1),
      new THREE.Vector3(cx + 2.2, 0.15, cz - 0.8),
      new THREE.Vector3(cx + 4.25, 0.12, cz - 3.6)
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: room.color,
      transparent: true,
      opacity: 0.48
    }));
    const tube = new THREE.Mesh(trackGeometry(new THREE.TubeGeometry(curve, 42, 0.045, 6, false)), tubeMaterial);
    scene.add(tube);

    const signalMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: 0xffba42
    }));
    const signal = new THREE.Mesh(trackGeometry(new THREE.SphereGeometry(0.13, 12, 8)), signalMaterial);
    signal.position.copy(points[0]);
    scene.add(signal);
    dendriteSignals.push({ curve, signal, phase });
  }
  if (!authoredTheme) {
    roomDefinitions.forEach((room, index) => createDendritePath(room, index * 0.23));
  }

  scene.add(new THREE.HemisphereLight(
    cipherMode ? 0x466dff : networkMode ? 0x63d9ae : 0x7fe8ff,
    cipherMode ? 0x030713 : networkMode ? 0x041b11 : 0x24130a,
    authoredTheme ? 0.95 : 1.45
  ));
  const keyLight = new THREE.DirectionalLight(cipherMode ? 0x7d8cff : networkMode ? 0xa5ffd1 : 0xffdb9b, authoredTheme ? 1.35 : 2.25);
  keyLight.position.set(-18, 22, 12);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -34;
  keyLight.shadow.camera.right = 34;
  keyLight.shadow.camera.top = 22;
  keyLight.shadow.camera.bottom = -34;
  scene.add(keyLight);

  // Avatar textures are cropped by row; the x offset advances through 4 frames.
  const avatarFrames = Array.from({ length: 6 }, (_, index) => {
    const row = index % 3;
    const profileBase = index < 3 ? profileAtlasA : profileAtlasB;
    const backBase = index < 3 ? backAtlasA : backAtlasB;
    return {
      profile: cropTexture(profileBase, 4, 3, 0, row),
      front: cropTexture(frontAtlas, 4, 6, 0, index),
      back: cropTexture(backBase, 4, 3, 0, row)
    };
  });

  const avatarMaterial = trackMaterial(new THREE.SpriteMaterial({
    map: avatarFrames[avatarIndex].back,
    color: 0xffffff,
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false
  }));
  const avatarSprite = new THREE.Sprite(avatarMaterial);
  avatarSprite.center.set(0.5, 0);
  avatarSprite.scale.set(1.72, 2.72, 1);
  avatarSprite.position.y = 0.09;
  avatarSprite.renderOrder = 5;

  const player = new THREE.Group();
  const playerVisual = new THREE.Group();
  playerVisual.add(avatarSprite);
  player.add(playerVisual);
  scene.add(player);

  const shadowMaterial = trackMaterial(new THREE.MeshBasicMaterial({
    color: 0x02080a,
    transparent: true,
    opacity: 0.36,
    depthWrite: false
  }));
  const playerShadow = new THREE.Mesh(trackGeometry(new THREE.CircleGeometry(0.7, 28)), shadowMaterial);
  playerShadow.rotation.x = -Math.PI / 2;
  playerShadow.position.y = 0.028;
  player.add(playerShadow);

  const initialPose = initialData.pose || initialData;
  let pose = {
    x: finite(initialPose.x, 0),
    z: finite(initialPose.z, 3.7),
    yaw: normalizeAngle(finite(initialPose.yaw, 0)),
    cameraYaw: normalizeAngle(finite(initialPose.cameraYaw, finite(initialPose.yaw, 0)))
  };
  if (!circleInsideWalkable(pose.x, pose.z)) {
    pose.x = 0;
    pose.z = 3.7;
  }
  player.position.set(pose.x, 0, pose.z);
  player.rotation.y = pose.yaw;
  playerVisual.rotation.y = pose.yaw;

  let cameraPitch = 0.04;
  let currentRoom = roomForPosition(pose.x, pose.z);
  let nearbyId = null;
  let nearbyDetail = null;
  let moving = false;
  let running = false;
  let disposed = false;
  let animationFrame = 0;
  let lastTime = performance.now();
  let walkDistance = 0;
  let lastStepIndex = -1;
  let lastPoseNotice = 0;
  let poseDirty = false;
  let lastAnimationCell = -1;
  let elevatorActive = false;
  let elevatorElapsed = 0;
  let elevatorDuration = 2.8;
  let elevatorEntryDuration = 1.15;
  let elevatorCompleteNotified = false;
  const elevatorStart = new THREE.Vector2();
  const elevatorTarget = new THREE.Vector2(ROOM_STEP + ROOM_HALF + 1.45, 0);
  const controls = { forward: false, backward: false, left: false, right: false, turnLeft: false, turnRight: false };
  const keyboard = { left: false, right: false, shift: false };
  const movementVelocity = new THREE.Vector2();
  const travelDirection = new THREE.Vector2(0, -1);
  const cameraRaycaster = new THREE.Raycaster();
  const cameraTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();

  const pointer = { active: false, id: null, x: 0, y: 0 };
  const clock = new THREE.Clock(false);

  function doorIsOpen(door) {
    return doorOpenFor(door.index) || door.target > 0 || door.progress >= 0.68;
  }

  function doorBlocksPosition(x, z, radius = PLAYER_RADIUS) {
    return doorRecords.some((door) => {
      // Once the opening command is issued, do not leave an invisible
      // collision barrier behind while the door panels animate away.
      if (doorIsOpen(door)) return false;
      if (door.orientation === "horizontal") {
        return Math.abs(z - door.z) <= radius + 0.18 && Math.abs(x - door.x) <= DOOR_WIDTH / 2 + radius;
      }
      return Math.abs(x - door.x) <= radius + 0.18 && Math.abs(z - door.z) <= DOOR_WIDTH / 2 + radius;
    });
  }

  function canStandAt(x, z, radius = PLAYER_RADIUS) {
    return circleInsideWalkable(x, z, radius) && !doorBlocksPosition(x, z, radius);
  }

  function tryMove(dx, dz) {
    const startX = pose.x;
    const startZ = pose.z;
    const distance = Math.hypot(dx, dz);
    const stepCount = Math.max(1, Math.ceil(distance / 0.085));
    const stepX = dx / stepCount;
    const stepZ = dz / stepCount;
    for (let index = 0; index < stepCount; index += 1) {
      const nextX = pose.x + stepX;
      const nextZ = pose.z + stepZ;
      if (canStandAt(nextX, nextZ)) {
        pose.x = nextX;
        pose.z = nextZ;
        continue;
      }

      // Axis-separated fallback lets the avatar slide naturally along walls,
      // while the small sweep above prevents a fast frame from tunnelling
      // through a wall or a closing doorway.
      let slid = false;
      if (Math.abs(stepX) > 0.00001 && canStandAt(pose.x + stepX, pose.z)) {
        pose.x += stepX;
        slid = true;
      }
      if (Math.abs(stepZ) > 0.00001 && canStandAt(pose.x, pose.z + stepZ)) {
        pose.z += stepZ;
        slid = true;
      }
      if (!slid) break;
    }
    const movedX = pose.x - startX;
    const movedZ = pose.z - startZ;
    const moved = Math.abs(movedX) > 0.00001 || Math.abs(movedZ) > 0.00001;
    if (moved) {
      player.position.x = pose.x;
      player.position.z = pose.z;
      poseDirty = true;
    }
    return {
      moved,
      dx: movedX,
      dz: movedZ,
      blockedX: Math.abs(dx) > 0.00001 && Math.abs(movedX) < Math.abs(dx) * 0.35,
      blockedZ: Math.abs(dz) > 0.00001 && Math.abs(movedZ) < Math.abs(dz) * 0.35
    };
  }

  function updateDoorAnimations(delta) {
    let changed = false;
    doorRecords.forEach((door) => {
      const previous = door.progress;
      const speed = reducedMotion ? 8 : 1.45;
      if (door.progress < door.target) door.progress = Math.min(door.target, door.progress + delta * speed);
      else if (door.progress > door.target) door.progress = Math.max(door.target, door.progress - delta * speed);
      if (Math.abs(previous - door.progress) > 0.0001) {
        changed = true;
        positionDoorPanels(door);
      }
    });
    return changed;
  }

  function elevatorLiftValue() {
    if (!elevatorActive) return 0;
    const liftProgress = clamp(
      (elevatorElapsed - elevatorEntryDuration) / Math.max(0.001, elevatorDuration - elevatorEntryDuration),
      0,
      1
    );
    return (1 - Math.pow(1 - liftProgress, 3)) * 6.4;
  }

  function animateEnvironment(elapsed, delta = 0) {
    if (elevatorActive) elevatorElapsed = Math.min(elevatorDuration, elevatorElapsed + delta);
    const elevatorProgress = elevatorActive
      ? clamp(elevatorElapsed / Math.max(0.001, elevatorDuration), 0, 1)
      : 0;
    const elevatorLift = elevatorLiftValue();
    if (elevatorActive && elevatorElapsed < elevatorEntryDuration) {
      const entryProgress = clamp(elevatorElapsed / Math.max(0.001, elevatorEntryDuration), 0, 1);
      const easedEntry = 1 - Math.pow(1 - entryProgress, 3);
      pose.x = THREE.MathUtils.lerp(elevatorStart.x, elevatorTarget.x, easedEntry);
      pose.z = THREE.MathUtils.lerp(elevatorStart.y, elevatorTarget.y, easedEntry);
      player.position.x = pose.x;
      player.position.z = pose.z;
      const directionX = elevatorTarget.x - elevatorStart.x;
      const directionZ = elevatorTarget.y - elevatorStart.y;
      const directionLength = Math.hypot(directionX, directionZ);
      if (directionLength > 0.01) {
        travelDirection.set(directionX / directionLength, directionZ / directionLength);
        pose.yaw = Math.atan2(directionX, -directionZ);
        player.rotation.y = pose.yaw;
        playerVisual.rotation.y = pose.yaw;
      }
      moving = directionLength > 0.01;
    } else if (elevatorActive) {
      pose.x = elevatorTarget.x;
      pose.z = elevatorTarget.y;
      player.position.x = pose.x;
      player.position.z = pose.z;
      moving = false;
    }
    playerVisual.position.y = elevatorLift;
    playerShadow.material.opacity = 0.36 * (1 - elevatorProgress * 0.82);
    animatedLights.forEach(({ light, base, phase }) => {
      light.intensity = base + Math.sin(elapsed * 1.35 + phase) * 2.2;
    });
    dendriteSignals.forEach(({ curve, signal, phase }) => {
      const t = (elapsed * 0.105 + phase) % 1;
      signal.position.copy(curve.getPointAt(t));
      const pulse = 0.82 + Math.sin(elapsed * 7 + phase * 10) * 0.2;
      signal.scale.setScalar(pulse);
    });
    propRecords.forEach((record) => {
      if (!record.visible) return;
      const hovered = nearbyId === record.id;
      record.group.position.y = record.baseY + (record.exit ? elevatorLift : 0);
      record.halo.rotation.z = elapsed * (hovered ? 1.1 : 0.32) + record.phase;
      record.haloMaterial.opacity = record.available === false
        ? 0.18
        : hovered ? 0.82 : record.active ? 0.48 : 0.25;
      const pulse = record.active && !reducedMotion ? 1 + Math.sin(elapsed * 3.2 + record.phase) * 0.018 : 1;
      const targetScale = hovered ? 1.1 : pulse;
      const target = record.scale * targetScale;
      record.group.scale.x += (target - record.group.scale.x) * 0.14;
      record.group.scale.y += (target - record.group.scale.y) * 0.14;
      record.group.scale.z += (target - record.group.scale.z) * 0.14;
    });
    if (elevatorActive && elevatorProgress >= 1 && !elevatorCompleteNotified) {
      elevatorCompleteNotified = true;
      safeCallback(callbacks.onElevatorRiseComplete, { lift: elevatorLift });
    }
  }

  function updateAvatarTexture(cameraX, cameraZ, elapsed, travelX, travelZ) {
    const entry = avatarFrames[avatarIndex];
    const backFailed = avatarIndex < 3 ? backAtlasAFailed : backAtlasBFailed;
    // Choose the view from the actual travel vector: rear art when walking
    // away from the player, front art when walking toward the player, and a
    // mirrored side profile for lateral movement.
    const travelLength = Math.hypot(travelX, travelZ);
    const cameraLength = Math.hypot(cameraX, cameraZ);
    const travelTowardCamera = travelLength > 0.01 && cameraLength > 0.01
      ? (travelX * cameraX + travelZ * cameraZ) / (travelLength * cameraLength)
      : 0;
    const useBack = travelTowardCamera < -0.22 && !backFailed;
    const useFront = travelTowardCamera > 0.22 && !frontAtlasFailed;
    const wanted = useBack ? entry.back : useFront ? entry.front : entry.profile;
    const mapChanged = avatarMaterial.map !== wanted;
    if (mapChanged) {
      avatarMaterial.map = wanted;
      avatarMaterial.needsUpdate = true;
    }
    const frame = moving && !reducedMotion ? Math.floor(elapsed * 8) % 4 : 0;
    const cameraRightX = Math.cos(pose.cameraYaw);
    const cameraRightZ = Math.sin(pose.cameraYaw);
    const screenTravel = travelX * cameraRightX + travelZ * cameraRightZ;
    const mirroredProfile = wanted === entry.profile && screenTravel < -0.05;
    setTextureFrame(wanted, frame, mirroredProfile);
    if (frame !== lastAnimationCell || mapChanged) lastAnimationCell = frame;
    avatarSprite.scale.x = Math.abs(avatarSprite.scale.x);
  }

  function updateMovement(delta, elapsed) {
    if (controls.turnLeft) {
      pose.cameraYaw = normalizeAngle(pose.cameraYaw - delta * 1.75);
      poseDirty = true;
    }
    if (controls.turnRight) {
      pose.cameraYaw = normalizeAngle(pose.cameraYaw + delta * 1.75);
      poseDirty = true;
    }

    const forwardInput = (controls.forward ? 1 : 0) - (controls.backward ? 1 : 0);
    const rightInput = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    const magnitude = Math.hypot(forwardInput, rightInput);
    const normalizedForward = magnitude > 0.01 ? forwardInput / magnitude : 0;
    const normalizedRight = magnitude > 0.01 ? rightInput / magnitude : 0;
    const forwardX = Math.sin(pose.cameraYaw);
    const forwardZ = -Math.cos(pose.cameraYaw);
    const rightX = Math.cos(pose.cameraYaw);
    const rightZ = Math.sin(pose.cameraYaw);
    const directionX = forwardX * normalizedForward + rightX * normalizedRight;
    const directionZ = forwardZ * normalizedForward + rightZ * normalizedRight;
    const speed = 4.1;
    const targetVelocityX = magnitude > 0.01 ? directionX * speed : 0;
    const targetVelocityZ = magnitude > 0.01 ? directionZ * speed : 0;
    const response = magnitude > 0.01 ? 15 : 20;
    const blend = 1 - Math.exp(-response * delta);
    movementVelocity.x += (targetVelocityX - movementVelocity.x) * blend;
    movementVelocity.y += (targetVelocityZ - movementVelocity.y) * blend;

    const result = tryMove(movementVelocity.x * delta, movementVelocity.y * delta);
    if (result.blockedX) movementVelocity.x *= 0.12;
    if (result.blockedZ) movementVelocity.y *= 0.12;
    const facingX = magnitude > 0.01 ? directionX : result.dx;
    const facingZ = magnitude > 0.01 ? directionZ : result.dz;
    if (Math.hypot(facingX, facingZ) > 0.0001) {
      // The avatar's heading always matches the requested travel direction,
      // including lateral and backward movement. The visual sheet selection
      // below uses the actual travel vector to choose rear/profile art.
      const targetYaw = Math.atan2(facingX, -facingZ);
      pose.yaw = targetYaw;
      player.rotation.y = pose.yaw;
      playerVisual.rotation.y = pose.yaw;
      poseDirty = true;
    }
    const actualDistance = Math.hypot(result.dx, result.dz);
    moving = actualDistance > 0.0008;
    if (moving) {
      travelDirection.set(result.dx / actualDistance, result.dz / actualDistance);
    } else if (magnitude > 0.01) {
      travelDirection.set(directionX, directionZ);
    } else {
      travelDirection.set(Math.sin(pose.yaw), -Math.cos(pose.yaw));
    }
    if (moving) {
      walkDistance += actualDistance;
      const stepIndex = Math.floor(walkDistance / 0.58);
      if (stepIndex !== lastStepIndex) {
        lastStepIndex = stepIndex;
        safeCallback(callbacks.onFootstep, { room: currentRoom, pose: { ...pose }, step: stepIndex });
      }
    }
  }

  function updateRoom() {
    const nextRoom = roomForPosition(pose.x, pose.z);
    if (nextRoom === currentRoom) return;
    currentRoom = nextRoom;
    safeCallback(callbacks.onRoomChange, currentRoom, {
      index: currentRoom,
      name: roomDefinitions[currentRoom].name,
      pose: { ...pose }
    });
  }

  function detailForDoor(door, distance) {
    const id = `lockedDoor${door.index}`;
    return {
      id,
      label: LABELS[id],
      type: "locked-door",
      room: door.from,
      door: door.index,
      distance,
      position: { x: door.x, z: door.z }
    };
  }

  function cameraPathIsClear(x, z, radius = CAMERA_CLEARANCE_RADIUS) {
    const distance = Math.hypot(x - pose.x, z - pose.z);
    const steps = Math.max(2, Math.ceil(distance / CAMERA_CLEARANCE_RADIUS));
    for (let index = 1; index <= steps; index += 1) {
      const ratio = index / steps;
      const sampleX = pose.x + (x - pose.x) * ratio;
      const sampleZ = pose.z + (z - pose.z) * ratio;
      if (!canStandAt(sampleX, sampleZ, radius)) return false;
    }
    return true;
  }

  function updateNearby(force = false) {
    let nextId = null;
    let nextDetail = null;
    let bestDistance = INTERACT_DISTANCE;

    propRecords.forEach((record) => {
      if (!record.visible) return;
      const distance = Math.hypot(pose.x - record.x, pose.z - record.z);
      if (distance <= bestDistance) {
        bestDistance = distance;
        nextId = record.id;
        nextDetail = {
          id: record.id,
          label: record.label,
          type: record.exit ? "exit" : record.item ? "item" : "puzzle",
          room: record.room,
          distance,
          active: record.active,
          position: { x: record.x, z: record.z }
        };
      }
    });

    doorRecords.forEach((door) => {
      if (doorIsOpen(door)) return;
      const distance = Math.hypot(pose.x - door.x, pose.z - door.z);
      if (distance <= Math.min(bestDistance, 2.35)) {
        bestDistance = distance;
        nextId = `lockedDoor${door.index}`;
        nextDetail = detailForDoor(door, distance);
      }
    });

    if (force || nextId !== nearbyId) {
      nearbyId = nextId;
      nearbyDetail = nextDetail;
      safeCallback(callbacks.onNearbyChange, nearbyId, nearbyDetail ? { ...nearbyDetail } : null);
    } else {
      nearbyDetail = nextDetail;
    }
  }

  function updateCamera(delta, snap = false, elapsed = clock.getElapsedTime()) {
    const forward = new THREE.Vector3(Math.sin(pose.cameraYaw), 0, -Math.cos(pose.cameraYaw));
    const right = new THREE.Vector3(Math.cos(pose.cameraYaw), 0, Math.sin(pose.cameraYaw));
    const lookAheadX = pose.x + forward.x * 1.3;
    const lookAheadZ = pose.z + forward.z * 1.3;
    const lookAheadValid = canStandAt(lookAheadX, lookAheadZ, CAMERA_CLEARANCE_RADIUS);
    const elevatorLift = elevatorLiftValue();
    cameraTarget.set(
      lookAheadValid ? lookAheadX : pose.x,
      1.35 + elevatorLift * 0.42,
      lookAheadValid ? lookAheadZ : pose.z
    );
    const distance = 6.25;
    const height = 4.05 + cameraPitch * 4.5;
    const candidate = new THREE.Vector3();
    const candidateSpecs = [
      [0, distance], [1.65, distance], [-1.65, distance], [2.9, distance], [-2.9, distance],
      [0, 5.25], [1.9, 5.25], [-1.9, 5.25],
      [0, 4.35], [2.45, 4.35], [-2.45, 4.35]
    ];
    let selected = null;
    for (const [sideOffset, depth] of candidateSpecs) {
      candidate.set(
        pose.x - forward.x * depth + right.x * sideOffset,
        height,
        pose.z - forward.z * depth + right.z * sideOffset
      );
      if (canStandAt(candidate.x, candidate.z, CAMERA_CLEARANCE_RADIUS) && cameraPathIsClear(candidate.x, candidate.z)) {
        selected = candidate.clone();
        break;
      }
    }
    if (!selected) {
      // Very tight corners can require a short temporary pull-in, but only
      // after lateral, fixed-distance positions have been exhausted.
      for (let ratio = 0.92; ratio >= 0.2 && !selected; ratio -= 0.06) {
        candidate.set(
          pose.x + (pose.x - forward.x * distance - pose.x) * ratio,
          height,
          pose.z + (pose.z - forward.z * distance - pose.z) * ratio
        );
        if (canStandAt(candidate.x, candidate.z, CAMERA_CLEARANCE_RADIUS) && cameraPathIsClear(candidate.x, candidate.z)) {
          selected = candidate.clone();
        }
      }
    }
    desiredCamera.copy(selected || candidate.set(pose.x, height, pose.z));

    if (snap || reducedMotion) camera.position.copy(desiredCamera);
    else {
      const smoothing = 1 - Math.exp(-delta * 8.5);
      camera.position.lerp(desiredCamera, smoothing);
    }
    const viewX = camera.position.x - pose.x;
    const viewZ = camera.position.z - pose.z;
    updateAvatarTexture(
      viewX,
      viewZ,
      elapsed,
      travelDirection.x,
      travelDirection.y
    );
    camera.lookAt(cameraTarget);
  }

  function emitPoseIfNeeded(time, force = false) {
    if (!poseDirty && !force) return;
    if (!force && time - lastPoseNotice < 220) return;
    lastPoseNotice = time;
    poseDirty = false;
    safeCallback(callbacks.onPoseChange, { ...pose });
  }

  function renderOnce() {
    if (disposed) return;
    updateCamera(1 / 60, true);
    renderer.render(scene, camera);
  }

  function frame(time) {
    if (!running || disposed) return;
    const wallClockDelta = Math.max(0.001, (time - lastTime) / 1000);
    // Preserve real-time walking and turning even when software WebGL renders
    // only a few frames per second. Small simulation substeps prevent the
    // player capsule from tunnelling through a thin wall or closed door.
    const simulationDelta = Math.min(0.5, wallClockDelta);
    const stepCount = Math.max(1, Math.ceil(simulationDelta / 0.04));
    const stepDelta = simulationDelta / stepCount;
    lastTime = time;
    const elapsed = clock.getElapsedTime();

    for (let step = 0; step < stepCount; step += 1) {
      updateMovement(stepDelta, elapsed);
    }
    updateDoorAnimations(simulationDelta);
    updateRoom();
    updateNearby();
    animateEnvironment(elapsed, simulationDelta);
    updateCamera(simulationDelta);
    emitPoseIfNeeded(time);
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(frame);
  }

  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || container?.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || container?.clientHeight || 1));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.8);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderOnce();
  }

  const CONTROL_ALIASES = {
    w: "forward", up: "forward", arrowup: "forward", forward: "forward",
    s: "backward", down: "backward", arrowdown: "backward", back: "backward", backward: "backward",
    a: "left", left: "left", arrowleft: "left", strafeleft: "left", "strafe-left": "left",
    d: "right", right: "right", arrowright: "right", straferight: "right", "strafe-right": "right",
    turnleft: "turnLeft", "turn-left": "turnLeft", rotateleft: "turnLeft", "rotate-left": "turnLeft",
    turnright: "turnRight", "turn-right": "turnRight", rotateright: "turnRight", "rotate-right": "turnRight"
  };

  function setControl(control, active) {
    const key = CONTROL_ALIASES[String(control || "").toLowerCase()];
    if (!key || !(key in controls)) return false;
    controls[key] = Boolean(active);
    return true;
  }

  function clearControls() {
    Object.keys(controls).forEach((key) => { controls[key] = false; });
    keyboard.left = false;
    keyboard.right = false;
    keyboard.shift = false;
    movementVelocity.set(0, 0);
    moving = false;
  }

  function syncHorizontalKeyboardControls() {
    controls.left = keyboard.left && !keyboard.shift;
    controls.right = keyboard.right && !keyboard.shift;
    controls.turnLeft = keyboard.left && keyboard.shift;
    controls.turnRight = keyboard.right && keyboard.shift;
  }

  function turn(deltaRadians) {
    const amount = finite(deltaRadians, 0);
    if (!amount) return pose.cameraYaw;
    pose.cameraYaw = normalizeAngle(pose.cameraYaw + amount);
    poseDirty = true;
    if (!running) renderOnce();
    return pose.cameraYaw;
  }

  function interact() {
    updateNearby(true);
    if (!nearbyId) return null;
    const id = nearbyId;
    safeCallback(callbacks.onInteract, id, nearbyDetail ? { ...nearbyDetail } : null);
    return id;
  }

  function setPose(nextPose = {}) {
    const next = {
      x: finite(nextPose.x, pose.x),
      z: finite(nextPose.z, pose.z),
      yaw: normalizeAngle(finite(nextPose.yaw, pose.yaw)),
      cameraYaw: normalizeAngle(finite(nextPose.cameraYaw, pose.cameraYaw))
    };
    if (!canStandAt(next.x, next.z)) {
      next.x = pose.x;
      next.z = pose.z;
    }
    pose = next;
    movementVelocity.set(0, 0);
    player.position.set(pose.x, 0, pose.z);
    player.rotation.y = pose.yaw;
    playerVisual.rotation.y = pose.yaw;
    poseDirty = true;
    updateRoom();
    updateNearby(true);
    updateCamera(1 / 60, true);
    emitPoseIfNeeded(performance.now(), true);
    renderer.render(scene, camera);
    return { ...pose };
  }

  function beginElevator(durationMs = 2800) {
    if (disposed) return false;
    clearControls();
    elevatorActive = true;
    elevatorElapsed = 0;
    elevatorDuration = Math.max(0.2, Number(durationMs) / 1000 || 2.8);
    elevatorEntryDuration = reducedMotion ? Math.min(0.24, elevatorDuration * 0.28) : Math.min(1.35, elevatorDuration * 0.4);
    elevatorStart.set(pose.x, pose.z);
    elevatorCompleteNotified = false;
    if (!running) renderOnce();
    return true;
  }

  function setPropState() {
    const puzzlesSolved = completed.slice(0, puzzleCount).every(Boolean);
    const visibility = {
      puzzle0: puzzleCount > 0,
      key: puzzleCount > 0 && completed[0] && !Boolean(flags.keyPicked),
      puzzle1: puzzleCount > 1,
      cell: puzzleCount > 1 && completed[1] && !Boolean(flags.cellPicked),
      puzzle2: puzzleCount > 2,
      code: puzzleCount > 2 && completed[2] && !Boolean(flags.codePicked),
      puzzle3: puzzleCount > 3,
      relic: puzzleCount > 3 && completed[3] && !Boolean(flags.relicPicked),
      exit: puzzlesSolved && (puzzleCount <= 2
        ? Boolean(flags.cellPicked && flags.codeUsed)
        : Boolean(flags.relicPicked))
    };
    // Accept legacy v1 names while treating the v2 item-use flags as canonical.
    const puzzleAvailable = [
      true,
      Boolean(flags.keyUsed),
      Boolean(flags.cellUsed),
      Boolean(flags.codeUsed)
    ];

    propRecords.forEach((record, id) => {
      record.visible = visibility[id] !== false;
      record.group.visible = record.visible;
      record.halo.visible = record.visible;
      record.available = true;
      record.active = false;
      if (id.startsWith("puzzle")) {
        const puzzleIndex = Number(id.slice(-1));
        record.active = completed[puzzleIndex];
        record.available = puzzleAvailable[puzzleIndex];
      } else if (record.item) {
        record.active = completed[record.digitIndex ?? 0];
      } else if (id === "exit") {
        record.active = puzzlesSolved && (puzzleCount <= 2
          ? Boolean(flags.cellPicked && flags.codeUsed)
          : Boolean(flags.relicPicked));
      }
      const inactiveColor = 0x9aaebe;
      const activeColor = record.available === false
        ? inactiveColor
        : record.active ? 0x65ffd1 : record.accentColor;
      record.accentMaterials.forEach((material) => {
        material.color.set(activeColor);
        material.emissive.set(activeColor);
        material.emissiveIntensity = record.active ? 0.92 : 0.62;
      });
      if (record.material.isSpriteMaterial) {
        record.material.color.set(record.available === false ? inactiveColor : 0xffffff);
        record.material.opacity = record.available === false ? 0.68 : record.active ? 1 : 0.88;
      } else if (record.material.emissive) {
        record.material.emissiveIntensity = record.available === false ? 0.18 : record.active ? 0.62 : 0.28;
      }
      record.haloMaterial.color.set(activeColor);
    });
  }

  function setGameState(nextState = {}) {
    if (nextState.puzzleCount !== undefined) {
      puzzleCount = clamp(Math.trunc(finite(nextState.puzzleCount, puzzleCount)), 1, 4);
    }
    if (Array.isArray(nextState.completed)) {
      completed = nextState.completed.slice(0, 4).map(Boolean);
      while (completed.length < 4) completed.push(false);
    }
    if (nextState.flags && typeof nextState.flags === "object") flags = { ...flags, ...nextState.flags };
    if (Array.isArray(nextState.codeDigits)) {
      codeDigits = nextState.codeDigits.slice(0, 4).map((digit) => clamp(Math.trunc(finite(digit, 0)), 0, 9));
      while (codeDigits.length < 4) codeDigits.push(0);
      propRecords.forEach((record) => {
        if (record.digitBadge && record.digitIndex !== undefined) {
          record.digitBadge.paint(codeDigits[record.digitIndex] ?? 0);
        }
      });
    }
    if (nextState.avatarIndex !== undefined) {
      avatarIndex = clamp(Math.trunc(finite(nextState.avatarIndex, avatarIndex)), 0, 5);
      avatarMaterial.map = avatarFrames[avatarIndex].back;
      avatarMaterial.needsUpdate = true;
      lastAnimationCell = -1;
    }
    if (nextState.reducedMotion !== undefined) reducedMotion = Boolean(nextState.reducedMotion);

    doorRecords.forEach((door, index) => {
      door.target = doorOpenFor(index) ? 1 : 0;
      if (!running || reducedMotion) {
        door.progress = door.target;
        positionDoorPanels(door);
      }
    });
    setPropState();
    updateNearby(true);
    if (!running) renderOnce();
    return getSnapshot();
  }

  function getSnapshot() {
    return {
      pose: { ...pose },
      room: currentRoom,
      nearbyId,
      doors: doorRecords.map((door) => ({
        open: door.target === 1,
        progress: Number(door.progress.toFixed(4))
      })),
      elevator: {
        active: elevatorActive,
        progress: Number(clamp(elevatorElapsed / Math.max(0.001, elevatorDuration), 0, 1).toFixed(4))
      },
      moving
    };
  }

  function onKeyDown(event) {
    if (!running || isEditableTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "e" || key === "f" || key === "enter" || key === " ") {
      if (!event.repeat) interact();
      event.preventDefault();
      return;
    }
    if (key === "shift") {
      keyboard.shift = true;
      syncHorizontalKeyboardControls();
      return;
    }
    if (key === "arrowleft" || key === "arrowright") {
      keyboard[key === "arrowleft" ? "left" : "right"] = true;
      syncHorizontalKeyboardControls();
      event.preventDefault();
      return;
    }
    if (setControl(key, true)) event.preventDefault();
  }

  function onKeyUp(event) {
    if (!running || isEditableTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "shift") {
      keyboard.shift = false;
      syncHorizontalKeyboardControls();
      return;
    }
    if (key === "arrowleft" || key === "arrowright") {
      keyboard[key === "arrowleft" ? "left" : "right"] = false;
      syncHorizontalKeyboardControls();
      event.preventDefault();
      return;
    }
    if (setControl(key, false)) event.preventDefault();
  }

  function onPointerDown(event) {
    if (!running || event.button > 0) return;
    pointer.active = true;
    pointer.id = event.pointerId;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    canvas.style.cursor = "grabbing";
    try { canvas.setPointerCapture(event.pointerId); } catch (_) { /* Older Safari. */ }
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!running || !pointer.active || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pose.cameraYaw = normalizeAngle(pose.cameraYaw - dx * 0.0062);
    cameraPitch = clamp(cameraPitch + dy * 0.0018, -0.12, 0.32);
    poseDirty = true;
    event.preventDefault();
  }

  function releasePointer(event) {
    if (!pointer.active || (event && event.pointerId !== pointer.id)) return;
    pointer.active = false;
    pointer.id = null;
    canvas.style.cursor = "grab";
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  function onDoubleClick(event) {
    if (!running) return;
    event.preventDefault();
    interact();
  }

  function onVisibilityChange() {
    if (document.hidden) clearControls();
  }

  function onWindowBlur() {
    clearControls();
    releasePointer();
  }

  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp, { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);
  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.addEventListener("dblclick", onDoubleClick);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("blur", onWindowBlur);

  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  else window.addEventListener("resize", resize);

  function start() {
    if (disposed || running) return;
    running = true;
    lastTime = performance.now();
    clock.start();
    resize();
    updateRoom();
    updateNearby(true);
    safeCallback(callbacks.onRoomChange, currentRoom, {
      index: currentRoom,
      name: roomDefinitions[currentRoom].name,
      pose: { ...pose }
    });
    animationFrame = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    clock.stop();
    clearControls();
    releasePointer();
    emitPoseIfNeeded(performance.now(), true);
    renderOnce();
  }

  function dispose() {
    if (disposed) return;
    stop();
    disposed = true;
    if (resizeObserver) resizeObserver.disconnect();
    else window.removeEventListener("resize", resize);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", releasePointer);
    canvas.removeEventListener("pointercancel", releasePointer);
    canvas.removeEventListener("contextmenu", onContextMenu);
    canvas.removeEventListener("dblclick", onDoubleClick);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("blur", onWindowBlur);
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    if (ownsCanvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
  }

  setPropState();
  resize();
  updateNearby(true);

  return {
    start,
    stop,
    resize,
    dispose,
    setGameState,
    getSnapshot,
    setControl,
    turn,
    interact,
    setPose,
    beginElevator
  };
}

export default createDendriteWorld;
