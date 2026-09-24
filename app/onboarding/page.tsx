"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { TargetCompanySelector } from "@/components/onboarding/target-company-selector";
import type { CompanyCardData } from "@/components/companies/company-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Topic = { id: string; name: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState<CompanyCardData[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [skillLevel, setSkillLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(
    "INTERMEDIATE"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/companies"), fetch("/api/topics")]).then(async ([cRes, tRes]) => {
      const cJson = await cRes.json();
      const tJson = await tRes.json();
      setCompanies(cJson.companies ?? []);
      setTopics(tJson.topics ?? []);
    });
  }, []);

  function toggleCompany(id: string) {
    setSelectedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTopic(id: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function finish() {
    setLoading(true);
    const res = await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyIds: Array.from(selectedCompanies),
        topicIds: Array.from(selectedTopics),
        skillLevel,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? "Failed to save preferences");
      return;
    }
    toast.success("Preferences saved");
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full",
                step >= s ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Which companies are you targeting?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TargetCompanySelector
                companies={companies}
                selected={selectedCompanies}
                onToggle={toggleCompany}
              />
              <Button
                onClick={() => setStep(2)}
                disabled={selectedCompanies.size === 0}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>What topics do you want to focus on?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const active = selectedTopics.has(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        active && "border-primary bg-primary/10"
                      )}
                    >
                      {topic.name}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={selectedTopics.size === 0}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardHeader>
              <CardTitle>What is your current level?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={cn(
                    "block w-full rounded-xl border p-4 text-left",
                    skillLevel === level && "border-primary bg-primary/5"
                  )}
                >
                  <p className="font-medium capitalize">{level.toLowerCase()}</p>
                </button>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={finish} disabled={loading}>
                  {loading ? "Saving..." : "Finish onboarding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
