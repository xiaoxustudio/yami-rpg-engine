import { shell } from 'electron';
import nodeFs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { Path } from '@app/utils/config';
import { append, remove } from '@app/utils/array';
import { Data } from '@app/data/data-object.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { filterGUID, parseFileSize, parseGUID } from '@app/services/file-system/path-utils.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { Cursor } from '@app/composables/usePointerObjectWindow';

const loadCluster = () => import('@app/tools/window-cluster');
const Scene = getLazyWindow('scene', () => loadCluster().then((m) => m.Scene));
const UI = getLazyWindow('ui', () => import('@app/engine/ui/ui-singleton.ts').then((m) => m.UI));
const Animation = getLazyWindow('animation', () => loadCluster().then((m) => m.Animation));
const Particle = getLazyWindow('particle', () => loadCluster().then((m) => m.Particle));
const Log = getLazyWindow('log', () => loadCluster().then((m) => m.Log));

// oxlint-disable-next-line no-explicit-any
type FileMethod = (...args: any[]) => any;

export const File: {
	root: string;
	promises: Record<string, Promise<HTMLImageElement>>;
	get: FileMethod | null;
	getPath: FileMethod | null;
	parseMetaName: FileMethod | null;
	save: FileMethod | null;
	saveFile: FileMethod | null;
	planToSave: FileMethod | null;
	cancelSave: FileMethod | null;
	parseFileSize: FileMethod | null;
	getFileName: FileMethod | null;
	getImageResolution: FileMethod | null;
	openPath: FileMethod | null;
	openURL: FileMethod | null;
	showInExplorer: FileMethod | null;
	showOpenDialog: FileMethod | null;
	showSaveDialog: FileMethod | null;
	path: FileMethod | null;
	parseGUID: FileMethod | null;
	filterGUID: FileMethod | null;
	updateRoot: FileMethod | null;
	route: FileMethod | null;
} = {
	root: '',
	promises: {},
	get: null,
	getPath: null,
	parseMetaName: null,
	save: null,
	saveFile: null,
	planToSave: null,
	cancelSave: null,
	parseFileSize: null,
	getFileName: null,
	getImageResolution: null,
	openPath: null,
	openURL: null,
	showInExplorer: null,
	showOpenDialog: null,
	showSaveDialog: null,
	path: null,
	parseGUID: null,
	filterGUID: null,
	updateRoot: null,
	route: null
};

function getFallbackRoot(): string {
	if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
		return typeof process !== 'undefined' && typeof process.cwd === 'function'
			? Path.resolve(process.cwd(), 'Project')
			: '';
	}
	return typeof fileURLToPath === 'function' ? Path.dirname(fileURLToPath(document.baseURI)) : '';
}

File.get = function (descriptor) {
	let path: string | undefined;
	if (descriptor.path) {
		path = File.path?.(descriptor.path);
	} else if (descriptor.guid) {
		path = (File.path as FileMethod)(this.getPath!(descriptor.guid));
	} else if (descriptor.local) {
		const localPath = String(descriptor.local);
		path = /^[A-Za-z]:[\\/]/.test(localPath)
			? localPath
			: getFallbackRoot() + '/' + localPath.replace(/^[\\/]+/, '');
	} else {
		Log.throw!(new Error('Invalid parameter'));
	}
	const type = descriptor.type;
	switch (type) {
		case 'image': {
			if (descriptor.guid) {
				const meta = Data.manifest.guidMap[descriptor.guid];
				if (meta) path += `?ver=${meta.mtimeMs}`;
			}
			const promises = this.promises;
			return (
				promises[path!] ||
				(promises[path!] = new Promise((resolve) => {
					const image = new Image();
					(image as HTMLImageElement & { guid?: string }).guid = descriptor.guid ?? '';
					image.onload = () => {
						delete promises[path!];
						image.onload = null;
						image.onerror = null;
						resolve(image);
					};
					image.onerror = () => {
						delete promises[path!];
						image.onload = null;
						image.onerror = null;
						image.src = '';
						resolve(image);
					};
					image.src = File.route!(path);
				}))
			);
		}
		default:
			return new Promise((resolve, reject) => {
				try {
					const fs = nodeFs;
					if (typeof fs.readFileSync !== 'function') {
						resolve(type === 'json' ? {} : '');
						return;
					}
					const cleanPath = path!.replace(/\?ver=\d+$/, '');
					const absPath = /^[A-Za-z]:[\\/]|^[/\\]/.test(cleanPath)
						? cleanPath
						: typeof Path.resolve === 'function'
							? Path.resolve(this.root || getFallbackRoot(), cleanPath)
							: cleanPath;
					if (type === 'arraybuffer') {
						const buffer = fs.readFileSync(absPath);
						resolve(
							buffer.buffer.slice(
								buffer.byteOffset,
								buffer.byteOffset + buffer.byteLength
							)
						);
					} else {
						const content = fs.readFileSync(absPath, 'utf-8');
						if (type === 'json') {
							try {
								resolve(JSON.parse(content));
							} catch (_parseError) {
								resolve({ code: content });
							}
						} else {
							resolve(content);
						}
					}
				} catch (_error: unknown) {
					reject(new URIError(path));
				}
			});
	}
};

File.getPath = function (guid) {
	return Data.manifest.guidMap[guid]?.path ?? '';
};

File.save = function (hint = true) {
	void Data.saveManifest();

	const { guidMap, changes } = Data.manifest;
	for (const meta of changes) {
		if (guidMap[meta.guid] === meta) {
			File.saveFile!(meta);
		}
	}
	if (changes.length !== 0) {
		changes.length = 0;
	}

	if (hint) {
		Cursor.open('cursor-wait');
		setTimeout(() => {
			Cursor.close('cursor-wait');
		}, 100);
	}

	return YamiIpc.invoke.waitWriteFile();
};

File.saveFile = function (meta) {
	switch (meta) {
		case Scene.meta:
			Scene.save!();
			break;
		case UI.meta:
			UI.save!();
			break;
		case Animation.meta:
			Animation.save();
			break;
		case Particle.meta:
			Particle.save!();
			break;
		case Data.manifest.project.variables:
			Data.generateVariableEnumScript();
			break;
	}
	let text;
	const data = meta.dataMap?.[meta.guid];
	switch (typeof data) {
		case 'object':
			meta.tryFixGuid?.(data);
			text = JSON.stringify(data, null, 2);
			break;
		default:
			return Promise.resolve();
	}
	const path = meta.path;
	const route = File.path?.(path);
	return FSP.writeFile(route, text, true)
		.then(() => {})
		.catch((error: unknown) => {
			console.warn(error);
		});
};

File.planToSave = function (meta) {
	if (meta instanceof Object) {
		return append(Data.manifest.changes, meta);
	} else {
		throw new Error('Invalid file meta');
	}
};

File.cancelSave = function (meta) {
	return remove(Data.manifest.changes, meta);
};

File.parseFileSize = parseFileSize;

File.getFileName = (function IIFE() {
	const struct = { path: '', route: '' };
	return function (dir, base, ext = '') {
		let path = `${dir}/${base}${ext}`;
		let route = File.path?.(path);
		if (FS.existsSync(route)) {
			// oxlint-disable-next-line no-constant-condition
			for (let i = 1; true; i++) {
				path = `${dir}/${base} ${i}${ext}`;
				route = File.path?.(path);
				if (!FS.existsSync(route)) {
					break;
				}
			}
		}
		struct.path = path;
		struct.route = route;
		return struct;
	};
})();

File.getImageResolution = (function IIFE() {
	const promises: Record<string, Promise<{ width: number; height: number }>> = {};
	const resolution = { width: 0, height: 0 };
	return function (path) {
		let promise = promises[path];
		if (promise === undefined) {
			promise = promises[path] = new Promise((resolve, reject) => {
				const image = new Image();
				image.src = File.route!(path);
				const intervalIndex = setInterval(() => {
					if (image.naturalWidth !== 0) {
						resolution.width = image.naturalWidth;
						resolution.height = image.naturalHeight;
						delete promises[path];
						clearInterval(intervalIndex);
						resolve(resolution);
						image.src = '';
					} else if (image.complete) {
						delete promises[path];
						clearInterval(intervalIndex);
						reject(new URIError('Image load failed.'));
					}
				});
			});
		}
		return promise;
	};
})();

File.openPath = function (path) {
	YamiIpc.send.openPath(path);
};

File.openURL = function (url) {
	if (url) {
		void shell.openExternal(url);
	}
};

File.showInExplorer = function (path) {
	YamiIpc.send.showItemInFolder(path);
};

File.showOpenDialog = function (options) {
	return YamiIpc.invoke.showOpenDialog(options);
};

File.showSaveDialog = function (options) {
	return YamiIpc.invoke.showSaveDialog(options);
};

File.parseMetaName = function (meta: { path: string }) {
	const alias = File.filterGUID!(meta.path);
	const extname = Path.extname(alias);
	return Path.basename(alias, extname);
};

File.parseGUID = parseGUID;
File.filterGUID = filterGUID;

File.updateRoot = function (path) {
	const index = path.lastIndexOf('/');
	this.root = path.slice(0, index + 1);
};

File.path = function (relativePath) {
	const isAbsolute = /^[A-Za-z]:[\\/]/.test(relativePath);
	if (isAbsolute) return relativePath;
	const base = this.root || getFallbackRoot();
	return base.replace(/[\\/]+$/, '') + '/' + relativePath;
};

File.route = function (relativePath) {
	const isAbsolute = /^[A-Za-z]:[\\/]/.test(relativePath);
	const base = (this.root || getFallbackRoot()).replace(/[\\/]+$/, '');
	const route = (isAbsolute ? relativePath : base + '/' + relativePath).replace(
		/[\\/]{2,}/g,
		'/'
	);
	if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
		return `/local-file/?path=${route.replace(/\?ver=(\d+)$/, '#ver=$1')}`;
	}
	return route;
};
