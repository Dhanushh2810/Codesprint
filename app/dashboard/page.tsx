"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, LineChart, Target, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/shared/stats-card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Heatmap } from "@/components/dashboard/heatmap";
import { DifficultyChart } from "@/components/dashboard/dashboard-charts";
import { ProblemCard } from "@/components/problems/problem-card";
import { CompanyAvatar } from "@/components/companies/company-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { greetingForHour } from "@/lib/utils/format";

type DashboardData = {
  user: { name: string };
  stats: {
    solved: number;
    attempted: number;
    streak: number;
    overallProgress: number;
    totalProblems: number;
  };
  targetCompanies: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
    solved: number;
    total: number;
    progress: number;
  }[];
  difficulty: { difficulty: string; total: number; solved: number }[];
  recentActivity: { id: string; type: string; message: string; createdAt: string }[];
  heatmap: { date: string; count: number }[];
  recommended: {
    id: string;
    title: string;
    slug: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    companies: string[];
    topics: string[];
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Could not load dashboard. Try again."));
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {error ? (
          <div className="rounded-xl border border-dashed p-10 text-center">{error}</div>
        ) : !data ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {greetingForHour(data.user.name)}
              </h1>
              <p className="text-muted-foreground">Here&apos;s your preparation progress.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard title="Problems Solved" value={data.stats.solved} icon={Trophy} />
              <StatsCard title="Problems Attempted" value={data.stats.attempted} icon={LineChart} />
              <StatsCard title="Current Streak" value={`${data.stats.streak} days`} icon={Flame} />
              <StatsCard
                title="Overall Progress"
                value={`${data.stats.overallProgress}%`}
                subtitle={`${data.stats.solved} / ${data.stats.totalProblems} problems`}
                icon={Target}
              />
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your target companies</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/targets">Manage targets</Link>
                </Button>
              </div>
              {!data.targetCompanies.length ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No target companies yet.{" "}
                    <Link href="/targets" className="underline">
                      Add companies
                    </Link>{" "}
                    to start building your preparation plan.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.targetCompanies.map((company) => (
                    <Card key={company.id}>
                      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <CompanyAvatar name={company.name} color={company.accentColor} />
                        <div className="flex-1">
                          <CardTitle className="text-base">{company.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {company.solved} / {company.total} solved · {company.progress}%
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ProgressBar value={company.progress} />
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/companies/${company.slug}`}>Practice</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Difficulty breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <DifficultyChart data={data.difficulty} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <Heatmap data={data.heatmap} />
                </CardContent>
              </Card>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Recommended from your targets</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.recommended.map((p) => (
                  <ProblemCard key={p.id} {...p} />
                ))}
              </div>
            </section>

            <ActivityFeed items={data.recentActivity} />
          </>
        )}
      </div>
    </AppShell>
  );
}
