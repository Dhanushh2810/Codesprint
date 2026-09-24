import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import { createAuthSession, verifyPassword } from "@/lib/auth/custom";
import { ensureUserRecord } from "@/lib/auth/user";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { email, password } = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    await createAuthSession(user.id);
    return jsonOk({ user: await ensureUserRecord({ id: user.id, email: user.email, name: user.name }) });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError("Enter a valid email and password", 400);
    return jsonError("Unable to log in", 500);
  }
}
