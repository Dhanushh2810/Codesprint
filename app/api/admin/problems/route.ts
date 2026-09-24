import { z } from "zod";
import type { Difficulty } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth/user";
import { DEFAULT_STARTER_CODE } from "@/lib/judge0/languages";

const createProblemSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  description: z.string().min(10, "Description is required"),
  constraints: z.string().min(2, "Constraints are required"),
  followUp: z.string().optional(),
  popularity: z.number().default(50),
  companyIds: z.array(z.string()).min(1, "Select at least one company"),
  topicIds: z.array(z.string()).min(1, "Select at least one topic"),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().optional(),
    })
  ).default([]),
  sampleTestCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
    })
  ).min(1, "Add at least one sample test case"),
  hiddenTestCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
    })
  ).default([]),
  starterCode: z.record(z.string(), z.string()).optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        companies: { include: { company: true } },
        topics: { include: { topic: true } },
        testCases: { orderBy: { sortOrder: "asc" } },
        _count: { select: { submissions: true } },
      },
    });

    return jsonOk({
      problems: problems.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        popularity: p.popularity,
        createdAt: p.createdAt,
        companies: p.companies.map((c) => c.company.name),
        topics: p.topics.map((t) => t.topic.name),
        testCasesCount: p.testCases.length,
        sampleCount: p.testCases.filter((t) => t.isSample).length,
        hiddenCount: p.testCases.filter((t) => !t.isSample).length,
        submissionsCount: p._count.submissions,
      })),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    if (e instanceof Error && e.message === "FORBIDDEN") return jsonError("Admin access required", 403);
    return jsonError("Failed to fetch admin problems", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createProblemSchema.parse(await request.json());

    // Check slug collision
    const existing = await prisma.problem.findUnique({
      where: { slug: body.slug },
    });
    if (existing) {
      return jsonError("A problem with this slug already exists", 400);
    }

    const starterCodeJson = JSON.stringify(body.starterCode || DEFAULT_STARTER_CODE);
    const examplesJson = JSON.stringify(body.examples);

    const problem = await prisma.$transaction(async (tx) => {
      // 1. Create Problem
      const created = await tx.problem.create({
        data: {
          title: body.title,
          slug: body.slug,
          difficulty: body.difficulty as Difficulty,
          description: body.description,
          constraints: body.constraints,
          followUp: body.followUp,
          popularity: body.popularity,
          examples: examplesJson,
          starterCode: starterCodeJson,
        },
      });

      // 2. Connect Companies
      for (const companyId of body.companyIds) {
        await tx.companyProblem.create({
          data: { companyId, problemId: created.id },
        });
      }

      // 3. Connect Topics
      for (const topicId of body.topicIds) {
        await tx.problemTopic.create({
          data: { topicId, problemId: created.id },
        });
      }

      // 4. Create Sample Test Cases
      let order = 0;
      for (const tc of body.sampleTestCases) {
        await tx.testCase.create({
          data: {
            problemId: created.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: true,
            sortOrder: order++,
          },
        });
      }

      // 5. Create Hidden Test Cases
      for (const tc of body.hiddenTestCases) {
        await tx.testCase.create({
          data: {
            problemId: created.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: false,
            sortOrder: order++,
          },
        });
      }

      return created;
    });

    return jsonOk({ problem });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError(e.issues[0]?.message ?? "Invalid input", 400);
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    if (e instanceof Error && e.message === "FORBIDDEN") return jsonError("Admin access required", 403);
    return jsonError("Failed to create problem", 500);
  }
}
