import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Code2,
  History,
  Sparkles,
  Target,
  Terminal,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";

const features = [
  {
    title: "Company-wise PYQs",
    description: "Practice questions tagged to the companies you are targeting.",
    icon: Building2,
  },
  {
    title: "Integrated Code Editor",
    description: "Monaco-powered editor with syntax highlighting and autosave.",
    icon: Code2,
  },
  {
    title: "Real-time Code Execution",
    description: "Run against sample tests, submit against hidden cases via Judge0.",
    icon: Terminal,
  },
  {
    title: "Target Company Tracking",
    description: "Build a personalized plan from your target company question pools.",
    icon: Target,
  },
  {
    title: "Progress Analytics",
    description: "Company, topic, and difficulty breakdowns with streak tracking.",
    icon: BarChart3,
  },
  {
    title: "Submission History",
    description: "Review attempts, runtimes, and accepted solutions over time.",
    icon: History,
  },
];

export default function LandingPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Built for placement season
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Prepare for the companies you actually want.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Practice company-specific coding interview questions, solve them in your browser,
                and track your preparation in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                <ArrowRight className="h-4 w-4" /> Start Practicing
              </Link>
              <Button asChild size="lg" variant="outline">
                <Link href="/companies">Explore Companies</Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border shadow-2xl shadow-black/5">
            <div className="border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              CodeSprint · Target practice set
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap gap-2">
                {["Amazon", "Microsoft", "Flipkart"].map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2 rounded-lg border bg-background p-3">
                {[
                  ["Pair Sum Indices", "EASY" as const, "48%"],
                  ["Maximum Subarray Sum", "MEDIUM" as const, "62%"],
                  ["LRU Cache Operations", "HARD" as const, "71%"],
                ].map(([title, diff]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">{title}</span>
                    <DifficultyBadge difficulty={diff as "EASY" | "MEDIUM" | "HARD"} />
                  </div>
                ))}
              </div>
              <div className="rounded-lg border bg-zinc-950 p-3 font-mono text-xs text-zinc-100">
                <p className="text-emerald-400">// editor preview</p>
                <p>for (int i = 0; i &lt; n; i++) {"{"}</p>
                <p className="pl-4">if (nums[i] + nums[j] == target)</p>
                <p className="pl-4">return {"{i, j}"};</p>
                <p>{"}"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Everything you need to stay company-ready</h2>
            <p className="mt-3 text-muted-foreground">
              CodeSprint is designed around your target list—not a generic problem feed.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardContent className="space-y-3 p-6">
                  <feature.icon className="h-5 w-5" />
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl border bg-card p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            How it works
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Choose your target companies",
              "Practice their interview questions",
              "Solve directly in the browser",
              "Track your preparation",
            ].map((step, i) => (
              <li key={step} className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                <p className="text-lg font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </AppShell>
  );
}
