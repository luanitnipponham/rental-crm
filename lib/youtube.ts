/**
 * Utility functions for handling YouTube and video URLs
 */

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex pattern matching all common YouTube URL formats
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );

  return match ? match[1] : null;
}

/**
 * Generates an embeddable YouTube player URL with privacy-enhanced domain and autoplay
 */
export function getYouTubeEmbedUrl(url?: string | null, autoplay = true): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
}

/**
 * Generates a YouTube video thumbnail URL
 */
export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/**
 * Checks whether a given string is a valid YouTube URL
 */
export function isYouTubeUrl(url?: string | null): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Ensures a URL starts with http:// or https:// for safe external linking
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

