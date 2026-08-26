let debugMode = false;

export const setDebugMode = function (value: boolean) {
	debugMode = value;
};

export const debugLog = function (...args: unknown[]) {
	if (debugMode) console.log(...args);
};
