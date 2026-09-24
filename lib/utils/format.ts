import type { Difficulty, ProblemStatus, SubmissionStatus } from "@prisma/client";

export function difficultyLabel(d: Difficulty | string): string {
  if (!d) return "";
  return d.charAt(0) + d.slice(1).toLowerCase();
}

export function statusLabel(s: ProblemStatus | string): string {
  if (!s) return "";
  return s
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function submissionStatusLabel(s: SubmissionStatus | string): string {
  if (!s) return "";
  return s
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function greetingForHour(name: string): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name ? name.split(" ")[0] : "Engineer"}`;
}

export function percent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
