# Directory Structure

```
LICENSE
README.md
convertRepo.js
package.json
```

## README.md

```md
# repo-to-one-file

[![npm version](https://img.shields.io/npm/v/repo-to-one-file.svg)](https://www.npmjs.com/package/repo-to-one-file)
[![npm downloads](https://img.shields.io/npm/dm/repo-to-one-file.svg)](https://www.npmjs.com/package/repo-to-one-file)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

repo-to-one-file is a Node.js tool that consolidates repository files into a single Markdown file. It's designed to create a comprehensive overview of a codebase, which can be particularly useful for documentation or as context for large language models.

[Check out the code here, please star <3](https://github.com/tonypls/repo-to-one-file-cli)

## Features

- Generates a directory structure of the repository
- Consolidates content of specified file types (.py, .js, .ts, .json, etc.) into a single Markdown file
- Ignores common non-source files and directories (node_modules, .git, etc.)
- Configurable maximum line count per file
- Option to include normally ignored files
- Prioritizes important files like README, package.json, requirements.txt, etc.

## Installation

You can install repo-to-one-file globally using npm:

```bash
npm install -g repo-to-one-file
```

## Usage

After installation, you can use repo-to-one-file from the command line:

```bash
repo-to-one-file
```

This will create a `combined_repo.md` file in the current directory.

### Options

- `--max-lines`: Set the maximum number of lines per file (default: 1000)
- `--include-ignored`: Include files that would normally be ignored

Example:

```bash
repo-to-one-file --max-lines 2000 --include-ignored
```

## Output Format

The generated Markdown file will have the following structure:

1. Directory structure of the repository
2. Content of priority files (README, package.json, requirements.txt, pyproject.toml)
3. Content of other included files (.py, .js, .ts, .json, etc.)

Each file's content is presented under a header with its relative path and enclosed in a code block with the appropriate language tag.

## Ignored Patterns

By default, the tool ignores many common non-source files and directories, including:

- Version control directories (.git, .svn)
- Package manager directories and files (node_modules, package-lock.json)
- Build directories and files (dist, build)
- Cache directories
- Log files
- Environment files
- OS-generated files

For a full list, please refer to the `ignoredPatterns` array in the `convertRepo.js` file.

## Development

To set up the development environment:

1. Clone the repository
2. Install dependencies: `npm install`

## Contributing

Contributions are welcome! Here are some ways you can contribute:

1. Implement test cases
2. Improve error handling and logging
3. Add support for more file types
4. Optimize performance for large repositories
5. Improve documentation and examples

Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- This project was inspired by the need to provide concise codebase overviews for large language models.
- Thanks to all contributors and users of this tool.

```

## package.json

```json
{
  "name": "repo-to-one-file",
  "version": "1.0.1",
  "description": "Convert a repository to a single Markdown file",
  "main": "convertRepo.js",
  "bin": {
    "repo-to-one-file": "./convertRepo.js"
  },
  "scripts": {
    "start": "node convertRepo.js"
  },
  "keywords": [
    "repository",
    "markdown",
    "converter",
    "AI",
    "ChatGPT",
    "OpenAI",
    "Anthropic",
    "Claude"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/tonypls/repo-to-one-file-cli.git"
  },
  "author": "tonypls",
  "license": "MIT"
}

```

## convertRepo.js

```js
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

```

