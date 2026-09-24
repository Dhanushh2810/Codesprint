import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";
import { executeAgainstTests } from "@/lib/judge0/client";
import { rateLimit } from "@/lib/rate-limit";
import { runCodeSchema } from "@/lib/validations/submissions";

export async function POST(request: Request) {
  try {
    const { profile } = await requireUser();
    const limit = rateLimit(`run:${profile.id}`, 20, 60_000);
    if (!limit.allowed) {
      return jsonError("Too many run requests. Please wait a moment.", 429);
    }

    const body = runCodeSchema.parse(await request.json());
    const problem = await prisma.problem.findUnique({
      where: { id: body.problemId },
      include: {
        testCases: { where: { isSample: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    if (!problem) return jsonError("Problem not found", 404);
    if (!problem.testCases.length) {
      return jsonError("No sample test cases configured", 400);
    }

    const result = await executeAgainstTests({
      sourceCode: body.sourceCode,
      language: body.language,
      tests: problem.testCases.map((t) => ({
        input: t.input,
        expectedOutput: t.expectedOutput,
      })),
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      revealDetails: true,
    });

    return jsonOk({ result });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError(e.issues[0]?.message ?? "Invalid input");
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to run code", 500);
  }
}
