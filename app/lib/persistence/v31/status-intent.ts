export type DestinationStatus = "draft" | "review" | "published";
export type StatusIntent =
  | { readonly operation: "UPDATE"; readonly behavior: "PRESERVE_EXISTING_STATUS" }
  | { readonly operation: "CREATE"; readonly behavior: "CREATE_AS_DRAFT_PENDING_VISUAL_APPROVAL" }
  | { readonly operation: "PROMOTE_CREATE"; readonly behavior: "PUBLISH_AFTER_VISUAL_APPROVAL" };

export function validateStatusIntent(intent: StatusIntent, current: DestinationStatus | null, requested: DestinationStatus): boolean {
  if (intent.operation === "UPDATE") return intent.behavior === "PRESERVE_EXISTING_STATUS" && current === requested;
  if (intent.operation === "CREATE") return current === null && requested === "draft";
  return intent.behavior === "PUBLISH_AFTER_VISUAL_APPROVAL" && current === "draft" && requested === "published";
}
