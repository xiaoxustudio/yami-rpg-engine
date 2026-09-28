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
