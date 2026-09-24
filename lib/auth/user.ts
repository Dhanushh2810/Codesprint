import type { SkillLevel } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user;
  } catch {
    // Supabase auth error or unconfigured
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const cookieStore = await cookies();
      const devVal = cookieStore.get("codesprint_dev_user")?.value || cookieStore.get("codetarget_dev_user")?.value;
      if (devVal) {
        const parsed = JSON.parse(devVal);
        if (parsed?.id) {
          return {
            id: parsed.id,
            email: parsed.email ?? "dev@codesprint.com",
            user_metadata: {
              name: parsed.name ?? "Demo User",
              college: parsed.college,
              graduationYear: parsed.graduationYear,
            },
          } as any;
        }
      }
    } catch {
      // Cookie error
    }
  }

  return null;
}

export async function getCurrentUserProfile() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const profile = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  return profile;
}

export async function ensureUserRecord(input: {
  id: string;
  email: string;
  name: string;
  college?: string | null;
  graduationYear?: number | null;
}) {
  return prisma.user.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      name: input.name,
      college: input.college ?? undefined,
      graduationYear: input.graduationYear ?? undefined,
    },
    update: {
      email: input.email,
      name: input.name,
      college: input.college ?? undefined,
      graduationYear: input.graduationYear ?? undefined,
    },
  });
}

export async function requireUser() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error("UNAUTHORIZED");
  }

  let profile = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!profile) {
    profile = await ensureUserRecord({
      id: authUser.id,
      email: authUser.email ?? "dev@codesprint.com",
      name:
        (authUser.user_metadata?.name as string | undefined) ??
        authUser.email?.split("@")[0] ??
        "Demo User",
      college: (authUser.user_metadata?.college as string | undefined) ?? null,
      graduationYear: authUser.user_metadata?.graduationYear
        ? Number(authUser.user_metadata.graduationYear)
        : null,
    });
  }

  return { authUser, profile };
}

export async function requireAdmin() {
  const result = await requireUser();
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!result.authUser.email || !allowedEmails.includes(result.authUser.email.toLowerCase())) {
    throw new Error("FORBIDDEN");
  }

  return result;
}

export async function completeOnboarding(
  userId: string,
  data: {
    companyIds: string[];
    topicIds: string[];
    skillLevel: SkillLevel;
  }
) {
  await prisma.$transaction(async (tx) => {
    await tx.userTopicFocus.deleteMany({ where: { userId } });
    await tx.userTargetCompany.deleteMany({ where: { userId } });

    if (data.topicIds.length) {
      await tx.userTopicFocus.createMany({
        data: data.topicIds.map((topicId) => ({ userId, topicId })),
      });
    }

    if (data.companyIds.length) {
      await tx.userTargetCompany.createMany({
        data: data.companyIds.map((companyId, index) => ({
          userId,
          companyId,
          sortOrder: index,
        })),
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        skillLevel: data.skillLevel,
        onboardingCompleted: true,
      },
    });
  });
}
