import { Composition, registerRoot } from "remotion";
import { PourFilm } from "./PourFilm";
import { brewFilm } from "./tea-varieties.js";
function Root() {
  return (
    <>
      <Composition
        id="TeaPour"
        component={PourFilm}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={180}
        defaultProps={{ tea: "osmanthus" as const }}
      />
      <Composition
        id="TeaComplete"
        component={PourFilm}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={180}
        defaultProps={{ tea: "osmanthus" as const, clip: "complete" as const }}
      />
      {/* Lin Cheng's hands brew one tea: scoop, infuse, pour and serve,
          with an optional garnish (see brewFilmGarnishes). */}
      <Composition
        id="TeaBrew"
        component={PourFilm}
        width={1280}
        height={720}
        fps={brewFilm.fps}
        durationInFrames={brewFilm.frames}
        defaultProps={{ tea: "osmanthus" as const, clip: "brew" as const, garnish: "none" as const }}
      />
    </>
  );
}
registerRoot(Root);
