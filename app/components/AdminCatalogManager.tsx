"use client";

import { useEffect, useMemo, useState } from "react";

type AdminDestination = {
  id: string;
  slug: string;
  city: string;
  country: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
  description: string | null;
  updated_at: string;
  mediaCount: number;
  resourceCount: number;
  videoCount: number;
};

type DestinationPayload = {
  city: string;
  country: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
};

type AssetPayload = {
  destinationId: string;
  assetType: "media" | "resource" | "video";
  label: string;
  url: string;
  provider: string;
  category: string;
  kind: string;
};

type LinkedAsset = {
  id: string;
  assetType: "media" | "resource" | "video";
  label: string;
  url: string;
  provider: string;
  category: string;
  kind: string;
  embedUrl: string;
};

const EMPTY_DESTINATION_FORM: DestinationPayload = {
  city: "",
  country: "",
  slug: "",
  status: "draft",
  tier: "launch",
};

const EMPTY_ASSET_FORM: AssetPayload = {
  destinationId: "",
  assetType: "resource",
  label: "",
  url: "",
  provider: "manual",
  category: "guides",
  kind: "gallery",
};

export default function AdminCatalogManager() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [destinationForm, setDestinationForm] = useState<DestinationPayload>(EMPTY_DESTINATION_FORM);
  const [assetForm, setAssetForm] = useState<AssetPayload>(EMPTY_ASSET_FORM);
  const [linkedAssets, setLinkedAssets] = useState<LinkedAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetEditForm, setAssetEditForm] = useState<LinkedAsset | null>(null);
  const [destinationTags, setDestinationTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");

  const statusTotals = useMemo(() => {
    return destinations.reduce(
      (totals, destination) => {
        totals[destination.status] += 1;
        return totals;
      },
      { draft: 0, review: 0, published: 0, archived: 0 },
    );
  }, [destinations]);

  const loadDestinations = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await fetch("/api/admin/destinations", { cache: "no-store" });
      const payload = (await response.json()) as {
        canManage?: boolean;
        adminRole?: string | null;
        destinations?: AdminDestination[];
      };

      setCanManage(Boolean(payload.canManage));
      setAdminRole(payload.adminRole ?? null);
      setDestinations(payload.destinations ?? []);
    } catch {
      setCanManage(false);
      setAdminRole(null);
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/admin/destinations", { cache: "no-store" });
        const payload = (await response.json()) as {
          canManage?: boolean;
          adminRole?: string | null;
          destinations?: AdminDestination[];
        };

        setCanManage(Boolean(payload.canManage));
        setAdminRole(payload.adminRole ?? null);
        setDestinations(payload.destinations ?? []);
      } catch {
        setCanManage(false);
        setAdminRole(null);
        setDestinations([]);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timeoutId = window.setTimeout(() => setStatusMessage(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    const run = async () => {
      if (!canManage || !assetForm.destinationId) {
        setLinkedAssets([]);
        return;
      }

      setIsLoadingAssets(true);
      try {
        const response = await fetch(`/api/admin/destination-assets?destinationId=${encodeURIComponent(assetForm.destinationId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setLinkedAssets([]);
          return;
        }

        const payload = (await response.json()) as { assets?: LinkedAsset[] };
        setLinkedAssets(payload.assets ?? []);
      } catch {
        setLinkedAssets([]);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    void run();
  }, [assetForm.destinationId, canManage]);

  useEffect(() => {
    const run = async () => {
      if (!canManage || !assetForm.destinationId) {
        setDestinationTags([]);
        return;
      }

      setIsLoadingTags(true);
      try {
        const response = await fetch(`/api/admin/destination-tags?destinationId=${encodeURIComponent(assetForm.destinationId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setDestinationTags([]);
          return;
        }

        const payload = (await response.json()) as { tags?: string[] };
        setDestinationTags(payload.tags ?? []);
      } catch {
        setDestinationTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    void run();
  }, [assetForm.destinationId, canManage]);

  const handleCreateDestination = async () => {
    if (!canManage) return;

    const response = await fetch("/api/admin/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(destinationForm),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Unable to create destination." }))) as { error?: string };
      setStatusMessage(payload.error ?? "Unable to create destination.");
      return;
    }

    setDestinationForm(EMPTY_DESTINATION_FORM);
    setStatusMessage("Destination created.");
    await loadDestinations();
  };

  const handleStatusChange = async (destinationId: string, nextStatus: AdminDestination["status"]) => {
    if (!canManage) return;

    const response = await fetch(`/api/admin/destinations/${destinationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      setStatusMessage("Could not update status.");
      return;
    }

    setStatusMessage("Status updated.");
    await loadDestinations();
  };

  const handleDeleteDestination = async (destinationId: string) => {
    if (!canManage) return;

    const response = await fetch(`/api/admin/destinations/${destinationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Could not delete destination.");
      return;
    }

    setStatusMessage("Destination deleted.");
    await loadDestinations();
  };

  const handleCreateAsset = async () => {
    if (!canManage) return;

    const response = await fetch("/api/admin/destination-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetForm),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not add linked record." }))) as { error?: string };
      setStatusMessage(payload.error ?? "Could not add linked record.");
      return;
    }

    setAssetForm((current) => ({ ...EMPTY_ASSET_FORM, destinationId: current.destinationId }));
    setStatusMessage("Linked record added.");
    await loadDestinations();
    if (assetForm.destinationId) {
      const response = await fetch(`/api/admin/destination-assets?destinationId=${encodeURIComponent(assetForm.destinationId)}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const payload = (await response.json()) as { assets?: LinkedAsset[] };
        setLinkedAssets(payload.assets ?? []);
      }
    }
  };

  const handleDeleteAsset = async (asset: LinkedAsset) => {
    if (!canManage) return;

    const response = await fetch(`/api/admin/destination-assets/${asset.assetType}/${asset.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Could not delete linked record.");
      return;
    }

    setStatusMessage("Linked record deleted.");
    setLinkedAssets((current) => current.filter((item) => item.id !== asset.id));
    await loadDestinations(false);
  };

  const handleStartEditAsset = (asset: LinkedAsset) => {
    setEditingAssetId(asset.id);
    setAssetEditForm({ ...asset });
  };

  const handleSaveAssetEdit = async () => {
    if (!canManage || !editingAssetId || !assetEditForm) return;

    const response = await fetch(`/api/admin/destination-assets/${assetEditForm.assetType}/${assetEditForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetEditForm),
    });

    if (!response.ok) {
      setStatusMessage("Could not update linked record.");
      return;
    }

    setLinkedAssets((current) => current.map((item) => (item.id === assetEditForm.id ? assetEditForm : item)));
    setEditingAssetId(null);
    setAssetEditForm(null);
    setStatusMessage("Linked record updated.");
  };

  const handleAddTag = async () => {
    if (!canManage || !assetForm.destinationId || !newTag.trim()) return;

    const normalizedTag = newTag.trim().toLowerCase();
    const previousTags = destinationTags;
    const nextTags = previousTags.includes(normalizedTag) ? previousTags : [...previousTags, normalizedTag].sort();
    setDestinationTags(nextTags);
    setNewTag("");

    const response = await fetch("/api/admin/destination-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId: assetForm.destinationId, tag: normalizedTag }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not add destination tag." }))) as { error?: string };
      setDestinationTags(previousTags);
      setNewTag(normalizedTag);
      setStatusMessage(payload.error ?? "Could not add destination tag.");
      return;
    }

    setStatusMessage("Destination tag added.");
  };

  const handleRemoveTag = async (tag: string) => {
    if (!canManage || !assetForm.destinationId) return;

    const shouldRemove = window.confirm(`Remove tag "${tag}" from this destination?`);
    if (!shouldRemove) return;

    const previousTags = destinationTags;
    setDestinationTags((current) => current.filter((item) => item !== tag));

    const response = await fetch("/api/admin/destination-tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId: assetForm.destinationId, tag }),
    });

    if (!response.ok) {
      setDestinationTags(previousTags);
      setStatusMessage("Could not remove destination tag.");
      return;
    }

    setStatusMessage("Destination tag removed.");
  };

  const handleStartEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditingTagValue(tag);
  };

  const handleCancelEditTag = () => {
    setEditingTag(null);
    setEditingTagValue("");
  };

  const handleSaveTagEdit = async (currentTag: string) => {
    if (!canManage || !assetForm.destinationId) return;

    const normalizedNextTag = editingTagValue.trim().toLowerCase();
    if (!normalizedNextTag) {
      setStatusMessage("Tag cannot be empty.");
      return;
    }

    if (normalizedNextTag === currentTag) {
      handleCancelEditTag();
      return;
    }

    const previousTags = destinationTags;
    const nextTags = previousTags
      .map((tag) => (tag === currentTag ? normalizedNextTag : tag))
      .filter((tag, index, allTags) => allTags.indexOf(tag) === index)
      .sort();

    setDestinationTags(nextTags);
    handleCancelEditTag();

    const response = await fetch("/api/admin/destination-tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationId: assetForm.destinationId,
        currentTag,
        nextTag: normalizedNextTag,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not rename destination tag." }))) as { error?: string };
      setDestinationTags(previousTags);
      setStatusMessage(payload.error ?? "Could not rename destination tag.");
      return;
    }

    setStatusMessage("Destination tag renamed.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Live management</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Destination catalog operations</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            {canManage ? `Role: ${adminRole ?? "admin"}` : "Read-only session"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Draft</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.draft}</p></div>
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Review</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.review}</p></div>
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Published</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.published}</p></div>
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Archived</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.archived}</p></div>
        </div>

        {statusMessage ? <p className="mt-4 text-sm text-cyan-300">{statusMessage}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <h3 className="text-xl font-semibold text-white">Create destination</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={destinationForm.city} onChange={(event) => setDestinationForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <input value={destinationForm.country} onChange={(event) => setDestinationForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <input value={destinationForm.slug} onChange={(event) => setDestinationForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug (optional)" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:col-span-2" />
            <select value={destinationForm.status} onChange={(event) => setDestinationForm((current) => ({ ...current, status: event.target.value as DestinationPayload["status"] }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400">
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <input value={destinationForm.tier} onChange={(event) => setDestinationForm((current) => ({ ...current, tier: event.target.value }))} placeholder="Tier (launch/platinum/etc.)" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
          </div>
          <button type="button" onClick={() => void handleCreateDestination()} disabled={!canManage} className="mt-4 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
            Create destination
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <h3 className="text-xl font-semibold text-white">Add linked asset</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select value={assetForm.destinationId} onChange={(event) => setAssetForm((current) => ({ ...current, destinationId: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:col-span-2">
              <option value="">Choose destination</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>{destination.city}, {destination.country}</option>
              ))}
            </select>
            <select value={assetForm.assetType} onChange={(event) => setAssetForm((current) => ({ ...current, assetType: event.target.value as AssetPayload["assetType"] }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400">
              <option value="resource">Resource link</option>
              <option value="media">Media asset</option>
              <option value="video">Video link</option>
            </select>
            <input value={assetForm.provider} onChange={(event) => setAssetForm((current) => ({ ...current, provider: event.target.value }))} placeholder="Provider" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <input value={assetForm.label} onChange={(event) => setAssetForm((current) => ({ ...current, label: event.target.value }))} placeholder="Label" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <input value={assetForm.url} onChange={(event) => setAssetForm((current) => ({ ...current, url: event.target.value }))} placeholder="URL" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <input value={assetForm.category} onChange={(event) => setAssetForm((current) => ({ ...current, category: event.target.value }))} placeholder="Resource category" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <input value={assetForm.kind} onChange={(event) => setAssetForm((current) => ({ ...current, kind: event.target.value }))} placeholder="Media kind" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
          </div>
          <button type="button" onClick={() => void handleCreateAsset()} disabled={!canManage} className="mt-4 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
            Add linked record
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">Destination taxonomy</h3>
        {!assetForm.destinationId ? (
          <p className="mt-4 text-slate-400">Choose a destination above to manage tags.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="Add tag (e.g. healthcare)"
                className="min-w-[280px] rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => void handleAddTag()}
                disabled={!canManage || !newTag.trim()}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add tag
              </button>
            </div>
            {isLoadingTags ? (
              <p className="mt-4 text-slate-400">Loading tags...</p>
            ) : destinationTags.length === 0 ? (
              <p className="mt-4 text-slate-400">No tags found for this destination yet.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {destinationTags.map((tag) => (
                  <div key={tag} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                    {editingTag === tag ? (
                      <>
                        <input
                          value={editingTagValue}
                          onChange={(event) => setEditingTagValue(event.target.value)}
                          className="w-36 rounded-full border border-cyan-400/40 bg-slate-950/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => void handleSaveTagEdit(tag)}
                          disabled={!canManage || !editingTagValue.trim()}
                          className="rounded-full border border-cyan-400/60 px-2 py-1 text-[10px] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditTag}
                          className="rounded-full border border-white/20 px-2 py-1 text-[10px] text-slate-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditTag(tag)}
                          disabled={!canManage}
                          className="rounded-full border border-cyan-400/60 px-2 py-1 text-[10px] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRemoveTag(tag)}
                          disabled={!canManage}
                          className="rounded-full border border-rose-400/60 px-2 py-1 text-[10px] text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">Linked records for selected destination</h3>
        {!assetForm.destinationId ? (
          <p className="mt-4 text-slate-400">Choose a destination above to manage media, resources, and videos.</p>
        ) : isLoadingAssets ? (
          <p className="mt-4 text-slate-400">Loading linked records...</p>
        ) : linkedAssets.length === 0 ? (
          <p className="mt-4 text-slate-400">No linked records found for this destination yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {linkedAssets.map((asset) => {
              const isEditing = editingAssetId === asset.id;

              return (
                <article key={asset.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1">{asset.assetType}</span>
                    {asset.category ? <span className="rounded-full bg-white/10 px-3 py-1">{asset.category}</span> : null}
                    {asset.kind ? <span className="rounded-full bg-white/10 px-3 py-1">{asset.kind}</span> : null}
                  </div>

                  {isEditing && assetEditForm ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input value={assetEditForm.label} onChange={(event) => setAssetEditForm((current) => current ? { ...current, label: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                      <input value={assetEditForm.provider} onChange={(event) => setAssetEditForm((current) => current ? { ...current, provider: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                      <input value={assetEditForm.url} onChange={(event) => setAssetEditForm((current) => current ? { ...current, url: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:col-span-2" />
                      {asset.assetType === "resource" ? (
                        <input value={assetEditForm.category} onChange={(event) => setAssetEditForm((current) => current ? { ...current, category: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                      ) : null}
                      {asset.assetType === "media" ? (
                        <input value={assetEditForm.kind} onChange={(event) => setAssetEditForm((current) => current ? { ...current, kind: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                      ) : null}
                      {asset.assetType === "video" ? (
                        <input value={assetEditForm.embedUrl} onChange={(event) => setAssetEditForm((current) => current ? { ...current, embedUrl: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="Embed URL (optional)" />
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <p className="text-base font-semibold text-white">{asset.label}</p>
                      <p className="text-sm text-slate-400">{asset.provider}</p>
                      <p className="text-sm text-slate-500 break-all">{asset.url}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => void handleSaveAssetEdit()} disabled={!canManage} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">Save</button>
                        <button type="button" onClick={() => { setEditingAssetId(null); setAssetEditForm(null); }} className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleStartEditAsset(asset)} disabled={!canManage} className="rounded-full border border-cyan-400/60 px-4 py-2 text-sm text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">Edit</button>
                        <button type="button" onClick={() => void handleDeleteAsset(asset)} disabled={!canManage} className="rounded-full border border-rose-400/60 px-4 py-2 text-sm text-rose-200 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">Catalog entries</h3>
        {isLoading ? (
          <p className="mt-4 text-slate-400">Loading destination records...</p>
        ) : destinations.length === 0 ? (
          <p className="mt-4 text-slate-400">No destinations returned from Supabase for this session.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {destinations.map((destination) => (
              <article key={destination.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{destination.city}, {destination.country}</p>
                    <p className="mt-1 text-sm text-slate-400">{destination.slug}</p>
                    <p className="mt-2 text-xs text-slate-500">Media {destination.mediaCount} • Resources {destination.resourceCount} • Videos {destination.videoCount}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={destination.status}
                      onChange={(event) => void handleStatusChange(destination.id, event.target.value as AdminDestination["status"])}
                      disabled={!canManage}
                      className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleDeleteDestination(destination.id)}
                      disabled={!canManage}
                      className="rounded-full border border-rose-400/60 px-3 py-2 text-sm text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}