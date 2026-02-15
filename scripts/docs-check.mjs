import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const errors = [];

const readFile = (relativePath) => {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
};

const fileExists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const agents = readFile("AGENTS.md");
const packageJsonText = readFile("package.json");

if (agents) {
  const lineCount = agents.split(/\r?\n/).length;
  if (lineCount > 100) {
    errors.push(`AGENTS.md must stay <= 100 lines (found ${lineCount}).`);
  }
}

const requiredDocs = [
  "docs/project/README.md",
  "docs/project/plan.md",
  "docs/project/progress.md",
  "docs/project/tech-debt.md",
  "docs/decisions/README.md",
  "docs/codex/assets/capability-gap.md",
];

for (const relativePath of requiredDocs) {
  if (!fileExists(relativePath)) {
    errors.push(`Missing required doc: ${relativePath}`);
  }
}

let packageJson = null;
if (packageJsonText) {
  try {
    packageJson = JSON.parse(packageJsonText);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    errors.push(`Invalid package.json: ${reason}`);
  }
}

const scripts = packageJson?.scripts ?? {};

for (const scriptName of ["dev", "build", "test", "docs:check", "docs:refresh"]) {
  if (!Object.prototype.hasOwnProperty.call(scripts, scriptName)) {
    errors.push(`Missing npm script: ${scriptName}`);
  }
}

if (agents) {
  const commandMatches = [...agents.matchAll(/`npm run ([a-zA-Z0-9:-]+)`/g)].map(
    (match) => match[1],
  );
  if (agents.includes("`npm test`")) {
    commandMatches.push("test");
  }

  for (const command of commandMatches) {
    if (!Object.prototype.hasOwnProperty.call(scripts, command)) {
      errors.push(`AGENTS.md references missing npm script: ${command}`);
    }
  }

  const pathRefs = [...agents.matchAll(/`([^`\n]+)`/g)]
    .map((match) => match[1])
    .filter((entry) => {
      if (entry.includes(" ")) return false;
      if (entry.startsWith("npm")) return false;
      return entry.includes("/") || entry.endsWith(".md") || entry === "AGENTS.md";
    });

  const uniquePathRefs = [...new Set(pathRefs)];
  for (const relativePath of uniquePathRefs) {
    if (!fileExists(relativePath)) {
      errors.push(`AGENTS.md path reference does not exist: ${relativePath}`);
    }
  }
}

const progress = readFile("docs/project/progress.md");
if (progress) {
  if (!progress.includes("<!-- generated:start -->") || !progress.includes("<!-- generated:end -->")) {
    errors.push("docs/project/progress.md must include generated block markers.");
  }
}

if (errors.length > 0) {
  console.error("docs:check failed");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("docs:check passed");
