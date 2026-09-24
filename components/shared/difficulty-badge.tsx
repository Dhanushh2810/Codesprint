import type { Difficulty } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { difficultyLabel } from "@/lib/utils/format";

const styles: Record<Difficulty, string> = {
  EASY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HARD: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[difficulty])}>
      {difficultyLabel(difficulty)}
    </Badge>
  );
}
