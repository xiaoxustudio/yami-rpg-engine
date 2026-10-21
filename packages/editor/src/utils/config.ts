import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { markBoot } from '@app/utils/boot-timeline';
import nodePath from 'node:path';
import os from 'node:os';
import nodeFs from 'node:fs';
import type { EditorConfigShape } from '@app/stores/editor';
export const Path: typeof nodePath & { slash: (path: string) => string } =
	nodePath as typeof nodePath & { slash: (path: string) => string };

export const GlobalPathForDir = os.homedir?.() ?? '';
export const ConfigDir = '.openyami';
export const GlobalPath =
	typeof Path.resolve === 'function' ? Path.resolve(GlobalPathForDir, ConfigDir) : '';

export const loadConfigPromise: Promise<EditorConfigShape> | undefined = (() => {
	if (typeof window.__nodeRequire !== 'function') {
		return undefined;
	}
	markBoot('config:start');
	const dir = Path.resolve(GlobalPath);
	if (!nodeFs.existsSync(dir)) {
		nodeFs.mkdirSync(dir, { recursive: true });
	}
	const configFile = Path.join(GlobalPath, 'config.json');
	return nodeFs.promises
		.readFile(configFile, 'utf8')
		.then((json) => {
			markBoot('config:file-read');
			return JSON.parse(json);
		})
		.catch(() => {
			markBoot('config:fallback');
			return import('@app/file/file-system-core.ts').then(({ File }) => {
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
					return YamiIpc.invoke
						.getDirPath('documents')
						.catch((_error) => 'C:')
						.then((docPath) => {
							const dialogs = config.dialogs as Record<string, string> | undefined;
							for (const key of Object.keys(dialogs ?? {})) {
								if (dialogs) dialogs[key] = Path.slash(docPath ?? 'C:');
							}
							return config;
						});
				});
			});
		});
})();
