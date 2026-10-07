import type { YamiBridgeApi } from './services/ipc/preload-api.ts';
import type { BootMark } from './utils/boot-timeline';

declare global {
	interface Window {
		yami?: YamiBridgeApi;
		__nodeRequire?: (moduleId: string) => unknown;
		__SKIP_AUTO_INIT__?: boolean;
		__BOOT_MARKS__?: BootMark[];
	}
}

export {};
