"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Check,
  Code2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CompanyAvatar } from "@/components/companies/company-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_STARTER_CODE } from "@/lib/judge0/languages";
import { cn } from "@/lib/utils";

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
}

interface TopicItem {
  id: string;
  name: string;
  slug: string;
}

export default function NewProblemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Available options
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanySlug, setNewCompanySlug] = useState("");
  const [newCompanyColor, setNewCompanyColor] = useState("#6366f1");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState("");
  const [constraints, setConstraints] = useState("- 1 ≤ n ≤ 10^5\n- Time limit: 2 seconds");
  const [followUp, setFollowUp] = useState("");
  const [popularity, setPopularity] = useState(75);

  // Examples
  const [examples, setExamples] = useState<
    { input: string; output: string; explanation: string }[]
  >([{ input: "", output: "", explanation: "" }]);

  // Test cases
  const [sampleTestCases, setSampleTestCases] = useState<
    { input: string; expectedOutput: string }[]
  >([{ input: "", expectedOutput: "" }]);

  const [hiddenTestCases, setHiddenTestCases] = useState<
    { input: string; expectedOutput: string }[]
  >([{ input: "", expectedOutput: "" }]);

  // Starter codes
  const [starterCpp, setStarterCpp] = useState(DEFAULT_STARTER_CODE.cpp);
  const [starterJava, setStarterJava] = useState(DEFAULT_STARTER_CODE.java);
  const [starterPython, setStarterPython] = useState(DEFAULT_STARTER_CODE.python);
  const [starterJs, setStarterJs] = useState(DEFAULT_STARTER_CODE.javascript);

  useEffect(() => {
    Promise.all([fetch("/api/companies"), fetch("/api/topics")]).then(async ([cRes, tRes]) => {
      const cJson = await cRes.json();
      const tJson = await tRes.json();
      setCompanies(cJson.companies || []);
      setTopics(tJson.topics || []);
    });
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const toggleCompany = (id: string) => {
    setSelectedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim() || !newCompanySlug.trim()) {
      toast.error("Enter a company name and slug.");
      return;
    }

    setCreatingCompany(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCompanyName,
          slug: newCompanySlug,
          accentColor: newCompanyColor,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create company");

      const company = json.company as CompanyItem;
      setCompanies((current) => [...current, company].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCompanies((current) => new Set(current).add(company.id));
      setNewCompanyName("");
      setNewCompanySlug("");
      toast.success(`${company.name} added and selected.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  // Example list modifiers
  const addExample = () => {
    setExamples([...examples, { input: "", output: "", explanation: "" }]);
  };
  const removeExample = (idx: number) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };
  const updateExample = (idx: number, field: string, val: string) => {
    const updated = [...examples];
    updated[idx] = { ...updated[idx], [field]: val };
    setExamples(updated);
  };

  // Sample test case modifiers
  const addSampleTestCase = () => {
    setSampleTestCases([...sampleTestCases, { input: "", expectedOutput: "" }]);
  };
  const removeSampleTestCase = (idx: number) => {
    setSampleTestCases(sampleTestCases.filter((_, i) => i !== idx));
  };
  const updateSampleTestCase = (idx: number, field: "input" | "expectedOutput", val: string) => {
    const updated = [...sampleTestCases];
    updated[idx] = { ...updated[idx], [field]: val };
    setSampleTestCases(updated);
  };

  // Hidden test case modifiers
  const addHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: "", expectedOutput: "" }]);
  };
  const removeHiddenTestCase = (idx: number) => {
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== idx));
  };
  const updateHiddenTestCase = (idx: number, field: "input" | "expectedOutput", val: string) => {
    const updated = [...hiddenTestCases];
    updated[idx] = { ...updated[idx], [field]: val };
    setHiddenTestCases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      toast.error("Please enter a question title and slug.");
      return;
    }
    if (selectedCompanies.size === 0) {
      toast.error("Please select at least one target company.");
      return;
    }
    if (selectedTopics.size === 0) {
      toast.error("Please select at least one topic.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a problem description.");
      return;
    }

    const validSampleTests = sampleTestCases.filter(
      (t) => t.input.trim() !== "" || t.expectedOutput.trim() !== ""
    );
    if (!validSampleTests.length) {
      toast.error("Please add at least one sample test case.");
      return;
    }

    const validHiddenTests = hiddenTestCases.filter(
      (t) => t.input.trim() !== "" || t.expectedOutput.trim() !== ""
    );

    setLoading(true);

    try {
      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          difficulty,
          companyIds: Array.from(selectedCompanies),
          topicIds: Array.from(selectedTopics),
          description,
          constraints,
          followUp: followUp || undefined,
          popularity: Number(popularity) || 50,
          examples: examples.filter((ex) => ex.input.trim() || ex.output.trim()),
          sampleTestCases: validSampleTests,
          hiddenTestCases: validHiddenTests,
          starterCode: {
            cpp: starterCpp,
            java: starterJava,
            python: starterPython,
            javascript: starterJs,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to create question");
        return;
      }

      toast.success("Question created successfully!");
      router.push("/admin");
    } catch {
      toast.error("Error creating problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-bold tracking-tight">Add New Question</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Trapping Rain Water"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g. trapping-rain-water"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <div className="flex gap-2">
                    {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-xs font-semibold transition-all",
                          difficulty === diff
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popularity">Popularity Score (1 - 100)</Label>
                  <Input
                    id="popularity"
                    type="number"
                    min={1}
                    max={100}
                    value={popularity}
                    onChange={(e) => setPopularity(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Target Companies & Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Company Tags & Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Target Companies (Select all that apply)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCompanyForm((visible) => !visible)}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {showNewCompanyForm ? "Cancel" : "Add company"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl bg-muted/20">
                  {companies.map((comp) => {
                    const isSelected = selectedCompanies.has(comp.id);
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => toggleCompany(comp.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary font-semibold"
                            : "bg-background hover:border-primary/40"
                        }`}
                      >
                        <CompanyAvatar name={comp.name} color={comp.accentColor} size="sm" />
                        <span className="truncate">{comp.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowNewCompanyForm(true)}
                    className="flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add new company
                  </button>
                </div>
                {showNewCompanyForm && <div className="rounded-xl border border-dashed bg-muted/10 p-3 space-y-3">
                  <p className="text-xs font-medium">Company not listed?</p>
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                    <Input
                      placeholder="Company name"
                      value={newCompanyName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewCompanyName(name);
                        setNewCompanySlug(name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"));
                      }}
                    />
                    <Input
                      placeholder="company-slug"
                      value={newCompanySlug}
                      onChange={(e) => setNewCompanySlug(e.target.value)}
                    />
                    <input
                      aria-label="Company accent color"
                      type="color"
                      value={newCompanyColor}
                      onChange={(e) => setNewCompanyColor(e.target.value)}
                      className="h-9 w-full rounded-md border bg-background p-1 sm:w-12"
                    />
                    <Button type="button" size="sm" onClick={handleCreateCompany} disabled={creatingCompany} className="gap-1">
                      <Plus className="h-4 w-4" /> {creatingCompany ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </div>}
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> Topics (Select all that apply)
                </Label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-muted/20">
                  {topics.map((t) => {
                    const isSelected = selectedTopics.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTopic(t.id)}
                        className={`rounded-full px-3 py-1 text-xs border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/15 text-foreground font-semibold ring-1 ring-primary"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Problem Description & Constraints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Problem Statement & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Problem Description</Label>
                <textarea
                  id="description"
                  rows={6}
                  placeholder="Explain the problem requirements clearly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border bg-background p-3 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <textarea
                  id="constraints"
                  rows={3}
                  placeholder="- 1 ≤ n ≤ 10^5..."
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full rounded-lg border bg-background p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp">Follow-up Question (Optional)</Label>
                <Input
                  id="followUp"
                  placeholder="e.g. Could you solve it in O(1) extra space?"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Examples */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">4. Examples</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addExample} className="gap-1">
                <Plus className="h-4 w-4" /> Add Example
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {examples.map((ex, idx) => (
                <div key={idx} className="rounded-xl border p-4 bg-muted/20 space-y-3 relative">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Example {idx + 1}</span>
                    {examples.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExample(idx)}
                        className="h-6 w-6 text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Input</Label>
                      <textarea
                        rows={2}
                        placeholder="[2,7,11,15], target = 9"
                        value={ex.input}
                        onChange={(e) => updateExample(idx, "input", e.target.value)}
                        className="w-full rounded-md border bg-background p-2 text-xs font-mono mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Output</Label>
                      <textarea
                        rows={2}
                        placeholder="[0,1]"
                        value={ex.output}
                        onChange={(e) => updateExample(idx, "output", e.target.value)}
                        className="w-full rounded-md border bg-background p-2 text-xs font-mono mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Explanation (Optional)</Label>
                    <Input
                      placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                      value={ex.explanation}
                      onChange={(e) => updateExample(idx, "explanation", e.target.value)}
                      className="text-xs mt-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 5: Test Cases (Sample & Hidden) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sample Test Cases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Sample Test Cases</CardTitle>
                  <p className="text-xs text-muted-foreground">Executed when user clicks &quot;Run&quot;</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSampleTestCase} className="gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Sample
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleTestCases.map((tc, idx) => (
                  <div key={idx} className="rounded-lg border p-3 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Sample Test #{idx + 1}</span>
                      {sampleTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSampleTestCase(idx)}
                          className="text-rose-500 hover:underline text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <Label className="text-[11px]">Stdin Input</Label>
                      <textarea
                        rows={2}
                        placeholder="4 9\n2 7 11 15"
                        value={tc.input}
                        onChange={(e) => updateSampleTestCase(idx, "input", e.target.value)}
                        className="w-full rounded border bg-background p-2 text-xs font-mono mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Expected Stdout Output</Label>
                      <textarea
                        rows={2}
                        placeholder="0 1"
                        value={tc.expectedOutput}
                        onChange={(e) => updateSampleTestCase(idx, "expectedOutput", e.target.value)}
                        className="w-full rounded border bg-background p-2 text-xs font-mono mt-1"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hidden Test Cases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Hidden Test Cases</CardTitle>
                  <p className="text-xs text-muted-foreground">Executed when user clicks &quot;Submit&quot;</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addHiddenTestCase} className="gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Hidden
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {hiddenTestCases.map((tc, idx) => (
                  <div key={idx} className="rounded-lg border p-3 bg-amber-500/5 border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Hidden Test #{idx + 1}</span>
                      {hiddenTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHiddenTestCase(idx)}
                          className="text-rose-500 hover:underline text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <Label className="text-[11px]">Stdin Input</Label>
                      <textarea
                        rows={2}
                        placeholder="5 10\n1 2 3 7 8"
                        value={tc.input}
                        onChange={(e) => updateHiddenTestCase(idx, "input", e.target.value)}
                        className="w-full rounded border bg-background p-2 text-xs font-mono mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Expected Stdout Output</Label>
                      <textarea
                        rows={2}
                        placeholder="2 4"
                        value={tc.expectedOutput}
                        onChange={(e) => updateHiddenTestCase(idx, "expectedOutput", e.target.value)}
                        className="w-full rounded border bg-background p-2 text-xs font-mono mt-1"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px]"
            >
              <Save className="h-4 w-4" />
              {loading ? "Publishing..." : "Publish Question"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
