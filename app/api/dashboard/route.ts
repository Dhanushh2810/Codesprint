import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";
import { getHeatmapData, getUserStreak } from "@/lib/services/progress";

export async function GET() {
  try {
    const { profile } = await requireUser();

    const [targets, solvedCount, attemptedCount, totalProblems, activities, streak, heatmap] =
      await Promise.all([
        prisma.userTargetCompany.findMany({
          where: { userId: profile.id },
          orderBy: { sortOrder: "asc" },
          include: {
            company: {
              include: { problems: { include: { problem: { select: { id: true } } } } },
            },
          },
        }),
        prisma.userProblem.count({
          where: { userId: profile.id, status: "SOLVED" },
        }),
        prisma.userProblem.count({
          where: { userId: profile.id, status: "ATTEMPTED" },
        }),
        prisma.problem.count(),
        prisma.userActivity.findMany({
          where: { userId: profile.id },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        getUserStreak(profile.id),
        getHeatmapData(profile.id),
      ]);

    const solvedSet = new Set(
      (
        await prisma.userProblem.findMany({
          where: { userId: profile.id, status: "SOLVED" },
          select: { problemId: true },
        })
      ).map((s) => s.problemId)
    );

    const targetCompanies = targets.map((t) => {
      const ids = t.company.problems.map((p) => p.problem.id);
      const solved = ids.filter((id) => solvedSet.has(id)).length;
      return {
        id: t.company.id,
        name: t.company.name,
        slug: t.company.slug,
        accentColor: t.company.accentColor,
        solved,
        total: ids.length,
        progress: ids.length ? Math.round((solved / ids.length) * 100) : 0,
      };
    });

    const difficulty = await prisma.problem.groupBy({
      by: ["difficulty"],
      _count: true,
    });

    const solvedByDiff = await prisma.userProblem.findMany({
      where: { userId: profile.id, status: "SOLVED" },
      include: { problem: { select: { difficulty: true } } },
    });

    const diffSolved = { EASY: 0, MEDIUM: 0, HARD: 0 };
    solvedByDiff.forEach((s) => {
      diffSolved[s.problem.difficulty] += 1;
    });

    const recommended = await prisma.problem.findMany({
      where: {
        companies: {
          some: {
            companyId: { in: targets.map((t) => t.companyId) },
          },
        },
        userProblems: {
          none: { userId: profile.id, status: "SOLVED" },
        },
      },
      orderBy: { popularity: "desc" },
      take: 6,
      include: {
        companies: { include: { company: true } },
        topics: { include: { topic: true } },
      },
    });

    return jsonOk({
      user: {
        name: profile.name,
        onboardingCompleted: profile.onboardingCompleted,
      },
      stats: {
        solved: solvedCount,
        attempted: attemptedCount,
        streak,
        overallProgress: totalProblems
          ? Math.round((solvedCount / totalProblems) * 100)
          : 0,
        totalProblems,
      },
      targetCompanies,
      difficulty: difficulty.map((d) => ({
        difficulty: d.difficulty,
        total: d._count,
        solved: diffSolved[d.difficulty],
      })),
      recentActivity: activities,
      heatmap,
      recommended: recommended.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        companies: p.companies.map((c) => c.company.name),
        topics: p.topics.map((t) => t.topic.name),
      })),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to load dashboard", 500);
  }
}
