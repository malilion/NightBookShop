import { StoryBridge } from "../src/story/storyBridge";
import type { StoryFrame, TeaId } from "../src/types/game";

// Plays a compiled chapter, preferring choices that contain a hint and finishing
// every minigame well, until `reached(frame)` holds. Returns the story at that
// frame, or null if the chapter ended first.
export function playTo(storyJson: string, teaId: TeaId, hints: string[], reached: (frame: StoryFrame) => boolean) {
  const story = new StoryBridge(storyJson);
  story.next();
  for (let step = 0; step < 700; step++) {
    const frame = story.frame;
    if (reached(frame)) return story;
    if (frame.mode === "ending") break;
    if (frame.mode === "tea") story.finishTea({ teaId, garnish: "none", quality: 95, emotionalMatch: 100 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (frame.mode === "melody") story.finishMelody(true);
    else if (frame.mode === "hearth") story.finishHearth({ heat: 50, care: 50, balanced: true });
    else if (frame.mode === "route") story.finishRoute({ correct: 3, detours: 0 });
    else if (frame.mode === "lamp") story.finishLamp({ brightness: 50, steady: 50, balanced: true });
    else if (frame.mode === "archive") story.finishArchive({ count: 5, complete: true });
    else if (frame.mode === "notifications") story.finishNotifications({ allPaused: true, repliedMother: true });
    else if (frame.canContinue) story.next();
    else {
      const choice = hints.map((hint) => frame.choices.find((entry) => entry.text.includes(hint))).find(Boolean) ?? frame.choices[0];
      story.choose(choice!.index);
    }
  }
  return null;
}

/** Plays until a line containing `line` comes up. */
export const playUntil = (storyJson: string, teaId: TeaId, hints: string[], line: string) =>
  playTo(storyJson, teaId, hints, (frame) => frame.text.includes(line));
