import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import { createAuthSession, hashPassword } from "@/lib/auth/custom";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  college: z.string().trim().optional(),
  graduationYear: z.number().int().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.passwordHash) return jsonError("An account with this email already exists", 409);

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: body.name,
            passwordHash: await hashPassword(body.password),
            college: body.college || null,
            graduationYear: body.graduationYear ?? null,
          },
        })
      : await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            email,
            name: body.name,
            passwordHash: await hashPassword(body.password),
            college: body.college || null,
            graduationYear: body.graduationYear ?? null,
          },
        });

    await createAuthSession(user.id);
        return jsonOk({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            college: user.college,
            graduationYear: user.graduationYear,
          },
        });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid signup details", 400);
    return jsonError("Unable to create account", 500);
  }
}
