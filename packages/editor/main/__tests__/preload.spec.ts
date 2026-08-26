// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
		(globalThis as unknown as { window?: Record<string, unknown> }).window = {};
		vi.resetModules();
		await import('../preload.ts');
		const windowRef = (globalThis as unknown as { window?: Record<string, unknown> }).window;
		expect(windowRef?.yami).toBeTruthy();
		expect(electronMock.contextBridge.exposeInMainWorld).not.toHaveBeenCalled();
		delete (globalThis as unknown as { window?: Record<string, unknown> }).window;
	});
});
