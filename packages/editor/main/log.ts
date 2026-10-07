let debugMode = false;

export const setDebugMode = function (value: boolean) {
	debugMode = value;
};

/** 主进程唯一的 debug 判据（`main.ts` 由 `--dirname` 推导后 `setDebugMode`）。 */
export const isDebugMode = function (): boolean {
	return debugMode;
};

export const debugLog = function (...args: unknown[]) {
	if (debugMode) console.log(...args);
};

export const logBoot = function (name: string): void {
	if (!debugMode) return;
	console.log(`[boot:main] ${name} +${(process.uptime() * 1000).toFixed(1)}ms`);
};
