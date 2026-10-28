/**
 * Colors for the qualifier shown next to a venue, e.g. "ECCV 2026 (Oral)".
 * Shared by the publication list and the conference globe so the two agree.
 */
export const VENUE_TAG_COLORS = {
  Oral: "text-orange-500",
  Spotlight: "text-purple-500",
  Workshop: "text-blue-500",
} as const

export type VenueTag = keyof typeof VENUE_TAG_COLORS

/** Falls back to muted for tags outside the known set. */
export function venueTagColor(tag: string): string {
  return VENUE_TAG_COLORS[tag as VenueTag] ?? "text-muted-foreground"
}
