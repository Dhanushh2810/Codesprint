import { jsonOk, unauthorized } from "@/lib/api-response";
import { getCustomAuthUser, isAdminEmail } from "@/lib/auth/custom";

export async function GET() {
  const user = await getCustomAuthUser();
  if (!user) return unauthorized();
  return jsonOk({
    user: { id: user.id, email: user.email, name: user.name },
    isAdmin: isAdminEmail(user.email),
  });
}
