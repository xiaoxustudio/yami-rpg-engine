import { Data } from './data-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { Updater } from '@app/services/updater/updater.ts';
import type { ParameterShape } from '@app/plugin/plugin.ts';

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
	const fileDescriptor: PropertyDescriptor = { writable: true, value: null };
	const guidDescriptor = { writable: true, value: '' };
	const codeDescriptor = { writable: true, value: '' };
	const groupDescriptor: PropertyDescriptor = { value: null };
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
		declare file: FileItem;
		declare guid: string;
		declare mtimeMs: number | bigint | null;
		declare versionId: number;
		declare group: unknown[];
		declare dataMap: Record<string, object> | null;
		x: number | null = null;
		y: number | null = null;
		parameters: ParameterShape[] | null = null;
		declare langMap: {
			active: string;
			update(): { active: string; get(key: string | undefined): string };
		};
		declare manager: {
			states: Record<string, boolean>;
			update: (parameters: Record<string, unknown>) => void;
		};
		declare overview?: { plugin?: string; deprecated?: string };
		declare code: string;

		constructor(file: FileItem, guid: string) {
			const { type, path } = file;
			this.path = path;
			this.size = Number(file.stats!.size);

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
					this.parameters = [];
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
			manifest.group(key).push(this);
			manifest.metaList.push(this);
			manifest.guidMap[guid] = this;
			manifest.pathMap[path] = this;
			fileDescriptor.value = file;
			guidDescriptor.value = guid;
			groupDescriptor.value = manifest.group(key);
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
			guidDescriptor.value = this.guid;
			Object.defineProperty(data, 'guid', guidDescriptor);
		}

		static versionId = 0;
	};
})();
