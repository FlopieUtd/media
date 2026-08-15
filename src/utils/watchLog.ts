import type { VideoFile } from "../types/media";
import { formatEpisodeTitle } from "./video";

const KEY = "watch-log";
// localStorage is small and old sessions have little value — keep the log bounded.
const MAX_ENTRIES = 400;
// Returning to the same episode after a long break counts as a new viewing session
// rather than extending the previous one.
const SESSION_GAP_MS = 30 * 60 * 1000;

export interface WatchLogEntry {
  id: string;
  // Episode title as shown in the player, e.g. "S02 E03 · The Hunt"
  title: string;
  show?: string;
  startedAt: number;
  endedAt: number;
  seconds: number;
}

const load = (): WatchLogEntry[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getWatchLog = (): WatchLogEntry[] => load();

// Record watched seconds against the episode that produced them, appending to the
// running session when it's still the same episode. Shares the caller's guarantees
// with addWatchSeconds: non-positive deltas (pause, seek back, episode change) and
// absurd outliers are dropped.
export const logWatch = (video: VideoFile, seconds: number) => {
  if (!(seconds > 0) || seconds > 3600) return;
  const log = load();
  const now = Date.now();
  const last = log[log.length - 1];

  if (last && last.id === video.id && now - last.endedAt < SESSION_GAP_MS) {
    last.seconds += seconds;
    last.endedAt = now;
  } else {
    log.push({
      id: video.id,
      title: formatEpisodeTitle(video),
      show: video.show,
      startedAt: now,
      endedAt: now,
      seconds,
    });
    if (log.length > MAX_ENTRIES) log.splice(0, log.length - MAX_ENTRIES);
  }

  localStorage.setItem(KEY, JSON.stringify(log));
};
