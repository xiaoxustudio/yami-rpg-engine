// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { CHANNELS } from '../../src/services/ipc/channels.ts';

const electronMocks = vi.hoisted(() => {
	const handlers = {} as Record<string, (...args: any[]) => any>;
	const listeners = {} as Record<string, (...args: any[]) => any>;
	const ipcMain = {
		handle: vi.fn((channel: string, fn: (...args: any[]) => any) => {
			handlers[channel] = fn;
		}),
		on: vi.fn((channel: string, fn: (...args: any[]) => any) => {
			listeners[channel] = fn;
		})
	};
	const app = {
		getPath: vi.fn(),
		getAppPath: vi.fn(),
		commandLine: {
			getSwitchValue: vi.fn(),
			appendSwitch: vi.fn(),
			removeSwitch: vi.fn(),
			hasSwitch: vi.fn()
		}
	};
	const shell = {
		openPath: vi.fn(),
		openExternal: vi.fn(),
		showItemInFolder: vi.fn(),
		trashItem: vi.fn()
	};
	const clipboard = {
		readBuffer: vi.fn(),
		writeBuffer: vi.fn()
	};
	const dialog = {
		showOpenDialog: vi.fn(),
		showSaveDialog: vi.fn()
	};
	const BrowserWindow = {
		fromWebContents: vi.fn()
	};
	return { handlers, listeners, ipcMain, app, shell, clipboard, dialog, BrowserWindow };
});

vi.mock('electron', () => ({
	app: electronMocks.app,
	ipcMain: electronMocks.ipcMain,
	dialog: electronMocks.dialog,
	shell: electronMocks.shell,
	clipboard: electronMocks.clipboard,
	BrowserWindow: electronMocks.BrowserWindow
}));

vi.mock('../window-manager.ts', () => ({
	getWindowFromEvent: vi.fn(),
	createPlayerWindow: vi.fn(),
	createEditorWindow: vi.fn()
}));

vi.mock('../services/server.ts', () => ({
	getServerState: vi.fn(),
	startServer: vi.fn(),
	toQrcode: vi.fn(),
	getLocalIp: vi.fn(),
	stopServer: vi.fn()
}));

vi.mock('../services/excel.ts', () => ({
	toExcel: vi.fn(),
	fromExcel: vi.fn()
}));

vi.mock('../services/tsc.ts', () => ({
	startTSC: vi.fn(),
	stopTSC: vi.fn(),
	compileTscFile: vi.fn()
}));

vi.mock('../apk.ts', () => ({
	isBuilding: vi.fn(() => false),
	main: vi.fn(),
	abortBuild: vi.fn()
}));

import '../ipc-handlers.ts';

const invokeWriteFile = (filePath: unknown, text: unknown, check?: unknown): Promise<unknown> =>
	(electronMocks.handlers[CHANNELS.invoke.writeFile] as (...args: unknown[]) => Promise<unknown>)(
		{},
		filePath,
		text,
		check
	);

const emitOpenVscode = (scriptPath: unknown, line?: unknown, column?: unknown): void =>
	(electronMocks.listeners[CHANNELS.on.openVscode] as (...args: unknown[]) => void)(
		{},
		scriptPath,
		line,
		column
	);

const emitOpenPath = (targetPath: unknown): void =>
	(electronMocks.listeners[CHANNELS.on.openPath] as (...args: unknown[]) => void)({}, targetPath);

const emitShowItemInFolder = (filePath: unknown): void =>
	(electronMocks.listeners[CHANNELS.on.showItemInFolder] as (...args: unknown[]) => void)(
		{},
		filePath
	);

describe('ipc-handlers 安全校验', () => {
	let tmpDir: string;

	beforeAll(() => {
		process.on('unhandledRejection', () => undefined);
	});

	beforeEach(() => {
		electronMocks.shell.openPath.mockClear();
		electronMocks.shell.openExternal.mockClear();
		electronMocks.shell.showItemInFolder.mockClear();
		electronMocks.shell.trashItem.mockClear();
	});

	afterAll(async () => {
		if (tmpDir) {
			await fs.rm(tmpDir, { recursive: true, force: true });
		}
	});

	describe('writeFile handler', () => {
		it('拒绝空路径且不写文件', async () => {
			const writeSpy = vi.spyOn(fs, 'writeFile');
			await expect(invokeWriteFile('', 'text')).rejects.toThrow('invalid file path');
			expect(writeSpy).not.toHaveBeenCalled();
			writeSpy.mockRestore();
		});

		it('拒绝含 \\0 的路径且不写文件', async () => {
			const writeSpy = vi.spyOn(fs, 'writeFile');
			await expect(invokeWriteFile('C:\\x\\y\0.txt', 'text')).rejects.toThrow(
				'invalid file path'
			);
			expect(writeSpy).not.toHaveBeenCalled();
			writeSpy.mockRestore();
		});

		it('拒绝相对路径且不写文件', async () => {
			const writeSpy = vi.spyOn(fs, 'writeFile');
			await expect(invokeWriteFile('relative/path.txt', 'text')).rejects.toThrow(
				'file path must be absolute'
			);
			expect(writeSpy).not.toHaveBeenCalled();
			writeSpy.mockRestore();
		});

		it('接受绝对路径并写入内容', async () => {
			tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yami-ipc-test-'));
			const absPath = path.join(tmpDir, 'out.txt');
			await invokeWriteFile(absPath, 'hello');
			expect(await fs.readFile(absPath, 'utf-8')).toBe('hello');
		});

		it('check=true 时先 stat 存在的文件后写入', async () => {
			tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yami-ipc-test-'));
			const absPath = path.join(tmpDir, 'exists.txt');
			await fs.writeFile(absPath, 'before');
			await invokeWriteFile(absPath, 'after', true);
			expect(await fs.readFile(absPath, 'utf-8')).toBe('after');
		});

		it('check=true 且文件不存在时抛错', async () => {
			tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yami-ipc-test-'));
			const absPath = path.join(tmpDir, 'missing.txt');
			await expect(invokeWriteFile(absPath, 'x', true)).rejects.toThrow();
		});
	});

	describe('openVscode handler', () => {
		it('恶意路径中的 ? 与 # 被剔除（防 vscode:// 协议注入）', () => {
			const malicious = path.join(path.parse(process.cwd()).root, 'x?#..');
			emitOpenVscode(malicious);
			expect(electronMocks.shell.openExternal).toHaveBeenCalledTimes(1);
			const [url] = electronMocks.shell.openExternal.mock.calls[0];
			expect(url).not.toContain('?');
			expect(url).not.toContain('#');
			expect(url).toContain('vscode://file/');
		});

		it('相对路径不触发 openExternal', () => {
			emitOpenVscode('relative/script.js', 1, 2);
			expect(electronMocks.shell.openExternal).not.toHaveBeenCalled();
		});

		it('含 \\0 的路径不触发 openExternal', () => {
			emitOpenVscode('C:\\test\0file.js', 1, 2);
			expect(electronMocks.shell.openExternal).not.toHaveBeenCalled();
		});

		it('空路径不触发 openExternal', () => {
			emitOpenVscode('', 1, 2);
			expect(electronMocks.shell.openExternal).not.toHaveBeenCalled();
		});

		it('line/column 非数字时回退为 0', () => {
			const absPath = path.join(path.parse(process.cwd()).root, 'script.js');
			emitOpenVscode(absPath, 'not-a-number', undefined);
			expect(electronMocks.shell.openExternal).toHaveBeenCalledWith(
				`vscode://file/${absPath}:0:0`
			);
		});

		it('数字 line/column 原样拼入 URL', () => {
			const absPath = path.join(path.parse(process.cwd()).root, 'script.js');
			emitOpenVscode(absPath, 10, 20);
			expect(electronMocks.shell.openExternal).toHaveBeenCalledWith(
				`vscode://file/${absPath}:10:20`
			);
		});
	});

	describe('openPath handler', () => {
		it('含 \\0 的路径不调用 shell.openPath', () => {
			emitOpenPath('C:\\test\0file');
			expect(electronMocks.shell.openPath).not.toHaveBeenCalled();
		});

		it('空路径不调用 shell.openPath', () => {
			emitOpenPath('');
			expect(electronMocks.shell.openPath).not.toHaveBeenCalled();
		});

		it('合法绝对路径调用 shell.openPath', () => {
			const absPath = path.join(path.parse(process.cwd()).root, 'folder');
			emitOpenPath(absPath);
			expect(electronMocks.shell.openPath).toHaveBeenCalledWith(path.normalize(absPath));
		});
	});

	describe('showItemInFolder handler', () => {
		it('含 \\0 的路径不调用 shell.showItemInFolder', () => {
			emitShowItemInFolder('C:\\test\0file.txt');
			expect(electronMocks.shell.showItemInFolder).not.toHaveBeenCalled();
		});

		it('空路径不调用 shell.showItemInFolder', () => {
			emitShowItemInFolder('');
			expect(electronMocks.shell.showItemInFolder).not.toHaveBeenCalled();
		});

		it('合法绝对路径调用 shell.showItemInFolder', () => {
			const absPath = path.join(path.parse(process.cwd()).root, 'file.txt');
			emitShowItemInFolder(absPath);
			expect(electronMocks.shell.showItemInFolder).toHaveBeenCalledWith(
				path.normalize(absPath)
			);
		});
	});
});
