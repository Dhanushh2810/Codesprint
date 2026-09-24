import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getCurrentUserProfile } from "@/lib/auth/user";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const problem = await prisma.problem.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      companies: { include: { company: true } },
      topics: { include: { topic: true } },
      testCases: { where: { isSample: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!problem) return jsonError("Problem not found", 404);

  const user = await getCurrentUserProfile();
  let status = "NOT_ATTEMPTED";
  if (user) {
    const up = await prisma.userProblem.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    });
    status = up?.status ?? "NOT_ATTEMPTED";
  }

  return jsonOk({
    problem: {
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      description: problem.description,
      difficulty: problem.difficulty,
      constraints: problem.constraints,
      examples: problem.examples,
      followUp: problem.followUp,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      starterCode: problem.starterCode,
      companies: problem.companies.map((c) => ({
        name: c.company.name,
        slug: c.company.slug,
      })),
      topics: problem.topics.map((t) => t.topic.name),
      sampleTests: problem.testCases.map((t) => ({
        input: t.input,
        output: t.expectedOutput,
      })),
      status,
    },
  });
}
