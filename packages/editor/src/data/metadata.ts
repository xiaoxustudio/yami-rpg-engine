import { Data } from './data-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { Updater } from '@app/services/updater/updater.ts';
import type { ParamDef } from '@ui-kit';

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
	// 标成 `PropertyDescriptor`：标准库里 `value` 是可选 `any`，因此初值可直接写 `null`，
	// 不必再用 `null as unknown as FileItem` 去凑"非空"（真值在下面 `fileDescriptor.value = file`）。
	const fileDescriptor: PropertyDescriptor = { writable: true, value: null };
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
		declare mtimeMs: number | bigint | null;
		declare versionId: number;
		declare group: unknown[];
		declare dataMap: Record<string, object> | null;
		x: number | null = null;
		y: number | null = null;
		/**
		 * 脚本参数定义（只有 `script` 类型会赋值，见构造函数）—— 原先声明成 `unknown[] | null`。
		 *
		 * 第 156 轮：收紧成 `ParamDef[] | null`（类型从 ui-kit 导入，与参数面板的契约同源）。
		 * 起因是 ui-kit 的 `YMParameterPane` 会**直接读**清单条目的 `parameters`（`:349-350`），
		 * 而 `unknown[]` 与它要的 `ParamDef[]` 不相容 ⇒ 跨包 prop 绑定报 TS2322。
		 * 实测：编辑器侧对 `.parameters` 的读写点只有本文件的两处（声明 + `= []`）⇒ 级联为零。
		 */
		parameters: ParamDef[] | null = null;
		/**
		 * 语言映射（运行期由元数据装载写入，编辑器侧没有静态写点）。
		 * 形状取自 ui-kit 的读点：`meta.langMap.active` 与 `meta.langMap.update().get(key)` /
		 * `update().active`（`YMParameterPane.vue` 的 `windowLocalize`）。与 ui-kit 的
		 * `ManifestEntry.langMap` **必须一致**，否则跨包 prop 绑定当场报 TS2322。
		 */
		declare langMap: {
			active: string;
			update(): { active: string; get(key: string | undefined): string };
		};
		/**
		 * 参数管理器（运行期由 `plugin-parse-meta.ts` 的 `Object.defineProperties` 挂上，
		 * 值就是那里的 `OptionManager.sort()`）：ui-kit 的 `updateParamDisplay` 读 `states`。
		 */
		declare manager: { states: Record<string, boolean> };
		/** 概览信息（运行期写入；ui-kit 只读 `overview.deprecated`，见 `:353-356`） */
		declare overview?: { deprecated?: string };
		// script 类型运行时由 Object.defineProperty 挂载（非枚举）
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
			guidDescriptor.value = this.guid;
			Object.defineProperty(data, 'guid', guidDescriptor);
		}

		static versionId = 0;
	};
})();
