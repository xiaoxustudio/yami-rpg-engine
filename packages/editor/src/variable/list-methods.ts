import { Data } from '@app/data/data-object.ts';
import { getVariableStore } from '@app/stores/variable';

import { Variable } from './variable.ts';

type VariableList = {
	scrollTop: number;
	display?: string;
	expandToSelection: () => void;
	scrollToSelection: () => void;
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
		(active as HTMLElement | null)?.focus();
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
