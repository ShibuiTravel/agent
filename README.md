# Shibui Agent

Shibui Agent is the open-source Shibui coding agent CLI. It is a fork of Pi focused on a clean Shibui install path, Shibui-owned configuration, and a future Shibui Pro setup flow for zero-configuration provider access.

## Install

```bash
npm install -g @shibuitravel/agent
shibui
```

The CLI uses `~/.shibui/agent` for user-level configuration and session storage by default.

## Provider Setup

After installing, start Shibui and run `/login` to configure a model provider:

```text
shibui
/login
```

Choose **Use a subscription** to connect an inherited subscription provider such as Anthropic Claude Pro/Max, ChatGPT Plus/Pro, or GitHub Copilot. Choose **Use an API Key** if you prefer to configure provider API credentials directly.

## Repository

This monorepo keeps the upstream Pi package structure while the public CLI is branded as Shibui.

| Package | Description |
|---------|-------------|
| **[@shibuitravel/agent](packages/coding-agent)** | Shibui interactive coding agent CLI |
| **[@mariozechner/pi-ai](packages/ai)** | Unified multi-provider LLM API |
| **[@mariozechner/pi-agent-core](packages/agent)** | Agent runtime with tool calling and state management |
| **[@mariozechner/pi-tui](packages/tui)** | Terminal UI library with differential rendering |
| **[@mariozechner/pi-web-ui](packages/web-ui)** | Web components for AI chat interfaces |

## Development

```bash
npm install
npm run link:local
npm run check
```

`npm run link:local` installs the local `shibui` command from source for machine-level smoke testing without running the release build.

## npm Publishing

The repo publishes only `@shibuitravel/agent` to npm. Configure npm trusted publishing with:

| Field | Value |
|-------|-------|
| Provider | GitHub Actions |
| Organization/user | `ShibuiTravel` |
| Repository | `agent` |
| Workflow filename | `publish-npm.yml` |

The package is public-scoped. If npm requires a manual first publish before trusted publishing can be configured, run `npm run publish:agent` from the repo root, then enable trusted publishing and disallow token publishing in the npm package settings.

See [packages/coding-agent](packages/coding-agent) for CLI usage and [AGENTS.md](AGENTS.md) for project-specific rules.

## License

MIT
