// [YAMI RPG EDITOR]主线程

// ESM import——npm 包和 Node 内建模块 external 掉后 runtime 用 createRequire 桥解析
import { app, Menu, session } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import fs from 'fs';
import path from 'path';
import { createEditorWindow } from './window-manager.ts';
import { promises } from './ipc-handlers.ts';
import { setDebugMode } from './log.ts';

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
setDebugMode(debug);

// 扩展目录挂在 app 根（dirname）下，不能相对 cwd：打包后从任意目录启动时，
// 相对路径会在启动目录里凭空建一个 extension/，并且一个扩展都读不到。
const extensionPath = path.resolve(dirname, 'extension');

/**
 * 加载 extension/ 下的全部扩展。
 *
 * `loadExtension` 要的是**绝对路径**（原先传的是 `readdirSync` 出来的裸目录名），
 * 而且失败必须留下痕迹——此前是空 catch，装错扩展没有任何反馈。
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
	// 拒绝一切权限请求（摄像头/麦克风/地理位置等）
	session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
		callback(false);
	});
	session.defaultSession.setPermissionCheckHandler(() => false);

	// 全局防线：所有 webContents 一律禁止弹窗，禁止导航到非本地/dev 地址
	app.on('web-contents-created', (_event, contents) => {
		contents.setWindowOpenHandler(() => ({ action: 'deny' }));
		contents.on('will-navigate', (event, url) => {
			const allowed = url.startsWith('file://') || url.startsWith(VITE_DEV_URL);
			if (!allowed) event.preventDefault();
		});
	});

	createEditorMenu();
	createEditorWindow(debug, dirname, useViteDev, VITE_DEV_URL);
	void loadExtensions(extensionPath).catch((error: unknown) => {
		console.error(`[extension] 扫描扩展目录失败: ${(error as Error).message}`);
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
			role: 'toggleFullScreen' as 'togglefullscreen'
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
