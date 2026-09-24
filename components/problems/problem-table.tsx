import Link from "next/link";
import type { Difficulty, ProblemStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/utils/format";

export interface ProblemRow {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  companies: string[];
  status?: ProblemStatus | string;
}

export function ProblemTable({ problems }: { problems: ProblemRow[] }) {
  if (!problems.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        No problems match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Problem</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="hidden md:table-cell">Topics</TableHead>
            <TableHead className="hidden lg:table-cell">Companies</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id} className="hover:bg-muted/40">
              <TableCell>
                <Link
                  href={`/problems/${problem.slug}`}
                  className="font-medium hover:underline"
                >
                  {problem.title}
                </Link>
              </TableCell>
              <TableCell>
                <DifficultyBadge difficulty={problem.difficulty} />
              </TableCell>
              <TableCell className="hidden max-w-xs truncate md:table-cell">
                {problem.topics.join(" · ")}
              </TableCell>
              <TableCell className="hidden max-w-xs truncate lg:table-cell">
                {problem.companies.slice(0, 3).join(" · ")}
                {problem.companies.length > 3 ? " …" : ""}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{statusLabel(problem.status as ProblemStatus)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
