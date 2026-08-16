// [YAMI RPG EDITOR]主线程

// ESM import——npm 包和 Node 内建模块 external 掉后 runtime 用 createRequire 桥解析
import { app, Menu, session } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import fs from 'fs';
import path from 'path';
import { createEditorWindow } from './window-manager.ts';
import { promises } from './ipc-handlers.ts';

// 模块所在目录（dist-electron/），不依赖 import.meta.url 或 CJS __dirname 全局
const __dirname = path.resolve(app.getAppPath(), 'dist-electron');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// 含 --dirname 参数时表示 Node.js 调试模式，重定向根目录并开启调试
let debug = false;
let dirname = app.getAppPath();
const regexp = /^--dirname=(.+)$/;
let match;
for (const arg of process.argv) {
	if ((match = arg.match(regexp))) {
		dirname = path.resolve(dirname, match[1]);
		debug = true;
		break;
	}
}

// 判据用 devServerUrl 存在性而非 debug，避免 start:prod 带 --debug-mode 时误走 dev URL 致空白页
const devServerUrl = process.argv.find((arg) => arg.startsWith('--dev-server-url='))?.split('=')[1];
const VITE_DEV_URL = devServerUrl || 'http://localhost:5173';
const useViteDev = !!devServerUrl;

const extensionPath = path.join('./extension');
app.on('ready', () => {
	createEditorMenu();
	createEditorWindow(debug, dirname, useViteDev, VITE_DEV_URL);
	const isExtension = fs.existsSync(extensionPath);
	if (!isExtension) fs.mkdirSync(extensionPath);
	const dirs = fs.readdirSync(extensionPath);
	dirs.forEach(async (v) => {
		try {
			await session.defaultSession.loadExtension(v);
		} catch {}
	});
});

app.on('window-all-closed', () => {
	app.quit();
});

// 阻止退出直到写入完成
app.on('before-quit', async (event) => {
	event.preventDefault();
	await Promise.allSettled(promises);
	app.exit();
});

const createEditorMenu = function () {
	const template = createMenuTemplate();

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
};

const createMenuTemplate = function () {
	const template = [];
	const file = {
		label: 'File',
		submenu: [] as MenuItemConstructorOptions[]
	};
	const edit = {
		label: 'Edit',
		submenu: [] as MenuItemConstructorOptions[]
	};
	// 开发模式：开启F5刷新
	if (debug) {
		file.submenu.push({
			label: 'Reload',
			accelerator: 'F5',
			role: 'forceReload'
		});
	}
	if (process.platform !== 'darwin') {
		file.submenu.push({
			label: 'FullScreen',
			accelerator: 'F11',
			role: 'toggleFullScreen' as any
		});
	}
	file.submenu.push({
		label: 'Toogle DevTools',
		accelerator: 'F12',
		role: 'toggleDevTools'
	});
	// 启用MacOS开发者工具的复制粘贴操作(但跟编辑器冲突)
	if (process.platform === 'darwin' && debug) {
		edit.submenu.push(
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'selectAll' }
		);
	}
	if (file.submenu.length !== 0) {
		template.push(file);
	}
	if (edit.submenu.length !== 0) {
		template.push(edit);
	}
	return template;
};
