import { Data } from '@app/data/data-object.ts';
import { getVariableStore } from '@app/stores/variable';

import { Variable } from './variable.ts';

type VariableList = {
	scrollTop: number;
	display?: string;
	expandToSelection: () => void;
	scrollToSelection: () => void;
};

Variable.list_saveScroll = function (this: VariableList) {
	const { variables } = Data;
	if (variables.scrollTop === undefined) {
		Object.defineProperty(variables, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	variables.scrollTop = this.scrollTop;
};

Variable.list_restoreScroll = function (this: VariableList) {
	this.scrollTop = Data.variables.scrollTop ?? 0;
};

Variable.list_cancelSearch = function (this: VariableList) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Variable.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		(active as HTMLElement | null)?.focus();
	}
};

Variable.list_createFolder = function () {
	return getVariableStore().createFolder();
};

Variable.list_createVariable = function () {
	return getVariableStore().createVariable();
};

Variable.list_onCreate = function (item: unknown) {
	Variable.register(item);
};

Variable.list_onDelete = function (item: unknown) {
	Variable.unregister(item);
};

Variable.list_onResume = function (item: unknown) {
	Variable.register(item);
};
