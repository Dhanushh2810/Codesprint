import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { getAuthUser, requireUser } from "@/lib/auth/user";
import { recordActivity } from "@/lib/services/progress";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const targets = await prisma.userTargetCompany.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
    include: {
      company: {
        include: {
          problems: { include: { problem: { select: { id: true } } } },
        },
      },
    },
  });

  const solved = await prisma.userProblem.findMany({
    where: { userId: user.id, status: "SOLVED" },
    select: { problemId: true },
  });
  const solvedSet = new Set(solved.map((s) => s.problemId));

  return jsonOk({
    targets: targets.map((t) => {
      const ids = t.company.problems.map((p) => p.problem.id);
      const solvedCount = ids.filter((id) => solvedSet.has(id)).length;
      return {
        companyId: t.companyId,
        name: t.company.name,
        slug: t.company.slug,
        accentColor: t.company.accentColor,
        sortOrder: t.sortOrder,
        totalProblems: ids.length,
        solved: solvedCount,
        progress: ids.length ? Math.round((solvedCount / ids.length) * 100) : 0,
      };
    }),
  });
}

const updateSchema = z.object({
  companyIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const { profile } = await requireUser();
    const body = updateSchema.parse(await request.json());

    await prisma.$transaction(async (tx) => {
      await tx.userTargetCompany.deleteMany({ where: { userId: profile.id } });
      await tx.userTargetCompany.createMany({
        data: body.companyIds.map((companyId, index) => ({
          userId: profile.id,
          companyId,
          sortOrder: index,
        })),
      });
    });

    await recordActivity(
      profile.id,
      "COMPANY_TARGETED",
      "Updated target companies",
      { companyIds: body.companyIds }
    );

    return jsonOk({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError(e.issues[0]?.message ?? "Invalid input");
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to update targets", 500);
  }
}
