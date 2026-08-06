import { $ } from '@/util/dom.ts';
import { on, hide, read, write } from '@/util/element-utils.ts';
import { RadioProxy } from '@/components/radio-proxy.ts';
import { History } from '@/tools/history.ts';
import { Reference } from '@/log/related-references.ts';
import { bindListClipboardMethods } from '@/tools/list-clipboard-methods.ts';
import { variableStateKeys, getVariableStore } from '@app/stores/variable';

export const Variable = {
	list: null as any,
	panel: null as any,
	manager: null as any,
	searcher: null as any,
	inputs: {
		name: null,
		value: null,
		number: null,
		string: null,
		note: null,
		boolean: { read: null as any },
		type: { write: null as any }
	} as any,
	target: null as any,
	data: null as any,
	idMap: null as any,
	history: null as any,
	changed: false,
	initialize: null as any,
	open: null as any,
	undo: null as any,
	redo: null as any,
	createId: null as any,
	register: null as any,
	unregister: null as any,
	getVariableById: null as any,
	openPropertyPanel: null as any,
	closePropertyPanel: null as any,
	unpackVariables: null as any,
	packVariables: null as any,
	saveHistory: null as any,
	windowClose: null as any,
	windowClosed: null as any,
	keydown: null as any,
	listKeydown: null as any,
	listPointerdown: null as any,
	listSelect: null as any,
	listRecord: null as any,
	listPopup: null as any,
	listOpen: null as any,
	nameInput: null as any,
	sortWrite: null as any,
	sortInput: null as any,
	typeWrite: null as any,
	typeInput: null as any,
	valueInput: null as any,
	noteInput: null as any,
	panelKeydown: null as any,
	searcherInput: null as any,
	confirm: null as any,
	apply: null as any,
	list_saveScroll: null as any,
	list_restoreScroll: null as any,
	list_cancelSearch: null as any,
	list_createFolder: null as any,
	list_createVariable: null as any,
	list_createIcon: null as any,
	list_updateIcon: null as any,
	list_addElementClass: null as any,
	list_updateItemClass: null as any,
	list_createInitText: null as any,
	list_updateInitText: null as any,
	list_createNoteIcon: null as any,
	list_updateNoteIcon: null as any,
	list_onCreate: null as any,
	list_onDelete: null as any,
	list_onResume: null as any,
	_listMethodsLoaded: false
};

function ensureDomBound() {
	if (Variable.list) return;
	const list = $('#variable-list');
	if (!list) return;
	Variable.list = list;
	Variable.panel = $('#variable-properties-flex');
	hide(Variable.panel);
	Variable.manager = $('#variable-value-manager');
	Variable.searcher = $('#variable-searcher');
	Variable.inputs.name = $('#variable-name');
	Variable.inputs.value = $('#variable-value-box');
	Variable.inputs.number = $('#variable-value-number');
	Variable.inputs.string = $('#variable-value-string');
	Variable.inputs.note = $('#variable-note');
	Variable.list.copy = null;
	Variable.list.paste = null;
	Variable.list.delete = null;
	if (!Variable._listMethodsLoaded) {
		Variable._listMethodsLoaded = true;
		import('./list-methods.ts');
	}
	Variable.list.saveScroll = Variable.list_saveScroll;
	Variable.list.restoreScroll = Variable.list_restoreScroll;
	Variable.list.cancelSearch = Variable.list_cancelSearch;
	Variable.list.createFolder = Variable.list_createFolder;
	Variable.list.createVariable = Variable.list_createVariable;
	Variable.list.createIcon = Variable.list_createIcon;
	Variable.list.updateIcon = Variable.list_updateIcon;
	Variable.list.addElementClass = Variable.list_addElementClass;
	Variable.list.updateItemClass = Variable.list_updateItemClass;
	Variable.list.createInitText = Variable.list_createInitText;
	Variable.list.updateInitText = Variable.list_updateInitText;
	Variable.list.createNoteIcon = Variable.list_createNoteIcon;
	Variable.list.updateNoteIcon = Variable.list_updateNoteIcon;
	Variable.list.onCreate = Variable.list_onCreate;
	Variable.list.onDelete = Variable.list_onDelete;
	Variable.list.onResume = Variable.list_onResume;
	bindListClipboardMethods({
		module: Variable,
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

Variable.initialize = function () {
	ensureDomBound();
	if (!this.list) return;
	const { list } = this;
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.creators.push(list.updateItemClass);
	list.creators.push(list.createInitText);
	list.creators.push(list.updateInitText);
	list.creators.push(list.createNoteIcon);
	list.creators.push(list.updateNoteIcon);

	this.panel.variable = null;
	this.searcher.addCloseButton();

	(History.processors as any)['variable-list-operation'] = (operation: string, data: any) => {
		const { response } = data;
		list.restore(operation, response);
		if (read(list) === null && this.panel.variable !== null) {
			this.closePropertyPanel();
		}
		this.changed = true;
	};
	(History.processors as any)['variable-name-change'] = (operation: string, data: any) => {
		const { item, value } = data;
		data.value = item.name;
		item.name = value;
		list.updateItemName(item);
		if (this.panel.variable === item) {
			write(this.inputs.name, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	(History.processors as any)['variable-sort-change'] = (operation: string, data: any) => {
		const {
			item,
			value: { sort, value }
		} = data;
		data.value.sort = item.sort;
		data.value.value = item.value;
		item.sort = sort;
		item.value = value;
		list.updateIcon(item);
		list.updateInitText(item);
		list.updateItemClass(item);
		if (this.panel.variable === item) {
			const type = typeof value;
			write(this.inputs.sort, sort);
			write(this.inputs.type, type);
			if (this.inputs[type]) write(this.inputs[type], value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	(History.processors as any)['variable-type-change'] = (operation: string, data: any) => {
		const { item, value } = data;
		data.value = item.value;
		item.value = value;
		list.updateIcon(item);
		list.updateInitText(item);
		if (this.panel.variable === item) {
			const type = typeof value;
			write(this.inputs.type, type);
			if (this.inputs[type]) write(this.inputs[type], value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	(History.processors as any)['variable-value-change'] = (operation: string, data: any) => {
		const { item, value } = data;
		data.value = item.value;
		item.value = value;
		list.updateInitText(item);
		if (this.panel.variable === item) {
			write(this.inputs[typeof value], value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};
	(History.processors as any)['variable-note-change'] = (operation: string, data: any) => {
		const { item, value } = data;
		data.value = item.note;
		item.note = value;
		list.updateNoteIcon(item);
		if (this.panel.variable === item) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		this.changed = true;
	};

	on($('#variable'), 'close', this.windowClose);
	on($('#variable'), 'closed', this.windowClosed);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', (Reference.getPointerdownListener as any)(list), {
		capture: true
	});
	// list select/record/popup/open 经 Vue 模板转发（Variable.vue @select/@record/@popup/@open → Variable.list*）
	on(this.inputs.name, 'input', this.nameInput);
	on(this.inputs.sort, 'write', this.sortWrite);
	on(this.inputs.sort, 'input', this.sortInput);
	on(this.inputs.type, 'write', this.typeWrite);
	on(this.inputs.type, 'input', this.typeInput);
	on(this.inputs.boolean, 'input', this.valueInput);
	on(this.inputs.number, 'input', this.valueInput);
	on(this.inputs.string, 'input', this.valueInput);
	on(this.inputs.string, 'compositionend', this.valueInput);
	on(this.inputs.note, 'input', this.noteInput);
	on(this.inputs.note, 'compositionend', this.noteInput);
	on(this.panel, 'keydown', this.panelKeydown);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on($('#variable-confirm'), 'click', this.confirm);
	on($('#variable-apply'), 'click', this.apply);
};

for (const key of variableStateKeys) {
	Object.defineProperty(Variable, key, {
		get: () => getVariableStore().state[key],
		set: (value: any) => {
			(getVariableStore().state as any)[key] = value;
		},
		configurable: true
	});
}
