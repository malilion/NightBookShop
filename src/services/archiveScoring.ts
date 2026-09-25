import { archiveItemSchema, archiveSchema, type ArchiveDraft } from "../types/game";

export function scoreArchive(input: ArchiveDraft) {
  const draft = archiveSchema.parse(input);
  const unique = new Set(draft.inspected);
  return { count: unique.size, complete: unique.size === archiveItemSchema.options.length };
}
