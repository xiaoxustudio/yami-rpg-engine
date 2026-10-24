import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { getEditorWindow } from './window-registry.ts';

let started = false;

export function initAutoUpdater(): void {
	if (started || !app.isPackaged || process.platform !== 'win32') return;
	started = true;

	autoUpdater.autoDownload = true;
	autoUpdater.autoInstallOnAppQuit = true;
	autoUpdater.allowPrerelease = app.getVersion().includes('-');

	autoUpdater.on('error', (error) => {
		console.warn('[updater] 检查更新失败：', error.message);
	});
	autoUpdater.on('update-available', (info) => {
		console.log('[updater] 发现新版本：', info.version);
	});
	autoUpdater.on('update-not-available', () => {
		console.log('[updater] 已是最新版本');
	});
	autoUpdater.on('update-downloaded', async (info) => {
		const window = getEditorWindow();
		const options = {
			type: 'info' as const,
			title: '更新已就绪',
			message: `新版本 ${info.version} 已下载完成。`,
			detail: '重启后应用更新；选择“稍后”会在下次退出时自动安装。',
			buttons: ['立即重启', '稍后'],
			defaultId: 0,
			cancelId: 1
		};
		const result = window
			? await dialog.showMessageBox(window, options)
			: await dialog.showMessageBox(options);
		if (result.response === 0) autoUpdater.quitAndInstall();
	});

	setTimeout(() => {
		void autoUpdater.checkForUpdates().catch((error: unknown) => {
			console.warn('[updater] 启动检查失败：', (error as Error)?.message);
		});
	}, 15000);
}
