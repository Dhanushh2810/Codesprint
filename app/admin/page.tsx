"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Code2,
  FileCode2,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  popularity: number;
  createdAt: string;
  companies: string[];
  topics: string[];
  testCasesCount: number;
  sampleCount: number;
  hiddenCount: number;
  submissionsCount: number;
}

export default function AdminDashboardPage() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/problems");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProblems(data.problems || []);
    } catch {
      toast.error("Failed to load admin problems list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/problems/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Deleted question: ${title}`);
      fetchProblems();
    } catch {
      toast.error("Could not delete problem");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.companies.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
    p.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const totalTestCases = problems.reduce((acc, p) => acc + p.testCasesCount, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                <ShieldAlert className="h-3.5 w-3.5" /> Admin Control
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Question Bank Manager</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Create new company coding questions, configure sample/hidden test cases, and manage question metadata.
            </p>
          </div>

          <Link
            href="/admin/problems/new"
            className={buttonVariants({
              size: "lg",
              className: "gap-2 !bg-emerald-600 !text-white hover:!bg-emerald-700",
            })}
          >
            <Plus className="h-4 w-4" /> Add New Question
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Questions</CardTitle>
              <FileCode2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{problems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Test Cases</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTestCases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Companies Covered</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Topic Categories</CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16</div>
            </CardContent>
          </Card>
        </div>

        {/* Table & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Input
              placeholder="Search questions by title, company, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {problems.length} questions
            </span>
          </div>

          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-xl" />
          ) : !filtered.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground space-y-3">
                <FileCode2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p>No questions found matching &quot;{search}&quot;</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Target Companies</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead className="text-center">Test Cases</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell className="font-semibold">
                        <Link
                          href={`/problems/${p.slug}`}
                          className="hover:underline flex items-center gap-1.5"
                          target="_blank"
                        >
                          {p.title}
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <DifficultyBadge difficulty={p.difficulty} />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {p.companies.slice(0, 3).map((c) => (
                            <Badge key={c} variant="secondary" className="text-[10px]">
                              {c}
                            </Badge>
                          ))}
                          {p.companies.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{p.companies.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                        {p.topics.join(" · ")}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        <span className="text-emerald-500 font-semibold">{p.sampleCount} sample</span>
                        {" / "}
                        <span className="text-amber-500 font-semibold">{p.hiddenCount} hidden</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === p.id}
                            onClick={() => handleDelete(p.id, p.title)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Delete Problem"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
