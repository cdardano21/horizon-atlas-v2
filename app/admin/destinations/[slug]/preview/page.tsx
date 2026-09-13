import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAuthedAdmin } from "../../../../lib/admin-auth";
import { loadCanonicalDestinationForAdminPreview } from "../../../../lib/canonical-destination-admin-preview";
import CanonicalDestinationPage from "../../../../components/destination/CanonicalDestinationPage";

interface AdminDestinationPreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ local?: string }>;
}

// Authenticated-admin-only server-side preview of a draft-status v3.1 destination. Uses the same
// getAuthedAdmin() session/role check already used across app/api/admin/**, a privileged
// service-role read (never exposed to the client), and the exact same public CanonicalDestinationPage
// renderer - there is no separate preview renderer. Public RLS and destination status are untouched.
export default async function AdminDestinationPreviewPage({ params, searchParams }: AdminDestinationPreviewPageProps) {
  const { slug } = await params;
  const { user, adminRole } = await getAuthedAdmin();

  const query = await searchParams;
  const host = (await headers()).get("host") ?? "";
  // Explicit localhost development preview only. Production still requires the existing admin role.
  const localPreview = process.env.NODE_ENV === "development" && query?.local === "1"
    && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);

  if ((!user || !adminRole) && !localPreview) {
    notFound();
  }

  const result = await loadCanonicalDestinationForAdminPreview(slug);

  if (!result.ok) {
    return (
      <main className="min-h-screen px-8 py-24 text-[var(--atlas-ink)]">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] p-12 text-center shadow-[var(--atlas-shadow)]">
          <h1 className="text-3xl font-semibold">Preview unavailable</h1>
          <p className="mt-4 text-[var(--atlas-muted)]">Reason: {result.reason}</p>
        </div>
      </main>
    );
  }

  return <CanonicalDestinationPage destination={result.destination} developerMode />;
}
