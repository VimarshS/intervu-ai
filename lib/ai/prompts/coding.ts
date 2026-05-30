export interface CodingProblemContext {
  role: string | null;
  experienceLevel: string | null;
  language: string;
  topic?: string;
}

export interface CodingProblem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  problem: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  constraints: string[];
  hints: string[];
  starter_code: string;
  helper_code: string;
  driver_code: string;
}

export function buildCodingProblemPrompt(
  context: CodingProblemContext
): string {
  const levelMap: Record<string, string> = {
    fresher:
      "easy — focus on basic arrays, strings, and simple loops",
    junior:
      "easy to medium — arrays, strings, hashmaps, basic recursion",
    mid: "medium — trees, graphs, dynamic programming basics",
    senior:
      "medium to hard — advanced algorithms, system-level thinking, optimization",
  };

  const difficulty =
    levelMap[context.experienceLevel ?? "fresher"] ??
    levelMap["fresher"];

  const roleContext = context.role
    ? `The candidate is preparing for a ${context.role} role.`
    : "The candidate is preparing for a software engineering role.";

  const topicContext = context.topic
    ? `Focus specifically on: ${context.topic}`
    : "Choose a relevant topic suitable for the role.";

  const languageExamples = getLanguageExamples(context.language);

  return `
You are an expert coding interviewer creating a LeetCode-style coding challenge.

${roleContext}
Difficulty level: ${difficulty}
Programming language: ${context.language}
${topicContext}

IMPORTANT — LEETCODE STYLE EXECUTION:
The platform works like LeetCode. The user only writes the solution function.
You must provide three separate code blocks:
1. helper_code: pre-defined classes (ListNode, TreeNode, etc.) if needed. Empty string if not needed.
2. starter_code: ONLY the function signature with a placeholder — what the user sees and edits.
3. driver_code: test harness that calls the function with test cases and prints results. User never sees this.

The final execution will be: helper_code + starter_code(user's solution) + driver_code

${languageExamples}

Generate ONE coding problem and return ONLY a valid JSON object.
No markdown, no backticks, no explanation outside the JSON.

Return exactly this structure:

{
  "title": "<concise problem title>",
  "difficulty": "<Easy | Medium | Hard>",
  "topic": "<topic category e.g. Arrays, Dynamic Programming, Trees>",
  "problem": "<clear problem statement. Describe what the function receives and returns. Include constraints.>",
  "examples": [
    {
      "input": "<example input>",
      "output": "<expected output>",
      "explanation": "<brief explanation>"
    },
    {
      "input": "<example input>",
      "output": "<expected output>",
      "explanation": "<brief explanation>"
    }
  ],
  "constraints": [
    "<constraint 1>",
    "<constraint 2>"
  ],
  "hints": [
    "<subtle hint 1 — do not give away the solution>",
    "<subtle hint 2>"
  ],
  "helper_code": "<pre-defined classes like ListNode, TreeNode in ${context.language}. Empty string if not needed.>",
  "starter_code": "<ONLY the function signature with a pass/placeholder body in ${context.language}>",
  "driver_code": "<test harness in ${context.language} that calls the function with 3-5 test cases and prints pass/fail results>"
}

CRITICAL RULES:
- starter_code must contain ONLY the function — no main(), no class wrapper for Python/JS
- driver_code must call the exact same function name defined in starter_code
- driver_code must print each test result clearly e.g. "Test 1: PASS" or "Test 1: FAIL (expected X got Y)"
- helper_code + starter_code + driver_code must form valid runnable ${context.language} code when concatenated
- For Java/C++: wrap everything correctly so concatenation compiles
- Return ONLY the JSON — nothing else
  `.trim();
}

function getLanguageExamples(language: string): string {
  const examples: Record<string, string> = {
    python: `
PYTHON EXAMPLE FORMAT:
helper_code: "" (or "class ListNode:\\n    def __init__(self, val=0, next=None):\\n        self.val = val\\n        self.next = next\\n")
starter_code: "def two_sum(nums: list, target: int) -> list:\\n    # Write your solution here\\n    pass\\n"
driver_code: "# Test cases\\nprint('Test 1:', 'PASS' if two_sum([2,7,11,15], 9) == [0,1] else 'FAIL')\\nprint('Test 2:', 'PASS' if two_sum([3,2,4], 6) == [1,2] else 'FAIL')\\n"
`,
    javascript: `
JAVASCRIPT EXAMPLE FORMAT:
helper_code: "" (or "class ListNode { constructor(val=0, next=null) { this.val=val; this.next=next; } }\\n")
starter_code: "function twoSum(nums, target) {\\n    // Write your solution here\\n}\\n"
driver_code: "console.log('Test 1:', JSON.stringify(twoSum([2,7,11,15], 9)) === JSON.stringify([0,1]) ? 'PASS' : 'FAIL');\\nconsole.log('Test 2:', JSON.stringify(twoSum([3,2,4], 6)) === JSON.stringify([1,2]) ? 'PASS' : 'FAIL');\\n"
`,
    java: `
JAVA EXAMPLE FORMAT:
helper_code: "class ListNode { int val; ListNode next; ListNode(int val) { this.val = val; } }\\n"
starter_code: "class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        // Write your solution here\\n        return new int[]{};\\n    }\\n}\\n"
driver_code: "class Main {\\n    public static void main(String[] args) {\\n        Solution sol = new Solution();\\n        int[] r1 = sol.twoSum(new int[]{2,7,11,15}, 9);\\n        System.out.println('Test 1: ' + (r1[0]==0 && r1[1]==1 ? 'PASS' : 'FAIL'));\\n    }\\n}\\n"
`,
    cpp: `
C++ EXAMPLE FORMAT:
helper_code: "struct ListNode { int val; ListNode* next; ListNode(int x) : val(x), next(nullptr) {} };\\n"
starter_code: "vector<int> twoSum(vector<int>& nums, int target) {\\n    // Write your solution here\\n    return {};\\n}\\n"
driver_code: "#include<iostream>\\n#include<vector>\\nusing namespace std;\\nint main() {\\n    vector<int> nums = {2,7,11,15};\\n    vector<int> r = twoSum(nums, 9);\\n    cout << 'Test 1: ' << (r[0]==0 && r[1]==1 ? 'PASS' : 'FAIL') << endl;\\n}\\n"
`,
  };

  return (
    examples[language] ||
    `Generate appropriate helper_code, starter_code, and driver_code for ${language}.`
  );
}

export function buildCodeReviewPrompt(
  problem: string,
  code: string,
  language: string,
  output: string
): string {
  return `
You are an expert code reviewer evaluating a candidate's solution.

PROBLEM:
${problem}

CANDIDATE'S SOLUTION FUNCTION (${language}):
${code}

TEST OUTPUT:
${output}

Review this solution and return ONLY a valid JSON object.
No markdown, no backticks, no explanation outside the JSON.

Return exactly this structure:

{
  "is_correct": <true | false>,
  "time_complexity": "<e.g. O(n log n)>",
  "space_complexity": "<e.g. O(n)>",
  "overall_score": <integer 0-10>,
  "strengths": [
    "<specific strength in this code>",
    "<specific strength in this code>"
  ],
  "improvements": [
    "<specific improvement with explanation>",
    "<specific improvement with explanation>"
  ],
  "optimized_approach": "<2-3 sentences describing a better approach if one exists, or confirming this is optimal>",
  "detailed_review": "<2-3 paragraphs of honest, specific feedback about the code quality, approach, edge case handling, and naming conventions>"
}

SCORING GUIDELINES:
- 9-10: Optimal solution, clean code, handles all edge cases
- 7-8: Correct solution, minor improvements possible
- 5-6: Partially correct or suboptimal but shows understanding
- 3-4: Incorrect but shows some relevant thinking
- 1-2: Fundamentally wrong approach

Determine is_correct by checking if the test output shows all tests passing.
Return ONLY the JSON — nothing else.
  `.trim();
}