/**
 * YouTube helpers.
 *
 * The DB stores a bare YouTube video id (the `exercises.video_id` column). These
 * helpers let the UI accept a full URL (what coaches actually paste) and convert
 * between id, watch URL, embed URL, and thumbnail.
 */

/**
 * Extract a YouTube video id from any common input:
 * - a bare 11-char id ("dQw4w9WgXcQ")
 * - watch URLs (youtube.com/watch?v=ID)
 * - short URLs (youtu.be/ID)
 * - embed URLs (youtube.com/embed/ID)
 * - shorts URLs (youtube.com/shorts/ID)
 *
 * Returns null if no id can be parsed.
 */
export function parseYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  // Already a bare id.
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      // /embed/ID or /shorts/ID
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (idx >= 0 && parts[idx + 1] && /^[A-Za-z0-9_-]{11}$/.test(parts[idx + 1])) {
        return parts[idx + 1];
      }
    }
  } catch {
    // Not a URL — fall through.
  }
  return null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
