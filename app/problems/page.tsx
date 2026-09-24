"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProblemTable, type ProblemRow } from "@/components/problems/problem-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [companies, setCompanies] = useState<{ slug: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [company, setCompany] = useState("all");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("popularity");

  useEffect(() => {
    Promise.all([fetch("/api/companies"), fetch("/api/topics")]).then(async ([c, t]) => {
      const cj = await c.json();
      const tj = await t.json();
      setCompanies(cj.companies ?? []);
      setTopics(tj.topics ?? []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (company !== "all") params.set("company", company);
    if (topic !== "all") params.set("topic", topic);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (status !== "all") params.set("status", status);
    params.set("sort", sort);

    fetch(`/api/problems?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((json) => setProblems(json.problems ?? []))
      .catch(() => setError("Could not load problems. Try again."))
      .finally(() => setLoading(false));
  }, [q, company, topic, difficulty, status, sort]);

  const rows = useMemo(() => problems, [problems]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">Explore the full company-tagged question bank.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Search by title..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="lg:col-span-2"
          />
          <Select value={company} onValueChange={(v) => setCompany(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={topic} onValueChange={(v) => setTopic(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t.slug} value={t.slug}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="SOLVED">Solved</SelectItem>
              <SelectItem value="ATTEMPTED">Attempted</SelectItem>
              <SelectItem value="NOT_ATTEMPTED">Unsolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v ?? "popularity")}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="recent">Recently added</SelectItem>
              <SelectItem value="company">Company frequency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="rounded-xl border border-dashed p-10 text-center">{error}</div>
        ) : loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <ProblemTable problems={rows} />
        )}
      </div>
    </AppShell>
  );
}
