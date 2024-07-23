#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");

const ignoredPatterns = [
  "node_modules",
  "package-lock.json",
  "npm-debug.log",
  "yarn.lock",
  "yarn-error.log",
  "pnpm-lock.yaml",
  "bun.lockb",
  "deno.lock",
  "vendor",
  "composer.lock",
  "__pycache__",
  ".pyc",
  ".pyo",
  ".pyd",
  ".Python",
  "pip-log.txt",
  "pip-delete-this-directory.txt",
  ".venv",
  "venv",
  "ENV",
  "env",
  "Gemfile.lock",
  ".bundle",
  "target",
  ".class",
  ".gradle",
  "build",
  "pom.xml.tag",
  "pom.xml.releaseBackup",
  "pom.xml.versionsBackup",
  "pom.xml.next",
  "bin",
  "obj",
  ".suo",
  ".user",
  "go.sum",
  "Cargo.lock",
  ".git",
  ".svn",
  ".hg",
  ".DS_Store",
  "Thumbs.db",
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.test.local",
  ".env.production.local",
  ".svelte-kit",
  ".next",
  ".nuxt",
  ".vuepress",
  ".cache",
  "dist",
  "tmp",
  ".expo",
];

async function readFileContent(filePath, maxLines) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    if (lines.length > maxLines) {
      return `File exceeds ${maxLines} lines. Skipped.`;
    }
    return content;
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

function getLanguage(filePath) {
  const extension = path.extname(filePath).slice(1);
  return extension || "text";
}

function shouldInclude(filename, relativePath, ignoredPatterns) {
  if (ignoredPatterns.some((pattern) => relativePath.includes(pattern))) {
    return false;
  }
  const lowercaseFilename = filename.toLowerCase();
  return (
    lowercaseFilename === "readme.md" ||
    ["package.json", "requirements.txt", "pyproject.toml"].includes(filename) ||
    filename.endsWith(".py") ||
    filename.endsWith(".js") ||
    filename.endsWith(".jsx") ||
    filename.endsWith(".ts") ||
    filename.endsWith(".tsx") ||
    filename.endsWith(".json")
  );
}

async function generateDirectoryStructure(repoPath, ignoredPatterns) {
  const structure = [];

  async function walkDir(dir, level = 0) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = path.relative(repoPath, path.join(dir, entry.name));
      if (ignoredPatterns.some((pattern) => relativePath.includes(pattern))) {
        continue;
      }

      const indent = "  ".repeat(level);
      if (entry.isDirectory()) {
        structure.push(`${indent}${entry.name}/`);
        await walkDir(path.join(dir, entry.name), level + 1);
      } else {
        structure.push(`${indent}${entry.name}`);
      }
    }
  }

  await walkDir(repoPath);
  return structure.join("\n");
}

async function createMarkdown(repoPath, outputFile, maxLines, ignoredPatterns) {
  let markdown = "";

  // Add directory structure
  markdown += "# Directory Structure\n\n```\n";
  markdown += await generateDirectoryStructure(repoPath, ignoredPatterns);
  markdown += "\n```\n\n";

  const priorityFiles = [
    "readme.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
  ];

  async function processFiles(isPriority) {
    async function walkAndProcess(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await walkAndProcess(path.join(dir, entry.name));
        } else {
          const relativePath = path.relative(
            repoPath,
            path.join(dir, entry.name)
          );
          const shouldProcess = isPriority
            ? priorityFiles.includes(entry.name.toLowerCase())
            : !priorityFiles.includes(entry.name.toLowerCase());

          if (
            shouldInclude(entry.name, relativePath, ignoredPatterns) &&
            shouldProcess
          ) {
            const filePath = path.join(dir, entry.name);
            const content = await readFileContent(filePath, maxLines);
            const language = getLanguage(filePath);
            markdown += `## ${relativePath}\n\n\`\`\`${language}\n${content}\n\`\`\`\n\n`;
          }
        }
      }
    }

    await walkAndProcess(repoPath);
  }

  // Process priority files first
  await processFiles(true);

  // Then process other files
  await processFiles(false);

  await fs.writeFile(outputFile, markdown, "utf-8");
}

async function main() {
  const args = process.argv.slice(2);
  const maxLines = args.includes("--max-lines")
    ? parseInt(args[args.indexOf("--max-lines") + 1])
    : 1000;
  const includeIgnored = args.includes("--include-ignored");

  const repoPath = process.cwd();
  const outputFile = "combined_repo.md";

  const effectiveIgnoredPatterns = includeIgnored ? [] : ignoredPatterns;

  await createMarkdown(
    repoPath,
    outputFile,
    maxLines,
    effectiveIgnoredPatterns
  );
  console.log(`Markdown file created: ${outputFile}`);
}

main().catch(console.error);