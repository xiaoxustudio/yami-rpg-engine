import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { addClass, removeClass, show, hide } from '@/util/element-utils.ts';

import { Variable } from './variable.ts';

// 列表 - 保存滚动状态
Variable.list_saveScroll = function (this: any) {
	const { variables } = Data;
	// 将数据保存在外部可以切换项目后重置
	if ((variables as any).scrollTop === undefined) {
		Object.defineProperty(variables, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	(variables as any).scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Variable.list_restoreScroll = function (this: any) {
	this.scrollTop = (Data.variables as any).scrollTop ?? 0;
};

// 列表 - 取消搜索
Variable.list_cancelSearch = function (this: any) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Variable.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		(active as any).focus();
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
	return function (item: any) {
		const icon = document.createElement('node-icon');
		if (item.class !== 'folder') {
			addClass(icon, (classes as any)[typeof item.value]);
		} else {
			addClass(icon, 'icon-folder');
		}
		return icon;
	};
})();

// 列表 - 更新图标
Variable.list_updateIcon = function (this: any, item: any) {
	const { element } = item;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item);
		element.replaceChild(icon, element.nodeIcon);
		element.nodeIcon = icon;
	}
};

// 列表 - 添加元素类名
Variable.list_addElementClass = function (item: any) {
	addClass(item.element, 'variable-item');
};

// 列表 - 更新项目类名
Variable.list_updateItemClass = function (item: any) {
	const { element } = item;
	switch (item.sort) {
		case 0:
			removeClass(element, 'shared-variable');
			removeClass(element, 'temporary-variable');
			break;
		case 1:
			addClass(element, 'shared-variable');
			removeClass(element, 'temporary-variable');
			break;
		case 2:
			removeClass(element, 'shared-variable');
			addClass(element, 'temporary-variable');
			break;
	}
	if (item.class !== 'folder') {
		addClass(element, 'reference');
	} else {
		removeClass(element, 'reference');
	}
};

// 列表 - 创建初始化文本
Variable.list_createInitText = function (item: any) {
	if (item.class !== 'folder') {
		const { element } = item;
		const initText = document.createElement('text');
		addClass(initText, 'variable-init-text');
		element.appendChild(initText);
		element.initText = initText;
		// 对象变量的初始值是null，避免冲突
		element.initValue = undefined;
	}
};

// 列表 - 更新初始化文本
Variable.list_updateInitText = function (item: any) {
	const { element } = item;
	if (element.initText !== undefined) {
		let { value } = item;
		if (element.initValue !== value) {
			element.initValue = value;
			switch (typeof value) {
				case 'boolean':
				case 'number':
					element.initText.textContent = ` = ${value}`;
					break;
				case 'string':
					value = `"${(Command.parseMultiLineString as any)(value)}"`;
					element.initText.textContent = ` = ${value}`;
					break;
				case 'object':
					element.initText.textContent = '';
					break;
			}
		}
	}
};

// 列表 - 创建笔记图标
Variable.list_createNoteIcon = function (item: any) {
	if (item.class !== 'folder') {
		const { element } = item;
		const noteIcon = document.createElement('node-icon');
		addClass(noteIcon, 'icon-note');
		noteIcon.textContent = '\uf27b';
		element.appendChild(noteIcon);
		element.noteIcon = noteIcon;
		element.annotated = null;
	}
};

// 列表 - 更新笔记图标
Variable.list_updateNoteIcon = function (item: any) {
	const { element } = item;
	if (element.noteIcon !== undefined) {
		const annotated = item.note !== '';
		if (element.annotated !== annotated) {
			element.annotated = annotated;
			annotated ? show(element.noteIcon) : hide(element.noteIcon);
		}
	}
};

// 列表 - 在创建数据时回调
Variable.list_onCreate = function (item: any) {
	Variable.register(item);
};

// 列表 - 在删除数据时回调
Variable.list_onDelete = function (item: any) {
	Variable.unregister(item);
};

// 列表 - 在恢复数据时回调
Variable.list_onResume = function (item: any) {
	Variable.register(item);
};
