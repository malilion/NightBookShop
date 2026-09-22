// Deterministic, editable tea-film set. No external models, stock footage, or audio.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
export function createTeaSet(container, W = 1280, H = 720) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#171c29");
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 80);
  camera.position.set(4.6, 5.2, 7.6);
  camera.lookAt(0, 0.7, 0);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  container.append(renderer.domElement);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const environmentMap = pmrem.fromScene(environment, 0.055);
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = 0.2;
  environment.dispose();
  pmrem.dispose();
  const material = (color, metalness = 0, roughness = 0.5) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const navy = new THREE.MeshPhysicalMaterial({
      color: "#203b43",
      metalness: 0.12,
      roughness: 0.29,
      clearcoat: 0.65,
      clearcoatRoughness: 0.34,
    }),
    brass = material("#cba46a", 0.78, 0.31),
    cream = material("#e5d0a5", 0.02, 0.35),
    copper = material("#965b3e", 0.85, 0.3),
    green = material("#385442", 0.03, 0.8),
    black = material("#111927", 0.2, 0.45);
  function mesh(geometry, mat, pos = [0, 0, 0], parent = scene) {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function lathe(points, mat, parent, pos = [0, 0, 0]) {
    return mesh(
      new THREE.LatheGeometry(
        points.map((p) => new THREE.Vector2(...p)),
        72,
      ),
      mat,
      pos,
      parent,
    );
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
  box([16, 0.24, 12], wood, [0, -0.15, 0]);
  const mat = material("#283841", 0, 0.9);
  box([4.9, 0.055, 3.1], mat, [-0.05, 0.015, 0.15]);
  // Brass edging on the navy linen runner.
  for (const z of [-1.35, 1.65])
    box([4.84, 0.012, 0.025], brass, [-0.05, 0.05, z]);
  const kettle = new THREE.Group();
  scene.add(kettle);
  kettle.position.set(-2.3, 0.08, -0.45);
  lathe(
    [
      [0, 0],
      [0.45, 0],
      [0.7, 0.18],
      [0.77, 0.5],
      [0.71, 0.9],
      [0.46, 1.12],
      [0.44, 1.16],
      [0, 1.16],
    ],
    copper,
    kettle,
  );
  ring(0.455, 0.024, brass, [0, 1.17, 0], kettle);
  ball([0.16, 0.09, 0.16], black, [0, 1.28, 0], kettle);
  tube(
    [
      [0.62, 0.35, 0],
      [0.9, 0.58, 0],
      [1.04, 1.08, 0],
      [1.38, 1.36, 0],
    ],
    0.085,
    brass,
    kettle,
  );
  const handle = mesh(
    new THREE.TorusGeometry(0.65, 0.07, 12, 48, Math.PI),
    black,
    [0, 1.22, 0],
    kettle,
  );
  handle.rotation.z = 0;
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
  ring(0.49, 0.025, brass, [0, 0.9, 0], pot);
  ring(0.46, 0.022, brass, [0, 0.085, 0], pot);
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
    new THREE.TorusGeometry(0.35, 0.055, 10, 48),
    brass,
    [-0.75, 0.47, 0],
    pot,
  );
  potHandle.scale.x = 0.8;
  // Crescent and small stars inlaid on the face visible to the camera.
  const emblem = mesh(
    new THREE.TorusGeometry(0.145, 0.019, 8, 36, Math.PI * 1.5),
    brass,
    [0, 0.45, 0.735],
    pot,
  );
  emblem.rotation.z = -0.7;
  for (const [x, y] of [
    [0.23, 0.55],
    [-0.25, 0.37],
    [0.18, 0.3],
  ])
    ball([0.014, 0.014, 0.012], brass, [x, y, 0.73], pot);
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
  ring(0.49, 0.019, brass, [0, 0.08, 0], lid);
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
  ring(0.397, 0.016, brass, [0, 0.556, 0], cup);
  const cupHandle = mesh(
    new THREE.TorusGeometry(0.15, 0.033, 8, 36),
    brass,
    [0.42, 0.35, 0],
    cup,
  );
  cupHandle.scale.x = 0.9;
  const teaMat = material("#b27326", 0.22, 0.18);
  const teaSurface = mesh(
    new THREE.CircleGeometry(0.45, 64),
    teaMat,
    [0, 0.22, 0],
    pot,
  );
  teaSurface.rotation.x = -Math.PI / 2;
  const cupLiquid = mesh(
    new THREE.CircleGeometry(0.34, 64),
    teaMat,
    [0, 0.19, 0],
    cup,
  );
  cupLiquid.rotation.x = -Math.PI / 2;
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
    cream,
    jar,
  );
  ring(0.35, 0.025, brass, [0, 0.67, 0], jar);
  lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.38, 0.06],
      [0, 0.06],
    ],
    wood,
    scene,
    [-2.5, 0.09, 1.3],
  );
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4;
    const leaf = ball(
      [0.07, 0.025, 0.025],
      green,
      [Math.cos(a) * 0.24, 0.59 + Math.sin(i) * 0.02, Math.sin(a) * 0.23],
      jar,
    );
    leaf.rotation.y = a;
  }
  const spoon = new THREE.Group();
  scene.add(spoon);
  ball([0.16, 0.022, 0.23], brass, [0, 0, 0], spoon);
  box([0.07, 0.045, 0.8], brass, [0, 0.03, 0.55], spoon);
  spoon.rotation.y = -0.55;
  const fallingLeaves = [];
  for (let i = 0; i < 12; i++) {
    const leaf = ball([0.065, 0.025, 0.02], green, [0, 0, 0]);
    fallingLeaves.push(leaf);
  }
  const floatingLeaves = [];
  for (let i = 0; i < 9; i++) {
    const leaf = ball([0.07, 0.012, 0.023], green, [0, 0, 0], pot);
    floatingLeaves.push(leaf);
  }
  const streamMat = new THREE.MeshPhysicalMaterial({
    color: "#d3e5df",
    transparent: true,
    opacity: 0.62,
    metalness: 0.03,
    roughness: 0.09,
    clearcoat: 1,
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
    ripples.push(m);
  }
  // Table props establish the bookshop without blocking the action.
  for (const [i, color] of ["#344947", "#6d3833", "#b4925c"].entries()) {
    const g = new THREE.Group();
    g.position.set(-2.3, 0.05 + i * 0.17, -2.35);
    g.rotation.y = -0.12 + i * 0.04;
    scene.add(g);
    box([1.65, 0.13, 1.1], material("#b6a27c"), [0, 0.08, 0], g);
    for (const y of [0, 0.17])
      box([1.75, 0.035, 1.16], material(color), [0, y, 0], g);
    box([0.08, 0.19, 1.16], material(color), [-0.84, 0.08, 0], g);
  }
  const candleGroup = new THREE.Group();
  candleGroup.position.set(2.5, 0, -1.2);
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
  mesh(new THREE.PlaneGeometry(18, 8), material("#132a42"), [0, 3, -4]);
  for (let i = -4; i <= 4; i++)
    box([0.06, 6, 0.06], wood, [i * 1.25, 2.5, -3.9]);
  for (const y of [0.7, 3.2, 5.3]) box([13, 0.06, 0.06], wood, [0, y, -3.9]);
  for (let i = 0; i < 45; i++) {
    const x = Math.sin(i * 9.3) * 6,
      y = 0.5 + ((i * 17) % 29) / 14;
    ball(
      [0.023, 0.032, 0.015],
      new THREE.MeshBasicMaterial({ color: i % 3 ? "#b77d37" : "#b8bcca" }),
      [x, y, -3.95],
    );
  }
  mesh(
    new THREE.CircleGeometry(0.3, 48),
    new THREE.MeshBasicMaterial({ color: "#ecdfb9" }),
    [-1.1, 4.5, -3.8],
  );
  const ambient = new THREE.HemisphereLight("#becde7", "#39241a", 0.85);
  scene.add(ambient);
  const key = new THREE.DirectionalLight("#ffd8ac", 2.2);
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
  const fill = new THREE.DirectionalLight("#839fbe", 0.8);
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
  function setFrame(clip, t, tea = "osmanthus") {
    t = clamp(t);
    const isFull = ["steep", "serve", "complete"].includes(clip);
    teaMat.roughness = 0.13;
    teaMat.metalness = 0.15;
    teaMat.color.set(
      tea === "puer" ? "#68381c" : tea === "mint" ? "#a3a94c" : "#b87721",
    );
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
        a = i * 2.4 + t * Math.PI * (clip === "steep" ? 2 : 0.1);
      l.visible = clip !== "idle" && clip !== "scoop";
      l.position.set(
        Math.cos(a) * 0.29,
        teaSurface.position.y + 0.008,
        Math.sin(a) * 0.27,
      );
      l.rotation.y = a;
      l.scale.set(clip === "steep" ? 0.09 + 0.05 * t : 0.075, 0.014, 0.025);
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
    if (clip === "complete") teaSurface.position.y = 0.28;
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
      const x = clip === "complete" || clip === "serve" ? 1.9 : 0,
        z = clip === "complete" || clip === "serve" ? 1 : 0.1;
      s.position.set(
        x + Math.sin(p * 6 + i) * 0.12,
        0.98 + p * 1.35,
        z + Math.cos(p * 7 + i) * 0.07,
      );
      s.scale.set(0.12 + p * 0.32, 0.3 + p * 0.65, 1);
      s.material.opacity = Math.sin(p * Math.PI) * 0.42;
      s.visible = isFull || clip === "pour";
    }
    const flicker =
      1 + 0.07 * Math.sin(t * Math.PI * 8) + 0.025 * Math.cos(t * Math.PI * 16);
    flame.scale.y = 0.13 * flicker;
    candleLight.intensity = 11 * flicker;
    renderer.render(scene, camera);
  }
  return {
    setFrame,
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
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
