const extractVideoId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (!host.includes("youtube.com")) {
      return null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    }

    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }

    if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/live/")) {
      return parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    }

    return null;
  } catch {
    return null;
  }
};

export const toYouTubeEmbedUrl = (value: string | null | undefined) => {
  if (!value) return null;
  const videoId = extractVideoId(value);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};
