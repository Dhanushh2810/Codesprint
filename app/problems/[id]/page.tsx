"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  GripVertical,
  Play,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CodeEditor } from "@/components/editor/code-editor";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGES, SupportedLanguage, DEFAULT_STARTER_CODE } from "@/lib/judge0/languages";
import { submissionStatusLabel } from "@/lib/utils/format";
import type { ExecutionResult } from "@/lib/types";

interface ProblemDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  constraints: string;
  examples: string;
  followUp?: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  starterCode: string;
  companies: { name: string; slug: string }[];
  topics: string[];
  sampleTests: { input: string; output: string }[];
  status: "NOT_ATTEMPTED" | "ATTEMPTED" | "SOLVED";
}

interface ProblemSubmissionItem {
  id: string;
  language: string;
  status: string;
  runtimeMs?: number;
  memoryKb?: number;
  createdAt: string;
}

export default function ProblemSolvingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<SupportedLanguage>("cpp");
  const [code, setCode] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(14);
  const [minimap, setMinimap] = useState<boolean>(false);

  // Resizable Split Panel state (percentage)
  const [leftWidth, setLeftWidth] = useState<number>(45);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [submitResult, setSubmitResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<"statement" | "results" | "history">("statement");
  const [problemSubmissions, setProblemSubmissions] = useState<ProblemSubmissionItem[]>([]);

  // Draggable Divider Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newPercent = (relativeX / rect.width) * 100;
      // Clamp split panel width between 20% and 80%
      if (newPercent >= 20 && newPercent <= 80) {
        setLeftWidth(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Parse examples array
  const parsedExamples = useCallback(() => {
    if (!problem?.examples) return [];
    try {
      if (typeof problem.examples === "string") {
        return JSON.parse(problem.examples);
      }
      return problem.examples;
    } catch {
      return [];
    }
  }, [problem]);

  // Parse starter codes
  const getStarterCodeForLang = useCallback(
    (lang: SupportedLanguage, prob: ProblemDetail) => {
      const localStorageKey = `codesprint_draft_${prob.id}_${lang}`;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(localStorageKey);
        if (saved) return saved;
      }

      try {
        const parsed =
          typeof prob.starterCode === "string"
            ? JSON.parse(prob.starterCode)
            : prob.starterCode;
        if (parsed && parsed[lang]) return parsed[lang];
      } catch {
        // Fallback
      }
      return DEFAULT_STARTER_CODE[lang] || "";
    },
    []
  );

  const fetchProblem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/${id}`);
      if (!res.ok) throw new Error("Problem not found");
      const json = await res.json();
      setProblem(json.problem);

      const initialCode = getStarterCodeForLang("cpp", json.problem);
      setCode(initialCode);
    } catch {
      toast.error("Could not load problem details.");
    } finally {
      setLoading(false);
    }
  }, [id, getStarterCodeForLang]);

  const fetchSubmissionsHistory = useCallback(async (problemId: string) => {
    try {
      const res = await fetch(`/api/submissions?problemId=${problemId}&pageSize=10`);
      if (res.ok) {
        const data = await res.json();
        setProblemSubmissions(data.submissions || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id, fetchProblem]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (problem) {
      const newCode = getStarterCodeForLang(newLang, problem);
      setCode(newCode);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (problem) {
      localStorage.setItem(`codesprint_draft_${problem.id}_${language}`, newCode);
    }
  };

  const handleResetCode = () => {
    if (!problem) return;
    try {
      const parsed =
        typeof problem.starterCode === "string"
          ? JSON.parse(problem.starterCode)
          : problem.starterCode;
      const def = parsed[language] || DEFAULT_STARTER_CODE[language] || "";
      setCode(def);
      localStorage.removeItem(`codesprint_draft_${problem.id}_${language}`);
      toast.info("Reset to starter template");
    } catch {
      setCode(DEFAULT_STARTER_CODE[language]);
    }
  };

  const handleRunCode = async () => {
    if (!problem || !code.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }

    setIsRunning(true);
    setActiveTab("results");
    setRunResult(null);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/submissions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          sourceCode: code,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Execution failed");
        return;
      }

      setRunResult(json.result);
      if (json.result.status === "ACCEPTED") {
        toast.success("Sample test cases passed!");
      } else {
        toast.error(`Run finished: ${submissionStatusLabel(json.result.status)}`);
      }
    } catch {
      toast.error("Error executing code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem || !code.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setActiveTab("results");
    setSubmitResult(null);
    setRunResult(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          sourceCode: code,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Submission failed");
        return;
      }

      setSubmitResult(json.result);
      if (json.result.status === "ACCEPTED") {
        toast.success("🎉 Solution Accepted! Problem solved.", { duration: 4000 });
        setProblem((prev) => (prev ? { ...prev, status: "SOLVED" } : null));
        fetchSubmissionsHistory(problem.id);
      } else {
        toast.error(`Submission Result: ${submissionStatusLabel(json.result.status)}`);
      }
    } catch {
      toast.error("Error submitting code");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, language, problem]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[600px] w-full rounded-xl" />
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!problem) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Problem not found</h2>
          <p className="mt-2 text-muted-foreground">The problem you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link href="/problems">Explore Problems</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const examplesList = parsedExamples();

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
        {/* Top Header / Sticky Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b bg-card px-4 py-2 text-sm shrink-0">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 font-medium">
            <Link
              href="/problems"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Problems
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{problem.title}</span>
            <DifficultyBadge difficulty={problem.difficulty} />
            <StatusBadge status={problem.status} />
          </div>

          {/* Target Company Badges */}
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="text-xs text-muted-foreground">Asked in:</span>
            {problem.companies.map((c) => (
              <Badge key={c.slug} variant="secondary" className="text-xs">
                {c.name}
              </Badge>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="gap-1.5"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {isRunning ? "Running..." : "Run"}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>

        {/* Flexible Draggable Resizable Split Container */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden relative flex-col lg:flex-row">
          {/* Left Panel: Problem Statement & Details */}
          <div
            style={{ width: typeof window !== "undefined" && window.innerWidth >= 1024 ? `${leftWidth}%` : "100%" }}
            className="flex flex-col border-r overflow-hidden shrink-0 transition-none"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="flex h-full flex-col"
            >
              <div className="border-b bg-muted/30 px-4 shrink-0">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="statement" className="text-xs">
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="results"
                    className="text-xs relative"
                    onClick={() => {
                      if (!runResult && !submitResult) {
                        toast.info("Run or Submit your solution to view test results.");
                      }
                    }}
                  >
                    Test Results
                    {(runResult || submitResult) && (
                      <span className="ml-1.5 h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="text-xs"
                    onClick={() => fetchSubmissionsHistory(problem.id)}
                  >
                    Submissions
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Description */}
              <TabsContent value="statement" className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {problem.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
                  <div className="rounded-lg border bg-muted/20 p-4 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                    {problem.description}
                  </div>
                </div>

                {examplesList.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold tracking-tight">Examples</h3>
                    {examplesList.map((ex: any, idx: number) => (
                      <Card key={idx} className="bg-muted/40 border">
                        <CardContent className="p-4 space-y-2 text-xs font-mono">
                          <div>
                            <span className="font-semibold text-muted-foreground select-none">
                              Example {idx + 1}:
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-sans">Input: </span>
                            <pre className="mt-1 bg-background p-2 rounded border">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-sans">Output: </span>
                            <pre className="mt-1 bg-background p-2 rounded border">{ex.output}</pre>
                          </div>
                          {ex.explanation && (
                            <div className="font-sans text-muted-foreground pt-1">
                              <span className="font-medium text-foreground">Explanation: </span>
                              {ex.explanation}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {problem.constraints && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold tracking-tight">Constraints</h3>
                    <div className="rounded-lg border bg-muted/20 p-3 text-xs font-mono whitespace-pre-line text-muted-foreground">
                      {problem.constraints}
                    </div>
                  </div>
                )}

                {problem.followUp && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-1">
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Follow-up Question
                    </p>
                    <p className="text-muted-foreground">{problem.followUp}</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: Results */}
              <TabsContent value="results" className="flex-1 overflow-y-auto p-5 space-y-4">
                {isRunning || isSubmitting ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3 text-muted-foreground">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm font-medium">
                      {isRunning ? "Executing sample test cases..." : "Evaluating hidden test cases..."}
                    </p>
                  </div>
                ) : runResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-semibold text-base flex items-center gap-2">
                        {runResult.status === "ACCEPTED" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-rose-500" />
                        )}
                        Run Status: {submissionStatusLabel(runResult.status)}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                        {runResult.runtimeMs !== undefined && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {runResult.runtimeMs} ms
                          </span>
                        )}
                        {runResult.memoryKb !== undefined && (
                          <span className="flex items-center gap-1">
                            <Cpu className="h-3.5 w-3.5" /> {Math.round(runResult.memoryKb / 1024)} MB
                          </span>
                        )}
                      </div>
                    </div>

                    {runResult.compileOutput && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-rose-500">Compilation Errors:</p>
                        <pre className="overflow-x-auto rounded-lg bg-rose-950/20 border border-rose-500/20 p-3 font-mono text-xs text-rose-300">
                          {runResult.compileOutput}
                        </pre>
                      </div>
                    )}

                    {runResult.testResults?.map((test) => (
                      <Card
                        key={test.index}
                        className={`border ${
                          test.passed
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-rose-500/30 bg-rose-500/5"
                        }`}
                      >
                        <CardContent className="p-4 space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-medium">Test Case #{test.index}</span>
                            <Badge variant={test.passed ? "secondary" : "destructive"}>
                              {test.passed ? "PASSED" : test.status}
                            </Badge>
                          </div>
                          {test.input !== undefined && (
                            <div>
                              <span className="text-muted-foreground font-sans">Input: </span>
                              <pre className="bg-background p-2 rounded border mt-1">{test.input}</pre>
                            </div>
                          )}
                          {test.expectedOutput !== undefined && (
                            <div>
                              <span className="text-muted-foreground font-sans">Expected Output: </span>
                              <pre className="bg-background p-2 rounded border mt-1">{test.expectedOutput}</pre>
                            </div>
                          )}
                          {test.actualOutput !== undefined && (
                            <div>
                              <span className="text-muted-foreground font-sans">Your Output: </span>
                              <pre className="bg-background p-2 rounded border mt-1">{test.actualOutput}</pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : submitResult ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-6 text-center space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        {submitResult.status === "ACCEPTED" ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-rose-500" />
                        )}
                      </div>
                      <h2
                        className={`text-2xl font-bold ${
                          submitResult.status === "ACCEPTED"
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}
                      >
                        {submissionStatusLabel(submitResult.status)}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Passed {submitResult.passedTests} of {submitResult.totalTests} test cases
                      </p>

                      <div className="flex justify-center gap-6 pt-2 font-mono text-sm text-muted-foreground">
                        {submitResult.runtimeMs !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" /> {submitResult.runtimeMs} ms
                          </div>
                        )}
                        {submitResult.memoryKb !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <Cpu className="h-4 w-4" /> {Math.round(submitResult.memoryKb / 1024)} MB
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-2">
                    <Play className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No execution results yet</p>
                    <p className="text-xs">
                      Click <span className="font-semibold text-foreground">Run</span> to test against sample cases, or{" "}
                      <span className="font-semibold text-emerald-500">Submit</span> to test against all hidden cases.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: History */}
              <TabsContent value="history" className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-semibold text-sm">Your Recent Attempts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => fetchSubmissionsHistory(problem.id)}
                  >
                    Refresh
                  </Button>
                </div>
                {!problemSubmissions.length ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    No submissions recorded yet for this problem.
                  </p>
                ) : (
                  problemSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className={
                              sub.status === "ACCEPTED"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }
                          >
                            {submissionStatusLabel(sub.status)}
                          </span>
                          <Badge variant="outline" className="uppercase text-[10px]">
                            {sub.language}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right font-mono text-muted-foreground">
                        {sub.runtimeMs ? `${sub.runtimeMs} ms` : "-"}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Draggable Divider Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="hidden lg:flex w-2 bg-muted/40 hover:bg-primary/50 cursor-col-resize items-center justify-center transition-colors group z-10 shrink-0 select-none border-x border-border/40"
            title="Drag to resize panels"
          >
            <GripVertical className="h-4 w-3 text-muted-foreground/60 group-hover:text-foreground" />
          </div>

          {/* Right Panel: Monaco Code Editor */}
          <div className="flex flex-col flex-1 overflow-hidden bg-muted/10">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between border-b bg-card px-4 py-2 text-xs shrink-0">
              <div className="flex items-center gap-3">
                {/* Language Picker */}
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="rounded-md border bg-background px-2.5 py-1 font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetCode}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  title="Reset starter template"
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset
                </Button>
              </div>

              {/* Preferences */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="rounded bg-transparent border-none text-xs text-foreground font-mono"
                  >
                    <option value={12}>12px</option>
                    <option value={14}>14px</option>
                    <option value={16}>16px</option>
                    <option value={18}>18px</option>
                  </select>
                </div>

                <label className="flex items-center gap-1 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={minimap}
                    onChange={(e) => setMinimap(e.target.checked)}
                    className="rounded border"
                  />
                  Minimap
                </label>
              </div>
            </div>

            {/* Monaco Container */}
            <div className="flex-1 w-full overflow-hidden">
              <CodeEditor
                language={LANGUAGES.find((l) => l.id === language)?.monacoId || "cpp"}
                value={code}
                onChange={handleCodeChange}
                fontSize={fontSize}
                minimap={minimap}
              />
            </div>

            {/* Keyboard shortcut legend footer */}
            <div className="border-t bg-card/60 px-4 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
              <span>Shortcuts: <kbd className="rounded bg-muted px-1 font-mono">⌘/Ctrl + Enter</kbd> Run</span>
              <span><kbd className="rounded bg-muted px-1 font-mono">⌘/Ctrl + Shift + Enter</kbd> Submit</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
