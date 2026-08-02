<template>
	<div class="parameter-pane" ref="root" :id="props.id">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
	addClass,
	disable,
	dispatchChangeEvent,
	dispatchUpdateEvent,
	enable,
	hide,
	read as readElement,
	removeClass,
	setTooltip,
	show,
	write
} from '@/util/element-utils';
import { createCheckBox as createCheckBoxElement } from '@/components/check-box';
import { createColorBox as createColorBoxElement } from '@/components/color-box';
import { createKeyboardBox as createKeyboardBoxElement } from '@/components/keyboard-box';
import { createCustomBox as createCustomBoxElement } from '@/components/custom-box';
import { createDetailBox as createDetailBoxElement } from '@/components/detail-box';
import { createDetailSummary } from '@/components/detail-summary';
import { createNumberBox as createNumberBoxElement } from '@/components/number-box';
import { createNumberVar as createNumberVarElement } from '@/components/number-var';
import { createSelectBox as createSelectBoxElement } from '@/components/select-box';
import { createTextBox as createTextBoxElement } from '@/components/text-box';
import { TypeRegistry } from '@/components/type-registry';
import { Select } from '@/components/select-list';
import { Data } from '@/data/data-object';
import { PluginManager } from '@/plugin/plugin';
import { Local } from '@/tools/localization';
import { Selection } from '@/tools/text-capture';
import { measureText } from '@/util/dom';

interface ParameterPaneElement extends HTMLElement {
	scriptList: HTMLElement | null;
	headPad: HTMLElement | null;
	metas: any[];
	wraps: any[];
	detailBoxes: any[];
	checkBoxes: any[];
	numberBoxes: any[];
	numberVars: any[];
	textBoxes: any[];
	selectBoxes: any[];
	keyboardBoxes: any[];
	colorBoxes: any[];
	customBoxes: any[];
	updateEventEnabled: boolean;
	windowLocalize: (event: Event) => void;
	scriptChange: (event: any) => void;
	getData: () => any[];
	onResize?: () => void;
	bind(scriptList: HTMLElement): void;
	rewrite(parameters: any, key: string): void;
	update(): void;
	appendHeadPad(): void;
	createDetailBox(): any;
	createParamInput(parameter: any): any;
	updateParamInput(wrap: any, value: any): void;
	updateParamDisplay(detailBox: any): void;
	createCheckBox(): any;
	createNumberBox(): any;
	createNumberVar(): any;
	createTextBox(): any;
	createSelectBox(): any;
	createKeyboardBox(): any;
	createColorBox(): any;
	createCustomBox(): any;
	createRepeatableGroup(parameter: any): any;
	recycle(wrap: any): void;
	clear(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	componentChange(event: Event): void;
	applyAffix(input: HTMLElement, param: any): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	update: [event: Event];
}>();

const root = ref<ParameterPaneElement | null>(null);

let el: ParameterPaneElement | null = null;

const bind = (scriptList: HTMLElement): void => {
	const self = el!;
	self.scriptList = scriptList;
	if (scriptList.classList.contains('param-list')) {
		const { object } = scriptList as unknown as { object: any };
		const { update } = object;
		self.getData = () => (scriptList as unknown as { data: any }).data;
		object.update = (...args: any[]) => {
			update.apply(object, args);
			self.update();
		};
	}
	if (scriptList.classList.contains('tree-list')) {
		self.getData = () => {
			const item = readElement(scriptList as HTMLElement);
			return item ? [item] : [];
		};
	}
};

const rewrite = (parameters: any, key: string): void => {
	const self = el!;
	for (const wrap of self.wraps) {
		const script = wrap.box.data;
		const map = script.parameters;
		if (map !== parameters) continue;
		for (const { input } of wrap.children) {
			if (input.key === key) {
				write(input, parameters[key]);
				self.scriptList && dispatchChangeEvent(self.scriptList as any);
				if (input.branched) {
					(PluginManager as any).reconstruct(script);
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
	const map = (Data as any).manifest.guidMap;
	for (const script of scripts) {
		const meta = map[script.id];
		if (!meta) continue;
		self.metas.push(meta);
		if ((PluginManager as any).reconstruct(script)) {
			changed = true;
		}
		const paramList = meta.parameters;
		if (!paramList.length) continue;
		const langMap = meta.langMap.update();
		const parameters = script.parameters;
		if (meta.overview?.deprecated && paramList.length) {
			const banner = document.createElement('div');
			addClass(banner, 'deprecated-banner');
			banner.textContent =
				typeof meta.overview.deprecated === 'string'
					? 'deprecated: ' + meta.overview.deprecated
					: 'deprecated';
			self.appendChild(banner);
		}
		const groupOrder: string[] = [];
		const groupMap = new Map<string, any[]>();
		for (const parameter of paramList) {
			const g = parameter.group || '';
			if (!groupMap.has(g)) {
				groupMap.set(g, []);
				groupOrder.push(g);
			}
			groupMap.get(g)!.push(parameter);
		}
		if (!groupMap.has('')) {
			groupMap.set('', []);
			groupOrder.unshift('');
		}
		const createParamRow = (
			box: any,
			grid: HTMLElement,
			children: any[],
			parameter: any
		) => {
			const inputWrap = self.createParamInput(parameter)!;
			const { label, input } = inputWrap;
			const key = parameter.key;
			const name = langMap.get(parameter.alias) ?? key;
			const desc = langMap.get(parameter.desc);
			const tip = desc ? `<b>${name}</b>\n${desc}` : '';
			self.updateParamInput(inputWrap, parameters[key]);
			label.textContent = name;
			setTooltip(input as HTMLElement, tip);
			(input as any).parameters = parameters;
			(input as any).key = key;
			grid.appendChild(label);
			if (parameter.prefix || parameter.suffix) {
				self.applyAffix(input, parameter);
			}
			grid.appendChild(input);
			enable(input);
			if (parameter.readonly) {
				disable(input);
			}
			if (parameter.validate) {
				const validateInput = () => {
					const val = (input as any).parameters?.[(input as any).key];
					const ok =
						val !== undefined &&
						(
							PluginManager as unknown as {
								checkValidate(param: any, val: any): boolean;
							}
						).checkValidate(parameter, val);
					if (ok) {
						removeClass(input as HTMLElement, 'validate-error');
					} else {
						addClass(input as HTMLElement, 'validate-error');
					}
				};
				const nativeInput =
					(input as HTMLElement & { input?: HTMLElement }).input || input;
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
					summary.textContent = Local.get('parameter.param');
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
		self.scriptList && dispatchChangeEvent(self.scriptList as any);
	}
	if (self.updateEventEnabled) {
		dispatchUpdateEvent(self);
	}
	self.onResize?.();
	window.addEventListener('script-change', scriptChange);
};

const appendHeadPad = (): void => {
	const self = el!;
	let { headPad } = self;
	if (headPad === null) {
		headPad = document.createElement('empty');
		headPad.style.display = 'none';
		self.headPad = headPad;
	}
	self.appendChild(headPad);
};

const createDetailBox = (): any => {
	const self = el!;
	const { detailBoxes } = self;
	let box: HTMLElement;
	if (detailBoxes.length !== 0) {
		box = detailBoxes.pop().box;
		while (box.firstChild) {
			box.removeChild(box.firstChild);
		}
	} else {
		box = createDetailBoxElement();
	}
	const tag = 'detail-box';
	const summary = createDetailSummary();
	const grid = document.createElement('detail-grid');
	const wrap = { tag, box, summary, grid, children: [] as any[] };
	box.appendChild(summary);
	box.appendChild(grid);
	(box as any).wrap = wrap;
	return wrap;
};

const createParamInput = (parameter: any): any => {
	const config = TypeRegistry.get(parameter.type);
	if (config) {
		return config.create(el!, parameter);
	}
	return undefined;
};

const updateParamInput = (wrap: any, value: any): void => {
	switch (wrap.tag) {
		case 'check-box':
		case 'text-box':
			readElement(wrap.input) !== value && write(wrap.input, value);
			break;
		case 'number-box':
			if (readElement(wrap.input) !== value) {
				write(wrap.input, value);
			} else {
				wrap.input.input.value = value.toString();
			}
			break;
		case 'number-var':
			if (readElement(wrap.input) !== value) {
				write(wrap.input, value);
			} else if (typeof value === 'number') {
				wrap.input.numBox.input.value = value.toString();
			}
			break;
		case 'keyboard-box':
		case 'color-box':
			readElement(wrap.input) !== value && write(wrap.input, value);
			break;
		case 'select-box':
		case 'custom-box':
			if (readElement(wrap.input) !== value) {
				write(wrap.input, value);
			} else {
				wrap.input.update();
			}
			break;
		case 'repeatable-group':
			if (readElement(wrap.input) !== value) {
				write(wrap.input, value);
			}
			break;
	}
};

const updateParamDisplay = (detailBox: any): void => {
	const { states } = detailBox.meta.manager;
	const mParams = detailBox.meta.parameters;
	const paramMap: Record<string, any> = {};
	for (const p of mParams) paramMap[p.key] = p;
	for (const wrap of detailBox.wrap.children) {
		const key = wrap.input.key;
		switch (states[key]) {
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
	for (const wrap of detailBox.wrap.children) {
		const key = wrap.input.key;
		const param = paramMap[key];
		const parameters = wrap.input.parameters;
		if (param?.validate && parameters) {
			const value = parameters[key];
			const ok = (PluginManager as any).checkValidate(param, value);
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

const createCheckBox = (): any => {
	const self = el!;
	const { checkBoxes } = self;
	if (checkBoxes.length !== 0) {
		return checkBoxes.pop();
	}
	const tag = 'check-box';
	const label = document.createElement('text');
	const input = createCheckBoxElement(true);
	(input as any).inputEventEnabled = true;
	addClass(input, 'standard');
	addClass(input, 'large');
	return { tag, label, input };
};

const createNumberBox = (): any => {
	const self = el!;
	const { numberBoxes } = self;
	if (numberBoxes.length !== 0) {
		return numberBoxes.pop();
	}
	const tag = 'number-box';
	const label = document.createElement('text');
	const input = createNumberBoxElement();
	return { tag, label, input };
};

const createNumberVar = (): any => {
	const self = el!;
	const { numberVars } = self;
	if (numberVars.length !== 0) {
		return numberVars.pop();
	}
	const tag = 'number-var';
	const label = document.createElement('text');
	const input = createNumberVarElement();
	return { tag, label, input };
};

const createTextBox = (): any => {
	const self = el!;
	const { textBoxes } = self;
	if (textBoxes.length !== 0) {
		return textBoxes.pop();
	}
	const tag = 'text-box';
	const label = document.createElement('text');
	const input = createTextBoxElement();
	input.addEventListener('keydown', (Selection as any).inputKeydown);
	input.addEventListener('keyup', (Selection as any).inputKeyup);
	input.addEventListener('pointerdown', (Selection as any).inputPointerdown);
	input.addEventListener('pointerup', (Selection as any).inputPointerup);
	return { tag, label, input };
};

const createSelectBox = (): any => {
	const self = el!;
	const { selectBoxes } = self;
	if (selectBoxes.length !== 0) {
		return selectBoxes.pop();
	}
	const tag = 'select-box';
	const label = document.createElement('text');
	const input = createSelectBoxElement();
	return { tag, label, input };
};

const createKeyboardBox = (): any => {
	const self = el!;
	const { keyboardBoxes } = self;
	if (keyboardBoxes.length !== 0) {
		return keyboardBoxes.pop();
	}
	const tag = 'keyboard-box';
	const label = document.createElement('text');
	const input = createKeyboardBoxElement();
	return { tag, label, input };
};

const createColorBox = (): any => {
	const self = el!;
	const { colorBoxes } = self;
	if (colorBoxes.length !== 0) {
		return colorBoxes.pop();
	}
	const tag = 'color-box';
	const label = document.createElement('text');
	const input = createColorBoxElement();
	return { tag, label, input };
};

const createCustomBox = (): any => {
	const self = el!;
	const { customBoxes } = self;
	if (customBoxes.length !== 0) {
		return customBoxes.pop();
	}
	const tag = 'custom-box';
	const label = document.createElement('text');
	const input = createCustomBoxElement();
	return { tag, label, input };
};

const createRepeatableGroup = (parameter: any): any => {
	const template = parameter.repeatableGroup.parameters;
	const tag = 'repeatable-group';
	const label = document.createElement('text');
	const container = document.createElement('div');
	container.className = 'repeatable-group';
	const rowsEl = document.createElement('div');
	rowsEl.className = 'repeatable-group-rows';
	const addBtn = document.createElement('button');
	addBtn.textContent = '+';
	addBtn.className = 'add-row-btn';
	container.appendChild(rowsEl);
	container.appendChild(addBtn);
	(container as any).setTooltip = () => {};
	(container as any).parameters = null;
	(container as any).key = null;
	const pane = el!;
	(container as any).read = function () {
		const result: any[] = [];
		for (const rowEl of rowsEl.children as any) {
			const data: Record<string, any> = {};
			for (const { param, input } of (rowEl as any).wraps) {
				data[param.key] = readElement(input);
			}
			result.push(data);
		}
		return result;
	};
	(container as any).write = function (value: any[]) {
		rowsEl.innerHTML = '';
		let arr = value;
		if (!arr || arr.length === 0) {
			const empty: Record<string, any> = {};
			for (const subParam of template) {
				empty[subParam.key] = subParam.value;
			}
			arr = [empty];
		}
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
			const grid = document.createElement('detail-grid');
			row.appendChild(grid);
			(row as any).wraps = template.map((subParam: any) => {
				const wrap = TypeRegistry.get(subParam.type).create(pane, subParam);
				const val =
					item[subParam.key] !== undefined ? item[subParam.key] : subParam.value;
				(wrap as any).label.textContent = '';
				(wrap as any).input.parameters = item;
				(wrap as any).input.key = subParam.key;
				write((wrap as any).input, val);
				enable((wrap as any).input);
				removeClass((wrap as any).input, 'validate-error');
				if (subParam.readonly) {
					disable((wrap as any).input);
				}
				grid.appendChild((wrap as any).label);
				if (subParam.prefix || subParam.suffix) {
					pane.applyAffix((wrap as any).input, subParam);
				}
				grid.appendChild((wrap as any).input);
				return { param: subParam, ...wrap };
			});
			rowsEl.appendChild(row);
		}
	};
	addBtn.onclick = function (e: MouseEvent) {
		e.stopPropagation();
		const empty: Record<string, any> = {};
		for (const subParam of template) {
			empty[subParam.key] = subParam.value;
		}
		const data = (container as any).read();
		data.push(empty);
		(container as any).write(data);
		container.dispatchEvent(new Event('change', { bubbles: true }));
	};
	return { tag, label, input: container };
};

const recycle = (wrap: any): void => {
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
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			self.checkBoxes.push(wrap);
			break;
		case 'number-box':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			self.numberBoxes.push(wrap);
			break;
		case 'number-var':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			self.numberVars.push(wrap);
			break;
		case 'text-box':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			self.textBoxes.push(wrap);
			break;
		case 'select-box':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			wrap.input.clear();
			self.selectBoxes.push(wrap);
			break;
		case 'keyboard-box':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			self.keyboardBoxes.push(wrap);
			break;
		case 'color-box':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			if (wrap.input.tabIndex === 0) {
				self.colorBoxes.push(wrap);
			}
			break;
		case 'custom-box':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
			if (wrap.input.tabIndex === 0) {
				self.customBoxes.push(wrap);
			}
			break;
		case 'repeatable-group':
			wrap.label.remove();
			wrap.input.remove();
			wrap.input.parameters = null;
			wrap.input.key = null;
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
	if (!(self.scriptList as any)?.data) {
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
	let element = event.target as any as HTMLElement;
	if (element.tagName === 'INPUT') {
		element = element.parentNode as HTMLElement;
	}
	if ((element.parentNode as HTMLElement | null)?.classList?.contains('number-var')) {
		element = element.parentNode as HTMLElement;
	}
	const { parameters, key } = element as any;
	const { scriptList } = self;
	if (scriptList?.classList?.contains('param-list')) {
		const { history } = scriptList as any;
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
	parameters[key] = readElement(element as any);
	scriptList && dispatchChangeEvent(scriptList as any, 1);
	const grid = element.parentNode as HTMLElement;
	const detail = grid.parentNode as any;
	if (detail?.meta) {
		if ((element as any).branched) {
			(PluginManager as any).reconstruct(detail.data);
		}
		self.updateParamDisplay(detail);
		self.onResize?.();
	}
};

const applyAffix = (input: HTMLElement, param: any): void => {
	const font = 'var(--font-family-mono)';
	if (param.prefix) {
		const pre = document.createElement('text');
		pre.textContent = param.prefix;
		addClass(pre, 'param-affix');
		addClass(pre, 'left');
		(input as any).insertBefore(pre, (input as any).input);
	}
	if (param.suffix) {
		const suf = document.createElement('text');
		suf.textContent = param.suffix;
		addClass(suf, 'param-affix');
		addClass(suf, 'right');
		(input as any).insertBefore(suf, (input as any).input);
	}
	if ((input as any).input) {
		if (param.prefix) {
			const pw = measureText(param.prefix, font).width + 8;
			(input as any).input.style.paddingLeft = pw + 'px';
		}
		if (param.suffix) {
			const sw = measureText(param.suffix, font).width + 8;
			(input as any).input.style.paddingRight = sw + 'px';
		}
	}
};

const windowLocalize = (event: Event): void => {
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

const scriptChange = (event: any): void => {
	const self = el!;
	for (const meta of self.metas) {
		if (meta === event.changedMeta) {
			if (self.contains(Select.target)) {
				Select.close();
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
	const self = root.value;
	if (!self) return;
	el = self;
	self.scriptList = null;
	self.headPad = null;
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
	self.getData = () => [];
	self.windowLocalize = windowLocalize;
	self.scriptChange = scriptChange;
	self.bind = bind;
	self.rewrite = rewrite;
	self.update = update;
	self.appendHeadPad = appendHeadPad;
	self.createDetailBox = createDetailBox;
	self.createParamInput = createParamInput;
	self.updateParamInput = updateParamInput;
	self.updateParamDisplay = updateParamDisplay;
	self.createCheckBox = createCheckBox;
	self.createNumberBox = createNumberBox;
	self.createNumberVar = createNumberVar;
	self.createTextBox = createTextBox;
	self.createSelectBox = createSelectBox;
	self.createKeyboardBox = createKeyboardBox;
	self.createColorBox = createColorBox;
	self.createCustomBox = createCustomBox;
	self.createRepeatableGroup = createRepeatableGroup;
	self.recycle = recycle;
	self.clear = clear;
	self.on = on;
	self.componentChange = componentChange;
	self.applyAffix = applyAffix;
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
