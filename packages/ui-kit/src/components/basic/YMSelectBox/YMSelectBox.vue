<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';

interface Props {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
	popup?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null as never,
	items: () => [],
	disabled: false,
	popup: true
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	write: [value: unknown];
	input: [value: unknown];
	change: [value: unknown];
	open: [];
}>();

const root = ref<HTMLElement | null>(null);
const info = ref<HTMLElement | null>(null);

interface SelectItem {
	value: unknown;
	name?: string;
	tip?: string;
	[k: string]: unknown;
}

interface RelationEntry {
	case: unknown | unknown[];
	targets: HTMLElement[];
}

type ToggleableElement = HTMLElement & { enable?: () => void; disable?: () => void };

interface SelectBoxApi extends HTMLElement {
	invalid?: boolean;
	dataValue?: unknown;
	dataItems?: SelectItem[] | null;
	relations?: RelationEntry[];
	info?: HTMLElement;
	hideUnrelated?: boolean;
	savedValue?: unknown;
	_initialized?: boolean;
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	writeDefault(): void;
	input(value: unknown): void;
	update(): void;
	reselect(offset: number): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: unknown[]): void;
	setItemNames(options: Record<string, string | { name?: string; tip?: string }>): void;
	clear(): HTMLElement;
	enableHiddenMode(): HTMLElement;
	relate(entries: unknown): void;
	toggleRelatedElements(): void;
	enableElement(element: ToggleableElement): void;
	disableElement(element: ToggleableElement): void;
	on(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
}

let dataItems: SelectItem[] = [];
let dataValue: unknown = null;
let relations: RelationEntry[] = [];
let invalid = false;
let hideUnrelated = false;
let savedValue: unknown;
let writeEventEnabled = false;
let inputEventEnabled = false;
const builtinOpen = ref(false);
let documentPointerdown: ((event: PointerEvent) => void) | null = null;

const subtract = <T>(a: T[], b: T[]): T[] => a.filter((x) => !b.includes(x));

const read = (): unknown => dataValue;

const update = (): void => {
	const infoEl = info.value;
	if (!infoEl) return;
	const value = dataValue;
	const items = dataItems;
	const length = items.length;
	let name: string | undefined;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (item.value === value) {
			name = item.name;
			break;
		}
	}
	if (name !== undefined) {
		invalid = false;
		infoEl.classList.remove('invalid');
		infoEl.textContent = name;
	} else {
		invalid = true;
		infoEl.classList.add('invalid');
		infoEl.textContent = String(value);
	}
	const el = root.value;
	if (el) (el as SelectBoxApi).invalid = invalid;
};

const write = (value: unknown): void => {
	const el = root.value;
	if (!el) return;
	dataValue = value;
	(el as SelectBoxApi).dataValue = value;
	update();
	if (!el.classList.contains('disabled')) {
		toggleRelatedElements();
	}
	if (writeEventEnabled) {
		const writeEvent = new Event('write') as Event & { value?: unknown };
		writeEvent.value = dataValue;
		el.dispatchEvent(writeEvent);
	}
	emit('write', dataValue);
};

const write2 = (value: unknown): void => {
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

const input = (value: unknown): void => {
	const el = root.value;
	if (!el) return;
	const last = dataValue;
	if (last !== value) {
		write(value);
		if (inputEventEnabled) {
			const inputEvent = new Event('input', { bubbles: true }) as Event & {
				last?: unknown;
				value?: unknown;
			};
			inputEvent.last = last;
			inputEvent.value = dataValue;
			el.dispatchEvent(inputEvent);
			emit('input', dataValue);
			emit('update:modelValue', dataValue);
		}
		el.dispatchEvent(new Event('change', { bubbles: true }));
	}
};

const reselect = (offset: number): void => {
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
	const wasDisabled = el.classList.contains('disabled');
	el.classList.remove('disabled');
	if (wasDisabled) {
		el.tabIndex += 1;
		showChildNodes();
		toggleRelatedElements();
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	const wasEnabled = !el.classList.contains('disabled');
	el.classList.add('disabled');
	if (wasEnabled) {
		el.tabIndex -= 1;
		hideChildNodes();
		toggleRelatedElements();
	}
};

const showChildNodes = (): void => {
	const el = root.value;
	if (!el) return;
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = '';
	}
};

const hideChildNodes = (): void => {
	const el = root.value;
	if (!el) return;
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = 'none';
	}
};

const loadItems = (items: unknown[]): void => {
	dataItems = items as SelectItem[];
	if (root.value) (root.value as SelectBoxApi).dataItems = items as SelectItem[];
	if (dataValue !== null && dataValue !== undefined) {
		update();
	}
};

const setItemNames = (
	options: Record<string, string | { name?: string; tip?: string }>
): void => {
	for (const item of dataItems) {
		const key = item.value;
		const option = options[key as string];
		switch (typeof option) {
			case 'string':
				item.name = option;
				continue;
			case 'object':
				if (option && 'name' in option) {
					item.name = option.name;
				}
				if (option && 'tip' in option) {
					item.tip = typeof option.tip === 'string' ? option.tip : option.name;
				}
				continue;
		}
	}
	if (dataValue !== null) {
		update();
	}
};

const clear = (): HTMLElement => {
	const el = root.value as HTMLElement;
	const infoEl = info.value as HTMLElement;
	dataItems = null as unknown as SelectItem[];
	dataValue = null;
	(el as SelectBoxApi).dataItems = null;
	(el as SelectBoxApi).dataValue = null;
	infoEl.textContent = '';
	return el;
};

const enableHiddenMode = (): HTMLElement => {
	hideUnrelated = true;
	return root.value as HTMLElement;
};

const relate = (entries: unknown): void => {
	relations = entries as RelationEntry[];
	if (root.value) (root.value as SelectBoxApi).relations = entries as RelationEntry[];
};

const toggleRelatedElements = (): void => {
	const el = root.value;
	if (!el || relations.length === 0) return;
	if (!el.classList.contains('disabled')) {
		const entries = relations;
		const value = dataValue;
		const selection = entries.find((entry: RelationEntry) =>
			entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
		);
		const deferredList: RelationEntry[] = [];
		for (const entry of entries) {
			if (entry.case instanceof Array ? entry.case.includes(value) : entry.case === value) {
				deferredList.push(entry);
			} else {
				for (const element of selection ? subtract(entry.targets, selection.targets) : entry.targets) {
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
		for (const entry of relations) {
			for (const element of entry.targets) {
				disableElement(element);
			}
		}
	}
};

const enableElement = (element: ToggleableElement): void => {
	if (typeof element.enable === 'function') {
		element.enable();
	} else {
		(element as HTMLElement).classList.remove('disabled');
	}
	if (hideUnrelated) {
		let node = element.previousSibling;
		while (node instanceof Text) {
			node = node.previousSibling;
		}
		if (node instanceof Element && node.classList.contains('text')) {
			(node as HTMLElement).style.display = '';
		}
		(element as HTMLElement).style.display = '';
	}
};

const disableElement = (element: ToggleableElement): void => {
	if (typeof element.disable === 'function') {
		element.disable();
	} else {
		(element as HTMLElement).classList.add('disabled');
	}
	if (hideUnrelated) {
		let node = element.previousSibling;
		while (node instanceof Text) {
			node = node.previousSibling;
		}
		if (node instanceof Element && node.classList.contains('text')) {
			(node as HTMLElement).style.display = 'none';
		}
		(element as HTMLElement).style.display = 'none';
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener, options);
	switch (type) {
		case 'write':
			writeEventEnabled = true;
			break;
		case 'input':
			inputEventEnabled = true;
			break;
	}
};

const openBuiltin = (): void => {
	if (!props.popup || props.disabled) return;
	builtinOpen.value = true;
	documentPointerdown = (event: PointerEvent) => {
		const el = root.value;
		if (el && !el.contains(event.target as Node)) {
			closeBuiltin();
		}
	};
	document.addEventListener('pointerdown', documentPointerdown);
};

const closeBuiltin = (): void => {
	builtinOpen.value = false;
	if (documentPointerdown) {
		document.removeEventListener('pointerdown', documentPointerdown);
		documentPointerdown = null;
	}
};

const pick = (item: SelectItem): void => {
	input(item.value);
	closeBuiltin();
};

const onKeydown = (event: KeyboardEvent): void => {
	const el = root.value;
	if (!el) return;
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!(event.ctrlKey || event.metaKey)) {
				event.stopPropagation();
				if (props.popup) {
					openBuiltin();
				} else {
					emit('open');
				}
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

const onPointerdown = (event: PointerEvent): void => {
	if (event.button !== 0) return;
	if (props.popup) {
		openBuiltin();
	} else {
		emit('open');
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
	clear,
	enableHiddenMode,
	relate,
	toggleRelatedElements,
	enableElement,
	disableElement,
	on,
	root,
	initializeApi
});

watch(
	() => props.modelValue,
	(val) => write(val)
);
watch(
	() => props.items,
	(val) => loadItems(val)
);
watch(
	() => props.disabled,
	(val) => (val ? disable() : enable())
);

function initializeApi(): void {
	const el = root.value;
	const infoEl = info.value;
	if (!el || !infoEl || (el as SelectBoxApi)._initialized) return;
	el.tabIndex = 0;
	(el as SelectBoxApi).info = infoEl;
	(el as SelectBoxApi).dataItems = dataItems;
	(el as SelectBoxApi).dataValue = dataValue;
	(el as SelectBoxApi).relations = relations;
	(el as SelectBoxApi).invalid = invalid;
	(el as SelectBoxApi).hideUnrelated = hideUnrelated;
	(el as SelectBoxApi).savedValue = savedValue;
	attachApi(el, {
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
		clear,
		enableHiddenMode,
		relate,
		toggleRelatedElements,
		enableElement,
		disableElement,
		on
	});
	loadItems(props.items);
	on('input', (e: Event & { value?: unknown }) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	on('write', (e: Event & { value?: unknown }) => emit('write', e.value));
	el.addEventListener('change', () => emit('change', read()));
	if (props.modelValue !== null) write(props.modelValue);
	if (props.disabled) disable();
	(el as SelectBoxApi)._initialized = true;
};

onMounted(initializeApi);

onBeforeUnmount(() => {
	closeBuiltin();
});
</script>

<template>
	<div
		ref="root"
		class="select-box"
		:class="{ disabled }"
		:id="props.id"
		@keydown="onKeydown"
		@pointerdown="onPointerdown"
	>
		<div class="select-box-text" ref="info" />
		<div v-if="builtinOpen" class="select-popup" :class="$style.popup">
			<div
				v-for="item in dataItems"
				:key="item.value as PropertyKey"
				class="select-item"
				:class="{ selected: item.value === dataValue }"
				@pointerdown.stop="pick(item)"
			>
				{{ item.name }}
			</div>
		</div>
	</div>
</template>

<style module>
.popup {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 9999;
	min-width: 100%;
	max-height: 240px;
	overflow-y: auto;
	background-color: var(--ym-color-popup-bg);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-sm);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.popup :global(:where(.select-item)) {
	padding: var(--ym-space-1) var(--ym-space-3);
	cursor: pointer;
	white-space: nowrap;
}

.popup :global(:where(.select-item:hover)),
.popup :global(:where(.select-item.selected)) {
	background-color: var(--ym-color-selected);
	color: var(--ym-color-on-primary);
}
</style>

