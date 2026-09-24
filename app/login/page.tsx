import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-16">
        <Suspense fallback={<Skeleton className="h-96 w-full max-w-md" />}>
          <LoginForm />
        </Suspense>
      </div>
    </AppShell>
  );
}
