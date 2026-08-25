import type { YamiBridgeApi } from './services/ipc/preload-api.ts';

declare global {
	interface Window {
		yami?: YamiBridgeApi;
	}
}

export {};
