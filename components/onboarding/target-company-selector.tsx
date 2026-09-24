"use client";

import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/companies/company-avatar";
import type { CompanyCardData } from "@/components/companies/company-card";

export function TargetCompanySelector({
  companies,
  selected,
  onToggle,
}: {
  companies: CompanyCardData[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => {
        const active = selected.has(company.id);
        return (
          <button
            key={company.id}
            type="button"
            onClick={() => onToggle(company.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
              active && "border-primary bg-primary/5 ring-1 ring-primary/30"
            )}
          >
            <CompanyAvatar name={company.name} color={company.accentColor} />
            <div>
              <p className="font-medium">{company.name}</p>
              <p className="text-xs text-muted-foreground">{company.totalProblems} questions</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
