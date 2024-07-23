# repo-to-one-file

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

repo-to-one-file is a Node.js tool that consolidates repository files into a single Markdown file. It's designed to create a comprehensive overview of a codebase, which can be particularly useful for documentation or as context for large language models.

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
