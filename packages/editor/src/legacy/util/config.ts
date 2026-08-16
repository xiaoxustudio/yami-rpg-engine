import { ipcRenderer } from 'electron';
import nodePath from 'node:path';
import os from 'node:os';
import nodeFs from 'node:fs';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import type { EditorConfigShape } from '@app/stores/editor';
export const Path: typeof nodePath & { slash: (path: string) => string } =
	nodePath as typeof nodePath & { slash: (path: string) => string };

export const GlobalPathForDir = os.homedir?.() ?? '';
export const ConfigDir = '.openyami';
export const GlobalPath =
	typeof Path.resolve === 'function' ? Path.resolve(GlobalPathForDir, ConfigDir) : '';

// 提前读取配置文件以减少等待时间 promise.then的执行顺序在main.js之后 文件名必须与 Editor.saveConfig（main/config.js）写入的路径一致，否则写到 config.json、读到 yami-config.json，配置无法持久化
export const loadConfigPromise: Promise<EditorConfigShape> | undefined = (() => {
	if (typeof (window as unknown as Record<string, unknown>).__nodeRequire !== 'function') {
		return undefined;
	}
	const dir = Path.resolve(GlobalPath);
	if (!nodeFs.existsSync(dir)) {
		nodeFs.mkdirSync(dir, { recursive: true });
	}
	const configFile = Path.join(GlobalPath, 'config.json');
	return nodeFs.promises
		.readFile(configFile, 'utf8')
		.then((json) => JSON.parse(json))
		.catch(() => {
			// 如果不存在配置文件或加载出错
			return import('../file/file-system-core.ts').then(({ File }) => {
				return File.get!({
					local: 'default.json',
					type: 'json'
				}).then((config: EditorConfigShape) => {
					config.theme = 'dark';
					config.language = '';
					config.project = '';
					config.recent = [];
					config.scriptEditor = {
						mode: 'by-file-extension',
						path: ''
					};
					return ipcRenderer
						.invoke(CHANNELS.invoke.getDirPath, 'documents')
						.catch((error) => 'C:')
						.then((docPath) => {
							const dialogs = config.dialogs as Record<string, string> | undefined;
							for (const key of Object.keys(dialogs ?? {})) {
								if (dialogs) dialogs[key] = Path.slash(docPath);
							}
							return config;
						});
				});
			});
		});
})();
