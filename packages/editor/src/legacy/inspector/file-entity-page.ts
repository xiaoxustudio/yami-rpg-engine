import { $, getElementWriter } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { clear, read } from '@/util/element-utils';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

type FileEntityData = {
	icon: string;
	clip: number[];
	inherit: string;
	attributes: unknown[];
	events: unknown[];
	scripts: unknown[];
	[k: string]: any;
};

interface FileEntityPage {
	target: FileEntityData | null;
	meta: { file: unknown } | null;
	initialize: () => void;
	create: () => object;
	open: (entity: FileEntityData, meta: { file: unknown }) => void;
	close: () => void;
	update: (entity: FileEntityData, key: string, value: unknown) => void;
	paramInput: (event: Event) => void;
	listChange: (event: Event) => void;
}

function createFileEntityPage(name: string, inspectorKey: string): FileEntityPage {
	const domKey = 'file' + name;
	const entity = {
		target: null,
		meta: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null,
		listChange: null
	} as unknown as FileEntityPage;

	entity.initialize = function (this: FileEntityPage) {
		if (!$(`#${domKey}-attributes`)) return;
		$(`#${domKey}-attributes`).bind(new AttributeListInterface());
		$(`#${domKey}-events`).bind(new EventListInterface(this));
		$(`#${domKey}-scripts`).bind(new ScriptListInterface());
		$(`#${domKey}-parameter-pane`).bind($(`#${domKey}-scripts`));
		document
			.querySelectorAll(`#${domKey}-icon, #${domKey}-clip, #${domKey}-inherit`)
			.forEach((el) => (el as HTMLElement).on('input', this.paramInput));
		document
			.querySelectorAll(`#${domKey}-attributes, #${domKey}-events, #${domKey}-scripts`)
			.forEach((el) => (el as HTMLElement).on('change', this.listChange));
	};

	entity.create = function (this: FileEntityPage) {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	entity.open = function (this: FileEntityPage, target: FileEntityData, meta: { file: unknown }) {
		if (this.meta !== meta) {
			this.target = target;
			this.meta = meta;
			const write = getElementWriter(domKey, target);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	entity.close = function (this: FileEntityPage) {
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

	entity.update = function (
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

	entity.paramInput = function (this: HTMLElement, event: Event) {
		entity.update(entity.target!, Inspector.getKey!(this), read(this));
	};

	entity.listChange = function (this: FileEntityPage, event: Event) {
		File.planToSave!(entity.meta);
	};

	Inspector[inspectorKey] = entity;
	return entity;
}

export const FileSkill = createFileEntityPage('Skill', 'fileSkill');
export const FileItem = createFileEntityPage('Item', 'fileItem');
export const FileEquipment = createFileEntityPage('Equipment', 'fileEquipment');
export const FileState = createFileEntityPage('State', 'fileState');
