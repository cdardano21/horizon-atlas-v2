export type MediaPreflightIssue = "MISSING_SOURCE" | "GENERIC_SEARCH_URL" | "UNSUPPORTED_PROVIDER" | "MISSING_LOCAL_ASSET";

export interface MediaPreflightRow {
  readonly mediaKey: string;
  readonly sourceUrl: string | null | undefined;
  readonly localPath: string | null | undefined;
}

export function inspectMediaPreflightRow(row: MediaPreflightRow, localAssetExists: boolean): readonly MediaPreflightIssue[] {
  const issues: MediaPreflightIssue[] = [];
  const source = row.sourceUrl?.trim() ?? "";
  if (!source) issues.push("MISSING_SOURCE");
  else {
    try {
      const url = new URL(source);
      if (url.pathname.toLowerCase().includes("/search/") || url.searchParams.has("query")) issues.push("GENERIC_SEARCH_URL");
      if (!["pexels.com", "www.pexels.com", "unsplash.com", "www.unsplash.com", "images.unsplash.com", "commons.wikimedia.org", "upload.wikimedia.org"].includes(url.hostname.toLowerCase())) issues.push("UNSUPPORTED_PROVIDER");
    } catch { issues.push("MISSING_SOURCE"); }
  }
  if (!row.localPath?.trim() || !localAssetExists) issues.push("MISSING_LOCAL_ASSET");
  return issues;
}
