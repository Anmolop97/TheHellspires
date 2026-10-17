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

  // 0. Include / Header / Import Syntax Check
  if (clean.includes("#include")) {
    const isCSharp = targetLangLower === "c#" || targetLangLower === "csharp";
    const hasStudioTypo = clean.includes("studio.h");

    if (hasStudioTypo) {
      if (isCSharp) {
        return {
          category: "C#",
          langs: ["C#"],
          re: /(?:)/,
          title: "C# CS1024: Invalid Directive '#include <studio.h>'",
          what: "C# does not support C/C++ '#include' directives. Additionally, '<studio.h>' is a classic typo for '<stdio.h>'. In C#, standard I/O is provided by the 'System' namespace using the 'using' directive.",
          why: [
            "Attempted to use C/C++ preprocessor syntax in a C# source file.",
            "'<studio.h>' is a misspelling of the standard C library '<stdio.h>'.",
            "In C#, console and stream operations belong to 'using System;' or 'using System.IO;'."
          ],
          fix: [
            "Replace '#include <studio.h>' with 'using System;' at the top of the file.",
            "If you meant to write C or C++, switch the language dropdown to 'C' or 'C++' and use '#include <stdio.h>'."
          ],
          code: `// C# uses the 'using' directive, not '#include'\nusing System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("C# standard I/O working!");\n    }\n}`
        };
      } else {
        return {
          category: "C / C++",
          langs: ["C", "C++"],
          re: /(?:)/,
          title: "C/C++ Fatal Error: studio.h: No Such File or Directory",
          what: "Header file '<studio.h>' does not exist. This is a common typographical mistake for '<stdio.h>' (Standard Input/Output).",
          why: [
            "Typo in header name: typed 'studio.h' with an extra 'u' instead of 'stdio.h'.",
            "The compiler cannot locate 'studio.h' in the include search paths and halts compilation."
          ],
          fix: [
            "Change '#include <studio.h>' to '#include <stdio.h>'."
          ],
          code: `#include <stdio.h>\n\nint main(void) {\n    printf("Standard I/O working properly!\\n");\n    return 0;\n}`
        };
      }
    }

    if (isCSharp) {
      return {
        category: "C#",
        langs: ["C#"],
        re: /(?:)/,
        title: "C# CS1024: Preprocessor Directive '#include' Not Found",
        what: "'#include' is a C/C++ preprocessor directive that does not exist in C#. In C#, libraries and namespaces are referenced with the 'using' keyword.",
        why: [
          "Imported C/C++ header syntax into a C# source file.",
          "C# assemblies and BCL namespaces require 'using Namespace;'."
        ],
        fix: [
          "Replace '#include' statements with 'using System;' or 'using System.IO;'."
        ],
        code: `using System;\nusing System.Collections.Generic;\nusing System.IO;`
      };
    }

    if (targetLangLower === "python") {
      return {
        category: "Python",
        langs: ["Python"],
        re: /(?:)/,
        title: "Python SyntaxError: '#include' is Not a Python Keyword",
        what: "Python uses 'import module_name' instead of C-style '#include'.",
        why: [
          "Using C/C++ preprocessor syntax in a Python script."
        ],
        fix: [
          "Use 'import sys' or 'import os' to import standard libraries."
        ],
        code: `import sys\nimport os\n\nprint("Python standard library working!")`
      };
    }

    if (targetLangLower === "java") {
      return {
        category: "Java",
        langs: ["Java"],
        re: /(?:)/,
        title: "Java SyntaxError: '#include' is Invalid in Java",
        what: "Java uses the 'import package.Class;' statement to import libraries, not '#include'.",
        why: [
          "Using C/C++ preprocessor syntax in Java."
        ],
        fix: [
          "Replace '#include' with 'import java.util.*;' or 'import java.io.*;'."
        ],
        code: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Java working!");\n    }\n}`
      };
    }
  }

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

function getLanguageDefensiveCode(lang: string, identifier: string | null): string {
  const l = (lang || '').toLowerCase();
  const id = identifier || 'data';

  if (l.includes('c#') || l.includes('csharp')) {
    return `// C# Null Guard & Defensive Handling\nif (${id} != null) {\n    Console.WriteLine(${id}.ToString());\n} else {\n    Console.WriteLine("[Guard] ${id} was null");\n}`;
  }
  if (l === 'c') {
    return `// C Memory & Pointer Check\nif (${id} != NULL) {\n    printf("Valid reference\\n");\n} else {\n    fprintf(stderr, "[Error] Null pointer dereference\\n");\n}`;
  }
  if (l.includes('c++') || l.includes('cpp')) {
    return `// C++ Nullptr Guard\nif (${id} != nullptr) {\n    std::cout << "Valid reference" << std::endl;\n} else {\n    std::cerr << "[Error] nullptr access" << std::endl;\n}`;
  }
  if (l.includes('python')) {
    return `# Python Guard Clause\nif ${id} is not None:\n    print(f"Value: {${id}}")\nelse:\n    print("[Guard] ${id} was None")`;
  }
  if (l.includes('java')) {
    return `// Java Null Guard\nif (${id} != null) {\n    System.out.println(${id}.toString());\n} else {\n    System.err.println("[Guard] ${id} was null");\n}`;
  }
  if (l.includes('go')) {
    return `// Go Nil Check\nif ${id} != nil {\n    fmt.Println(${id})\n} else {\n    log.Println("[Guard] ${id} is nil")\n}`;
  }
  if (l.includes('rust')) {
    return `// Rust Option Matching\nif let Some(val) = ${id} {\n    println!("Value: {:?}", val);\n} else {\n    eprintln!("[Guard] ${id} was None");\n}`;
  }
  return `// Safe Navigation & Guard\nconst safeVal = ${id}?.property ?? 'default';\nif (!${id}) {\n  console.warn('[Guard] ${id} was undefined or null');\n}`;
}

/**
 * Dynamic Intelligent Synthesizer:
 * Analyzes uncataloged errors, stack traces, and snippets dynamically.
 * Extracts error class, failed property/variable, origin file/line, and constructs actionable diagnosis.
 */
export function synthesizeDynamicRule(input: string, selectedLang: string): DiagnosticRule {
  const clean = input.trim();
  const firstLine = clean.split('\n')[0].trim();
  const lang = selectedLang || 'General';

  // 1. Detect error name & message
  const errorMatch = clean.match(/([a-zA-Z0-9_.]*(?:Error|Exception|Panic|Fault|Violation|Failure|Warning))(?::|\s+-|\s+failed)?\s*(.*)/i);
  const errorType = errorMatch ? errorMatch[1].trim() : 'Runtime Exception';
  const errorMessage = errorMatch && errorMatch[2] ? errorMatch[2].trim() : firstLine;

  // 2. Detect property / identifier if any
  const identifierMatch = clean.match(/(?:reading|property|variable|identifier|symbol|field|module|import)\s+['"`]([a-zA-Z0-9_$]+)['"`]/i)
    || clean.match(/['"`]([a-zA-Z0-9_$]+)['"`]\s+(?:is not defined|was not found|cannot be accessed|is null)/i);
  const identifier = identifierMatch ? identifierMatch[1] : null;

  // 3. Detect file & line location
  const locationMatch = clean.match(/(?:at\s+|File\s+["']?|in\s+)([a-zA-Z0-9_./\\-]+\.[a-zA-Z0-9]+)(?::|,\s*line\s*)(\d+)/i);
  const location = locationMatch ? `${locationMatch[1]} (line ${locationMatch[2]})` : null;

  // 4. Tailor explanation
  let what = `The runtime encountered a '${errorType}' during execution.`;
  if (errorMessage && errorMessage !== errorType) {
    what += ` ${errorMessage.length > 120 ? errorMessage.slice(0, 120) + '...' : errorMessage}.`;
  }
  if (location) {
    what += ` Originates at: ${location}.`;
  }

  const why: string[] = [];
  const fix: string[] = [];
  let codeSnippet = '';

  if (/null|undefined|nil|none/i.test(clean)) {
    why.push(
      identifier ? `The object or pointer holding '${identifier}' is null/undefined at runtime.` : 'A variable reference evaluated to null or undefined prior to member property access.',
      'Asynchronous data or API response has not completed resolving before rendering.',
      'Upstream data payload was empty, malformed, or missing the expected key.'
    );
    fix.push(
      identifier ? `Use optional chaining: 'object?.${identifier}' to guard against missing properties.` : 'Add optional chaining (?.) on nested object chains.',
      'Verify that upstream promises/async calls are properly awaited before access.',
      'Provide a fallback default value or assert state truthiness before processing.'
    );
    codeSnippet = identifier 
      ? `// 1. Safe access with optional chaining\nconst safeValue = data?.${identifier} ?? 'default';\n\n// 2. Defensive assertion guard\nif (!data || !data.${identifier}) {\n  console.warn('[Guard] Missing ${identifier}');\n  return;\n}`
      : `// Add defensive null check before execution\nif (targetObject == null) {\n  return;\n}\nconst result = targetObject?.property;`;
  } else if (/syntax|unexpected|parse/i.test(errorType) || /syntax/i.test(clean)) {
    why.push(
      'A token or character violates language grammar rules.',
      'Unclosed bracket, parenthesis, or quotation mark within the file.',
      'Language feature is not supported by the current compiler or execution target.'
    );
    fix.push(
      'Inspect the line indicated by the stack trace for unclosed delimiters.',
      'Check bracket balance throughout the affected scope.',
      'Ensure compiler / transpiler target aligns with the syntax features used.'
    );
    codeSnippet = `// Ensure all blocks and parentheses are properly terminated\ntry {\n  executeStatement();\n} catch (err) {\n  console.error('Syntax/Parse failure handled:', err);\n}`;
  } else if (/reference|not defined|unresolved|symbol/i.test(errorType) || /not defined/i.test(clean)) {
    why.push(
      identifier ? `'${identifier}' was referenced before declaration or is outside the current scope.` : 'Identifier was called before declaration or import.',
      'Missing import statement from another module.',
      'Typo in variable or function naming.'
    );
    fix.push(
      identifier ? `Ensure '${identifier}' is declared and imported in this module.` : 'Verify variable spelling and module scope visibility.',
      'Check that the export exists in the target dependency.',
      'Initialize variable with a default value before referencing.'
    );
    codeSnippet = identifier
      ? `// Ensure variable is imported or declared\nimport { ${identifier} } from './module';\n\n// Or declare in scope\nconst ${identifier} = initialValue;`
      : `// Ensure variable is initialized before calling\nconst myVar = initialValue;\nconsole.log(myVar);`;
  } else if (/cors|network|fetch|http|404|500/i.test(clean)) {
    why.push(
      'Cross-Origin Resource Sharing (CORS) headers missing on destination server.',
      'Endpoint URL is unreachable, offline, or returned a server error status code.',
      'Network request timed out or was blocked by browser security policy.'
    );
    fix.push(
      'Configure "Access-Control-Allow-Origin: *" on your backend server.',
      'Use a local development proxy (e.g. Vite proxy) to bypass CORS restrictions.',
      'Verify target URL, HTTP method, and network connectivity.'
    );
    codeSnippet = `// Backend (Express.js example)\napp.use((req, res, next) => {\n  res.header("Access-Control-Allow-Origin", "*");\n  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");\n  next();\n});`;
  } else {
    why.push(
      `Runtime or compilation invariant violation in ${lang}.`,
      'Input arguments do not conform to expected parameter types or compiler directives.',
      'Unhandled boundary condition or invalid statement.'
    );
    fix.push(
      `Verify syntax rules and library imports specific to ${lang}.`,
      'Wrap high-risk operations in defensive assertion guards.',
      'Check compiler / runtime error logs for precise stack trace origin.'
    );
    codeSnippet = getLanguageDefensiveCode(lang, identifier);
  }

  const generatedTitle = errorMatch 
    ? `${errorType}: ${errorMessage.slice(0, 50)}`
    : (firstLine.startsWith('#') || firstLine.startsWith('import') || firstLine.startsWith('using'))
      ? `${lang} Directive / Import Error: ${firstLine.slice(0, 45)}`
      : `Error: ${firstLine.slice(0, 50)}`;

  return {
    category: lang,
    langs: [lang],
    re: /(?:)/,
    title: generatedTitle,
    what,
    why,
    fix,
    code: codeSnippet
  };
}

/**
 * High-performance analyzer:
 * 0. Static Raw Code Syntax Inspector (catches unclosed brackets, colons, quotes)
 * 1. Checks fast CORE_RULES (< 0.05ms)
 * 2. Checks language bucket (< 0.1ms)
 * 3. Falls back to universal rules
 * 4. Global pre-compiled scan
 * 5. Dynamic Intelligent Synthesizer (never leaves the user hanging with null)
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
  const globalMatch = RULES.find((r) => r.re.test(clean));
  if (globalMatch) return globalMatch;

  // Tier 5: Dynamic Intelligent Synthesizer for any custom/uncataloged error
  return synthesizeDynamicRule(clean, selectedLang);
}

