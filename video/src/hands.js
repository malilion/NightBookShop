// Lin Cheng's hands for the tea films. Each hand is an anatomical signed
// distance field (palm, metacarpals, fifteen phalanges, thenar web, knuckles
// and fingertip pads) that is meshed on every frame in the hand's own frame,
// so the surface never swims while the hand travels. Nails, the shirt cuff and
// the navy coat sleeve are ordinary meshes. Nothing is scanned or stock.
import * as THREE from "three";

const DEG = Math.PI / 180;
// Model space is a right hand: +X toward the knuckles, +Y the back of the hand,
// the thumb toward -Z. One unit is about ten centimetres, the tea set's scale.
// The distal length stops short of the pulp; the round tip adds its radius.
const FINGERS = [
  {
    name: "index",
    carpal: [0.2, 0.035, -0.115],
    base: [0.905, -0.005, -0.232],
    splay: 5,
    lengths: [0.4, 0.235, 0.15],
    radii: [0.086, 0.078, 0.069, 0.06],
  },
  {
    name: "middle",
    carpal: [0.2, 0.045, -0.035],
    base: [0.945, 0, -0.05],
    splay: 0,
    lengths: [0.44, 0.275, 0.16],
    radii: [0.089, 0.081, 0.071, 0.061],
  },
  {
    name: "ring",
    carpal: [0.19, 0.035, 0.055],
    base: [0.9, -0.012, 0.125],
    splay: -4,
    lengths: [0.41, 0.26, 0.155],
    radii: [0.084, 0.076, 0.067, 0.057],
  },
  {
    name: "little",
    carpal: [0.18, 0.015, 0.14],
    base: [0.815, -0.03, 0.272],
    splay: -11,
    lengths: [0.325, 0.19, 0.14],
    radii: [0.074, 0.066, 0.059, 0.051],
  },
];
const THUMB = {
  base: [0.15, -0.045, -0.16],
  lengths: [0.4, 0.3, 0.18],
  radii: [0.118, 0.1, 0.091, 0.082],
};
const PALM = { centre: [0.5, -0.025, 0.015], half: [0.42, 0.128, 0.32], round: 0.11 };

export const handPoses = {
  relaxed: {
    fingers: {
      index: [14, 22, 10, 0],
      middle: [17, 26, 12, 0],
      ring: [20, 30, 14, 0],
      little: [24, 34, 16, 0],
    },
    thumb: [6, 4, 0, 10, 14],
    arch: 0.25,
  },
};

// ---------------------------------------------------------------- SDF helpers
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
// Round cone between two spheres (after Inigo Quilez), with the per-shape
// terms precomputed once per frame.
function roundCone(a, b, r1, r2) {
  const bax = b.x - a.x,
    bay = b.y - a.y,
    baz = b.z - a.z;
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  return {
    ax: a.x,
    ay: a.y,
    az: a.z,
    bax,
    bay,
    baz,
    l2,
    rr,
    a2: l2 - rr * rr,
    il2: 1 / l2,
    r1,
    r2,
  };
}
function sdRoundCone(c, x, y, z) {
  const pax = x - c.ax,
    pay = y - c.ay,
    paz = z - c.az;
  const yy = pax * c.bax + pay * c.bay + paz * c.baz;
  const zz = yy - c.l2;
  const qx = pax * c.l2 - c.bax * yy,
    qy = pay * c.l2 - c.bay * yy,
    qz = paz * c.l2 - c.baz * yy;
  const x2 = qx * qx + qy * qy + qz * qz;
  const y2 = yy * yy * c.l2;
  const z2 = zz * zz * c.l2;
  const k = Math.sign(c.rr) * c.rr * c.rr * x2;
  if (Math.sign(zz) * c.a2 * z2 > k) return Math.sqrt(x2 + z2) * c.il2 - c.r2;
  if (Math.sign(yy) * c.a2 * y2 < k) return Math.sqrt(x2 + y2) * c.il2 - c.r1;
  return (Math.sqrt(x2 * c.a2 * c.il2) + yy * c.rr) * c.il2 - c.r1;
}
const sphere = (p, r) => ({ x: p.x, y: p.y, z: p.z, r });
function sdSphere(s, x, y, z) {
  const dx = x - s.x,
    dy = y - s.y,
    dz = z - s.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - s.r;
}
function sdPalm(x, y, z, archBend) {
  // The palm narrows toward the wrist and cups slightly across its width.
  let px = x - PALM.centre[0],
    py = y - PALM.centre[1],
    pz = z - PALM.centre[2];
  const along = Math.min(1, Math.max(0, (x - 0.08) / 0.84));
  pz /= 0.86 + 0.14 * along;
  py -= archBend * pz * pz;
  const qx = Math.abs(px) - PALM.half[0] + PALM.round,
    qy = Math.abs(py) - PALM.half[1] + PALM.round,
    qz = Math.abs(pz) - PALM.half[2] + PALM.round;
  const mx = Math.max(qx, 0),
    my = Math.max(qy, 0),
    mz = Math.max(qz, 0);
  return (
    Math.sqrt(mx * mx + my * my + mz * mz) +
    Math.min(Math.max(qx, Math.max(qy, qz)), 0) -
    PALM.round
  );
}

const v3 = (a) => new THREE.Vector3(...a);
const X = new THREE.Vector3(1, 0, 0),
  Y = new THREE.Vector3(0, 1, 0),
  Z = new THREE.Vector3(0, 0, 1);
const axisQ = (axis, degrees) =>
  new THREE.Quaternion().setFromAxisAngle(axis, degrees * DEG);

// -------------------------------------------------------------- forward kinematics
// Joint angles are degrees. Fingers: [knuckle, middle, tip, spread];
// thumb: [palmar abduction, flexion across the palm, roll, knuckle, tip].
export function solveHand(pose, forearm = new THREE.Vector3(-1, 0, 0)) {
  const arch = pose.arch ?? 0.2;
  const fingers = FINGERS.map((finger, i) => {
    const [mcp, pip, dip, spread = 0] = pose.fingers?.[finger.name] ?? [0, 0, 0, 0];
    // Ring and little metacarpals fold palmward when the hand cups.
    const cup = [0.1, 0, 0.45, 1][i] * arch;
    const base = v3(finger.base);
    base.y -= cup * 0.07;
    base.x -= cup * 0.02;
    let q = axisQ(Y, finger.splay + spread).multiply(axisQ(X, cup * 16 * (i < 2 ? -1 : 1)));
    const joints = [base.clone()],
      frames = [];
    const angles = [mcp, pip, dip];
    for (let s = 0; s < 3; s++) {
      q = q.clone().multiply(axisQ(Z, -angles[s]));
      frames.push(q);
      joints.push(
        joints[s].clone().add(X.clone().applyQuaternion(q).multiplyScalar(finger.lengths[s])),
      );
    }
    return {
      name: finger.name,
      carpal: v3(finger.carpal),
      joints,
      frames,
      radii: finger.radii,
      lengths: finger.lengths,
    };
  });
  const [abd = 0, flex = 0, roll = 0, mcp = 0, ip = 0] = pose.thumb ?? [];
  // Rest thumb: pointing distally, radially and palmward, nail turned outward.
  const restDir = new THREE.Vector3(0.64, -0.17, -0.75).normalize();
  const restNail = new THREE.Vector3(-0.12, 0.74, -0.66);
  restNail.sub(restDir.clone().multiplyScalar(restNail.dot(restDir))).normalize();
  const restQ = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(restDir, restNail, restDir.clone().cross(restNail)),
  );
  let q = axisQ(X, -abd).multiply(axisQ(Y, -flex)).multiply(restQ).multiply(axisQ(X, roll));
  const thumbJoints = [v3(THUMB.base)],
    thumbFrames = [];
  const thumbAngles = [0, mcp, ip];
  for (let s = 0; s < 3; s++) {
    q = q.clone().multiply(axisQ(Z, -thumbAngles[s]));
    thumbFrames.push(q);
    thumbJoints.push(
      thumbJoints[s].clone().add(X.clone().applyQuaternion(q).multiplyScalar(THUMB.lengths[s])),
    );
  }
  const thumb = {
    name: "thumb",
    joints: thumbJoints,
    frames: thumbFrames,
    radii: THUMB.radii,
    lengths: THUMB.lengths,
  };
  const u = forearm.clone().normalize();
  return { fingers, thumb, forearm: u, arch };
}

// Build the distance-field primitives for one solved pose.
function buildField(solved) {
  const { fingers, thumb, forearm: u, arch } = solved;
  const metacarpals = fingers.map((f, i) =>
    roundCone(f.carpal, f.joints[0], 0.07, [0.1, 0.103, 0.096, 0.086][i]),
  );
  // Two side-by-side cones give the wrist its flattened oval section.
  let lateral = Z.clone().sub(u.clone().multiplyScalar(Z.dot(u)));
  if (lateral.lengthSq() < 1e-6) lateral = Y.clone();
  lateral.normalize();
  const dorsalPerp = u.clone().cross(lateral).normalize();
  if (dorsalPerp.dot(Y) < 0) dorsalPerp.negate();
  const wristStart = new THREE.Vector3(0.12, 0.0, -0.005);
  const wrist = [-1, 1].map((side) => {
    const start = wristStart.clone().add(lateral.clone().multiplyScalar(0.1 * side));
    return roundCone(
      start,
      start.clone().add(u.clone().multiplyScalar(0.95)),
      0.165,
      0.185,
    );
  });
  const styloid = sphere(
    u.clone().multiplyScalar(0.15).add(lateral.clone().multiplyScalar(0.185)).add(dorsalPerp.clone().multiplyScalar(0.085)),
    0.042,
  );
  const chains = [...fingers, thumb].map((f) => {
    const isThumb = f.name === "thumb";
    const cones = [0, 1, 2].map((s) =>
      roundCone(f.joints[s], f.joints[s + 1], f.radii[s], f.radii[s + 1]),
    );
    // Knuckles ride on the back of each bent joint; pads sit under the tip.
    const knuckles = [];
    for (let j = 1; j < 3; j++) {
      const dorsal = Y.clone()
        .applyQuaternion(f.frames[j - 1])
        .add(Y.clone().applyQuaternion(f.frames[j]))
        .normalize();
      const r = f.radii[j];
      knuckles.push(sphere(f.joints[j].clone().add(dorsal.multiplyScalar(r * 0.5)), r * 0.6));
    }
    const tipDir = X.clone().applyQuaternion(f.frames[2]);
    const palmar = Y.clone().applyQuaternion(f.frames[2]).negate();
    const pad = sphere(
      f.joints[2]
        .clone()
        .add(tipDir.multiplyScalar(f.lengths[2] * 0.62))
        .add(palmar.multiplyScalar(f.radii[3] * 0.34)),
      f.radii[3] * 0.8,
    );
    // Cheap bounding sphere around the whole chain for culling.
    const centre = new THREE.Vector3();
    f.joints.forEach((j) => centre.add(j));
    centre.multiplyScalar(1 / f.joints.length);
    let radius = 0;
    f.joints.forEach((j, i) => {
      radius = Math.max(radius, j.distanceTo(centre) + f.radii[Math.min(i, 3)]);
    });
    return {
      cones,
      knuckles,
      pad,
      web: isThumb ? 0.13 : 0.045,
      joint: isThumb ? 0.03 : 0.018,
      bx: centre.x,
      by: centre.y,
      bz: centre.z,
      br: radius + 0.05,
    };
  });
  const archBend = arch * 0.35;
  function base(x, y, z) {
    let d = sdPalm(x, y, z, archBend);
    for (const m of metacarpals) d = smin(d, sdRoundCone(m, x, y, z), 0.06);
    d = smin(d, sdRoundCone(wrist[0], x, y, z), 0.13);
    d = smin(d, sdRoundCone(wrist[1], x, y, z), 0.13);
    return smin(d, sdSphere(styloid, x, y, z), 0.05);
  }
  function sdf(x, y, z) {
    const b = base(x, y, z);
    let d = b;
    for (const c of chains) {
      const dx = x - c.bx,
        dy = y - c.by,
        dz = z - c.bz;
      const bound = Math.sqrt(dx * dx + dy * dy + dz * dz) - c.br;
      if (bound > b + c.web || (bound >= d + c.web * 0.25 && b >= d + c.web * 0.25))
        continue;
      let f = sdRoundCone(c.cones[0], x, y, z);
      f = smin(f, sdRoundCone(c.cones[1], x, y, z), c.joint);
      f = smin(f, sdRoundCone(c.cones[2], x, y, z), c.joint);
      for (const k of c.knuckles) f = smin(f, sdSphere(k, x, y, z), 0.03);
      f = smin(f, sdSphere(c.pad, x, y, z), 0.025);
      d = Math.min(d, smin(f, b, c.web));
    }
    return d;
  }
  // Bounds of the posed hand, the wrist and the part hidden by the cuff.
  const box = new THREE.Box3();
  for (const f of [...fingers, thumb]) for (const j of f.joints) box.expandByPoint(j);
  box.expandByPoint(new THREE.Vector3(PALM.centre[0] - PALM.half[0], 0, 0));
  box.expandByScalar(0.24);
  // Carry the wrist well inside the cuff so its cut end is never seen.
  for (const a of [-1, 1])
    for (const b of [-1, 1])
      box.expandByPoint(
        u.clone().multiplyScalar(0.72).addScaledVector(lateral, a * 0.32).addScaledVector(dorsalPerp, b * 0.26),
      );
  return { sdf, box, dorsalPerp, lateral };
}

// ------------------------------------------------------------- surface nets
// Narrow-band surface nets: a coarse pass marks blocks that can hold the
// surface, the fine grid is sampled only there, and every vertex is then
// projected onto the field so the silhouette stays smooth between cells.
const CORNERS = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];
const EDGES = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [0, 2],
  [1, 3],
  [4, 6],
  [5, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];
const scratch = { values: new Float32Array(0), cells: new Int32Array(0) };
export function meshField(sdf, box, h) {
  const nx = Math.ceil((box.max.x - box.min.x) / h) + 1,
    ny = Math.ceil((box.max.y - box.min.y) / h) + 1,
    nz = Math.ceil((box.max.z - box.min.z) / h) + 1;
  const count = nx * ny * nz;
  if (scratch.values.length < count) {
    scratch.values = new Float32Array(count);
    scratch.cells = new Int32Array(count);
  }
  const values = scratch.values,
    cells = scratch.cells;
  values.fill(NaN, 0, count);
  cells.fill(-1, 0, count);
  const ox = box.min.x,
    oy = box.min.y,
    oz = box.min.z;
  const index = (i, j, k) => i + nx * (j + ny * k);
  const value = (i, j, k) => {
    const n = index(i, j, k);
    let v = values[n];
    if (v !== v) {
      v = sdf(ox + i * h, oy + j * h, oz + k * h);
      values[n] = v;
    }
    return v;
  };
  const B = 4;
  const threshold = 2.3 * B * h;
  const bx = Math.ceil((nx - 1) / B),
    by = Math.ceil((ny - 1) / B),
    bz = Math.ceil((nz - 1) / B);
  const clampI = (i) => Math.min(i, nx - 1),
    clampJ = (j) => Math.min(j, ny - 1),
    clampK = (k) => Math.min(k, nz - 1);
  const marked = [];
  for (let K = 0; K < bz; K++)
    for (let J = 0; J < by; J++)
      for (let I = 0; I < bx; I++) {
        let near = Infinity;
        for (const [a, b, c] of CORNERS) {
          const v = value(clampI((I + a) * B), clampJ((J + b) * B), clampK((K + c) * B));
          near = Math.min(near, Math.abs(v));
        }
        if (near < threshold) marked.push(I, J, K);
      }
  const positions = [];
  const corner = new Float32Array(8);
  function cellVertex(i, j, k) {
    const n = index(i, j, k);
    if (cells[n] >= 0) return cells[n];
    for (let c = 0; c < 8; c++)
      corner[c] = value(i + CORNERS[c][0], j + CORNERS[c][1], k + CORNERS[c][2]);
    let sx = 0,
      sy = 0,
      sz = 0,
      crossings = 0;
    for (const [a, b] of EDGES) {
      const va = corner[a],
        vb = corner[b];
      if (va < 0 === vb < 0) continue;
      const t = va / (va - vb);
      sx += CORNERS[a][0] + (CORNERS[b][0] - CORNERS[a][0]) * t;
      sy += CORNERS[a][1] + (CORNERS[b][1] - CORNERS[a][1]) * t;
      sz += CORNERS[a][2] + (CORNERS[b][2] - CORNERS[a][2]) * t;
      crossings++;
    }
    if (!crossings) return -1;
    const vertex = positions.length / 3;
    positions.push(
      ox + (i + sx / crossings) * h,
      oy + (j + sy / crossings) * h,
      oz + (k + sz / crossings) * h,
    );
    cells[n] = vertex;
    return vertex;
  }
  const indices = [];
  function quad(a, b, c, d, flip) {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) indices.push(a, c, b, a, d, c);
    else indices.push(a, b, c, a, c, d);
  }
  for (let m = 0; m < marked.length; m += 3) {
    const I = marked[m] * B,
      J = marked[m + 1] * B,
      K = marked[m + 2] * B;
    for (let k = K; k < Math.min(K + B, nz - 1); k++)
      for (let j = J; j < Math.min(J + B, ny - 1); j++)
        for (let i = I; i < Math.min(I + B, nx - 1); i++) {
          const v0 = value(i, j, k);
          const inside = v0 < 0;
          if (j > 0 && k > 0 && inside !== value(i + 1, j, k) < 0)
            quad(
              cellVertex(i, j - 1, k - 1),
              cellVertex(i, j, k - 1),
              cellVertex(i, j, k),
              cellVertex(i, j - 1, k),
              !inside,
            );
          if (i > 0 && k > 0 && inside !== value(i, j + 1, k) < 0)
            quad(
              cellVertex(i - 1, j, k - 1),
              cellVertex(i - 1, j, k),
              cellVertex(i, j, k),
              cellVertex(i, j, k - 1),
              !inside,
            );
          if (i > 0 && j > 0 && inside !== value(i, j, k + 1) < 0)
            quad(
              cellVertex(i - 1, j - 1, k),
              cellVertex(i, j - 1, k),
              cellVertex(i, j, k),
              cellVertex(i - 1, j, k),
              !inside,
            );
        }
  }
  // Tetrahedral gradient: four samples give the distance and the normal.
  const e = h * 0.35;
  const normals = new Float32Array(positions.length);
  const out = new Float32Array(positions);
  for (let v = 0; v < out.length; v += 3) {
    for (let pass = 0; pass < 2; pass++) {
      const x = out[v],
        y = out[v + 1],
        z = out[v + 2];
      const a = sdf(x + e, y - e, z - e),
        b = sdf(x - e, y - e, z + e),
        c = sdf(x - e, y + e, z - e),
        d = sdf(x + e, y + e, z + e);
      let gx = a - b - c + d,
        gy = -a - b + c + d,
        gz = -a + b - c + d;
      const length = Math.hypot(gx, gy, gz) || 1;
      gx /= length;
      gy /= length;
      gz /= length;
      if (pass === 0) {
        const distance = (a + b + c + d) * 0.25;
        out[v] -= gx * distance;
        out[v + 1] -= gy * distance;
        out[v + 2] -= gz * distance;
      } else {
        normals[v] = gx;
        normals[v + 1] = gy;
        normals[v + 2] = gz;
      }
    }
  }
  return { positions: out, normals, indices };
}

// ---------------------------------------------------------------- materials
const toLinear = (hex) => new THREE.Color(hex);
export function createSkinMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.56,
    sheen: 0.3,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color("#e9a58c"),
    clearcoat: 0.06,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.55,
  });
  // Skin scatters light under its surface: diffuse light wraps past the
  // terminator, red furthest, which keeps hands from looking like plastic.
  material.onBeforeCompile = (shader) => {
    const target =
      "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );";
    const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
    if (!chunk.includes(target)) throw new Error("Skin shader hook not found");
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_physical_pars_fragment>",
      chunk.replace(
        target,
        `float skinNL = dot( geometryNormal, directLight.direction );
	vec3 skinWrap = clamp( ( vec3( skinNL ) + vec3( 0.46, 0.2, 0.12 ) ) / vec3( 1.46, 1.2, 1.12 ), 0.0, 1.0 );
	reflectedLight.directDiffuse += skinWrap * directLight.color * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );`,
      ),
    );
  };
  material.customProgramCacheKey = () => "lin-cheng-skin";
  return material;
}

// --------------------------------------------------------------- the hand
export function createHand(scene, { side = "right", skin, resolution = 0.016, scale = 1 } = {}) {
  const mirror = side === "left";
  const root = new THREE.Group();
  root.name = `${side}-hand`;
  scene.add(root);
  const skinMaterial = skin ?? createSkinMaterial();
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), skinMaterial);
  mesh.castShadow = mesh.receiveShadow = true;
  root.add(mesh);
  const nailMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.32,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.7,
  });
  const nails = [...FINGERS, THUMB].map((chain, i) => {
    const nail = new THREE.Mesh(
      nailGeometry(chain.lengths[2], chain.radii[2], chain.radii[3], i === 4),
      nailMaterial,
    );
    nail.castShadow = false;
    nail.receiveShadow = true;
    root.add(nail);
    return nail;
  });
  const sleeve = createSleeve(scene);
  const skinColours = {
    base: toLinear("#e2b092"),
    palm: toLinear("#ecc2ad"),
    flush: toLinear("#d58b76"),
    shadow: toLinear("#b9856d"),
  };
  let solved = null;

  // pose.wrist / pose.elbow / pose.shoulder are world points; pose.forward is
  // where the knuckles point and pose.dorsal where the back of the hand faces.
  function setPose(pose) {
    const forward = pose.forward.clone().normalize();
    const dorsal = pose.dorsal
      .clone()
      .sub(forward.clone().multiplyScalar(pose.dorsal.dot(forward)))
      .normalize();
    const lateral = forward.clone().cross(dorsal);
    const basis = new THREE.Matrix4().makeBasis(forward, dorsal, lateral);
    basis.multiply(new THREE.Matrix4().makeScale(scale, scale, mirror ? -scale : scale));
    const inverse = basis.clone().invert();
    solved = solveHand(pose);
    // Anchor: place a named part of the hand exactly on a world point.
    let wrist = pose.wrist?.clone();
    if (pose.anchor) {
      const local = anchorPoint(solved, pose.anchor.part);
      wrist = pose.anchor.world.clone().sub(local.clone().applyMatrix4(basis));
    }
    const elbow = pose.elbow ?? wrist.clone().sub(forward.clone().multiplyScalar(2));
    solved.forearm = elbow.clone().sub(wrist).transformDirection(inverse);
    root.matrixAutoUpdate = false;
    root.matrix.copy(basis).setPosition(wrist);
    root.matrixWorldNeedsUpdate = true;
    const field = buildField(solved);
    const { positions, normals, indices } = meshField(field.sdf, field.box, resolution);
    const colors = new Float32Array(positions.length);
    paintSkin(positions, normals, colors, solved, skinColours);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    mesh.geometry.dispose();
    mesh.geometry = geometry;
    // Nails follow each distal phalanx.
    [...solved.fingers, solved.thumb].forEach((f, i) => {
      const nail = nails[i];
      nail.matrixAutoUpdate = false;
      nail.matrix.compose(f.joints[2], f.frames[2], new THREE.Vector3(1, 1, 1));
    });
    const worldWrist = wrist.clone();
    const worldU = elbow.clone().sub(worldWrist).normalize();
    const worldLateral = new THREE.Vector3(0, 0, 1).transformDirection(basis);
    sleeve.update({
      wrist: worldWrist,
      forearm: worldU,
      lateral: worldLateral,
      elbow,
      shoulder: pose.shoulder,
      scale,
    });
    return { wrist: worldWrist, basis };
  }
  // Joint positions for a pose without meshing, in model space.
  function solve(pose) {
    return solveHand(pose);
  }
  return {
    root,
    mesh,
    sleeve,
    setPose,
    solve,
    get solved() {
      return solved;
    },
    set visible(value) {
      root.visible = value;
      sleeve.group.visible = value;
    },
    get visible() {
      return root.visible;
    },
  };
}

// Named model-space points used to put a finger exactly on a handle or rim.
export function anchorPoint(solved, part) {
  if (Array.isArray(part)) return new THREE.Vector3(...part);
  const [name, where = "tip"] = part.split(".");
  const chain = name === "thumb" ? solved.thumb : solved.fingers.find((f) => f.name === name);
  if (!chain) throw new Error(`Unknown hand part ${part}`);
  if (where === "tip") {
    const dir = X.clone().applyQuaternion(chain.frames[2]);
    return chain.joints[3].clone().add(dir.multiplyScalar(chain.radii[3] * 0.6));
  }
  if (where === "pad") {
    const dir = X.clone().applyQuaternion(chain.frames[2]);
    const palmar = Y.clone().applyQuaternion(chain.frames[2]).negate();
    return chain.joints[2]
      .clone()
      .add(dir.multiplyScalar(chain.lengths[2] * 0.7))
      .add(palmar.multiplyScalar(chain.radii[3] * 1.05));
  }
  const joint = { mcp: 0, pip: 1, dip: 2 }[where];
  if (joint !== undefined) return chain.joints[joint].clone();
  if (where === "mid") return chain.joints[1].clone().lerp(chain.joints[2], 0.5);
  if (where === "prox") return chain.joints[0].clone().lerp(chain.joints[1], 0.5);
  throw new Error(`Unknown hand anchor ${part}`);
}

function paintSkin(positions, normals, colors, solved, tones) {
  const tips = [...solved.fingers, solved.thumb].map((f) => f.joints[3]);
  const knuckles = [...solved.fingers, solved.thumb].flatMap((f) => [f.joints[1], f.joints[2]]);
  const colour = new THREE.Color();
  for (let v = 0; v < positions.length; v += 3) {
    const x = positions[v],
      y = positions[v + 1],
      z = positions[v + 2];
    const ny = normals[v + 1];
    colour.copy(tones.base);
    // The palm and finger undersides are paler and pinker.
    const palmar = Math.min(1, Math.max(0, -ny * 1.4 - 0.1));
    colour.lerp(tones.palm, palmar * 0.8);
    let flush = 0;
    for (const t of tips) {
      const d = Math.hypot(x - t.x, y - t.y, z - t.z);
      flush = Math.max(flush, 1 - Math.min(1, d / 0.13));
    }
    let knuckle = 0;
    for (const k of knuckles) {
      const d = Math.hypot(x - k.x, y - k.y, z - k.z);
      knuckle = Math.max(knuckle, 1 - Math.min(1, d / 0.075));
    }
    colour.lerp(tones.flush, flush * flush * 0.55 + knuckle * knuckle * 0.3 * (1 - palmar));
    // A faint cool shadow toward the wrist keeps the forearm from glowing.
    const wrist = Math.min(1, Math.max(0, (0.1 - x) / 0.35));
    colour.lerp(tones.shadow, wrist * 0.25);
    // Soft, uneven warmth so the skin never reads as one flat colour.
    const mottle =
      Math.sin(x * 21 + 1.3) * Math.sin(y * 17 + 0.4) * Math.sin(z * 27 + 2.1) * 0.5 +
      Math.sin(x * 47 + z * 13) * Math.sin(y * 41 - z * 29) * 0.25;
    colour.lerp(tones.flush, Math.max(0, mottle) * 0.18);
    colour.multiplyScalar(1 + Math.min(0, mottle) * 0.04);
    colors[v] = colour.r;
    colors[v + 1] = colour.g;
    colors[v + 2] = colour.b;
  }
}

// A thin, curved nail plate in the distal phalanx frame. Short natural nails:
// a rounded cuticle, a nail bed that shows pink through the plate and a pale
// free edge that follows the fingertip down to its end.
function nailGeometry(length, jointRadius, tipRadius, thumb) {
  const rows = 16,
    columns = 12;
  const positions = [],
    colors = [],
    indices = [];
  const bed = new THREE.Color("#e3aa9c"),
    edge = new THREE.Color("#f3e3d8");
  const from = length * (thumb ? 0.36 : 0.42),
    to = length + tipRadius * 0.72;
  const halfAngle = thumb ? 0.92 : 0.84;
  for (let r = 0; r <= rows; r++) {
    const u = r / rows;
    const x = from + (to - from) * u;
    // Rounded cuticle; the sides tuck slightly into the nail folds.
    const width = halfAngle * Math.sqrt(Math.min(1, u / 0.2)) * (1 - 0.12 * Math.max(0, u - 0.8) / 0.2);
    const beyond = Math.max(0, x - length) / tipRadius;
    const radius =
      x <= length
        ? jointRadius + (tipRadius - jointRadius) * (x / length)
        : tipRadius * (1 - 0.55 * beyond * beyond);
    for (let c = 0; c <= columns; c++) {
      const v = c / columns;
      const angle = (v * 2 - 1) * width;
      const lift = 0.0022 * Math.cos(((v * 2 - 1) * Math.PI) / 2);
      positions.push(x, Math.cos(angle) * (radius + lift), Math.sin(angle) * (radius + lift) * (x <= length ? 1 : 1 - beyond * 0.2));
      const colour = bed.clone().lerp(edge, Math.max(0, (u - 0.78) / 0.22));
      colors.push(colour.r, colour.g, colour.b);
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++) {
      const a = r * (columns + 1) + c,
        b = a + columns + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// ----------------------------------------------------------------- sleeves
function fabricTexture(weave) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const pixels = ctx.createImageData(256, 256);
  let seed = weave ? 9187 : 5519;
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const n = seed / 4294967296;
      // Wool twill for the coat, a plain cotton weave for the shirt.
      const twill = weave
        ? Math.sin((x + y) * 0.9) * 0.5 + 0.5
        : (Math.sin(x * 1.6) * Math.sin(y * 1.6)) * 0.5 + 0.5;
      const value = 118 + twill * 40 + n * 30;
      const i = (y * 256 + x) * 4;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
  ctx.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(weave ? 6 : 4, weave ? 10 : 2);
  return texture;
}
let coatMaterial, shirtMaterial, liningMaterial, buttonMaterial;
function sleeveMaterials() {
  if (coatMaterial) return;
  // Lin Cheng's dark navy coat over a cream shirt.
  coatMaterial = new THREE.MeshPhysicalMaterial({
    color: "#28334d",
    roughness: 0.86,
    sheen: 0.55,
    sheenColor: new THREE.Color("#4d5d82"),
    sheenRoughness: 0.7,
    bumpMap: fabricTexture(true),
    bumpScale: 0.004,
  });
  liningMaterial = new THREE.MeshStandardMaterial({ color: "#1a2233", roughness: 0.92, side: THREE.BackSide });
  shirtMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ece2d0",
    roughness: 0.82,
    sheen: 0.5,
    sheenColor: new THREE.Color("#fff6e6"),
    sheenRoughness: 0.5,
    bumpMap: fabricTexture(false),
    bumpScale: 0.002,
  });
  buttonMaterial = new THREE.MeshPhysicalMaterial({
    color: "#f3ede2",
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 0.4,
  });
}
function createSleeve(scene) {
  sleeveMaterials();
  const group = new THREE.Group();
  scene.add(group);
  const coat = new THREE.Mesh(new THREE.BufferGeometry(), coatMaterial);
  const lining = new THREE.Mesh(new THREE.BufferGeometry(), liningMaterial);
  const shirt = new THREE.Mesh(new THREE.BufferGeometry(), shirtMaterial);
  const hem = new THREE.Mesh(new THREE.BufferGeometry(), coatMaterial);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 10), buttonMaterial);
  button.scale.set(1, 1, 0.45);
  for (const m of [coat, lining, shirt, hem, button]) {
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  }
  // Oval tube along a path; radius and folds vary along the sleeve.
  function tube(mesh, path, rings, segments, radius, fold, lateral) {
    const curve = new THREE.CatmullRomCurve3(path);
    const positions = [],
      uvs = [],
      indices = [];
    const lat = lateral.clone();
    for (let r = 0; r <= rings; r++) {
      const s = r / rings;
      const centre = curve.getPointAt(s);
      const tangent = curve.getTangentAt(s);
      const side = lat.clone().sub(tangent.clone().multiplyScalar(lat.dot(tangent))).normalize();
      const up = tangent.clone().cross(side).normalize();
      const [rx, ry] = radius(s);
      for (let c = 0; c <= segments; c++) {
        const a = (c / segments) * Math.PI * 2;
        const wobble = 1 + fold(s, a);
        const p = centre
          .clone()
          .add(side.clone().multiplyScalar(Math.cos(a) * rx * wobble))
          .add(up.clone().multiplyScalar(Math.sin(a) * ry * wobble));
        // Cloth hangs: the underside sags slightly toward the table.
        p.y -= Math.max(0, -Math.sin(a)) * 0.02 * s;
        positions.push(p.x, p.y, p.z);
        uvs.push(c / segments, s * 4);
      }
    }
    for (let r = 0; r < rings; r++)
      for (let c = 0; c < segments; c++) {
        const a = r * (segments + 1) + c,
          b = a + segments + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    mesh.geometry.dispose();
    mesh.geometry = geometry;
    return curve;
  }
  function update({ wrist, forearm, lateral, elbow, shoulder, scale = 1 }) {
    const cuffStart = wrist.clone().add(forearm.clone().multiplyScalar(0.12 * scale));
    const coatStart = wrist.clone().add(forearm.clone().multiplyScalar(0.3 * scale));
    const elbowPoint = elbow.clone();
    const shoulderPoint = shoulder ?? elbow.clone().add(new THREE.Vector3(0, 1.4, -0.6));
    // The shirt cuff: a crisp oval band with a pearl button on the outside.
    tube(
      shirt,
      [cuffStart, cuffStart.clone().add(forearm.clone().multiplyScalar(0.28 * scale))],
      6,
      40,
      (s) => [(0.305 + 0.012 * s) * scale, (0.232 + 0.01 * s) * scale],
      (s, a) => (s < 0.12 ? 0.02 * (1 - s / 0.12) : 0) + Math.sin(a * 6 + 1.3) * 0.006,
      lateral,
    );
    const buttonAt = cuffStart
      .clone()
      .add(forearm.clone().multiplyScalar(0.12 * scale))
      .add(lateral.clone().multiplyScalar(0.312 * scale));
    button.position.copy(buttonAt);
    button.lookAt(buttonAt.clone().add(lateral));
    const path = [
      coatStart,
      coatStart.clone().lerp(elbowPoint, 0.5),
      elbowPoint,
      elbowPoint.clone().lerp(shoulderPoint, 0.5),
      shoulderPoint,
    ];
    const coatRadius = (s) => {
      const open = Math.max(0, 1 - s / 0.05);
      return [(0.37 + 0.015 * open) * scale + 0.12 * s, (0.31 + 0.015 * open) * scale + 0.12 * s];
    };
    const coatFold = (s, a) =>
      0.045 * Math.sin(a * 3 + s * 21) * Math.min(1, s * 6) +
      0.03 * Math.sin(a * 5 - s * 37 + 0.7) +
      0.05 * Math.exp(-Math.pow((s - 0.5) / 0.08, 2)) * Math.sin(a * 4 + 1.1);
    tube(coat, path, 40, 48, coatRadius, coatFold, lateral);
    // A turned hem gives the opening a soft, thick edge.
    tube(
      hem,
      [coatStart.clone().add(forearm.clone().multiplyScalar(-0.012)), coatStart.clone().add(forearm.clone().multiplyScalar(0.05))],
      3,
      48,
      (s) => {
        const [rx, ry] = coatRadius(0);
        const bulge = 0.012 * Math.sin(s * Math.PI);
        return [rx + bulge - 0.004, ry + bulge - 0.004];
      },
      (s, a) => coatFold(0, a),
      lateral,
    );
    // The sleeve's inside, seen at the cuff opening.
    tube(
      lining,
      [coatStart.clone().add(forearm.clone().multiplyScalar(-0.002)), coatStart.clone().add(forearm.clone().multiplyScalar(0.4))],
      4,
      48,
      (s) => {
        const [rx, ry] = coatRadius(s * 0.1);
        return [rx - 0.012, ry - 0.012];
      },
      (s, a) => coatFold(s * 0.1, a),
      lateral,
    );
  }
  return { group, update };
}
