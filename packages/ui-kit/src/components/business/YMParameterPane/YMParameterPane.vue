<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
	addClass,
	dispatchChangeEvent,
	dispatchUpdateEvent,
	hide,
	read,
	removeClass,
	show,
	write
} from '../../../utils/dom';
import { attachApi } from '../../../utils/attach-api';
import { elementDataOf } from '../../../utils/element-data';
import { createParamPaneCore, type ParamDef } from './param-pane-core';
import type { ManifestEntry } from './manifest-entry';
import { readPayload } from '../../../utils/payload-event';

const core = createParamPaneCore();

interface PaneControlFactory {
	checkBox(): HTMLElement;
	colorBox(): HTMLElement;
	keyboardBox(): HTMLElement;
	customBox(): HTMLElement;
	detailBox(): HTMLElement;
	detailSummary(): HTMLElement;
	numberBox(): HTMLElement;
	numberVar(): HTMLElement;
	selectBox(): HTMLElement;
	textBox(): HTMLElement;
}

interface ScriptDef {
	id: string;
	parameters: Record<string, unknown>;
	[k: string]: unknown;
}

interface TypeRegistryConfig {
	create(pane: HTMLElement, parameter: ParamDef): ParamWrap | null;
}

/**
 * 文本框的选区适配器。
 *
 * 第 142 轮：四个形参从 `Event` 收窄成**注册点真实的 DOM 事件类型**（`createTextBox` 里就是
 * `keydown` / `keyup` / `pointerdown` / `pointerup` 四条注册，见本文件 :607-618）。
 * 写宽成 `Event` 的代价是：宿主侧那些**按事件类型签名**的处理器（编辑器里 `Selection` 的
 * `inputKeydown(event: KeyboardEvent)` …）与它「互不重叠」，宿主只能写
 * `Selection as unknown as { inputKeydown?: (event: Event) => void; … }` 把值谎报一遍。
 */
interface SelectionAdapter {
	inputKeydown?: (event: KeyboardEvent) => void;
	inputKeyup?: (event: KeyboardEvent) => void;
	inputPointerdown?: (event: PointerEvent) => void;
	inputPointerup?: (event: PointerEvent) => void;
}

interface PluginAdapter {
	reconstruct(script: ScriptDef): boolean;
	checkValidate(param: ParamDef, val: unknown): boolean;
}

interface SelectListAdapter {
	target: HTMLElement | null;
	close(): void;
}

interface DetailWrap {
	tag: string;
	box: DetailBoxElement;
	summary: HTMLElement | null;
	grid: HTMLElement;
	children: ParamWrap[];
}

type DetailBoxElement = HTMLElement & {
	meta?: DetailMeta | null;
	data?: ScriptDef | null;
	wrap?: DetailWrap;
};

interface DetailMeta {
	manager: { states: Record<string, unknown> };
	parameters: ParamDef[];
}

type ParamInput = HTMLElement & {
	parameters?: Record<string, unknown> | null;
	key?: string | null;
	branched?: boolean;
	inputEventEnabled?: boolean;
	enable?(): void;
	disable?(): void;
	clear?(): void;
	update?(): void;
	input?: HTMLElement & { value?: string };
	numBox?: { input: HTMLElement & { value?: string } };
};

/** P4b：控件元素上的元素数据（`parameters` / `key` 仍在 DATA_FIELDS 内） */
interface ParamInputData {
	parameters?: Record<string, unknown> | null;
	key?: string | null;
}

const inputData = (el: unknown): ParamInputData => elementDataOf<ParamInputData>(el);

interface ParamWrap {
	tag: string;
	label: HTMLElement;
	input: ParamInput;
}

interface RepeatableRowWrap {
	param: ParamDef;
	tag?: string;
	label: HTMLElement;
	input: ParamInput;
}

interface RecycleWrap {
	tag: string;
	label: HTMLElement;
	input: ParamInput;
	box: DetailBoxElement;
	children: ParamWrap[];
}

/**
 * 可重复参数组（元素是 `div.repeatable-group`）。
 *
 * 第 147 轮改 `extends HTMLElement` → `extends HTMLDivElement`：这正是第 86 轮注释里
 * 指出的两条拆法之一（当时实测「写成 `HTMLElement & RepeatableGroupInput` 也不行」——
 * 因为源是 `HTMLDivElement`，交叉要求源对整体可比）。源与接口同族之后，构造点那句
 * `container as unknown as RepeatableGroupInput` 降级为单次 `as`（断言只剩「补上运行期
 * 接着就挂上的那五个成员」，见 `createRepeatableGroup` 里紧跟着的赋值）。
 */
interface RepeatableGroupInput extends HTMLDivElement {
	setTooltip: () => void;
	parameters: Record<string, unknown> | null;
	key: string | null;
	// oxlint-disable-next-line no-explicit-any
	read: () => any[];
	write: (value: Array<Record<string, unknown>>) => void;
}

interface Props {
	id?: string;
	controls?: PaneControlFactory | null;
	typeRegistry?: { get(type: string): TypeRegistryConfig | undefined } | null;
	// oxlint-disable-next-line no-explicit-any
	dataManifest?: (() => { guidMap: Record<string, ManifestEntry> } | null) | null;
	plugin?: PluginAdapter | null;
	localize?: ((key: string) => string) | null;
	selection?: SelectionAdapter | null;
	selectList?: SelectListAdapter | null;
	measureText?: ((text: string, font: string) => { width: number }) | null;
	setTooltip?: ((el: HTMLElement, tip: string) => void) | null;
}

const props = withDefaults(defineProps<Props>(), {
	controls: null,
	typeRegistry: null,
	dataManifest: null,
	plugin: null,
	localize: null,
	selection: null,
	selectList: null,
	measureText: null,
	setTooltip: null
});

const emit = defineEmits<{
	update: [event: Event];
}>();

const root = ref<HTMLElement | null>(null);
const headPadRef = ref<HTMLElement | null>(null);

// oxlint-disable-next-line no-explicit-any
let el: (HTMLElement & { [k: string]: any }) | null = null;

const paneState = {
	scriptList: null as unknown,
	headPad: null as unknown,
	metas: [] as unknown[],
	wraps: [] as unknown[],
	detailBoxes: [] as unknown[],
	checkBoxes: [] as unknown[],
	numberBoxes: [] as unknown[],
	numberVars: [] as unknown[],
	textBoxes: [] as unknown[],
	selectBoxes: [] as unknown[],
	keyboardBoxes: [] as unknown[],
	colorBoxes: [] as unknown[],
	customBoxes: [] as unknown[],
	updateEventEnabled: false
};

const paneStateFields = [
	'scriptList',
	'headPad',
	'metas',
	'wraps',
	'detailBoxes',
	'checkBoxes',
	'numberBoxes',
	'numberVars',
	'textBoxes',
	'selectBoxes',
	'keyboardBoxes',
	'colorBoxes',
	'customBoxes',
	'updateEventEnabled'
] as const;

// oxlint-disable-next-line no-explicit-any
const attachStateAccessors = (self: HTMLElement & { [k: string]: any }): void => {
	for (const key of paneStateFields) {
		Object.defineProperty(self, key, {
			configurable: true,
			get: () => paneState[key],
			set: (value: unknown) => {
				paneState[key] = value as never;
			}
		});
	}
};

const createControl = (kind: keyof PaneControlFactory): HTMLElement | null => {
	const factory = props.controls as PaneControlFactory | null;
	if (!factory) return null;
	switch (kind) {
		case 'checkBox':
			return factory.checkBox();
		case 'colorBox':
			return factory.colorBox();
		case 'keyboardBox':
			return factory.keyboardBox();
		case 'customBox':
			return factory.customBox();
		case 'detailBox':
			return factory.detailBox();
		case 'detailSummary':
			return factory.detailSummary();
		case 'numberBox':
			return factory.numberBox();
		case 'numberVar':
			return factory.numberVar();
		case 'selectBox':
			return factory.selectBox();
		case 'textBox':
			return factory.textBox();
	}
	return null;
};

const getTypeConfig = (type: string): TypeRegistryConfig | undefined =>
	props.typeRegistry?.get(type);

// 值的形状见 `ManifestEntry`（第 156 轮：从 `Record<string, any>` 收成具名条目）
const getManifest = (): { guidMap: Record<string, ManifestEntry> } | null =>
	props.dataManifest ? props.dataManifest() : null;

const getPlugin = (): PluginAdapter | null => props.plugin;

const getLocal = (key: string): string => (props.localize ? props.localize(key) : key);

const getSelection = (): SelectionAdapter | null => props.selection;

const getMeasureText = (text: string, font: string): { width: number } =>
	props.measureText ? props.measureText(text, font) : { width: 0 };

const getSetTooltip = (): ((el: HTMLElement, tip: string) => void) | null => props.setTooltip;

/**
 * `bind()` 收到的列表元素：运行期还挂着父组件的数据面（参数列表挂 `object`，树列表挂 `data`）。
 * 声明出来之后，两个读点就不必各写一次 `as unknown as { … }` —— 病灶一直在「参数声明写窄了」。
 */
interface ParamScriptListElement extends HTMLElement {
	object?: { update: (...args: unknown[]) => unknown };
	data?: ScriptDef[];
}

const bind = (scriptList: ParamScriptListElement): void => {
	const self = el!;
	self.scriptList = scriptList;
	if (scriptList.classList.contains('param-list')) {
		// `!` 保持原来的空值语义（原先的断言也是「说它有」）
		const object = scriptList.object!;
		const { update } = object;
		self.getData = () => scriptList.data!;
		object.update = (...args: unknown[]) => {
			update.apply(object, args);
			self.update();
		};
	}
	if (scriptList.classList.contains('tree-list')) {
		self.getData = () => {
			const item = read(scriptList as HTMLElement);
			return item ? [item] : [];
		};
	}
};

const rewrite = (parameters: Record<string, unknown>, key: string): void => {
	const self = el!;
	for (const wrap of self.wraps) {
		const script = wrap.box.data;
		const map = script.parameters;
		if (map !== parameters) continue;
		for (const { input } of wrap.children) {
			if (inputData(input).key === key) {
				write(input, parameters[key]);
				if (self.scriptList) dispatchChangeEvent(self.scriptList);
				if (input.branched) {
					getPlugin()?.reconstruct(script);
					self.updateParamDisplay(wrap.box);
					self.onResize?.();
				}
				return;
			}
		}
	}
};

const update = (): void => {
	const self = el!;
	self.clear();
	self.appendHeadPad();
	let changed = false;
	const scripts = self.getData();
	const manifest = getManifest();
	const map = manifest?.guidMap ?? {};
	for (const script of scripts) {
		const meta = map[script.id];
		if (!meta) continue;
		self.metas.push(meta);
		if (getPlugin()?.reconstruct(script)) {
			changed = true;
		}
		const paramList = meta.parameters;
		// `?.`：`parameters` 在非 script 条目上是 `null`（见 `Meta` 的声明）；旧写法直接
		// `.length` 会抛 —— 这是「不可能路径上由抛错改成跳过」的那类等价改动（第 143 轮同款）。
		if (!paramList?.length) continue;
		const langMap = meta.langMap.update();
		const parameters = script.parameters;
		if (meta.overview?.deprecated && paramList.length) {
			const banner = document.createElement('div');
			addClass(banner, 'deprecated-banner');
			banner.textContent = core.deprecatedBannerText(meta.overview.deprecated);
			self.appendChild(banner);
		}
		const { groupOrder, groupMap } = core.groupParameters(paramList);
		const createParamRow = (
			_box: HTMLElement,
			grid: HTMLElement,
			children: ParamWrap[],
			parameter: ParamDef
		) => {
			const inputWrap = self.createParamInput(parameter)!;
			const { label, input } = inputWrap;
			const data = inputData(input);
			const key = parameter.key;
			const name = langMap.get(parameter.alias) ?? key;
			const desc = langMap.get(parameter.desc);
			const tip = core.formatParamTip(name, desc);
			self.updateParamInput(inputWrap, parameters[key]);
			label.textContent = name;
			getSetTooltip()?.(input as HTMLElement, tip);
			data.parameters = parameters;
			data.key = key;
			grid.appendChild(label);
			if (parameter.prefix || parameter.suffix) {
				self.applyAffix(input, parameter);
			}
			grid.appendChild(input);
			enableInput(input);
			if (parameter.readonly) {
				disableInput(input);
			}
			if (parameter.validate) {
				const validateInput = () => {
					const data = inputData(input);
					// `key!`：与同文件 `states[key!]` / `paramMap[key!]` 一致——只有 createParamRow 配过的控件才会注册本回调
					const val = data.parameters?.[data.key!];
					const ok = core.isParamValueValid(parameter, val, getPlugin());
					if (ok) {
						removeClass(input as HTMLElement, 'validate-error');
					} else {
						addClass(input as HTMLElement, 'validate-error');
					}
				};
				const nativeInput = (input as HTMLElement & { input?: HTMLElement }).input || input;
				nativeInput.addEventListener('input', validateInput);
			}
			children.push(inputWrap);
		};
		for (const g of groupOrder) {
			const isMain = g === '';
			const detailWrap = self.createDetailBox();
			const { box, summary, grid, children } = detailWrap;
			box.meta = meta;
			box.data = script;
			self.wraps.push(detailWrap);
			if (summary?.classList.contains('detail-summary')) {
				if (isMain) {
					summary.textContent = getLocal('parameter.param');
				} else {
					summary.textContent = langMap.get(g) ?? g;
				}
			}
			for (const parameter of groupMap.get(g)!) {
				if (parameter.hidden) continue;
				createParamRow(box, grid, children, parameter);
			}
			self.updateParamDisplay(box);
			self.appendChild(box);
		}
	}
	if (changed) {
		if (self.scriptList) dispatchChangeEvent(self.scriptList);
	}
	if (self.updateEventEnabled) {
		dispatchUpdateEvent(self);
	}
	self.onResize?.();
	window.addEventListener('script-change', scriptChange);
};

const enableInput = (el: ParamInput): void => {
	if (el && typeof el.enable === 'function') {
		el.enable();
	} else {
		el?.classList?.remove('disabled');
	}
};

const disableInput = (el: ParamInput): void => {
	if (el && typeof el.disable === 'function') {
		el.disable();
	} else {
		el?.classList?.add('disabled');
	}
};

const appendHeadPad = (): void => {
	const self = el!;
	let { headPad } = self;
	if (headPad === null || !headPad.parentNode) {
		headPad = headPadRef.value ?? document.createElement('div');
		headPad.style.display = 'none';
		self.headPad = headPad;
	}
	self.appendChild(headPad);
};

const createDetailBox = (): DetailWrap => {
	const self = el!;
	const { detailBoxes } = self;
	let box: HTMLElement;
	if (detailBoxes.length !== 0) {
		box = detailBoxes.pop().box;
		while (box.firstChild) {
			box.removeChild(box.firstChild);
		}
	} else {
		box = createControl('detailBox')!;
	}
	const tag = 'detail-box';
	const summary = createControl('detailSummary');
	const grid = document.createElement('div');
	addClass(grid, 'detail-grid');
	const wrap: DetailWrap = { tag, box, summary, grid, children: [] };
	box.appendChild(summary!);
	box.appendChild(grid);
	(box as HTMLElement & { wrap?: DetailWrap }).wrap = wrap;
	return wrap;
};

const createParamInput = (parameter: ParamDef): ParamWrap | null | undefined => {
	const config = getTypeConfig(parameter.type);
	if (config) {
		return config.create(el!, parameter);
	}
	return undefined;
};

const updateParamInput = (wrap: ParamWrap, value: unknown): void => {
	switch (wrap.tag) {
		case 'check-box':
		case 'text-box':
			if (read(wrap.input) !== value) write(wrap.input, value);
			break;
		case 'number-box':
			if (read(wrap.input) !== value) {
				write(wrap.input, value);
			} else {
				wrap.input.input!.value = (value as { toString(): string }).toString();
			}
			break;
		case 'number-var':
			if (read(wrap.input) !== value) {
				write(wrap.input, value);
			} else if (typeof value === 'number') {
				// P4b：numBox 走显式元素数据（字段已从 DATA_FIELDS 摘除）
				elementDataOf<{ numBox?: { input: { value: string } } }>(
					wrap.input
				).numBox!.input.value = value.toString();
			}
			break;
		case 'keyboard-box':
		case 'color-box':
			if (read(wrap.input) !== value) write(wrap.input, value);
			break;
		case 'select-box':
		case 'custom-box':
			if (read(wrap.input) !== value) {
				write(wrap.input, value);
			} else {
				wrap.input.update!();
			}
			break;
		case 'repeatable-group':
			if (read(wrap.input) !== value) {
				write(wrap.input, value);
			}
			break;
	}
};

const updateParamDisplay = (detailBox: DetailBoxElement): void => {
	const { states } = detailBox.meta!.manager;
	const mParams = detailBox.meta!.parameters;
	const paramMap: Record<string, ParamDef> = {};
	for (const p of mParams) paramMap[p.key] = p;
	const wraps = detailBox.wrap!.children;
	for (const wrap of wraps) {
		const key = inputData(wrap.input).key;
		switch (states[key!]) {
			case false:
				hide(wrap.label);
				hide(wrap.input);
				continue;
			default:
				show(wrap.label);
				show(wrap.input);
				continue;
		}
	}
	for (const wrap of wraps) {
		const data = inputData(wrap.input);
		const key = data.key;
		const param = paramMap[key!];
		const parameters = data.parameters;
		if (param?.validate && parameters) {
			const value = parameters[key!];
			const ok = !!getPlugin()?.checkValidate(param, value);
			if (ok) {
				removeClass(wrap.input, 'validate-error');
			} else {
				addClass(wrap.input, 'validate-error');
			}
		} else {
			removeClass(wrap.input, 'validate-error');
		}
	}
};

const createCheckBox = (): ParamWrap => {
	const self = el!;
	const { checkBoxes } = self;
	if (checkBoxes.length !== 0) {
		return checkBoxes.pop();
	}
	const tag = 'check-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('checkBox');
	if (input) {
		(input as ParamInput).inputEventEnabled = true;
		addClass(input, 'standard');
		addClass(input, 'large');
	}
	return { tag, label, input: input as ParamInput };
};

const createNumberBox = (): ParamWrap => {
	const self = el!;
	const { numberBoxes } = self;
	if (numberBoxes.length !== 0) {
		return numberBoxes.pop();
	}
	const tag = 'number-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('numberBox');
	return { tag, label, input: input as ParamInput };
};

const createNumberVar = (): ParamWrap => {
	const self = el!;
	const { numberVars } = self;
	if (numberVars.length !== 0) {
		return numberVars.pop();
	}
	const tag = 'number-var';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('numberVar');
	return { tag, label, input: input as ParamInput };
};

const createTextBox = (): ParamWrap => {
	const self = el!;
	const { textBoxes } = self;
	if (textBoxes.length !== 0) {
		return textBoxes.pop();
	}
	const tag = 'text-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('textBox');
	const selection = getSelection();
	if (input) {
		if (selection?.inputKeydown) {
			input.addEventListener('keydown', selection.inputKeydown);
		}
		if (selection?.inputKeyup) {
			input.addEventListener('keyup', selection.inputKeyup);
		}
		if (selection?.inputPointerdown) {
			input.addEventListener('pointerdown', selection.inputPointerdown);
		}
		if (selection?.inputPointerup) {
			input.addEventListener('pointerup', selection.inputPointerup);
		}
	}
	return { tag, label, input: input as ParamInput };
};

const createSelectBox = (): ParamWrap => {
	const self = el!;
	const { selectBoxes } = self;
	if (selectBoxes.length !== 0) {
		return selectBoxes.pop();
	}
	const tag = 'select-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('selectBox');
	return { tag, label, input: input as ParamInput };
};

const createKeyboardBox = (): ParamWrap => {
	const self = el!;
	const { keyboardBoxes } = self;
	if (keyboardBoxes.length !== 0) {
		return keyboardBoxes.pop();
	}
	const tag = 'keyboard-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('keyboardBox');
	return { tag, label, input: input as ParamInput };
};

const createColorBox = (): ParamWrap => {
	const self = el!;
	const { colorBoxes } = self;
	if (colorBoxes.length !== 0) {
		return colorBoxes.pop();
	}
	const tag = 'color-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('colorBox');
	return { tag, label, input: input as ParamInput };
};

const createCustomBox = (): ParamWrap => {
	const self = el!;
	const { customBoxes } = self;
	if (customBoxes.length !== 0) {
		return customBoxes.pop();
	}
	const tag = 'custom-box';
	const label = document.createElement('div');
	addClass(label, 'text');
	const input = createControl('customBox');
	return { tag, label, input: input as ParamInput };
};

const createRepeatableGroup = (parameter: ParamDef): ParamWrap => {
	const template = parameter.repeatableGroup!.parameters;
	const tag = 'repeatable-group';
	const label = document.createElement('div');
	addClass(label, 'text');
	const container = document.createElement('div');
	container.className = 'repeatable-group';
	const rowsEl = document.createElement('div');
	rowsEl.className = 'repeatable-group-rows';
	const addBtn = document.createElement('button');
	addBtn.textContent = '+';
	addBtn.className = 'add-row-btn';
	container.appendChild(rowsEl);
	container.appendChild(addBtn);
	// 第 147 轮：`RepeatableGroupInput` 已改成 `extends HTMLDivElement`（第 86 轮注释里指出的
	// 拆法之一）⇒ 源与接口同族，断言从 `as unknown as` 降级为单次 `as`。
	// 剩下这层单次 `as` 只主张「紧接着要在它上面挂那五个成员」（下面三行 + `read` / `write`），
	// 属于本文件既有的「先建后补」写法；写法本身与 legacy 一致（legacy 也是元素先建、成员后挂）。
	const input = container as RepeatableGroupInput;
	input.setTooltip = () => {};
	const data = inputData(input);
	data.parameters = null;
	data.key = null;
	const pane = el!;
	input.read = function () {
		const result: Array<Record<string, unknown>> = [];
		for (const rowEl of rowsEl.children) {
			const data: Record<string, unknown> = {};
			for (const { param, input } of (rowEl as HTMLElement & { wraps: RepeatableRowWrap[] })
				.wraps) {
				data[param.key] = read(input);
			}
			result.push(data);
		}
		return result;
	};
	input.write = function (value: Array<Record<string, unknown>>) {
		rowsEl.innerHTML = '';
		const arr = core.normalizeRepeatableRows(value, template);
		for (const item of arr) {
			const row = document.createElement('div');
			row.className = 'repeatable-group-row';
			const removeBtn = document.createElement('button');
			removeBtn.className = 'repeatable-group-remove';
			removeBtn.textContent = '×';
			removeBtn.onclick = function (e: MouseEvent) {
				e.stopPropagation();
				row.remove();
				container.dispatchEvent(new Event('change', { bubbles: true }));
			};
			row.appendChild(removeBtn);
			const grid = document.createElement('div');
			addClass(grid, 'detail-grid');
			row.appendChild(grid);
			(row as HTMLElement & { wraps?: RepeatableRowWrap[] }).wraps = template.map(
				(subParam: ParamDef): RepeatableRowWrap => {
					const config = getTypeConfig(subParam.type);
					const wrap = config ? config.create(pane, subParam) : null;
					const val = core.resolveSubParamValue(item, subParam);
					if (wrap) {
						wrap.label.textContent = '';
						const data = inputData(wrap.input);
						data.parameters = item;
						data.key = subParam.key;
						write(wrap.input, val);
						enableInput(wrap.input);
						removeClass(wrap.input, 'validate-error');
						if (subParam.readonly) {
							disableInput(wrap.input);
						}
						grid.appendChild(wrap.label);
						if (subParam.prefix || subParam.suffix) {
							pane.applyAffix(wrap.input, subParam);
						}
						grid.appendChild(wrap.input);
					}
					return { param: subParam, ...wrap } as RepeatableRowWrap;
				}
			);
			rowsEl.appendChild(row);
		}
	};
	addBtn.onclick = function (e: MouseEvent) {
		e.stopPropagation();
		const data = input.read();
		data.push(core.createRepeatableRowData(template));
		input.write(data);
		container.dispatchEvent(new Event('change', { bubbles: true }));
	};
	return { tag, label, input: container as ParamInput };
};

const recycle = (wrap: RecycleWrap): void => {
	const self = el!;
	switch (wrap.tag) {
		case 'detail-box': {
			const { children } = wrap;
			let i = children.length;
			while (--i >= 0) {
				self.recycle(children[i]);
			}
			children.length = 0;
			wrap.box.meta = null;
			wrap.box.data = null;
			self.detailBoxes.push(wrap);
			break;
		}
		case 'check-box':
		case 'number-box':
		case 'number-var':
		case 'text-box':
		case 'keyboard-box':
		case 'repeatable-group':
			wrap.label.remove();
			wrap.input.remove();
			inputData(wrap.input).parameters = null;
			inputData(wrap.input).key = null;
			if (wrap.tag === 'check-box') self.checkBoxes.push(wrap);
			if (wrap.tag === 'number-box') self.numberBoxes.push(wrap);
			if (wrap.tag === 'number-var') self.numberVars.push(wrap);
			if (wrap.tag === 'text-box') self.textBoxes.push(wrap);
			if (wrap.tag === 'keyboard-box') self.keyboardBoxes.push(wrap);
			break;
		case 'select-box':
			wrap.label.remove();
			wrap.input.remove();
			inputData(wrap.input).parameters = null;
			inputData(wrap.input).key = null;
			wrap.input.clear!();
			self.selectBoxes.push(wrap);
			break;
		case 'color-box':
			wrap.label.remove();
			wrap.input.remove();
			inputData(wrap.input).parameters = null;
			inputData(wrap.input).key = null;
			if (wrap.input.tabIndex === 0) {
				self.colorBoxes.push(wrap);
			}
			break;
		case 'custom-box':
			wrap.label.remove();
			wrap.input.remove();
			inputData(wrap.input).parameters = null;
			inputData(wrap.input).key = null;
			if (wrap.input.tabIndex === 0) {
				self.customBoxes.push(wrap);
			}
			break;
	}
};

const clear = (): void => {
	const self = el!;
	self.metas = [];
	const { wraps } = self;
	let i = wraps.length;
	if (i !== 0) {
		while (--i >= 0) {
			self.recycle(wraps[i]);
		}
		wraps.length = 0;
		self.textContent = '';
	}
	if (!self.scriptList?.data) {
		window.removeEventListener('script-change', scriptChange);
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	el!.addEventListener(type, listener, options);
	if (type === 'update') {
		el!.updateEventEnabled = true;
	}
};

const componentChange = (event: Event): void => {
	const self = el!;
	let element = event.target as HTMLElement;
	if (element.tagName === 'INPUT') {
		element = element.parentNode as HTMLElement;
	}
	if ((element.parentNode as HTMLElement | null)?.classList?.contains('number-var')) {
		element = element.parentNode as HTMLElement;
	}
	const { parameters, key } = elementDataOf<{
		parameters: Record<string, unknown>;
		key: string;
	}>(element);
	const { scriptList } = self;
	if (scriptList?.classList?.contains('param-list')) {
		const { history } = scriptList;
		const { editor } = history;
		if (editor) {
			history.save({
				type: 'script-parameter-change',
				editor: editor,
				target: editor.target,
				meta: editor.meta,
				list: self,
				parameters: parameters,
				key: key,
				value: parameters[key]
			});
		}
	}
	parameters[key] = read(element);
	if (scriptList) dispatchChangeEvent(scriptList, 1);
	const grid = element.parentNode as HTMLElement;
	const detail = grid.parentNode as DetailBoxElement | null;
	if (detail?.meta) {
		if ((element as HTMLElement & { branched?: boolean }).branched) {
			getPlugin()?.reconstruct(detail.data!);
		}
		self.updateParamDisplay(detail);
		self.onResize?.();
	}
};

const applyAffix = (input: HTMLElement, param: ParamDef): void => {
	const font = 'var(--ym-font-mono)';
	if (param.prefix) {
		const pre = document.createElement('div');
		pre.textContent = param.prefix;
		addClass(pre, 'param-affix');
		addClass(pre, 'left');
		addClass(pre, 'text');
		input.insertBefore(pre, (input as HTMLElement & { input: HTMLElement }).input);
	}
	if (param.suffix) {
		const suf = document.createElement('div');
		suf.textContent = param.suffix;
		addClass(suf, 'param-affix');
		addClass(suf, 'right');
		addClass(suf, 'text');
		input.insertBefore(suf, (input as HTMLElement & { input: HTMLElement }).input);
	}
	if ((input as HTMLElement & { input: HTMLElement }).input) {
		if (param.prefix) {
			const pw = getMeasureText(param.prefix, font).width + 8;
			(input as HTMLElement & { input: HTMLElement }).input.style.paddingLeft = pw + 'px';
		}
		if (param.suffix) {
			const sw = getMeasureText(param.suffix, font).width + 8;
			(input as HTMLElement & { input: HTMLElement }).input.style.paddingRight = sw + 'px';
		}
	}
};

const windowLocalize = (_event: Event): void => {
	const self = el!;
	for (const { langMap } of self.metas) {
		const oldMap = langMap.active;
		const newMap = langMap.update().active;
		if (oldMap !== newMap) {
			self.update();
			return;
		}
	}
};

const scriptChange = (event: Event): void => {
	const self = el!;
	for (const meta of self.metas) {
		if (meta === readPayload<{ changedMeta?: unknown }>(event).changedMeta) {
			const selectList = props.selectList;
			if (selectList && self.contains(selectList.target as HTMLElement)) {
				selectList.close();
			}
			self.update();
			return;
		}
	}
};

defineExpose({
	bind,
	rewrite,
	update,
	appendHeadPad,
	createDetailBox,
	createParamInput,
	updateParamInput,
	updateParamDisplay,
	createCheckBox,
	createNumberBox,
	createNumberVar,
	createTextBox,
	createSelectBox,
	createKeyboardBox,
	createColorBox,
	createCustomBox,
	createRepeatableGroup,
	recycle,
	clear,
	on,
	componentChange,
	applyAffix,
	root
});

onMounted(() => {
	// oxlint-disable-next-line no-explicit-any
	const self = root.value as HTMLElement & { [k: string]: any };
	if (!self) return;
	el = self;
	attachStateAccessors(self);
	self.scriptList = null;
	self.headPad = headPadRef.value;
	self.metas = [];
	self.wraps = [];
	self.detailBoxes = [];
	self.checkBoxes = [];
	self.numberBoxes = [];
	self.numberVars = [];
	self.textBoxes = [];
	self.selectBoxes = [];
	self.keyboardBoxes = [];
	self.colorBoxes = [];
	self.customBoxes = [];
	self.updateEventEnabled = false;
	attachApi(self, {
		getData: () => [],
		windowLocalize,
		scriptChange,
		bind,
		rewrite,
		update,
		appendHeadPad,
		createDetailBox,
		createParamInput,
		updateParamInput,
		updateParamDisplay,
		createCheckBox,
		createNumberBox,
		createNumberVar,
		createTextBox,
		createSelectBox,
		createKeyboardBox,
		createColorBox,
		createCustomBox,
		createRepeatableGroup,
		recycle,
		clear,
		on,
		componentChange,
		applyAffix
	});
	window.addEventListener('localize', windowLocalize);
	self.addEventListener('change', componentChange);
	self.addEventListener('update', (e: Event) => emit('update', e));
});

onBeforeUnmount(() => {
	const self = el;
	if (!self) return;
	window.removeEventListener('localize', windowLocalize);
	window.removeEventListener('script-change', scriptChange);
});
</script>

<template>
	<div class="parameter-pane" ref="root" :id="props.id">
		<slot />
		<div ref="headPadRef" style="display: none"></div>
	</div>
</template>

<style module>
:global(:where(.parameter-pane)) {
	display: block;
	padding-bottom: 60px;
}

:global(:where(.repeatable-group)) {
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
}

:global(:where(.repeatable-group-rows)) {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

:global(:where(.repeatable-group-row)) {
	display: flex;
	align-items: flex-start;
	gap: 4px;
	padding: 4px;
	border: 1px solid var(--border-color);
	border-radius: 2px;
}

:global(.repeatable-group-row .repeatable-group-remove) {
	position: relative;
	width: 20px;
	height: 20px;
	flex-shrink: 0;
}

:global(.repeatable-group .add-row-btn) {
	position: relative;
	width: auto;
	padding: 2px 12px;
	height: 22px;
}

:global(:where(.detail-grid)) {
	display: grid;
	margin: 4px 4px 4px 10px;
	grid-gap: 4px;
	grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}

:global(:where(.detail-grid > .text)) {
	line-height: 20px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

:global(:where(.param-affix)) {
	position: absolute;
	padding: 0 4px;
	line-height: 18px;
	font-family: var(--font-family-mono);
	color: var(--text-color-unit);
	pointer-events: none;
	user-select: none;
}

:global(:where(.param-affix.left)) {
	left: 0;
}

:global(:where(.param-affix.right)) {
	right: 0;
}

:global(:where(.deprecated-banner)) {
	padding: 6px 10px;
	margin: 4px 4px 0;
	font-size: 11px;
	color: #e8a33d;
	background: rgba(232, 163, 61, 0.1);
	border: 1px solid rgba(232, 163, 61, 0.3);
	border-radius: 2px;
}

:global(:where(.validate-error)) {
	outline: 1px solid var(--text-color-error);
	outline-offset: -1px;
}

:global(:where(.repeatable-group-row .detail-grid)) {
	grid-template-columns: auto 1fr;
	margin: 0;
	flex: 1;
	min-width: 0;
}
</style>
