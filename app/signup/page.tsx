import { AppShell } from "@/components/layout/app-shell";
import { SignUpForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-16">
        <SignUpForm />
      </div>
    </AppShell>
  );
}
