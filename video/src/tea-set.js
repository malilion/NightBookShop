// Deterministic, editable tea-film set. No external models, stock footage, or audio.
import * as THREE from "three";
import { createTeaLeaves } from "./tea-leaves.js";
import { createBrewFilm } from "./brew-film.js";
import { createTeaForms, noise as formNoise } from "./tea-forms.js";
import { brewFilmTeas } from "./tea-varieties.js";
import {
  studioEnvironment,
  hammeredTexture,
  teaTexture,
  glazeTexture,
} from "./tea-surfaces.js";
export function createTeaSet(container, W = 1280, H = 720) {
  const scene = new THREE.Scene();
  const soloFog = new THREE.Fog("#171c29", 4, 10);
  scene.background = new THREE.Color("#171c29");
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 80);
  camera.position.set(4.6, 5.2, 7.6);
  camera.lookAt(0, 0.7, 0);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  container.append(renderer.domElement);
  const environmentMap = studioEnvironment(renderer);
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = 0.75;
  // Seeded micro-surface: kiln speckles, glaze pooling and brushed metal grain.
  function surfaceTexture(brushed = false) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(256, 256);
    let seed = 19283;
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const n = seed / 4294967296;
        const value = brushed
          ? 128 + Math.sin(y * 2.2) * 18 + n * 24
          : 110 + n * 65;
        const i = (y * 256 + x) * 4;
        image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
    ctx.putImageData(image, 0, 0);
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(brushed ? 3 : 2, brushed ? 5 : 2);
    return t;
  }
  const ceramicGrain = surfaceTexture(),
    metalGrain = surfaceTexture(true);
  const material = (color, metalness = 0, roughness = 0.5) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const glazeColor = glazeTexture();
  const ceramic = (color) =>
    new THREE.MeshPhysicalMaterial({
      color,
      map: glazeColor,
      roughness: 0.34,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.27,
      bumpMap: ceramicGrain,
      bumpScale: 0.002,
      envMapIntensity: 0.75,
    });
  const navy = ceramic("#244740"),
    brass = new THREE.MeshStandardMaterial({
      color: "#9d8054",
      metalness: 0.85,
      roughness: 0.42,
      bumpMap: metalGrain,
      bumpScale: 0.003,
    }),
    cream = ceramic("#e6dfcf"),
    copper = new THREE.MeshStandardMaterial({
      color: "#a46d45",
      metalness: 0.94,
      roughness: 0.39,
      bumpMap: hammeredTexture(),
      bumpScale: 0.012,
    }),
    black = material("#201c18", 0.02, 0.6),
    jarGlaze = ceramic("#234d47");
  function mesh(geometry, mat, pos = [0, 0, 0], parent = scene) {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function lathe(points, mat, parent, pos = [0, 0, 0]) {
    let profile = points.map((p) => new THREE.Vector2(...p));
    for (let pass = 0; pass < 2; pass++) {
      const rounded = [profile[0]];
      for (let i = 0; i < profile.length - 1; i++) {
        rounded.push(profile[i].clone().lerp(profile[i + 1], 0.2));
        rounded.push(profile[i].clone().lerp(profile[i + 1], 0.8));
      }
      rounded.push(profile.at(-1));
      profile = rounded;
    }
    return mesh(new THREE.LatheGeometry(profile, 96), mat, pos, parent);
  }
  function ring(radius, tube, mat, pos, parent = scene) {
    const m = mesh(
      new THREE.TorusGeometry(radius, tube, 10, 64),
      mat,
      pos,
      parent,
    );
    m.rotation.x = Math.PI / 2;
    return m;
  }
  function box(size, mat, pos, parent = scene) {
    return mesh(new THREE.BoxGeometry(...size), mat, pos, parent);
  }
  function ball(size, mat, pos, parent = scene) {
    const m = mesh(new THREE.SphereGeometry(1, 24, 16), mat, pos, parent);
    m.scale.set(...size);
    return m;
  }
  function tube(points, radius, mat, parent) {
    return mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        32,
        radius,
        10,
        false,
      ),
      mat,
      [0, 0, 0],
      parent,
    );
  }
  function woodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const c = canvas.getContext("2d");
    c.fillStyle = "#3f2c22";
    c.fillRect(0, 0, 1024, 512);
    let seed = 713;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 650; i++) {
      const y = random() * 512;
      c.strokeStyle = `rgba(${random() > 0.5 ? "9,5,4" : "164,113,62"},${0.02 + random() * 0.065})`;
      c.lineWidth = 0.4 + random() * 2;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 20)
        c.lineTo(x, y + Math.sin(x * 0.008 + i) * (0.4 + random() * 3));
      c.stroke();
    }
    for (let i = 0; i < 5; i++) {
      c.fillStyle = "#251c16";
      c.fillRect(0, i * 110, 1024, 1);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const wood = new THREE.MeshStandardMaterial({
    map: woodTexture(),
    roughness: 0.58,
  });
  // Backdrop pieces stay in every shot of the brew film.
  const backdrop = (object) => {
    object.userData.backdrop = true;
    return object;
  };
  backdrop(box([16, 0.24, 12], wood, [0, -0.15, 0]));
  const soloFloor = box(
    [30, 0.035, 30],
    material("#172329", 0, 0.94),
    [0, 0.015, 0],
  );
  soloFloor.visible = false;
  const mat = material("#283841", 0, 0.9);
  backdrop(box([4.9, 0.055, 3.1], mat, [-0.05, 0.015, 0.15]));
  // Brass edging on the navy linen runner.
  for (const z of [-1.35, 1.65])
    backdrop(box([4.84, 0.012, 0.025], brass, [-0.05, 0.05, z]));
  const kettle = new THREE.Group();
  scene.add(kettle);
  kettle.position.set(-2.3, 0.08, -0.45);
  lathe(
    [
      [0, 0.035],
      [0.48, 0.035],
      [0.66, 0.07],
      [0.77, 0.18],
      [0.8, 0.36],
      [0.77, 0.56],
      [0.68, 0.75],
      [0.51, 0.88],
      [0.39, 0.91],
      [0.375, 0.96],
      [0.34, 0.96],
      [0.34, 0.88],
      [0, 0.88],
    ],
    copper,
    kettle,
  );
  ring(0.57, 0.018, black, [0, 0.055, 0], kettle);
  ring(0.375, 0.012, brass, [0, 0.958, 0], kettle);
  lathe(
    [
      [0, 0.96],
      [0.37, 0.96],
      [0.355, 1.0],
      [0.22, 1.045],
      [0, 1.055],
    ],
    copper,
    kettle,
  );
  const walnut = new THREE.MeshStandardMaterial({
    color: "#856045",
    map: wood.map,
    roughness: 0.47,
    bumpMap: ceramicGrain,
    bumpScale: 0.002,
  });
  lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.11, 0.065],
      [0.1, 0.13],
      [0.06, 0.15],
      [0, 0.15],
    ],
    walnut,
    kettle,
    [0, 1.055, 0],
  );
  // Tapered, hollow gooseneck; the endpoint remains the pouring origin.
  const kettleSpoutPoints = [
    [0.63, 0.26, 0],
    [0.88, 0.36, 0],
    [1.06, 0.76, 0],
    [1.2, 1.16, 0],
    [1.38, 1.36, 0],
  ];
  const spoutCurve = new THREE.CatmullRomCurve3(
    kettleSpoutPoints.map((p) => new THREE.Vector3(...p)),
  );
  const spoutGeometry = new THREE.TubeGeometry(spoutCurve, 64, 1, 24, false);
  const spoutPositions = spoutGeometry.attributes.position;
  for (let i = 0; i <= 64; i++) {
    const centre = spoutCurve.getPointAt(i / 64),
      radius = 0.12 - 0.074 * Math.pow(i / 64, 0.65);
    for (let j = 0; j <= 24; j++) {
      const index = i * 25 + j;
      const vertex = new THREE.Vector3().fromBufferAttribute(
        spoutPositions,
        index,
      );
      vertex.sub(centre).multiplyScalar(radius).add(centre);
      spoutPositions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  spoutGeometry.computeVertexNormals();
  mesh(spoutGeometry, copper, [0, 0, 0], kettle);
  const spoutLip = ring(0.046, 0.006, brass, [1.38, 1.36, 0], kettle);
  const spoutDirection = spoutCurve.getTangent(1);
  spoutLip.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    spoutDirection,
  );
  const spoutHole = mesh(
    new THREE.CircleGeometry(0.04, 32),
    black,
    [1.378, 1.357, 0],
    kettle,
  );
  spoutHole.quaternion.copy(spoutLip.quaternion);
  for (const side of [-1, 1]) {
    tube(
      [
        [side * 0.63, 0.68, 0],
        [side * 0.73, 1.05, 0],
        [side * 0.62, 1.52, 0],
        [side * 0.4, 1.7, 0],
      ],
      0.045,
      brass,
      kettle,
    );
    ball([0.08, 0.08, 0.04], brass, [side * 0.63, 0.7, 0.035], kettle);
  }
  tube(
    [
      [-0.42, 1.69, 0],
      [-0.22, 1.8, 0],
      [0.22, 1.8, 0],
      [0.42, 1.69, 0],
    ],
    0.084,
    walnut,
    kettle,
  );
  const pot = new THREE.Group();
  scene.add(pot);
  pot.position.set(0, 0.09, 0.1);
  lathe(
    [
      [0.42, 0.06],
      [0.5, 0.03],
      [0.65, 0.15],
      [0.79, 0.45],
      [0.76, 0.67],
      [0.57, 0.88],
      [0.49, 0.9],
      [0.46, 0.87],
      [0.54, 0.83],
      [0.68, 0.61],
      [0.7, 0.43],
      [0.57, 0.21],
      [0.4, 0.16],
      [0, 0.16],
    ],
    navy,
    pot,
  );
  ring(0.49, 0.012, brass, [0, 0.9, 0], pot);
  ring(0.46, 0.01, brass, [0, 0.085, 0], pot);
  tube(
    [
      [0.65, 0.32, 0],
      [0.94, 0.43, 0],
      [1.05, 0.64, 0],
      [1.21, 0.85, 0],
    ],
    0.088,
    navy,
    pot,
  );
  ring(0.09, 0.017, brass, [1.21, 0.85, 0], pot);
  const potHandle = mesh(
    new THREE.TorusGeometry(0.35, 0.05, 16, 64),
    navy,
    [-0.75, 0.47, 0],
    pot,
  );
  potHandle.scale.x = 0.8;
  // Crescent and small stars inlaid on the face visible to the camera.
  const emblem = mesh(
    new THREE.TorusGeometry(0.145, 0.019, 8, 36, Math.PI * 1.5),
    brass,
    [0, 0.45, 0.815],
    pot,
  );
  emblem.rotation.z = -0.7;
  for (const [x, y] of [
    [0.23, 0.55],
    [-0.25, 0.37],
    [0.18, 0.3],
  ])
    ball([0.014, 0.014, 0.012], brass, [x, y, 0.785], pot);
  const lid = new THREE.Group();
  scene.add(lid);
  lid.position.set(0.8, 0.08, -0.9);
  lathe(
    [
      [0, 0.04],
      [0.5, 0.04],
      [0.49, 0.1],
      [0.31, 0.2],
      [0, 0.24],
    ],
    navy,
    lid,
  );
  ball([0.09, 0.09, 0.09], brass, [0, 0.29, 0], lid);
  ring(0.49, 0.01, brass, [0, 0.08, 0], lid);
  const cup = new THREE.Group();
  scene.add(cup);
  cup.position.set(1.9, 0.085, 1.0);
  lathe(
    [
      [0, 0],
      [0.65, 0],
      [0.7, 0.05],
      [0.68, 0.1],
      [0.42, 0.07],
      [0, 0.07],
    ],
    navy,
    cup,
  );
  lathe(
    [
      [0, 0.1],
      [0.24, 0.1],
      [0.3, 0.19],
      [0.39, 0.52],
      [0.4, 0.56],
      [0.365, 0.56],
      [0.335, 0.28],
      [0.23, 0.15],
      [0, 0.15],
    ],
    cream,
    cup,
  );
  ring(0.397, 0.007, brass, [0, 0.556, 0], cup);
  const cupHandle = mesh(
    new THREE.TorusGeometry(0.15, 0.028, 16, 48),
    cream,
    [0.42, 0.35, 0],
    cup,
  );
  cupHandle.scale.x = 0.9;
  const neutralTeaMap = teaTexture(true);
  const brewedTeaMap = teaTexture();
  const teaMat = new THREE.MeshPhysicalMaterial({
    color: "#d0a354",
    map: brewedTeaMap,
    metalness: 0,
    roughness: 0.12,
    ior: 1.333,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    envMapIntensity: 0.55,
  });
  const teaSurface = mesh(
    new THREE.CircleGeometry(0.45, 64),
    teaMat,
    [0, 0.22, 0],
    pot,
  );
  teaSurface.rotation.x = -Math.PI / 2;
  teaSurface.name = "pot-liquor";
  const cupLiquid = mesh(
    new THREE.CircleGeometry(0.34, 64),
    teaMat,
    [0, 0.19, 0],
    cup,
  );
  cupLiquid.rotation.x = -Math.PI / 2;
  cupLiquid.name = "cup-liquor";
  // A narrow curved meniscus catches light where liquid meets the vessel wall.
  const meniscusMat = new THREE.MeshPhysicalMaterial({
    color: "#d2b774",
    roughness: 0.09,
    ior: 1.333,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    metalness: 0,
  });
  for (const [surface, radius] of [
    [teaSurface, 0.445],
    [cupLiquid, 0.336],
  ]) {
    const meniscus = mesh(
      new THREE.TorusGeometry(radius, 0.003, 8, 96),
      meniscusMat,
      [0, 0, 0.002],
      surface,
    );
    meniscus.castShadow = false;
    for (let i = 0; i < 5; i++) {
      const angle = 0.65 + i * 0.037;
      const bubble = mesh(
        new THREE.TorusGeometry(0.004 + (i % 2) * 0.002, 0.001, 6, 12),
        meniscusMat,
        [
          Math.cos(angle) * (radius - 0.01),
          Math.sin(angle) * (radius - 0.01),
          0.003,
        ],
        surface,
      );
      bubble.castShadow = false;
    }
  }

  const cupRipples = Array.from({ length: 3 }, () => {
    const ripple = ring(
      0.12,
      0.0025,
      new THREE.MeshBasicMaterial({
        color: "#ffe6af",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      [0, 0.506, 0],
      cup,
    );
    ripple.name = "cup-ripple";
    return ripple;
  });
  const jar = new THREE.Group();
  scene.add(jar);
  jar.position.set(-1.8, 0.08, 1.25);
  lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.37, 0.05],
      [0.36, 0.65],
      [0.32, 0.7],
      [0.3, 0.7],
      [0.31, 0.62],
      [0.3, 0.1],
      [0, 0.1],
    ],
    jarGlaze,
    jar,
  );
  ring(0.35, 0.012, brass, [0, 0.67, 0], jar);
  const jarLid = new THREE.Group();
  scene.add(jarLid);
  jarLid.position.set(-2.5, 0.09, 1.3);
  lathe(
    [
      [0, 0],
      [0.37, 0],
      [0.39, 0.025],
      [0.39, 0.07],
      [0.36, 0.09],
      [0, 0.09],
    ],
    wood,
    jarLid,
  );
  ring(0.385, 0.011, brass, [0, 0.035, 0], jarLid);
  const jarCap = jarLid.clone();
  jarCap.position.set(0, 0.705, 0);
  jarCap.name = "jar-cap";
  jar.add(jarCap);
  jarCap.visible = false;
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 384;
  labelCanvas.height = 384;
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = mesh(
    new THREE.CylinderGeometry(0.372, 0.372, 0.39, 48, 1, true, -0.7, 1.4),
    new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
    [0, 0.34, 0],
    jar,
  );
  labelMesh.name = "jar-label";
  function jarLabel(label, color) {
    const c = labelCanvas.getContext("2d");
    c.fillStyle = "#e1d0aa";
    c.fillRect(0, 0, 384, 384);
    c.strokeStyle = color;
    c.lineWidth = 5;
    c.strokeRect(18, 18, 348, 348);
    c.fillStyle = "#645033";
    c.font = "24px serif";
    c.textAlign = "center";
    c.fillText("夜 行 書 店", 192, 68);
    c.fillStyle = "#302c24";
    c.font = "44px serif";
    c.fillText(label, 192, 218, 328);
    c.fillStyle = color;
    c.beginPath();
    c.arc(192, 124, 18, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#766245";
    c.font = "20px serif";
    c.fillText("藏 茶", 192, 310);
    labelTexture.needsUpdate = true;
  }
  jarLabel("桂花烏龍", "#8d6936");
  const leafBed = mesh(
    new THREE.CircleGeometry(0.265, 48),
    material("#3f3827", 0, 1),
    [0, 0.555, 0],
    jar,
  );
  leafBed.rotation.x = -Math.PI / 2;
  leafBed.name = "jar-leaf-bed";
  const {
    leaf: teaLeaf,
    noise: leafNoise,
    setType: setTeaType,
  } = createTeaLeaves();
  for (let i = 0; i < 90; i++) {
    const a = leafNoise(i + 201) * Math.PI * 2;
    const r = Math.sqrt(leafNoise(i + 312)) * 0.215;
    teaLeaf(i, false, jar, [
      Math.cos(a) * r,
      0.565 + leafNoise(i + 99) * 0.035,
      Math.sin(a) * r,
    ]).name = "jar-leaf";
  }
  const spoon = new THREE.Group();
  scene.add(spoon);
  const spoonBowl = lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.15, 0.014],
      [0.165, 0.035],
      [0.15, 0.04],
      [0.09, 0.018],
      [0, 0.014],
    ],
    brass,
    spoon,
  );
  spoonBowl.scale.z = 1.45;
  ball([0.042, 0.023, 0.44], brass, [0, 0.025, 0.54], spoon);
  const spoonLeaves = new THREE.Group();
  spoonLeaves.name = "spoon-leaves";
  spoon.add(spoonLeaves);
  for (let i = 0; i < 18; i++) {
    teaLeaf(i + 100, false, spoonLeaves, [
      (leafNoise(i + 24) - 0.5) * 0.16,
      0.025 + leafNoise(i + 64) * 0.023,
      (leafNoise(i + 82) - 0.5) * 0.23,
    ]);
  }
  spoonLeaves.visible = false;
  spoon.rotation.y = -0.55;
  const fallingLeaves = [];
  for (let i = 0; i < 12; i++) {
    fallingLeaves.push(teaLeaf(i + 100, false, scene));
  }
  const floatingLeaves = [];
  for (let i = 0; i < 13; i++) {
    const leaf = teaLeaf(i + 30, true, pot);
    leaf.name = "pot-leaf";
    floatingLeaves.push(leaf);
  }
  const dryPotLeaves = [];
  for (let i = 0; i < 64; i++) {
    const angle = leafNoise(i + 141) * Math.PI * 2;
    const radius = Math.sqrt(leafNoise(i + 162)) * 0.34;
    const leaf = teaLeaf(i + 180, false, pot, [
      Math.cos(angle) * radius,
      0.7 + leafNoise(i + 203) * 0.08,
      Math.sin(angle) * radius,
    ]);
    leaf.rotation.x = (leafNoise(i + 231) - 0.5) * 0.9;
    dryPotLeaves.push(leaf);
  }
  // Production prop renders use the same eight botanical forms as the brew
  // film. Keep one active set and rebuild it only when the selected tea changes.
  const teaForms = createTeaForms();
  const jarFormGroup = new THREE.Group();
  jarFormGroup.name = "jar-tea-form";
  jar.add(jarFormGroup);
  const spoonFormGroup = new THREE.Group();
  spoonFormGroup.name = "spoon-tea-form";
  spoonLeaves.add(spoonFormGroup);
  const potDryFormGroup = new THREE.Group();
  potDryFormGroup.name = "pot-dry-tea-form";
  pot.add(potDryFormGroup);
  const potWetFormGroup = new THREE.Group();
  potWetFormGroup.name = "pot-wet-tea-form";
  pot.add(potWetFormGroup);
  const clearForms = (group) => {
    group.clear();
  };
  function scatterTeaForms(group, spec, count, wet, radius, baseY, seedOffset) {
    clearForms(group);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.39996 + formNoise(seedOffset + i) * 0.35;
      const r = Math.sqrt((i + 0.5) / count) * radius;
      const piece = wet ? teaForms.wet(spec, seedOffset + i) : teaForms.dry(spec, seedOffset + i);
      piece.position.set(
        Math.cos(angle) * r,
        baseY + formNoise(seedOffset + i * 7) * (wet ? 0.006 : 0.024),
        Math.sin(angle) * r * 0.9,
      );
      group.add(piece);
    }
  }
  let activePropTea = "";
  function setPropTeaForms(type) {
    const spec = brewFilmTeas[type];
    if (!spec) throw new Error(`Unknown tea form ${type}`);
    if (activePropTea !== type) {
      // Hide the former shared-leaf placeholders. These remain for the film's
      // moving shots, while all still prop art now uses individual tea forms.
      jar.children.filter((child) => child.name === "jar-leaf").forEach((leaf) => (leaf.visible = false));
      spoonLeaves.children.filter((child) => child !== spoonFormGroup).forEach((leaf) => (leaf.visible = false));
      floatingLeaves.forEach((leaf) => (leaf.visible = false));
      dryPotLeaves.forEach((leaf) => (leaf.visible = false));
      scatterTeaForms(jarFormGroup, spec, 72, false, 0.215, 0.565, 101 + Object.keys(brewFilmTeas).indexOf(type) * 1000);
      scatterTeaForms(spoonFormGroup, spec, 22, false, 0.085, 0.035, 401 + Object.keys(brewFilmTeas).indexOf(type) * 1000);
      scatterTeaForms(potDryFormGroup, spec, 56, false, 0.34, 0.705, 701 + Object.keys(brewFilmTeas).indexOf(type) * 1000);
      scatterTeaForms(potWetFormGroup, spec, 16, true, 0.31, 0.723, 1001 + Object.keys(brewFilmTeas).indexOf(type) * 1000);
      activePropTea = type;
    }
    teaAccentGroups.forEach(({ group }) => (group.visible = false));
  }
  const teaAccentGroups = [];
  const petalGeometry = new THREE.SphereGeometry(1, 10, 7);
  const budGeometry = new THREE.SphereGeometry(1, 10, 8);
  const botanicalMaterials = {
    stem: material("#5e6847", 0, 0.95),
    lavender: material("#8b739c", 0, 0.9),
    lavenderLight: material("#aa8bb1", 0, 0.9),
    petal: material("#f2ead5", 0, 0.9),
    osmanthus: material("#e4bd68", 0, 0.9),
    center: material("#e5c775", 0, 0.88),
    chamomile: material("#d5a838", 0, 0.88),
  };
  function addBotanical(type, parent, position, size = 1) {
    const group = new THREE.Group();
    group.position.set(...position);
    group.visible = false;
    parent.add(group);
    teaAccentGroups.push({ type, group });
    if (type === "lavender") {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.003, 0.005, 0.075 * size, 5),
        botanicalMaterials.stem,
      );
      stem.position.y = 0.035 * size;
      group.add(stem);
      for (let i = 0; i < 6; i++) {
        const bud = new THREE.Mesh(
          budGeometry,
          i % 2
            ? botanicalMaterials.lavender
            : botanicalMaterials.lavenderLight,
        );
        bud.scale.set(0.009 * size, 0.018 * size, 0.009 * size);
        bud.position.set(
          (i % 2 ? 1 : -1) * 0.009 * size,
          (0.045 + i * 0.009) * size,
          0,
        );
        group.add(bud);
      }
      return;
    }
    const chamomile = type === "chamomile";
    const count = chamomile ? 9 : type === "jasmine" ? 6 : 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const petal = new THREE.Mesh(
        petalGeometry,
        type === "osmanthus"
          ? botanicalMaterials.osmanthus
          : botanicalMaterials.petal,
      );
      const radius = (chamomile ? 0.022 : 0.018) * size;
      petal.scale.set(0.014 * size, 0.006 * size, 0.009 * size);
      petal.position.set(
        Math.cos(angle) * radius,
        0.003 * size,
        Math.sin(angle) * radius,
      );
      group.add(petal);
    }
    const center = new THREE.Mesh(
      budGeometry,
      chamomile ? botanicalMaterials.chamomile : botanicalMaterials.center,
    );
    center.scale.set(
      (chamomile ? 0.012 : 0.008) * size,
      0.007 * size,
      (chamomile ? 0.012 : 0.008) * size,
    );
    center.position.y = 0.008 * size;
    group.add(center);
  }
  for (const type of ["osmanthus", "jasmine", "chamomile", "lavender"]) {
    const potPoints = Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + 0.4;
      return [
        Math.cos(angle) * 0.2,
        0.775 + (i % 2) * 0.008,
        Math.sin(angle) * 0.2,
      ];
    });
    const jarPoints = Array.from({ length: 4 }, (_, i) => {
      const angle = (i / 4) * Math.PI * 2 + 0.35;
      return [
        Math.cos(angle) * 0.14,
        0.595 + (i % 2) * 0.008,
        Math.sin(angle) * 0.14,
      ];
    });
    const spoonPoints = [
      [-0.035, 0.055, -0.05],
      [0.03, 0.06, 0.025],
    ];
    for (const point of potPoints) addBotanical(type, pot, point, 1.05);
    for (const point of jarPoints) addBotanical(type, jar, point, 0.95);
    for (const point of spoonPoints)
      addBotanical(type, spoonLeaves, point, 0.8);
  }
  function setTeaAppearance(type) {
    setTeaType(type);
    teaAccentGroups.forEach(({ type: accentType, group }) => {
      group.visible = accentType === type;
    });
  }
  const streamMat = new THREE.MeshPhysicalMaterial({
    color: "#d7e5e2",
    transparent: true,
    opacity: 0.75,
    transmission: 0.55,
    thickness: 0.08,
    ior: 1.333,
    metalness: 0,
    roughness: 0.04,
    clearcoat: 0.5,
    depthWrite: false,
  });
  const stream = new THREE.Group();
  scene.add(stream);
  const waterSegments = Array.from({ length: 22 }, () => {
    const part = mesh(
      new THREE.CylinderGeometry(1, 1, 1, 10),
      streamMat,
      [0, 0, 0],
      stream,
    );
    part.castShadow = false;
    return part;
  });
  const splash = Array.from({ length: 16 }, () => {
    const drop = ball([0.016, 0.035, 0.016], streamMat, [0, 0, 0]);
    drop.castShadow = false;
    return drop;
  });
  function streamBetween(a, b, phase = 0) {
    const point = (u) =>
      a
        .clone()
        .lerp(b, u)
        .add(
          new THREE.Vector3(
            Math.sin(u * 13 + phase * 28) * 0.022 * Math.sin(u * Math.PI),
            0,
            Math.cos(u * 11 - phase * 21) * 0.012 * Math.sin(u * Math.PI),
          ),
        );
    waterSegments.forEach((part, i) => {
      const from = point(i / 22),
        to = point((i + 1) / 22),
        delta = to.clone().sub(from);
      const radius =
        0.021 + (0.007 * i) / 22 + 0.003 * Math.sin(i * 1.7 - phase * 40);
      part.position.copy(from.add(to).multiplyScalar(0.5));
      part.scale.set(radius, delta.length() * 1.08, radius);
      part.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        delta.normalize(),
      );
    });
    splash.forEach((drop, i) => {
      const p = (phase * 9 + i / 16) % 1,
        angle = i * 2.4;
      drop.visible = stream.visible;
      drop.position.set(
        b.x + Math.cos(angle) * p * 0.19,
        b.y + Math.sin(p * Math.PI) * 0.13,
        b.z + Math.sin(angle) * p * 0.19,
      );
      drop.scale.set(0.012 * (1 - p), 0.028 * (1 - p), 0.012 * (1 - p));
    });
  }
  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const m = ring(
      0.15,
      0.003,
      new THREE.MeshBasicMaterial({
        color: "#f5d69b",
        transparent: true,
        opacity: 0.2,
      }),
      [0, 0, 0],
      pot,
    );
    m.name = "pot-ripple";
    ripples.push(m);
  }
  // Table props establish the bookshop without blocking the action.
  for (const [i, color] of ["#344947", "#6d3833", "#b4925c"].entries()) {
    const g = new THREE.Group();
    g.position.set(-2.3, 0.05 + i * 0.17, -2.35);
    g.rotation.y = -0.12 + i * 0.04;
    backdrop(g);
    scene.add(g);
    box([1.65, 0.13, 1.1], material("#b6a27c"), [0, 0.08, 0], g);
    for (const y of [0, 0.17])
      box([1.75, 0.035, 1.16], material(color), [0, y, 0], g);
    box([0.08, 0.19, 1.16], material(color), [-0.84, 0.08, 0], g);
  }
  const candleGroup = new THREE.Group();
  candleGroup.position.set(2.5, 0, -1.2);
  backdrop(candleGroup);
  scene.add(candleGroup);
  lathe(
    [
      [0, 0],
      [0.37, 0],
      [0.38, 0.06],
      [0.17, 0.12],
      [0.11, 0.55],
      [0.28, 0.62],
      [0.28, 0.7],
      [0, 0.7],
    ],
    brass,
    candleGroup,
  );
  lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.18, 0.7],
      [0, 0.7],
    ],
    cream,
    candleGroup,
    [0, 0.7, 0],
  );
  const flame = ball(
    [0.045, 0.13, 0.045],
    new THREE.MeshBasicMaterial({ color: "#ffd296" }),
    [0, 1.53, 0],
    candleGroup,
  );
  const candleLight = new THREE.PointLight("#ffad55", 11, 5, 2);
  candleLight.position.set(2.5, 1.65, -1.2);
  scene.add(candleLight);
  // Loose osmanthus on a shallow dish.
  lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.48, 0.08],
      [0.5, 0.12],
      [0.45, 0.11],
      [0, 0.04],
    ],
    cream,
    scene,
    [-0.75, 0.05, 1.65],
  );
  for (let i = 0; i < 20; i++) {
    const a = i * 2.4;
    ball([0.032, 0.018, 0.032], material("#c68b36"), [
      -0.75 + Math.cos(a) * 0.28,
      0.11,
      1.65 + Math.sin(a) * 0.24,
    ]);
  }
  // Window with a night gradient, mullions and distant warm points of light.
  backdrop(mesh(new THREE.PlaneGeometry(18, 8), material("#132a42"), [0, 3, -4]));
  for (let i = -4; i <= 4; i++)
    backdrop(box([0.06, 6, 0.06], wood, [i * 1.25, 2.5, -3.9]));
  for (const y of [0.7, 3.2, 5.3])
    backdrop(box([13, 0.06, 0.06], wood, [0, y, -3.9]));
  for (let i = 0; i < 45; i++) {
    const x = Math.sin(i * 9.3) * 6,
      y = 0.5 + ((i * 17) % 29) / 14;
    backdrop(
      ball(
        [0.023, 0.032, 0.015],
        new THREE.MeshBasicMaterial({ color: i % 3 ? "#b77d37" : "#b8bcca" }),
        [x, y, -3.95],
      ),
    );
  }
  backdrop(
    mesh(
      new THREE.CircleGeometry(0.3, 48),
      new THREE.MeshBasicMaterial({ color: "#ecdfb9" }),
      [-1.1, 4.5, -3.8],
    ),
  );
  const ambient = new THREE.HemisphereLight("#d4dcd8", "#40362a", 1.05);
  scene.add(ambient);
  const key = new THREE.DirectionalLight("#ffead2", 2.0);
  key.position.set(-3, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#aabdc9", 0.65);
  fill.position.set(1, 5, -5);
  scene.add(fill);
  const steam = [];
  function steamTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const cx = c.getContext("2d");
    const g = cx.createRadialGradient(32, 32, 1, 32, 32, 32);
    g.addColorStop(0, "rgba(237,226,199,.42)");
    g.addColorStop(1, "rgba(255,237,201,0)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const steamTex = steamTexture();
  for (let i = 0; i < 24; i++) {
    const m = new THREE.SpriteMaterial({
      map: steamTex,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const s = new THREE.Sprite(m);
    scene.add(s);
    steam.push(s);
  }
  const ease = (t) => t * t * (3 - 2 * t);
  const clamp = (t) => Math.max(0, Math.min(1, t));
  // The per-tea brew film with Lin Cheng's hands, built on first use from
  // copies of the same pot, cup, caddy, scoop and kettle.
  let brew = null;
  const brewFilm = () =>
    (brew ??= createBrewFilm({
      scene,
      camera,
      props: { pot, lid, cup, jar, jarLid, spoon, kettle },
      materials: { jarGlaze, cream },
    }));
  function setFrame(clip, t, tea = "osmanthus", garnish = "none") {
    t = clamp(t);
    if (clip === "brew") {
      scene.fog = null;
      brewFilm().setFrame(t, tea, garnish);
      renderer.render(scene, camera);
      return;
    }
    scene.children.forEach((child) => {
      child.visible = true;
    });
    if (brew) brew.root.visible = false;
    camera.fov = 35;
    camera.updateProjectionMatrix();
    soloFloor.visible = false;
    scene.fog = clip === "complete" ? soloFog : null;
    const isFull = ["steep", "serve", "complete"].includes(clip);
    teaMat.map = brewedTeaMap;
    teaMat.opacity = 0.88;
    teaMat.roughness = 0.12;
    teaMat.metalness = 0;
    teaMat.color.set(
      tea === "puer" ? "#68381c" : tea === "mint" ? "#a3a94c" : "#b87721",
    );
    camera.position.set(4.6, 5.2, 7.6);
    camera.lookAt(0, 0.7, 0);
    cup.position.set(1.9, 0.085, 1);
    lid.position.set(0.8, 0.08, -0.9);
    cupRipples.forEach((r) => (r.visible = false));
    kettle.position.set(-2.3, 0.08, -0.45);
    kettle.rotation.set(0, 0, 0);
    pot.position.set(0, 0.09, 0.1);
    pot.rotation.set(0, 0, 0);
    spoon.position.set(-0.95, 0.12, 1.12);
    spoon.rotation.set(0, -0.55, 0);
    stream.visible = false;
    splash.forEach((drop) => (drop.visible = false));
    fallingLeaves.forEach((l) => (l.visible = false));
    cupLiquid.visible = clip === "serve" || clip === "complete";
    cupLiquid.position.y = clip === "complete" ? 0.5 : 0.17;
    teaSurface.visible = clip !== "idle" && clip !== "scoop";
    teaSurface.position.y = isFull ? 0.78 : 0.22 + 0.56 * t;
    for (let i = 0; i < floatingLeaves.length; i++) {
      const l = floatingLeaves[i],
        a =
          leafNoise(i + 52) * Math.PI * 2 + t * (clip === "steep" ? 0.7 : 0.12),
        radius = Math.sqrt(leafNoise(i + 92)) * 0.34;
      l.visible = clip !== "idle" && clip !== "scoop";
      l.position.set(
        Math.cos(a) * radius,
        teaSurface.position.y + 0.003 + (i % 3) * 0.001,
        Math.sin(a) * radius,
      );
      l.rotation.y = leafNoise(i + 71) * Math.PI * 2 + t * 0.18;
      const opened = clip === "steep" ? 0.8 + 0.2 * t : 1;
      l.scale.set(opened, 1, opened);
    }
    if (clip === "scoop") {
      const p = ease(clamp(t / 0.42));
      spoon.position.set(
        -1.8 + 1.8 * p,
        0.82 + 0.85 * Math.sin((p * Math.PI) / 2),
        1.25 - 1.15 * p,
      );
      spoon.rotation.z =
        t > 0.4 ? -0.8 * Math.sin(clamp((t - 0.4) / 0.3) * Math.PI) : 0;
      if (t > 0.72) {
        const q = ease((t - 0.72) / 0.28);
        spoon.position.lerp(new THREE.Vector3(-0.95, 0.12, 1.12), q);
        spoon.rotation.z = 0;
      }
      for (let i = 0; i < fallingLeaves.length; i++) {
        const l = fallingLeaves[i],
          p = clamp((t - 0.35 - i * 0.008) / 0.25);
        l.visible = t > 0.35 + i * 0.008 && t < 0.69;
        l.position.set(
          Math.sin(i * 8) * 0.14,
          1.6 - p * 1.23,
          0.1 + Math.cos(i * 5) * 0.14,
        );
        l.rotation.set(p * 5 + i, p * 8, 0);
      }
    }
    if (clip === "pour") {
      // Start at the lip and remain tilted for deterministic playback scrubbing.
      kettle.position.set(-1.887, 1.25, 0.1);
      kettle.rotation.z = -0.55;
      kettle.updateMatrixWorld(true);
      const spout = kettle.localToWorld(new THREE.Vector3(1.38, 1.36, 0));
      stream.visible = t > 0.005 && t < 0.995;
      streamBetween(
        spout,
        new THREE.Vector3(0, teaSurface.position.y + 0.095, 0.1),
        t,
      );
    }
    if (clip === "serve") {
      const p = ease(clamp(t / 0.3));
      pot.position.set(0.434 * p, 0.09 + 1.15 * p, 0.1 + 0.9 * p);
      pot.rotation.z = -0.75 * p;
      pot.updateMatrixWorld(true);
      if (t > 0.25 && t < 0.76) {
        const spout = pot.localToWorld(new THREE.Vector3(1.21, 0.85, 0));
        stream.visible = true;
        streamBetween(
          spout,
          new THREE.Vector3(1.9, 0.085 + cupLiquid.position.y, 1),
          0.8,
        );
      }
      cupLiquid.position.y = 0.17 + 0.33 * ease(clamp((t - 0.25) / 0.5));
      teaSurface.position.y = 0.78 - 0.5 * clamp((t - 0.25) / 0.5);
      if (t > 0.78) {
        const q = 1 - ease((t - 0.78) / 0.22);
        pot.position.set(0.434 * q, 0.09 + 1.15 * q, 0.1 + 0.9 * q);
        pot.rotation.z = -0.75 * q;
      }
    }
    if (clip === "complete") {
      teaSurface.position.y = 0.28;
      lid.position.set(0, 0.88, 0.1);
      const slide = ease(clamp(t / 0.5)),
        approach = ease(t);
      cup.position.set(0, 0.085, 0.08 + 0.14 * slide);
      camera.position.set(1.15, 1.7, 3.3);
      camera.position.lerp(new THREE.Vector3(0.85, 1.32, 2.85), approach);
      camera.lookAt(0, 0.5, 0.15);
      cupRipples.forEach((r, i) => {
        const phase = (t * 2.5 + i / 3) % 1;
        r.visible = true;
        r.scale.setScalar(0.3 + phase * 2.3);
        r.material.opacity = (1 - phase) * (1 - ease(t)) * 0.34;
      });
    }
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i],
        p = (t * 4 + i / 3) % 1;
      r.visible = clip === "pour";
      r.position.y = teaSurface.position.y + 0.014;
      r.scale.setScalar(0.4 + 2 * p);
      r.material.opacity = (1 - p) * 0.28;
    }
    for (let i = 0; i < steam.length; i++) {
      const s = steam[i],
        p = (t + i / steam.length) % 1;
      const x = clip === "complete" || clip === "serve" ? cup.position.x : 0,
        z = clip === "complete" || clip === "serve" ? cup.position.z : 0.1;
      s.position.set(
        x + Math.sin(p * 6 + i) * 0.12,
        (clip === "complete" ? 0.62 : 0.98) + p * 1.35,
        z + Math.cos(p * 7 + i) * 0.07,
      );
      s.scale.set(
        clip === "complete" ? 0.06 + p * 0.2 : 0.12 + p * 0.32,
        0.3 + p * 0.65,
        1,
      );
      s.material.opacity =
        Math.sin(p * Math.PI) * (clip === "complete" ? 0.18 : 0.42);
      s.visible = isFull || clip === "pour";
    }
    if (clip === "complete") {
      // The finished brew gets its own shot: a single cup, saucer and rising steam.
      scene.children.forEach((child) => {
        child.visible = Boolean(
          child === cup ||
          child === soloFloor ||
          child.isLight ||
          steam.includes(child),
        );
      });
    }
    const flicker =
      1 + 0.07 * Math.sin(t * Math.PI * 8) + 0.025 * Math.cos(t * Math.PI * 16);
    flame.scale.y = 0.13 * flicker;
    candleLight.intensity = 11 * flicker;
    renderer.render(scene, camera);
  }
  function renderProp(
    kind,
    {
      color = "#c8994e",
      label = "桂花烏龍",
      glaze = "#234d47",
      state = "empty",
      liquidOnly = false,
      teaType = "osmanthus",
    } = {},
  ) {
    setTeaAppearance(teaType);
    setPropTeaForms(teaType);
    setFrame("complete", 0);
    const filled = state === "full" || state === "water";
    const objects = { jar, jarLid, kettle, pot, potLid: lid, cup, spoon };
    const object = objects[kind];
    if (!object) throw new Error(`Unknown prop ${kind}`);
    scene.children.forEach((child) => {
      child.visible = Boolean(child === object || child.isLight);
    });
    scene.background = null;
    scene.fog = null;
    renderer.setClearColor(0x000000, 0);
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
    jarGlaze.color.set(glaze);
    jarLabel(label, glaze);
    jarCap.visible = kind === "jar" && state === "closed";
    labelMesh.visible = true;
    teaMat.color.set(color);
    if (state === "water") {
      teaMat.map = neutralTeaMap;
      teaMat.color.set("#dae1d8");
      teaMat.opacity = 0.2;
    }
    teaMat.roughness = 0.12;
    teaMat.metalness = 0;
    teaSurface.visible = kind === "pot" && filled;
    teaSurface.position.y = 0.72;
    floatingLeaves.forEach((l) => {
      l.visible = false;
    });
    dryPotLeaves.forEach((leaf) => {
      leaf.visible = false;
    });
    jarFormGroup.visible = kind === "jar" && state === "open";
    spoonFormGroup.visible = kind === "spoon" && state === "full";
    potDryFormGroup.visible = kind === "pot" && state === "leaves";
    potWetFormGroup.visible = kind === "pot" && filled;
    cupLiquid.visible = kind === "cup" && filled;
    cupLiquid.position.y = 0.47;
    cupRipples.forEach((r) => {
      r.visible = false;
    });
    if (kind === "jar") object.scale.y = 1.5;
    if (kind === "spoon") object.rotation.y = Math.PI / 2;
    spoonLeaves.visible = kind === "spoon" && state === "full";
    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
    cam.position.copy(center).add(new THREE.Vector3(0, 4.5, 8));
    cam.lookAt(center);
    cam.updateMatrixWorld();
    const corners = [];
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z])
          corners.push(
            new THREE.Vector3(x, y, z).applyMatrix4(cam.matrixWorldInverse),
          );
    const extentX = Math.max(...corners.map((p) => Math.abs(p.x))) * 1.035;
    const extentY = Math.max(...corners.map((p) => Math.abs(p.y))) * 1.035;
    const aspect = W / H,
      extent = Math.max(extentY, extentX / aspect);
    cam.left = -extent * aspect;
    cam.right = extent * aspect;
    cam.top = extent;
    cam.bottom = -extent;
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
    // Metadata uses the exact projection, so the interactive stream follows the rendered lip.
    const point =
      kind === "kettle"
        ? new THREE.Vector3(1.38, 1.36, 0)
        : kind === "pot"
          ? new THREE.Vector3(1.21, 0.85, 0)
          : null;
    if (point) {
      point.applyMatrix4(object.matrixWorld).project(cam);
    }
    return {
      image: liquidOnly
        ? renderLiquorOnly(cam)
        : renderer.domElement.toDataURL("image/png"),
      spout: point ? { x: (point.x + 1) / 2, y: (1 - point.y) / 2 } : null,
    };
  }
  function renderLiquorOnly(viewCamera) {
    const background = scene.background;
    const clearColor = renderer.getClearColor(new THREE.Color()),
      clearAlpha = renderer.getClearAlpha();
    const states = new Map(),
      sprites = [];
    const color = teaMat.color.clone(),
      map = teaMat.map,
      opacity = teaMat.opacity;
    scene.traverse((object) => {
      if (object.isSprite) {
        sprites.push([object, object.visible]);
        object.visible = false;
      }
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        if (
          !material ||
          material === teaMat ||
          material === meniscusMat ||
          cupRipples.some((ripple) => ripple.material === material) ||
          states.has(material)
        )
          continue;
        states.set(material, [
          material.colorWrite,
          material.depthWrite,
          material.transparent,
        ]);
        material.colorWrite = false;
        material.depthWrite = true;
        material.transparent = false;
      }
    });
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
    teaMat.map = neutralTeaMap;
    teaMat.color.set("#ffffff");
    teaMat.opacity = 1;
    try {
      renderer.render(scene, viewCamera);
      return renderer.domElement.toDataURL("image/png");
    } finally {
      scene.background = background;
      renderer.setClearColor(clearColor, clearAlpha);
      teaMat.color.copy(color);
      teaMat.map = map;
      teaMat.opacity = opacity;
      for (const [material, state] of states) {
        [material.colorWrite, material.depthWrite, material.transparent] =
          state;
      }
      for (const [sprite, visible] of sprites) sprite.visible = visible;
    }
  }
  return {
    setFrame,
    renderProp,
    // For tooling: the live scene, and a frame seen from another angle.
    internals: { scene, camera, renderer },
    // For tooling: inspect a frame from another angle without changing it.
    renderFrom(position, target, fov = camera.fov) {
      const saved = [camera.position.clone(), camera.quaternion.clone(), camera.fov];
      camera.position.set(...position);
      camera.lookAt(...target);
      camera.fov = fov;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const image = renderer.domElement.toDataURL("image/png");
      camera.position.copy(saved[0]);
      camera.quaternion.copy(saved[1]);
      camera.fov = saved[2];
      camera.updateProjectionMatrix();
      return image;
    },
    renderLiquorFrame(t, clip = "complete", tea = "osmanthus", garnish = "none") {
      if (clip === "brew") return brewFilm().renderLiquorMask(renderer, t, tea, garnish);
      setFrame("complete", t);
      return renderLiquorOnly(camera);
    },
    dispose() {
      const geometries = new Set(),
        materials = new Set(),
        textures = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          if (!material) continue;
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      neutralTeaMap.dispose();
      brewedTeaMap.dispose();
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
