import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { completeOnboarding, requireUser } from "@/lib/auth/user";
import { onboardingSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const { profile } = await requireUser();
    const body = onboardingSchema.parse(await request.json());

    await completeOnboarding(profile.id, {
      companyIds: body.companyIds,
      topicIds: body.topicIds,
      skillLevel: body.skillLevel,
    });

    return jsonOk({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError(e.issues[0]?.message ?? "Invalid input");
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to save onboarding", 500);
  }
}

export async function GET() {
  try {
    const { profile } = await requireUser();
    const topics = await prisma.userTopicFocus.findMany({
      where: { userId: profile.id },
      include: { topic: true },
    });
    const companies = await prisma.userTargetCompany.findMany({
      where: { userId: profile.id },
      include: { company: true },
      orderBy: { sortOrder: "asc" },
    });

    return jsonOk({
      onboardingCompleted: profile.onboardingCompleted,
      skillLevel: profile.skillLevel,
      topics: topics.map((t) => t.topic),
      companies: companies.map((c) => c.company),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to load onboarding", 500);
  }
}
