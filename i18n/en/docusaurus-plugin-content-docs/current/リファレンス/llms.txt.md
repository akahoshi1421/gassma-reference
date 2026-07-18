---
sidebar_position: 6
---

# llms.txt

This reference site provides `llms.txt` files following the [llmstxt.org](https://llmstxt.org/) standard.

## What is llms.txt?

llms.txt is a file format designed to help AI and LLMs (Large Language Models) efficiently understand projects and libraries. It provides important project information in a structured text format, enabling AI assistants to offer more accurate and useful support.

## Available Files

The GASsma reference provides the following two files:

### llms.txt (Index Version)
- **Access URL**: [/llms.txt](pathname:///llms.txt)
- **Content**: A curated table of contents following the llmstxt.org standard: an overview of GASsma plus a list of links to each reference page with descriptions
- **Intended for**: When an AI needs to find and consult the relevant documentation page per topic

### llms-full.txt (Full Version)
- **Access URL**: [/llms-full.txt](pathname:///llms-full.txt)
- **Content**: The full content of every documentation page concatenated into a single file (auto-generated at build time from the same content as each page's Markdown version)
- **Intended for**: When you need detailed implementation, advanced usage, troubleshooting, or want to pass the entire documentation as context

## Usage

These files are primarily used for the following purposes:

1. **Integration with AI assistants**: By providing the file contents to AI tools such as Claude or ChatGPT, you can receive more accurate support regarding GASsma

2. **Facilitating project understanding**: As reference material for new developers to understand the project

3. **Documentation search**: When you want to quickly find information about a specific feature or API

## File Format Features

- **Markdown format**: Easy to read for both humans and machines
- **Standard-compliant index**: llms.txt follows the llmstxt.org standard structure of an H1 title, a summary, and per-section link lists
- **Practical code examples**: llms-full.txt contains ready-to-use TypeScript/JavaScript sample code
- **Comprehensive reference**: Covers everything from API details to usage examples

## Update Information

The llms.txt files are regularly updated in sync with GASsma library updates. For the latest information, always access via the URLs listed above.

## Related Links

- [llmstxt.org](https://llmstxt.org/) - Official site for the llms.txt standard
- [GASsma GitHub Repository](https://github.com/akahoshi1421/gassma) - Source code and latest information
- [NPM Package](https://www.npmjs.com/package/gassma) - Package details
