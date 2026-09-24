"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

export function CodeEditor({
  language,
  value,
  onChange,
  fontSize = 14,
  minimap = false,
}: {
  language: string;
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  minimap?: boolean;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <Monaco
      height="100%"
      language={language}
      value={value}
      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
      onChange={(v) => onChange(v ?? "")}
      options={{
        fontSize,
        minimap: { enabled: minimap },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
      }}
    />
  );
}
