import Link from "next/link";
import RouteFrame from "../components/RouteFrame";
import AdminCatalogManager from "../components/AdminCatalogManager";
import { destinations } from "../lib/destinations";
import { getProfileSnapshot } from "../lib/profile-data";
import { RETIREMENT_DNA_TOTAL_QUESTIONS } from "../lib/retirement-dna";
import { isSupabaseConfigured } from "../lib/supabase";

const contentSurfaces = [
  {
    title: "Destination records",
    summary: "Canonical city entries with lifecycle status, geo fields, pricing, climate, healthcare, and long-form relocation notes.",
  },
  {
    title: "Media library",
    summary: "Hero images, gallery assets, maps, thumbnails, and embedded videos normalized into dedicated tables.",
  },
  {
    title: "Resource links",
    summary: "Rentals, healthcare networks, tax references, visas, restaurants, guides, and official sources per destination.",
  },
  {
    title: "Assessment output",
    summary: "Retirement DNA answer payloads, profile summaries, and saved recommendation sets stored per user with RLS.",
  },
];

const operationalTracks = [
  "Content review workflow for draft, review, published, and archived destinations.",
  "Admin role model for editors, admins, and owners using Supabase Auth identities.",
  "Revision history table to support editorial audit trails and safer content iteration.",
  "Public-read and admin-write RLS policies so scale does not weaken access control.",
];

const managedTables = [
  "app_user_profiles",
  "app_admins",
  "favorites",
  "retirement_dna_assessments",
  "saved_recommendation_sets",
  "destinations_catalog",
  "destination_tags",
  "destination_media_assets",
  "destination_resource_links",
  "destination_video_links",
  "destination_content_revisions",
];

export default async function AdminPage() {
  const profile = await getProfileSnapshot();
  const catalogCountries = new Set(destinations.map((destination) => destination.country)).size;
  const taxonomyTags = new Set(destinations.flatMap((destination) => destination.tags ?? [])).size;

  return (
    <RouteFrame
      eyebrow="Admin Console"
      title="Content operations and data architecture"
      description="Horizon Atlas now has the schema foundation for user profiles, saved assessments, recommendation sets, destination records, media, resources, and admin roles. This route is the local operations surface for the commercial product layer."
      primaryAction={{ href: "/destinations", label: "Review catalog" }}
      secondaryAction={{ href: "/profile", label: "Open profile" }}
    >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Catalog</p>
            <p className="mt-3 text-4xl font-black text-white">{destinations.length}</p>
            <p className="mt-2 text-sm text-slate-400">Launch destination records already available for publishing workflows.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Countries</p>
            <p className="mt-3 text-4xl font-black text-white">{catalogCountries}</p>
            <p className="mt-2 text-sm text-slate-400">Geographic spread present in the current catalog model.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Assessment depth</p>
            <p className="mt-3 text-4xl font-black text-white">{RETIREMENT_DNA_TOTAL_QUESTIONS}</p>
            <p className="mt-2 text-sm text-slate-400">Retirement DNA questions now supported by the recommendation engine.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Tag taxonomy</p>
            <p className="mt-3 text-4xl font-black text-white">{taxonomyTags}</p>
            <p className="mt-2 text-sm text-slate-400">Current launch tags ready to normalize into database records.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Backend readiness</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Supabase architecture now covers the core product domains.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {contentSurfaces.map((surface) => (
                <article key={surface.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-semibold text-white">{surface.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{surface.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Access state</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Supabase configuration</p>
                <p className="mt-3 text-lg font-semibold text-white">{isSupabaseConfigured() ? "Configured in environment" : "Pending environment values"}</p>
                <p className="mt-2 text-sm text-slate-400">The schema and admin UI can be built now; live data wiring only needs your project credentials later.</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Viewer</p>
                <p className="mt-3 text-lg font-semibold text-white">{profile.authenticated ? (profile.user?.email ?? "Authenticated") : "Guest session"}</p>
                <p className="mt-2 text-sm text-slate-400">Admin role checks can map directly onto `app_admins` once the live project is connected.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Operational tracks</p>
            <div className="mt-6 space-y-3">
              {operationalTracks.map((track) => (
                <div key={track} className="rounded-3xl bg-white/5 p-4 text-sm leading-7 text-slate-300">
                  {track}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Managed tables</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {managedTables.map((tableName) => (
                <div key={tableName} className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm font-medium text-slate-200">
                  {tableName}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Verification operations</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Open the destination QA dashboard to review image confidence, external-link quality, missing fields, and manual-review queues.</p>
              <Link
                href="/admin/verification"
                className="mt-3 inline-flex rounded-full border border-cyan-300/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-200 hover:text-white"
              >
                Open QA dashboard
              </Link>
            </div>
          </div>
        </div>

        <AdminCatalogManager />
      </div>
    </RouteFrame>
  );
}