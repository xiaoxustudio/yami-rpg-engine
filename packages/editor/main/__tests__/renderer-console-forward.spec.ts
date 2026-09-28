// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const electronMocks = vi.hoisted(() => {
	const listeners = new Map<string, (...args: unknown[]) => void>();

	class FakeBrowserWindow {
		webContents = {
			setWindowOpenHandler: vi.fn(),
			executeJavaScript: vi.fn(() => Promise.resolve()),
			setZoomFactor: vi.fn(),
			on: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
				listeners.set(`wc:${event}`, fn);
			})
		};
		setMenuBarVisibility = vi.fn();
		loadURL = vi.fn(() => Promise.resolve());
		loadFile = vi.fn(() => Promise.resolve());
		on = vi.fn();
		once = vi.fn();
		show = vi.fn();
		maximize = vi.fn();
		close = vi.fn();
		isDestroyed = vi.fn(() => false);
		send = vi.fn();
	}

	return { listeners, FakeBrowserWindow };
});

vi.mock('electron', () => ({
	app: { getAppPath: () => process.cwd() },
	BrowserWindow: electronMocks.FakeBrowserWindow
}));

vi.mock('../apk.ts', () => ({
	abortBuild: vi.fn(),
	main: vi.fn(),
	isBuilding: vi.fn(() => false)
}));

const { createEditorWindow } = await import('../window-manager.ts');
const { setDebugMode } = await import('../log.ts');

type ConsoleDetails = {
	level: 'info' | 'warning' | 'error' | 'debug';
	message: string;
	lineNumber: number;
	sourceId: string;
};

const emitConsole = (details: ConsoleDetails): void => {
	const listener = electronMocks.listeners.get('wc:console-message');
	expect(listener).toBeTypeOf('function');
	listener!(details);
};

describe('createEditorWindow 的 console 转发', () => {
	beforeAll(() => {
		// createEditorWindow 里读 ~/.openyami/config.json 的 promise 在测试中不会被消费
		process.on('unhandledRejection', () => undefined);
	});

	beforeEach(() => {
		electronMocks.listeners.clear();
		createEditorWindow(false, process.cwd(), false, 'http://localhost:5173');
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		setDebugMode(false);
		vi.restoreAllMocks();
	});

	/**
	 * 回归：生产环境下渲染进程每一条 console.log 都会跨进程写主进程 stdout，
	 * 循环里的日志直接变成瓶颈。
	 */
	it('非 debug 时不转发 log 级别', () => {
		setDebugMode(false);
		emitConsole({ level: 'debug', message: 'noise', lineNumber: 1, sourceId: 'a.ts' });
		emitConsole({ level: 'info', message: 'noise', lineNumber: 2, sourceId: 'a.ts' });
		emitConsole({ level: 'warning', message: 'noise', lineNumber: 3, sourceId: 'a.ts' });
		expect(console.log).not.toHaveBeenCalled();
	});

	it('非 debug 时仍然转发 error 级别', () => {
		setDebugMode(false);
		emitConsole({ level: 'error', message: 'boom', lineNumber: 9, sourceId: 'b.ts' });
		expect(console.error).toHaveBeenCalledWith('[renderer:error] boom (b.ts:9)');
	});

	it('debug 时全量转发，且 level 用新签名的字符串而不是旧数字映射', () => {
		setDebugMode(true);
		emitConsole({ level: 'info', message: 'hello', lineNumber: 4, sourceId: 'c.ts' });
		expect(console.log).toHaveBeenCalledWith('[renderer:info] hello (c.ts:4)');
		expect(console.error).not.toHaveBeenCalled();
	});

	it('debug 下 error 走 console.error 而不是 console.log', () => {
		setDebugMode(true);
		emitConsole({ level: 'error', message: 'kaboom', lineNumber: 7, sourceId: 'd.ts' });
		expect(console.error).toHaveBeenCalledWith('[renderer:error] kaboom (d.ts:7)');
		expect(console.log).not.toHaveBeenCalled();
	});
});
