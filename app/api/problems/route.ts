import type { Difficulty, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-response";
import { getCurrentUserProfile } from "@/lib/auth/user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const company = searchParams.get("company");
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") ?? "popularity";
  const targetOnly = searchParams.get("targetOnly") === "true";

  const user = await getCurrentUserProfile();

  const where: Prisma.ProblemWhereInput = {};

  if (q) {
    where.title = { contains: q };
  }
  if (difficulty) {
    where.difficulty = difficulty;
  }
  if (company) {
    const slugs = company.split(",").map((s) => s.trim()).filter(Boolean);
    where.companies = {
      some: {
        company: {
          OR: slugs.map((s) => ({ slug: s })),
        },
      },
    };
  }
  if (topic) {
    where.topics = { some: { topic: { OR: [{ slug: topic }, { name: topic }] } } };
  }
  if (targetOnly && user) {
    const targets = await prisma.userTargetCompany.findMany({
      where: { userId: user.id },
      select: { companyId: true },
    });
    where.companies = {
      some: { companyId: { in: targets.map((t) => t.companyId) } },
    };
  }

  let orderBy: Prisma.ProblemOrderByWithRelationInput = { popularity: "desc" };
  if (sort === "difficulty") orderBy = { difficulty: "asc" };
  if (sort === "recent") orderBy = { createdAt: "desc" };

  const problems = await prisma.problem.findMany({
    where,
    orderBy,
    include: {
      companies: { include: { company: true } },
      topics: { include: { topic: true } },
    },
  });

  const progressMap = new Map<string, string>();
  if (user) {
    const progress = await prisma.userProblem.findMany({
      where: { userId: user.id, problemId: { in: problems.map((p) => p.id) } },
    });
    progress.forEach((p) => progressMap.set(p.problemId, p.status));
  }

  let result = problems.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    popularity: p.popularity,
    companies: p.companies.map((c) => c.company.name),
    companySlugs: p.companies.map((c) => c.company.slug),
    topics: p.topics.map((t) => t.topic.name),
    status: progressMap.get(p.id) ?? "NOT_ATTEMPTED",
    companyFrequency: p.companies.length,
  }));

  if (status) {
    result = result.filter((p) => p.status === status);
  }

  if (sort === "company") {
    result.sort((a, b) => b.companyFrequency - a.companyFrequency);
  }

  return jsonOk({ problems: result });
}
