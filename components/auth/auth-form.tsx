"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function syncProfile() {
  await fetch("/api/auth/sync", { method: "POST" });
}

function setDevSession(user: { id: string; email: string; name: string; college?: string; graduationYear?: string }) {
  const value = JSON.stringify(user);
  document.cookie = `codetarget_dev_user=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (process.env.NODE_ENV === "production") {
          toast.error(error.message);
          return;
        }
        const name = email.split("@")[0] || "User";
        setDevSession({ id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`, email, name });
      }
    } catch {
      if (process.env.NODE_ENV === "production") {
        toast.error("Unable to connect to authentication service");
        return;
      }
      const name = email.split("@")[0] || "User";
      setDevSession({ id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`, email, name });
    }

    await syncProfile();
    setLoading(false);
    toast.success("Welcome back");
    router.push(searchParams.get("redirect") ?? "/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Continue your company-wise preparation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    graduationYear: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            college: form.college || undefined,
            graduationYear: form.graduationYear || undefined,
          },
        },
      });
      if (error) {
        if (process.env.NODE_ENV === "production") {
          toast.error(error.message);
          return;
        }
        setDevSession({
          id: `user_${form.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
          email: form.email,
          name: form.name,
          college: form.college,
          graduationYear: form.graduationYear,
        });
      }
    } catch {
      if (process.env.NODE_ENV === "production") {
        toast.error("Unable to connect to authentication service");
        return;
      }
      setDevSession({
        id: `user_${form.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email: form.email,
        name: form.name,
        college: form.college,
        graduationYear: form.graduationYear,
      });
    }

    await syncProfile();
    setLoading(false);
    toast.success("Account created");
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start building your target-company prep plan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College (optional)</Label>
            <Input
              id="college"
              type="text"
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation year (optional)</Label>
            <Input
              id="graduationYear"
              type="number"
              value={form.graduationYear}
              onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
