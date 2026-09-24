"use client";

import { useMemo, useState } from "react";
import { ProblemTable, type ProblemRow } from "@/components/problems/problem-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/shared/progress-bar";
import { CompanyAvatar } from "@/components/companies/company-avatar";

export function CompanyDetailClient({
  company,
  problems,
}: {
  company: {
    name: string;
    slug: string;
    accentColor: string;
    totalProblems: number;
    solved: number;
    remaining: number;
    progress: number;
  };
  problems: ProblemRow[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    let rows = problems;
    if (query.trim()) {
      rows = rows.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
    }
    if (tab === "easy") rows = rows.filter((p) => p.difficulty === "EASY");
    if (tab === "medium") rows = rows.filter((p) => p.difficulty === "MEDIUM");
    if (tab === "hard") rows = rows.filter((p) => p.difficulty === "HARD");
    if (tab === "solved") rows = rows.filter((p) => p.status === "SOLVED");
    if (tab === "unsolved") rows = rows.filter((p) => p.status !== "SOLVED");
    return rows;
  }, [problems, query, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CompanyAvatar name={company.name} color={company.accentColor} className="h-14 w-14" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{company.name}</h1>
            <p className="text-muted-foreground">{company.totalProblems} interview questions</p>
          </div>
        </div>
        <div className="grid min-w-[220px] gap-2 text-sm">
          <div className="flex justify-between">
            <span>Solved</span>
            <span>{company.solved}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining</span>
            <span>{company.remaining}</span>
          </div>
          <ProgressBar value={company.progress} label="Progress" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
            <TabsTrigger value="solved">Solved</TabsTrigger>
            <TabsTrigger value="unsolved">Unsolved</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search problems..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ProblemTable problems={filtered} />
    </div>
  );
}
