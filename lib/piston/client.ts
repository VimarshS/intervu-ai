export interface PistonRunRequest {
  language: string;
  version: string;
  code: string;
  stdin?: string;
}

export interface PistonRunResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export interface PistonLanguage {
  language: string;
  version: string;
}

const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  typescript: 74,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  rust: 73,
};

export const SUPPORTED_LANGUAGES: PistonLanguage[] = [
  { language: "python", version: "3.8.1" },
  { language: "javascript", version: "Node.js 12.14.0" },
  { language: "typescript", version: "3.7.4" },
  { language: "java", version: "OpenJDK 13.0.1" },
  { language: "cpp", version: "GCC 9.2.0" },
  { language: "c", version: "GCC 9.2.0" },
  { language: "go", version: "1.13.5" },
  { language: "rust", version: "1.40.0" },
];

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
};

export const DEFAULT_CODE: Record<string, string> = {
  python: `# Write your solution here
def solution():
    pass

print(solution())
`,
  javascript: `// Write your solution here
function solution() {

}

console.log(solution());
`,
  typescript: `// Write your solution here
function solution(): void {

}

console.log(solution());
`,
  java: `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello World")
}
`,
  rust: `fn main() {
    println!("Hello World");
}
`,
};

export async function executeCode(
  request: PistonRunRequest
): Promise<PistonRunResult> {
  const languageId = JUDGE0_LANGUAGE_IDS[request.language];

  if (!languageId) {
    throw new Error(`Unsupported language: ${request.language}`);
  }

  const response = await fetch(
    "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: request.code,
        stdin: request.stdin ?? "",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Judge0 error:", errorText);
    throw new Error(
      `Judge0 API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? result.compile_output ?? "";

  return {
    language: request.language,
    version: request.version,
    run: {
      stdout,
      stderr,
      code: result.exit_code ?? 0,
      signal: null,
      output: stdout || stderr,
    },
  };
}

// LeetCode-style execution — combines helper + user solution + driver
export async function executeWithDriver(request: {
  language: string;
  version: string;
  helper_code: string;
  user_code: string;
  driver_code: string;
  stdin?: string;
}): Promise<PistonRunResult> {
  // Combine three parts into one runnable program
  const combinedCode = [
    request.helper_code,
    request.user_code,
    request.driver_code,
  ]
    .filter((part) => part && part.trim().length > 0)
    .join("\n");

  return executeCode({
    language: request.language,
    version: request.version,
    code: combinedCode,
    stdin: request.stdin,
  });
}