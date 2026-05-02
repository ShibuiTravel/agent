#!/usr/bin/env node
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const packageDir = path.join(repoRoot, "packages", "coding-agent");
const packageJsonPath = path.join(packageDir, "package.json");
const distDir = path.join(packageDir, "dist");
const cliPath = path.join(distDir, "cli.js");
const tsxBin = path.join(
	repoRoot,
	"node_modules",
	".bin",
	process.platform === "win32" ? "tsx.cmd" : "tsx",
);
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  npm run link:local

Creates packages/coding-agent/dist/cli.js as a source-backed local shim, then
links @shibuitravel/agent globally so the shibui command runs this checkout.`);
	process.exit(0);
}

if (args.length > 0) {
	console.error(`Unknown argument: ${args.join(" ")}`);
	process.exit(2);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

if (packageJson.name !== "@shibuitravel/agent") {
	console.error(`Expected @shibuitravel/agent package, found ${packageJson.name}`);
	process.exit(1);
}

if (packageJson.bin?.shibui !== "dist/cli.js") {
	console.error("Expected package bin shibui to point at dist/cli.js");
	process.exit(1);
}

if (!existsSync(tsxBin)) {
	console.error(`Missing local tsx binary at ${tsxBin}`);
	console.error("Run npm install in the Shibui Agent checkout first.");
	process.exit(1);
}

const shim = `#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(distDir, "..");
const repoRoot = path.resolve(packageDir, "../..");
const tsxBin = path.join(
\trepoRoot,
\t"node_modules",
\t".bin",
\tprocess.platform === "win32" ? "tsx.cmd" : "tsx",
);
const sourceCli = path.join(packageDir, "src", "cli.ts");
const tsconfig = path.join(repoRoot, "tsconfig.json");

if (!existsSync(tsxBin)) {
\tconsole.error(\`Missing local tsx binary at \${tsxBin}\`);
\tconsole.error("Run npm install in the Shibui Agent checkout.");
\tprocess.exit(1);
}

const result = spawnSync(tsxBin, ["--tsconfig", tsconfig, sourceCli, ...process.argv.slice(2)], {
\tstdio: "inherit",
\tenv: process.env,
});

if (result.error) {
\tthrow result.error;
}

process.exit(result.status ?? 0);
`;

mkdirSync(distDir, { recursive: true });
writeFileSync(cliPath, shim);
chmodSync(cliPath, 0o755);

const link = spawnSync(npmBin, ["link", "--workspace", "@shibuitravel/agent", "--ignore-scripts"], {
	cwd: repoRoot,
	stdio: "inherit",
	env: process.env,
});

if (link.error) {
	throw link.error;
}

if (link.status !== 0) {
	process.exit(link.status ?? 1);
}

console.log(`Linked shibui to ${cliPath}`);
