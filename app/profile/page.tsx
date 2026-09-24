"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Flame,
  GraduationCap,
  LineChart,
  Mail,
  Pencil,
  Save,
  Target,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/shared/stats-card";
import { CompanyAvatar } from "@/components/companies/company-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  college?: string | null;
  graduationYear?: number | null;
  skillLevel?: string | null;
  problemsSolved: number;
  streak: number;
  overallProgress: number;
  targetCompanies: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
  }[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    college: "",
    graduationYear: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfile(data.profile);
      setForm({
        name: data.profile.name || "",
        college: data.profile.college || "",
        graduationYear: data.profile.graduationYear ? String(data.profile.graduationYear) : "",
      });
    } catch {
      toast.error("Could not load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          college: form.college || null,
          graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <UserIcon className="h-7 w-7 text-primary" />
            User Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal placement information and preparation targets.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-64 md:col-span-1 rounded-xl" />
            <Skeleton className="h-64 md:col-span-2 rounded-xl" />
          </div>
        ) : !profile ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Failed to load profile. Please sign in again.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Problems Solved"
                value={profile.problemsSolved}
                icon={Trophy}
              />
              <StatsCard
                title="Current Streak"
                value={`${profile.streak} Days`}
                icon={Flame}
              />
              <StatsCard
                title="Overall Progress"
                value={`${profile.overallProgress}%`}
                icon={Target}
              />
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Profile Details Card */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 pb-4 border-b">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{profile.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3.5 w-3.5" /> {profile.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" /> College / Institution
                          </span>
                          <p className="font-semibold text-base">{profile.college || "Not specified"}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" /> Graduation Year
                          </span>
                          <p className="font-semibold text-base">{profile.graduationYear || "Not specified"}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <LineChart className="h-3.5 w-3.5" /> Preparation Level
                          </span>
                          <div>
                            <Badge variant="secondary" className="uppercase font-semibold">
                              {profile.skillLevel || "INTERMEDIATE"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="college">College / University</Label>
                        <Input
                          id="college"
                          placeholder="e.g. Stanford University / IIT Delhi"
                          value={form.college}
                          onChange={(e) => setForm({ ...form, college: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          placeholder="e.g. 2026"
                          value={form.graduationYear}
                          onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="gap-1.5">
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Target Companies Card */}
              <Card className="md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Target Companies
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link href="/targets">Edit</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!profile.targetCompanies.length ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No target companies selected yet.
                    </p>
                  ) : (
                    profile.targetCompanies.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <CompanyAvatar name={c.name} color={c.accentColor} size="sm" />
                          <span className="font-medium">{c.name}</span>
                        </div>
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                    ))
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full mt-2">
                    <Link href="/onboarding">Modify Preferences</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
