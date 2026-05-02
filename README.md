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

## Docker

Run Shibui from the published container image:

```bash
docker run --rm -it ghcr.io/shibuitravel/agent --version
```

Run it against the current project and persist Shibui config on the host:

```bash
docker run --rm -it \
  -v "$PWD:/workspace" \
  -w /workspace \
  -v "$HOME/.shibui:/home/shibui/.shibui" \
  ghcr.io/shibuitravel/agent
```

## Development

```bash
npm install
npm run link:local
npm run check
```

`npm run link:local` installs the local `shibui` command from source for machine-level smoke testing without running the release build.

## License

MIT
