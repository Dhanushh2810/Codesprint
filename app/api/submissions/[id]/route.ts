import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireUser();
    const { id } = await params;

    const submission = await prisma.submission.findFirst({
      where: { id, userId: profile.id },
      include: { problem: { select: { title: true, slug: true } } },
    });

    if (!submission) return jsonError("Submission not found", 404);

    return jsonOk({ submission });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to load submission", 500);
  }
}
