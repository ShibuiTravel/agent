#!/usr/bin/env node

import { appendFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BUMP_TYPES = new Set(["major", "minor", "patch"]);
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const target = process.argv[2]?.trim();

function fail(message) {
	console.error(`Error: ${message}`);
	process.exit(1);
}

function parseVersion(version) {
	if (!SEMVER_RE.test(version)) fail(`invalid semver version: ${version}`);
	return version.split(".").map(Number);
}

function compareVersions(a, b) {
	const aParts = parseVersion(a);
	const bParts = parseVersion(b);

	for (let i = 0; i < 3; i++) {
		const diff = aParts[i] - bParts[i];
		if (diff !== 0) return diff;
	}

	return 0;
}

function bumpVersion(version, bump) {
	const [major, minor, patch] = parseVersion(version);
	if (bump === "major") return `${major + 1}.0.0`;
	if (bump === "minor") return `${major}.${minor + 1}.0`;
	if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
	fail(`unsupported bump type: ${bump}`);
}

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf-8"));
}

if (!target || (!BUMP_TYPES.has(target) && !SEMVER_RE.test(target))) {
	fail("usage: node scripts/verify-release-version.mjs <major|minor|patch|x.y.z>");
}

const packagesDir = join(process.cwd(), "packages");
const packageJsonPaths = readdirSync(packagesDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => join(packagesDir, entry.name, "package.json"));

const packages = packageJsonPaths.map((path) => ({ path, data: readJson(path) }));
const versions = new Set(packages.map((pkg) => pkg.data.version));

if (versions.size !== 1) {
	fail(`package versions are not in lockstep: ${[...versions].sort().join(", ")}`);
}

const codingAgent = packages.find((pkg) => pkg.path.endsWith("packages/coding-agent/package.json"));
if (!codingAgent) fail("missing packages/coding-agent/package.json");
if (codingAgent.data.name !== "@shibuitravel/agent") {
	fail(`coding-agent package must be @shibuitravel/agent, got ${codingAgent.data.name}`);
}
if (codingAgent.data.bin?.shibui !== "dist/cli.js") {
	fail("coding-agent package must expose the shibui binary");
}

const currentVersion = [...versions][0];
const releaseVersion = BUMP_TYPES.has(target) ? bumpVersion(currentVersion, target) : target;

if (compareVersions(releaseVersion, currentVersion) <= 0) {
	fail(`release version ${releaseVersion} must be greater than current version ${currentVersion}`);
}

const output = process.env.GITHUB_OUTPUT;
if (output) {
	appendFileSync(output, `current_version=${currentVersion}\n`);
	appendFileSync(output, `release_version=${releaseVersion}\n`);
	appendFileSync(output, `release_tag=v${releaseVersion}\n`);
}

console.log(`current_version=${currentVersion}`);
console.log(`release_version=${releaseVersion}`);
console.log(`release_tag=v${releaseVersion}`);
