import { Story } from "inkjs";
import { parseTag } from "./commandParser";
import type { StoryFrame, TeaResult } from "../types/game";
export class StoryBridge {
  readonly story: Story;
  frame: StoryFrame = {
    section: "prologue",
    clues: [],
    fragments: [],
    text: "",
    speaker: "旁白",
    scene: "counter",
    mode: "dialogue",
    choices: [],
    canContinue: true,
    endingId: "",
  };
  constructor(json: string) {
    this.story = new Story(json);
  }
  next(): StoryFrame {
    if (this.frame.mode !== "dialogue") return this.frame;
    let text = "";
    while (this.story.canContinue && !text) {
      text = this.story.Continue()?.trim() ?? "";
      for (const tag of this.story.currentTags ?? []) {
        const command = parseTag(tag);
        if (command.type === "section") this.frame.section = command.value;
        if (
          command.type === "clue" &&
          !this.frame.clues.includes(command.value)
        )
          this.frame.clues.push(command.value);
        if (
          command.type === "fragment" &&
          !this.frame.fragments.includes(command.value)
        )
          this.frame.fragments.push(command.value);
        if (command.type === "scene") this.frame.scene = command.value;
        if (command.type === "speaker") this.frame.speaker = command.value;
        if (command.type === "minigame") this.frame.mode = command.value;
        if (command.type === "ending") {
          this.frame.mode = "ending";
          this.frame.endingId = command.value;
        }
      }
      if (this.frame.mode !== "dialogue") break;
    }
    this.frame.text = text;
    this.syncChoices();
    return structuredClone(this.frame);
  }
  private syncChoices() {
    this.frame.choices = this.story.currentChoices.map((c) => ({
      index: c.index,
      text: c.text,
    }));
    this.frame.canContinue = this.story.canContinue;
  }
  choose(index: number) {
    if (
      this.frame.mode !== "dialogue" ||
      !this.frame.choices.some((c) => c.index === index)
    )
      throw new Error("此選項目前無法選擇。");
    this.story.ChooseChoiceIndex(index);
    return this.next();
  }
  finishTea(result: TeaResult) {
    if (this.frame.mode !== "tea") throw new Error("目前不是製茶階段。");
    this.story.variablesState["tea_type"] = result.teaId;
    this.story.variablesState["tea_quality"] = result.quality;
    this.story.variablesState["tea_emotional_match"] = result.emotionalMatch;
    return this.resume("tea_result");
  }
  finishLetter(result: {
    completion: number;
    understood: boolean;
    alternate?: boolean;
  }) {
    if (this.frame.mode !== "letter") throw new Error("目前不是拼信階段。");
    if (this.story.variablesState["letter_alternate"] !== null)
      this.story.variablesState["letter_alternate"] = result.alternate ?? false;
    this.story.variablesState["letter_completion"] = result.completion;
    this.story.variablesState["letter_understood"] = result.understood;
    return this.resume("letter_result");
  }
  private resume(knot: string) {
    this.frame.mode = "dialogue";
    this.story.ChoosePathString(knot);
    return this.next();
  }
  serialize() {
    return this.story.state.ToJson();
  }
  restore(state: string, frame: StoryFrame) {
    this.story.state.LoadJson(state);
    this.frame = structuredClone(frame);
  }
  get metrics() {
    return {
      trust: Number(this.story.variablesState["trust"]),
      understanding: Number(this.story.variablesState["understanding"]),
      intervention: Number(this.story.variablesState["intervention"]),
    };
  }
}
