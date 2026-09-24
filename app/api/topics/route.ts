import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-response";

export async function GET() {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  return jsonOk({ topics });
}
