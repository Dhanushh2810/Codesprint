"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, LogOut, ShieldAlert, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/companies", label: "Companies" },
  { href: "/problems", label: "Problems" },
  { href: "/targets", label: "Target Practice" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submissions", label: "Submissions" },
  { href: "/admin", label: "Admin" },
];

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const isAdmin = Boolean(email && adminEmails.includes(email.toLowerCase()));

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      const data = await response.json();
      setEmail(response.ok ? data.user?.email ?? null : null);
    }).catch(() => setEmail(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setEmail(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Code2 className="h-4 w-4" />
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-bold text-lg">
              CodeSprint
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.filter((link) => link.href !== "/admin" || isAdmin).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50",
                  pathname.startsWith(link.href) && "bg-muted text-foreground font-semibold"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {email ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => router.push("/profile")}>
                <UserIcon className="mr-1.5 h-4 w-4" />
                Profile
              </Button>
              <Button size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} title="Logout" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/signup")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
