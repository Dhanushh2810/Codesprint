"use client";

import { cn } from "@/lib/utils";

export function Heatmap({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  const cells: { date: string; count: number }[] = [];

  for (let i = 26 * 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: map.get(key) ?? 0 });
  }

  function intensity(count: number) {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
    if (count <= 3) return "bg-emerald-400 dark:bg-emerald-700";
    return "bg-emerald-600 dark:bg-emerald-500";
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells.map((cell) => (
          <div
            key={cell.date}
            title={`${cell.date}: ${cell.count} submissions`}
            className={cn("h-3 w-3 rounded-sm", intensity(cell.count))}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Daily coding activity (last 6 months)</p>
    </div>
  );
}
