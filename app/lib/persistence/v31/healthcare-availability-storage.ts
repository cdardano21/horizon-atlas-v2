/** The existing persisted availability contract is tri-state: true, false, null.
 * Explicit UNKNOWN means unassessed, never a negative clinical finding.
 * Other text is retained so unsupported representations still fail parity.
 */
export function normalizeHealthcareAvailabilityUnknown(value: string | boolean | null | undefined): string | boolean | null {
  return value == null || (typeof value === "string" && value.trim().toUpperCase() === "UNKNOWN") ? null : value;
}
