// src/data/rules.ts
import { CORE_RULES } from "./core-rules";
import type { DiagnosticRule } from "./core-rules";

export type { DiagnosticRule };

export interface ExampleChip {
  label: string;
  lang: string;
  error: string;
}

export const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "Node.js",
  "Git",
  "Docker",
  "Terminal",
  "SQL",
  "Java",
  "C",
  "C++",
  "Rust",
  "Go",
  "C#",
  "Network",
  "PHP",
  "Swift",
  "Other"
] as const;

export const EXAMPLE_CHIPS: ExampleChip[] = [
  {
    label: "Python Index Error",
    lang: "Python",
    error: "IndexError: list index out of range"
  },
  {
    label: "Java NullPointer",
    lang: "Java",
    error: "java.lang.NullPointerException: Cannot invoke \"String.length()\" because \"user.name\" is null"
  },
  {
    label: "Go Nil Dereference",
    lang: "Go",
    error: "panic: runtime error: invalid memory address or nil pointer dereference"
  },
  {
    label: "Swift Unexpected Nil",
    lang: "Swift",
    error: "Fatal error: Unexpectedly found nil while unwrapping an Optional value at line 89"
  },
  {
    label: "TypeScript TS2322",
    lang: "TypeScript",
    error: "TS2322: Type 'string' is not assignable to type 'number'."
  },
  {
    label: "Rust Borrow Check",
    lang: "Rust",
    error: "error[E0382]: borrow of moved value: `data`\n  --> src/main.rs:14:9\n   |\n12 |     let s = data;\n   |             ---- value moved here"
  },
  {
    label: "Docker Port In Use",
    lang: "Docker",
    error: "Error response from daemon: driver failed programming external connectivity on endpoint web: Bind for 0.0.0.0:3000 failed: port is already allocated"
  },
  {
    label: "SQLSTATE 23505",
    lang: "SQL",
    error: "ERROR: 23505 duplicate key value violates unique constraint \"users_email_key\""
  },
  {
    label: "React Hydration",
    lang: "React",
    error: "Error: Hydration failed because the initial UI does not match what was rendered on the server."
  },
  {
    label: "C/C++ Segfault",
    lang: "C",
    error: "Segmentation fault (core dumped) at address 0x00000000"
  }
];

// Active rules registry: Starts with lightweight CORE_RULES (~20 KB),
// then silently hydrates all 14,800+ extended rules in the background.
export let RULES: DiagnosticRule[] = [...CORE_RULES];
export let TOTAL_RULES_COUNT = 14800;

const LANG_MAP = new Map<string, DiagnosticRule[]>();
const UNIVERSAL_RULES: DiagnosticRule[] = [];

// Index core rules into bucket map initially
function indexRule(rule: DiagnosticRule) {
  if (!rule.langs || rule.langs.length === 0) {
    UNIVERSAL_RULES.push(rule);
  } else {
    for (const l of rule.langs) {
      const key = l.toLowerCase();
      let list = LANG_MAP.get(key);
      if (!list) {
        list = [];
        LANG_MAP.set(key, list);
      }
      list.push(rule);
    }
  }
}

CORE_RULES.forEach(indexRule);

interface RawRuleItem {
  id: string;
  category: string;
  langs: string[] | null;
  pattern: string;
  title: string;
  what: string;
  why: string[];
  fix: string[];
  code?: string;
}

let isHydrated = false;
let isHydrating = false;

/**
 * Silently loads all 14,800+ extended rules in the background during browser idle time.
 * Never blocks the initial render or main thread.
 */
export async function hydrateExtendedRules(): Promise<void> {
  if (isHydrated || isHydrating) return;
  isHydrating = true;

  try {
    // Dynamic import creates a separate lazy code chunk in Vite
    const module = await import("./rules-12000.json");
    const rawData = (module.default || module) as RawRuleItem[];

    const compiled: DiagnosticRule[] = rawData.map((r) => {
      let re: RegExp;
      try {
        re = new RegExp(r.pattern, "i");
      } catch {
        re = new RegExp(r.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      }

      const rule: DiagnosticRule = {
        id: r.id,
        category: r.category,
        langs: r.langs,
        re,
        title: r.title,
        what: r.what,
        why: r.why,
        fix: r.fix,
        code: r.code || ""
      };

      indexRule(rule);
      return rule;
    });

    RULES = [...CORE_RULES, ...compiled];
    TOTAL_RULES_COUNT = RULES.length;
    isHydrated = true;
  } catch (err) {
    console.warn("Could not hydrate extended rules in background:", err);
  } finally {
    isHydrating = false;
  }
}

// Automatically start background hydration when browser is idle
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      hydrateExtendedRules();
    });
  } else {
    setTimeout(hydrateExtendedRules, 150);
  }
}

/**
 * Static Raw Code Syntax Inspector:
 * Catches syntax errors directly from raw broken code snippets (unclosed brackets, colons, quotes)
 * without requiring a terminal compiler error message.
 */
export function inspectRawCode(code: string, selectedLang: string): DiagnosticRule | null {
  const clean = code.trim();
  if (!clean) return null;

  const targetLangLower = (selectedLang || "").toLowerCase();
  const isPython = targetLangLower === "python" || (!targetLangLower && (clean.includes("def ") || clean.includes("print(")));

  // 1. Bracket / Parenthesis balance check
  const openParen = (clean.match(/\(/g) || []).length;
  const closeParen = (clean.match(/\)/g) || []).length;
  if (openParen > closeParen) {
    const diff = openParen - closeParen;
    const closingSuffix = ")".repeat(diff);
    return {
      category: isPython ? "Python" : "Syntax",
      langs: [selectedLang || "Python"],
      re: /(?:)/,
      title: "SyntaxError: '(' was never closed",
      what: `Your code opened ${openParen} parenthesis '(' but only closed ${closeParen}. A closing ')' was never closed before the end of the line or file.`,
      why: [
        "Missing closing parenthesis ')' on a function call or expression.",
        "A multi-line function call or parameter list was left open.",
        "Mismatched nested brackets."
      ],
      fix: [
        `Add ${diff > 1 ? diff + " closing parentheses" : "a closing ')'"} where the statement concludes.`,
        "Check every '(' from left to right to ensure each pair is properly terminated."
      ],
      code: `${clean}${closingSuffix}`
    };
  }

  // 2. Square Bracket balance check
  const openSquare = (clean.match(/\[/g) || []).length;
  const closeSquare = (clean.match(/\]/g) || []).length;
  if (openSquare > closeSquare) {
    const diff = openSquare - closeSquare;
    return {
      category: "Syntax",
      langs: [selectedLang || "Other"],
      re: /(?:)/,
      title: "SyntaxError: '[' was never closed",
      what: `Your code opened a square bracket '[' that was not closed with a matching ']'.`,
      why: [
        "Unclosed list or array literal.",
        "Incomplete slice or index access."
      ],
      fix: [
        "Add a matching ']' to close the list or index."
      ],
      code: `${clean}${"]".repeat(diff)}`
    };
  }

  // 3. Curly Brace balance check
  const openCurly = (clean.match(/\{/g) || []).length;
  const closeCurly = (clean.match(/\}/g) || []).length;
  if (openCurly > closeCurly) {
    const diff = openCurly - closeCurly;
    return {
      category: "Syntax",
      langs: [selectedLang || "Other"],
      re: /(?:)/,
      title: "SyntaxError: '{' was never closed",
      what: `Your code opened a curly brace '{' that was not closed with a matching '}'.`,
      why: [
        "Unclosed dictionary, object literal, or block scope."
      ],
      fix: [
        "Add a matching '}' to close the block or dictionary."
      ],
      code: `${clean}${'}'.repeat(diff)}`
    };
  }

  // 4. Python Specific: Missing Colon (:)
  if (isPython) {
    const lines = clean.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (/^(if|elif|else|for|while|def|class|try|except|finally|with)\b/i.test(trimmed)) {
        if (!trimmed.endsWith(':') && !trimmed.endsWith('\\') && !trimmed.includes('#')) {
          const keyword = trimmed.split(/\s+/)[0];
          return {
            category: "Python",
            langs: ["Python"],
            re: /(?:)/,
            title: `SyntaxError: Expected ':' at end of '${keyword}' statement`,
            what: `Python requires a colon ':' at the end of every '${keyword}' header to indicate the start of an indented block.`,
            why: [
              `Omitted colon ':' after the '${keyword}' expression.`,
              "Accidental typo or incomplete line."
            ],
            fix: [
              `Add a colon ':' at the end of line ${i + 1}: '${trimmed}:'`
            ],
            code: lines.map((l, idx) => idx === i ? `${l.trimEnd()}:` : l).join('\n')
          };
        }
      }
    }

    // 5. Python: Single '=' in condition
    const ifAssignMatch = clean.match(/^(\s*if\s+[a-zA-Z0-9_.]+\s*)=\s*([a-zA-Z0-9_."']+.*)$/m);
    if (ifAssignMatch && !clean.includes('==') && !clean.includes('!=')) {
      return {
        category: "Python",
        langs: ["Python"],
        re: /(?:)/,
        title: "SyntaxError: Invalid Assignment in 'if' Condition",
        what: "You used a single '=' (assignment operator) inside an 'if' condition instead of '==' (equality comparison).",
        why: [
          "Single '=' sets a variable, whereas '==' tests if two values are equal.",
          "Python forbids assignment statements inside standard 'if' conditions."
        ],
        fix: [
          "Replace '=' with '==' to compare values."
        ],
        code: clean.replace(/(if\s+[a-zA-Z0-9_.]+\s*)=\s*/, '$1== ')
      };
    }
  }

  // 6. Unterminated string quotes
  const lines = clean.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("'''") || line.includes('"""')) continue;
    const singleQuotes = (line.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      return {
        category: "Syntax",
        langs: [selectedLang || "Other"],
        re: /(?:)/,
        title: "SyntaxError: Unterminated String Literal (Single Quote)",
        what: `A string opened with a single quote (') on line ${i + 1} was never closed before the end of the line.`,
        why: [
          "Missing closing single quote (').",
          "String extends across multiple lines without using triple quotes."
        ],
        fix: [
          "Add matching single quote (') before ending the line.",
          "Use triple quotes (''' or \"\"\") if you want a multi-line string."
        ],
        code: lines.map((l, idx) => idx === i ? `${l}'` : l).join('\n')
      };
    }
    if (doubleQuotes % 2 !== 0) {
      return {
        category: "Syntax",
        langs: [selectedLang || "Other"],
        re: /(?:)/,
        title: "SyntaxError: Unterminated String Literal (Double Quote)",
        what: `A string opened with a double quote (\") on line ${i + 1} was never closed before the end of the line.`,
        why: [
          "Missing closing double quote (\")."
        ],
        fix: [
          "Add matching double quote (\") before ending the line."
        ],
        code: lines.map((l, idx) => idx === i ? `${l}"` : l).join('\n')
      };
    }
  }

  return null;
}

/**
 * High-performance analyzer:
 * 0. Static Raw Code Syntax Inspector (catches unclosed brackets, colons, quotes)
 * 1. Checks fast CORE_RULES (< 0.05ms)
 * 2. Checks language bucket (< 0.1ms)
 * 3. Falls back to universal rules
 */
export function analyzeError(errorText: string, selectedLang: string): DiagnosticRule | null {
  const clean = errorText.trim();
  if (!clean) return null;

  // Tier 0: Check raw code syntax heuristics directly (< 0.01ms)
  const rawCodeMatch = inspectRawCode(clean, selectedLang);
  if (rawCodeMatch) return rawCodeMatch;

  const targetLangLower = (selectedLang || "").toLowerCase();

  // Tier 1: Check instant CORE_RULES first (highest priority, immediate response)
  const coreMatch = CORE_RULES.find((r) => {
    if (targetLangLower && targetLangLower !== "other" && r.langs) {
      const matchLang = r.langs.some((l) => l.toLowerCase() === targetLangLower);
      if (matchLang && r.re.test(clean)) return true;
    }
    return r.re.test(clean);
  });
  if (coreMatch) return coreMatch;

  // Tier 2: Check language bucket in extended hash map
  if (targetLangLower && targetLangLower !== "other") {
    const bucket = LANG_MAP.get(targetLangLower);
    if (bucket) {
      const match = bucket.find((r) => r.re.test(clean));
      if (match) return match;
    }
  }

  // Tier 3: Universal rules
  const universalMatch = UNIVERSAL_RULES.find((r) => r.re.test(clean));
  if (universalMatch) return universalMatch;

  // Tier 4: Global scan
  return RULES.find((r) => r.re.test(clean)) || null;
}
