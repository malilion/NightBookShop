import { Compiler } from "inkjs/full";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
// `--only=ch04` compiles just the sources whose path contains that text.
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice("--only=".length);
for (const [source, output] of [
  ["story/main.ink", "main.json"],
  ["story/chapters/ch02_boyan.ink", "boyan-chapter-25.json"],
  ["story/chapters/ch03_ruoyin.ink", "ruoyin-chapter-25.json"],
  ["story/chapters/ch04_yenuan.ink", "yenuan-chapter-23.json"],
  ["story/chapters/ch05_yuhang.ink", "yuhang-chapter-25.json"],
  ["story/chapters/ch06_haiming.ink", "haiming-chapter-29.json"],
  ["story/chapters/finale_lincheng.ink", "lincheng-chapter-21.json"],
].filter(([source]) => !only || source.includes(only))) {
  const file = resolve(source);
  const issues = [];
  let story;
  try {
    story = new Compiler(readFileSync(file, "utf8"), {
      sourceFilename: file,
      errorHandler: (message) => issues.push(message),
      fileHandler: {
        ResolveInkFilename: (name) => resolve(dirname(file), name),
        LoadInkFileContents: (name) => readFileSync(name, "utf8"),
      },
    }).Compile();
  } catch (error) {
    console.error(issues.join("\n") || error.message);
    process.exit(1);
  }
  if (issues.length) throw new Error(issues.join("\n"));
  mkdirSync("public/story/compiled", { recursive: true });
  writeFileSync(`public/story/compiled/${output}`, story.ToJson());
  console.log(`Ink compiled: ${source}`);
}
