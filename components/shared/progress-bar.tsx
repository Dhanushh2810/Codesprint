import { Progress } from "@/components/ui/progress";

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : null}
      <Progress value={value} className="h-2" />
    </div>
  );
}
