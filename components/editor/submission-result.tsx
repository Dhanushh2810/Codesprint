import type { ExecutionResult } from "@/lib/types";
import { submissionStatusLabel } from "@/lib/utils/format";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmissionResult({
  loading,
  result,
}: {
  loading?: boolean;
  result?: ExecutionResult | null;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Running...
      </div>
    );
  }

  if (!result) return null;

  const accepted = result.status === "ACCEPTED";

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4 text-sm">
      <div className="flex items-center gap-2 font-medium">
        {accepted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-500" />
        )}
        {submissionStatusLabel(result.status)}
      </div>

      {result.compileOutput ? (
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{result.compileOutput}</pre>
      ) : null}

      {result.testResults?.map((test) => (
        <div
          key={test.index}
          className={cn(
            "rounded-md border p-3",
            test.passed ? "border-emerald-500/30" : "border-rose-500/30"
          )}
        >
          <p className="font-medium">
            Test Case {test.index} {test.passed ? "✓ Passed" : "✗ Failed"}
          </p>
          {test.input ? (
            <pre className="mt-2 text-xs text-muted-foreground">Input: {test.input}</pre>
          ) : null}
          {test.expectedOutput ? (
            <pre className="text-xs text-muted-foreground">Expected: {test.expectedOutput}</pre>
          ) : null}
          {test.actualOutput ? (
            <pre className="text-xs text-muted-foreground">Got: {test.actualOutput}</pre>
          ) : null}
        </div>
      ))}

      <div className="flex gap-4 text-xs text-muted-foreground">
        {result.runtimeMs !== undefined ? <span>Runtime: {result.runtimeMs} ms</span> : null}
        {result.memoryKb !== undefined ? <span>Memory: {Math.round(result.memoryKb / 1024)} MB</span> : null}
      </div>
    </div>
  );
}
