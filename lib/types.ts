import type {
  Difficulty,
  ProblemStatus,
  SkillLevel,
  SubmissionStatus,
} from "@prisma/client";

export type { Difficulty, ProblemStatus, SkillLevel, SubmissionStatus };

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestResultItem {
  index: number;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
  status: SubmissionStatus | "PASSED" | "FAILED";
}

export interface ExecutionResult {
  status: SubmissionStatus;
  runtimeMs?: number;
  memoryKb?: number;
  compileOutput?: string;
  stderr?: string;
  stdout?: string;
  testResults?: TestResultItem[];
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
}

export interface DashboardStats {
  solved: number;
  attempted: number;
  streak: number;
  overallProgress: number;
  totalProblems: number;
}
