import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const progressPath = path.join(root, "docs/project/progress.md");

if (!fs.existsSync(progressPath)) {
  console.error("docs:refresh failed: docs/project/progress.md not found");
  process.exit(1);
}

const walkFiles = (directoryPath, matcher) => {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const results = [];
  const stack = [directoryPath];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (matcher(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  return results;
};

const countByMatcher = (directoryPath, matcher) => walkFiles(directoryPath, matcher).length;

const sourceCount = countByMatcher(
  path.join(root, "src"),
  (filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"),
);
const testCount = countByMatcher(
  path.join(root, "src"),
  (filePath) => /\.test\.(ts|tsx)$/.test(filePath),
);
const docsCount = countByMatcher(path.join(root, "docs"), (filePath) => filePath.endsWith(".md"));
const workflowCount = countByMatcher(
  path.join(root, ".github/workflows"),
  (filePath) => filePath.endsWith(".yml") || filePath.endsWith(".yaml"),
);

const generatedBlock = [
  "<!-- generated:start -->",
  `- Source files (\`src/**/*.{ts,tsx}\`): ${sourceCount}`,
  `- Test files (\`src/**/*.test.{ts,tsx}\`): ${testCount}`,
  `- Docs files (\`docs/**/*.md\`): ${docsCount}`,
  `- Workflow files (\`.github/workflows/*.{yml,yaml}\`): ${workflowCount}`,
  "<!-- generated:end -->",
].join("\n");

const currentText = fs.readFileSync(progressPath, "utf8");
const blockPattern = /<!-- generated:start -->[\s\S]*?<!-- generated:end -->/;

if (!blockPattern.test(currentText)) {
  console.error("docs:refresh failed: generated block markers are missing in docs/project/progress.md");
  process.exit(1);
}

const nextText = currentText.replace(blockPattern, generatedBlock);
if (nextText !== currentText) {
  fs.writeFileSync(progressPath, nextText);
  console.log("docs:refresh updated docs/project/progress.md");
} else {
  console.log("docs:refresh found no changes");
}
