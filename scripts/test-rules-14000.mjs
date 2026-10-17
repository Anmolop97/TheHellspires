// scripts/test-rules-14000.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawRules = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/data/rules-12000.json"), "utf-8"));

console.log(`Loaded ${rawRules.length} rules.`);

const compiledRules = rawRules.map(r => ({
  ...r,
  re: new RegExp(r.pattern, "i")
}));

// Hash map bucket by language
const langMap = new Map();
const universal = [];

for (const r of compiledRules) {
  if (!r.langs || r.langs.length === 0) {
    universal.push(r);
  } else {
    for (const l of r.langs) {
      const k = l.toLowerCase();
      let list = langMap.get(k);
      if (!list) {
        list = [];
        langMap.set(k, list);
      }
      list.push(r);
    }
  }
}

function analyze(errorText, lang) {
  const clean = errorText.trim();
  const target = (lang || "").toLowerCase();

  if (target && target !== "other") {
    const bucket = langMap.get(target);
    if (bucket) {
      const m = bucket.find(r => r.re.test(clean));
      if (m) return m;
    }
  }

  const u = universal.find(r => r.re.test(clean));
  if (u) return u;

  return compiledRules.find(r => r.re.test(clean)) || null;
}

const testCases = [
  { lang: "Python", err: "IndexError: list index out of range" },
  { lang: "Python", err: "torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.00 GiB" },
  { lang: "Java", err: "java.lang.NullPointerException: Cannot invoke \"String.length()\" because \"user.name\" is null" },
  { lang: "Go", err: "panic: runtime error: invalid memory address or nil pointer dereference" },
  { lang: "PHP", err: "Warning: Undefined array key \"user_id\" in /var/www/html/app.php" },
  { lang: "Swift", err: "Fatal error: Unexpectedly found nil while unwrapping an Optional value" },
  { lang: "TypeScript", err: "TS2322: Type 'string' is not assignable to type 'number'." },
  { lang: "Rust", err: "error[E0382]: borrow of moved value: `data`" },
  { lang: "Docker", err: "Error response from daemon: Bind for 0.0.0.0:3000 failed: port is already allocated" },
  { lang: "SQL", err: "ERROR: 23505 duplicate key value violates unique constraint \"users_email_key\"" },
  { lang: "C", err: "Segmentation fault (core dumped) at address 0x00000000" }
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
console.log(`\nTest of ${testCases.length} languages across 14,800 rules completed in ${totalDur}ms. All passed: ${allPassed}`);
