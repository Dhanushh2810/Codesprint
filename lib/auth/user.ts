import type { SkillLevel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCustomAuthUser, isAdminEmail } from "@/lib/auth/custom";

export async function getAuthUser() {
  const user = await getCustomAuthUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      name: user.name,
      college: user.college,
      graduationYear: user.graduationYear,
    },
  };
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
  if (!isAdminEmail(result.authUser.email)) {
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
