# Shibui Agent

Shibui Agent is the open-source Shibui coding agent CLI. It is forked from Pi and keeps the same extensible runtime while using Shibui package, command, and config defaults.

## Quick Start

```bash
npm install -g @shibuitravel/agent
shibui
```

Shibui stores user config and sessions under `~/.shibui/agent` by default.

## Provider Setup

After installing, start Shibui and run `/login` to configure a model provider:

```text
shibui
/login
```

Choose **Use a subscription** to connect an inherited subscription provider such as Anthropic Claude Pro/Max, ChatGPT Plus/Pro, or GitHub Copilot. Choose **Use an API Key** if you prefer to configure provider API credentials directly.

You can also authenticate with an API key through your shell environment:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
shibui
```

## Capabilities

Shibui starts with the inherited coding-agent tools:

- `read` - read file contents
- `write` - create or overwrite files
- `edit` - patch files
- `bash` - run shell commands

Additional read-only tools (`grep`, `find`, `ls`) and package-provided tools can be enabled through settings or CLI flags.

## Providers

Built-in provider support is inherited from Pi and includes API-key and subscription flows for Anthropic, OpenAI, GitHub Copilot, Google Gemini, Amazon Bedrock, OpenRouter, Vercel AI Gateway, Cloudflare, Mistral, Groq, Cerebras, xAI, and others.

The Shibui Pro `/login` and `/setup` flow for zero-configuration provider access is planned as a separate fork pass.

## Configuration

| Purpose | Default |
|---------|---------|
| User config | `~/.shibui/agent` |
| Project config | `.shibui/` |
| Sessions | `~/.shibui/agent/sessions/` |

Primary Shibui environment variables:

| Variable | Description |
|----------|-------------|
| `SHIBUI_CODING_AGENT_DIR` | Override the user config directory |
| `SHIBUI_CODING_AGENT_SESSION_DIR` | Override session storage |
| `SHIBUI_PACKAGE_DIR` | Override package asset lookup |
| `SHIBUI_OFFLINE` | Disable startup network operations |
| `SHIBUI_SKIP_VERSION_CHECK` | Disable update checks |
| `SHIBUI_TELEMETRY` | Override install/update telemetry |
| `SHIBUI_SHARE_VIEWER_URL` | Override `/share` viewer URL |

Legacy `PI_*` environment variables remain accepted as fallback aliases during the fork transition.

## Packages

Shibui can install extensions, skills, prompts, and themes from npm, git, or local paths:

```bash
shibui install npm:@scope/package
shibui install git:github.com/user/repo
shibui install ./local-package
shibui config
```

Package manifests still use the upstream-compatible `pi` key in `package.json`.

## Docs

- [Quickstart](docs/quickstart.md)
- [Usage](docs/usage.md)
- [Providers](docs/providers.md)
- [Settings](docs/settings.md)
- [Packages](docs/packages.md)
- [Extensions](docs/extensions.md)
- [Development](docs/development.md)

## License

MIT
