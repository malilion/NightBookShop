import { Howl, Howler } from "howler";

export type AudioScene = "rain" | "room" | null;
export type AudioCue = "paper" | "porcelain" | "bell";
export interface AudioPreferences {
  muted: boolean;
  bgmVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
}
type LoopName = "theme" | "rain" | "room";
type LoopTrack = {
  howl: Howl;
  active: boolean;
  target: number;
  stopTimer?: ReturnType<typeof setTimeout>;
};
const files = {
  theme: "midnight-theme",
  rain: "rain-window",
  room: "bookshop-room",
  paper: "paper",
  porcelain: "porcelain",
  bell: "door-bell",
} as const;
const sources = (name: keyof typeof files) => [
  `/audio/${files[name]}.ogg`,
  `/audio/${files[name]}.mp3`,
];
const defaults: AudioPreferences = {
  muted: false,
  bgmVolume: 25,
  ambienceVolume: 40,
  sfxVolume: 45,
};

class AudioManager {
  private started = false;
  private visible = true;
  private scene: AudioScene = null;
  private preferences = defaults;
  private loops: Partial<Record<LoopName, LoopTrack>> = {};
  private cues: Partial<Record<AudioCue, Howl>> = {};

  start() {
    if (this.started) return;
    this.started = true;
    this.track("theme");
    if (Howler.usingWebAudio && Howler.ctx?.resume)
      void Howler.ctx.resume().catch(() => undefined);
    Howler.volume(this.visible ? 1 : 0);
    this.sync();
  }
  setScene(scene: AudioScene) {
    if (this.scene === scene) return;
    this.scene = scene;
    this.sync();
  }
  setPreferences(preferences: AudioPreferences) {
    this.preferences = preferences;
    this.sync();
  }
  setVisible(visible: boolean) {
    this.visible = visible;
    if (this.started) Howler.volume(visible ? 1 : 0);
  }
  cue(name: AudioCue) {
    if (
      !this.started ||
      !this.visible ||
      !this.scene ||
      this.preferences.muted ||
      this.preferences.sfxVolume <= 0
    )
      return;
    const howl =
      this.cues[name] ??
      new Howl({
        src: sources(name),
        volume: this.preferences.sfxVolume / 100,
      });
    this.cues[name] = howl;
    howl.volume(this.preferences.sfxVolume / 100);
    howl.play();
  }
  private track(name: LoopName) {
    if (!this.loops[name]) {
      this.loops[name] = {
        howl: new Howl({
          src: sources(name),
          loop: true,
          volume: 0,
        }),
        active: false,
        target: 0,
      };
    }
    return this.loops[name]!;
  }
  private updateLoop(name: LoopName, target: number) {
    const track = this.loops[name];
    if (!track && target <= 0) return;
    const current = track ?? this.track(name);
    if (current.target === target && current.active === target > 0) return;
    current.target = target;
    if (current.stopTimer) clearTimeout(current.stopTimer);
    current.stopTimer = undefined;
    if (target > 0) {
      if (!current.active) {
        current.howl.volume(0);
        current.howl.play();
        current.active = true;
      }
      current.howl.fade(current.howl.volume(), target, 1100);
    } else if (current.active) {
      current.howl.fade(current.howl.volume(), 0, 700);
      current.stopTimer = setTimeout(() => {
        if (current.target === 0) {
          current.howl.stop();
          current.active = false;
        }
      }, 750);
    }
  }
  private sync() {
    if (!this.started) return;
    const enabled = !this.preferences.muted && this.scene !== null;
    const bgm = enabled ? this.preferences.bgmVolume / 100 : 0;
    const ambience = enabled ? this.preferences.ambienceVolume / 100 : 0;
    this.updateLoop("theme", bgm);
    this.updateLoop("rain", this.scene === "rain" ? ambience : 0);
    this.updateLoop("room", this.scene === "room" ? ambience : 0);
    for (const cue of Object.values(this.cues))
      cue.volume(this.preferences.sfxVolume / 100);
  }
}

export const audio = new AudioManager();
