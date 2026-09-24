"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Check,
  ChevronRight,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CompanyAvatar } from "@/components/companies/company-avatar";
import { ProblemTable, type ProblemRow } from "@/components/problems/problem-table";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TargetCompanyItem {
  companyId: string;
  name: string;
  slug: string;
  accentColor: string;
  sortOrder: number;
  totalProblems: number;
  solved: number;
  progress: number;
}

interface CompanyAll {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  problemCount: number;
}

export default function TargetCompaniesPage() {
  const [targets, setTargets] = useState<TargetCompanyItem[]>([]);
  const [allCompanies, setAllCompanies] = useState<CompanyAll[]>([]);
  const [combinedProblems, setCombinedProblems] = useState<ProblemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingOpen, setAddingOpen] = useState(false);

  // Filter state for practice set
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        fetch("/api/user/targets"),
        fetch("/api/companies"),
      ]);

      const tJson = await tRes.json();
      const cJson = await cRes.json();

      const currentTargets: TargetCompanyItem[] = tJson.targets || [];
      setTargets(currentTargets);
      setAllCompanies(cJson.companies || []);

      // Fetch combined problem set from target companies
      if (currentTargets.length > 0) {
        const companySlugs = currentTargets.map((t) => t.slug).join(",");
        const pRes = await fetch(`/api/problems?company=${companySlugs}&limit=100`);
        if (pRes.ok) {
          const pJson = await pRes.json();
          setCombinedProblems(pJson.problems || []);
        }
      } else {
        setCombinedProblems([]);
      }
    } catch {
      toast.error("Failed to load target companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTargets = async (newTargetIds: string[]) => {
    try {
      const res = await fetch("/api/user/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: newTargetIds }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Target companies updated");
      fetchData();
    } catch {
      toast.error("Could not update target companies");
    }
  };

  const handleRemoveTarget = async (companyId: string) => {
    try {
      const res = await fetch(`/api/user/targets/${companyId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Removed from target companies");
      fetchData();
    } catch {
      toast.error("Could not remove target company");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newTargets = [...targets];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newTargets.length) return;

    const temp = newTargets[index];
    newTargets[index] = newTargets[targetIdx];
    newTargets[targetIdx] = temp;

    const newIds = newTargets.map((t) => t.companyId);
    handleSaveTargets(newIds);
  };

  const handleToggleCompanyInDialog = (companyId: string) => {
    const exists = targets.some((t) => t.companyId === companyId);
    let newIds: string[];
    if (exists) {
      newIds = targets.filter((t) => t.companyId !== companyId).map((t) => t.companyId);
    } else {
      newIds = [...targets.map((t) => t.companyId), companyId];
    }
    handleSaveTargets(newIds);
  };

  const filteredProblems = combinedProblems.filter((p) => {
    if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Target className="h-7 w-7 text-primary" />
              Your Target Companies
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize your targeted companies and practice their combined interview questions.
            </p>
          </div>

          <Button onClick={() => setAddingOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Company
          </Button>

          <Dialog open={addingOpen} onOpenChange={setAddingOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Target Companies Selection</DialogTitle>
                <DialogDescription>
                  Select companies you are actively targeting for placement preparation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {allCompanies.map((comp) => {
                  const isTargeted = targets.some((t) => t.companyId === comp.id);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => handleToggleCompanyInDialog(comp.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isTargeted
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-primary/50 bg-card"
                      }`}
                    >
                      <CompanyAvatar name={comp.name} color={comp.accentColor} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{comp.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {comp.problemCount} PYQs
                        </p>
                      </div>
                      {isTargeted && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Target Companies Cards Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : !targets.length ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-4">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">No target companies added yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                  Add target companies like Amazon, Google, or Microsoft to generate your personalized practice set.
                </p>
              </div>
              <Button onClick={() => setAddingOpen(true)}>Choose Target Companies</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {targets.map((company, index) => (
              <Card key={company.companyId} className="relative group transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                  <CompanyAvatar name={company.name} color={company.accentColor} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base truncate">{company.name}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        Targeting
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {company.solved} / {company.totalProblems} solved · {company.progress}%
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <ProgressBar value={company.progress} />

                  <div className="flex items-center justify-between pt-1">
                    {/* Reorder controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === 0}
                        onClick={() => handleMoveOrder(index, "up")}
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === targets.length - 1}
                        onClick={() => handleMoveOrder(index, "down")}
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={() => handleRemoveTarget(company.companyId)}
                        title="Remove Target"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Button asChild size="sm" variant="secondary" className="gap-1">
                      <Link href={`/companies/${company.slug}`}>
                        Practice <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Combined Practice Set Section */}
        {targets.length > 0 && (
          <section className="space-y-6 pt-4 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Combined Target Practice Set
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Deduplicated question set merged from all {targets.length} target companies ({combinedProblems.length} total questions).
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium"
                >
                  <option value="all">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="SOLVED">Solved</option>
                  <option value="ATTEMPTED">Attempted</option>
                  <option value="NOT_ATTEMPTED">Unsolved</option>
                </select>
              </div>
            </div>

            <ProblemTable problems={filteredProblems} />
          </section>
        )}
      </div>
    </AppShell>
  );
}
