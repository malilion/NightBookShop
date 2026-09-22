import { Composition, registerRoot } from "remotion";
import { PourFilm } from "./PourFilm";
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
    </>
  );
}
registerRoot(Root);
