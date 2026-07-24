"use client";

import { useEffect, useState } from "react";
import {
  fetchSyncedPlanningDraft,
  getDashboardProfileDraft,
  saveDashboardProfileDraft,
  syncPlanningDraft,
  type DashboardProfileDraft,
} from "../lib/assessment-records";

export default function ProfilePlanningPanel() {
  const [draft, setDraft] = useState<DashboardProfileDraft>(() => getDashboardProfileDraft());
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSyncedDraft = async () => {
      try {
        const payload = await fetchSyncedPlanningDraft();
        if (cancelled || !payload.authenticated) return;

        setDraft((current) => ({
          ...current,
          displayName: payload.draft.displayName || current.displayName,
          homeCountry: payload.draft.homeCountry || current.homeCountry,
          moveWindow: payload.draft.moveWindow || current.moveWindow,
          planningNotes: payload.draft.planningNotes || current.planningNotes,
        }));
      } catch {
        // Local draft remains source of truth when sync is unavailable.
      }
    };

    void loadSyncedDraft();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!status) return;

    const timeoutId = window.setTimeout(() => setStatus(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  const updateField = (field: keyof DashboardProfileDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    saveDashboardProfileDraft(draft);
    try {
      const result = await syncPlanningDraft(draft);
      if (result.synced) {
        setStatus("Planning profile synced to Supabase and saved locally.");
        return;
      }

      if (result.localOnly) {
        setStatus("Planning profile saved locally. Sign in to sync with Supabase.");
        return;
      }

      setStatus("Planning profile saved locally. Supabase sync will retry later.");
    } catch {
      setStatus("Planning profile saved locally. Supabase sync will retry later.");
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Profile management</p>
      <h2 className="mt-4 text-2xl font-bold text-white">Plan your move intentionally</h2>
      <p className="mt-3 text-slate-400">Keep a planning profile here and sync it to Supabase when your account is connected.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
          Display name
          <input value={draft.displayName} onChange={(event) => updateField("displayName", event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
        </label>
        <label className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
          Home country
          <input value={draft.homeCountry} onChange={(event) => updateField("homeCountry", event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
        </label>
        <label className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
          Ideal move window
          <input value={draft.moveWindow} onChange={(event) => updateField("moveWindow", event.target.value)} placeholder="Example: 12-18 months" className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
        </label>
        <label className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300 md:col-span-2">
          Planning notes
          <textarea value={draft.planningNotes} onChange={(event) => updateField("planningNotes", event.target.value)} rows={5} placeholder="Family constraints, tax questions, neighborhoods to explore, healthcare considerations..." className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => void handleSave()} className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Save planning profile
        </button>
        {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
      </div>
    </div>
  );
}