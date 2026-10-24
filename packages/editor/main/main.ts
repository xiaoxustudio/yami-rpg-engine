import { app, Menu, session } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import fs from 'fs';
import path from 'path';
import { createEditorWindow } from './window-manager.ts';
import { promises } from './ipc-handlers.ts';
import { logBoot, setDebugMode } from './log.ts';
import { initAutoUpdater } from './updater.ts';

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

const devServerUrl = process.argv.find((arg) => arg.startsWith('--dev-server-url='))?.split('=')[1];
const VITE_DEV_URL = devServerUrl || 'http://localhost:5173';
const useViteDev = !!devServerUrl;
setDebugMode(debug);

logBoot('main-modules-loaded');

const extensionPath = path.resolve(dirname, 'extension');

/**
 * 加载 extension/ 下的全部扩展。
 */
async function loadExtensions(root: string): Promise<void> {
	if (!fs.existsSync(root)) {
		fs.mkdirSync(root, { recursive: true });
		return;
	}
	for (const entry of fs.readdirSync(root)) {
		const full = path.resolve(root, entry);
		try {
			// oxlint-disable-next-line no-await-in-loop
			await session.defaultSession.loadExtension(full);
		} catch (error) {
			console.error(`[extension] 加载失败 ${entry}: ${(error as Error).message}`);
		}
	}
}

app.on('ready', () => {
	logBoot('app-ready');
	session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
		callback(false);
	});
	session.defaultSession.setPermissionCheckHandler(() => false);

	app.on('web-contents-created', (_event, contents) => {
		contents.setWindowOpenHandler(() => ({ action: 'deny' }));
		contents.on('will-navigate', (event, url) => {
			const allowed = url.startsWith('file://') || url.startsWith(VITE_DEV_URL);
			if (!allowed) event.preventDefault();
		});
	});

	createEditorMenu();
	createEditorWindow(debug, dirname, useViteDev, VITE_DEV_URL);
	logBoot('window-created');
	initAutoUpdater();
	void loadExtensions(extensionPath).catch((error: unknown) => {
		console.error(`[extension] 扫描扩展目录失败: ${(error as Error).message}`);
	});
});

app.on('window-all-closed', () => {
	app.quit();
});

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
			role: 'toggleFullScreen' as 'togglefullscreen'
		});
	}
	file.submenu.push({
		label: 'Toogle DevTools',
		accelerator: 'F12',
		role: 'toggleDevTools'
	});
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
