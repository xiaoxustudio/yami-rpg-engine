import { getGetterWindowsStore } from '@app/stores/getter-windows';
import { elementDataOf, type CustomBoxApi } from '@ui-kit';
import { composableEls } from '@app/composables/element-registry';
import { getWindowStore } from '@app/stores/window';
import { onToolWindowMounted } from '@app/tools/tool-window-host';
import { getFocus, on, syncRelatedElements } from '@app/utils/element-utils';
import { getVariable } from '@app/utils/safe';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { TextSuggestion, TextSuggestionTarget } from '@app/commands/text-tip.ts';
import { selectBoxSetItemNames } from '@app/components/select-box.ts';
import type { YamiElement } from '@app/types/element-api';
import { registryElement } from '@app/utils/element-registry';

type VarTypeItem = { name: string; value: string };

type VarTypeSet = {
	all: VarTypeItem[];
	object: VarTypeItem[];
	object2: VarTypeItem[];
	writable: VarTypeItem[];
	deletable: VarTypeItem[];
};

interface VarListEntry {
	name: string;
	type: string;
	command?: { id: string } | null;
}

export interface VariableGetterForm {
	type: string;
	actor: { type: string };
	skill: { type: string };
	state: { type: string };
	equipment: { type: string };
	item: { type: string };
	element: { type: string };
	commonKey: string;
	presetKey: string;
	globalKey: string;
}

interface VariableGetterTarget {
	filter?: string;
	dataValue?: {
		type: string;
		key: string;
		actor?: { type: string };
		skill?: { type: string };
		state?: { type: string };
		equipment?: { type: string };
		item?: { type: string };
		element?: { type: string };
	};
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface VariableGetterWindow {
	form: VariableGetterForm;
	types: VarTypeSet;
	initialize: () => void;
	open: (target: VariableGetterTarget, defaults?: { filter?: string; prefix?: string }) => void;
	confirm: () => void;
	confirm2: () => void;
	onWindowClosed: () => void;
	onWindow2Closed: () => void;
	isNone: (variable: { key: string }) => boolean;
	loadPresetKeys: (group: string) => void;
	checkDataForPlugin: (data: { getter?: string }) => boolean;
	createDefaultForPlugin: () => { getter: string; type: string; key: string };
	createVarListGenerator: (filterObject: { filter: string | null }) => () => VarListEntry[];
	typeWrite: (event: Event & { value: string }) => void;
	typeInput: (event: Event & { value: string }) => void;
}

interface VariableGetterState {
	target: VariableGetterTarget;
	filter: string;
}

const form: VariableGetterForm = {
	get type(): VariableGetterForm['type'] {
		return getGetterWindowsStore().variableGetterForm.type;
	},
	set type(value: VariableGetterForm['type']) {
		getGetterWindowsStore().variableGetterForm.type = value;
	},
	get actor(): VariableGetterForm['actor'] {
		return getGetterWindowsStore().variableGetterForm.actor;
	},
	set actor(value: VariableGetterForm['actor']) {
		getGetterWindowsStore().variableGetterForm.actor = value;
	},
	get skill(): VariableGetterForm['skill'] {
		return getGetterWindowsStore().variableGetterForm.skill;
	},
	set skill(value: VariableGetterForm['skill']) {
		getGetterWindowsStore().variableGetterForm.skill = value;
	},
	get state(): VariableGetterForm['state'] {
		return getGetterWindowsStore().variableGetterForm.state;
	},
	set state(value: VariableGetterForm['state']) {
		getGetterWindowsStore().variableGetterForm.state = value;
	},
	get equipment(): VariableGetterForm['equipment'] {
		return getGetterWindowsStore().variableGetterForm.equipment;
	},
	set equipment(value: VariableGetterForm['equipment']) {
		getGetterWindowsStore().variableGetterForm.equipment = value;
	},
	get item(): VariableGetterForm['item'] {
		return getGetterWindowsStore().variableGetterForm.item;
	},
	set item(value: VariableGetterForm['item']) {
		getGetterWindowsStore().variableGetterForm.item = value;
	},
	get element(): VariableGetterForm['element'] {
		return getGetterWindowsStore().variableGetterForm.element;
	},
	set element(value: VariableGetterForm['element']) {
		getGetterWindowsStore().variableGetterForm.element = value;
	},
	get commonKey(): VariableGetterForm['commonKey'] {
		return getGetterWindowsStore().variableGetterForm.commonKey;
	},
	set commonKey(value: VariableGetterForm['commonKey']) {
		getGetterWindowsStore().variableGetterForm.commonKey = value;
	},
	get presetKey(): VariableGetterForm['presetKey'] {
		return getGetterWindowsStore().variableGetterForm.presetKey;
	},
	set presetKey(value: VariableGetterForm['presetKey']) {
		getGetterWindowsStore().variableGetterForm.presetKey = value;
	},
	get globalKey(): VariableGetterForm['globalKey'] {
		return getGetterWindowsStore().variableGetterForm.globalKey;
	},
	set globalKey(value: VariableGetterForm['globalKey']) {
		getGetterWindowsStore().variableGetterForm.globalKey = value;
	}
};

const states: Record<string, VariableGetterState | null> = {
	variableGetter: null,
	variableGetter2: null
};

const filterState = { filter: null as string | null };

const localType = { name: 'Local', value: 'local' };
const globalType = { name: 'Global', value: 'global' };
const selfType = { name: 'Self Variable', value: 'self' };
const actorType = { name: 'Actor Attribute', value: 'actor' };
const skillType = { name: 'Skill Attribute', value: 'skill' };
const stateType = { name: 'State Attribute', value: 'state' };
const equipmentType = { name: 'Equipment Attribute', value: 'equipment' };
const itemType = { name: 'Item Attribute', value: 'item' };
const elementType = { name: 'Element Attribute', value: 'element' };
const allTypes: VarTypeItem[] = [
	localType,
	globalType,
	selfType,
	actorType,
	skillType,
	stateType,
	equipmentType,
	itemType,
	elementType
];
const writableTypes: VarTypeItem[] = allTypes.filter((item) => item.value !== 'item');
const deletableTypes: VarTypeItem[] = writableTypes.filter(
	(item) => item.value !== 'global' && item.value !== 'self'
);
const types: VarTypeSet = {
	all: allTypes,
	object: [localType, globalType, elementType],
	object2: [localType, globalType],
	writable: writableTypes,
	deletable: deletableTypes
};

const getTypeItems = (filter: string, prefix: string): VarTypeItem[] => {
	switch (filter) {
		case 'all':
		case 'boolean':
		case 'number':
		case 'string':
			return prefix === 'variableGetter2' ? types.object : types.all;
		case 'object':
			return !getWindowStore().isWindowOpen('elementGetter') ? types.object : types.object2;
		case 'writable-boolean':
		case 'writable-number':
		case 'writable-string':
			return types.writable;
		case 'deletable':
			return types.deletable;
	}
	return types.all;
};

/** 已装配的类型下拉。窗口每次挂载都会换新元素，WeakSet 因此天然支持重新装配。 */
const initializedTypeEls = new WeakSet<Element>();

/** 需要「属性键清单」的变量类型（类型切换或重新打开时按当前类型重填）。 */
const PRESET_TYPES = new Set(['actor', 'skill', 'state', 'equipment', 'item', 'element']);

/** 关系装好后立刻按当前值同步一次显隐：值往往先于关系写进控件。 */
const syncRelatedRows = (typeEl: YamiElement): void => syncRelatedElements(typeEl);

/**
 * 装配一个变量窗口：隐藏行关系、类型项本地化、输入联动。
 * 窗口是懒挂载的，控件不在注册表时静默返回；挂载完成后由 initialize / open 再跑一次。
 */
const initializeWindow = (prefix: string): void => {
	const typeEl = composableEls.get(`${prefix}-type`);
	if (!typeEl || initializedTypeEls.has(typeEl)) return;
	initializedTypeEls.add(typeEl);
	if (prefix === 'variableGetter2') {
		typeEl.enableHiddenMode().relate([
			{ case: 'local', targets: [composableEls.get('variableGetter2-common-key')] },
			{ case: 'global', targets: [composableEls.get('variableGetter2-global-key')] },
			{
				case: 'element',
				targets: [
					composableEls.get('variableGetter2-element'),
					composableEls.get('variableGetter2-preset-key')
				]
			}
		]);
		syncRelatedRows(typeEl);
		return;
	}

	typeEl.enableHiddenMode().relate([
		{ case: 'local', targets: [composableEls.get('variableGetter-common-key')] },
		{ case: 'global', targets: [composableEls.get('variableGetter-global-key')] },
		{
			case: 'actor',
			targets: [
				composableEls.get('variableGetter-actor'),
				composableEls.get('variableGetter-preset-key')
			]
		},
		{
			case: 'skill',
			targets: [
				composableEls.get('variableGetter-skill'),
				composableEls.get('variableGetter-preset-key')
			]
		},
		{
			case: 'state',
			targets: [
				composableEls.get('variableGetter-state'),
				composableEls.get('variableGetter-preset-key')
			]
		},
		{
			case: 'equipment',
			targets: [
				composableEls.get('variableGetter-equipment'),
				composableEls.get('variableGetter-preset-key')
			]
		},
		{
			case: 'item',
			targets: [
				composableEls.get('variableGetter-item'),
				composableEls.get('variableGetter-preset-key')
			]
		},
		{
			case: 'element',
			targets: [
				composableEls.get('variableGetter-element'),
				composableEls.get('variableGetter-preset-key')
			]
		}
	]);

	typeEl.setItemNames = function (
		this: HTMLElement & { dataItems: VarTypeItem[] },
		options: Record<string, string | { name?: string; tip?: string }>
	) {
		const backup = this.dataItems;
		this.dataItems = allTypes;
		selectBoxSetItemNames(this, options);
		this.dataItems = backup;
	};

	const commonKey = composableEls.get('variableGetter-common-key');
	if (commonKey) {
		TextSuggestion.listen!(
			commonKey as TextSuggestionTarget,
			createVarListGenerator(filterState)
		);
	}
	on(typeEl, 'write', typeWrite);
	on(typeEl, 'input', typeInput);
	syncRelatedRows(typeEl);
};

const initialize = (): void => {
	initializeWindow('variableGetter');
	initializeWindow('variableGetter2');
};

/** 控件侧的接线：类型项、隐藏行关系、全局键过滤、属性键清单、焦点。窗口挂载后才有效。 */
const syncControls = (prefix: string, filter: string): boolean => {
	const typeEl = composableEls.get(`${prefix}-type`);
	if (!typeEl) return false;
	initializeWindow(prefix);
	typeEl.loadItems(getTypeItems(filter, prefix));

	const globalKeyEl = registryElement<CustomBoxApi>(composableEls, `${prefix}-global-key`);
	if (globalKeyEl) {
		globalKeyEl.filter = filter.startsWith('writable-') ? filter.slice(9) : filter;
	}
	if (prefix === 'variableGetter2') {
		composableEls
			.get(`${prefix}-preset-key`)
			?.loadItems(Attribute.getAttributeItems('element', filter));
	} else if (PRESET_TYPES.has(form.type)) {
		loadPresetKeys(form.type);
	}
	getFocus(typeEl);
	return true;
};

/** 把 read() 出来的变量解析成表单状态。纯状态，不依赖窗口是否挂载。 */
const applyForm = (target: VariableGetterTarget, prefix: string, filter: string): void => {
	const variable = target.read?.() ?? { type: '', key: '' };
	const type = variable.type;
	const key = variable.key;
	if (prefix === 'variableGetter2') {
		let element = { type: 'trigger' };
		let commonKey = '';
		let globalKey = '';
		let presetKey = Attribute.getDefAttributeId('element', filter);
		switch (type) {
			case 'local':
				commonKey = key;
				break;
			case 'global':
				globalKey = key;
				break;
			case 'element':
				element = variable.element!;
				presetKey = key;
				break;
		}
		Object.assign(form, { type, element, commonKey, globalKey, presetKey });
	} else {
		let commonKey = '';
		let presetKey = '';
		let globalKey = '';
		let actor = { type: 'trigger' };
		let skill = { type: 'trigger' };
		let state = { type: 'trigger' };
		let equipment = { type: 'trigger' };
		let item = { type: 'trigger' };
		let element = { type: 'trigger' };
		switch (type) {
			case 'local':
				commonKey = key;
				break;
			case 'global':
				globalKey = key;
				break;
			case 'actor':
				actor = variable.actor!;
				presetKey = key;
				break;
			case 'skill':
				skill = variable.skill!;
				presetKey = key;
				break;
			case 'state':
				state = variable.state!;
				presetKey = key;
				break;
			case 'equipment':
				equipment = variable.equipment!;
				presetKey = key;
				break;
			case 'item':
				item = variable.item!;
				presetKey = key;
				break;
			case 'element':
				element = variable.element!;
				presetKey = key;
				break;
		}
		Object.assign(form, {
			type,
			actor,
			skill,
			state,
			equipment,
			item,
			element,
			commonKey,
			presetKey,
			globalKey
		});
	}
};

const open = (
	target: VariableGetterTarget,
	defaults?: { filter?: string; prefix?: string }
): void => {
	const prefix = defaults?.prefix ?? 'variableGetter';
	const filter = defaults?.filter ?? target.filter ?? 'all';
	states[prefix] = { target, filter };
	if (prefix === 'variableGetter') filterState.filter = filter;

	applyForm(target, prefix, filter);
	if (!syncControls(prefix, filter)) {
		// 窗口是懒挂载的：首次打开时控件注册表还是空的，此时写类型项 / 装隐藏行关系会静默丢失
		// （类型下拉退回红色原始值、十个字段全挤在 146px 的窗口里）。
		// 挂载完成后再补一次控件接线。
		onToolWindowMounted(prefix, () => {
			if (!syncControls(prefix, filter)) {
				console.warn(
					'[variableGetter] open: window mounted but controls are missing:',
					prefix
				);
			}
		});
	}
	getWindowStore().open(prefix);
};

const isNone = (variable: { key: string }): boolean => {
	return variable.key === '';
};

const loadPresetKeys = (group: string): void => {
	const keyBox = composableEls.get('variableGetter-preset-key');
	if (!keyBox) return;
	let type: string | undefined = undefined;
	switch (filterState.filter) {
		case 'boolean':
		case 'number':
		case 'string':
		case 'object':
			type = filterState.filter;
			break;
		case 'writable-boolean':
		case 'writable-number':
		case 'writable-string':
			type = filterState.filter.split('-')[1];
			break;
	}
	const items = Attribute.getAttributeItems(group, type as string);
	keyBox.loadItems(items);
};

const checkDataForPlugin = (data: { getter?: string }): boolean => {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'variable';
	}
	return false;
};

const createDefaultForPlugin = (): { getter: string; type: string; key: string } => {
	return { getter: 'variable', type: 'local', key: '' };
};

const createVarListGenerator = (filterObject: {
	filter: string | null;
}): (() => VarListEntry[]) => {
	return function (): VarListEntry[] {
		if (!EventEditor.commandList.read()) return [];

		const filter = (filterObject.filter as string).includes('boolean')
			? 'boolean'
			: (filterObject.filter as string).includes('number')
				? 'number'
				: (filterObject.filter as string).includes('string')
					? 'string'
					: (filterObject.filter as string).includes('object')
						? 'object'
						: 'any';

		const list = EventEditor.commandList as {
			elements: YamiElement[] & { count?: number };
			varList?: VarListEntry[];
		};
		const elements = list.elements;
		const count = elements.count ?? 0;
		const parentMap = new Map();
		const stack = [];
		for (let i = 0; i < count; i++) {
			const element = elements[i];
			if (!element) continue;
			if (element.dataKey === true && element.dataItem) {
				const indent = element.dataIndent ?? 0;
				while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
					stack.pop();
				}
				const parent = stack.length > 0 ? stack[stack.length - 1].command : null;
				if (!parentMap.has(element.dataItem)) {
					parentMap.set(element.dataItem, parent);
				}
				stack.push({ command: element.dataItem, indent });
			}
		}
		const getNamespaceRoot = (
			command: { id: string; params?: { namespace?: string; operation?: string } } | null
		): { id: string; params?: { namespace?: string; operation?: string } } | null => {
			let current = command;
			while (current) {
				if (
					current.id === 'registerEvent' &&
					current.params?.namespace &&
					current.params?.operation === 'register'
				) {
					return current;
				}
				current = parentMap.get(current);
			}
			return null;
		};
		const activeIndex = elementDataOf<{ active?: number | null }>(
			EventEditor.commandList
		).active;
		const activeElement =
			activeIndex !== null && activeIndex !== undefined ? elements[activeIndex] : null;
		const activeCommand = activeElement?.dataItem ?? activeElement?.dataParent ?? null;
		const activeNamespace = activeCommand ? getNamespaceRoot(activeCommand) : null;

		return (list.varList ?? []).filter(
			(item: { type: string; command?: { id: string } | null }) => {
				if (filter !== 'any' && item.type !== 'any' && filter !== item.type) {
					return false;
				}
				const itemCommand = item.command;
				const itemNamespace = itemCommand ? getNamespaceRoot(itemCommand) : null;
				return itemNamespace === activeNamespace;
			}
		);
	};
};

const typeWrite = (event: Event & { value: string }): void => {
	const type = event.value;
	switch (type) {
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element':
			loadPresetKeys(type);
			break;
	}
};

const typeInput = (event: Event & { value: string }): void => {
	const type = event.value;
	switch (type) {
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element': {
			const keyBox = registryElement<
				HTMLElement & {
					selectBox?: HTMLElement & {
						textContent: string;
						write(v: unknown): void;
						read(): unknown;
						dataItems: VarTypeItem[];
					};
				}
			>(composableEls, 'variableGetter-preset-key');
			const selectBox = keyBox?.selectBox ?? null;
			if (!selectBox) break;
			const attrName = selectBox.textContent;
			selectBox.write(selectBox.read());
			if (elementDataOf<{ invalid?: boolean }>(selectBox).invalid) {
				const items = selectBox.dataItems;
				let defValue = items[0]?.value;
				for (const item of items) {
					if (item.name === attrName) {
						defValue = item.value;
						break;
					}
				}
				if (defValue !== undefined) {
					selectBox.write(defValue);
				}
			}
			break;
		}
	}
};

const confirmCore = (prefix: string): void => {
	const state = states[prefix];
	if (!state) return;
	const { target, filter } = state;
	const data = form;
	const type = data.type;
	let getter: Record<string, unknown> | undefined;
	let key: string;
	switch (type) {
		case 'local':
			key = data.commonKey.trim();
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-common-key`));
				return;
			}
			getter = { type, key };
			break;
		case 'global': {
			key = data.globalKey;
			const variable = getVariable(key);
			const baseType =
				filter === 'boolean' || filter === 'number' || filter === 'string' ? filter : null;
			if (key === '' || (baseType && typeof variable?.value !== baseType)) {
				getFocus(composableEls.get(`${prefix}-global-key`));
				return;
			}
			getter = { type, key };
			break;
		}
		case 'element': {
			const element = data.element;
			key = data.presetKey;
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-preset-key`));
				return;
			}
			getter = { type, element, key };
			break;
		}
		case 'self':
			getter = { type };
			break;
		case 'actor': {
			const actor = data.actor;
			key = data.presetKey;
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-preset-key`));
				return;
			}
			getter = { type, actor, key };
			break;
		}
		case 'skill': {
			const skill = data.skill;
			key = data.presetKey;
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-preset-key`));
				return;
			}
			getter = { type, skill, key };
			break;
		}
		case 'state': {
			const stateVal = data.state;
			key = data.presetKey;
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-preset-key`));
				return;
			}
			getter = { type, state: stateVal, key };
			break;
		}
		case 'equipment': {
			const equipment = data.equipment;
			key = data.presetKey;
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-preset-key`));
				return;
			}
			getter = { type, equipment, key };
			break;
		}
		case 'item': {
			const item = data.item;
			key = data.presetKey;
			if (key === '') {
				getFocus(composableEls.get(`${prefix}-preset-key`));
				return;
			}
			getter = { type, item, key };
			break;
		}
	}
	if (target.isPluginInput) {
		getter = { getter: 'variable', ...getter };
	}
	target?.input?.(getter!);
	getWindowStore().close(prefix);
};

const confirm = (): void => {
	confirmCore('variableGetter');
};

const confirm2 = (): void => {
	confirmCore('variableGetter2');
};

const onWindowClosed = (): void => {
	states.variableGetter = null;
};

const onWindow2Closed = (): void => {
	states.variableGetter2 = null;
};

export function useVariableGetterWindow(): VariableGetterWindow {
	return {
		form,
		types,
		initialize,
		open,
		confirm,
		confirm2,
		onWindowClosed,
		onWindow2Closed,
		isNone,
		loadPresetKeys,
		checkDataForPlugin,
		createDefaultForPlugin,
		createVarListGenerator,
		typeWrite,
		typeInput
	};
}
