"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DifficultyChart({
  data,
}: {
  data: { difficulty: string; total: number; solved: number }[];
}) {
  const difficultyColors: Record<string, string> = {
    Easy: "#22c55e",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  const chartData = data.map((d) => ({
    name: d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase(),
    solved: d.solved,
    remaining: Math.max(0, d.total - d.solved),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="solved" stackId="a" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={`solved-${entry.name}`} fill={difficultyColors[entry.name]} />
            ))}
          </Bar>
          <Bar dataKey="remaining" stackId="a" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={`remaining-${entry.name}`}
                fill={difficultyColors[entry.name]}
                fillOpacity={0.25}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopicChart({
  data,
}: {
  data: { name: string; solved: number; total: number }[];
}) {
  const top = data.sort((a, b) => b.total - a.total).slice(0, 8);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="solved" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
