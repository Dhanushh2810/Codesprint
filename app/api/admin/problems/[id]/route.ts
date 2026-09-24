import { prisma } from "@/lib/db";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth/user";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        companies: { include: { company: true } },
        topics: { include: { topic: true } },
        testCases: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!problem) return jsonError("Problem not found", 404);

    return jsonOk({ problem });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    if (e instanceof Error && e.message === "FORBIDDEN") return jsonError("Admin access required", 403);
    return jsonError("Failed to fetch problem", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.problem.delete({
      where: { id },
    });

    return jsonOk({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    if (e instanceof Error && e.message === "FORBIDDEN") return jsonError("Admin access required", 403);
    return jsonError("Failed to delete problem", 500);
  }
}
