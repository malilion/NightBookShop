import { StoryBridge } from "../src/story/storyBridge";
import type { TeaId } from "../src/types/game";

// How long a chapter takes to play, estimated from the text a route shows.
// The model is deliberately brisk so a slower, real reader only takes longer:
// 400 characters a minute of silent reading, 0.8 s to advance each line,
// 3 s to pick each choice, and fixed minutes for the hands-on parts.
export const readingModel = {
  charsPerMinute: 400,
  secondsPerLine: 0.8,
  secondsPerChoice: 3,
  // The opening checklist before every night, outside the Ink story.
  openingMinutes: 1,
  minigameMinutes: { tea: 4, letter: 3, melody: 3, hearth: 3, route: 3, lamp: 3, archive: 3, notifications: 3 } as Record<string, number>,
} as const;

export type Route = "first" | "explore";
export interface Measure {
  chars: number;
  lines: number;
  choices: number;
  minigames: string[];
  minutes: number;
  ending: string;
}

/**
 * Plays a chapter to an ending. "first" always takes the first option, the
 * fixed route earlier measurements used; "explore" takes the first option it
 * has not taken yet, the way a curious player opens every question.
 */
export function measure(storyJson: string, teaId: TeaId, route: Route): Measure {
  const story = new StoryBridge(storyJson);
  story.next();
  const taken = new Set<string>();
  let chars = 0;
  let lines = 0;
  let choices = 0;
  const minigames: string[] = [];
  for (let step = 0; step < 3000 && story.frame.mode !== "ending"; step++) {
    const frame = story.frame;
    if (frame.mode === "dialogue" && frame.text) {
      chars += frame.text.replace(/\s/g, "").length;
      lines++;
    }
    if (frame.mode !== "dialogue") minigames.push(frame.mode);
    if (frame.mode === "tea") story.finishTea({ teaId, garnish: "none", quality: 90, emotionalMatch: 90 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (frame.mode === "melody") story.finishMelody(true);
    else if (frame.mode === "hearth") story.finishHearth({ heat: 50, care: 50, balanced: true });
    else if (frame.mode === "route") story.finishRoute({ correct: 3, detours: 0 });
    else if (frame.mode === "lamp") story.finishLamp({ brightness: 50, steady: 50, balanced: true });
    else if (frame.mode === "archive") story.finishArchive({ count: 5, complete: true });
    else if (frame.mode === "notifications") story.finishNotifications({ allPaused: true, repliedMother: true });
    else if (frame.canContinue) story.next();
    else {
      choices++;
      const choice = route === "explore" ? (frame.choices.find((entry) => !taken.has(entry.text)) ?? frame.choices[0]!) : frame.choices[0]!;
      taken.add(choice.text);
      chars += choice.text.replace(/\s/g, "").length;
      story.choose(choice.index);
    }
  }
  if (story.frame.text) {
    chars += story.frame.text.replace(/\s/g, "").length;
    lines++;
  }
  const m = readingModel;
  const minutes =
    chars / m.charsPerMinute +
    (lines * m.secondsPerLine + choices * m.secondsPerChoice) / 60 +
    m.openingMinutes +
    minigames.reduce((sum, mode) => sum + (m.minigameMinutes[mode] ?? 0), 0);
  return { chars, lines, choices, minigames, minutes: Math.round(minutes * 10) / 10, ending: story.frame.endingId };
}
