import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/user";
import { recordActivity } from "@/lib/services/progress";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { profile } = await requireUser();
    const { companyId } = await params;

    await prisma.userTargetCompany.deleteMany({
      where: { userId: profile.id, companyId },
    });

    await recordActivity(
      profile.id,
      "COMPANY_UNTARGETED",
      "Removed a target company",
      { companyId }
    );

    return jsonOk({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return jsonError("Failed to remove target", 500);
  }
}
