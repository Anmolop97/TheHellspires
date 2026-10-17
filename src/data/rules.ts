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
 * High-performance analyzer:
 * 1. Checks fast CORE_RULES (< 0.05ms)
 * 2. Checks language bucket (< 0.1ms)
 * 3. Falls back to universal rules
 */
export function analyzeError(errorText: string, selectedLang: string): DiagnosticRule | null {
  const clean = errorText.trim();
  if (!clean) return null;

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
