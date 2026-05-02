# Shibui Release Runbook

This repository is a Shibui-owned fork of Pi. Upstream sync and Shibui release are separate operations.

## Upstream Sync

Upstream commits are pulled in through `.github/workflows/sync-upstream.yml`.

The workflow:

- checks `badlogic/pi-mono/main`
- creates or updates the `automation/sync-upstream` branch
- opens or updates a `Sync upstream Pi` pull request
- never publishes packages, tags, Docker images, or releases

Configure a fine-grained `SHIBUI_BOT_TOKEN` secret with contents and pull-request access if we want PR checks to trigger from automation-created sync PRs. Without it, the workflow falls back to `GITHUB_TOKEN`; GitHub may suppress follow-on workflow triggers created by that token.

Review upstream sync PRs for workflow changes before merging. Preserve Shibui package names, binary names, config roots, and publishing behavior.

If the workflow hits merge conflicts, resolve manually:

```bash
git fetch upstream main
git checkout -B automation/sync-upstream origin/main
git merge upstream/main
```

Then resolve conflicts, run checks, push the branch, and merge the PR normally.

## Version Policy

Shibui versions are monotonic and public-facing.

- Use `patch` for upstream runtime changes, bug fixes, and new compatible features.
- Use `minor` for breaking API or behavior changes.
- If upstream moves to a higher minor or major, choose a Shibui version that is at least aligned with that upstream base.

Examples:

```text
current Shibui: 0.72.2
upstream Pi:    0.72.1
next Shibui:    0.72.3
```

```text
current Shibui: 0.72.4
upstream Pi:    0.73.0
next Shibui:    0.73.0 or 0.73.1
```

## Release

Use `.github/workflows/release-shibui.yml` from the GitHub Actions UI.

Inputs:

- `version`: `patch`, `minor`, `major`, or an explicit `x.y.z`
- `publish_docker`: keep enabled for normal releases

The workflow:

- verifies the release runs from current `main`
- verifies package lockstep and Shibui package identity
- checks that the npm version, git tag, GitHub Release, and Docker Hub tag do not already exist
- prepares the release commit and tag
- runs build, check, and test
- pushes the release commit and tag
- explicitly dispatches `publish-npm.yml` for the tag and waits for it
- explicitly dispatches `publish-docker.yml` for the tag and waits for it
- creates the GitHub Release after publishing succeeds

Publishing is not triggered by the GitHub Release event. This avoids workflow-token fanout issues and keeps the release path explicit.

The release workflow pushes one release commit and one tag to `main`. If branch protection blocks that push, either allow the release workflow to bypass the protection rule or use a release PR for the version/changelog commit, then run the publish workflows against the merged tag.

## Downstream Packages

The release workflow publishes `@shibuitravel/agent`.

After npm publish:

- `ShibuiTravel/shibui-agent` mirrors npm latest through its scheduled/manual `publish-npm.yml`.
- `ShibuiTravel/homebrew-tap` mirrors npm latest through its scheduled/manual `update-formula.yml`.

If either downstream repo needs an immediate update, run its workflow manually with the released `agent_version`.

## Partial Failure Recovery

If `release-shibui.yml` fails before pushing the release commit and tag, fix the issue and rerun.

If it fails after pushing the tag but before npm publishes:

1. Inspect the failed step.
2. If the release version is still absent from npm, rerun `publish-npm.yml` manually with `ref=vX.Y.Z`.
3. After npm succeeds, rerun `publish-docker.yml` manually with `ref=vX.Y.Z`.
4. Create the GitHub Release manually if the workflow did not create it.

If npm succeeds but Docker fails:

1. Rerun `publish-docker.yml` manually with `ref=vX.Y.Z`.
2. Confirm both `docker.io/shibuitravel/agent:X.Y.Z` and `docker.io/shibuitravel/agent:latest` resolve.
3. Create the GitHub Release manually if needed.

Do not republish an npm version. npm package versions are immutable.

## Disabled Binary Workflow

The inherited Pi binary workflow is disabled. Do not re-enable it until Shibui owns:

- binary names
- archive names
- checksums
- signing/notarization where applicable
- release recovery procedures
