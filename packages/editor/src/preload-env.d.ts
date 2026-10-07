import type { YamiBridgeApi } from './services/ipc/preload-api.ts';

declare global {
	interface Window {
		yami?: YamiBridgeApi;
		__nodeRequire?: (moduleId: string) => unknown;
		__SKIP_AUTO_INIT__?: boolean;
	}
}

export {};
