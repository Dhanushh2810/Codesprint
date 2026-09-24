import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { ensureUserRecord, getAuthUser } from "@/lib/auth/user";

export async function POST() {
  const authUser = await getAuthUser();
  if (!authUser) return unauthorized();

  const profile = await ensureUserRecord({
    id: authUser.id,
    email: authUser.email ?? "",
    name:
      (authUser.user_metadata?.name as string | undefined) ??
      authUser.email?.split("@")[0] ??
      "User",
    college: (authUser.user_metadata?.college as string | undefined) ?? null,
    graduationYear: authUser.user_metadata?.graduationYear
      ? Number(authUser.user_metadata.graduationYear)
      : null,
  });

  return jsonOk({ profile });
}
