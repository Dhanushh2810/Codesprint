import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CompanyDetailClient } from "./company-detail-client";
import { prisma } from "@/lib/db";
import { getCurrentUserProfile } from "@/lib/auth/user";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) notFound();

  const user = await getCurrentUserProfile();
  const rows = await prisma.companyProblem.findMany({
    where: { companyId: company.id },
    include: {
      problem: {
        include: {
          topics: { include: { topic: true } },
          companies: { include: { company: true } },
        },
      },
    },
  });

  const progress = user
    ? await prisma.userProblem.findMany({
        where: {
          userId: user.id,
          problemId: { in: rows.map((r) => r.problemId) },
        },
      })
    : [];
  const progressMap = new Map(progress.map((p) => [p.problemId, p.status]));

  const problems = rows.map((r) => ({
    id: r.problem.id,
    title: r.problem.title,
    slug: r.problem.slug,
    difficulty: r.problem.difficulty,
    topics: r.problem.topics.map((t) => t.topic.name),
    companies: r.problem.companies.map((c) => c.company.name),
    status: progressMap.get(r.problem.id) ?? "NOT_ATTEMPTED",
  }));

  const solved = problems.filter((p) => p.status === "SOLVED").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CompanyDetailClient
          company={{
            name: company.name,
            slug: company.slug,
            accentColor: company.accentColor,
            totalProblems: problems.length,
            solved,
            remaining: problems.length - solved,
            progress: problems.length ? Math.round((solved / problems.length) * 100) : 0,
          }}
          problems={problems}
        />
      </div>
    </AppShell>
  );
}
