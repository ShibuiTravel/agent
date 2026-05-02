import { ENV_TELEMETRY, LEGACY_ENV_TELEMETRY } from "../config.js";
import type { SettingsManager } from "./settings-manager.js";

function isTruthyEnvFlag(value: string | undefined): boolean {
	if (!value) return false;
	return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "yes";
}

export function isInstallTelemetryEnabled(
	settingsManager: SettingsManager,
	telemetryEnv: string | undefined = process.env[ENV_TELEMETRY] ?? process.env[LEGACY_ENV_TELEMETRY],
): boolean {
	return telemetryEnv !== undefined ? isTruthyEnvFlag(telemetryEnv) : settingsManager.getEnableInstallTelemetry();
}
