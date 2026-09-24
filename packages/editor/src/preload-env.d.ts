import type { YamiBridgeApi } from './services/ipc/preload-api.ts';

declare global {
	interface Window {
		yami?: YamiBridgeApi;
		/**
		 * `index.html`（head 里的行内 script，早于任何模块）注入：`window.__nodeRequire = window.require;`
		 * —— `electron-renderer-resolve` 生成的 importmap 也靠它把 `electron` / `fs` 等解析过去。
		 * 声明为可选是**如实描述**：Node 集成关闭（例如 vitest/jsdom，或 `window.require` 不存在）时
		 * 它确实是 `undefined`，`utils/config.ts` 据此判断能否直接读本地配置文件。
		 */
		__nodeRequire?: (moduleId: string) => unknown;
		/**
		 * `index.html`（body 开头）注入：`window.__SKIP_AUTO_INIT__ = true;`
		 * ⇒ `main/startup.ts` 把初始化让位给一次性的 `vue-app-mounted` 事件（等 Vue 应用挂载完再启动）。
		 */
		__SKIP_AUTO_INIT__?: boolean;
	}
}

export {};
