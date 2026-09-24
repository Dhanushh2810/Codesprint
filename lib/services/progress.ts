import type { ActivityType, ProblemStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { startOfDay, subDays } from "date-fns";

export async function recordActivity(
  userId: string,
  type: ActivityType,
  message: string,
  metadata?: Record<string, unknown>
) {
  await prisma.userActivity.create({
    data: {
      userId,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  const today = startOfDay(new Date());
  await prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function updateUserProblemProgress(input: {
  userId: string;
  problemId: string;
  status: ProblemStatus;
  language: string;
  runtimeMs?: number;
  memoryKb?: number;
}) {
  const existing = await prisma.userProblem.findUnique({
    where: {
      userId_problemId: { userId: input.userId, problemId: input.problemId },
    },
  });

  const now = new Date();
  const isSolved = input.status === "SOLVED";

  await prisma.userProblem.upsert({
    where: {
      userId_problemId: { userId: input.userId, problemId: input.problemId },
    },
    create: {
      userId: input.userId,
      problemId: input.problemId,
      status: input.status,
      attempts: 1,
      lastAttemptedAt: now,
      solvedAt: isSolved ? now : undefined,
      bestRuntimeMs: input.runtimeMs,
      bestMemoryKb: input.memoryKb,
      preferredLanguage: input.language,
    },
    update: {
      status:
        existing?.status === "SOLVED"
          ? "SOLVED"
          : isSolved
            ? "SOLVED"
            : input.status,
      attempts: { increment: 1 },
      lastAttemptedAt: now,
      solvedAt: isSolved ? now : existing?.solvedAt,
      bestRuntimeMs:
        input.runtimeMs !== undefined
          ? Math.min(existing?.bestRuntimeMs ?? input.runtimeMs, input.runtimeMs)
          : existing?.bestRuntimeMs,
      bestMemoryKb:
        input.memoryKb !== undefined
          ? Math.min(existing?.bestMemoryKb ?? input.memoryKb, input.memoryKb)
          : existing?.bestMemoryKb,
      preferredLanguage: input.language,
    },
  });
}

export async function getUserStreak(userId: string): Promise<number> {
  const days = await prisma.dailyActivity.findMany({
    where: {
      userId,
      date: { gte: subDays(startOfDay(new Date()), 365) },
    },
    orderBy: { date: "desc" },
  });

  let streak = 0;
  let cursor = startOfDay(new Date());

  const daySet = new Set(days.map((d) => d.date.toISOString().slice(0, 10)));

  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export async function getHeatmapData(userId: string, weeks = 26) {
  const start = subDays(startOfDay(new Date()), weeks * 7);
  const rows = await prisma.dailyActivity.findMany({
    where: { userId, date: { gte: start } },
  });

  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    count: r.count,
  }));
}
