import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { addClass, removeClass, show, hide } from '@/util/element-utils.ts';

import { Variable } from './variable.ts';

interface VariableItemElement {
	nodeIcon: HTMLElement;
	initText: HTMLElement;
	initValue?: unknown;
	noteIcon: HTMLElement;
	annotated?: boolean | null;
	appendChild(node: HTMLElement): unknown;
	replaceChild(newNode: HTMLElement, oldNode: HTMLElement): unknown;
}

interface VariableItem {
	class: string;
	id?: string;
	name?: string;
	value?: unknown;
	sort?: number;
	note?: string;
	expanded?: boolean;
	children?: unknown[];
	element?: VariableItemElement;
}

type VariableList = {
	scrollTop: number;
	display?: string;
	expandToSelection: () => void;
	scrollToSelection: () => void;
	createIcon: (item: VariableItem) => HTMLElement;
};

// 列表 - 保存滚动状态
Variable.list_saveScroll = function (this: VariableList) {
	const { variables } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (variables.scrollTop === undefined) {
		Object.defineProperty(variables, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	variables.scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Variable.list_restoreScroll = function (this: VariableList) {
	this.scrollTop = Data.variables.scrollTop ?? 0;
};

// 列表 - 取消搜索
Variable.list_cancelSearch = function (this: VariableList) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Variable.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active!.focus();
	}
};

// 列表 - 创建文件夹
Variable.list_createFolder = function () {
	return {
		class: 'folder',
		name: 'New Folder',
		expanded: false,
		children: []
	};
};

// 列表 - 创建变量
Variable.list_createVariable = function () {
	return {
		id: Variable.createId(),
		name: 'Variable',
		value: false,
		sort: 0,
		note: ''
	};
};

// 列表 - 重写创建图标方法
Variable.list_createIcon = (function IIFE() {
	const classes = {
		boolean: 'icon-boolean',
		number: 'icon-number',
		string: 'icon-string',
		object: 'icon-object'
	};
	return function (item: unknown) {
		const it = item as unknown as VariableItem;
		const icon = document.createElement('node-icon');
		if (it.class !== 'folder') {
			addClass(icon, (classes as Record<string, string>)[typeof it.value]);
		} else {
			addClass(icon, 'icon-folder');
		}
		return icon;
	};
})();

// 列表 - 更新图标
Variable.list_updateIcon = function (this: VariableList, item: unknown) {
	const element = (item as unknown as VariableItem).element;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item as unknown as VariableItem);
		// global.d.ts 的 HTMLElement 增强把 replaceChild/nodeIcon 推为 unknown，需整体断言绕过
		(
			element as unknown as { replaceChild: (n: HTMLElement, o: HTMLElement) => void }
		).replaceChild(icon, element.nodeIcon as unknown as HTMLElement);
		(element as unknown as { nodeIcon: HTMLElement }).nodeIcon = icon;
	}
};

// 列表 - 添加元素类名
Variable.list_addElementClass = function (item: unknown) {
	const it = item as unknown as VariableItem;
	addClass(it.element!, 'variable-item');
};

// 列表 - 更新项目类名
Variable.list_updateItemClass = function (item: unknown) {
	const it = item as unknown as VariableItem;
	const { element } = it;
	switch (it.sort) {
		case 0:
			removeClass(element!, 'shared-variable');
			removeClass(element!, 'temporary-variable');
			break;
		case 1:
			addClass(element!, 'shared-variable');
			removeClass(element!, 'temporary-variable');
			break;
		case 2:
			removeClass(element!, 'shared-variable');
			addClass(element!, 'temporary-variable');
			break;
	}
	if ((item as unknown as VariableItem).class !== 'folder') {
		addClass(element!, 'reference');
	} else {
		removeClass(element!, 'reference');
	}
};

// 列表 - 创建初始化文本
Variable.list_createInitText = function (item: unknown) {
	const it1 = item as unknown as VariableItem;
	if (it1.class !== 'folder') {
		const { element } = it1;
		const initText = document.createElement('div');
		addClass(initText, 'variable-init-text');
		addClass(initText, 'text');
		element!.appendChild(initText);
		element!.initText = initText;
		// 对象变量的初始值是null，避免冲突
		element!.initValue = undefined;
	}
};

// 列表 - 更新初始化文本
Variable.list_updateInitText = function (item: unknown) {
	const it2 = item as unknown as VariableItem;
	const { element } = it2;
	if (element!.initText !== undefined) {
		let { value } = it2;
		if (element!.initValue !== value) {
			element!.initValue = value;
			switch (typeof value) {
				case 'boolean':
				case 'number':
					element!.initText!.textContent = ` = ${value}`;
					break;
				case 'string':
					value = `"${Command.parseMultiLineString!(value as string)}"`;
					element!.initText!.textContent = ` = ${value}`;
					break;
				case 'object':
					element!.initText!.textContent = '';
					break;
			}
		}
	}
};

// 列表 - 创建笔记图标
Variable.list_createNoteIcon = function (item: unknown) {
	const it3 = item as unknown as VariableItem;
	if (it3.class !== 'folder') {
		const { element } = it3;
		const noteIcon = document.createElement('node-icon');
		addClass(noteIcon, 'icon-note');
		noteIcon.textContent = '\uf27b';
		element!.appendChild(noteIcon);
		element!.noteIcon = noteIcon;
		element!.annotated = null;
	}
};

// 列表 - 更新笔记图标
Variable.list_updateNoteIcon = function (item: unknown) {
	const it4 = item as unknown as VariableItem;
	const { element } = it4;
	if (element!.noteIcon !== undefined) {
		const annotated = it4.note !== '';
		if (element!.annotated !== annotated) {
			element!.annotated = annotated;
			annotated ? show(element!.noteIcon) : hide(element!.noteIcon);
		}
	}
};

// 列表 - 在创建数据时回调
Variable.list_onCreate = function (item: unknown) {
	Variable.register(item);
};

// 列表 - 在删除数据时回调
Variable.list_onDelete = function (item: unknown) {
	Variable.unregister(item);
};

// 列表 - 在恢复数据时回调
Variable.list_onResume = function (item: unknown) {
	Variable.register(item);
};
