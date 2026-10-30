import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const showMessageBox = vi.fn(async () => ({ response: 0 }));
const checkForUpdates = vi.fn(async () => undefined);
const quitAndInstall = vi.fn();
const handlers = new Map<string, (...args: unknown[]) => void>();

const appState = { isPackaged: true };

vi.mock('electron', () => ({
	app: {
		get isPackaged() {
			return appState.isPackaged;
		},
		getVersion: () => '1.0.18'
	},
	dialog: { showMessageBox }
}));

vi.mock('electron-updater', () => ({
	autoUpdater: {
		autoDownload: true,
		autoInstallOnAppQuit: true,
		allowPrerelease: false,
		checkForUpdates: () => checkForUpdates(),
		quitAndInstall: () => quitAndInstall(),
		on: (name: string, handler: (...args: unknown[]) => void) => {
			handlers.set(name, handler);
		}
	}
}));

vi.mock('../window-registry.ts', () => ({
	getEditorWindow: () => null
}));

/** `process.platform` 只读，用 defineProperty 临时改成 win32（CI 跑 Linux）。 */
function withPlatform<T>(platform: NodeJS.Platform, run: () => Promise<T> | T) {
	const descriptor = Object.getOwnPropertyDescriptor(process, 'platform');
	Object.defineProperty(process, 'platform', { value: platform, configurable: true });
	return Promise.resolve(run()).finally(() => {
		if (descriptor) Object.defineProperty(process, 'platform', descriptor);
	});
}

async function loadUpdater() {
	vi.resetModules();
	handlers.clear();
	return import('../updater');
}

describe('自动更新初始化（main/updater.ts）', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		showMessageBox.mockClear();
		checkForUpdates.mockClear();
		quitAndInstall.mockClear();
		appState.isPackaged = true;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('未打包时不检查更新', async () => {
		appState.isPackaged = false;
		const { initAutoUpdater } = await loadUpdater();
		await withPlatform('win32', async () => {
			initAutoUpdater();
			vi.advanceTimersByTime(60000);
		});
		expect(checkForUpdates).not.toHaveBeenCalled();
	});

	it('非 win32 平台直接跳过（发布渠道还没覆盖 macOS / Linux）', async () => {
		const { initAutoUpdater } = await loadUpdater();
		await withPlatform('linux', async () => {
			initAutoUpdater();
			vi.advanceTimersByTime(60000);
		});
		expect(checkForUpdates).not.toHaveBeenCalled();
	});

	it('打包后的 win32：启动 15s 后检查一次，且重复初始化只生效一次', async () => {
		const { initAutoUpdater } = await loadUpdater();
		await withPlatform('win32', async () => {
			initAutoUpdater();
			initAutoUpdater();
			vi.advanceTimersByTime(14999);
			expect(checkForUpdates).not.toHaveBeenCalled();
			vi.advanceTimersByTime(1);
			await Promise.resolve();
			expect(checkForUpdates).toHaveBeenCalledTimes(1);
		});
	});

	it('下载完成后询问用户，选「立即重启」会 quitAndInstall', async () => {
		const { initAutoUpdater } = await loadUpdater();
		await withPlatform('win32', async () => {
			initAutoUpdater();
			const onDownloaded = handlers.get('update-downloaded');
			expect(onDownloaded).toBeTypeOf('function');
			showMessageBox.mockResolvedValueOnce({ response: 0 });
			onDownloaded?.({ version: '1.0.19' });
			await Promise.resolve();
			expect(showMessageBox).toHaveBeenCalledTimes(1);
			expect(quitAndInstall).toHaveBeenCalledTimes(1);
		});
	});

	it('下载完成后选「稍后」不重启（下次退出时由 autoInstallOnAppQuit 安装）', async () => {
		const { initAutoUpdater } = await loadUpdater();
		await withPlatform('win32', async () => {
			initAutoUpdater();
			showMessageBox.mockResolvedValueOnce({ response: 1 });
			handlers.get('update-downloaded')?.({ version: '1.0.19' });
			await Promise.resolve();
			expect(quitAndInstall).not.toHaveBeenCalled();
		});
	});

	it('更新检查失败只记一条 warn，不向上抛（启动流程不能被更新器拖垮）', async () => {
		const { initAutoUpdater } = await loadUpdater();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		checkForUpdates.mockRejectedValueOnce(new Error('network down'));
		await withPlatform('win32', async () => {
			initAutoUpdater();
			vi.advanceTimersByTime(15000);
			await Promise.resolve();
			await Promise.resolve();
		});
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});
