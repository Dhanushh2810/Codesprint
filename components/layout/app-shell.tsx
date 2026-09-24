import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        Built by Dhanush · IIT (BHU) Varanasi · ECE
      </footer>
    </div>
  );
}
