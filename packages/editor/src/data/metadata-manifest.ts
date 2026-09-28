import { Data } from './data-object.ts';
import { Meta } from './metadata.ts';
import { File } from '@app/file/file-system-core.ts';
import { Title } from '@app/title/title-bar.ts';
import { remove } from '@app/utils/array';

export type FileMeta = InstanceType<typeof Meta>;

interface ProjectMeta {
	guid: string;
	path: string;
	dataMap: unknown;
}

export class Manifest {
	actors: FileMeta[] = [];
	skills: FileMeta[] = [];
	triggers: FileMeta[] = [];
	items: FileMeta[] = [];
	equipments: FileMeta[] = [];
	states: FileMeta[] = [];
	events: FileMeta[] = [];
	scenes: FileMeta[] = [];
	tilesets: FileMeta[] = [];
	ui: FileMeta[] = [];
	animations: FileMeta[] = [];
	particles: FileMeta[] = [];
	images: FileMeta[] = [];
	metaList: FileMeta[] = [];
	guidMap: Record<string, FileMeta> = {};
	pathMap: Record<string, FileMeta> = {};
	changed: boolean = false;
	audio: FileMeta[] = [];
	videos: FileMeta[] = [];
	fonts: FileMeta[] = [];
	script: FileMeta[] = [];
	others: FileMeta[] = [];
	// 以下字段由 constructor 内 Object.defineProperties 挂载（非枚举）
	declare project: Record<string, ProjectMeta>;
	declare changes: FileMeta[];
	declare code: string;

	/**
	 * 按分组名取文件列表（分组名来自 FileItem.dataMapNames 与 metadata.ts 的 typeMapToGroupName）。
	 */
	group(groupKey: string): FileMeta[] {
		return this[groupKey as keyof this] as FileMeta[];
	}

	constructor() {
		Object.defineProperties(this, {
			metaList: { value: [] },
			guidMap: { value: {} },
			pathMap: { value: {} },
			project: { value: {} },
			changes: { value: [] },
			changed: { writable: true, value: false },
			code: { writable: true, value: '' }
		});
	}

	update() {
		const { metaList } = this;
		const { versionId } = Meta;
		let i = metaList.length;
		while (--i >= 0) {
			const meta = metaList[i]!;
			// 如果版本ID不一致，表示文件已被删除
			if (meta.versionId !== versionId) {
				this.deleteMeta(meta);
			}
		}
	}

	deleteMeta(meta: FileMeta) {
		const { guidMap } = this;
		const { pathMap } = this;
		const { guid, path } = meta;
		remove(this.metaList, meta);
		remove(meta.group, meta);
		if (guidMap[guid] === meta) {
			delete guidMap[guid];
		}
		if (pathMap[path] === meta) {
			delete pathMap[path];
		}
		const { dataMap } = meta;
		if (dataMap) {
			File.cancelSave!(meta);
			switch (dataMap) {
				case Data.scenes:
				case Data.ui:
				case Data.animations:
				case Data.particles:
					Title.tabBar.closeByProperty('meta', meta);
					break;
			}
			switch (dataMap) {
				case Data.scenes:
					Data.unregisterScenePresets(guid);
					break;
				case Data.ui:
					Data.unregisterUiPresets(guid);
					break;
			}
			delete dataMap[guid];
		}
		this.changed = true;
	}
}
