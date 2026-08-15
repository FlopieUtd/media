import { useMemo } from "react";
import { dateKey, formatDuration } from "../../utils/watchTime";
import type { WatchLogEntry } from "../../utils/watchLog";

interface Props {
  // Newest first, already limited to the period on screen.
  entries: WatchLogEntry[];
}

interface DayGroup {
  key: string;
  date: Date;
  entries: WatchLogEntry[];
}

// Entries arrive sorted, so equal days are always adjacent.
const groupByDay = (entries: WatchLogEntry[]): DayGroup[] => {
  const groups: DayGroup[] = [];
  for (const entry of entries) {
    const date = new Date(entry.startedAt);
    const key = dateKey(date);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.entries.push(entry);
    else groups.push({ key, date, entries: [entry] });
  }
  return groups;
};

export const EpisodeLog = ({ entries }: Props) => {
  const groups = useMemo(() => groupByDay(entries), [entries]);

  if (groups.length === 0) return null;

  return (
    <section className="mt-[48px]">
      <h2 className="text-[16px] font-semibold mb-[20px]">Episode log</h2>
      <div className="space-y-[24px]">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="text-[11px] uppercase tracking-wider text-[#777] mb-[8px]">
              {group.date.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <ul>
              {group.entries.map((entry) => (
                <li
                  key={`${entry.id}-${entry.startedAt}`}
                  className="flex items-baseline gap-[16px] py-[8px] border-t border-white/5"
                >
                  <span className="w-[48px] shrink-0 text-[13px] text-[#888] tabular-nums">
                    {new Date(entry.startedAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[14px]">
                    {entry.show && <span className="text-[#888]">{entry.show} · </span>}
                    {entry.title}
                  </span>
                  <span className="shrink-0 text-[13px] text-[#888] tabular-nums">
                    {formatDuration(entry.seconds)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
