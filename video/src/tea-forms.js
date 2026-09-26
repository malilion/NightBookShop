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
        const honey = material("honey", () =>
          new THREE.MeshPhysicalMaterial({ color: "#e7a02f", roughness: 0.08, transmission: 0.35, thickness: 0.05, clearcoat: 1, emissive: colour("#6b3a08"), emissiveIntensity: 0.25 }),
        );
        const coat = mesh(geometry("honey-coat", () => new THREE.CylinderGeometry(0.033, 0.036, 0.07, 18)), honey);
        coat.rotation.z = Math.PI / 2;
        coat.position.x = -0.1;
        dipper.add(coat);
        const drop = mesh(geometry("honey-drop", () => new THREE.SphereGeometry(0.02, 14, 10)), honey);
        drop.position.set(-0.11, -0.03, 0);
        drop.scale.set(1, 1.3, 1);
        dipper.add(drop);
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

  return { dry, wet, dish, aroma, extra, leaf, floret };
}
