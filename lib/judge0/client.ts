import type { SubmissionStatus } from "@prisma/client";
import type { ExecutionResult, TestResultItem } from "@/lib/types";
import { getLanguageConfig } from "@/lib/judge0/languages";

const MAX_SOURCE_BYTES = 64_000;

interface RunTestInput {
  sourceCode: string;
  language: string;
  stdin: string;
  expectedOutput: string;
  timeLimitMs: number;
  memoryLimitKb: number;
}

interface SingleTestReturn {
  status: SubmissionStatus;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  runtimeMs?: number;
  memoryKb?: number;
}

function normalizeOutput(output: string): string {
  return output.replace(/\r\n/g, "\n").trim();
}

function encodeB64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64");
}

function decodeB64(b64: string | null | undefined): string {
  if (!b64) return "";
  try {
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return b64;
  }
}

function mapJudge0Status(statusId: number): SubmissionStatus {
  if (statusId === 3) return "ACCEPTED";
  if (statusId === 4) return "WRONG_ANSWER";
  if (statusId === 5) return "TIME_LIMIT_EXCEEDED";
  if (statusId === 6) return "COMPILATION_ERROR";
  if (statusId === 11 || statusId === 12) return "RUNTIME_ERROR";
  if (statusId === 13) return "MEMORY_LIMIT_EXCEEDED";
  return "RUNTIME_ERROR";
}

function getJudge0Headers(): Record<string, string> {
  const baseUrl = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
  const apiKey = process.env.JUDGE0_API_KEY || "";
  const useRapidApi = process.env.JUDGE0_USE_RAPIDAPI === "true";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (useRapidApi && apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
    try {
      headers["X-RapidAPI-Host"] = new URL(baseUrl).host;
    } catch {
      // ignore
    }
  } else if (apiKey) {
    headers["X-Auth-Token"] = apiKey;
  }

  return headers;
}

function isJudge0Configured(): boolean {
  return process.env.JUDGE0_MOCK !== "true";
}

async function submitToJudge0(
  sourceCode: string,
  languageId: number,
  stdin: string,
  timeLimitMs: number,
  memoryLimitKb: number
) {
  const baseUrl = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
  const headers = getJudge0Headers();

  const createRes = await fetch(`${baseUrl}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: encodeB64(sourceCode),
      language_id: languageId,
      stdin: encodeB64(stdin),
      cpu_time_limit: Math.max(1, Math.ceil(timeLimitMs / 1000)),
      memory_limit: memoryLimitKb,
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Judge0 submit failed (${createRes.status}): ${body}`);
  }

  const result = await createRes.json();

  if (result.status && result.status.id > 2) {
    return {
      status: result.status as { id: number; description: string },
      stdout: decodeB64(result.stdout),
      stderr: decodeB64(result.stderr),
      compile_output: decodeB64(result.compile_output),
      time: result.time as string | null,
      memory: result.memory as number | null,
    };
  }

  const token = result.token;
  if (!token) {
    throw new Error("Invalid response from Judge0");
  }

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const pollRes = await fetch(
      `${baseUrl}/submissions/${token}?base64_encoded=true&fields=*`,
      { headers }
    );
    if (!pollRes.ok) continue;
    const pollJson = await pollRes.json();
    if (pollJson.status?.id > 2) {
      return {
        status: pollJson.status as { id: number; description: string },
        stdout: decodeB64(pollJson.stdout),
        stderr: decodeB64(pollJson.stderr),
        compile_output: decodeB64(pollJson.compile_output),
        time: pollJson.time as string | null,
        memory: pollJson.memory as number | null,
      };
    }
  }

  throw new Error("Judge0 polling timeout");
}

function mockExecuteSingleTest(input: RunTestInput): SingleTestReturn {
  const cleanCode = input.sourceCode.trim();

  // Basic syntax & starter code check
  if (
    cleanCode.includes("// Write your solution here") ||
    cleanCode.includes("# Write your solution here") ||
    cleanCode.length < 15
  ) {
    return {
      status: "WRONG_ANSWER",
      stdout: "",
      compileOutput: undefined,
      stderr: "No solution logic implemented.",
    };
  }

  const normExpected = normalizeOutput(input.expectedOutput);
  const runtimeMs = Math.floor(Math.random() * 25) + 8;
  const memoryKb = Math.floor(Math.random() * 1000) + 12400;

  return {
    status: "ACCEPTED",
    stdout: normExpected,
    stderr: undefined,
    compileOutput: undefined,
    runtimeMs,
    memoryKb,
  };
}

async function runSingleTest(input: RunTestInput): Promise<SingleTestReturn> {
  const lang = getLanguageConfig(input.language);
  if (!lang) {
    return {
      status: "COMPILATION_ERROR",
      compileOutput: "Unsupported language",
    };
  }

  if (!isJudge0Configured()) {
    return mockExecuteSingleTest(input);
  }

  try {
    const result = await submitToJudge0(
      input.sourceCode,
      lang.judge0Id,
      input.stdin,
      input.timeLimitMs,
      input.memoryLimitKb
    );

    const status = mapJudge0Status(result.status.id);
    const stdout = result.stdout || "";
    const compileOutput = result.compile_output || undefined;
    const stderr = result.stderr || undefined;

    if (status === "COMPILATION_ERROR") {
      return {
        status: "COMPILATION_ERROR",
        compileOutput: compileOutput || stderr || "Compilation Error",
        stderr,
      };
    }

    if (
      status === "RUNTIME_ERROR" ||
      status === "TIME_LIMIT_EXCEEDED" ||
      status === "MEMORY_LIMIT_EXCEEDED"
    ) {
      return {
        status,
        stderr: stderr || compileOutput || "Runtime Exception",
        compileOutput,
      };
    }

    const acceptedByOutput =
      normalizeOutput(stdout) === normalizeOutput(input.expectedOutput);

    return {
      status: acceptedByOutput ? "ACCEPTED" : "WRONG_ANSWER",
      stdout,
      stderr,
      compileOutput,
      runtimeMs: result.time ? Math.round(parseFloat(result.time) * 1000) : 15,
      memoryKb: result.memory ?? 14000,
    };
  } catch (err) {
    console.error("Judge0 execution failed:", err);
    return {
      status: "RUNTIME_ERROR",
      stderr: "Code execution service is temporarily unavailable. Please try again.",
    };
  }
}

export async function executeAgainstTests(options: {
  sourceCode: string;
  language: string;
  tests: { input: string; expectedOutput: string }[];
  timeLimitMs: number;
  memoryLimitKb: number;
  revealDetails: boolean;
}): Promise<ExecutionResult> {
  if (Buffer.byteLength(options.sourceCode, "utf8") > MAX_SOURCE_BYTES) {
    return {
      status: "COMPILATION_ERROR",
      passedTests: 0,
      totalTests: options.tests.length,
      errorMessage: "Source code exceeds size limit (64KB)",
    };
  }

  const testResults: TestResultItem[] = [];
  let passedTests = 0;
  let maxRuntime = 0;
  let maxMemory = 0;
  let finalStatus: SubmissionStatus = "ACCEPTED";

  for (let i = 0; i < options.tests.length; i++) {
    const test = options.tests[i];
    const result = await runSingleTest({
      sourceCode: options.sourceCode,
      language: options.language,
      stdin: test.input,
      expectedOutput: test.expectedOutput,
      timeLimitMs: options.timeLimitMs,
      memoryLimitKb: options.memoryLimitKb,
    });

    if (result.runtimeMs) maxRuntime = Math.max(maxRuntime, result.runtimeMs);
    if (result.memoryKb) maxMemory = Math.max(maxMemory, result.memoryKb);

    if (result.status === "COMPILATION_ERROR") {
      return {
        status: "COMPILATION_ERROR",
        passedTests: 0,
        totalTests: options.tests.length,
        compileOutput: result.compileOutput,
        errorMessage: result.compileOutput,
        testResults: options.revealDetails
          ? [
              {
                index: i + 1,
                passed: false,
                status: "COMPILATION_ERROR",
                stderr: result.compileOutput,
              },
            ]
          : undefined,
      };
    }

    if (
      result.status === "RUNTIME_ERROR" ||
      result.status === "TIME_LIMIT_EXCEEDED" ||
      result.status === "MEMORY_LIMIT_EXCEEDED"
    ) {
      finalStatus = result.status;
      testResults.push({
        index: i + 1,
        passed: false,
        status: result.status,
        input: options.revealDetails ? test.input : undefined,
        stderr: result.stderr ?? result.compileOutput,
      });
      continue;
    }

    const passed = result.status === "ACCEPTED";

    if (passed) passedTests++;
    else finalStatus = "WRONG_ANSWER";

    testResults.push({
      index: i + 1,
      passed,
      status: passed ? "PASSED" : "WRONG_ANSWER",
      input: options.revealDetails ? test.input : undefined,
      expectedOutput: options.revealDetails ? test.expectedOutput : undefined,
      actualOutput: options.revealDetails ? result.stdout : undefined,
    });

  }

  if (passedTests === options.tests.length && options.tests.length > 0) {
    finalStatus = "ACCEPTED";
  }

  return {
    status: finalStatus,
    runtimeMs: maxRuntime || 20,
    memoryKb: maxMemory || 14000,
    passedTests,
    totalTests: options.tests.length,
    testResults: options.revealDetails ? testResults : undefined,
  };
}
