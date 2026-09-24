import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";
import { getHeatmapData, getUserStreak } from "@/lib/services/progress";

export async function GET() {
  try {
    const { profile } = await requireUser();

    const [solved, attempted, totalProblems, byDifficulty, byTopic, heatmap, streak] =
      await Promise.all([
        prisma.userProblem.count({
          where: { userId: profile.id, status: "SOLVED" },
        }),
        prisma.userProblem.count({
          where: { userId: profile.id, status: "ATTEMPTED" },
        }),
        prisma.problem.count(),
        prisma.userProblem.groupBy({
          by: ["status"],
          where: { userId: profile.id },
          _count: true,
        }),
        prisma.problemTopic.findMany({
          include: {
            topic: true,
            problem: {
              include: {
                userProblems: { where: { userId: profile.id } },
              },
            },
          },
        }),
        getHeatmapData(profile.id),
        getUserStreak(profile.id),
      ]);

    const difficultyStats = await prisma.problem.groupBy({
      by: ["difficulty"],
      _count: true,
    });

    const solvedByDifficulty = await prisma.userProblem.findMany({
      where: { userId: profile.id, status: "SOLVED" },
      include: { problem: { select: { difficulty: true } } },
    });

    const diffMap = { EASY: 0, MEDIUM: 0, HARD: 0 };
    solvedByDifficulty.forEach((s) => {
      diffMap[s.problem.difficulty] += 1;
    });

    const topicProgressMap = new Map<string, { total: number; solved: number }>();
    byTopic.forEach((pt) => {
      const key = pt.topic.name;
      const entry = topicProgressMap.get(key) ?? { total: 0, solved: 0 };
      entry.total += 1;
      if (pt.problem.userProblems.some((up) => up.status === "SOLVED")) {
        entry.solved += 1;
      }
      topicProgressMap.set(key, entry);
    });

    return jsonOk({
      solved,
      attempted,
      totalProblems,
      streak,
      overallProgress: totalProblems ? Math.round((solved / totalProblems) * 100) : 0,
      difficulty: difficultyStats.map((d) => ({
        difficulty: d.difficulty,
        total: d._count,
        solved: diffMap[d.difficulty],
      })),
      topics: Array.from(topicProgressMap.entries()).map(([name, v]) => ({
        name,
        total: v.total,
        solved: v.solved,
        progress: v.total ? Math.round((v.solved / v.total) * 100) : 0,
      })),
      heatmap,
      statusBreakdown: byDifficulty,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to load progress", 500);
  }
}
