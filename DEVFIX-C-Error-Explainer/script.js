const database = [
  {
    keys: ["expected", ";", "semicolon"],
    happened: "The C compiler reached a place where it expected the end of a statement, but the statement was not terminated correctly.",
    why: "A semicolon is missing after a declaration, assignment, printf/scanf call, or another C statement.",
    cause: "A statement such as int x = 10 or printf(\"Hello\") was written without ;",
    fix: "Check the line mentioned by the compiler and add the missing semicolon. Also inspect the line immediately before it.",
    solution: "int x = 10;\nprintf(\"Hello\");\nreturn 0;"
  },
  {
    keys: ["scanf", "&"],
    happened: "scanf() needs the memory address of a normal variable so it knows where to store the input.",
    why: "For variables like int, float and char, scanf normally needs & before the variable name.",
    cause: "You may have written scanf(\"%d\", x); instead of scanf(\"%d\", &x);",
    fix: "Add & before the variable when reading a normal variable with scanf().",
    solution: "int age;\nscanf(\"%d\", &age);"
  },
  {
    keys: ["printf", "format"],
    happened: "The format specifier in printf() does not match the type of value being printed.",
    why: "C uses different format specifiers for different data types.",
    cause: "For example, %d is used for int while %f is commonly used for float/double output.",
    fix: "Match the format specifier with the variable's data type.",
    solution: "int age = 18;\nprintf(\"%d\", age);\n\nfloat marks = 91.5f;\nprintf(\"%.2f\", marks);"
  },
  {
    keys: ["undeclared", "not declared"],
    happened: "The compiler found a variable or function name that has not been declared in the current scope.",
    why: "C needs to know about a variable before you use it.",
    cause: "You may have a spelling mistake or may have used a variable before declaring it.",
    fix: "Declare the variable before using it and check the spelling carefully.",
    solution: "int number;\nnumber = 10;\nprintf(\"%d\", number);"
  },
  {
    keys: ["division by zero", "divide by zero"],
    happened: "Your program is trying to divide a number by zero.",
    why: "Division by zero is not a valid arithmetic operation.",
    cause: "The denominator variable may have the value 0.",
    fix: "Check the denominator before performing the division.",
    solution: "if (b != 0) {\n    result = a / b;\n} else {\n    printf(\"Cannot divide by zero\");\n}"
  },
  {
    keys: ["segmentation", "segmentation fault"],
    happened: "The program tried to access memory that it is not allowed to access.",
    why: "Common causes include invalid pointers, bad array indexes, or using memory after it is freed.",
    cause: "An array index may be outside its valid range, or a pointer may be invalid.",
    fix: "Check array boundaries and pointers. Use a debugger to find the exact line causing the crash.",
    solution: "int a[5];\na[0] = 10;\n/* valid indexes: 0 to 4 */"
  }
];

function explainError() {
  const input = document.getElementById("errorInput").value.trim().toLowerCase();
  const language = document.getElementById("language").value;
  const result = document.getElementById("result");

  if (!input) {
    alert("Please enter a C error first.");
    return;
  }

  let match = database.find(item =>
    item.keys.some(key => input.includes(key))
  );

  if (!match) {
    match = {
      happened: "DEVFIX could not match this error to its beginner error database yet.",
      why: "Compiler messages often point to the real problem or to a nearby line where the compiler became confused.",
      cause: "The error may be a spelling mistake, syntax problem, wrong data type, pointer problem, or another C-specific issue.",
      fix: "Read the exact compiler message, check the line number, and inspect the surrounding 2–3 lines. Add the complete error message for a more specific result.",
      solution: `Language selected: ${language.toUpperCase()}\n\nTip: paste the full compiler error here.`
    };
  }

  document.getElementById("happened").textContent = match.happened;
  document.getElementById("why").textContent = match.why;
  document.getElementById("cause").textContent = match.cause;
  document.getElementById("fix").textContent = match.fix;
  document.getElementById("solution").textContent = match.solution;

  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("fixBtn").addEventListener("click", explainError);
