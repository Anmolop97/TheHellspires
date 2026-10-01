# DEVFIX — C Error Explainer

A beginner-friendly web project inspired by the DEVFIX challenge.

> **Turn coding errors into understandable solutions.**

## What this project does

1. User enters a coding error.
2. User selects a programming language.
3. DEVFIX explains:
   - What happened?
   - Why might it happen?
   - How can I fix it?
   - Possible cause
   - Suggested solution
4. The current website focuses on common **C language** errors.

## Project files

```text
DEVFIX-C-Error-Explainer/
├── index.html
├── style.css
├── script.js
├── devfix.c
└── README.md
```

## Run the website

No installation is needed.

Open `index.html` in a browser.

## Run the C version

Install GCC, then open a terminal in this folder.

### Linux / macOS

```bash
gcc devfix.c -o devfix
./devfix
```

### Windows

```bash
gcc devfix.c -o devfix.exe
devfix.exe
```

## GitHub

Create a new repository on GitHub, then run:

```bash
git init
git add .
git commit -m "Create DEVFIX C error explainer"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository URL.

## Future improvements

- Add more C compiler errors.
- Add C++ and Python error databases.
- Add copy-code buttons.
- Add dark/light mode.
- Connect the frontend to a real backend/API.
- Add an AI explanation feature.
