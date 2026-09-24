import { cn } from "@/lib/utils";

export function CompanyAvatar({
  name,
  color,
  className,
  size = "md",
}: {
  name: string;
  color: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs rounded-lg",
    md: "h-11 w-11 text-sm rounded-xl",
    lg: "h-14 w-14 text-base rounded-2xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center font-semibold text-white shadow-sm shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
