// 書店主題曲：薩提〈吉諾佩第一號〉，Robin Alciatore 演奏（Musopen），公有領域。
// 原始錄音：art-staging/music/satie-gymnopedie-1-alciatore.ogg
// （https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg）
//
// 這首曲子前後兩段幾乎相同，所以只取第一段做循環，約 88 秒：
// - 循環從第二段開頭（91 秒）開始，帶著第一段最後一個和弦的餘音；
// - 第二段開始後一點，在局部波形最吻合的位置交叉淡化接回第一段；
// - 循環結尾是第一段最後一個取樣，下一個取樣正好是循環開頭，所以接縫在原曲裡本來就相連。
// 真人演奏兩段速度不同，接點用 1 秒視窗在 3–12 秒之間逐點搜尋；下列數值是搜尋結果，
// 加上 `--search` 會重新搜尋並印出。音量對齊原本的配樂（-34 LUFS），單聲道 Opus 40k、MP3 56k。
// 執行：npm run import:theme（需要 FFmpeg 的 libopus 與 libmp3lame）
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const source = "art-staging/music/satie-gymnopedie-1-alciatore.ogg";
const rate = 44100;
const firstNote = 2.2; // 秒：第一段的第一個音
const repeat = 90.9726; // 秒：第二段開頭（與第一段的波形相關最大處）
let splice = 3.4; // 秒：進入第二段後的接點
let lag = -0.3102; // 秒：第二段在接點附近相對第一段的時間差
const crossfade = 0.25;
const targetLufs = -34;

function ffmpeg(args, input) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { input, maxBuffer: 1 << 30 });
  if (result.status !== 0) throw new Error(`ffmpeg 失敗：${result.stderr}`);
  return result;
}
const temp = mkdtempSync(join(tmpdir(), "theme-"));
try {
  const raw = join(temp, "source.f32");
  ffmpeg(["-i", source, "-ac", "1", "-ar", String(rate), "-f", "f32le", raw]);
  const buffer = readFileSync(raw);
  const x = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
  const a = Math.round(firstNote * rate);
  const b = Math.round(repeat * rate);
  const corr = (p, q, n, step = 1) => {
    let pq = 0, pp = 0, qq = 0;
    for (let i = 0; i < n; i += step) {
      pq += x[p + i] * x[q + i];
      pp += x[p + i] ** 2;
      qq += x[q + i] ** 2;
    }
    return pq / Math.sqrt(pp * qq + 1e-12);
  };
  if (process.argv.includes("--search")) {
    const window = rate;
    let best = { c: -1, splice: 0, lag: 0 };
    for (let t = 3; t < 12; t += 0.05)
      for (let l = -Math.round(0.4 * rate); l < 0.4 * rate; l += 220) {
        const c = corr(a + Math.round(t * rate), b + Math.round(t * rate) + l, window, 4);
        if (c > best.c) best = { c, splice: t, lag: l / rate };
      }
    splice = best.splice;
    lag = best.lag;
    console.log(`接點 ${splice.toFixed(2)} 秒，時間差 ${(lag * 1000).toFixed(1)} 毫秒，相關 ${best.c.toFixed(3)}`);
  }
  const pa = a + Math.round(splice * rate);
  const pb = b + Math.round(splice * rate) + Math.round(lag * rate);
  const fade = Math.round(crossfade * rate);
  const loop = new Float32Array(pb - b + fade + (b - pa - fade));
  let k = 0;
  for (let i = b; i < pb; i++) loop[k++] = x[i];
  for (let i = 0; i < fade; i++) {
    const t = (i / fade) * (Math.PI / 2);
    loop[k++] = x[pb + i] * Math.cos(t) + x[pa + i] * Math.sin(t);
  }
  for (let i = pa + fade; i < b; i++) loop[k++] = x[i];
  const loopRaw = join(temp, "loop.f32");
  writeFileSync(loopRaw, Buffer.from(loop.buffer));

  const input = ["-f", "f32le", "-ar", String(rate), "-ac", "1", "-i", loopRaw];
  const measured = spawnSync("ffmpeg", ["-hide_banner", ...input, "-af", "ebur128", "-f", "null", "-"], { maxBuffer: 1 << 26 });
  const integrated = Number([...measured.stderr.toString().matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].at(-1)?.[1]);
  if (!Number.isFinite(integrated)) throw new Error("無法量測響度。");
  const gain = targetLufs - integrated;
  for (const [extension, codec, bitrate] of [["ogg", "libopus", "40k"], ["mp3", "libmp3lame", "56k"]])
    ffmpeg([...input, "-af", `volume=${gain.toFixed(2)}dB`, "-c:a", codec, "-b:a", bitrate, `public/audio/midnight-theme.${extension}`]);
  console.log(`主題曲：${(loop.length / rate).toFixed(2)} 秒，原始響度 ${integrated} LUFS，增益 ${gain.toFixed(1)} dB。`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
