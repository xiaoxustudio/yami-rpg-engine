// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

const electronMocks = vi.hoisted(() => {
	const created: Array<Record<string, unknown>> = [];

	class FakeBrowserWindow {
		config: unknown;
		webContents = {
			setWindowOpenHandler: vi.fn(),
			on: vi.fn()
		};
		setMenuBarVisibility = vi.fn();
		loadFile = vi.fn();
		on = vi.fn();
		once = vi.fn();
		isDestroyed = vi.fn(() => false);
		send = vi.fn();
		constructor(options: Record<string, unknown>) {
			created.push(options);
		}
	}

	return { created, FakeBrowserWindow };
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

const { createPlayerWindow } = await import('../window-manager.ts');
const { setDebugMode } = await import('../log.ts');

const makeProject = (): string => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yami-player-window-'));
	fs.mkdirSync(path.join(dir, 'Data'), { recursive: true });
	fs.writeFileSync(
		path.join(dir, 'Data/config.json'),
		JSON.stringify({ window: { title: 'T', width: 640, height: 480 } })
	);
	return dir;
};

const lastArguments = (): unknown => {
	const options = electronMocks.created.at(-1) as {
		webPreferences?: { additionalArguments?: unknown };
	};
	return options?.webPreferences?.additionalArguments;
};

describe('createPlayerWindow 的 debug 标记', () => {
	beforeEach(() => {
		electronMocks.created.length = 0;
	});

	it('debug 关闭时不带 --debug-mode', () => {
		setDebugMode(false);
		const player = createPlayerWindow(
			new electronMocks.FakeBrowserWindow({}) as never,
			makeProject()
		);
		expect(player).toBeTruthy();
		expect(lastArguments()).toEqual([]);
	});

	it('debug 打开时带上 --debug-mode', () => {
		setDebugMode(true);
		createPlayerWindow(new electronMocks.FakeBrowserWindow({}) as never, makeProject());
		expect(lastArguments()).toEqual(['--debug-mode']);
	});

	it('两者都读同一份主进程 debug 状态（可来回切换）', () => {
		setDebugMode(true);
		createPlayerWindow(new electronMocks.FakeBrowserWindow({}) as never, makeProject());
		expect(lastArguments()).toEqual(['--debug-mode']);

		setDebugMode(false);
		createPlayerWindow(new electronMocks.FakeBrowserWindow({}) as never, makeProject());
		expect(lastArguments()).toEqual([]);
	});
});
