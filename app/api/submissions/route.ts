import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";
import { executeAgainstTests } from "@/lib/judge0/client";
import { rateLimit } from "@/lib/rate-limit";
import { recordActivity, updateUserProblemProgress } from "@/lib/services/progress";
import { submitCodeSchema } from "@/lib/validations/submissions";

export async function GET(request: Request) {
  try {
    const { profile } = await requireUser();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const problemId = searchParams.get("problemId");

    const where = {
      userId: profile.id,
      ...(problemId ? { problemId } : {}),
    };

    const [total, submissions] = await Promise.all([
      prisma.submission.count({ where }),
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { problem: { select: { title: true, slug: true } } },
      }),
    ]);

    return jsonOk({
      submissions: submissions.map((s) => ({
        id: s.id,
        problemId: s.problemId,
        problemTitle: s.problem.title,
        problemSlug: s.problem.slug,
        language: s.language,
        status: s.status,
        runtimeMs: s.runtimeMs,
        memoryKb: s.memoryKb,
        createdAt: s.createdAt,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to load submissions", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { profile } = await requireUser();
    const limit = rateLimit(`submit:${profile.id}`, 10, 60_000);
    if (!limit.allowed) {
      return jsonError("Too many submissions. Please wait a moment.", 429);
    }

    const body = submitCodeSchema.parse(await request.json());
    const problem = await prisma.problem.findUnique({
      where: { id: body.problemId },
      include: {
        testCases: { where: { isSample: false }, orderBy: { sortOrder: "asc" } },
      },
    });

    if (!problem) return jsonError("Problem not found", 404);

    const tests =
      problem.testCases.length > 0
        ? problem.testCases
        : await prisma.testCase.findMany({
            where: { problemId: problem.id },
            orderBy: { sortOrder: "asc" },
          });

    const result = await executeAgainstTests({
      sourceCode: body.sourceCode,
      language: body.language,
      tests: tests.map((t) => ({ input: t.input, expectedOutput: t.expectedOutput })),
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      revealDetails: false,
    });

    const submission = await prisma.submission.create({
      data: {
        userId: profile.id,
        problemId: problem.id,
        language: body.language,
        sourceCode: body.sourceCode,
        status: result.status,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        errorMessage: result.errorMessage ?? result.compileOutput,
      },
    });

    await updateUserProblemProgress({
      userId: profile.id,
      problemId: problem.id,
      status: result.status === "ACCEPTED" ? "SOLVED" : "ATTEMPTED",
      language: body.language,
      runtimeMs: result.runtimeMs,
      memoryKb: result.memoryKb,
    });

    if (result.status === "ACCEPTED") {
      await recordActivity(
        profile.id,
        "SUBMISSION_ACCEPTED",
        `Accepted submission on ${problem.title}`,
        { problemId: problem.id, submissionId: submission.id }
      );
      await recordActivity(
        profile.id,
        "PROBLEM_SOLVED",
        `Solved ${problem.title}`,
        { problemId: problem.id }
      );
    } else {
      await recordActivity(
        profile.id,
        "PROBLEM_ATTEMPTED",
        `Attempted ${problem.title}`,
        { problemId: problem.id, status: result.status }
      );
    }

    return jsonOk({ submission, result });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError(e.issues[0]?.message ?? "Invalid input");
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to submit code", 500);
  }
}
