import * as THREE from "three";

// A restrained photographic softbox environment: one broad window, one rim strip.
export function studioEnvironment(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#444849");
  const cards = [];
  for (const [size, position, color, intensity] of [
    [[4, 6], [-4, 5, 4], "#fff1dc", 2.8],
    [[1.3, 5], [5, 3, -3], "#c4d7de", 1.6],
    [[5, 3], [0, 7, -1], "#ffffff", 1.2],
  ]) {
    const material = new THREE.MeshBasicMaterial({ color });
    material.color.multiplyScalar(intensity);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
    card.position.set(...position);
    card.lookAt(0, 0, 0);
    cards.push(card);
    scene.add(card);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const map = pmrem.fromScene(scene, 0.08);
  pmrem.dispose();
  for (const card of cards) {
    card.geometry.dispose();
    card.material.dispose();
  }
  return map;
}

export function hammeredTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#8b8b8b";
  ctx.fillRect(0, 0, 512, 512);
  let seed = 84;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = -16; y < 544; y += 17) {
    for (let x = -16; x < 544; x += 19) {
      const px = x + random() * 8,
        py = y + random() * 8;
      const radius = 7 + random() * 5;
      const g = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, radius);
      g.addColorStop(0, "#696969");
      g.addColorStop(0.75, "#939393");
      g.addColorStop(1, "#8b8b8b");
      ctx.fillStyle = g;
      ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

export function teaTexture(neutral = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  // Optical depth: the deeper centre absorbs more light than the shallow rim.
  const gradient = ctx.createRadialGradient(121, 126, 10, 128, 128, 130);
  gradient.addColorStop(0, neutral ? "#9d9d9d" : "#72532a");
  gradient.addColorStop(0.72, neutral ? "#c8c8c8" : "#ae8343");
  gradient.addColorStop(0.94, neutral ? "#f2f2f2" : "#e1b86d");
  gradient.addColorStop(1, neutral ? "#aaaaaa" : "#745129");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function glazeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const pixels = ctx.createImageData(512, 512);
  let seed = 1939;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const n = seed / 4294967296;
      const pooling = Math.sin(x * 0.023) * Math.sin(y * 0.033) * 5;
      const value = n > 0.994 ? 165 : 241 + pooling + n * 9;
      const offset = (y * 512 + x) * 4;
      pixels.data[offset] = value;
      pixels.data[offset + 1] = value;
      pixels.data[offset + 2] = value - 2;
      pixels.data[offset + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
