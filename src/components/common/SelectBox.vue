<template>
	<div class="select-box" ref="root" :id="props.id">
		<div class="select-box-text" ref="info"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
	on as onElement,
	addClass,
	removeClass,
	hasClass,
	show,
	hide,
	enable as enableUtil,
	disable as disableUtil,
	dispatchChangeEvent,
	hideChildNodes,
	showChildNodes,
	setTooltip as setTooltipElement
} from '@/util/element-utils';
import { Select } from '@/components/select-list.ts';
import { Local } from '@/tools/localization.ts';

interface SelectBoxElement extends HTMLElement {
	info: HTMLElement & { [k: string]: any };
	dataItems: any[];
	dataValue: any;
	relations: any[];
	invalid: boolean;
	hideUnrelated: boolean;
	savedValue: any;
	originalTip: string;
	read(): any;
	write(value: any): void;
	write2(value: any): void;
	writeDefault(): void;
	input(value: any): void;
	update(): void;
	reselect(offset: any): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: any): void;
	setItemNames(options: any): void;
	setTooltip(tip: any): void;
	createTooltip(): void;
	clear(): any;
	enableHiddenMode(): any;
	relate(entries: any): void;
	toggleRelatedElements(): void;
	enableElement(element: any): void;
	disableElement(element: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: any;
	items?: any[];
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => [],
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	write: [value: any];
	input: [value: any];
	change: [value: any];
}>();

const root = ref<SelectBoxElement | null>(null);
const info = ref<HTMLElement | null>(null);

let dataItems: any[] = [];
let dataValue: any = null;
let relations: any[] = [];
let invalid = false;
let hideUnrelated = false;
let savedValue: any;
let originalTip = '';
let writeEventEnabled = false;
let inputEventEnabled = false;

const read = (): any => dataValue;

const update = (): void => {
	const infoEl = info.value;
	if (!infoEl) return;
	const value = dataValue;
	const items = dataItems;
	const length = items.length;
	let name;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (item.value === value) {
			name = item.name;
			break;
		}
	}
	if (name !== undefined) {
		invalid = false;
		removeClass(infoEl, 'invalid');
		infoEl.textContent = name;
	} else {
		invalid = true;
		addClass(infoEl, 'invalid');
		infoEl.textContent = value;
	}
};

const write = (value: any): void => {
	const el = root.value;
	if (!el) return;
	dataValue = value;
	el.dataValue = value;
	update();
	if (!hasClass(el, 'disabled')) {
		toggleRelatedElements();
	}
	if (writeEventEnabled) {
		const write: any = new Event('write');
		write.value = dataValue;
		el.dispatchEvent(write);
	}
	emit('write', dataValue);
};

const write2 = (value: any): void => {
	for (const item of dataItems) {
		if (item.value === value) {
			write(value);
			return;
		}
	}
	writeDefault();
};

const writeDefault = (): void => {
	write(dataItems[0]?.value);
};

const input = (value: any): void => {
	const el = root.value;
	if (!el) return;
	const last = dataValue;
	if (last !== value) {
		write(value);
		if (inputEventEnabled) {
			const input: any = new Event('input', { bubbles: true });
			input.last = last;
			input.value = dataValue;
			el.dispatchEvent(input);
			emit('input', dataValue);
			emit('update:modelValue', dataValue);
		}
		dispatchChangeEvent(el);
	}
};

const reselect = (offset: any): void => {
	const value = dataValue;
	const items = dataItems;
	const length = items.length;
	for (let i = 0; i < length; i++) {
		if (items[i].value === value) {
			const index = i + offset;
			if (index >= 0 && index < length) {
				input(items[index].value);
			}
			return;
		}
	}
	const index = offset > 0 ? 0 : length - 1;
	input(items[index].value);
};

const save = (): void => {
	savedValue = read();
};

const restore = (): void => {
	if (savedValue !== undefined) {
		input(savedValue);
		savedValue = undefined;
	}
};

const enable = (): void => {
	const el = root.value;
	if (!el) return;
	if (removeClass(el, 'disabled')) {
		el.tabIndex += 1;
		showChildNodes(el);
		toggleRelatedElements();
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	if (addClass(el, 'disabled')) {
		el.tabIndex -= 1;
		hideChildNodes(el);
		toggleRelatedElements();
	}
};

const loadItems = (items: any): void => {
	dataItems = items;
	root.value!.dataItems = items;
	if (dataValue !== null && dataValue !== undefined) {
		update();
	}
};

const setItemNames = (options: any): void => {
	for (const item of dataItems) {
		const key = item.value;
		const option = options[key];
		switch (typeof option) {
			case 'string':
				item.name = option;
				continue;
			case 'object':
				if ('name' in option) {
					item.name = option.name;
				}
				if ('tip' in option) {
					item.tip = (Local.parseTip as any)(option.tip, option.name);
				}
				continue;
		}
	}
	if (dataValue !== null) {
		update();
	}
	createTooltip();
};

const setTooltip = (tip: any): void => {
	const el = root.value;
	if (!el) return;
	originalTip = tip;
	setTooltipElement(el, tip);
};

const createTooltip = (): void => {
	const el = root.value;
	if (!el) return;
	let tip = originalTip ?? '';
	let options = '';
	for (const item of dataItems) {
		if (item.tip) {
			options += item.tip + '\n';
		}
	}
	if (tip === '' && options !== '') {
		const prev = el.previousElementSibling;
		if (prev && hasClass(prev, 'text')) {
			tip += `<b>${prev.textContent}</b>`;
		}
	}
	if (tip !== '' && options !== '') {
		tip += '<tooltip-line></tooltip-line>';
	}
	tip += options;
	if (tip !== '') {
		setTooltipElement(el, tip.trim());
	}
};

const clear = (): SelectBoxElement => {
	const el = root.value!;
	const infoEl = info.value!;
	dataItems = null as any;
	dataValue = null;
	el.dataItems = null as any;
	el.dataValue = null;
	infoEl.textContent = '';
	return el;
};

const enableHiddenMode = (): SelectBoxElement => {
	const el = root.value!;
	hideUnrelated = true;
	return el;
};

const relate = (entries: any): void => {
	relations = entries;
	root.value!.relations = entries;
};

const toggleRelatedElements = (): void => {
	const el = root.value;
	if (!el) return;
	if (relations.length !== 0) {
		if (!hasClass(el, 'disabled')) {
			const entries = relations;
			const value = dataValue;
			const selection = entries.find((entry) =>
				entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
			);
			const deferredList = [];
			for (const entry of entries) {
				if (
					entry.case instanceof Array
						? entry.case.includes(value)
						: entry.case === value
				) {
					deferredList.push(entry);
				} else {
					for (const element of selection
						? Array.subtract(entry.targets, selection.targets)
						: entry.targets) {
						disableElement(element);
					}
				}
			}
			for (const entry of deferredList) {
				for (const element of entry.targets) {
					enableElement(element);
				}
			}
		} else {
			const entries = relations;
			for (const entry of entries) {
				for (const element of entry.targets) {
					disableElement(element);
				}
			}
		}
	}
};

const enableElement = (element: any): void => {
	if (typeof element.enable === 'function') {
		element.enable();
	} else {
		enableUtil(element);
	}
	if (hideUnrelated) {
		let node = element.previousSibling;
		while (node instanceof Text) {
			node = node.previousSibling;
		}
		if (hasClass(node, 'text')) {
			show(node);
		}
		show(element);
	}
};

const disableElement = (element: any): void => {
	if (typeof element.disable === 'function') {
		element.disable();
	} else {
		disableUtil(element);
	}
	if (hideUnrelated) {
		let node = element.previousSibling;
		while (node instanceof Text) {
			node = node.previousSibling;
		}
		if (hasClass(node, 'text')) {
			hide(node);
		}
		hide(element);
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	switch (type) {
		case 'write':
			writeEventEnabled = true;
			break;
		case 'input':
			inputEventEnabled = true;
			break;
	}
};

const keydown = (event: any): void => {
	const el = root.value;
	if (!el) return;
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!event.cmdOrCtrlKey) {
				event.stopPropagation();
				Select.open(el);
			}
			break;
		case 'ArrowUp':
			event.preventDefault();
			event.stopPropagation();
			reselect(-1);
			break;
		case 'ArrowDown':
			event.preventDefault();
			event.stopPropagation();
			reselect(1);
			break;
	}
};

const pointerdown = (event: any): void => {
	const el = root.value;
	if (!el) return;
	switch (event.button) {
		case 0:
			Select.open(el);
			break;
	}
};

defineExpose({
	read,
	write,
	write2,
	writeDefault,
	input,
	update,
	reselect,
	save,
	restore,
	enable,
	disable,
	loadItems,
	setItemNames,
	setTooltip,
	createTooltip,
	clear,
	enableHiddenMode,
	relate,
	toggleRelatedElements,
	enableElement,
	disableElement,
	on,
	root
});

watch(() => props.modelValue, (val) => write(val));
watch(() => props.items, (val) => loadItems(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	const infoEl = info.value;
	if (!el || !infoEl) return;
	el.tabIndex = 0;
	el.info = infoEl;
	el.dataItems = dataItems;
	el.dataValue = dataValue;
	el.relations = relations;
	el.invalid = invalid;
	el.hideUnrelated = hideUnrelated;
	el.savedValue = savedValue;
	el.originalTip = originalTip;
	el.read = read;
	el.write = write;
	el.write2 = write2;
	el.writeDefault = writeDefault;
	el.input = input;
	el.update = update;
	el.reselect = reselect;
	el.save = save;
	el.restore = restore;
	el.enable = enable;
	el.disable = disable;
	el.loadItems = loadItems;
	el.setItemNames = setItemNames;
	el.setTooltip = setTooltip;
	el.createTooltip = createTooltip;
	el.clear = clear;
	el.enableHiddenMode = enableHiddenMode;
	el.relate = relate;
	el.toggleRelatedElements = toggleRelatedElements;
	el.enableElement = enableElement;
	el.disableElement = disableElement;
	el.on = on;
	onElement(el, 'keydown', keydown as (event: EditorEvent) => void);
	onElement(el, 'pointerdown', pointerdown as (event: EditorEvent) => void);
	loadItems(props.items);
	on('input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	on('write', (e: any) => emit('write', e.value));
	el.addEventListener('change', () => emit('change', read()));
	if (props.modelValue !== null) write(props.modelValue);
	if (props.disabled) disable();
});
</script>
