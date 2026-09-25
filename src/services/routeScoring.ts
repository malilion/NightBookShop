import { routeSchema, type RouteDraft } from "../types/game";

const expected = ["post-office", "last-bus", "empty-shop"] as const;
export function scoreRoute(input: RouteDraft) {
  const draft = routeSchema.parse(input);
  const correct = draft.stops.filter((stop, index) => stop === expected[index]).length;
  return { correct, detours: draft.stops.length - correct };
}
