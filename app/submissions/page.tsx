"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Eye,
  History,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submissionStatusLabel } from "@/lib/utils/format";

interface SubmissionItem {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  language: string;
  status: string;
  runtimeMs?: number;
  memoryKb?: number;
  createdAt: string;
}

interface SubmissionDetail extends SubmissionItem {
  sourceCode: string;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSubmissions = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions?page=${p}&pageSize=15`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast.error("Could not load submission history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(page);
  }, [page]);

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedSubmission(null);
    try {
      const res = await fetch(`/api/submissions/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSelectedSubmission(data.submission);
    } catch {
      toast.error("Could not load submission details");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <History className="h-7 w-7 text-primary" />
            Submission History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review your past code submissions, performance metrics, and source code.
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-[500px] w-full rounded-xl" />
        ) : !submissions.length ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-3">
              <Code2 className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="font-semibold text-lg">No submissions yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Solve coding problems in the integrated editor to see your submission logs here.
              </p>
              <Button asChild>
                <Link href="/problems">Explore Problems</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Problem</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const isAccepted = sub.status === "ACCEPTED";
                    return (
                      <TableRow key={sub.id} className="hover:bg-muted/40">
                        <TableCell>
                          <Link
                            href={`/problems/${sub.problemSlug}`}
                            className="font-medium hover:underline"
                          >
                            {sub.problemTitle}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[10px] font-mono">
                            {sub.language}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            {isAccepted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-500" />
                            )}
                            <span className={isAccepted ? "text-emerald-500" : "text-rose-500"}>
                              {submissionStatusLabel(sub.status)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sub.runtimeMs !== undefined ? `${sub.runtimeMs} ms` : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sub.memoryKb !== undefined ? `${Math.round(sub.memoryKb / 1024)} MB` : "-"}
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                          {new Date(sub.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(sub.id)}
                            className="gap-1 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submission Details Modal */}
        <Dialog open={Boolean(selectedSubmission || detailLoading)} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            {detailLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading details...</div>
            ) : selectedSubmission ? (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between text-lg">
                    <span>{selectedSubmission.problemTitle}</span>
                    <Badge variant={selectedSubmission.status === "ACCEPTED" ? "secondary" : "destructive"}>
                      {submissionStatusLabel(selectedSubmission.status)}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <span className="text-muted-foreground block font-sans text-[11px]">Language</span>
                    <span className="font-semibold uppercase">{selectedSubmission.language}</span>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <span className="text-muted-foreground block font-sans text-[11px]">Runtime</span>
                    <span className="font-semibold">{selectedSubmission.runtimeMs ? `${selectedSubmission.runtimeMs} ms` : "N/A"}</span>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <span className="text-muted-foreground block font-sans text-[11px]">Memory</span>
                    <span className="font-semibold">{selectedSubmission.memoryKb ? `${Math.round(selectedSubmission.memoryKb / 1024)} MB` : "N/A"}</span>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <span className="text-muted-foreground block font-sans text-[11px]">Tests Passed</span>
                    <span className="font-semibold">{selectedSubmission.passedTests} / {selectedSubmission.totalTests}</span>
                  </div>
                </div>

                {selectedSubmission.errorMessage && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-rose-500">Error Logs:</p>
                    <pre className="overflow-x-auto rounded-lg bg-rose-950/20 border border-rose-500/20 p-3 font-mono text-xs text-rose-300">
                      {selectedSubmission.errorMessage}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Submitted Source Code</h4>
                  <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-100 leading-relaxed border">
                    <code>{selectedSubmission.sourceCode}</code>
                  </pre>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button asChild size="sm">
                    <Link href={`/problems/${selectedSubmission.problemSlug}`}>
                      Try Problem Again
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
