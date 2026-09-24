"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CompanyCard, type CompanyCardData } from "@/components/companies/company-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyCardData[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/companies")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        const json = await res.json();
        setCompanies(json.companies ?? []);
      })
      .catch(() => setError("Could not load companies. Try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      companies.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [companies, query]
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Companies</h1>
            <p className="text-muted-foreground">
              Browse interview question pools by company and track your progress.
            </p>
          </div>
          <Input
            placeholder="Search companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-dashed p-10 text-center">{error}</div>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
