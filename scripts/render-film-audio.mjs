// Soundtracks for the brew films: one 10-second track per film, timed to the
// frames in video/src/brew-film.js. Every sound is synthesised here, like
// scripts/render-audio.mjs, and written beside its film as
// public/video/tea/brew-<tea>[-<garnish>]-v1.ogg / .mp3.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";
import { brewFilm, brewFilmGarnishes, brewFilmTeas } from "../video/src/tea-varieties.js";

const rate = 32000;
const seconds = brewFilm.frames / brewFilm.fps;
const output = new URL("../public/video/tea/", import.meta.url).pathname;
const temp = mkdtempSync(join(tmpdir(), "night-bookshop-film-audio-"));

// A shot's local time (0–1, as brew-film.js uses it) in film seconds.
const shot = Object.fromEntries(brewFilm.shots.map((s) => [s.id, s]));
const at = (id, local) => (shot[id].from + local * (shot[id].to - shot[id].from - 1)) / brewFilm.fps;

// How each tea's dry leaves sound tipping into the pot, and the note its
// aroma rings on when the cup is set down (D minor, like the theme).
const leaves = {
  osmanthus: { grains: 26, low: 2600, high: 4200, decay: 220, tone: 0.7, level: 0.1 },
  puer: { grains: 9, low: 900, high: 1600, decay: 110, tone: 0.6, level: 0.16, thud: true },
  mint: { grains: 30, low: 3000, high: 6000, decay: 260, tone: 0.15, level: 0.07 },
  jasmine: { grains: 22, low: 3200, high: 4800, decay: 240, tone: 0.85, level: 0.1, bounce: true },
  black: { grains: 34, low: 2500, high: 5000, decay: 250, tone: 0.35, level: 0.07 },
  chamomile: { grains: 16, low: 1800, high: 3600, decay: 160, tone: 0.1, level: 0.06 },
  lavender: { grains: 30, low: 2400, high: 4600, decay: 230, tone: 0.4, level: 0.075 },
  hojicha: { grains: 24, low: 1800, high: 3500, decay: 180, tone: 0.5, level: 0.09 },
};
const aromaNote = {
  hojicha: 440,
  puer: 587.33,
  lavender: 659.25,
  black: 698.46,
  osmanthus: 880,
  chamomile: 1046.5,
  jasmine: 1174.66,
  mint: 1318.51,
};

function film(tea, garnish) {
  let seed = [...`${tea}-${garnish}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 20261004) || 1;
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const noise = () => random() * 2 - 1;
  const track = new Float32Array(Math.round(seconds * rate));
  const add = (start, length, sample) => {
    const from = Math.max(0, Math.round(start * rate));
    const to = Math.min(track.length, Math.round((start + length) * rate));
    for (let i = from; i < to; i++) track[i] += sample((i - from) / rate, i / rate);
  };
  const ramp = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  // A struck ceramic or metal object: a few inharmonic partials.
  const strike = (start, partials, decay, level) =>
    add(start, 6 / decay, (t) => {
      const envelope = Math.min(1, t * 900) * Math.exp(-t * decay);
      let sum = 0;
      for (const [ratio, gain] of partials) sum += gain * Math.sin(2 * Math.PI * ratio * t);
      return envelope * sum * level;
    });
  // Water falling into a vessel: band-passed noise whose resonance rises as
  // the vessel fills, with small bubbles.
  const stream = (start, end, fade, low, high, level) => {
    let lp = 0,
      band = 0,
      body = 0,
      bubble = 0,
      bubbleHz = 600,
      phase = 0;
    add(start, end - start, (t) => {
      const fill = t / (end - start);
      const centre = low + (high - low) * fill;
      const f = 2 * Math.sin((Math.PI * centre) / rate);
      const n = noise();
      lp += f * band;
      const hp = n - lp - 0.5 * band;
      band += f * hp;
      body = body * 0.82 + n * 0.18;
      if (random() < 0.0012) {
        bubble = 1;
        bubbleHz = centre * (1.2 + random() * 1.4);
      }
      bubble *= 0.998;
      phase += (2 * Math.PI * bubbleHz * (1 + 0.6 * (1 - bubble))) / rate;
      const envelope = Math.min(1, t / fade, (end - start - t) / fade);
      return envelope * level * (band * 0.55 + body * 0.35 + Math.sin(phase) * bubble * 0.12);
    });
  };
  // A small object dropping into tea: a falling plop and a splash.
  const plop = (start, from, to, level) => {
    let splash = 0;
    add(start, 0.5, (t) => {
      splash = splash * 0.55 + noise() * 0.45;
      const pitch = (from - to) * Math.exp(-t * 11) + to;
      const body = Math.sin(2 * Math.PI * pitch * t) * Math.min(1, t * 500) * Math.exp(-t * 14);
      return level * (body + splash * Math.exp(-(((t - 0.02) / 0.025) ** 2)) * 0.5);
    });
  };
  // A soft knock on the wooden counter.
  const thud = (start, hz, level) => {
    let lp = 0;
    add(start, 0.25, (t) => {
      lp = lp * 0.9 + noise() * 0.1;
      return level * Math.exp(-t * 28) * (Math.sin(2 * Math.PI * hz * t) * 0.7 + lp * 2.4);
    });
  };

  // 取茶: the scoop taps the caddy, digs into the leaves, then tips them in.
  const voice = leaves[tea];
  strike(at("scoop", 0.04), [[2350, 0.5], [3720, 0.3], [5100, 0.15]], 30, 0.12);
  let rub = 0;
  add(at("scoop", 0.06), at("scoop", 0.3) - at("scoop", 0.06), (t, now) => {
    rub = rub * 0.4 + noise() * 0.6;
    const swell = Math.sin(Math.PI * ramp(now, at("scoop", 0.06), at("scoop", 0.3)));
    const grain = random() < 0.02 ? 1 : 0.35;
    return rub * swell * grain * voice.level * 1.1;
  });
  const grain = (start, level) => {
    const hz = voice.low + random() * (voice.high - voice.low);
    add(start, 0.06, (t) => {
      const envelope = Math.exp(-t * voice.decay);
      return level * envelope * (voice.tone * Math.sin(2 * Math.PI * hz * t) + (1 - voice.tone) * noise());
    });
  };
  const landFrom = at("scoop", 0.78),
    landTo = at("scoop", 0.92);
  for (let i = 0; i < voice.grains; i++) {
    const start = landFrom + (landTo - landFrom) * Math.pow(random(), 1.4);
    const level = voice.level * 2 * (0.4 + random() * 0.6);
    grain(start, level);
    if (voice.bounce && random() < 0.6) grain(start + 0.035 + random() * 0.03, level * 0.35);
  }
  if (voice.thud) [0, 0.09, 0.2].forEach((d) => thud(landFrom + d, 210, 0.08));

  // 注水: the kettle pours until the stream thins at local 0.8–0.88.
  stream(at("infuse", 0), at("infuse", 0.86), 0.06, 380, 820, 0.42);
  const lands = at("infuse", 0.37);
  if (garnish === "apple") plop(lands, 820, 260, 0.2);
  if (garnish === "lemon") plop(lands, 980, 320, 0.2);
  if (garnish === "caramel") {
    plop(lands, 680, 210, 0.24);
    // It melts as it sinks: a faint fizz.
    let fizz = 0;
    add(lands + 0.12, at("infuse", 1) - lands - 0.12, (t) => {
      fizz = fizz * 0.3 + noise() * 0.7;
      const crackle = random() < 0.004 ? 1 : 0.15;
      return fizz * crackle * 0.05 * Math.exp(-t * 1.4);
    });
  }
  if (garnish === "honey") {
    // The honey thread lands from local 0.54: slow, soft drops.
    [0.56, 0.68, 0.8, 0.93].forEach((local, i) => plop(at("infuse", local), 300, 170, 0.12 * Math.pow(0.8, i)));
  }

  // 倒茶: lid knocks as the pot lifts, tea runs into the cup, pot set down.
  strike(at("pour", 0.1), [[1900, 0.5], [2840, 0.3], [4100, 0.12]], 45, 0.05);
  stream(at("pour", 0.3), at("pour", 0.74), 0.08, 700, 1300, 0.3);
  thud(at("pour", 0.94), 170, 0.09);
  strike(at("pour", 0.94) + 0.03, [[1900, 0.5], [2840, 0.3]], 60, 0.025);

  // 奉茶: the saucer slides across the counter, the cup settles, hands rest,
  // and the tea's aroma rings once.
  let slide = 0;
  const slideFrom = at("serve", 0.02),
    slideTo = at("serve", 0.56);
  add(slideFrom, slideTo - slideFrom, (t) => {
    slide = slide * 0.96 + noise() * 0.04;
    const speed = Math.sin(Math.PI * (t / (slideTo - slideFrom)));
    return slide * speed * speed * 0.55;
  });
  for (let i = 0; i < 5; i++)
    strike(slideFrom + 0.2 + random() * (slideTo - slideFrom - 0.4), [[2600, 0.5], [3900, 0.25]], 70, 0.012);
  strike(slideTo, [[2600, 0.5], [3900, 0.3], [5300, 0.15]], 32, 0.07);
  let slosh = 0;
  add(at("serve", 0.5), at("serve", 0.9) - at("serve", 0.5), (t) => {
    slosh = slosh * 0.93 + noise() * 0.07;
    return slosh * Math.sin(2 * Math.PI * 7 * t) * Math.exp(-t * 5) * 0.4;
  });
  thud(at("serve", 0.86), 140, 0.035);
  thud(at("serve", 0.9), 150, 0.03);
  const note = aromaNote[tea];
  add(at("serve", 0.5), seconds - at("serve", 0.5), (t) => {
    const envelope = Math.min(1, t * 120) * Math.exp(-t * 2.2);
    return (
      envelope *
      (0.07 * Math.sin(2 * Math.PI * note * t) +
        0.03 * Math.sin(2 * Math.PI * note * 2.003 * t) +
        0.015 * Math.sin(2 * Math.PI * note * 2.76 * t) * Math.exp(-t * 4))
    );
  });
  if (brewFilmTeas[tea].aroma.kind === "ember")
    for (let i = 0; i < 14; i++) grain(at("serve", 0.45) + random() * 1.3, 0.025);

  // A short fade so the track ends with the film's last frame, not a click.
  const tail = Math.round(0.15 * rate);
  for (let i = 0; i < tail; i++) track[track.length - 1 - i] *= i / tail;
  for (let i = 0; i < track.length; i++) track[i] = Math.tanh(track[i] * 1.1) / 1.1;
  return track;
}

function wave(samples) {
  const data = Buffer.alloc(44 + samples.length * 2);
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
  data.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), 44 + i * 2),
  );
  return data;
}

const films = [
  ...Object.keys(brewFilmTeas).map((tea) => [tea, "none"]),
  ...Object.entries(brewFilmGarnishes).flatMap(([garnish, { teas }]) => teas.map((tea) => [tea, garnish])),
];
try {
  for (const [tea, garnish] of films) {
    const name = garnish === "none" ? `brew-${tea}-v1` : `brew-${tea}-${garnish}-v1`;
    const samples = film(tea, garnish);
    const peak = samples.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
    if (peak < 0.05 || peak > 1) throw new Error(`${name}: peak ${peak.toFixed(3)}`);
    const wav = join(temp, `${name}.wav`);
    writeFileSync(wav, wave(samples));
    for (const [extension, codec, sampleRate] of [
      ["ogg", "libopus", "48000"],
      ["mp3", "libmp3lame", "32000"],
    ]) {
      const file = join(output, `${name}.${extension}`);
      const encode = spawnSync(
        "ffmpeg",
        ["-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-ar", sampleRate, "-ac", "1", "-c:a", codec, "-b:a", "56k", file],
        { encoding: "utf8" },
      );
      if (encode.status !== 0) throw new Error(`ffmpeg ${name}.${extension}: ${encode.stderr}`);
      const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
        encoding: "utf8",
      });
      const duration = Number(probe.stdout.trim());
      // The track is the film's length; MP3 framing may pad a few milliseconds.
      if (!(Math.abs(duration - seconds) < 0.08)) throw new Error(`${file}: ${duration}s, not ${seconds}s`);
      if (readFileSync(file).length > 256 * 1024) throw new Error(`${file} is larger than 256 KiB`);
    }
    process.stdout.write(`${name}: peak ${peak.toFixed(2)}\n`);
  }
  process.stdout.write(`Rendered ${films.length} brew film soundtracks in Ogg Opus and MP3.\n`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
