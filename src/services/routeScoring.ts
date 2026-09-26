import { routeSchema, type RouteDraft } from "../types/game";
import { deliveryRouteScenes } from "../data/deliveryRouteNarrative";

export function scoreRoute(input: RouteDraft) {
  const draft = routeSchema.parse(input);
  const correct = draft.stops.filter((stop, index) => stop === deliveryRouteScenes[index]?.correctStop).length;
  return { correct, detours: draft.stops.length - correct };
}
