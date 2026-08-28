import { getListConfig } from '@ui-kit';
import { $ } from '@app/utils/dom';
import { on, hide, read, write } from '@app/utils/element-utils.ts';
import { RadioProxy } from '@ui-kit';
import { History } from '@app/tools/history.ts';
import { Reference } from '@app/log/related-references.ts';
import { bindListClipboardMethods } from '@app/tools/list-clipboard-methods.ts';
import type { PageManagerApi } from '@ui-kit';
import { getVariableStore, variableStateKeys } from '@app/stores/variable';
import type { VariableItemShape } from '@app/stores/variable';

interface VariableModule {
	list: HTMLElement;
	panel: HTMLElement;
	manager: PageManagerApi;
	searcher: HTMLElement;
	inputs: {
		name: HTMLElement;
		value: HTMLElement;
		number: HTMLElement;
		string: HTMLElement;
		note: HTMLElement;
		boolean: { read: unknown };
		type: { write: unknown };
		sort?: unknown;
		[k: string]: unknown;
	};
	initialize: (() => void) | null;
	open: ((target?: unknown) => void) | null;
	undo: () => void;
	redo: () => void;
	createId: () => string;
	register: (item: unknown) => void;
	unregister: (item: unknown) => void;
	getVariableById: ((id: string) => unknown) | null;
	openPropertyPanel: (variable: unknown) => void;
	closePropertyPanel: (this: typeof Variable) => void;
	unpackVariables: (() => unknown) | null;
	packVariables: (() => unknown) | null;
	saveHistory: (item: unknown, key: string, value: unknown) => void;
	windowClose: ((event: Event) => void) | null;
	windowClosed: ((event: Event) => void) | null;
	keydown: ((event: Event) => void) | null;
	listKeydown: ((event: KeyboardEvent) => void) | null;
	listPointerdown: ((event: PointerEvent) => void) | null;
	listSelect: ((event: Event) => void) | null;
	listRecord: ((event: Event) => void) | null;
	listPopup: ((event: Event) => void) | null;
	listOpen: ((event: Event) => void) | null;
	nameInput: ((event: Event) => void) | null;
	sortWrite: ((event: Event) => void) | null;
	sortInput: ((event: Event) => void) | null;
	typeWrite: ((event: Event) => void) | null;
	typeInput: ((event: Event) => void) | null;
	valueInput: ((event: Event) => void) | null;
	noteInput: ((event: Event) => void) | null;
	panelKeydown: ((event: KeyboardEvent) => void) | null;
	searcherInput: ((event: InputEvent) => void) | null;
	confirm: (event?: Event) => void;
	apply: ((event: Event) => void) | null;
	list_saveScroll: () => void;
	list_restoreScroll: () => void;
	list_cancelSearch: () => void;
	list_createFolder: () => unknown;
	list_createVariable: () => unknown;
	list_onCreate: (item: unknown) => void;
	list_onDelete: (item: unknown) => void;
	list_onResume: (item: unknown) => void;
	_listMethodsLoaded: boolean;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export const Variable: VariableModule = {
	list: null as unknown as HTMLElement,
	panel: null as unknown as HTMLElement,
	manager: null as unknown as PageManagerApi,
	searcher: null as unknown as HTMLElement,
	inputs: {
		name: null as unknown as HTMLElement,
		value: null as unknown as HTMLElement,
		number: null as unknown as HTMLElement,
		string: null as unknown as HTMLElement,
		note: null as unknown as HTMLElement,
		boolean: { read: null },
		type: { write: null }
	},
	initialize: null,
	open: null,
	undo: null as unknown as () => void,
	redo: null as unknown as () => void,
	createId: null as unknown as () => string,
	register: null as unknown as (item: unknown) => void,
	unregister: null as unknown as (item: unknown) => void,
	getVariableById: null,
	openPropertyPanel: null as unknown as (variable: unknown) => void,
	closePropertyPanel: null as unknown as (this: typeof Variable) => void,
	unpackVariables: null,
	packVariables: null,
	saveHistory: null as unknown as (item: unknown, key: string, value: unknown) => void,
	windowClose: null,
	windowClosed: null,
	keydown: null,
	listKeydown: null,
	listPointerdown: null,
	listSelect: null,
	listRecord: null,
	listPopup: null,
	listOpen: null,
	nameInput: null,
	sortWrite: null,
	sortInput: null,
	typeWrite: null,
	typeInput: null,
	valueInput: null,
	noteInput: null,
	panelKeydown: null,
	searcherInput: null,
	confirm: null as unknown as (event?: Event) => void,
	apply: null,
	list_saveScroll: null as unknown as () => void,
	list_restoreScroll: null as unknown as () => void,
	list_cancelSearch: null as unknown as () => void,
	list_createFolder: null as unknown as () => unknown,
	list_createVariable: null as unknown as () => unknown,
	list_onCreate: null as unknown as (item: unknown) => void,
	list_onDelete: null as unknown as (item: unknown) => void,
	list_onResume: null as unknown as (item: unknown) => void,
	_listMethodsLoaded: false
};

function ensureDomBound() {
	if (Variable.list) return;
	const list = $('#variable-list');
	if (!list) return;
	Variable.list = list;
	Variable.panel = $('#variable-properties-flex') as HTMLElement;
	hide(Variable.panel);
	Variable.manager = $('#variable-value-manager') as PageManagerApi;
	Variable.searcher = $('#variable-searcher');
	Variable.inputs.name = $('#variable-name');
	Variable.inputs.value = $('#variable-value-box');
	Variable.inputs.number = $('#variable-value-number');
	Variable.inputs.string = $('#variable-value-string');
	Variable.inputs.note = $('#variable-note');
	Variable.list.copy = null as unknown as (...args: unknown[]) => void;
	Variable.list.paste = null as unknown as (...args: unknown[]) => void;
	Variable.list.delete = null as unknown as (...args: unknown[]) => void;
	Variable.list.saveScroll = Variable.list_saveScroll;
	Variable.list.restoreScroll = Variable.list_restoreScroll;
	Variable.list.cancelSearch = Variable.list_cancelSearch;
	Variable.list.createFolder = Variable.list_createFolder;
	(Variable.list as unknown as { createVariable: () => unknown }).createVariable =
		Variable.list_createVariable;
	getListConfig(Variable.list).onCreate = Variable.list_onCreate;
	getListConfig(Variable.list).onDelete = Variable.list_onDelete;
	getListConfig(Variable.list).onResume = Variable.list_onResume;
	bindListClipboardMethods({
		module: Variable as unknown as Parameters<typeof bindListClipboardMethods>[0]['module'],
		list,
		clipboardKey: 'yami.data.variable'
	});
}

// radio-box 组的共享 radio-proxy 实例由 RadioBox 升级时惰性塞入 RadioProxy.map，故 inputs.sort/type/boolean 不能在顶层求值（彼时 map 为空），改为惰性 getter
Object.defineProperties(Variable.inputs, {
	sort: {
		get() {
			return RadioProxy.map['variable-sort'];
		},
		enumerable: true,
		configurable: true
	},
	type: {
		get() {
			return RadioProxy.map['variable-type'];
		},
		enumerable: true,
		configurable: true
	},
	boolean: {
		get() {
			return RadioProxy.map['variable-value-boolean'];
		},
		enumerable: true,
		configurable: true
	}
});

Variable.createId = function (this: typeof Variable) {
	return getVariableStore().createId();
};

Variable.register = function (item: unknown) {
	getVariableStore().register(item as VariableItemShape);
};

Variable.unregister = function (item: unknown) {
	getVariableStore().unregister(item as VariableItemShape);
};

Variable.getVariableById = function (this: typeof Variable, id: string) {
	return getVariableStore().getVariableById(id);
};

Variable.saveHistory = function (item: unknown, key: string, value: unknown) {
	getVariableStore().saveHistory(item as VariableItemShape, key, value);
};

Variable.initialize = function () {
	ensureDomBound();
	if (!this.list) return;
	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => getVariableStore().state.data);

	if (this.panel) getVariableStore().state.selected = null;
	this.searcher?.addCloseButton?.();

	History.processors['variable-list-operation'] = (
		operation: string,
		data: { response: unknown }
	) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && getVariableStore().state.selected !== null) {
			this.closePropertyPanel();
		}
		getVariableStore().state.changed = true;
	};
	History.processors['variable-name-change'] = (
		_operation: string,
		data: { item: { name: unknown }; value: unknown }
	) => {
		const { item, value } = data;
		data.value = item.name;
		item.name = value;
		list.updateItemName(item);
		if (getVariableStore().state.selected === (item as unknown as VariableItemShape)) {
			write(this.inputs.name, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getVariableStore().state.changed = true;
	};
	History.processors['variable-sort-change'] = (
		_operation: string,
		data: {
			item: { sort: unknown; value: unknown };
			value: { sort: unknown; value: unknown };
		}
	) => {
		const {
			item,
			value: { sort, value }
		} = data;
		data.value.sort = item.sort;
		data.value.value = item.value;
		item.sort = sort;
		item.value = value;
		list.update();
		if (getVariableStore().state.selected === (item as unknown as VariableItemShape)) {
			const type = typeof value;
			write(this.inputs.sort, sort);
			write(this.inputs.type, type);
			if (this.inputs[type]) write(this.inputs[type], value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getVariableStore().state.changed = true;
	};
	History.processors['variable-type-change'] = (
		_operation: string,
		data: { item: { value: unknown }; value: unknown }
	) => {
		const { item, value } = data;
		data.value = item.value;
		item.value = value;
		list.update();
		if (getVariableStore().state.selected === (item as unknown as VariableItemShape)) {
			const type = typeof value;
			write(this.inputs.type, type);
			if (this.inputs[type]) write(this.inputs[type], value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getVariableStore().state.changed = true;
	};
	History.processors['variable-value-change'] = (
		_operation: string,
		data: { item: { value: unknown }; value: unknown }
	) => {
		const { item, value } = data;
		data.value = item.value;
		item.value = value;
		list.update();
		if (getVariableStore().state.selected === (item as unknown as VariableItemShape)) {
			write(this.inputs[typeof value], value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getVariableStore().state.changed = true;
	};
	History.processors['variable-note-change'] = (
		_operation: string,
		data: { item: { note: unknown }; value: unknown }
	) => {
		const { item, value } = data;
		data.value = item.note;
		item.note = value;
		list.update();
		if (getVariableStore().state.selected === (item as unknown as VariableItemShape)) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getVariableStore().state.changed = true;
	};

	on($('#variable'), 'close', this.windowClose!);
	on($('#variable'), 'closed', this.windowClosed!);
	on(list, 'keydown', this.listKeydown!);
	on(list, 'pointerdown', this.listPointerdown!);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	// list select/record/popup/open 经 Vue 模板转发（Variable.vue @select/@record/@popup/@open → Variable.list*）
	// name input 经 Vue 模板转发（Variable.vue @input → Variable.nameInput）
	// sort/type write/input 经 Vue 模板转发（Variable.vue @write/@input → Variable.sortWrite/sortInput/typeWrite/typeInput）
	on(this.inputs.boolean, 'input', this.valueInput!);
	on(this.inputs.number, 'input', this.valueInput!);
	on(this.inputs.string, 'input', this.valueInput!);
	on(this.inputs.string, 'compositionend', this.valueInput!);
	on(this.inputs.note, 'input', this.noteInput!);
	on(this.inputs.note, 'compositionend', this.noteInput!);
	on(this.panel, 'keydown', this.panelKeydown!);
	on(this.searcher, 'input', this.searcherInput!);
	on(this.searcher, 'compositionend', this.searcherInput!);
	on($('#variable-confirm'), 'click', this.confirm!);
};

for (const key of variableStateKeys) {
	Object.defineProperty(Variable, key, {
		get: () => getVariableStore().state[key],
		set: (value: unknown) => {
			(getVariableStore().state as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
