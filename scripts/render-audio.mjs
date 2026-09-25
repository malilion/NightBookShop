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
function render(name, seconds, sample, bitrate = "64k") {
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
  const chord = [146.832, 174.614, 220, 329.628];
  const melody = [587.33, 440, 349.23, 329.63];
  render(
    "midnight-theme",
    16,
    (t) => {
      const swell =
        0.64 + 0.26 * Math.sin((2 * Math.PI * t) / 16 - Math.PI / 2);
      let pad = 0;
      for (const frequency of chord) {
        pad += Math.sin(2 * Math.PI * frequency * t) * 0.55;
        pad += Math.sin(2 * Math.PI * frequency * 2.003 * t) * 0.13;
      }
      let motif = 0;
      for (let i = 0; i < 4; i++) {
        const since = t - i * 4;
        if (since < 0) continue;
        const envelope = (1 - Math.exp(-since * 24)) * Math.exp(-since * 1.8);
        motif += envelope * Math.sin(2 * Math.PI * melody[i] * since);
      }
      const edge = Math.min(1, t * 4, (16 - t) * 4);
      return edge * (pad * 0.025 * swell + motif * 0.052);
    },
    "80k",
  );

  let rainLow = 0;
  let rainMid = 0;
  let drop = 0;
  let dropPhase = 0;
  render("rain-window", 16, (t) => {
    const noise = random() * 2 - 1;
    rainLow = rainLow * 0.995 + noise * 0.005;
    rainMid = rainMid * 0.72 + noise * 0.28;
    if (random() < 0.00007) drop = 1;
    drop *= 0.9993;
    dropPhase += (2 * Math.PI * 1200) / rate;
    const edge = Math.min(1, t * 20, (16 - t) * 20);
    return edge * (
      (rainMid - rainLow) * 0.19 +
      rainLow * 0.2 +
      Math.sin(dropPhase) * drop * 0.014
    );
  });

  let roomLow = 0;
  let roomMid = 0;
  render("bookshop-room", 16, (t) => {
    const noise = random() * 2 - 1;
    roomLow = roomLow * 0.999 + noise * 0.001;
    roomMid = roomMid * 0.93 + noise * 0.07;
    const phase = t % 4;
    const tick =
      phase < 0.05
        ? Math.sin(2 * Math.PI * 920 * phase) * Math.exp(-phase * 95) * 0.055
        : 0;
    const edge = Math.min(1, t * 20, (16 - t) * 20);
    return edge * (roomLow * 0.9 + roomMid * 0.09 + tick);
  });

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
  process.stdout.write("Rendered 6 original audio cues in Ogg Opus and MP3.\n");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
