import { assets } from "./assets";
import type { PortraitCue } from "../types/game";

// An Ink `# portrait:` cue picks the image; without one, the visitor of the scene.
export const portraitCues: Record<Exclude<PortraitCue, "none">, { src: string; kind: string }> = {
  owner: { src: assets.characters.owner, kind: "owner" },
  "owner-apology": { src: assets.characters.ownerApology, kind: "owner" },
  "lincheng-child": { src: assets.characters.linchengChild, kind: "child" },
  lincheng: { src: assets.characters.lincheng, kind: "self" },
  "lincheng-tearful": { src: assets.characters.linchengTearful, kind: "self" },
  "jinglan-tearful": { src: assets.characters.jinglanTearful, kind: "visitor" },
  "jinglan-smile": { src: assets.characters.jinglanSmile, kind: "visitor" },
  "boyan-soft": { src: assets.characters.boyanSoft, kind: "visitor" },
  "boyan-tense": { src: assets.characters.boyanTense, kind: "visitor" },
  "ruoyin-reflective": { src: assets.characters.ruoyinReflective, kind: "visitor" },
  "ruoyin-smile": { src: assets.characters.ruoyinSmile, kind: "visitor" },
  "yenuan-thoughtful": { src: assets.characters.yenuanThoughtful, kind: "visitor" },
  "yenuan-tearful": { src: assets.characters.yenuanTearful, kind: "visitor" },
  "yuhang-hopeful": { src: assets.characters.yuhangHopeful, kind: "visitor" },
  "yuhang-worried": { src: assets.characters.yuhangWorried, kind: "visitor" },
  "haiming-searching": { src: assets.characters.haimingSearching, kind: "visitor" },
  "haiming-warm": { src: assets.characters.haimingWarm, kind: "visitor" },
};
