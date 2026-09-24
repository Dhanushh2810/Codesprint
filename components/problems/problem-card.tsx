import Link from "next/link";
import type { Difficulty } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";

export function ProblemCard({
  id,
  title,
  slug,
  difficulty,
  companies,
  topics,
}: {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  companies: string[];
  topics: string[];
}) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">
            <Link href={`/problems/${slug}`} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          <DifficultyBadge difficulty={difficulty} />
        </div>
        <p className="text-xs text-muted-foreground">{companies.join(" · ")}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{topics.join(" · ")}</p>
      </CardContent>
    </Card>
  );
}
