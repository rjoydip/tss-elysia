# OpenCode Configuration

This document describes the OpenCode agent configuration for this project.

## Overview

The project uses a multi-agent setup with MiniMax and NVIDIA models for different development tasks.

## Agents

| Agent       | Type     | Model                 | Description                            |
| ----------- | -------- | --------------------- | -------------------------------------- |
| `build`     | Primary  | MiniMax M2.5 Free     | Default development agent              |
| `secondary` | Primary  | MiMo V2 Omni Free     | Fallback/alternative agent             |
| `mimo-pro`  | SubAgent | Mimo V2 Pro Free      | Specialized subagent for complex tasks |
| `nemotron`  | SubAgent | Nemotron 3 Super Free | Reasoning and analysis subagent        |

## Usage

### Switching Between Primary Agents

Press **Tab** to cycle between `build` and `secondary` agents during a session.

### Invoking Subagents

Use **@ mention** in your messages to invoke subagents:

```bash
@mimo-pro help me with this complex refactoring
@nemotron analyze this code for potential issues
```

## Provider Setup

### Required API Keys

Run the `/connect` command in OpenCode to add the following credentials:

| Provider | Models Used                          |
| -------- | ------------------------------------ |
| MiniMax  | M2.5 Free, MiMo V2 Omni, Mimo V2 Pro |
| NVIDIA   | Nemotron 3 Super Free                |

### Connecting Credentials

```bash
# In OpenCode TUI
/connect
```

Then select the provider and enter your API key when prompted.

## Configuration

The agent configuration is stored in `opencode.json`:

```json
{
  "provider": {
    "minimax": {
      "options": {
        "baseURL": "https://api.minimax.chat/v1"
      },
      "models": {
        "MiniMax-M2.5-Free": { "name": "MiniMax M2.5 Free" },
        "MiMo-2-Omni-Free": { "name": "MiMo V2 Omni Free" },
        "Mimo-2-Pro-Free": { "name": "Mimo V2 Pro Free" }
      }
    },
    "nvidia": {
      "options": {
        "baseURL": "https://integrate.api.nvidia.com/v1"
      },
      "models": {
        "nemotron-3-super-4b": { "name": "Nemotron 3 Super Free" }
      }
    }
  },
  "agent": {
    "build": {
      "description": "Default primary agent for development work",
      "mode": "primary",
      "model": "minimax/MiniMax-M2.5-Free"
    },
    "secondary": {
      "description": "Fallback model when primary is unavailable",
      "mode": "primary",
      "model": "minimax/MiMo-2-Omni-Free"
    },
    "mimo-pro": {
      "description": "Specialized subagent for complex tasks",
      "mode": "subagent",
      "model": "minimax/Mimo-2-Pro-Free"
    },
    "nemotron": {
      "description": "Subagent for reasoning tasks",
      "mode": "subagent",
      "model": "nvidia/nemotron-3-super-4b"
    }
  },
  "model": "minimax/MiniMax-M2.5-Free",
  "small_model": "minimax/MiMo-2-Omni-Free"
}
```

## LSP Configuration

The project uses the following Language Server Protocol (LSP) servers for intelligent code assistance:

| Server      | Languages Supported           |
| ----------- | ----------------------------- |
| TypeScript  | TypeScript, JavaScript, React |
| JSON        | JSON, JSONC                   |
| TailwindCSS | Tailwind CSS, CSS             |
| HTML        | HTML, Handlebars, Razor       |
| CSS         | CSS, SCSS, Less               |
| YAML        | YAML                          |
| Markdown    | Markdown, MDX                 |

### Installation

Install the required LSP servers globally:

```bash
# Core LSP servers
npm install -g typescript-language-server
npm install -g vscode-json-languageserver
npm install -g vscode-html-languageserver
npm install -g vscode-css-languageserver
npm install -g yaml-language-server
npm install -g markdown-language-server
npm install -g @tailwindcss/language-server
```

### LSP Opencode Configuration

The LSP configuration in `opencode.json`:

```json
{
  "lsp": {
    "typescript": {
      "command": "typescript-language-server",
      "args": ["--stdio"],
      "languages": ["typescript", "javascript", "typescriptreact", "javascriptreact"]
    },
    "json": {
      "command": "vscode-json-languageserver",
      "args": ["--stdio"],
      "languages": ["json", "jsonc"]
    },
    "tailwindcss": {
      "command": "tailwindcss-language-server",
      "args": ["--stdio"],
      "languages": ["tailwindcss", "css"]
    },
    "html": {
      "command": "vscode-html-languageserver",
      "args": ["--stdio"],
      "languages": ["html", "handlebars", "razor"]
    },
    "css": {
      "command": "vscode-css-languageserver",
      "args": ["--stdio"],
      "languages": ["css", "scss", "less"]
    },
    "yaml": {
      "command": "yaml-language-server",
      "args": ["--stdio"],
      "languages": ["yaml"]
    },
    "markdown": {
      "command": "markdown-language-server",
      "args": ["--stdio"],
      "languages": ["markdown", "mdx"]
    }
  }
}
```

## Best Practices

- Use `build` for most development tasks
- Use `secondary` when `build` is unavailable or for variety
- Invoke `@mimo-pro` for complex refactoring or challenging problems
- Invoke `@nemotron` for code analysis and reasoning tasks
