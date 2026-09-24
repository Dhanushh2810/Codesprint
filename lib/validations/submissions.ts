import { z } from "zod";
import { LANGUAGES } from "@/lib/judge0/languages";

const languageIds = LANGUAGES.map((l) => l.id) as [string, ...string[]];

export const runCodeSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(languageIds),
  sourceCode: z.string().min(1).max(64_000),
});

export const submitCodeSchema = runCodeSchema;
