// Per-tea leaf and botanical forms for the brew films: rolled oolong, jasmine
// pearls, pressed pu'er flakes, wiry black tea, crumpled mint, chamomile
// heads, lavender buds, roasted hojicha twigs and the fresh sprigs beside the
// cup. Seeded, so every render of a frame is identical.
import * as THREE from "three";

export const noise = (seed) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const colour = (hex) => new THREE.Color(hex);

export function createTeaForms() {
  const materials = new Map();
  function material(key, make) {
    if (!materials.has(key)) materials.set(key, make());
    return materials.get(key);
  }
  const dryMaterial = (hex) =>
    material(`dry-${hex}`, () => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.92 }));
  const wetMaterial = (hex) =>
    material(
      `wet-${hex}`,
      () =>
        new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, side: THREE.DoubleSide }),
    );
  const petalMaterial = (hex, glow = 0) =>
    material(`petal-${hex}-${glow}`, () =>
      new THREE.MeshPhysicalMaterial({
        color: hex,
        roughness: 0.62,
        sheen: 0.6,
        sheenColor: colour("#ffffff"),
        emissive: colour(hex),
        emissiveIntensity: glow,
        side: THREE.DoubleSide,
      }),
    );
  const vertexMaterial = (key, extra = {}) =>
    material(`vertex-${key}`, () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, ...extra }));

  const geometries = new Map();
  function geometry(key, make) {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key);
  }
  function paint(geometry, fn) {
    const p = geometry.attributes.position;
    const colors = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      fn(c, p.getX(i), p.getY(i), p.getZ(i), i);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }
  const mesh = (g, m) => {
    const object = new THREE.Mesh(g, m);
    object.castShadow = true;
    object.receiveShadow = true;
    return object;
  };

  // ------------------------------------------------------------ dry forms
  // Rolled oolong and jasmine pearls: lumpy balls with a twisted seam.
  function pellet(seed, colors, pearl) {
    const g = geometry(`pellet-${pearl}-${seed % 7}`, () => {
      const s = new THREE.SphereGeometry(1, 14, 10);
      const p = s.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const twist = Math.atan2(v.z, v.x) * 2 + v.y * (pearl ? 5 : 3) + seed;
        const lump = 1 + (noise(seed * 13 + i * 0.37) - 0.5) * (pearl ? 0.08 : 0.2);
        const groove = 1 - (pearl ? 0.05 : 0.1) * Math.pow(Math.abs(Math.sin(twist)), 6);
        v.multiplyScalar(lump * groove);
        p.setXYZ(i, v.x, v.y, v.z);
      }
      s.computeVertexNormals();
      return paint(s, (c, x, y, z) => {
        const ridge = Math.abs(Math.sin(Math.atan2(z, x) * 2 + y * 3 + seed));
        c.set(colors[seed % 3]).lerp(colour(colors[3]), ridge * (pearl ? 0.5 : 0.35));
      });
    });
    const m = mesh(
      g,
      pearl
        ? material("pearl", () =>
            new THREE.MeshPhysicalMaterial({
              vertexColors: true,
              roughness: 0.78,
              sheen: 0.8,
              sheenColor: colour("#f4f2e4"),
              sheenRoughness: 0.4,
            }),
          )
        : vertexMaterial("pellet"),
    );
    const size = pearl ? 0.036 + noise(seed + 3) * 0.008 : 0.042 + noise(seed + 3) * 0.016;
    m.scale.set(size * (1.1 + noise(seed + 5) * 0.25), size * 0.82, size);
    m.rotation.set(noise(seed + 1) * 6, noise(seed + 2) * 6, noise(seed + 4) * 6);
    return m;
  }
  // Pressed pu'er: flat, irregular, dark flakes broken from a cake.
  function flake(seed, colors) {
    const g = geometry(`flake-${seed % 9}`, () => {
      const b = new THREE.BoxGeometry(1, 1, 1, 3, 1, 3);
      const p = b.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        const n = noise(seed * 7 + Math.round((x + 1) * 5) * 3 + Math.round((z + 1) * 5) * 11);
        p.setXYZ(i, x * (0.75 + n * 0.5), y * (0.8 + n * 0.5), z * (0.75 + noise(n * 91) * 0.5));
      }
      b.computeVertexNormals();
      return paint(b, (c, x, y, z, i) => c.set(colors[(seed + i) % 4]).multiplyScalar(0.85 + noise(i + seed) * 0.3));
    });
    const m = mesh(g, vertexMaterial("flake", { roughness: 0.97 }));
    const s = 0.07 + noise(seed + 2) * 0.05;
    m.scale.set(s, s * 0.28, s * (0.7 + noise(seed + 6) * 0.4));
    m.rotation.set((noise(seed) - 0.5) * 0.8, noise(seed + 1) * 6, (noise(seed + 9) - 0.5) * 0.8);
    return m;
  }
  // Wiry black tea: a thin twisted strip, some with golden tips.
  function strip(seed, colors, golden) {
    const g = geometry(`strip-${golden}-${seed % 8}`, () => {
      const points = [];
      for (let i = 0; i < 5; i++)
        points.push(
          new THREE.Vector3(
            i * 0.028,
            (noise(seed * 3 + i) - 0.5) * 0.02,
            (noise(seed * 5 + i) - 0.5) * 0.026,
          ),
        );
      const curve = new THREE.CatmullRomCurve3(points);
      const t = new THREE.TubeGeometry(curve, 18, 0.0075, 6, false);
      const p = t.attributes.position;
      // Flatten and twist the section so it reads as a rolled leaf, not a wire.
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const along = x / 0.112;
        const centre = curve.getPoint(Math.min(1, Math.max(0, along)));
        const dy = p.getY(i) - centre.y,
          dz = p.getZ(i) - centre.z;
        const a = along * 5 + seed;
        const ry = dy * Math.cos(a) - dz * Math.sin(a) * 0.55,
          rz = dy * Math.sin(a) + dz * Math.cos(a) * 0.55;
        const taper = 0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, Math.max(0, along)));
        p.setXYZ(i, x, centre.y + ry * taper, centre.z + rz * taper);
      }
      t.computeVertexNormals();
      return paint(t, (c, x) => {
        c.set(colors[seed % 3]);
        if (golden) c.lerp(colour(colors[3]), Math.max(0, (x / 0.112 - 0.55) / 0.45));
      });
    });
    const m = mesh(g, vertexMaterial("strip", { roughness: 0.8 }));
    const s = 0.9 + noise(seed + 4) * 0.5;
    m.scale.setScalar(s);
    m.rotation.set(noise(seed) * 6, noise(seed + 1) * 6, noise(seed + 2) * 6);
    return m;
  }
  // A thin, folded leaf surface; dry leaves are small and curled, wet ones open.
  function leafGeometry(seed, length, width, fold, serrated) {
    const rows = 18,
      columns = 6;
    const positions = [],
      indices = [];
    for (let row = 0; row <= rows; row++) {
      const u = row / rows;
      const outline = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.75);
      for (let column = 0; column <= columns; column++) {
        const across = (column / columns) * 2 - 1;
        const tooth = serrated ? 1 - 0.12 * Math.abs(Math.sin(u * 42 + seed)) : 1;
        const edge = (0.88 + noise(seed + row * 3 + (across < 0 ? 7 : 41)) * 0.18) * tooth;
        positions.push(
          (u - 0.5) * length,
          Math.sin(u * Math.PI) * fold * (0.2 + across * across) + across * Math.sin(u * 5 + seed) * fold * 0.35 * outline,
          across * width * 0.5 * outline * edge,
        );
      }
    }
    for (let row = 0; row < rows; row++)
      for (let column = 0; column < columns; column++) {
        const a = row * (columns + 1) + column,
          b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  function leaf(seed, hex, { wet = false, length = 0.09, fold = 0.014, serrated = false } = {}) {
    const key = `leaf-${wet}-${serrated}-${seed % 6}-${Math.round(length * 1000)}-${Math.round(fold * 1000)}`;
    const g = geometry(key, () => leafGeometry(seed, length, length * (serrated ? 0.62 : 0.38), fold, serrated));
    const m = mesh(
      g,
      wet
        ? wetMaterial(hex)
        : material(`leaf-${hex}`, () => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.9, side: THREE.DoubleSide })),
    );
    m.rotation.set((noise(seed) - 0.5) * 1.2, noise(seed + 1) * 6, (noise(seed + 2) - 0.5) * 1.2);
    m.scale.setScalar(0.8 + noise(seed + 3) * 0.45);
    return m;
  }
  function twig(seed, hex = "#6d3f22") {
    const g = geometry("twig", () => new THREE.CylinderGeometry(0.0055, 0.0065, 0.1, 6, 3));
    const m = mesh(g, dryMaterial(hex));
    m.scale.set(1, 0.6 + noise(seed) * 0.7, 1);
    m.rotation.set(Math.PI / 2 + (noise(seed + 1) - 0.5), noise(seed + 2) * 6, (noise(seed + 3) - 0.5));
    return m;
  }
  // Chamomile: a golden dome ringed with drooping cream petals.
  function chamomile(seed, fresh) {
    const group = new THREE.Group();
    const dome = mesh(
      geometry("chamomile-dome", () => new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
      petalMaterial(fresh ? "#f0bd2e" : "#d59f35"),
    );
    dome.scale.set(0.021, 0.017, 0.021);
    group.add(dome);
    const petals = fresh ? 16 : 13;
    for (let i = 0; i < petals; i++) {
      const petal = mesh(geometry("petal", () => new THREE.SphereGeometry(1, 10, 6)), petalMaterial(fresh ? "#fbf8ef" : "#eadfbd"));
      const a = (i / petals) * Math.PI * 2 + noise(seed + i) * 0.2;
      const reach = fresh ? 0.034 : 0.026;
      petal.scale.set(reach * 0.62, 0.0025, fresh ? 0.0075 : 0.0065);
      petal.position.set(Math.cos(a) * reach * 0.8, fresh ? 0.002 : -0.006, Math.sin(a) * reach * 0.8);
      petal.rotation.set(0, -a, fresh ? -0.1 : -0.55);
      group.add(petal);
    }
    group.rotation.set((noise(seed) - 0.5) * 0.8, noise(seed + 1) * 6, (noise(seed + 2) - 0.5) * 0.8);
    return group;
  }
  // Osmanthus florets: four tiny rounded petals, orange-gold.
  function floret(seed, glow = 0) {
    const group = new THREE.Group();
    const hue = noise(seed + 8) > 0.5 ? "#f2a33a" : "#e8912c";
    for (let i = 0; i < 4; i++) {
      const petal = mesh(geometry("petal", () => new THREE.SphereGeometry(1, 10, 6)), petalMaterial(hue, glow));
      const a = (i / 4) * Math.PI * 2 + seed;
      petal.scale.set(0.0095, 0.003, 0.0075);
      petal.position.set(Math.cos(a) * 0.007, 0, Math.sin(a) * 0.007);
      petal.rotation.set(0, -a, 0.35);
      group.add(petal);
    }
    group.rotation.set(noise(seed) * 6, noise(seed + 1) * 6, noise(seed + 2) * 6);
    return group;
  }
  function jasmine(seed, glow = 0) {
    const group = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const petal = mesh(geometry("petal", () => new THREE.SphereGeometry(1, 10, 6)), petalMaterial("#f8f4e8", glow));
      const a = (i / 6) * Math.PI * 2 + noise(seed) * 0.4;
      petal.scale.set(0.024, 0.0028, 0.0095);
      petal.position.set(Math.cos(a) * 0.02, 0.003, Math.sin(a) * 0.02);
      petal.rotation.set(0, -a, 0.18);
      group.add(petal);
    }
    const heart = mesh(geometry("heart", () => new THREE.SphereGeometry(0.006, 8, 6)), petalMaterial("#d9d48a"));
    heart.position.y = 0.005;
    group.add(heart);
    group.rotation.set((noise(seed) - 0.5) * 0.9, noise(seed + 1) * 6, (noise(seed + 2) - 0.5) * 0.9);
    return group;
  }
  function bud(seed, glow = 0) {
    const m = mesh(geometry("bud", () => new THREE.SphereGeometry(1, 10, 8)), petalMaterial(noise(seed) > 0.4 ? "#7c5fae" : "#8f6bb8", glow));
    m.scale.set(0.0085, 0.017, 0.0085);
    m.rotation.set(noise(seed) * 6, noise(seed + 1) * 6, noise(seed + 2) * 6);
    return m;
  }
  function cornflower(seed) {
    const m = mesh(geometry("petal", () => new THREE.SphereGeometry(1, 10, 6)), petalMaterial("#3f63bd"));
    m.scale.set(0.014, 0.002, 0.008);
    m.rotation.set(noise(seed) * 6, noise(seed + 1) * 6, noise(seed + 2) * 6);
    return m;
  }
  function freshMintLeaf(seed, length = 0.12) {
    const g = geometry(`mint-${seed % 5}-${Math.round(length * 1000)}`, () => {
      const leafShape = leafGeometry(seed, length, length * 0.62, length * 0.1, true);
      return paint(leafShape, (c, x, y, z) => {
        const vein = Math.abs(z) < 0.004 || Math.abs(Math.sin((x - Math.abs(z) * 1.2) * 90)) > 0.97;
        c.set("#5d9a47").lerp(colour("#9ccf7c"), vein ? 0.45 : 0);
      });
    });
    const m = mesh(
      g,
      material("mint-fresh", () =>
        new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, sheen: 0.4, sheenColor: colour("#dff5d0"), side: THREE.DoubleSide }),
      ),
    );
    m.rotation.set((noise(seed) - 0.5) * 0.6, noise(seed + 1) * 6, (noise(seed + 2) - 0.5) * 0.6);
    return m;
  }

  // One dry piece of a tea, as it sits in the caddy and the spoon.
  function dry(spec, seed) {
    const pick = noise(seed * 3.7 + 11);
    if (spec.mix) {
      if (spec.mix.second && pick > 1 - spec.mix.second.share) return extra(spec.mix.second.kind, seed);
      if (pick < spec.mix.share) return extra(spec.mix.kind, seed);
    }
    const colors = spec.leafColors;
    switch (spec.leaf) {
      case "pellet":
        return pellet(seed, colors, false);
      case "pearl":
        return pellet(seed, colors, true);
      case "chunk":
        return flake(seed, colors);
      case "strip":
        return strip(seed, colors, Boolean(spec.goldenTips) && noise(seed + 17) > 0.55);
      case "crumple":
        return leaf(seed, colors[seed % 4], { length: 0.07, fold: 0.022, serrated: true });
      case "flower":
        return chamomile(seed, false);
      case "roasted":
        return leaf(seed, colors[seed % 4], { length: 0.085, fold: 0.012 });
      default:
        throw new Error(`Unknown leaf form ${spec.leaf}`);
    }
  }
  function extra(kind, seed, glow = 0) {
    switch (kind) {
      case "floret":
        return floret(seed, glow);
      case "jasmine":
        return jasmine(seed, glow);
      case "bud":
        return bud(seed, glow);
      case "cornflower":
        return cornflower(seed);
      case "twig":
        return twig(seed);
      case "mint":
        return freshMintLeaf(seed, 0.07);
      case "chamomile":
        return chamomile(seed, true);
      default:
        throw new Error(`Unknown extra ${kind}`);
    }
  }
  // How the tea looks once the water has opened it.
  function wet(spec, seed) {
    const pick = noise(seed * 5.1 + 3);
    if (spec.mix && pick < spec.mix.share) return extra(spec.mix.kind, seed);
    if (spec.wet.kind === "flower") return chamomile(seed, true);
    if (spec.wet.kind === "mint") return freshMintLeaf(seed, 0.1 + noise(seed) * 0.04);
    return leaf(seed, spec.wet.color, { wet: true, length: 0.16 + noise(seed) * 0.06, fold: 0.006 });
  }

  // The side dish: what the tea is made of, fresh or as it came from the tin.
  // A walnut honey dipper along x: grooved head at -x, handle towards +x,
  // the head coated in honey with a bead hanging below it.
  const honeyMaterial = () =>
    material("honey", () =>
      new THREE.MeshPhysicalMaterial({ color: "#e7a02f", roughness: 0.08, transmission: 0.35, thickness: 0.05, clearcoat: 1, emissive: colour("#6b3a08"), emissiveIntensity: 0.25 }),
    );
  function honeyDipper(bead = true) {
    const dipper = new THREE.Group();
    const wood = material("dipper", () => new THREE.MeshStandardMaterial({ color: "#8a5a32", roughness: 0.55 }));
    const handle = mesh(geometry("dipper-handle", () => new THREE.CylinderGeometry(0.012, 0.015, 0.36, 12)), wood);
    handle.rotation.z = Math.PI / 2;
    handle.position.x = 0.12;
    dipper.add(handle);
    for (let i = 0; i < 4; i++) {
      const ridge = mesh(geometry("dipper-ridge", () => new THREE.TorusGeometry(0.028, 0.009, 8, 20)), wood);
      ridge.rotation.y = Math.PI / 2;
      ridge.position.x = -0.07 - i * 0.022;
      dipper.add(ridge);
    }
    const coat = mesh(geometry("honey-coat", () => new THREE.CylinderGeometry(0.033, 0.036, 0.07, 18)), honeyMaterial());
    coat.rotation.z = Math.PI / 2;
    coat.position.x = -0.1;
    dipper.add(coat);
    if (bead) {
      const drop = mesh(geometry("honey-drop", () => new THREE.SphereGeometry(0.02, 14, 10)), honeyMaterial());
      drop.position.set(-0.11, -0.03, 0);
      drop.scale.set(1, 1.3, 1);
      dipper.add(drop);
    }
    return dipper;
  }

  // ------------------------------------------------------------ garnishes
  // What the story lets Lin Cheng add to a pot: a dried apple ring, a lemon
  // wheel, a cube of sea-salt caramel or honey from a dipper. Slices are thin
  // extrusions with a painted face; the face canvas spans [-span, span].
  function faceTexture(key, span, draw) {
    return material(`face-${key}`, () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      // Draw in the slice's own units, y up, as the geometry's cap UVs are.
      ctx.translate(size / 2, size / 2);
      ctx.scale(size / (2 * span), -size / (2 * span));
      draw(ctx);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.repeat.set(1 / (2 * span), 1 / (2 * span));
      texture.offset.set(0.5, 0.5);
      return texture;
    });
  }
  function sliceGeometry(key, edge, hole, thickness) {
    return geometry(`slice-${key}`, () => {
      const outline = (path, radius, steps, reverse) => {
        for (let i = 0; i <= steps; i++) {
          const a = ((reverse ? -i : i) / steps) * Math.PI * 2;
          const r = radius(a);
          if (i === 0) path.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else path.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
      };
      const shape = new THREE.Shape();
      outline(shape, edge, 120, false);
      if (hole) {
        const path = new THREE.Path();
        outline(path, hole, 48, true);
        shape.holes.push(path);
      }
      const bevel = thickness * 0.3;
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: thickness - 2 * bevel,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 2,
        curveSegments: 1,
      });
      g.translate(0, 0, -(thickness - 2 * bevel) / 2);
      // Lie flat, face up.
      g.rotateX(-Math.PI / 2);
      return g;
    });
  }
  const appleEdge = (a) => 0.13 * (1 + 0.035 * Math.sin(5 * a + 0.7) + 0.02 * Math.sin(11 * a + 2.1) + 0.012 * Math.sin(23 * a));
  const appleHole = (a) => 0.03 * (1 + 0.12 * Math.sin(3 * a + 1));
  function appleRing() {
    const face = faceTexture("apple", 0.14, (c) => {
      const path = (radius, steps = 120) => {
        c.beginPath();
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          c.lineTo(Math.cos(a) * radius(a), Math.sin(a) * radius(a));
        }
        c.closePath();
      };
      // Pale dried flesh, warmer and darker toward the peel.
      const flesh = c.createRadialGradient(0, 0, 0.02, 0, 0, 0.13);
      flesh.addColorStop(0, "#f1dcaa");
      flesh.addColorStop(0.6, "#e6c083");
      flesh.addColorStop(1, "#d3a262");
      c.fillStyle = flesh;
      c.fillRect(-0.14, -0.14, 0.28, 0.28);
      // Wrinkles run out from the core as the ring dried.
      for (let i = 0; i < 70; i++) {
        const a = noise(i + 3) * Math.PI * 2,
          r0 = 0.05 + noise(i + 5) * 0.03,
          r1 = r0 + 0.03 + noise(i + 7) * 0.05;
        c.strokeStyle = `rgba(150, 92, 40, ${0.12 + noise(i + 9) * 0.2})`;
        c.lineWidth = 0.0015 + noise(i + 11) * 0.002;
        c.beginPath();
        c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        c.quadraticCurveTo(Math.cos(a + 0.08) * (r0 + r1) / 2, Math.sin(a + 0.08) * (r0 + r1) / 2, Math.cos(a) * r1, Math.sin(a) * r1);
        c.stroke();
      }
      // The five-lobed seed star around the cored centre.
      c.fillStyle = "rgba(176, 116, 52, 0.55)";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.4;
        c.beginPath();
        c.ellipse(Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0.022, 0.009, a, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "rgba(160, 104, 46, 0.5)";
      c.lineWidth = 0.002;
      path((a) => 0.058 + 0.008 * Math.sin(5 * a + 0.4));
      c.stroke();
      // Red-brown peel around the rim.
      c.strokeStyle = "#7e2a1c";
      c.lineWidth = 0.014;
      path((a) => appleEdge(a) + 0.002);
      c.stroke();
      c.strokeStyle = "#b7783b";
      c.lineWidth = 0.005;
      path((a) => appleEdge(a) - 0.008);
      c.stroke();
      for (let i = 0; i < 160; i++) {
        const a = noise(i + 40) * Math.PI * 2,
          r = 0.03 + Math.sqrt(noise(i + 41)) * 0.09;
        c.fillStyle = `rgba(120, 70, 30, ${noise(i + 42) * 0.25})`;
        c.fillRect(Math.cos(a) * r, Math.sin(a) * r, 0.002, 0.002);
      }
    });
    const faceMaterial = material("apple-face", () => new THREE.MeshStandardMaterial({ map: face, roughness: 0.8 }));
    const peel = material("apple-peel", () => new THREE.MeshStandardMaterial({ color: "#8a3c24", roughness: 0.7 }));
    return mesh(sliceGeometry("apple", appleEdge, appleHole, 0.012), [faceMaterial, peel]);
  }
  function lemonWheel() {
    const face = faceTexture("lemon", 0.13, (c) => {
      const disc = (r, fill) => {
        c.fillStyle = fill;
        c.beginPath();
        c.arc(0, 0, r, 0, Math.PI * 2);
        c.fill();
      };
      disc(0.13, "#e2ae22");
      disc(0.118, "#f2c93c");
      disc(0.11, "#fbf1cf");
      const segments = 9;
      for (let i = 0; i < segments; i++) {
        const a0 = (i / segments) * Math.PI * 2 + 0.035,
          a1 = ((i + 1) / segments) * Math.PI * 2 - 0.035;
        const pulp = c.createRadialGradient(0, 0, 0.01, 0, 0, 0.1);
        pulp.addColorStop(0, "#fbef9e");
        pulp.addColorStop(1, "#f2d24f");
        c.fillStyle = pulp;
        c.beginPath();
        c.moveTo(Math.cos((a0 + a1) / 2) * 0.016, Math.sin((a0 + a1) / 2) * 0.016);
        c.arc(0, 0, 0.1, a0, a1);
        c.closePath();
        c.fill();
        // Juice vesicles, long and radial.
        for (let j = 0; j < 26; j++) {
          const a = a0 + noise(i * 31 + j) * (a1 - a0),
            r = 0.025 + noise(i * 31 + j + 7) * 0.07;
          c.strokeStyle = `rgba(255, 250, 215, ${0.25 + noise(i * 31 + j + 3) * 0.35})`;
          c.lineWidth = 0.0022;
          c.beginPath();
          c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          c.lineTo(Math.cos(a) * (r + 0.012), Math.sin(a) * (r + 0.012));
          c.stroke();
        }
      }
      disc(0.016, "#fdf3d2");
      // Two pale seeds near the centre.
      c.fillStyle = "#efe0ad";
      for (const a of [0.9, 3.6]) {
        c.beginPath();
        c.ellipse(Math.cos(a) * 0.035, Math.sin(a) * 0.035, 0.011, 0.005, a, 0, Math.PI * 2);
        c.fill();
      }
    });
    const faceMaterial = material("lemon-face", () =>
      new THREE.MeshPhysicalMaterial({ map: face, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: colour("#f5dc6a"), emissiveIntensity: 0.06 }),
    );
    const rind = material("lemon-rind", () => new THREE.MeshStandardMaterial({ color: "#e8b92f", roughness: 0.42 }));
    return mesh(sliceGeometry("lemon", () => 0.126, null, 0.013), [faceMaterial, rind]);
  }
  // A soft-edged cube of caramel with flakes of sea salt on top.
  function caramel() {
    const group = new THREE.Group();
    const g = geometry("caramel", () => {
      const half = 0.065,
        round = 0.018;
      const box = new THREE.BoxGeometry(2 * half, 1.6 * half, 2 * half, 6, 6, 6);
      const p = box.attributes.position;
      const v = new THREE.Vector3(),
        inner = new THREE.Vector3();
      const limit = new THREE.Vector3(half - round, 0.8 * half - round, half - round);
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        inner.copy(v).clamp(limit.clone().negate(), limit);
        const out = v.clone().sub(inner);
        if (out.lengthSq() > 0) v.copy(inner).add(out.normalize().multiplyScalar(round));
        p.setXYZ(i, v.x, v.y, v.z);
      }
      box.computeVertexNormals();
      return box;
    });
    group.add(
      mesh(
        g,
        material("caramel", () =>
          new THREE.MeshPhysicalMaterial({ color: "#a4652f", roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12, emissive: colour("#4a2206"), emissiveIntensity: 0.2 }),
        ),
      ),
    );
    const salt = material("salt", () => new THREE.MeshStandardMaterial({ color: "#f7f4ee", roughness: 0.35 }));
    const flakes = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const flake = mesh(geometry("salt-flake", () => new THREE.BoxGeometry(1, 1, 1)), salt);
      flake.scale.set(0.012 + noise(i + 71) * 0.01, 0.004, 0.009 + noise(i + 72) * 0.008);
      flake.position.set((noise(i + 73) - 0.5) * 0.09, 0.053, (noise(i + 74) - 0.5) * 0.09);
      flake.rotation.set((noise(i + 75) - 0.5) * 0.5, noise(i + 76) * 3, (noise(i + 77) - 0.5) * 0.5);
      flakes.add(flake);
    }
    flakes.name = "salt";
    group.add(flakes);
    return group;
  }
  // One garnish, lying as it would on a saucer: slices flat, the dipper
  // along x with its head at -x.
  function garnish(kind) {
    switch (kind) {
      case "apple":
        return appleRing();
      case "lemon":
        return lemonWheel();
      case "caramel":
        return caramel();
      case "honey":
        return honeyDipper();
      default:
        throw new Error(`Unknown garnish ${kind}`);
    }
  }

  function dish(spec) {
    const group = new THREE.Group();
    const add = (object, x, y, z) => {
      object.position.set(x, y, z);
      group.add(object);
      return object;
    };
    const scatter = (count, make, radius, y = 0.1) => {
      for (let i = 0; i < count; i++) {
        const a = i * 2.39996;
        const r = Math.sqrt((i + 0.5) / count) * radius;
        add(make(i), Math.cos(a) * r, y + noise(i * 7) * 0.012, Math.sin(a) * r * 0.9);
      }
    };
    switch (spec.dish) {
      case "osmanthus": {
        const stem = add(twig(3, "#5b3b22"), 0.02, 0.12, 0);
        stem.scale.set(1.2, 2.4, 1.2);
        stem.rotation.set(Math.PI / 2, 0.4, 0);
        for (const [i, x, z] of [[1, -0.1, 0.06], [2, 0.13, -0.05]]) {
          const l = add(leaf(i + 40, "#2f4a2a", { length: 0.2, fold: 0.01 }), x, 0.13, z);
          l.material = wetMaterial("#2f4a2a");
        }
        scatter(34, (i) => floret(i + 60), 0.2, 0.13);
        break;
      }
      case "cake": {
        const cake = add(
          mesh(
            geometry("cake", () => {
              const g = new THREE.CylinderGeometry(0.34, 0.36, 0.1, 40, 2, false, 0, Math.PI * 0.55);
              const p = g.attributes.position;
              for (let i = 0; i < p.count; i++) {
                const n = noise(i * 1.7);
                p.setY(i, p.getY(i) * (0.85 + n * 0.3));
              }
              g.computeVertexNormals();
              return paint(g, (c, x, y, z, i) => c.set(["#3a2417", "#4c2e1b", "#2c1a10", "#5d3b21"][i % 4]));
            }),
            vertexMaterial("cake", { roughness: 0.96 }),
          ),
          -0.14,
          0.17,
          -0.1,
        );
        cake.rotation.set(0.12, 0.6, 0.05);
        scatter(9, (i) => flake(i + 30, spec.leafColors), 0.2, 0.12);
        break;
      }
      case "mint": {
        const stem = add(twig(5, "#5f7d3c"), 0, 0.13, 0);
        stem.scale.set(1.3, 2.6, 1.3);
        stem.rotation.set(Math.PI / 2, -0.5, 0);
        for (let i = 0; i < 7; i++) {
          const along = (i - 3) * 0.042;
          const side = i % 2 ? 1 : -1;
          const l = add(freshMintLeaf(i + 12, 0.13 - Math.abs(i - 3) * 0.012), along * 0.9 + side * 0.03, 0.14 + i * 0.002, along * -0.5 + side * 0.06);
          l.rotation.y = -0.5 + side * 1.1;
        }
        break;
      }
      case "jasmine": {
        for (let i = 0; i < 6; i++) {
          const a = i * 2.2;
          add(jasmine(i + 70), Math.cos(a) * 0.12, 0.125 + (i % 2) * 0.01, Math.sin(a) * 0.1);
        }
        const l = add(leaf(81, "#3d5a31", { length: 0.18, fold: 0.01 }), -0.02, 0.12, 0.08);
        l.material = wetMaterial("#3d5a31");
        scatter(10, (i) => pellet(i + 90, spec.leafColors, true), 0.2, 0.12);
        break;
      }
      case "honey": {
        // A walnut honey dipper resting on the dish, a bead of honey at its tip.
        const dipper = honeyDipper();
        add(dipper, 0.02, 0.15, 0).rotation.set(0.1, 0.5, 0.12);
        scatter(12, (i) => strip(i + 50, spec.leafColors, i % 3 === 0), 0.18, 0.12);
        break;
      }
      case "chamomile":
        for (let i = 0; i < 5; i++) {
          const a = i * 2.5;
          const flower = add(chamomile(i + 20, true), Math.cos(a) * 0.12, 0.13 + (i % 2) * 0.012, Math.sin(a) * 0.1);
          flower.scale.setScalar(1.7);
        }
        scatter(8, (i) => chamomile(i + 40, false), 0.2, 0.12);
        break;
      case "lavender":
        for (let s = 0; s < 3; s++) {
          const sprig = new THREE.Group();
          const stem = mesh(geometry("lavender-stem", () => new THREE.CylinderGeometry(0.004, 0.005, 0.42, 5)), dryMaterial("#6f7f4f"));
          stem.rotation.z = Math.PI / 2;
          sprig.add(stem);
          for (let i = 0; i < 22; i++) {
            const b = bud(i + s * 40);
            b.position.set(-0.21 + (i / 22) * 0.13, Math.sin(i * 2.1) * 0.012, Math.cos(i * 2.1) * 0.012);
            b.scale.multiplyScalar(1.15);
            sprig.add(b);
          }
          add(sprig, 0.03, 0.135 + s * 0.012, (s - 1) * 0.07).rotation.set(0.1, 0.5 - s * 0.18, 0.05);
        }
        scatter(10, (i) => strip(i + 60, spec.leafColors, false), 0.18, 0.12);
        break;
      case "roast":
        scatter(16, (i) => (i % 3 ? leaf(i + 20, spec.leafColors[i % 4], { length: 0.085, fold: 0.012 }) : twig(i + 20)), 0.2, 0.12);
        break;
      default:
        throw new Error(`Unknown dish ${spec.dish}`);
    }
    return group;
  }

  // One aroma particle; smoke, honey motes and embers are drawn as sprites.
  function aroma(spec, seed) {
    switch (spec.aroma.kind) {
      case "floret":
        return floret(seed, 0.35);
      case "jasmine":
        return jasmine(seed, 0.25);
      case "chamomile": {
        const petal = mesh(geometry("petal", () => new THREE.SphereGeometry(1, 10, 6)), petalMaterial("#fbf6e8", 0.25));
        petal.scale.set(0.02, 0.0025, 0.0065);
        return petal;
      }
      case "lavender":
        return bud(seed, 0.3);
      case "mint": {
        const l = freshMintLeaf(seed, 0.07);
        return l;
      }
      default:
        return null;
    }
  }

  return { dry, wet, dish, aroma, extra, leaf, floret, garnish, honeyDipper, honeyMaterial };
}
