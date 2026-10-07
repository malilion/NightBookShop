// 把選定的 Lyria 3.5 配樂剪成無縫循環，輸出到 public/audio/music/<id>.{ogg,mp3}。
// 原檔：art-staging/music/lyria/<id>.mp3（從 Gemini「創作音樂」下載後改名，提示詞見 generate-music.mjs）。
//
// 做法：
// - 去掉開頭與結尾的靜音，並捨棄最後 8 秒（避免收尾的漸慢與餘音進入循環）；
// - 在剩下的後三分之一裡，找短時音量包絡與開頭 3 秒最像的位置當循環終點；
// - 終點前 3 秒以等功率交叉淡化接回開頭，循環從第 3 秒開始，所以接縫在交叉淡化裡；
// - 響度對齊原本的主題曲（-34 LUFS），單聲道 Opus 40k、MP3 56k。
// 執行：npm run import:music [-- --only=jinglan,boyan]（需要 FFmpeg 的 libopus 與 libmp3lame）
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const musicIds = [
  "theme",
  "jinglan",
  "boyan",
  "ruoyin",
  "yenuan",
  "yuhang",
  "haiming",
  "lincheng",
  "memory",
  "ending",
  "midnight-tea",
];
const sourceDir = "art-staging/music/lyria";
const outDir = "public/audio/music";
const rate = 44100;
const crossfade = 3;
const dropTail = 8;
const targetLufs = -34;

function ffmpeg(args, input) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { input, maxBuffer: 1 << 30 });
  if (result.status !== 0) throw new Error(`ffmpeg 失敗：${result.stderr}`);
  return result;
}
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ids = onlyArg ? onlyArg.slice(7).split(",") : musicIds.filter((id) => existsSync(join(sourceDir, `${id}.mp3`)));
mkdirSync(outDir, { recursive: true });

for (const id of ids) {
  const source = join(sourceDir, `${id}.mp3`);
  if (!existsSync(source)) throw new Error(`找不到 ${source}`);
  const temp = mkdtempSync(join(tmpdir(), "music-"));
  try {
    const raw = join(temp, "source.f32");
    ffmpeg(["-i", source, "-ac", "1", "-ar", String(rate), "-f", "f32le", raw]);
    const buffer = readFileSync(raw);
    const x = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);

    // 50 毫秒一格的 RMS 包絡，用來找頭尾靜音與循環終點。
    const hop = Math.round(rate * 0.05);
    const env = new Float32Array(Math.floor(x.length / hop));
    for (let f = 0; f < env.length; f++) {
      let s = 0;
      for (let i = f * hop; i < (f + 1) * hop; i++) s += x[i] ** 2;
      env[f] = Math.sqrt(s / hop);
    }
    const peak = Math.max(...env);
    const floor = peak * 10 ** (-45 / 20);
    let first = env.findIndex((v) => v > floor);
    let last = env.length - 1;
    while (last > first && env[last] < floor) last--;
    const start = first * hop;
    const end = (last + 1) * hop - dropTail * rate;
    const fade = crossfade * rate;
    if (end - start < 60 * rate) throw new Error(`${id} 太短，無法做循環。`);

    // 終點候選：讓 [L - fade, L) 的包絡與 [start, start + fade) 最像。
    const headFrames = Array.from(env.slice(first, first + fade / hop));
    const corr = (a, b) => {
      const n = a.length;
      const ma = a.reduce((s, v) => s + v, 0) / n;
      const mb = b.reduce((s, v) => s + v, 0) / n;
      let ab = 0, aa = 0, bb = 0;
      for (let i = 0; i < n; i++) {
        ab += (a[i] - ma) * (b[i] - mb);
        aa += (a[i] - ma) ** 2;
        bb += (b[i] - mb) ** 2;
      }
      // 音量也要接近：相關之外，懲罰平均音量差。
      return ab / Math.sqrt(aa * bb + 1e-12) - Math.abs(Math.log((ma + 1e-6) / (mb + 1e-6)));
    };
    let best = { score: -Infinity, frame: 0 };
    const lo = Math.floor((start + (end - start) * 0.66) / hop);
    for (let f = lo; f <= Math.floor(end / hop); f++) {
      const score = corr(headFrames, Array.from(env.slice(f - fade / hop, f)));
      if (score > best.score) best = { score, frame: f };
    }
    const loopEnd = best.frame * hop;

    // 循環 = x[start + fade, loopEnd)，其中最後 fade 個取樣把 x[loopEnd - fade, loopEnd) 淡出、
    // x[start, start + fade) 淡入；播完正好接回 x[start + fade]。
    const loop = new Float32Array(loopEnd - start - fade);
    let k = 0;
    for (let i = start + fade; i < loopEnd - fade; i++) loop[k++] = x[i];
    for (let i = 0; i < fade; i++) {
      const t = (i / fade) * (Math.PI / 2);
      loop[k++] = x[loopEnd - fade + i] * Math.cos(t) + x[start + i] * Math.sin(t);
    }
    const loopRaw = join(temp, "loop.f32");
    writeFileSync(loopRaw, Buffer.from(loop.buffer));

    const input = ["-f", "f32le", "-ar", String(rate), "-ac", "1", "-i", loopRaw];
    const measured = spawnSync("ffmpeg", ["-hide_banner", ...input, "-af", "ebur128", "-f", "null", "-"], { maxBuffer: 1 << 26 });
    const integrated = Number([...measured.stderr.toString().matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].at(-1)?.[1]);
    if (!Number.isFinite(integrated)) throw new Error(`${id} 無法量測響度。`);
    const gain = targetLufs - integrated;
    for (const [extension, codec, bitrate] of [["ogg", "libopus", "40k"], ["mp3", "libmp3lame", "56k"]])
      ffmpeg([...input, "-af", `volume=${gain.toFixed(2)}dB`, "-c:a", codec, "-b:a", bitrate, join(outDir, `${id}.${extension}`)]);
    console.log(
      `${id}：循環 ${(loop.length / rate).toFixed(1)} 秒（原檔 ${(start / rate).toFixed(1)}–${(loopEnd / rate).toFixed(1)} 秒，` +
        `接點分數 ${best.score.toFixed(2)}），原始響度 ${integrated} LUFS，增益 ${gain.toFixed(1)} dB。`,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
