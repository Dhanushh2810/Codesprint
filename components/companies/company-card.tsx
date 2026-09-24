import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { CompanyAvatar } from "@/components/companies/company-avatar";

export interface CompanyCardData {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  totalProblems: number;
  easy: number;
  medium: number;
  hard: number;
  solved: number;
  isTarget?: boolean;
}

export function CompanyCard({ company }: { company: CompanyCardData }) {
  const progress =
    company.totalProblems > 0
      ? Math.round((company.solved / company.totalProblems) * 100)
      : 0;

  return (
    <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={company.name} color={company.accentColor} />
          <div>
            <CardTitle className="text-lg">{company.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{company.totalProblems} problems</p>
          </div>
        </div>
        {company.isTarget ? (
          <Badge variant="secondary" className="gap-1">
            <Target className="h-3 w-3" /> Targeting
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Easy {company.easy}</span>
          <span>·</span>
          <span>Medium {company.medium}</span>
          <span>·</span>
          <span>Hard {company.hard}</span>
        </div>
        <div>
          <p className="mb-2 text-sm">
            Progress: {company.solved} / {company.totalProblems}
          </p>
          <ProgressBar value={progress} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/companies/${company.slug}`}>Practice</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
