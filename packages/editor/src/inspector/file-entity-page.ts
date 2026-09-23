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
	// 第 123 轮：6 个方法**先各自定义、再在一个对象字面量里一次成型**（手法库第 4 条的一般形态）。
	// 原来是先写一张 8 键的 `null` 占位表、再逐个填 —— 那张表的 `null` 与接口要求的函数不兼容，
	// 于是只能 `as unknown as FileEntityPage`：**断言在替「表里先写 null」这一步背书**。
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

	// ⚠️ 上面 `listChange` 读的是闭包里的 `entity`（下面几行才声明）。**安全**：方法体只在
	// **调用时**求值，那时 `entity` 早已就绪（TDZ 只作用于求值那一刻）。
	// 保留原写法是为了**逐字等价** —— 改成 `this.meta` 虽然更合本文件的惯例（`update` 就是），
	// 但那是**行为变化**：脱离接收者调用时会从「读闭包变量」变成「抛 TypeError」。
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
