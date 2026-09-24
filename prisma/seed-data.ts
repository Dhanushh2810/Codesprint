import type { Difficulty } from "@prisma/client";

export const COMPANIES = [
  { name: "Amazon", slug: "amazon", accentColor: "#FF9900" },
  { name: "Microsoft", slug: "microsoft", accentColor: "#0078D4" },
  { name: "Google", slug: "google", accentColor: "#4285F4" },
  { name: "Meta", slug: "meta", accentColor: "#0866FF" },
  { name: "Apple", slug: "apple", accentColor: "#555555" },
  { name: "Adobe", slug: "adobe", accentColor: "#FF0000" },
  { name: "Flipkart", slug: "flipkart", accentColor: "#2874F0" },
  { name: "Uber", slug: "uber", accentColor: "#000000" },
  { name: "Atlassian", slug: "atlassian", accentColor: "#0052CC" },
  { name: "Walmart", slug: "walmart", accentColor: "#0071CE" },
  { name: "Salesforce", slug: "salesforce", accentColor: "#00A1E0" },
  { name: "Oracle", slug: "oracle", accentColor: "#F80000" },
  { name: "PayPal", slug: "paypal", accentColor: "#003087" },
  { name: "Meesho", slug: "meesho", accentColor: "#9F2089" },
  { name: "Netflix", slug: "netflix", accentColor: "#E50914" },
];

export const TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Binary Search",
  "Backtracking",
  "Heaps",
  "Hashing",
  "Stack",
  "Queue",
  "Tries",
  "Bit Manipulation",
  "Math",
];

type SeedProblem = {
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  companies: string[];
  description: string;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  followUp?: string;
  sampleTests: { input: string; output: string }[];
  hiddenTests: { input: string; output: string }[];
  popularity: number;
};

function prob(
  title: string,
  slug: string,
  difficulty: Difficulty,
  topics: string[],
  companies: string[],
  io: { input: string; output: string },
  extraHidden: { input: string; output: string }[] = [],
  popularity = 50
): SeedProblem {
  return {
    title,
    slug,
    difficulty,
    topics,
    companies,
    popularity,
    description: `Given the input below, compute the required output for **${title}**.

Read from standard input and write to standard output.`,
    constraints: `- 1 ≤ n ≤ 10^5
- Values fit in 32-bit signed integers
- Time limit: 2 seconds`,
    examples: [
      {
        input: io.input,
        output: io.output,
        explanation: "Match the sample format exactly when printing.",
      },
    ],
    sampleTests: [{ input: io.input, output: io.output }],
    hiddenTests: extraHidden,
  };
}

export const PROBLEMS: SeedProblem[] = [
  {
    title: "Pair Sum Indices",
    slug: "pair-sum-indices",
    difficulty: "EASY",
    topics: ["Arrays", "Hashing"],
    companies: ["amazon", "google", "microsoft", "flipkart"],
    popularity: 98,
    description: `You are given an array of integers and a target value. Find **two distinct indices** such that their values add up to the target.

Print the indices separated by a space (0-indexed). If no pair exists, print \`-1 -1\`.

**Input format**
Line 1: \`n target\`
Line 2: \`n\` space-separated integers`,
    constraints: `- 2 ≤ n ≤ 10^5
- Each value between -10^9 and 10^9
- Exactly one valid pair exists when a solution is required`,
    examples: [
      {
        input: "4 9\n2 7 11 15",
        output: "0 1",
        explanation: "2 + 7 = 9 at indices 0 and 1.",
      },
    ],
    sampleTests: [{ input: "4 9\n2 7 11 15", output: "0 1" }],
    hiddenTests: [
      { input: "5 10\n1 2 3 7 8", output: "2 4" },
      { input: "3 6\n3 3 3", output: "0 1" },
    ],
  },
  {
    title: "Maximum Subarray Sum",
    slug: "maximum-subarray-sum",
    difficulty: "MEDIUM",
    topics: ["Arrays", "Dynamic Programming"],
    companies: ["amazon", "microsoft", "oracle", "walmart"],
    popularity: 92,
    description: `Given an array of integers, find the **maximum sum** of any contiguous subarray (Kadane's algorithm).

**Input format**
Line 1: \`n\`
Line 2: \`n\` space-separated integers`,
    constraints: `- 1 ≤ n ≤ 10^5
- Values between -10^4 and 10^4`,
    examples: [
      {
        input: "9\n-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "Subarray [4,-1,2,1] has sum 6.",
      },
    ],
    sampleTests: [{ input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6" }],
    hiddenTests: [{ input: "5\n5 4 -1 7 8", output: "23" }],
  },
  prob(
    "Reverse String Tokens",
    "reverse-string-tokens",
    "EASY",
    ["Strings"],
    ["google", "meta", "adobe"],
    { input: "hello world prep", output: "prep world hello" },
    [{ input: "a b c d", output: "d c b a" }]
  ),
  prob(
    "Valid Parentheses Check",
    "valid-parentheses-check",
    "EASY",
    ["Stack", "Strings"],
    ["amazon", "microsoft", "atlassian"],
    { input: "({[]})", output: "true" },
    [{ input: "(]", output: "false" }]
  ),
  prob(
    "Merge Sorted Arrays",
    "merge-sorted-arrays",
    "EASY",
    ["Arrays", "Binary Search"],
    ["google", "flipkart", "paypal"],
    { input: "3 2\n1 3 5\n2 4", output: "1 2 3 4 5" }
  ),
  prob(
    "Longest Unique Substring",
    "longest-unique-substring",
    "MEDIUM",
    ["Strings", "Hashing"],
    ["amazon", "uber", "netflix"],
    { input: "abcabcbb", output: "3" },
    [{ input: "bbbbb", output: "1" }]
  ),
  prob(
    "Binary Search Position",
    "binary-search-position",
    "EASY",
    ["Binary Search", "Arrays"],
    ["microsoft", "oracle", "walmart"],
    { input: "5 3\n1 2 3 4 5", output: "2" }
  ),
  prob(
    "Climb Stairs Ways",
    "climb-stairs-ways",
    "EASY",
    ["Dynamic Programming"],
    ["google", "adobe", "meesho"],
    { input: "4", output: "5" }
  ),
  prob(
    "House Robber Max",
    "house-robber-max",
    "MEDIUM",
    ["Dynamic Programming"],
    ["amazon", "salesforce", "flipkart"],
    { input: "4\n1 2 3 1", output: "4" }
  ),
  prob(
    "Coin Change Minimum",
    "coin-change-minimum",
    "MEDIUM",
    ["Dynamic Programming"],
    ["google", "microsoft", "paypal"],
    { input: "3 11\n1 2 5", output: "3" }
  ),
  prob(
    "Graph BFS Shortest Path",
    "graph-bfs-shortest-path",
    "MEDIUM",
    ["Graphs", "Queue"],
    ["google", "meta", "uber"],
    { input: "4 3 0 3\n0 1\n1 2\n2 3", output: "3" }
  ),
  prob(
    "Tree Height",
    "tree-height",
    "EASY",
    ["Trees"],
    ["amazon", "apple", "atlassian"],
    { input: "3\n1 2 3", output: "2" }
  ),
  prob(
    "Level Order Traversal Size",
    "level-order-traversal-size",
    "MEDIUM",
    ["Trees", "Queue"],
    ["microsoft", "flipkart", "netflix"],
    { input: "7\n1 2 3 4 5 6 7", output: "3" }
  ),
  prob(
    "Min Heap Kth Element",
    "min-heap-kth-element",
    "MEDIUM",
    ["Heaps", "Arrays"],
    ["amazon", "google", "oracle"],
    { input: "5 2\n3 2 1 5 6", output: "2" }
  ),
  prob(
    "Detect Cycle In List",
    "detect-cycle-in-list",
    "EASY",
    ["Linked Lists", "Hashing"],
    ["meta", "adobe", "uber"],
    { input: "3 1", output: "true" },
    [{ input: "3 -1", output: "false" }]
  ),
  prob(
    "Palindrome Number Check",
    "palindrome-number-check",
    "EASY",
    ["Math"],
    ["flipkart", "meesho", "walmart"],
    { input: "121", output: "true" }
  ),
  prob(
    "Rotate Array Steps",
    "rotate-array-steps",
    "MEDIUM",
    ["Arrays"],
    ["amazon", "microsoft", "salesforce"],
    { input: "7 3\n1 2 3 4 5 6 7", output: "5 6 7 1 2 3 4" }
  ),
  prob(
    "Subarray Product Less Than K",
    "subarray-product-less-than-k",
    "MEDIUM",
    ["Arrays", "Binary Search"],
    ["google", "apple", "paypal"],
    { input: "4 100\n10 5 2 6", output: "8" }
  ),
  prob(
    "Word Break Possible",
    "word-break-possible",
    "MEDIUM",
    ["Dynamic Programming", "Strings"],
    ["facebook", "meta", "amazon"].filter(Boolean) as string[],
    { input: "leetcode\n2\nleet code", output: "true" }
  ),
  prob(
    "LRU Cache Operations",
    "lru-cache-operations",
    "HARD",
    ["Hashing", "Linked Lists"],
    ["amazon", "google", "microsoft"],
    { input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", output: "1\n-1" }
  ),
  prob(
    "Median Of Two Sorted",
    "median-of-two-sorted",
    "HARD",
    ["Binary Search", "Arrays"],
    ["google", "apple", "oracle"],
    { input: "2 2\n1 3\n2", output: "2.0" }
  ),
  prob(
    "N Queens Count",
    "n-queens-count",
    "HARD",
    ["Backtracking"],
    ["google", "adobe", "atlassian"],
    { input: "4", output: "2" }
  ),
  prob(
    "Trie Prefix Count",
    "trie-prefix-count",
    "MEDIUM",
    ["Tries", "Strings"],
    ["microsoft", "salesforce", "netflix"],
    { input: "3\napp apple apt", output: "2" }
  ),
  prob(
    "Single Number XOR",
    "single-number-xor",
    "EASY",
    ["Bit Manipulation"],
    ["amazon", "flipkart", "meesho"],
    { input: "4\n4 1 2 1", output: "4" }
  ),
  prob(
    "Daily Temperatures Wait",
    "daily-temperatures-wait",
    "MEDIUM",
    ["Stack", "Arrays"],
    ["google", "uber", "walmart"],
    { input: "5\n73 74 75 71 69", output: "1 1 0 0 0" }
  ),
  prob(
    "Course Schedule Possible",
    "course-schedule-possible",
    "MEDIUM",
    ["Graphs"],
    ["meta", "amazon", "microsoft"],
    { input: "2 1\n1 0", output: "true" }
  ),
  prob(
    "Number Of Islands",
    "number-of-islands",
    "MEDIUM",
    ["Graphs", "Backtracking"],
    ["amazon", "google", "flipkart"],
    { input: "4 5\n11110\n11010\n11000\n00000", output: "1" }
  ),
  prob(
    "Top K Frequent Elements",
    "top-k-frequent-elements",
    "MEDIUM",
    ["Hashing", "Heaps"],
    ["microsoft", "oracle", "paypal"],
    { input: "6 2\n1 1 1 2 2 3", output: "1 2" }
  ),
  prob(
    "Longest Increasing Subsequence",
    "longest-increasing-subsequence",
    "MEDIUM",
    ["Dynamic Programming", "Binary Search"],
    ["google", "adobe", "apple"],
    { input: "6\n10 9 2 5 3 7", output: "3" }
  ),
  prob(
    "Jump Game Reachable",
    "jump-game-reachable",
    "MEDIUM",
    ["Greedy", "Arrays"],
    ["amazon", "salesforce", "uber"],
    { input: "5\n2 3 1 1 4", output: "true" }
  ),
  prob(
    "Gas Station Circuit",
    "gas-station-circuit",
    "MEDIUM",
    ["Greedy"],
    ["flipkart", "walmart", "meesho"],
    { input: "3\n1 2 3\n3 4 5", output: "0" }
  ),
  prob(
    "Matrix Zero Regions",
    "matrix-zero-regions",
    "MEDIUM",
    ["Arrays"],
    ["microsoft", "netflix", "atlassian"],
    { input: "3 3\n1 1 1\n1 0 1\n1 1 1", output: "1" }
  ),
  prob(
    "Spiral Matrix Order",
    "spiral-matrix-order",
    "MEDIUM",
    ["Arrays"],
    ["google", "meta", "oracle"],
    { input: "3 3\n1 2 3\n4 5 6\n7 8 9", output: "1 2 3 6 9 8 7 4 5" }
  ),
  prob(
    "Minimum Window Substring Length",
    "minimum-window-substring-length",
    "HARD",
    ["Strings", "Hashing"],
    ["amazon", "google", "microsoft"],
    { input: "ADOBECODEBANC\nABC", output: "4" }
  ),
  prob(
    "Regular Expression Match",
    "regular-expression-match",
    "HARD",
    ["Dynamic Programming", "Strings"],
    ["google", "adobe", "apple"],
    { input: "aa\na*", output: "true" }
  ),
  prob(
    "Serialize Tree Level",
    "serialize-tree-level",
    "HARD",
    ["Trees", "Strings"],
    ["meta", "amazon", "flipkart"],
    { input: "1 2 3 null null 4 5", output: "5" }
  ),
  prob(
    "Word Ladder Length",
    "word-ladder-length",
    "HARD",
    ["Graphs", "Queue"],
    ["google", "microsoft", "uber"],
    { input: "hit cog\n3\nhot dot dog lot log cog", output: "5" }
  ),
  prob(
    "Max Profit With Cooldown",
    "max-profit-with-cooldown",
    "MEDIUM",
    ["Dynamic Programming"],
    ["amazon", "paypal", "salesforce"],
    { input: "6\n1 2 3 0 2", output: "3" }
  ),
  prob(
    "Decode Ways Count",
    "decode-ways-count",
    "MEDIUM",
    ["Dynamic Programming", "Strings"],
    ["flipkart", "meesho", "walmart"],
    { input: "12", output: "2" }
  ),
  prob(
    "Partition Equal Subset",
    "partition-equal-subset",
    "MEDIUM",
    ["Dynamic Programming"],
    ["microsoft", "oracle", "netflix"],
    { input: "4\n1 5 11 5", output: "true" }
  ),
  prob(
    "K Closest Points Origin",
    "k-closest-points-origin",
    "MEDIUM",
    ["Heaps", "Math"],
    ["google", "uber", "atlassian"],
    { input: "3 1\n1 3\n-2 2\n5 8", output: "-2 2" }
  ),
  prob(
    "Meeting Rooms Required",
    "meeting-rooms-required",
    "MEDIUM",
    ["Greedy", "Heaps"],
    ["salesforce", "adobe", "apple"],
    { input: "3\n0 30\n5 10\n15 20", output: "2" }
  ),
  prob(
    "Implement Queue Using Stacks",
    "queue-using-stacks",
    "EASY",
    ["Stack", "Queue"],
    ["amazon", "flipkart", "microsoft"],
    { input: "push 1\npush 2\npeek\npop", output: "1\n1" }
  ),
  prob(
    "Valid Anagram Check",
    "valid-anagram-check",
    "EASY",
    ["Hashing", "Strings"],
    ["meta", "google", "meesho"],
    { input: "anagram\nnagaram", output: "true" }
  ),
  prob(
    "Missing Number Sum",
    "missing-number-sum",
    "EASY",
    ["Math", "Bit Manipulation"],
    ["microsoft", "walmart", "paypal"],
    { input: "3\n0 1 3", output: "2" }
  ),
  prob(
    "Majority Element Vote",
    "majority-element-vote",
    "EASY",
    ["Arrays"],
    ["amazon", "oracle", "flipkart"],
    { input: "3\n3 2 3", output: "3" }
  ),
  prob(
    "Product Except Self",
    "product-except-self",
    "MEDIUM",
    ["Arrays"],
    ["google", "apple", "netflix"],
    { input: "4\n1 2 3 4", output: "24 12 8 6" }
  ),
  prob(
    "Container Most Water",
    "container-most-water",
    "MEDIUM",
    ["Greedy", "Arrays"],
    ["amazon", "uber", "salesforce"],
    { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" }
  ),
  prob(
    "Trapping Rain Water",
    "trapping-rain-water",
    "HARD",
    ["Arrays", "Stack"],
    ["google", "microsoft", "adobe"],
    { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }
  ),
  prob(
    "Sliding Window Maximum",
    "sliding-window-maximum",
    "HARD",
    ["Queue", "Arrays"],
    ["amazon", "flipkart", "meta"],
    { input: "3\n1 3 -1 -3 5 3 6 7", output: "3 3 5 5 6 7" }
  ),
  prob(
    "Search Rotated Sorted Array",
    "search-rotated-sorted-array",
    "MEDIUM",
    ["Binary Search", "Arrays"],
    ["microsoft", "google", "oracle"],
    { input: "7 0\n4 5 6 7 0 1 2", output: "0" }
  ),
  prob(
    "Combination Sum Count",
    "combination-sum-count",
    "MEDIUM",
    ["Backtracking", "Arrays"],
    ["adobe", "atlassian", "paypal"],
    { input: "3 7\n2 3 6", output: "2" }
  ),
  prob(
    "Permutation In String",
    "permutation-in-string",
    "MEDIUM",
    ["Strings", "Hashing"],
    ["amazon", "netflix", "meesho"],
    { input: "ab eidbaooo", output: "true" }
  ),
  prob(
    "Longest Palindromic Substring",
    "longest-palindromic-substring",
    "MEDIUM",
    ["Strings", "Dynamic Programming"],
    ["google", "microsoft", "flipkart"],
    { input: "babad", output: "3" }
  ),
  prob(
    "Edit Distance Minimum",
    "edit-distance-minimum",
    "HARD",
    ["Dynamic Programming", "Strings"],
    ["amazon", "apple", "google"],
    { input: "horse\nros", output: "3" }
  ),
  prob(
    "Distinct Subsequences Count",
    "distinct-subsequences-count",
    "HARD",
    ["Dynamic Programming", "Strings"],
    ["meta", "salesforce", "oracle"],
    { input: "rabbbit\nrabbit", output: "3" }
  ),
];

// Fix invalid company slugs from typo
for (const p of PROBLEMS) {
  p.companies = p.companies.map((c) => (c === "facebook" ? "meta" : c));
}
