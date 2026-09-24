import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getCurrentUserProfile } from "@/lib/auth/user";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const company = await prisma.company.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      problems: {
        include: {
          problem: {
            include: {
              topics: { include: { topic: true } },
              companies: { include: { company: true } },
            },
          },
        },
      },
    },
  });

  if (!company) return jsonError("Company not found", 404);

  const user = await getCurrentUserProfile();
  const progressMap = new Map<string, string>();
  if (user) {
    const rows = await prisma.userProblem.findMany({
      where: {
        userId: user.id,
        problemId: { in: company.problems.map((cp) => cp.problemId) },
      },
    });
    rows.forEach((r) => progressMap.set(r.problemId, r.status));
  }

  const problems = company.problems.map((cp) => ({
    id: cp.problem.id,
    title: cp.problem.title,
    slug: cp.problem.slug,
    difficulty: cp.problem.difficulty,
    topics: cp.problem.topics.map((t) => t.topic.name),
    companies: cp.problem.companies.map((c) => c.company.name),
    status: progressMap.get(cp.problem.id) ?? "NOT_ATTEMPTED",
  }));

  const solved = problems.filter((p) => p.status === "SOLVED").length;

  return jsonOk({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      accentColor: company.accentColor,
      totalProblems: problems.length,
      solved,
      remaining: problems.length - solved,
      progress: problems.length ? Math.round((solved / problems.length) * 100) : 0,
    },
    problems,
  });
}
