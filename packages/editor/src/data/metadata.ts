import { Data } from './data-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { Updater } from '@app/services/updater/updater.ts';

export const Meta = (function IIFE() {
	const typeMapToGroupName = () => ({
		...FileItem.dataMapNames,
		image: 'images',
		audio: 'audio',
		video: 'videos',
		script: 'script',
		font: 'fonts',
		other: 'others'
	});
	const loaderDescriptor = { path: null as string | null, type: 'json' };
	const fileDescriptor = { writable: true, value: null as unknown as FileItem };
	const guidDescriptor = { writable: true, value: '' };
	const codeDescriptor = { writable: true, value: '' };
	const groupDescriptor = { value: null };
	const dataMapDescriptor = { value: null };
	const descriptors = {
		file: fileDescriptor,
		guid: guidDescriptor,
		group: groupDescriptor,
		mtimeMs: { writable: true, value: null },
		versionId: { writable: true, value: -1 }
	};
	return class FileMeta {
		path: string;
		size: number;
		// 以下字段用 `declare` 仅作类型声明，运行期完全由 Object.defineProperties(this, descriptors) 定义为不可枚举属性。切勿写成类字段（如 `file;` 或 `file = null`）——useDefineForClassFields:true 下 TS 会发射 `Object.defineProperty(this,'file',{enumerable:true,...})`，使 JSON.stringify 看到 file -> FileItem.meta 循环引用。
		declare file: FileItem;
		declare guid: string;
		declare mtimeMs: number | null;
		declare versionId: number;
		declare group: unknown[];
		declare dataMap: Record<string, object> | null;
		x: number | null = null;
		y: number | null = null;
		parameters: unknown[] | null = null;
		// script 类型运行时由 Object.defineProperty 挂载（非枚举）
		declare code: string;

		constructor(file: FileItem, guid: string) {
			const { type, path } = file;
			this.path = path;
			this.size = Number((file.stats as unknown as { size: number }).size);

			switch (type) {
				case 'scene':
					this.x = 10;
					this.y = 10;
					break;
				case 'tileset':
					this.x = 0;
					this.y = 0;
					break;
				case 'script':
					this.parameters = Array.empty;
					Object.defineProperty(this, 'code', codeDescriptor);
					break;
			}

			const name = (FileItem.dataMapNames as Record<string, string>)[type];
			if (name !== undefined) {
				dataMapDescriptor.value = Data[name];
				Object.defineProperty(this, 'dataMap', dataMapDescriptor);

				const promise = file.promise ?? Promise.resolve();
				file.promise = promise
					.then(async () => {
						loaderDescriptor.path = this.path;
						const data = await File.get!(loaderDescriptor);
						if (data) {
							guidDescriptor.value = guid;
							Object.defineProperty(data, 'guid', guidDescriptor);
						}
						this.dataMap![guid] = data;
						switch (type) {
							case 'event':
								Updater.updateGlobalEvent(this);
								break;
							case 'scene':
								Data.registerScenePresets(guid);
								break;
							case 'ui':
								Data.registerUiPresets(guid);
								break;
						}
					})
					.catch((error: unknown) => {
						console.error(`读取失败: ${(error as Error).message}`);
					});
			}

			const key = (typeMapToGroupName() as Record<string, string>)[type];
			if (key === undefined) {
				throw new Error('Unknown meta type');
			}
			const { manifest } = Data;
			manifest.changed = true;
			manifest[key].push(this);
			manifest.metaList.push(this);
			manifest.guidMap[guid] = this;
			manifest.pathMap[path] = this;
			fileDescriptor.value = file;
			guidDescriptor.value = guid;
			groupDescriptor.value = manifest[key];
			Object.defineProperties(this, descriptors);
		}

		redirect(file: FileItem) {
			if (this.file.type === file.type) {
				this.file = file;
				const sPath = this.path;
				const dPath = file.path;
				if (sPath !== dPath) {
					this.path = dPath;
					this.mtimeMs = file.stats!.mtimeMs ?? null;
					const { manifest } = Data;
					const { pathMap } = manifest;
					if (pathMap[sPath] === this) {
						delete pathMap[sPath];
					}
					pathMap[dPath] = this;
					manifest.changed = true;
				}
				return true;
			}
			return false;
		}

		tryFixGuid(data: Record<string, unknown>) {
			if (data.guid === undefined) {
			}
			guidDescriptor.value = this.guid;
			Object.defineProperty(data, 'guid', guidDescriptor);
		}

		static versionId = 0;
	};
})();
