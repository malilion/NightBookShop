import {
  mkdtempSync,
  readFileSync,
  rmSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";

const rate = 32000;
const output = new URL("../public/audio/", import.meta.url).pathname;
mkdirSync(output, { recursive: true });
const temp = mkdtempSync(join(tmpdir(), "night-bookshop-audio-"));
let seed = 20260925;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
function wave(seconds, sample) {
  const count = Math.round(seconds * rate);
  const data = Buffer.alloc(44 + count * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(data.length - 8, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(rate, 24);
  data.writeUInt32LE(rate * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    const value = Math.max(-1, Math.min(1, sample(i / rate, i)));
    data.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  return data;
}
// `--only=tea-pour,tea-chime` renders just those cues and leaves the others untouched.
const only = process.argv
  .find((arg) => arg.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",");
let rendered = 0;
function render(name, seconds, sample, bitrate = "64k") {
  if (only && !only.includes(name)) return;
  rendered++;
  const wav = join(temp, `${name}.wav`);
  writeFileSync(wav, wave(seconds, sample));
  for (const [extension, codec, bitRate] of [
    ["ogg", "libopus", bitrate],
    ["mp3", "libmp3lame", bitrate],
  ]) {
    const file = join(output, `${name}.${extension}`);
    const result = spawnSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        wav,
        "-ar",
        extension === "ogg" ? "48000" : "32000",
        "-ac",
        "1",
        "-c:a",
        codec,
        "-b:a",
        bitRate,
        file,
      ],
      { encoding: "utf8" },
    );
    if (result.status !== 0)
      throw new Error(`ffmpeg ${name}: ${result.stderr}`);
    if (readFileSync(file).length < 100)
      throw new Error(`Empty audio: ${file}`);
  }
}
try {
  // The bookshop theme: a slow felt-piano waltz in D minor over a soft pad and
  // bass, with a small room reverb. Rendered three times over so the middle
  // pass, reverb tail included, loops without a seam.
  {
    const beat = 60 / 66;
    const bar = beat * 3;
    const bars = 12;
    const loopSeconds = bar * bars;
    const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
    // Dm – B♭ – F – C, then Gm – Dm – A – Dm, twice through the first four.
    const progression = [
      [50, [62, 65, 69]], [46, [62, 65, 70]], [41, [60, 65, 69]], [48, [60, 64, 67]],
      [43, [62, 67, 70]], [50, [62, 65, 69]], [45, [61, 64, 69]], [50, [62, 65, 69]],
      [50, [62, 65, 69]], [46, [62, 65, 70]], [43, [62, 67, 70]], [45, [61, 64, 69]],
    ];
    // Melody: [bar, beat, midi, beats held]; sparse, so the room can breathe.
    const melody = [
      [0, 0, 74, 2], [0, 2, 72, 1], [1, 0, 70, 2.5], [2, 0, 69, 1], [2, 1, 72, 1], [2, 2, 77, 1],
      [3, 0, 76, 3], [4, 0, 74, 1.5], [4, 1.5, 72, 0.5], [4, 2, 70, 1], [5, 0, 69, 3],
      [6, 0, 73, 1], [6, 1, 76, 1], [6, 2, 79, 1], [7, 0, 77, 1.5], [7, 1.5, 76, 0.5], [7, 2, 74, 1],
      [8, 1, 69, 1], [8, 2, 74, 1], [9, 0, 77, 2], [9, 2, 74, 1], [10, 0, 74, 1], [10, 1, 70, 2],
      [11, 0, 73, 2], [11, 2, 76, 1],
    ];
    const total = Math.round(loopSeconds * 3 * rate);
    const dry = new Float32Array(total);
    // A felt piano note: decaying harmonics, the upper ones fading first.
    const piano = (start, midi, held, level) => {
      const f = hz(midi);
      const from = Math.round(start * rate);
      const length = Math.round((held + 2.5) * rate);
      for (let i = 0; i < length && from + i < total; i++) {
        const t = i / rate;
        const release = t < held ? 1 : Math.exp(-(t - held) * 4);
        let sum = 0;
        for (let k = 1; k <= 6; k++) {
          const partial = f * k * (1 + 0.0004 * k * k);
          if (partial > 6000) break;
          sum += Math.sin(2 * Math.PI * partial * t) * Math.exp(-t * (0.9 + k * 0.85)) / k ** 1.6;
        }
        const attack = Math.min(1, t / 0.006);
        dry[from + i] += sum * attack * release * level;
      }
    };
    // A warm pad: three slightly detuned voices of a few soft harmonics.
    const pad = (start, notes, seconds, level) => {
      const from = Math.round(start * rate);
      const length = Math.round(seconds * rate);
      for (let i = 0; i < length && from + i < total; i++) {
        const t = i / rate;
        const swell = Math.sin(Math.PI * Math.min(1, t / seconds)) ** 0.7;
        let sum = 0;
        for (const midi of notes)
          for (const detune of [-0.003, 0, 0.0035]) {
            const f = hz(midi) * (1 + detune);
            sum += Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(4 * Math.PI * f * t) + 0.06 * Math.sin(6 * Math.PI * f * t);
          }
        dry[from + i] += sum * swell * level;
      }
    };
    for (let pass = 0; pass < 3; pass++) {
      const offset = pass * loopSeconds;
      progression.forEach(([root, notes], index) => {
        const at = offset + index * bar;
        pad(at - 0.4, notes, bar + 0.8, 0.0045);
        piano(at, root, bar * 0.9, 0.085);
        piano(at + beat, root + 12, beat * 0.8, 0.03);
        notes.forEach((midi, n) => piano(at + beat * (1 + n * 0.5) + beat * 0.5, midi, beat, 0.022));
      });
      for (const [index, beatAt, midi, held] of melody)
        piano(offset + index * bar + beatAt * beat, midi, held * beat, 0.06);
    }
    // A small room: four combs into two all-passes, gently low-passed.
    const combs = [1557, 1617, 1491, 1422].map((length) => ({ buffer: new Float32Array(length), index: 0, store: 0 }));
    const passes = [225, 556].map((length) => ({ buffer: new Float32Array(length), index: 0 }));
    const wet = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      let sum = 0;
      for (const comb of combs) {
        const out = comb.buffer[comb.index];
        comb.store = out * 0.75 + comb.store * 0.25;
        comb.buffer[comb.index] = dry[i] + comb.store * 0.82;
        comb.index = (comb.index + 1) % comb.buffer.length;
        sum += out;
      }
      for (const pass of passes) {
        const delayed = pass.buffer[pass.index];
        const out = -sum + delayed;
        pass.buffer[pass.index] = sum + delayed * 0.5;
        pass.index = (pass.index + 1) % pass.buffer.length;
        sum = out;
      }
      wet[i] = sum * 0.25;
    }
    let tone = 0;
    const from = Math.round(loopSeconds * rate);
    // 遊戲的主題曲已改用薩提〈吉諾佩第一號〉的公有領域錄音（scripts/import-theme.mjs）。
    // 這段程序式旋律仍照樣計算，讓其餘音檔的亂數序列不變；只有明確指定
    // `--only=midnight-theme` 時才會輸出並覆蓋主題曲。
    if (only?.includes("midnight-theme")) render("midnight-theme", loopSeconds, (_t, i) => {
      // Soften the very top so nothing reads as a beep.
      tone += (dry[from + i] + wet[from + i] - tone) * 0.55;
      return Math.tanh(tone * 1.4) * 0.26;
    }, "80k");
  }

  // The ambience uses its own generator; the shared one is advanced exactly as
  // the first versions did, so the short cues below stay byte-stable.
  for (let i = 0; i < Math.round(16 * rate) * 3; i++) random();
  let ambienceSeed = 20261004;
  const ambienceRandom = () => {
    ambienceSeed ^= ambienceSeed << 13;
    ambienceSeed ^= ambienceSeed >>> 17;
    ambienceSeed ^= ambienceSeed << 5;
    return (ambienceSeed >>> 0) / 4294967296;
  };
  // Renders `seconds` plus a tail and folds the tail over the start, so the
  // loop has no seam and no fade to silence.
  const looped = (seconds, sample) => {
    const fold = Math.round(1.5 * rate);
    const length = Math.round(seconds * rate);
    const raw = new Float32Array(length + fold);
    for (let i = 0; i < raw.length; i++) raw[i] = sample(i / rate);
    return (_t, i) => {
      if (i >= fold) return raw[i];
      const k = i / fold;
      return raw[i] * Math.sin((k * Math.PI) / 2) + raw[length + i] * Math.cos((k * Math.PI) / 2);
    };
  };
  // Pink noise (Paul Kellet's filter): softer than white, like distant rain.
  const pink = () => {
    let b0 = 0, b1 = 0, b2 = 0;
    return () => {
      const white = ambienceRandom() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      return (b0 + b1 + b2 + white * 0.1848) * 0.2;
    };
  };

  // Rain on the window: a soft, darkened wash with gusts, light patter of drops
  // on the glass and, now and then, a fuller drip from the eaves.
  {
    const wash = pink();
    let low = 0, lower = 0;
    const drops = [];
    render("rain-window", 20, looped(20, (t) => {
      const n = wash();
      low += (n - low) * 0.18;
      lower += (low - lower) * 0.05;
      const gust = 0.8 + 0.2 * Math.sin((2 * Math.PI * t) / 6.7) * Math.sin((2 * Math.PI * t) / 10.3 + 1);
      if (ambienceRandom() < 9 / rate)
        drops.push({ age: 0, hz: 1800 + ambienceRandom() * 2600, level: 0.004 + ambienceRandom() ** 2 * 0.014, decay: 260 + ambienceRandom() * 200, noise: 0 });
      if (ambienceRandom() < 0.25 / rate)
        drops.push({ age: 0, hz: 520 + ambienceRandom() * 380, level: 0.012 + ambienceRandom() * 0.01, decay: 38, glide: true, noise: 0 });
      let patter = 0;
      for (const drop of drops) {
        drop.age += 1 / rate;
        const pitch = drop.glide ? drop.hz * (1 + 0.8 * drop.age * 10) : drop.hz;
        drop.noise = drop.noise * 0.6 + (ambienceRandom() * 2 - 1) * 0.4;
        patter += (Math.sin(2 * Math.PI * pitch * drop.age) * 0.7 + drop.noise * 0.3) * drop.level * Math.exp(-drop.age * drop.decay);
      }
      while (drops.length && drops[0].age > 0.25) drops.shift();
      return ((low - lower) * 0.7 + lower * 0.5) * 0.1 * gust + patter * 1.6;
    }));
  }

  // The bookshop at night: a low, quiet room tone and a slow clock.
  {
    const air = pink();
    let low = 0, lower = 0;
    render("bookshop-room", 20, looped(20, (t) => {
      const n = air();
      low += (n - low) * 0.03;
      lower += (low - lower) * 0.02;
      const beat = t % 2;
      const tick = beat < 0.04 ? Math.sin(2 * Math.PI * 1150 * beat) * Math.exp(-beat * 140) * 0.009 * (Math.floor(t / 2) % 2 ? 0.8 : 1) : 0;
      return (low - lower) * 0.03 + lower * 0.036 + tick;
    }));
  }

  let paperNoise = 0;
  render("paper", 0.52, (t) => {
    const noise = random() * 2 - 1;
    paperNoise = paperNoise * 0.58 + noise * 0.42;
    const first = Math.exp(-Math.pow((t - 0.1) / 0.08, 2));
    const second = Math.exp(-Math.pow((t - 0.31) / 0.1, 2));
    return paperNoise * (first * 0.19 + second * 0.14);
  });
  render("porcelain", 0.8, (t) => {
    const attack = Math.min(1, t * 140);
    const decay = Math.exp(-t * 9);
    return (
      attack *
      decay *
      (0.24 * Math.sin(2 * Math.PI * 1046 * t) +
        0.12 * Math.sin(2 * Math.PI * 1568 * t) +
        0.08 * Math.sin(2 * Math.PI * 2260 * t))
    );
  });
  render("door-bell", 1.4, (t) => {
    const attack = Math.min(1, t * 80);
    const decay = Math.exp(-t * 3.3);
    return (
      attack *
      decay *
      (0.22 * Math.sin(2 * Math.PI * 784 * t) +
        0.12 * Math.sin(2 * Math.PI * 1176 * t) +
        0.06 * Math.sin(2 * Math.PI * 1764 * t))
    );
  });
  // Tea table cues use their own generator so the cues above stay byte-stable.
  let teaSeed = 20260926;
  const teaRandom = () => {
    teaSeed ^= teaSeed << 13;
    teaSeed ^= teaSeed >>> 17;
    teaSeed ^= teaSeed << 5;
    return (teaSeed >>> 0) / 4294967296;
  };
  // A water stream: low-passed noise with small bubbles, crossfaded into a seamless loop.
  const pourSeconds = 2.4;
  const fade = Math.round(0.25 * rate);
  const raw = new Float32Array(Math.round(pourSeconds * rate) + fade);
  let streamLow = 0;
  let streamBody = 0;
  let bubble = 0;
  let bubbleFrequency = 700;
  let bubblePhase = 0;
  for (let i = 0; i < raw.length; i++) {
    const t = i / rate;
    const noise = teaRandom() * 2 - 1;
    streamLow = streamLow * 0.985 + noise * 0.015;
    streamBody = streamBody * 0.8 + noise * 0.2;
    if (teaRandom() < 0.0011) {
      bubble = 1;
      bubbleFrequency = 520 + teaRandom() * 980;
    }
    bubble *= 0.9982;
    bubblePhase += (2 * Math.PI * bubbleFrequency * (1 + 0.5 * (1 - bubble))) / rate;
    const swell = 0.85 + 0.15 * Math.sin(2 * Math.PI * 2.5 * t);
    raw[i] =
      (streamBody - streamLow) * 0.42 * swell +
      streamLow * 0.9 +
      Math.sin(bubblePhase) * bubble * 0.07;
  }
  const loop = raw.length - fade;
  render("tea-pour", loop / rate, (_t, i) =>
    i < fade ? raw[i] * (i / fade) + raw[loop + i] * (1 - i / fade) : raw[i],
  );
  render("tea-chime", 1.3, (t) => {
    const attack = Math.min(1, t * 220);
    const decay = Math.exp(-t * 4.2);
    return (
      attack *
      decay *
      (0.15 * Math.sin(2 * Math.PI * 1318.5 * t) +
        0.08 * Math.sin(2 * Math.PI * 1975.5 * t) +
        0.05 * Math.sin(2 * Math.PI * 2637 * t) * Math.exp(-t * 5))
    );
  });
  // Kettle on the stove: a low rumble with bubbles popping, looped like the pour.
  const boilSeconds = 3.2;
  const boilRaw = new Float32Array(Math.round(boilSeconds * rate) + fade);
  let rumble = 0;
  let rumbleSlow = 0;
  const pops = [];
  for (let i = 0; i < boilRaw.length; i++) {
    const noise = teaRandom() * 2 - 1;
    rumble = rumble * 0.97 + noise * 0.03;
    rumbleSlow = rumbleSlow * 0.995 + noise * 0.005;
    if (teaRandom() < 0.0005)
      pops.push({ age: 0, frequency: 180 + teaRandom() * 420, phase: 0, level: 0.04 + teaRandom() * 0.06 });
    let popped = 0;
    for (const pop of pops) {
      pop.age += 1 / rate;
      pop.phase += (2 * Math.PI * pop.frequency * (1 + pop.age * 9)) / rate;
      popped += Math.sin(pop.phase) * pop.level * Math.exp(-pop.age * 45);
    }
    while (pops.length && pops[0].age > 0.2) pops.shift();
    boilRaw[i] = (rumble - rumbleSlow) * 0.9 + rumbleSlow * 1.6 + popped;
  }
  const boilLoop = boilRaw.length - fade;
  render("tea-boil", boilLoop / rate, (_t, i) =>
    i < fade ? boilRaw[i] * (i / fade) + boilRaw[boilLoop + i] * (1 - i / fade) : boilRaw[i],
  );
  // An ingredient dropping into tea: a falling plop and a small splash.
  let splash = 0;
  render("tea-drop", 0.45, (t) => {
    const noise = teaRandom() * 2 - 1;
    splash = splash * 0.6 + noise * 0.4;
    const pitch = 780 * Math.exp(-t * 9) + 240;
    const plop = Math.sin(2 * Math.PI * pitch * t) * Math.min(1, t * 400) * Math.exp(-t * 16);
    return plop * 0.22 + splash * Math.exp(-Math.pow((t - 0.03) / 0.03, 2)) * 0.08;
  });
  process.stdout.write(`Rendered ${rendered} original audio cues in Ogg Opus and MP3.\n`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
