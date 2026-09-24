"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, LogOut, ShieldAlert, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return v ? decodeURIComponent(v[2]) : null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setEmail(data.user.email);
        } else {
          checkDevCookie();
        }
      }).catch(checkDevCookie);

      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session?.user?.email) {
          setEmail(session.user.email);
        } else {
          checkDevCookie();
        }
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      checkDevCookie();
    }
  }, [pathname]);

  function checkDevCookie() {
    const devCookie = getCookie("codesprint_dev_user") || getCookie("codetarget_dev_user");
    if (devCookie) {
      try {
        const parsed = JSON.parse(devCookie);
        setEmail(parsed.email || "demo@codesprint.com");
      } catch {
        setEmail(null);
      }
    } else {
      setEmail(null);
    }
  }

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = "codesprint_dev_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "codetarget_dev_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
            {navLinks.map((link) => (
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
