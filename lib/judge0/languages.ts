export type SupportedLanguage = "cpp" | "java" | "python" | "javascript";

export interface LanguageConfig {
  id: SupportedLanguage;
  label: string;
  judge0Id: number;
  monacoId: string;
  extension: string;
}

export const LANGUAGES: LanguageConfig[] = [
  {
    id: "cpp",
    label: "C++",
    judge0Id: 54,
    monacoId: "cpp",
    extension: "cpp",
  },
  {
    id: "java",
    label: "Java",
    judge0Id: 62,
    monacoId: "java",
    extension: "java",
  },
  {
    id: "python",
    label: "Python",
    judge0Id: 71,
    monacoId: "python",
    extension: "py",
  },
  {
    id: "javascript",
    label: "JavaScript",
    judge0Id: 63,
    monacoId: "javascript",
    extension: "js",
  },
];

export function getLanguageConfig(lang: string): LanguageConfig | undefined {
  return LANGUAGES.find((l) => l.id === lang);
}

export const DEFAULT_STARTER_CODE: Record<SupportedLanguage, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  python: `# Read input from stdin
import sys

def main():
    data = sys.stdin.read().strip().split()
    # Write your solution here

if __name__ == "__main__":
    main()`,
  javascript: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();
// Write your solution here
`,
};
