import type { VerificationMeta } from "../../lib/destination-command-center";

const statusClass: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-900 border-emerald-300/60",
  estimated: "bg-amber-50 text-amber-900 border-amber-300/65",
  stale: "bg-rose-50 text-rose-900 border-rose-300/60",
  in_progress: "bg-slate-100 text-slate-800 border-slate-300/60",
};

function isSourceBacked(verification?: VerificationMeta | null) {
  if (!verification) return false;
  const sourceType = verification.sourceType ?? "";
  if (sourceType === "official_site" || sourceType === "government_portal" || sourceType === "tax_summary" || sourceType === "climate_guide") {
    return true;
  }

  const hasSourceUrl = typeof verification.sourceUrl === "string" && verification.sourceUrl.trim().length > 0;
  const hasSourceOrg = typeof verification.sourceOrganization === "string" && verification.sourceOrganization.trim().length > 0;
  return hasSourceUrl || hasSourceOrg;
}

function statusLabel(verification?: VerificationMeta | null) {
  const status = verification?.verificationStatus ?? "in_progress";
  if (status === "verified") return "Official source";
  if (status === "estimated") return isSourceBacked(verification) ? "Source-backed estimate" : "Pending verification";
  if (status === "stale") return "Needs refresh";
  return "Context developing";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not published";
  return date.toLocaleDateString();
}

export default function SourceVerificationBadge({ verification }: { verification?: VerificationMeta | null }) {
  const status = verification?.verificationStatus ?? "in_progress";
  const label = statusLabel(verification);
  const classes = statusClass[status] ?? statusClass.in_progress;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${classes}`}>
      <span>{label}</span>
      <span className="opacity-85">Last update: {formatDate(verification?.lastVerifiedAt)}</span>
    </div>
  );
}
