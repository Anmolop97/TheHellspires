// scripts/test-rules.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawRules = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/data/rules-1000.json"), "utf-8"));

console.log(`Loaded ${rawRules.length} rules.`);

const compiledRules = rawRules.map(r => ({
  ...r,
  re: new RegExp(r.pattern, "i")
}));

function analyze(errorText, lang) {
  const clean = errorText.trim();
  const target = (lang || "").toLowerCase();

  // Tier 1: Lang match
  if (target && target !== "other") {
    const m = compiledRules.find(r => r.langs && r.langs.some(l => l.toLowerCase() === target) && r.re.test(clean));
    if (m) return m;
  }

  // Tier 2: Universal
  const u = compiledRules.find(r => (!r.langs || r.langs.length === 0) && r.re.test(clean));
  if (u) return u;

  // Tier 3: All
  return compiledRules.find(r => r.re.test(clean)) || null;
}

const testCases = [
  { lang: "JavaScript", err: "TypeError: Cannot read properties of undefined (reading 'name')" },
  { lang: "Python", err: "IndexError: list index out of range" },
  { lang: "React", err: "Error: Hydration failed because the initial UI does not match what was rendered on the server." },
  { lang: "Git", err: "error: failed to push some refs to 'origin'. Updates were rejected because the remote contains work that you do not have locally." },
  { lang: "Docker", err: "Error response from daemon: driver failed programming external connectivity on endpoint web: Bind for 0.0.0.0:3000 failed: port is already allocated" },
  { lang: "SQL", err: "ERROR: duplicate key value violates unique constraint \"users_email_key\"" },
  { lang: "Java", err: "java.lang.NullPointerException: Cannot invoke \"String.length()\" because \"user.name\" is null" },
  { lang: "C", err: "Segmentation fault (core dumped) at address 0x00000000" },
  { lang: "Rust", err: "error[E0382]: borrow of moved value: `data`" },
  { lang: "Network", err: "HTTP 429 Too Many Requests: Rate limit exceeded" }
];

let allPassed = true;
const t0 = performance.now();

for (const tc of testCases) {
  const start = performance.now();
  const res = analyze(tc.err, tc.lang);
  const dur = (performance.now() - start).toFixed(3);
  if (!res) {
    console.error(`❌ FAILED to match: [${tc.lang}] ${tc.err.slice(0, 50)}...`);
    allPassed = false;
  } else {
    console.log(`✅ MATCHED in ${dur}ms: [${tc.lang}] -> "${res.title}" (${res.category})`);
  }
}

const totalDur = (performance.now() - t0).toFixed(2);
console.log(`\nTest completed in ${totalDur}ms. All passed: ${allPassed}`);
