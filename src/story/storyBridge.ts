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
  constructor(json: string, previousEndingId = "") {
    this.story = new Story(json);
    if (typeof this.story.variablesState["previous_ending"] === "string")
      this.story.variablesState["previous_ending"] = previousEndingId;
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
    if (this.story.variablesState["tea_garnish"] !== null)
      this.story.variablesState["tea_garnish"] = result.garnish ?? "none";
    if (this.story.variablesState["tea_blend"] !== null)
      this.story.variablesState["tea_blend"] = result.blackTea ?? 0;
    return this.resume("tea_result");
  }
  finishLetter(result: {
    completion: number;
    understood: boolean;
    alternate?: boolean;
    stamp?: "none" | "past" | "present" | "future";
  }) {
    if (this.frame.mode !== "letter") throw new Error("目前不是拼信階段。");
    if (this.story.variablesState["letter_alternate"] !== null)
      this.story.variablesState["letter_alternate"] = result.alternate ?? false;
    this.story.variablesState["letter_completion"] = result.completion;
    this.story.variablesState["letter_understood"] = result.understood;
    if (this.story.variablesState["letter_stamp"] !== null)
      this.story.variablesState["letter_stamp"] = result.stamp ?? "none";
    return this.resume("letter_result");
  }
  finishMelody(correct: boolean) {
    if (this.frame.mode !== "melody") throw new Error("目前不是旋律階段。");
    this.story.variablesState["melody_correct"] = correct;
    return this.resume("melody_result");
  }
  finishHearth(result: { heat: number; care: number; balanced: boolean }) {
    if (this.frame.mode !== "hearth") throw new Error("目前不是爐火階段。");
    this.story.variablesState["hearth_heat"] = result.heat;
    this.story.variablesState["hearth_care"] = result.care;
    this.story.variablesState["hearth_balanced"] = result.balanced;
    return this.resume("hearth_result");
  }
  finishRoute(result: { correct: number; detours: number }) {
    if (this.frame.mode !== "route") throw new Error("目前不是投遞路線階段。");
    this.story.variablesState["route_correct"] = result.correct;
    this.story.variablesState["route_detours"] = result.detours;
    return this.resume("route_result");
  }
  finishLamp(result: { brightness: number; steady: number; balanced: boolean }) {
    if (this.frame.mode !== "lamp") throw new Error("目前不是守燈階段。");
    this.story.variablesState["lamp_brightness"] = result.brightness;
    this.story.variablesState["lamp_steady"] = result.steady;
    this.story.variablesState["lamp_balanced"] = result.balanced;
    return this.resume("lamp_result");
  }
  finishArchive(result: { count: number; complete: boolean }) {
    if (this.frame.mode !== "archive") throw new Error("目前不是手冊比對階段。");
    this.story.variablesState["archive_count"] = result.count;
    this.story.variablesState["archive_complete"] = result.complete;
    return this.resume("archive_result");
  }
  finishNotifications(result: { allPaused: boolean; repliedMother: boolean }) {
    if (this.frame.mode !== "notifications") throw new Error("目前不是整理通知階段。");
    if (!result.allPaused) throw new Error("請先暫停三則工作通知。");
    this.story.variablesState["notification_all_paused"] = result.allPaused;
    this.story.variablesState["notification_mother_replied"] = result.repliedMother;
    return this.resume("notifications_result");
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
