// src/data/core-rules.ts
// Core iconic rules loaded synchronously for instantaneous (< 50ms) page loads (~20 KB)

export interface DiagnosticRule {
  id?: string;
  category?: string;
  langs: string[] | null;
  re: RegExp;
  title: string;
  what: string;
  why: string[];
  fix: string[];
  code?: string;
}

export const CORE_RULES: DiagnosticRule[] = [
  // 1. JavaScript & TypeScript
  {
    id: "core-js-1",
    category: "JavaScript",
    langs: ["JavaScript", "TypeScript", "React", "Node.js"],
    re: /cannot read propert(y|ies) of (undefined|null)|reading ['"`].+['"`]/i,
    title: "Reading Property from Undefined or Null",
    what: "Your code attempted to access a property or method on a variable that currently holds null or undefined.",
    why: [
      "The variable was never assigned or initialized.",
      "An asynchronous API request or database query returned null or undefined.",
      "A component rendered before data finished fetching.",
      "Object structure or key name mismatch (e.g. data.user vs data.profile)."
    ],
    fix: [
      "Use optional chaining (`user?.profile?.name`) to safely navigate nested properties.",
      "Provide a fallback using nullish coalescing (`user?.name ?? 'Guest'`).",
      "In React, add conditional guard clauses or loading skeletons before rendering."
    ],
    code: `const displayName = user?.profile?.name ?? "Anonymous";`
  },
  {
    id: "core-js-2",
    category: "JavaScript",
    langs: ["JavaScript", "TypeScript", "Node.js"],
    re: /\b(\w+) is not defined|ReferenceError/i,
    title: "Variable / Identifier is Not Defined",
    what: "The JavaScript runtime cannot find the variable or function identifier in the current execution scope.",
    why: [
      "Typo or casing mismatch in the variable name.",
      "Variable was declared with let/const inside a different block scope.",
      "Missing module import or incorrect export name."
    ],
    fix: [
      "Verify exact spelling and case sensitivity.",
      "Declare the variable using `const` or `let` before referencing it.",
      "Check your import statement at the top of the file."
    ],
    code: `import { calculateTotal } from "./utils";\nconst total = calculateTotal(items);`
  },
  {
    id: "core-js-3",
    category: "JavaScript",
    langs: ["JavaScript", "TypeScript"],
    re: /is not a function|not callable/i,
    title: "Value is Not a Function",
    what: "You attempted to invoke parenthesis `()` on a value that is an object, string, number, or undefined instead of a callable function.",
    why: [
      "Misspelled method name (e.g., .tolocaleLowerCase() vs .toLocaleLowerCase()).",
      "Import default vs named export mismatch.",
      "A variable with the same name shadowed or overwrote the function."
    ],
    fix: [
      "Check `typeof target` with console.log before invoking it.",
      "Verify the library or object actually exports that function."
    ],
    code: `if (typeof candidateMethod === "function") {\n  candidateMethod();\n}`
  },
  {
    id: "core-js-4",
    category: "JavaScript",
    langs: ["JavaScript", "TypeScript"],
    re: /assignment to constant variable|constant variable/i,
    title: "Attempted Reassignment to a Const Variable",
    what: "A variable declared with `const` cannot be reassigned with `=`.",
    why: [
      "The variable needs to change over time (e.g., a counter in a loop).",
      "Confusing value mutation with variable rebinding."
    ],
    fix: [
      "Change `const` to `let` if the identifier itself must be reassigned.",
      "If modifying an object or array, mutate its properties instead."
    ],
    code: `let counter = 0;\ncounter += 1;`
  },
  {
    id: "core-js-5",
    category: "JavaScript",
    langs: ["JavaScript", "TypeScript", "Node.js"],
    re: /maximum call stack size exceeded|too much recursion/i,
    title: "Maximum Call Stack Exceeded (Infinite Recursion)",
    what: "A function called itself repeatedly without hitting a termination condition.",
    why: [
      "Missing or unreachable base case in a recursive algorithm.",
      "Triggering a state setter inside a React useEffect without dependency guards."
    ],
    fix: [
      "Add a strict base case at the top of the recursive function.",
      "Check React useEffect dependency arrays for infinite update loops."
    ],
    code: `function countdown(n: number) {\n  if (n <= 0) return;\n  countdown(n - 1);\n}`
  },
  {
    id: "core-js-6",
    category: "JavaScript",
    langs: ["JavaScript", "TypeScript", "Node.js"],
    re: /unexpected token|unexpected end of (json )?input|json.parse|is not valid json/i,
    title: "JSON Parsing / Syntax Failure",
    what: "The JSON parser received malformed text or empty content that does not conform to valid JSON.",
    why: [
      "An API returned an HTML error page (404/500) instead of JSON.",
      "Trailing commas, unquoted keys, or single quotes in raw JSON data."
    ],
    fix: [
      "Inspect raw text with `await response.text()` before parsing with `.json()`.",
      "Wrap parsing in a `try...catch` block to handle unexpected server payloads."
    ],
    code: `const raw = await response.text();\nif (!response.ok) throw new Error(\`Server error: \${raw}\`);\nconst data = JSON.parse(raw);`
  },
  {
    id: "core-ts-1",
    category: "TypeScript",
    langs: ["TypeScript"],
    re: /ts2322|type '.*' is not assignable to type '.*'/i,
    title: "TypeScript TS2322: Type Is Not Assignable",
    what: "A variable or property was assigned a value whose type violates its declared type annotation.",
    why: [
      "Passed incompatible data structure or unexpected null/undefined.",
      "Type narrowing missing before assignment."
    ],
    fix: [
      "Align the types using union types (string | number).",
      "Use type guards or type assertions where appropriate."
    ],
    code: `let id: string | number = 42;`
  },

  // 2. Python & ML
  {
    id: "core-py-1",
    category: "Python",
    langs: ["Python"],
    re: /indentationerror|unexpected indent|unindent does not match/i,
    title: "Python Indentation Mismatch",
    what: "Python uses indentation to delimit code blocks, and the current line violates the expected spacing level.",
    why: [
      "Mixed tabs and spaces in the file.",
      "A code block following `if`, `def`, `for`, or `class` was not indented."
    ],
    fix: [
      "Standardize on 4 spaces per indentation level.",
      "Configure your editor to convert tabs to spaces automatically."
    ],
    code: `def process_records(records):\n    for item in records:\n        print(item)  # Exactly 4 spaces`
  },
  {
    id: "core-py-2",
    category: "Python",
    langs: ["Python"],
    re: /nameerror|name '.+' is not defined/i,
    title: "Python NameError: Identifier Not Defined",
    what: "Python cannot locate the specified variable, function, or module in the local or global namespace.",
    why: [
      "Misspelling or casing difference.",
      "Forgot to import a module from the standard library or third-party package."
    ],
    fix: [
      "Double-check spelling and character casing.",
      "Add the import statement at the top of the script."
    ],
    code: `import math\nresult = math.sqrt(25)`
  },
  {
    id: "core-py-3",
    category: "Python",
    langs: ["Python"],
    re: /indexerror|list index out of range|string index out of range/i,
    title: "IndexError: Sequence Index Out of Range",
    what: "The code attempted to access an index position beyond the sequence's boundaries.",
    why: [
      "The list or string is empty (`len == 0`).",
      "Off-by-one error (remember indexes start at 0, max index is `len - 1`)."
    ],
    fix: [
      "Check `if items:` before indexing into a list.",
      "Use safe slicing (`items[:1]`) or Python's built-in `in` iteration."
    ],
    code: `if items:\n    first_item = items[0]`
  },
  {
    id: "core-py-4",
    category: "Python",
    langs: ["Python"],
    re: /keyerror/i,
    title: "KeyError: Dictionary Key Not Found",
    what: "Attempted to access a dictionary key that does not exist in the dictionary.",
    why: [
      "Key is missing from API or input payload.",
      "Typo in key string."
    ],
    fix: [
      "Use `.get(key, default)` method to provide a safe fallback.",
      "Check `if key in my_dict:` before accessing directly."
    ],
    code: `user_email = user_dict.get("email", "no-reply@example.com")`
  },
  {
    id: "core-py-5",
    category: "Python",
    langs: ["Python"],
    re: /cuda out of memory|out of memory.*tried to allocate/i,
    title: "PyTorch CUDA Out of Memory (GPU OOM)",
    what: "Your model, tensors, and batch activations exceeded the GPU VRAM capacity.",
    why: [
      "Batch size is too large for the available GPU VRAM.",
      "Tensors accumulating in computational graph without .detach()."
    ],
    fix: [
      "Reduce training batch size (e.g. from 64 to 32 or 16).",
      "Use torch.cuda.empty_cache() and wrap evaluation in 'with torch.no_grad():'."
    ],
    code: `with torch.no_grad():\n    outputs = model(inputs)\ntorch.cuda.empty_cache()`
  },

  // 3. Modern Web (React / Next.js)
  {
    id: "core-react-1",
    category: "React",
    langs: ["React", "JavaScript", "TypeScript"],
    re: /each child in a list should have a unique ["']key["']|unique ["']key["'] prop/i,
    title: "React Missing Unique Key in List",
    what: "React requires a stable `key` prop on every element returned from an array iteration to optimize DOM diffing.",
    why: [
      "Mapped an array of JSX elements without passing the `key` attribute.",
      "Using non-unique values (like array index when items can be reordered)."
    ],
    fix: [
      "Assign a unique database ID or slug to the top-level element inside `.map()`.",
      "Avoid array index as key when list membership can change."
    ],
    code: `{items.map((item) => (\n  <ListItem key={item.id} data={item} />\n))}`
  },
  {
    id: "core-react-2",
    category: "React",
    langs: ["React", "JavaScript", "TypeScript"],
    re: /hydration failed|text content does not match server-rendered html/i,
    title: "React / Next.js Hydration Mismatch Error",
    what: "The HTML rendered on the server did not match the initial HTML rendered by the client browser.",
    why: [
      "Rendering client-only values (like window, localStorage, or Date.now()) during SSR.",
      "Invalid HTML nesting (e.g. <p> containing a <div>)."
    ],
    fix: [
      "Use useEffect or a mounted flag before reading window or localStorage.",
      "Ensure valid HTML tag nesting (no <div> inside <p>)."
    ],
    code: `const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;`
  },

  // 4. Git & Version Control
  {
    id: "core-git-1",
    category: "Git",
    langs: ["Git"],
    re: /updates were rejected because the remote contains work|non-fast-forward/i,
    title: "Git Push Rejected (Non-Fast-Forward)",
    what: "The remote branch has commits that your local branch does not have.",
    why: [
      "Someone else pushed commits to the branch while you were working.",
      "You rebased or amended commits locally that were already pushed."
    ],
    fix: [
      "Run 'git pull --rebase origin <branch>' to incorporate remote changes first.",
      "Resolve any conflicts, then push again."
    ],
    code: `git pull --rebase origin main\ngit push origin main`
  },
  {
    id: "core-git-2",
    category: "Git",
    langs: ["Git"],
    re: /automatic merge failed.*fix conflicts|conflict \(content\)/i,
    title: "Git Merge Conflict",
    what: "Git cannot automatically combine changes because the same lines were modified differently in both branches.",
    why: [
      "Two developers modified the same lines in the same file.",
      "Merging a diverged branch into main."
    ],
    fix: [
      "Open the conflicted files and look for <<<<<<< HEAD markers.",
      "Choose the intended changes and delete the conflict markers.",
      "Run 'git add <file>' and 'git commit' to complete the merge."
    ],
    code: `git add src/index.ts\ngit commit -m "Merge conflict resolved"`
  },

  // 5. Docker & Containers
  {
    id: "core-docker-1",
    category: "Docker",
    langs: ["Docker"],
    re: /port is already allocated|bind: address already in use/i,
    title: "Docker Port Already In Use",
    what: "A container attempted to bind to a host port that is already in use by another service.",
    why: [
      "Another Docker container or local server is running on the same port (e.g. 3000, 5432).",
      "A previous run crashed without cleanly releasing the port."
    ],
    fix: [
      "Find and stop the conflicting process or container.",
      "Map to a different host port: -p 8081:80."
    ],
    code: `docker ps\ndocker stop <old_container_id>`
  },
  {
    id: "core-docker-2",
    category: "Docker",
    langs: ["Docker", "DevOps"],
    re: /crashloopbackoff/i,
    title: "Kubernetes Pod CrashLoopBackOff",
    what: "A container in the pod keeps starting, crashing, and restarting repeatedly in an exponential back-off loop.",
    why: [
      "Application threw an uncaught startup exception.",
      "Missing environment variable or mounted config secret.",
      "Liveness probe failed."
    ],
    fix: [
      "Inspect crashing logs: kubectl logs <pod-name> --previous.",
      "Check container exit code with: kubectl describe pod <pod-name>."
    ],
    code: `kubectl logs -f <pod_name> --previous`
  },

  // 6. Java & JVM
  {
    id: "core-java-1",
    category: "Java",
    langs: ["Java"],
    re: /nullpointerexception/i,
    title: "Java NullPointerException (NPE)",
    what: "Java code attempted to invoke a method or access a field on an object reference whose value is null.",
    why: [
      "Object was declared but never instantiated with new.",
      "A method or database query returned null.",
      "Spring dependency injection failed to wire a bean (@Autowired was null)."
    ],
    fix: [
      "Check the exact line number in the stack trace.",
      "Use Optional<T> or explicit null checks.",
      "Ensure Spring beans are registered with @Component or @Service."
    ],
    code: `if (user != null && user.getName() != null) {\n    System.out.println(user.getName().toUpperCase());\n}`
  },

  // 7. C & C++
  {
    id: "core-cpp-1",
    category: "C/C++",
    langs: ["C", "C++"],
    re: /segmentation fault|segfault|access violation/i,
    title: "C/C++ Segmentation Fault (Invalid Memory Access)",
    what: "The program attempted to read or write memory that does not belong to its allocated address space.",
    why: [
      "Dereferencing a NULL or uninitialized pointer.",
      "Buffer overflow: accessing beyond array bounds.",
      "Use-after-free: accessing memory after free() or delete."
    ],
    fix: [
      "Always initialize pointers to NULL or malloc'd addresses.",
      "Compile with AddressSanitizer: gcc -fsanitize=address -g main.c.",
      "Use Valgrind or GDB to locate crashing line."
    ],
    code: `int *ptr = malloc(sizeof(int));\nif (ptr != NULL) {\n    *ptr = 42;\n    free(ptr);\n    ptr = NULL;\n}`
  },

  // 8. Go
  {
    id: "core-go-1",
    category: "Go",
    langs: ["Go"],
    re: /panic: runtime error: invalid memory address or nil pointer dereference/i,
    title: "Go Nil Pointer Dereference Panic",
    what: "Attempted to access a field or method on a nil pointer struct or uninitialized interface.",
    why: [
      "A function returned nil error and nil value.",
      "Forgot to initialize struct with &MyStruct{}."
    ],
    fix: [
      "Check if pointer is nil: if ptr != nil { ... }.",
      "Always return proper error handling from constructors."
    ],
    code: `if user != nil {\n    fmt.Println(user.Name)\n}`
  },

  // 9. Rust
  {
    id: "core-rust-1",
    category: "Rust",
    langs: ["Rust"],
    re: /e0382|borrow of moved value/i,
    title: "Rust E0382: Borrow of Moved Value",
    what: "You tried to use a value after its ownership was transferred to another variable or function.",
    why: [
      "Passing a non-Copy type by value moved ownership.",
      "Re-using variable in loop without borrowing."
    ],
    fix: [
      "Pass by reference (&val) instead of by value.",
      "Implement or derive Clone and call .clone()."
    ],
    code: `fn print_val(val: &String) {\n    println!("{}", val);\n}`
  },

  // 10. Swift
  {
    id: "core-swift-1",
    category: "Swift",
    langs: ["Swift"],
    re: /fatal error: unexpectedly found nil while unwrapping an optional value/i,
    title: "Swift Fatal Error: Unexpected Nil While Unwrapping Optional",
    what: "Forced unwrapping with '!' was attempted on an Optional that contained nil.",
    why: [
      "Used force unwrapping (e.g. user!.name) on an unassigned property.",
      "IBOutlet connection was disconnected or not loaded."
    ],
    fix: [
      "Use optional binding (if let or guard let).",
      "Provide default with nil coalescing: val ?? fallback."
    ],
    code: `guard let user = currentUser else { return }\nprint(user.name)`
  },

  // 11. PHP
  {
    id: "core-php-1",
    category: "PHP",
    langs: ["PHP"],
    re: /undefined variable|undefined array key/i,
    title: "PHP Undefined Variable or Array Key",
    what: "The script referenced a variable or array key that has not been initialized or assigned.",
    why: [
      "Typo in array index string.",
      "Request parameter was omitted from form submission."
    ],
    fix: [
      "Use null coalescing operator: $val = $data['key'] ?? null.",
      "Verify key presence with isset() or array_key_exists()."
    ],
    code: `$name = $request->input('name') ?? 'Guest';`
  },

  // 12. Databases & SQL
  {
    id: "core-sql-1",
    category: "SQL",
    langs: ["SQL"],
    re: /23505|duplicate key value violates unique constraint/i,
    title: "SQLSTATE 23505: Unique Constraint Violation",
    what: "An INSERT or UPDATE attempted to store a value in a column marked UNIQUE that already exists.",
    why: [
      "Record with this email or primary key already exists.",
      "Race condition in concurrent registrations."
    ],
    fix: [
      "Use ON CONFLICT DO UPDATE (Postgres) or ON DUPLICATE KEY UPDATE (MySQL).",
      "Check if record exists before executing insertion."
    ],
    code: `INSERT INTO users (email)\nVALUES ('a@b.com')\nON CONFLICT (email) DO NOTHING;`
  },

  // 13. Networking & HTTP
  {
    id: "core-net-1",
    category: "Network",
    langs: ["Network"],
    re: /http 429|status 429|too many requests/i,
    title: "HTTP 429 Too Many Requests (Rate Limit Exceeded)",
    what: "The client has sent too many requests in a given amount of time, exceeding the server's rate limit.",
    why: [
      "Exceeded API quota threshold.",
      "Aggressive polling or retry loop without backoff."
    ],
    fix: [
      "Check the 'Retry-After' response header and wait before retrying.",
      "Implement exponential backoff with random jitter."
    ],
    code: `const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;\nawait new Promise(r => setTimeout(r, delay));`
  },
  {
    id: "core-net-2",
    category: "Network",
    langs: ["Network", "Other"],
    re: /errno 111|econnrefused|connection refused/i,
    title: "POSIX Errno 111: ECONNREFUSED",
    what: "Connection refused: No service is listening on the target IP address and port.",
    why: [
      "The server application is not running or crashed.",
      "Target port is wrong or blocked by firewall."
    ],
    fix: [
      "Start the server application.",
      "Check listening ports with `netstat -tulnp`."
    ],
    code: `netstat -tulnp | grep LISTEN`
  }
];
