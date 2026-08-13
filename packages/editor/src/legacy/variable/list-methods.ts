import { Data } from '@/data/data-object.ts';
import { addClass } from '@/util/element-utils.ts';
import { getVariableStore } from '@app/stores/variable';

import { Variable } from './variable.ts';

interface VariableItemElement {
	nodeIcon: HTMLElement;
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
	return getVariableStore().createFolder();
};

// 列表 - 创建变量
Variable.list_createVariable = function () {
	return getVariableStore().createVariable();
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
