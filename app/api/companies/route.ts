import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { getCurrentUserProfile, requireAdmin } from "@/lib/auth/user";

const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name is required"),
  slug: z.string().trim().min(2, "Company slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a valid hex color").default("#6366f1"),
});

export async function GET() {
  const user = await getCurrentUserProfile();
  const targetIds = user
    ? new Set(
        (
          await prisma.userTargetCompany.findMany({
            where: { userId: user.id },
            select: { companyId: true },
          })
        ).map((t) => t.companyId)
      )
    : new Set<string>();

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      problems: {
        include: { problem: { select: { difficulty: true, id: true } } },
      },
    },
  });

  const solvedSet = user
    ? new Set(
        (
          await prisma.userProblem.findMany({
            where: { userId: user.id, status: "SOLVED" },
            select: { problemId: true },
          })
        ).map((p) => p.problemId)
      )
    : new Set<string>();

  const data = companies.map((company) => {
    const problemIds = company.problems.map((cp) => cp.problem.id);
    const total = problemIds.length;
    const solved = problemIds.filter((id) => solvedSet.has(id)).length;
    const easy = company.problems.filter((cp) => cp.problem.difficulty === "EASY").length;
    const medium = company.problems.filter((cp) => cp.problem.difficulty === "MEDIUM").length;
    const hard = company.problems.filter((cp) => cp.problem.difficulty === "HARD").length;

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      accentColor: company.accentColor,
      description: company.description,
      totalProblems: total,
      easy,
      medium,
      hard,
      solved,
      isTarget: targetIds.has(company.id),
    };
  });

  return jsonOk({ companies: data });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createCompanySchema.parse(await request.json());
    const existing = await prisma.company.findFirst({
      where: { OR: [{ name: body.name }, { slug: body.slug }] },
    });

    if (existing) return jsonError("A company with this name or slug already exists", 400);

    const company = await prisma.company.create({ data: body });
    return jsonOk({ company });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid company", 400);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    if (error instanceof Error && error.message === "FORBIDDEN") return jsonError("Admin access required", 403);
    return jsonError("Failed to create company", 500);
  }
}
