#!/usr/bin/env node

/**
 * Prepare a Shibui release commit and tag.
 *
 * This script does not publish packages, push git refs, or create GitHub
 * releases. The release-shibui GitHub Actions workflow owns those steps.
 *
 * Usage:
 *   node scripts/release.mjs <major|minor|patch|x.y.z>
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RELEASE_TARGET = process.argv[2];
const BUMP_TYPES = new Set(["major", "minor", "patch"]);
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

if (!RELEASE_TARGET || (!BUMP_TYPES.has(RELEASE_TARGET) && !SEMVER_RE.test(RELEASE_TARGET))) {
	console.error("Usage: node scripts/release.mjs <major|minor|patch|x.y.z>");
	process.exit(1);
}

function run(cmd, options = {}) {
	console.log(`$ ${cmd}`);
	try {
		return execSync(cmd, { encoding: "utf-8", stdio: options.silent ? "pipe" : "inherit", ...options });
	} catch (_err) {
		if (!options.ignoreError) {
			console.error(`Command failed: ${cmd}`);
			process.exit(1);
		}
		return null;
	}
}

function getVersion() {
	const pkg = JSON.parse(readFileSync("packages/coding-agent/package.json", "utf-8"));
	return pkg.version;
}

function compareVersions(a, b) {
	const aParts = a.split(".").map(Number);
	const bParts = b.split(".").map(Number);

	for (let i = 0; i < 3; i++) {
		const diff = (aParts[i] || 0) - (bParts[i] || 0);
		if (diff !== 0) return diff;
	}

	return 0;
}

function shellQuote(value) {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

function stageChangedFiles() {
	const output = run("git ls-files -m -o -d --exclude-standard", { silent: true });
	const paths = [...new Set((output || "").split("\n").map((line) => line.trim()).filter(Boolean))];
	if (paths.length === 0) return;

	run(`git add -- ${paths.map(shellQuote).join(" ")}`);
}

function bumpOrSetVersion(target) {
	const currentVersion = getVersion();

	if (BUMP_TYPES.has(target)) {
		console.log(`Bumping version (${target})...`);
		run(`npm run version:${target}`);
		return getVersion();
	}

	if (compareVersions(target, currentVersion) <= 0) {
		console.error(`Error: explicit version ${target} must be greater than current version ${currentVersion}.`);
		process.exit(1);
	}

	console.log(`Setting explicit version (${target})...`);
	run(
		`npm version ${target} -ws --no-git-tag-version && node scripts/sync-versions.js && npx shx rm -rf node_modules packages/*/node_modules package-lock.json && npm install`,
	);
	return getVersion();
}

function getChangelogs() {
	const packagesDir = "packages";
	return readdirSync(packagesDir)
		.map((pkg) => join(packagesDir, pkg, "CHANGELOG.md"))
		.filter((path) => existsSync(path));
}

function finalizeChangelog(changelog, version, date) {
	const content = readFileSync(changelog, "utf-8");
	if (!content.includes("## [Unreleased]")) {
		console.log(`  Skipping ${changelog}: no [Unreleased] section`);
		return;
	}

	const released = content.replace("## [Unreleased]", `## [${version}] - ${date}`);
	const withNextUnreleased = released.replace(/^(# Changelog\n\n)/, "$1## [Unreleased]\n\n");
	writeFileSync(changelog, withNextUnreleased);
	console.log(`  Finalized ${changelog}`);
}

console.log("\n=== Prepare Shibui Release ===\n");

console.log("Checking for uncommitted changes...");
const status = run("git status --porcelain", { silent: true });
if (status && status.trim()) {
	console.error("Error: Uncommitted changes detected. Commit or stash first.");
	console.error(status);
	process.exit(1);
}
console.log("  Working directory clean\n");

const version = bumpOrSetVersion(RELEASE_TARGET);
console.log(`  New version: ${version}\n`);

console.log("Updating CHANGELOG.md files...");
const date = new Date().toISOString().split("T")[0];
for (const changelog of getChangelogs()) {
	finalizeChangelog(changelog, version, date);
}
console.log();

console.log("Committing and tagging...");
stageChangedFiles();
run(`git commit -m "Release v${version}"`);
run(`git tag v${version}`);
console.log();

console.log(`=== Prepared v${version} ===`);
