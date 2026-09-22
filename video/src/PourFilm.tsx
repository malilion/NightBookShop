import { useLayoutEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createTeaSet } from "./tea-set.js";
export type Tea = "osmanthus" | "puer" | "mint";
export function PourFilm({
  tea = "osmanthus",
  clip = "pour",
}: {
  tea?: Tea;
  clip?: "pour" | "complete";
}) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const mount = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createTeaSet> | null>(null);
  const [handle] = useState(() => delayRender("Prepare the tea set"));
  useLayoutEffect(() => {
    if (!mount.current) return;
    scene.current = createTeaSet(mount.current, width, height);
    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, [width, height]);
  useLayoutEffect(() => {
    scene.current?.setFrame(clip, frame / (durationInFrames - 1), tea);
    continueRender(handle);
  }, [frame, durationInFrames, tea, clip, handle]);
  return (
    <AbsoluteFill style={{ background: "#171c29" }}>
      <div ref={mount} style={{ width, height }} />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 51% 53%, transparent 38%, rgba(7,13,22,.25) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}
