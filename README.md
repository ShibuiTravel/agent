# Shibui Agent

Shibui Agent is the open-source Shibui coding agent CLI. It is a fork of Pi focused on a clean Shibui install path, Shibui-owned configuration, and a future Shibui Pro setup flow for zero-configuration provider access.

## Install

```bash
npm install -g @shibuitravel/agent
shibui
```

The CLI uses `~/.shibui/agent` for user-level configuration and session storage by default.

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
npm run check
```

See [packages/coding-agent](packages/coding-agent) for CLI usage and [AGENTS.md](AGENTS.md) for project-specific rules.

## License

MIT
