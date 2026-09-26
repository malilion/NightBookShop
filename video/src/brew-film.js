// The per-tea brew film: Lin Cheng's hands scoop this tea from its caddy, the
// water opens it in the pot, she pours it into the cup and sets the cup down
// in front of the visitor with both hands. Four shots cut on action; every
// frame is a pure function of (t, tea) so Remotion can render out of order.
import * as THREE from "three";
import { createHand, anchorPoint, handPoses } from "./hands.js";
import { createTeaForms, noise } from "./tea-forms.js";
import { brewFilm, brewFilmTeas } from "./tea-varieties.js";
import { teaTexture } from "./tea-surfaces.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const smooth = (t) => {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
};
const smoother = (t) => {
  t = clamp01(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const span = (t, a, b) => clamp01((t - a) / (b - a));
const mix = (a, b, s) => a + (b - a) * s;
// Keyframed tracks: [[time, value], ...] with smoothed segments.
function track(t, keys, ease = smooth) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const s = ease((t - t0) / (t1 - t0));
      if (typeof v0 === "number") return mix(v0, v1, s);
      if (v0.isVector3) return v0.clone().lerp(v1, s);
      return v0.map((value, j) => mix(value, v1[j], s));
    }
  }
  return keys.at(-1)[1];
}
function blendPose(a, b, s) {
  const fingers = {};
  for (const name of Object.keys(a.fingers))
    fingers[name] = a.fingers[name].map((value, i) => mix(value, b.fingers[name][i], s));
  return {
    fingers,
    thumb: a.thumb.map((value, i) => mix(value, b.thumb[i], s)),
    arch: mix(a.arch, b.arch, s),
  };
}
const grips = {
  relaxed: handPoses.relaxed,
  spoon: {
    fingers: { index: [38, 50, 18, 2], middle: [44, 62, 30, -1], ring: [60, 86, 42, -3], little: [66, 90, 46, -6] },
    thumb: [36, 40, 34, 10, 16],
    arch: 0.45,
  },
  jar: {
    fingers: { index: [30, 40, 24, -2], middle: [32, 44, 26, 0], ring: [34, 46, 28, 2], little: [38, 50, 30, 4] },
    thumb: [52, 34, 34, 8, 12],
    arch: 0.55,
  },
  handle: {
    fingers: { index: [22, 72, 42, 0], middle: [26, 78, 44, 0], ring: [44, 84, 46, 0], little: [58, 88, 46, 0] },
    thumb: [6, 2, 0, 6, 10],
    arch: 0.3,
  },
  lid: {
    fingers: { index: [10, 12, 4, 0], middle: [52, 76, 40, -2], ring: [60, 82, 42, -4], little: [64, 86, 44, -6] },
    thumb: [24, 30, 12, 18, 22],
    arch: 0.35,
  },
  saucer: {
    fingers: { index: [20, 30, 14, 4], middle: [24, 36, 16, 0], ring: [30, 44, 20, -3], little: [36, 50, 22, -6] },
    thumb: [14, 10, 4, 10, 12],
    arch: 0.3,
  },
};

export function createBrewFilm({ scene, camera, props, materials }) {
  const root = new THREE.Group();
  root.name = "brew-film";
  scene.add(root);
  const forms = createTeaForms();

  // ------------------------------------------------ the tea set, own copies
  const strip = (object, names) => {
    const doomed = [];
    object.traverse((child) => {
      if (names.includes(child.name)) doomed.push(child);
    });
    doomed.forEach((child) => child.parent.remove(child));
    return object;
  };
  const pot = strip(props.pot.clone(), ["pot-liquor", "pot-leaf", "pot-ripple"]);
  const lid = props.lid.clone();
  const cup = strip(props.cup.clone(), ["cup-liquor", "cup-ripple"]);
  const jar = strip(props.jar.clone(), ["jar-label", "jar-leaf", "jar-cap", "jar-leaf-bed"]);
  const jarCap = props.jarLid.clone();
  const spoon = strip(props.spoon.clone(), ["spoon-leaves"]);
  const kettle = props.kettle.clone();
  for (const object of [pot, lid, cup, jar, jarCap, spoon, kettle]) {
    object.matrixAutoUpdate = true;
    root.add(object);
  }
  const glaze = materials.jarGlaze.clone();
  jar.traverse((child) => {
    if (child.material === materials.jarGlaze) child.material = glaze;
  });
  const capOnJar = jarCap.clone();
  capOnJar.position.set(0, 0.705, 0);
  jar.add(capOnJar);
  // A fresh paper label, redrawn for each tea.
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = labelCanvas.height = 384;
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.372, 0.372, 0.39, 48, 1, true, -0.7, 1.4),
    new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 0.92, side: THREE.DoubleSide }),
  );
  label.position.y = 0.34;
  label.castShadow = label.receiveShadow = true;
  jar.add(label);
  function drawLabel(name, color) {
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
    c.fillText(name, 192, 218, 328);
    c.fillStyle = color;
    c.beginPath();
    c.arc(192, 124, 18, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#766245";
    c.font = "20px serif";
    c.fillText("藏 茶", 192, 310);
    labelTexture.needsUpdate = true;
  }
  const bed = new THREE.Mesh(
    new THREE.CircleGeometry(0.29, 48),
    new THREE.MeshStandardMaterial({ color: "#2f2a1f", roughness: 1 }),
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.y = 0.52;
  jar.add(bed);

  // A small ceramic dish for the tea's botanicals.
  const dish = new THREE.Group();
  root.add(dish);
  {
    const cream = materials.cream;
    const profile = [
      [0, 0],
      [0.3, 0],
      [0.42, 0.05],
      [0.47, 0.1],
      [0.45, 0.11],
      [0.36, 0.07],
      [0, 0.055],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), cream);
    body.castShadow = body.receiveShadow = true;
    dish.add(body);
  }

  // ------------------------------------------------------ liquids
  const brewedMap = teaTexture();
  const neutralMap = teaTexture(true);
  const cupLiquorMaterial = new THREE.MeshPhysicalMaterial({
    color: "#d0a354",
    map: brewedMap,
    roughness: 0.1,
    ior: 1.333,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    envMapIntensity: 0.6,
  });
  const potLiquorMaterial = cupLiquorMaterial.clone();
  const meniscusMaterial = new THREE.MeshPhysicalMaterial({
    color: "#e6c98a",
    roughness: 0.08,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const cupLiquor = new THREE.Mesh(new THREE.CircleGeometry(1, 72), cupLiquorMaterial);
  cupLiquor.rotation.x = -Math.PI / 2;
  cup.add(cupLiquor);
  const meniscus = new THREE.Mesh(new THREE.TorusGeometry(0.995, 0.009, 8, 96), meniscusMaterial);
  cupLiquor.add(meniscus);
  const rippleMaterials = [];
  const cupRipples = Array.from({ length: 3 }, () => {
    const m = new THREE.MeshBasicMaterial({ color: "#ffe6af", transparent: true, opacity: 0, depthWrite: false });
    rippleMaterials.push(m);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.008, 8, 64), m);
    cupLiquor.add(ring);
    return ring;
  });
  const potLiquor = new THREE.Mesh(new THREE.CircleGeometry(1, 72), potLiquorMaterial);
  potLiquor.rotation.x = -Math.PI / 2;
  pot.add(potLiquor);
  const potRipples = Array.from({ length: 4 }, () => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.007, 8, 64),
      new THREE.MeshBasicMaterial({ color: "#fff1d0", transparent: true, opacity: 0, depthWrite: false }),
    );
    potLiquor.add(ring);
    return ring;
  });
  const liquorMaterials = new Set([cupLiquorMaterial, meniscusMaterial, ...rippleMaterials]);
  // Inner radius of the cup and the pot at a given local height.
  const profileRadius = (points, y) => {
    if (y <= points[0][1]) return points[0][0];
    for (let i = 1; i < points.length; i++)
      if (y <= points[i][1]) {
        const [r0, y0] = points[i - 1],
          [r1, y1] = points[i];
        return mix(r0, r1, (y - y0) / (y1 - y0));
      }
    return points.at(-1)[0];
  };
  const cupInside = [
    [0.23, 0.15],
    [0.3, 0.2],
    [0.335, 0.28],
    [0.35, 0.42],
    [0.363, 0.54],
  ];
  const potInside = [
    [0.4, 0.16],
    [0.57, 0.21],
    [0.7, 0.43],
    [0.68, 0.61],
    [0.54, 0.83],
  ];

  // Streams: water from the kettle, tea from the pot. Each is a chain of
  // short cylinders along a falling arc, with a few droplets where it lands.
  function createStream(material, count = 26) {
    const group = new THREE.Group();
    root.add(group);
    const parts = Array.from({ length: count }, () => {
      const part = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), material);
      group.add(part);
      return part;
    });
    const drops = Array.from({ length: 14 }, () => {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), material);
      group.add(drop);
      return drop;
    });
    function update(start, direction, landY, phase, width = 0.024, flow = 1) {
      group.visible = flow > 0.02;
      if (!group.visible) return null;
      // Ballistic arc from the lip: v0 along the spout, gravity pulls it down.
      const points = [];
      const v = direction.clone().normalize().multiplyScalar(1.1);
      const p = start.clone();
      for (let i = 0; i < 60 && p.y > landY; i++) {
        points.push(p.clone());
        p.addScaledVector(v, 0.02);
        v.y -= 9.8 * 0.02 * 0.9;
      }
      points.push(p.clone());
      const curve = new THREE.CatmullRomCurve3(points);
      parts.forEach((part, i) => {
        const a = curve.getPointAt(i / count),
          b = curve.getPointAt((i + 1) / count);
        const d = b.clone().sub(a);
        const u = i / count;
        // The stream thins as it falls and wavers a little.
        const radius = width * flow * (1 - 0.35 * u) * (1 + 0.08 * Math.sin(u * 23 - phase * 60));
        part.position.copy(a.clone().add(b).multiplyScalar(0.5));
        part.scale.set(radius, d.length() * 1.12, radius);
        part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      });
      const end = curve.getPointAt(1);
      drops.forEach((drop, i) => {
        const s = (phase * 7 + i / drops.length) % 1,
          a = i * 2.4;
        drop.position.set(end.x + Math.cos(a) * s * 0.16, end.y + Math.sin(s * Math.PI) * 0.1, end.z + Math.sin(a) * s * 0.16);
        drop.scale.setScalar(0.013 * (1 - s) * flow);
      });
      return end;
    }
    return { group, update };
  }
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: "#dfe9e6",
    transparent: true,
    opacity: 0.7,
    transmission: 0.5,
    thickness: 0.06,
    ior: 1.333,
    roughness: 0.04,
    depthWrite: false,
  });
  const teaStreamMaterial = new THREE.MeshPhysicalMaterial({
    color: "#c68b3c",
    transparent: true,
    opacity: 0.86,
    transmission: 0.25,
    thickness: 0.06,
    ior: 1.333,
    roughness: 0.05,
    clearcoat: 0.6,
  });
  const waterStream = createStream(waterMaterial);
  const teaStream = createStream(teaStreamMaterial);

  // ---------------------------------------------------------- steam and aroma
  function spriteTexture(inner, outer) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }
  const steamTexture = spriteTexture("rgba(240,230,205,.45)", "rgba(255,240,210,0)");
  const moteTexture = spriteTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const steam = Array.from({ length: 30 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTexture, transparent: true, depthWrite: false }));
    root.add(s);
    return s;
  });
  const motes = Array.from({ length: 36 }, () => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: moteTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    root.add(s);
    return s;
  });
  const smoke = Array.from({ length: 14 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTexture, transparent: true, depthWrite: false }));
    root.add(s);
    return s;
  });
  const accent = new THREE.PointLight("#ffcf8a", 0, 4, 2);
  root.add(accent);
  const rim = new THREE.DirectionalLight("#ffd9b0", 0);
  root.add(rim);
  root.add(rim.target);

  // -------------------------------------------------------- per-tea content
  const varieties = new Map();
  function variety(id) {
    if (varieties.has(id)) return varieties.get(id);
    const spec = brewFilmTeas[id];
    if (!spec) throw new Error(`Unknown tea ${id}`);
    const group = new THREE.Group();
    group.name = `brew-${id}`;
    root.add(group);
    const jarLeaves = new THREE.Group();
    for (let i = 0; i < 110; i++) {
      const a = noise(i + 201) * Math.PI * 2,
        r = Math.sqrt(noise(i + 312)) * 0.25;
      const piece = forms.dry(spec, i + 1);
      piece.position.set(Math.cos(a) * r, 0.535 + noise(i + 99) * 0.04, Math.sin(a) * r);
      jarLeaves.add(piece);
    }
    const spoonLeaves = new THREE.Group();
    for (let i = 0; i < 22; i++) {
      const piece = forms.dry(spec, i + 500);
      piece.position.set((noise(i + 24) - 0.5) * 0.17, 0.03 + noise(i + 64) * 0.028, (noise(i + 82) - 0.5) * 0.26);
      spoonLeaves.add(piece);
    }
    const falling = Array.from({ length: 22 }, (_, i) => {
      const piece = forms.dry(spec, i + 500);
      group.add(piece);
      return piece;
    });
    const potDry = Array.from({ length: 24 }, (_, i) => {
      const piece = forms.dry(spec, i + 700);
      pot.add(piece);
      return piece;
    });
    const potWet = Array.from({ length: 16 }, (_, i) => {
      const piece = forms.wet(spec, i + 800);
      pot.add(piece);
      return piece;
    });
    const sideDish = forms.dish(spec);
    dish.add(sideDish);
    const aroma = Array.from({ length: 26 }, (_, i) => {
      const particle = forms.aroma(spec, i + 900);
      if (particle) {
        particle.castShadow = false;
        group.add(particle);
      }
      return particle;
    });
    jar.add(jarLeaves);
    spoon.add(spoonLeaves);
    // Every animated piece keeps its authored scale so frames never compound.
    for (const piece of [...falling, ...potDry, ...potWet, ...aroma.filter(Boolean)])
      piece.userData.base = piece.scale.clone();
    const entry = { spec, group, jarLeaves, spoonLeaves, falling, potDry, potWet, sideDish, aroma };
    varieties.set(id, entry);
    return entry;
  }
  let labelled = null;
  function showVariety(id) {
    const entry = variety(id);
    if (labelled !== id) {
      labelled = id;
      glaze.color.set(entry.spec.glaze);
      drawLabel(entry.spec.name, entry.spec.glaze);
    }
    for (const [key, entry] of varieties) {
      const on = key === id;
      entry.group.visible = on;
      entry.jarLeaves.visible = on;
      entry.spoonLeaves.visible = on;
      entry.sideDish.visible = on;
      entry.potDry.forEach((p) => (p.visible = on));
      entry.potWet.forEach((p) => (p.visible = on));
    }
    return variety(id);
  }

  // ---------------------------------------------------------------- hands
  const handScale = 0.92;
  const right = createHand(root, { side: "right", scale: handScale });
  const left = createHand(root, { side: "left", scale: handScale });

  // ----------------------------------------------------------- the shots
  function hideAll() {
    for (const child of scene.children)
      child.visible = child === root || child.isLight || Boolean(child.userData.backdrop);
  }
  function placeCamera(position, target, fov) {
    camera.position.copy(position);
    camera.lookAt(target);
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  function resetObjects() {
    for (const object of [pot, lid, cup, jar, jarCap, spoon, kettle, dish]) {
      object.visible = false;
      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      object.scale.set(1, 1, 1);
    }
    capOnJar.visible = false;
    potLiquor.visible = false;
    cupLiquor.visible = false;
    waterStream.update(V(0, 0, 0), V(0, -1, 0), 0, 0, 0, 0);
    teaStream.update(V(0, 0, 0), V(0, -1, 0), 0, 0, 0, 0);
    steam.forEach((s) => (s.visible = false));
    motes.forEach((s) => (s.visible = false));
    smoke.forEach((s) => (s.visible = false));
    right.visible = false;
    left.visible = false;
    accent.intensity = 0;
    rim.intensity = 0;
    for (const entry of varieties.values())
      for (const piece of [...entry.falling, ...entry.potDry, ...entry.potWet, ...entry.aroma])
        if (piece) {
          piece.visible = false;
          piece.scale.copy(piece.userData.base);
        }
  }
  function setLiquor(material, hex, strength = 1) {
    material.color.set("#dae1d8").lerp(new THREE.Color(hex), strength);
    material.map = strength > 0.05 ? brewedMap : neutralMap;
    material.opacity = mix(0.3, 0.9, strength);
  }
  function setCupLevel(fill) {
    const y = mix(0.16, 0.5, fill);
    cupLiquor.visible = fill > 0.01;
    cupLiquor.position.y = y;
    cupLiquor.scale.setScalar(profileRadius(cupInside, y) - 0.004);
  }
  function setPotLevel(fill) {
    const y = mix(0.17, 0.72, fill);
    potLiquor.visible = fill > 0.01;
    potLiquor.position.y = y;
    potLiquor.scale.setScalar(profileRadius(potInside, y) - 0.006);
    return y;
  }
  function riseSteam(centre, t, strength, spread = 0.12, height = 1.2) {
    steam.forEach((s, i) => {
      const p = (t * 0.7 + noise(i + 40)) % 1;
      s.visible = strength > 0.01;
      // Wisps drift sideways and widen as they cool, never a solid column.
      const drift = Math.sin(p * 4 + i * 1.7) * spread * (0.5 + p * 1.6);
      s.position.set(
        centre.x + drift + (noise(i) - 0.5) * spread,
        centre.y + 0.05 + p * height,
        centre.z + Math.cos(p * 5 + i) * spread * 0.7,
      );
      s.scale.set(0.12 + p * 0.42, 0.18 + p * 0.5, 1);
      s.material.rotation = noise(i + 3) * 6 + p;
      s.material.opacity = Math.sin(p * Math.PI) * Math.sin(p * Math.PI) * 0.16 * strength;
    });
  }

  // Shot 1 — 取茶: the left hand steadies the caddy, the right scoops.
  function scoopShot(t, tea) {
    const v = showVariety(tea);
    pot.visible = jar.visible = jarCap.visible = spoon.visible = true;
    pot.position.set(-0.42, 0.09, -0.18);
    jar.position.set(0.78, 0.08, 0.14);
    jar.rotation.y = -0.5;
    jarCap.position.set(1.62, 0.09, 0.62);
    jarCap.rotation.set(0.02, 0.4, 0);
    const rise = smooth(span(t, 0.12, 0.45)) * (1 - 0.5 * smooth(span(t, 0.7, 1)));
    placeCamera(
      V(0.3, 2.55, 3.7).lerp(V(0.2, 2.75, 3.85), rise),
      V(0.14, 0.78, -0.1).lerp(V(0.02, 1.08, -0.12), rise),
      32,
    );
    // The left hand wraps the caddy's back-right side.
    const phi = -0.42;
    const r = 0.46;
    const jarCentre = jar.position.clone();
    const mcp = V(jarCentre.x + Math.cos(phi) * r, 0.52, jarCentre.z + Math.sin(phi) * r);
    left.visible = true;
    left.setPose({
      ...grips.jar,
      forward: V(-Math.sin(phi), 0.12, Math.cos(phi)),
      dorsal: V(Math.cos(phi), 0.05, Math.sin(phi)),
      anchor: { part: "middle.mcp", world: mcp },
      elbow: V(2.1, 0.55, -2.1),
      shoulder: V(1.5, 3.0, -3.4),
    });
    // The right hand holds the scoop; its bowl follows the path below.
    const bowl = track(t, [
      [0, V(0.74, 0.6, 0.1)],
      [0.14, V(0.8, 0.64, 0.16)],
      [0.3, V(0.72, 1.08, 0.1)],
      [0.55, V(-0.36, 1.26, -0.14)],
      [0.66, V(-0.4, 1.2, -0.17)],
      [1, V(-0.3, 1.32, -0.1)],
    ]);
    const roll = track(t, [
      [0, -0.55],
      [0.14, -0.3],
      [0.3, -0.5],
      [0.56, -0.5],
      [0.72, 1.3],
      [1, 0.4],
    ]);
    const forward = track(t, [
      [0, V(0.9, -0.2, 0.32)],
      [0.3, V(0.9, -0.1, 0.3)],
      [0.55, V(0.55, -0.22, 0.78)],
      [1, V(0.55, -0.2, 0.8)],
    ]).normalize();
    const dorsal = V(0, 1, 0).applyAxisAngle(forward, roll);
    // Hold the spoon between the thumb pad and the side of the index finger.
    const pose = { ...grips.spoon, forward, dorsal, elbow: V(-1.9, 0.75, -2.0), shoulder: V(-1.5, 3.0, -3.4) };
    const spoonFrame = spoonInHand(pose);
    right.visible = true;
    right.setPose({ ...pose, anchor: { part: spoonFrame.bowlModel, world: bowl } });
    // The scoop keeps its own size: only the hand's rotation carries over.
    const handMatrix = right.root.matrix;
    const axes = spoonFrame.axes.map((axis) => axis.clone().transformDirection(handMatrix));
    spoon.matrixAutoUpdate = false;
    spoon.matrix.makeBasis(...axes).setPosition(spoonFrame.origin.clone().applyMatrix4(handMatrix));
    spoon.matrixWorldNeedsUpdate = true;
    // Leaves leave the tilted scoop and fall into the pot.
    v.spoonLeaves.visible = t < 0.62;
    const release = 0.62;
    v.falling.forEach((piece, i) => {
      const start = release + noise(i + 5) * 0.08;
      const s = t - start;
      piece.visible = s > 0 && s < 0.3;
      if (!piece.visible) return;
      const from = bowl.clone().add(V((noise(i + 1) - 0.5) * 0.12, 0.02, (noise(i + 2) - 0.5) * 0.14));
      const time = s * 2.5;
      piece.position.set(from.x + (noise(i + 3) - 0.5) * 0.1 * time, from.y - 4.9 * time * time, from.z + (noise(i + 4) - 0.5) * 0.1 * time);
      piece.rotation.set(time * 8 + i, time * 5, i);
      if (piece.position.y < 0.3) piece.visible = false;
    });
    // Dry leaves already in the pot.
    const inPot = smooth(span(t, 0.66, 0.9));
    v.potDry.forEach((piece, i) => {
      const a = noise(i + 11) * Math.PI * 2,
        rr = Math.sqrt(noise(i + 12)) * 0.34;
      piece.visible = i < 6 + inPot * 18;
      piece.position.set(Math.cos(a) * rr, 0.19 + noise(i + 13) * 0.03, Math.sin(a) * rr);
    });
    rim.intensity = 0.6;
    rim.position.set(1.5, 3, -3);
    rim.target.position.set(0, 0.5, 0);
  }

  // Shot 2 — 注水: water opens the leaves and the colour blooms.
  function infuseShot(t, tea) {
    const v = showVariety(tea);
    pot.visible = true;
    pot.position.set(0, 0.09, 0);
    placeCamera(V(0.22, 2.62, 1.42).lerp(V(0.18, 2.42, 1.2), smooth(t)), V(0, 0.66, -0.02), 28);
    const fill = smooth(span(t, 0.02, 0.8));
    const level = setPotLevel(0.08 + fill * 0.92);
    const bloom = smoother(span(t, 0.18, 1));
    setLiquor(potLiquorMaterial, v.spec.liquor, bloom * 0.95);
    // Clear enough to see the leaves below the surface, tinted by the tea.
    potLiquorMaterial.opacity = mix(0.22, 0.66, bloom);
    // The kettle's spout reaches in from the top-left corner of frame.
    kettle.visible = true;
    kettle.rotation.set(0, 0.55, -0.72);
    kettle.position.set(0, 0, 0);
    kettle.updateMatrixWorld(true);
    const lipOffset = kettle.localToWorld(V(1.38, 1.36, 0));
    kettle.position.copy(V(-0.5, 1.5, -0.34).sub(lipOffset));
    kettle.updateMatrixWorld(true);
    const lip = kettle.localToWorld(V(1.38, 1.36, 0));
    const tangent = kettle.localToWorld(V(1.5, 1.4, 0)).sub(lip);
    const flow = span(t, 0, 0.04) * (1 - span(t, 0.8, 0.88));
    waterStream.update(lip, tangent, level + 0.09, t, 0.026, flow);
    // Leaves lift, swirl and open; flowers rise to the surface.
    const swirl = t * 2.2;
    v.potDry.forEach((piece, i) => {
      const a = noise(i + 11) * Math.PI * 2 + swirl * (0.6 + noise(i) * 0.6);
      const rr = Math.sqrt(noise(i + 12)) * mix(0.34, 0.5, fill);
      const open = smooth(span(t, 0.2 + noise(i + 3) * 0.2, 0.6 + noise(i + 3) * 0.2));
      piece.visible = open < 0.98;
      const lift = mix(0.19 + noise(i + 13) * 0.03, level - 0.05 - noise(i) * 0.12, smooth(span(t, 0.05, 0.5)));
      piece.position.set(Math.cos(a) * rr, lift, Math.sin(a) * rr);
      piece.scale.copy(piece.userData.base).multiplyScalar((1 + open * 0.4) * (1 - open));
      piece.rotation.y = a + swirl;
    });
    v.potWet.forEach((piece, i) => {
      const a = noise(i + 31) * Math.PI * 2 + swirl * (0.5 + noise(i + 2) * 0.5);
      const rr = Math.sqrt(noise(i + 32)) * mix(0.3, 0.52, fill);
      const open = smooth(span(t, 0.25 + noise(i + 3) * 0.2, 0.7 + noise(i + 3) * 0.2));
      piece.visible = open > 0.02;
      piece.scale.copy(piece.userData.base).multiplyScalar(open);
      // Opened leaves drift up; about a third float on the surface.
      const floats = v.spec.wet.kind === "flower" || i % 3 === 0;
      piece.position.set(Math.cos(a) * rr, level + (floats ? 0.004 : -0.025 - noise(i) * 0.09), Math.sin(a) * rr);
      piece.rotation.y = a + swirl * 0.7 + i;
    });
    potRipples.forEach((ring, i) => {
      const p = (t * 3.2 + i / potRipples.length) % 1;
      ring.position.set(-0.18, -0.12, 0.004);
      ring.scale.setScalar(0.25 + p * 1.6);
      ring.material.opacity = (1 - p) * 0.35 * flow;
    });
    riseSteam(V(0, level + 0.09, 0), t, smooth(span(t, 0.2, 0.6)), 0.2, 1.1);
    accent.color.set(v.spec.accent);
    accent.position.set(0.5, 1.6, 0.6);
    accent.intensity = 1.2;
  }

  // Shot 3 — 倒茶: right hand lifts the pot, left index keeps the lid.
  const potRest = V(-0.62, 0.09, 0.06);
  const cupSpot = V(0.72, 0.085, 0.06);
  function pourShot(t, tea) {
    const v = showVariety(tea);
    pot.visible = lid.visible = cup.visible = dish.visible = jar.visible = true;
    capOnJar.visible = true;
    const pull = smooth(span(t, 0.05, 0.4)) * (1 - smooth(span(t, 0.78, 1)) * 0.5);
    placeCamera(
      V(-0.5, 2.05, 4.05).lerp(V(-0.62, 2.55, 5.2), pull),
      V(0.05, 0.8, 0).lerp(V(0.02, 1.08, 0), pull),
      32,
    );
    const tilt = track(t, [
      [0, 0],
      [0.1, 0],
      [0.34, -0.8],
      [0.7, -0.9],
      [0.9, 0],
    ]);
    const lift = smooth(span(t, 0.08, 0.3)) * (1 - smooth(span(t, 0.72, 0.94)));
    // Place the pot so its spout sits over the cup while tilted.
    const spoutLocal = V(1.21, 0.85, 0);
    const target = V(cupSpot.x - 0.24, 0.86, cupSpot.z);
    const c = Math.cos(tilt),
      s = Math.sin(tilt);
    const tilted = V(target.x - (spoutLocal.x * c - spoutLocal.y * s), target.y - (spoutLocal.x * s + spoutLocal.y * c), cupSpot.z);
    pot.position.copy(potRest.clone().lerp(tilted, lift));
    pot.rotation.set(0, 0, tilt);
    pot.updateMatrixWorld(true);
    lid.position.set(0, 0.79, 0);
    pot.add(lid);
    cup.position.copy(cupSpot);
    dish.position.set(1.52, 0.055, -0.78);
    jar.position.set(-1.55, 0.08, -1.25);
    jar.rotation.y = 0.35;
    // Tea leaves the spout once the pot tips far enough.
    const pouring = span(t, 0.28, 0.36) * (1 - span(t, 0.68, 0.76));
    const lip = pot.localToWorld(spoutLocal.clone());
    const along = pot.localToWorld(V(1.32, 0.95, 0)).sub(lip);
    const fill = smooth(span(t, 0.32, 0.74));
    setCupLevel(fill);
    setLiquor(cupLiquorMaterial, v.spec.liquor, 1);
    teaStreamMaterial.color.set(v.spec.liquor).multiplyScalar(0.9);
    teaStream.update(lip, along, cup.position.y + cupLiquor.position.y + 0.01, t, 0.022, pouring);
    cupRipples.forEach((ring, i) => {
      const p = (t * 4 + i / 3) % 1;
      ring.position.set(-0.06, -0.02, 0.003);
      ring.scale.setScalar(0.4 + p * 2.2);
      ring.material.opacity = (1 - p) * 0.4 * Math.max(pouring, span(t, 0.7, 0.8) * (1 - span(t, 0.8, 1)));
    });
    riseSteam(cup.position.clone().add(V(0, 0.55, 0)), t, fill, 0.1, 1.0);
    // Right hand: fingers through the loop, thumb on top of the handle.
    right.visible = true;
    const handle = {
      forward: V(0.04, -0.02, 1).transformDirection(pot.matrixWorld),
      dorsal: V(-1, 0.08, 0).transformDirection(pot.matrixWorld),
      mcp: pot.localToWorld(V(-0.9, 0.66, -0.13)),
    };
    right.setPose({
      ...grips.handle,
      forward: handle.forward,
      dorsal: handle.dorsal,
      anchor: { part: "index.mcp", world: handle.mcp },
      elbow: V(-2.2, 0.75, -1.7),
      shoulder: V(-1.4, 3.0, -3.3),
    });
    // Left hand: the index finger rests on the lid knob.
    left.visible = true;
    left.setPose({
      ...grips.lid,
      forward: V(-0.5, -0.46, 0.72),
      dorsal: V(0.15, 1, 0.25),
      anchor: { part: "index.pad", world: pot.localToWorld(V(0, 1.19, 0)) },
      elbow: V(1.8, 0.95, -1.9),
      shoulder: V(1.4, 3.0, -3.3),
    });
    rim.intensity = 0.7;
    rim.position.set(2, 2.5, -3);
    rim.target.position.set(0, 0.6, 0);
    accent.color.set(v.spec.accent);
    accent.position.set(1.2, 1.4, 0.4);
    accent.intensity = 0.6;
  }

  // Shot 4 — 奉茶: both hands set the cup down in front of the visitor.
  function serveShot(t, tea) {
    const v = showVariety(tea);
    cup.visible = dish.visible = jar.visible = true;
    capOnJar.visible = true;
    // The cup slides across the counter toward the visitor, both hands
    // guiding the saucer from behind, then lifting away.
    const carry = smoother(span(t, 0.02, 0.56));
    const cupAt = V(0, 0.085, mix(-0.7, 0.3, carry));
    cup.position.copy(cupAt);
    cup.rotation.y = mix(0.3, 0, carry);
    dish.position.set(1.42, 0.055, 0.18);
    jar.position.set(-2.05, 0.08, -0.35);
    jar.rotation.y = 0.5;
    placeCamera(V(0.05, 1.12, 3.2).lerp(V(0.03, 0.98, 2.72), smoother(t)), V(0, 0.46, 0.1).lerp(V(0, 0.52, 0.3), smooth(t)), 30);
    setCupLevel(1);
    setLiquor(cupLiquorMaterial, v.spec.liquor, 1);
    const settle = span(t, 0.5, 0.62) * (1 - span(t, 0.62, 0.9));
    cupRipples.forEach((ring, i) => {
      const p = (t * 3 + i / 3) % 1;
      ring.position.set(0, 0, 0.003);
      ring.scale.setScalar(0.3 + p * 2.4);
      ring.material.opacity = (1 - p) * 0.3 * Math.max(settle, carry * (1 - carry) * 2);
    });
    const release = smooth(span(t, 0.56, 0.7));
    const leave = smoother(span(t, 0.64, 0.92));
    for (const [hand, side] of [
      [right, -1],
      [left, 1],
    ]) {
      hand.visible = leave < 0.999;
      if (!hand.visible) continue;
      const grip = blendPose(grips.saucer, grips.relaxed, release);
      // Index pads rest on the far rim, a little to each side of the cup.
      const rim = cup.localToWorld(V(side * 0.47, 0.114, -0.49));
      rim.add(V(side * (0.08 * release + 0.4 * leave), 0.12 * release + 0.3 * leave, -0.18 * release - 1.3 * leave));
      hand.setPose({
        ...grip,
        forward: V(-side * 0.5, -0.32 + release * 0.2, 0.8),
        dorsal: V(side * 0.2, 1, 0.15),
        anchor: { part: "index.pad", world: rim },
        elbow: V(side * 1.6, 0.75, -2.3),
        shoulder: V(side * 1.45, 3.0, -3.5),
      });
    }
    const top = cup.position.clone().add(V(0, 0.56, 0));
    riseSteam(top, t, 1, 0.1, 1.05);
    // The aroma: each tea's own particles bloom once the cup is down.
    const bloom = smooth(span(t, 0.5, 0.8));
    const kind = v.spec.aroma.kind;
    v.aroma.forEach((particle, i) => {
      if (!particle) return;
      const start = 0.5 + noise(i + 3) * 0.35;
      const s = clamp01((t - start) / 0.6);
      particle.visible = s > 0 && s < 1;
      if (!particle.visible) return;
      const a = noise(i + 7) * Math.PI * 2 + s * 1.6;
      const radius = 0.16 + noise(i + 9) * 0.42 + s * 0.22;
      particle.position.set(
        top.x + Math.cos(a) * radius,
        top.y + 0.2 + s * (0.34 + noise(i) * 0.2),
        top.z + Math.sin(a) * radius * 0.5 - 0.05,
      );
      particle.rotation.set(s * 3 + i, s * 4, s * 2);
      const size = Math.sin(s * Math.PI);
      particle.scale.copy(particle.userData.base).multiplyScalar((kind === "mint" ? 0.9 : 1.25) * Math.min(1, size * 3));
    });
    const glint = v.spec.aroma.glint ?? v.spec.aroma.color;
    motes.forEach((mote, i) => {
      const sprite = kind === "honey" || kind === "ember" || (v.spec.aroma.glint && i % 2 === 0);
      const start = 0.45 + noise(i + 13) * 0.4;
      const s = clamp01((t - start) / (kind === "ember" ? 0.35 : 0.55));
      mote.visible = sprite && s > 0 && s < 1;
      if (!mote.visible) return;
      const a = noise(i + 17) * Math.PI * 2;
      const radius = 0.1 + noise(i + 19) * 0.4;
      mote.position.set(
        top.x + Math.cos(a) * radius + Math.sin(s * 9 + i) * 0.03,
        top.y + 0.18 + s * (kind === "ember" ? 0.62 : 0.42),
        top.z + Math.sin(a) * radius * 0.5 - 0.05,
      );
      const flicker = kind === "ember" ? 0.6 + 0.4 * Math.sin(s * 40 + i) : 1;
      mote.material.color.set(kind === "honey" || kind === "ember" ? v.spec.aroma.color : glint);
      mote.material.opacity = Math.sin(s * Math.PI) * flicker * (kind === "ember" ? 0.95 : 0.7);
      const size = kind === "ember" ? 0.03 : 0.045;
      mote.scale.set(size, size, 1);
    });
    smoke.forEach((wisp, i) => {
      const s = clamp01((t - 0.42 - i * 0.03) / 0.6);
      wisp.visible = kind === "smoke" && s > 0 && s < 1;
      if (!wisp.visible) return;
      wisp.position.set(top.x + Math.sin(s * 5 + i) * 0.2, top.y + 0.18 + s * 0.55, top.z - 0.05 + Math.cos(s * 4 + i) * 0.08);
      wisp.scale.set(0.22 + s * 0.4, 0.3 + s * 0.45, 1);
      wisp.material.color.set(v.spec.aroma.color);
      wisp.material.opacity = Math.sin(s * Math.PI) * 0.28;
    });
    accent.color.set(v.spec.accent);
    accent.position.set(0.4, 1.3, 0.9);
    accent.intensity = 0.4 + bloom * 1.2;
    rim.intensity = 0.8;
    rim.position.set(-1.8, 2.4, -3.2);
    rim.target.position.set(0, 0.5, 0.2);
  }

  // Where the scoop sits in the right hand: handle between thumb pad and the
  // side of the index finger, bowl beyond the fingertips.
  // A pen grip: the handle is pinched by the thumb and index pads, rests on
  // the side of the middle finger and runs back into the thumb web.
  function spoonInHand(pose) {
    const probe = right.solve(pose);
    const middle = probe.fingers[1];
    const middleSide = middle.joints[2]
      .clone()
      .add(new THREE.Vector3(0, 0, -1).applyQuaternion(middle.frames[1]).multiplyScalar(0.07))
      .add(new THREE.Vector3(0, 1, 0).applyQuaternion(middle.frames[1]).multiplyScalar(0.02));
    const tripod = anchorPoint(probe, "thumb.pad")
      .add(anchorPoint(probe, "index.pad"))
      .add(middleSide)
      .multiplyScalar(1 / 3);
    const web = probe.fingers[0].joints[0]
      .clone()
      .lerp(probe.thumb.joints[1], 0.5)
      .add(new THREE.Vector3(0, 0.07, 0));
    const along = tripod.clone().sub(web).normalize();
    const up = new THREE.Vector3(0, 1, 0).sub(along.clone().multiplyScalar(along.y)).normalize();
    const zAxis = along.clone().negate();
    const xAxis = up.clone().cross(zAxis).normalize();
    // Held at mid-handle; scoop units are world units, the hand is scaled.
    const origin = tripod.clone().add(along.clone().multiplyScalar(0.56 / handScale));
    return {
      axes: [xAxis, up, zAxis],
      origin,
      bowlModel: origin.clone().add(up.clone().multiplyScalar(0.02 / handScale)).toArray(),
    };
  }

  function setFrame(t, tea = "osmanthus") {
    hideAll();
    resetObjects();
    const frame = Math.round(clamp01(t) * (brewFilm.frames - 1));
    const shot = brewFilm.shots.find((s) => frame < s.to) ?? brewFilm.shots.at(-1);
    const local = (frame - shot.from) / (shot.to - shot.from - 1);
    if (shot.id === "scoop") scoopShot(local, tea);
    else if (shot.id === "infuse") infuseShot(local, tea);
    else if (shot.id === "pour") pourShot(local, tea);
    else serveShot(local, tea);
    return shot.id;
  }
  // The liquor-only pass: everything else only writes depth, so hands and the
  // stream hide the tea exactly where they cover it.
  function renderLiquorMask(renderer, t) {
    setFrame(t, "osmanthus");
    const states = new Map(),
      sprites = [];
    const background = scene.background;
    const clearColor = renderer.getClearColor(new THREE.Color()),
      clearAlpha = renderer.getClearAlpha();
    const fog = scene.fog;
    scene.traverse((object) => {
      if (object.isSprite) {
        sprites.push([object, object.visible]);
        object.visible = false;
      }
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!material || liquorMaterials.has(material) || states.has(material)) continue;
        states.set(material, [material.colorWrite, material.depthWrite, material.transparent]);
        material.colorWrite = false;
        material.depthWrite = true;
        material.transparent = false;
      }
    });
    const color = cupLiquorMaterial.color.clone(),
      map = cupLiquorMaterial.map,
      opacity = cupLiquorMaterial.opacity;
    scene.background = null;
    scene.fog = null;
    renderer.setClearColor(0x000000, 0);
    cupLiquorMaterial.map = neutralMap;
    cupLiquorMaterial.color.set("#ffffff");
    cupLiquorMaterial.opacity = 1;
    try {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/png");
    } finally {
      scene.background = background;
      scene.fog = fog;
      renderer.setClearColor(clearColor, clearAlpha);
      cupLiquorMaterial.color.copy(color);
      cupLiquorMaterial.map = map;
      cupLiquorMaterial.opacity = opacity;
      for (const [material, state] of states) [material.colorWrite, material.depthWrite, material.transparent] = state;
      for (const [sprite, visible] of sprites) sprite.visible = visible;
    }
  }
  return {
    root,
    setFrame,
    renderLiquorMask,
    hide() {
      root.visible = false;
    },
    drawLabel,
    glaze,
    label,
    varieties,
  };
}
