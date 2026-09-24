import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";
import { profileUpdateSchema } from "@/lib/validations/auth";
import { getUserStreak } from "@/lib/services/progress";

export async function GET() {
  try {
    const { profile } = await requireUser();
    const [solved, streak, targets] = await Promise.all([
      prisma.userProblem.count({
        where: { userId: profile.id, status: "SOLVED" },
      }),
      getUserStreak(profile.id),
      prisma.userTargetCompany.findMany({
        where: { userId: profile.id },
        include: { company: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const total = await prisma.problem.count();

    return jsonOk({
      profile: {
        ...profile,
        problemsSolved: solved,
        streak,
        overallProgress: total ? Math.round((solved / total) * 100) : 0,
        targetCompanies: targets.map((t) => t.company),
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to load profile", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const { profile } = await requireUser();
    const body = profileUpdateSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: profile.id },
      data: {
        name: body.name,
        college: body.college,
        graduationYear: body.graduationYear,
      },
    });

    return jsonOk({ profile: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError(e.issues[0]?.message ?? "Invalid input");
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to update profile", 500);
  }
}
