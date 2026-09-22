import * as THREE from "three";

// Thin folded surfaces, never capsules: dry fragments and opened wet leaves
// share the same tapered outline and branching veins. Fixed seeds keep frames stable.
const noise = (seed) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function createTeaLeaves() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#7b7655";
  ctx.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = i % 3 ? "#514d34" : "#9b9063";
    ctx.globalAlpha = 0.12 + noise(i) * 0.18;
    ctx.fillRect(noise(i + 1) * 256, noise(i + 2) * 128, 1, 2);
  }
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#aea071";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(256, 64);
  ctx.stroke();
  ctx.lineWidth = 0.65;
  for (let i = 0; i < 12; i++) {
    const x = 12 + i * 20;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x, 64);
      ctx.quadraticCurveTo(x + 13, 64 + side * 20, x + 34, 64 + side * 59);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const materials = ["#817653", "#605b3e", "#99906b", "#6d5138"].map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.94,
        bumpMap: texture,
        bumpScale: 0.0006,
      }),
  );
  const wetMaterials = materials.map((mat) => {
    const wet = mat.clone();
    wet.roughness = 0.48;
    return wet;
  });

  function leaf(seed, wet, parent, position = [0, 0, 0]) {
    const length = (wet ? 0.2 : 0.095) * (0.7 + noise(seed) * 0.9);
    const width = length * (wet ? 0.36 : 0.27 + noise(seed + 2) * 0.14);
    const fold = wet ? 0.006 : 0.014;
    const positions = [],
      uvs = [],
      indices = [];
    const rows = 14,
      columns = 4;
    for (let row = 0; row <= rows; row++) {
      const u = row / rows;
      const outline = Math.pow(Math.sin(Math.PI * u), 0.8);
      for (let column = 0; column <= columns; column++) {
        const v = column / columns,
          across = v * 2 - 1;
        // Unequal edges, occasional torn notches and a fold along the midrib.
        const edge = 0.87 + noise(seed + row * 3 + (across < 0 ? 7 : 41)) * 0.2;
        const notch = !wet && row === 4 + (seed % 6) && across > 0 ? 0.53 : 1;
        positions.push(
          (u - 0.5) * length,
          Math.sin(u * Math.PI) * fold * (0.24 + across * across) +
            across * Math.sin(u * 5 + seed) * fold * 0.4,
          across * width * 0.5 * outline * edge * notch +
            Math.sin(u * Math.PI) * length * 0.06,
        );
        uvs.push(u, v);
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const a = row * (columns + 1) + column,
          b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const object = new THREE.Mesh(
      geometry,
      (wet ? wetMaterials : materials)[seed % 4],
    );
    object.position.set(...position);
    object.rotation.y = noise(seed + 71) * Math.PI * 2;
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  return { leaf, noise };
}
