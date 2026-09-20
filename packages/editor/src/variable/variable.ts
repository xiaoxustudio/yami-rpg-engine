import { getListConfig } from '@ui-kit';
import { variableEls } from '@app/variable/element-registry';
import { on, hide, read, write } from '@app/utils/element-utils.ts';
import { RadioProxy } from '@ui-kit';
import { History } from '@app/tools/history.ts';
import { Reference } from '@app/log/related-references.ts';
import { bindListClipboardMethods } from '@app/tools/list-clipboard-methods.ts';
import type { PageManagerApi } from '@ui-kit';
import { getVariableStore, variableStateKeys } from '@app/stores/variable';
import type { VariableItemShape } from '@app/stores/variable';
import type { YamiElement } from '@app/types/element-api';
import type { YamiMouseEvent } from '@app/types/editor-event';
import { registryElement } from '@app/utils/element-registry';

interface VariableModule {
	list: YamiElement;
	panel: YamiElement;
	manager: PageManagerApi;
	searcher: YamiElement;
	inputs: {
		name: YamiElement | null;
		value: YamiElement | null;
		number: YamiElement | null;
		string: YamiElement | null;
		note: YamiElement | null;
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
	listSelect: ((event: YamiMouseEvent) => void) | null;
	listRecord: ((event: YamiMouseEvent) => void) | null;
	listPopup: ((event: YamiMouseEvent) => void) | null;
	listOpen: ((event: YamiMouseEvent) => void) | null;
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
	/**
	 * P2b-2：以下三个成员**不是模块自己的字段，而是桥接到 `stores/variable`**——本文件末尾按
	 * `variableStateKeys`（`target`/`data`/`idMap`/`history`/`changed`/`selected`）用
	 * `Object.defineProperty` 装 get/set。原先它们被类型上的 `[k: string]: any` 兜着，所以"这里有座桥"
	 * 在类型里完全看不见；收掉逃生口后由 `tsc` 当场报出（`variable/data.ts` 1 处、
	 * `variable/list-events.ts` 4 处、`module/monkey-patches.ts` 1 处）。
	 */
	target: { getFocus?: () => void } | null;
	idMap: Record<string, boolean>;
	history: History;
	[k: string]: unknown;
}

/**
 * P2b-2：桥键（`target`/`idMap`/`history`）由本文件末尾的 `Object.defineProperty` 安装，
 * 字面量给不出它们 ⇒ 字面量按 `Omit<VariableModule, 'target' | 'idMap' | 'history'>` 校验，
 * **其余成员的拼写仍逐项受检**，导出时再断言成完整形状（与 `AudioManager`/`Log` 同一手法）。
 *
 * `satisfies Partial<…>` 同时承担另一件事：延迟绑定槽（DOM 元素、方法）在 `initialize()`
 * 之后才存在，字面量里写 `null as unknown as T` 是**谎报类型**；改为让这些槽「此刻不存在」，
 * 由 `initialize()` 里的真实赋值补齐（那些赋值同样逐字段受检）。
 */
type VariableLiteral = Omit<VariableModule, 'target' | 'idMap' | 'history'>;

const variable = {
	inputs: {
		name: null,
		value: null,
		number: null,
		string: null,
		note: null,
		boolean: { read: null },
		type: { write: null }
	},
	initialize: null,
	open: null,
	getVariableById: null,
	unpackVariables: null,
	packVariables: null,
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
	apply: null,
	_listMethodsLoaded: false
} satisfies Partial<VariableLiteral> as VariableLiteral;

export const Variable = variable as VariableModule;

function ensureDomBound() {
	if (Variable.list) return;
	const list = variableEls.get('variable-list') as YamiElement;
	if (!list) return;
	Variable.list = list;
	Variable.panel = variableEls.get('variable-properties-flex') as YamiElement;
	hide(Variable.panel);
	Variable.manager = registryElement<PageManagerApi>(variableEls, 'variable-value-manager')!;
	Variable.searcher = variableEls.get('variable-searcher') as YamiElement;
	Variable.inputs.name = variableEls.get('variable-name') as YamiElement;
	Variable.inputs.value = variableEls.get('variable-value-box') as YamiElement;
	Variable.inputs.number = variableEls.get('variable-value-number') as YamiElement;
	Variable.inputs.string = variableEls.get('variable-value-string') as YamiElement;
	Variable.inputs.note = variableEls.get('variable-note') as YamiElement;
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
		module: Variable as Parameters<typeof bindListClipboardMethods>[0]['module'],
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
		if (getVariableStore().state.selected === (item as VariableItemShape)) {
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
		if (getVariableStore().state.selected === (item as VariableItemShape)) {
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
		if (getVariableStore().state.selected === (item as VariableItemShape)) {
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
		if (getVariableStore().state.selected === (item as VariableItemShape)) {
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
		if (getVariableStore().state.selected === (item as VariableItemShape)) {
			write(this.inputs.note, value);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		getVariableStore().state.changed = true;
	};

	on(variableEls.get('variable') as YamiElement, 'close', this.windowClose!);
	on(variableEls.get('variable') as YamiElement, 'closed', this.windowClosed!);
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
	// confirm 由 Variable.vue 的 @confirm 驱动（按钮由 WindowFrame 生成，注册表取不到）
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
