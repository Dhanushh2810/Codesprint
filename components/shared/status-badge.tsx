import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  status,
}: {
  status?: "SOLVED" | "ATTEMPTED" | "NOT_ATTEMPTED" | string;
}) {
  if (status === "SOLVED") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
        Solved
      </Badge>
    );
  }
  if (status === "ATTEMPTED") {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
        Attempted
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Unsolved
    </Badge>
  );
}
