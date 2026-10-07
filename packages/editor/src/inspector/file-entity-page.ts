import { $, getElementWriter } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { clear } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';

type FileEntityData = {
	icon: string;
	clip: number[];
	inherit: string;
	attributes: unknown[];
	events: unknown[];
	scripts: unknown[];
	[k: string]: unknown;
};

interface FileEntityPage {
	target: FileEntityData | null;
	meta: { file: unknown } | null;
	initialize: () => void;
	create: () => object;
	open: (entity: FileEntityData, meta: { file: unknown }) => void;
	close: () => void;
	update: (entity: FileEntityData, key: string, value: unknown) => void;
	listChange: (event: Event) => void;
}

function createFileEntityPage(name: string, inspectorKey: string): FileEntityPage {
	const domKey = 'file' + name;
	const initialize = function () {};

	const create = function (this: FileEntityPage) {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	const open = function (this: FileEntityPage, target: FileEntityData, meta: { file: unknown }) {
		if (this.meta !== meta) {
			this.target = target;
			this.meta = meta;
			const write = getElementWriter(domKey, target);
			write('attributes');
			write('events');
			write('scripts');

			($(`#${domKey}-vue-mount`) as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	const close = function (this: FileEntityPage) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear($(`#${domKey}-attributes`));
			clear($(`#${domKey}-events`));
			clear($(`#${domKey}-scripts`));
			clear($(`#${domKey}-parameter-pane`));
		}
	};

	const update = function (
		this: FileEntityPage,
		target: FileEntityData,
		key: string,
		value: unknown
	) {
		File.planToSave!(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (target[key] !== value) {
					(target as Record<string, unknown>)[key] = value;
					getBrowserInstance()?.body?.updateIcon?.(this.meta!.file);
				}
				break;
			case 'inherit':
				if (target[key] !== value) {
					(target as Record<string, unknown>)[key] = value;
				}
				break;
		}
	};

	const listChange = function (this: FileEntityPage, _event: Event) {
		File.planToSave!(entity.meta);
	};

	const entity: FileEntityPage = {
		target: null,
		meta: null,
		initialize,
		create,
		open,
		close,
		update,
		listChange
	};

	Inspector[inspectorKey] = entity;
	return entity;
}

export const FileSkill = createFileEntityPage('Skill', 'fileSkill');
export const FileItem = createFileEntityPage('Item', 'fileItem');
export const FileEquipment = createFileEntityPage('Equipment', 'fileEquipment');
export const FileState = createFileEntityPage('State', 'fileState');
