import { Compiler } from "inkjs/full";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
const file = resolve("story/main.ink");
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
writeFileSync("public/story/compiled/main.json", story.ToJson());
console.log("Ink compiled: complete Jinglan chapter.");
