// 以 Google Lyria 3.5（Gemini API，模型 lyria-3.5）生成配樂候選。
// 每首曲子的提示詞在下方 tracks；輸出到 art-staging/music/lyria/<id>-<take>.mp3，
// 並把提示詞、模型與時間寫進同名 .json，方便日後追溯來源。
// 生成的音檔帶 SynthID 浮水印。選定的候選再以 `npm run import:music` 剪成循環。
//
// 執行：GEMINI_API_KEY=… npm run generate:music -- [--only=jinglan,boyan] [--takes=2]
// 已存在的候選不會重算；費用約每首 0.08 美元。
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Buffer } from "node:buffer";
import { setTimeout } from "node:timers/promises";

/* global fetch */
const outDir = "art-staging/music/lyria";
const model = "lyria-3.5";
const endpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";

// 共同要求：純器樂、安靜、適合放在對話底下，音量起伏小。
const base =
  "Instrumental only, no vocals, no singing, no humming, no choir. " +
  "Quiet background score for a narrative visual novel set in a small bookshop that only opens at night; " +
  "it must sit under reading without pulling attention: soft dynamics, no drums or percussion hits, " +
  "no sudden builds, no fade-out ending, intimate close-miked recording, gentle room reverb. " +
  "Around two and a half minutes.";
// 段落時間讓結尾回到開頭的音量與材料，方便 import-music 剪成循環。
const structure =
  "[0:00 - 0:20] Intro: the main instrument alone states the opening phrase, intensity 2/10. " +
  "[0:20 - 1:10] A section: the melody unfolds, intensity 3/10. " +
  "[1:10 - 2:00] B section: the second instrument joins, warmer harmony, intensity 4/10, still quiet. " +
  "[2:00 - 2:40] Return: back to the opening phrase and texture at intensity 2/10, " +
  "no ritardando, no final cadence, no fade-out, as if the piece will begin again.";

export const tracks = {
  theme:
    "Main theme of the night bookshop. Solo felt piano with a soft cello line joining in the second half. " +
    "Slow three-four time around 66 BPM, D minor drifting to F major. Warm, lonely but welcoming, " +
    "like lamplight on old paper while rain falls outside.",
  jinglan:
    "Night one: an elderly retired teacher carrying a love letter she never sent for fifty years. " +
    "Solo upright piano and a distant viola, slow 60 BPM, G major with wistful minor turns, " +
    "moonlight, osmanthus blossoms, an empty railway platform at night. Tender and nostalgic, never sad for long.",
  boyan:
    "Night two: an exhausted office worker who has not stopped working for years and is finally allowed to rest. " +
    "Muted Rhodes electric piano and warm low pads, very slow 56 BPM, A flat major, long sustained chords " +
    "that feel like breathing out. Late-night city calm, a watch stopped at 23:47, relief and tiredness.",
  ruoyin:
    "Night three: a young violinist with an injured left hand and a final bar she has never written. " +
    "Solo violin played softly with mute, accompanied by sparse piano, 64 BPM, E minor to G major, " +
    "phrases that pause and leave rests, hopeful and fragile, an empty classroom in the rain.",
  yenuan:
    "Night four: a baker carrying a burnt birthday loaf and her late mother's handwritten recipe card. " +
    "Nylon-string guitar and soft accordion in a gentle slow waltz, 72 BPM, F major, homely and bittersweet, " +
    "the warmth of an oven after closing time, flour on a wooden counter.",
  yuhang:
    "Night five: a night-shift postman who keeps writing letters addressed to himself, waiting for the last train. " +
    "Fingerpicked acoustic guitar with a soft upright bass and faint brushed texture without beats, 70 BPM, " +
    "C major with suspended chords, rainy bus stop under a streetlight, quiet and patient, a little lonely.",
  haiming:
    "Night six: an old lighthouse keeper who is losing his memory, remembering the sea and a paper boat. " +
    "Harmonium drones, low solo piano and slow string swells like sea swell, 52 BPM, D dorian, " +
    "fog over dark water, a lamp turning far away, tender and vast.",
  lincheng:
    "Finale: the night clerk finally sits down as a guest and reads her own letter before dawn. " +
    "Solo piano opening, a small string ensemble entering very gently, 66 BPM, D minor resolving to D major, " +
    "slow brightening toward sunrise, the theme of the bookshop transformed into quiet hope.",
  memory:
    "Memory scenes: stepping inside someone's remembered past. Celesta and music-box tones over hazy piano " +
    "with long reverb and soft tape warmth, rubato around 60 BPM, B flat major with blurred harmony, " +
    "dreamlike, slightly out of focus, safe and intimate.",
  ending:
    "Ending scenes over a sea of moonlight: a guest has made their choice and walks on. Piano and soft strings, " +
    "60 BPM, E flat major, open and peaceful, gently resolved, a long exhale after a long night, " +
    "moonlight on calm water.",
  "midnight-tea":
    "Midnight tea table: brewing tea alone in the quiet shop after hours. Soft felt piano and warm Rhodes, " +
    "relaxed lo-fi feeling but no drums and no beat, 68 BPM, F major seventh chords, " +
    "kettle steam, porcelain, rain on the window, unhurried and cozy.",
};

export const promptFor = (id) => `${base} ${tracks[id]} ${structure}`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
      const [key, value = "true"] = a.slice(2).split("=");
      return [key, value];
    }),
  );
  const only = args.only ? args.only.split(",") : Object.keys(tracks);
  const takes = Number(args.takes ?? 2);
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("需要環境變數 GEMINI_API_KEY。");
    process.exit(1);
  }
  for (const id of only) if (!tracks[id]) throw new Error(`沒有這首曲子：${id}`);
  mkdirSync(outDir, { recursive: true });

  function findAudio(node) {
    if (!node || typeof node !== "object") return null;
    if (typeof node.data === "string" && node.data.length > 1000) return node;
    for (const value of Object.values(node)) {
      const found = findAudio(value);
      if (found) return found;
    }
    return null;
  }

  async function generate(id, take) {
    const file = join(outDir, `${id}-${take}.mp3`);
    if (existsSync(file)) return console.log(`略過 ${file}（已存在）`);
    const prompt = promptFor(id);
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: prompt, response_format: { type: "audio" } }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error(`${id}-${take} 第 ${attempt} 次失敗：${response.status} ${JSON.stringify(body).slice(0, 400)}`);
        if (response.status < 500 && response.status !== 429) throw new Error("請求被拒，停止。");
        await setTimeout(5000 * attempt);
        continue;
      }
      const audio = findAudio(body);
      if (!audio) throw new Error(`${id}-${take} 回應裡沒有音訊：${JSON.stringify(body).slice(0, 400)}`);
      writeFileSync(file, Buffer.from(audio.data, "base64"));
      writeFileSync(
        file.replace(/\.mp3$/, ".json"),
        JSON.stringify({ model, prompt, mimeType: audio.mime_type ?? audio.mimeType ?? null, generatedAt: new Date().toISOString() }, null, 2) + "\n",
      );
      return console.log(`完成 ${file}`);
    }
    throw new Error(`${id}-${take} 重試三次仍失敗。`);
  }

  for (const id of only) for (let take = 1; take <= takes; take++) await generate(id, take);
}
