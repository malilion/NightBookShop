import { Howl, Howler } from "howler";

export type AudioScene = "rain" | "room" | null;
export type AudioCue = "paper" | "porcelain" | "bell" | "chime" | "drop";
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
  chime: "tea-chime",
  drop: "tea-drop",
  pour: "tea-pour",
  boil: "tea-boil",
} as const;
type EffectLoop = "pour" | "boil";
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
  private effects: Partial<Record<EffectLoop, { howl: Howl; level: number }>> = {};
  private film: { path: string; howl: Howl; id?: number } | null = null;

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
  /** Water stream while a kettle or teapot is tilted; 0 stops it. */
  setPour(level: number) {
    this.setEffect("pour", level, 0.55);
  }
  /** The kettle simmering on the stove, louder toward a rolling boil. */
  setBoil(level: number) {
    this.setEffect("boil", level, 0.45);
  }
  /**
   * A brew film's soundtrack, /video/tea/<film>.ogg or .mp3. The film player
   * keeps it in step: play and seek follow the video's clock. It plays at the
   * effects volume and stays silent, still in step, while muted.
   */
  loadFilm(path: string) {
    if (this.film?.path === path) return;
    this.stopFilm();
    this.film = {
      path,
      howl: new Howl({ src: [`${path}.ogg`, `${path}.mp3`], volume: this.filmVolume() }),
    };
  }
  playFilm(time: number) {
    const film = this.film;
    if (!film) return;
    // Before the track loads Howler queues both calls, in this order.
    if (film.id === undefined || !film.howl.playing(film.id)) film.id = film.howl.play(film.id);
    film.howl.seek(time, film.id);
  }
  seekFilm(time: number) {
    if (this.film?.id !== undefined) this.film.howl.seek(time, this.film.id);
  }
  pauseFilm() {
    if (this.film?.id !== undefined) this.film.howl.pause(this.film.id);
  }
  stopFilm() {
    this.film?.howl.unload();
    this.film = null;
  }
  /** Seconds into the soundtrack, for tests; null with none loaded. */
  filmTime() {
    if (this.film?.id === undefined) return null;
    const time = this.film.howl.seek(this.film.id);
    return typeof time === "number" ? time : null;
  }
  private filmVolume() {
    return this.preferences.muted ? 0 : this.preferences.sfxVolume / 100;
  }
  private setEffect(name: EffectLoop, level: number, gain: number) {
    const allowed =
      this.started &&
      this.visible &&
      this.scene !== null &&
      !this.preferences.muted &&
      this.preferences.sfxVolume > 0;
    const target = allowed ? Math.round(Math.max(0, Math.min(1, level)) * 10) / 10 : 0;
    const effect = this.effects[name];
    if (target === (effect?.level ?? 0)) return;
    if (target > 0) {
      const current = effect ?? { howl: new Howl({ src: sources(name), loop: true, volume: 0 }), level: 0 };
      this.effects[name] = current;
      current.level = target;
      if (!current.howl.playing()) current.howl.play();
      current.howl.fade(current.howl.volume(), target * (this.preferences.sfxVolume / 100) * gain, 120);
    } else if (effect) {
      effect.level = 0;
      if (!effect.howl.playing()) return;
      effect.howl.fade(effect.howl.volume(), 0, 180);
      effect.howl.once("fade", () => {
        if (effect.level === 0) effect.howl.stop();
      });
    }
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
    this.film?.howl.volume(this.filmVolume());
  }
}

export const audio = new AudioManager();
