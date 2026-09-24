import { jsonOk } from "@/lib/api-response";
import { destroyAuthSession } from "@/lib/auth/custom";

export async function POST() {
  await destroyAuthSession();
  return jsonOk({ success: true });
}
