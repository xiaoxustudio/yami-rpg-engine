// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { CHANNELS } from '../../src/services/ipc/channels.ts';
import { SEND_CHANNELS } from '../../src/services/ipc/preload-api.ts';
import type { YamiBridgeApi } from '../../src/services/ipc/preload-api.ts';

const electronMock = vi.hoisted(() => {
	const exposed: { name: string; api: YamiBridgeApi | null } = { name: '', api: null };
	const ipcRenderer = {
		on: vi.fn(),
		once: vi.fn(),
		invoke: vi.fn(() => Promise.resolve(undefined)),
		send: vi.fn(),
		sendSync: vi.fn()
	};
	const contextBridge = {
		exposeInMainWorld: vi.fn((name: string, api: YamiBridgeApi) => {
			exposed.name = name;
			exposed.api = api;
		})
	};
	return { exposed, ipcRenderer, contextBridge };
});

vi.mock('electron', () => ({
	contextBridge: electronMock.contextBridge,
	ipcRenderer: electronMock.ipcRenderer
}));

const getExposedApi = (): YamiBridgeApi => {
	if (!electronMock.exposed.api) throw new Error('api 未暴露');
	return electronMock.exposed.api;
};

const setContextIsolated = (value: boolean) => {
	Object.defineProperty(process, 'contextIsolated', { value, configurable: true });
};

beforeEach(() => {
	vi.clearAllMocks();
	electronMock.exposed.name = '';
	electronMock.exposed.api = null;
	delete (globalThis as { yami?: unknown }).yami;
});

describe('preload IPC 桥（安全边界）', () => {
	it('contextIsolated=true 时经 contextBridge 暴露 yami', async () => {
		setContextIsolated(true);
		vi.resetModules();
		await import('../preload.ts');
		expect(electronMock.contextBridge.exposeInMainWorld).toHaveBeenCalledWith(
			'yami',
			expect.anything()
		);
		const api = getExposedApi();
		expect(typeof api.invoke).toBe('object');
		expect(typeof api.sync).toBe('object');
		expect(typeof api.send).toBe('object');
		expect(typeof api.events).toBe('object');
	});

	it('events.on 仅接受白名单通道', async () => {
		setContextIsolated(true);
		vi.resetModules();
		await import('../preload.ts');
		const api = getExposedApi();
		const listener = () => {};
		for (const channel of SEND_CHANNELS) {
			api.events.on(channel, listener);
		}
		expect(electronMock.ipcRenderer.on).toHaveBeenCalledTimes(SEND_CHANNELS.length);
		api.events.on('not-a-send-channel' as never, listener);
		expect(electronMock.ipcRenderer.on).toHaveBeenCalledTimes(SEND_CHANNELS.length);
	});

	it('events.once 仅接受白名单通道', async () => {
		setContextIsolated(true);
		vi.resetModules();
		await import('../preload.ts');
		const api = getExposedApi();
		const listener = () => {};
		api.events.once(SEND_CHANNELS[0], listener);
		expect(electronMock.ipcRenderer.once).toHaveBeenCalledWith(
			SEND_CHANNELS[0],
			expect.any(Function)
		);
		api.events.once('not-a-send-channel' as never, listener);
		expect(electronMock.ipcRenderer.once).toHaveBeenCalledTimes(1);
	});

	it('send 走 ipcRenderer.send 且通道映射正确', async () => {
		setContextIsolated(true);
		vi.resetModules();
		await import('../preload.ts');
		const api = getExposedApi();
		api.send.minimizeWindow();
		expect(electronMock.ipcRenderer.send).toHaveBeenCalledWith(CHANNELS.on.minimizeWindow);
		api.send.openVscode('C:/a.ts', 1, 2);
		expect(electronMock.ipcRenderer.send).toHaveBeenCalledWith(
			CHANNELS.on.openVscode,
			'C:/a.ts',
			1,
			2
		);
	});

	it('invoke 走 ipcRenderer.invoke 且透传参数', async () => {
		setContextIsolated(true);
		vi.resetModules();
		await import('../preload.ts');
		const api = getExposedApi();
		await api.invoke.writeFile('C:/a.ts', 'content', true);
		expect(electronMock.ipcRenderer.invoke).toHaveBeenCalledWith(
			CHANNELS.invoke.writeFile,
			'C:/a.ts',
			'content',
			true
		);
	});

	it('sync 走 ipcRenderer.sendSync', async () => {
		setContextIsolated(true);
		vi.resetModules();
		await import('../preload.ts');
		const api = getExposedApi();
		api.sync.clipboardHas('text');
		expect(electronMock.ipcRenderer.sendSync).toHaveBeenCalledWith(
			CHANNELS.on.clipboardHas,
			'text'
		);
	});

	it('contextIsolated=false 时直挂 window.yami（当前编辑器窗口配置）', async () => {
		setContextIsolated(false);
		vi.resetModules();
		await import('../preload.ts');
		expect(window.yami).toBeTruthy();
		expect(electronMock.contextBridge.exposeInMainWorld).not.toHaveBeenCalled();
	});
});

/**
 * 回归：这两条兜底监听原先在主进程用 `did-finish-load` + `executeJavaScript` 注册，
 * 要等页面加载完成才生效，启动期（模块求值）抛出的错误全漏。现在改到 preload。
 */
describe('preload 兜底错误上报', () => {
	const importPreload = async (): Promise<void> => {
		setContextIsolated(false);
		vi.resetModules();
		await import('../preload.ts');
	};

	/** jsdom 自己也会往 console.error 写，所以按「调用参数里出现过某前缀」判定 */
	const hasCallWithPrefix = (spy: MockInstance, prefix: string): boolean =>
		spy.mock.calls.some((args: unknown[]) => args[0] === prefix);

	it('window error 以 [Uncaught Error] 前缀上报', async () => {
		await importPreload();
		const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		window.dispatchEvent(
			new ErrorEvent('error', { message: 'boom', filename: 'a.ts', lineno: 3, colno: 5 })
		);
		expect(hasCallWithPrefix(spy, '[Uncaught Error]')).toBe(true);
		spy.mockRestore();
	});

	it('ResizeObserver 循环上限告警不上报（与 src/main.ts 抑制器同口径）', async () => {
		await importPreload();
		const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		window.dispatchEvent(
			new ErrorEvent('error', { message: 'ResizeObserver loop limit exceeded' })
		);
		expect(hasCallWithPrefix(spy, '[Uncaught Error]')).toBe(false);
		spy.mockRestore();
	});

	it('unhandledrejection 以 [Unhandled Rejection] 前缀上报', async () => {
		await importPreload();
		const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		window.dispatchEvent(
			Object.assign(new Event('unhandledrejection'), { reason: new Error('rejected') })
		);
		expect(hasCallWithPrefix(spy, '[Unhandled Rejection]')).toBe(true);
		spy.mockRestore();
	});
});
