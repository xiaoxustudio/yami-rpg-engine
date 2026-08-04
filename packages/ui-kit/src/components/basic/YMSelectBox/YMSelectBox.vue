<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface Props {
	id?: string;
	modelValue?: any;
	items?: any[];
	disabled?: boolean;
	popup?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => [],
	disabled: false,
	popup: true
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	write: [value: any];
	input: [value: any];
	change: [value: any];
	open: [];
}>();

const root = ref<HTMLElement | null>(null);
const info = ref<HTMLElement | null>(null);

let dataItems: any[] = [];
let dataValue: any = null;
let relations: any[] = [];
let invalid = false;
let hideUnrelated = false;
let savedValue: any;
let writeEventEnabled = false;
let inputEventEnabled = false;
const builtinOpen = ref(false);
let documentPointerdown: ((event: PointerEvent) => void) | null = null;

const subtract = <T>(a: T[], b: T[]): T[] => a.filter((x) => !b.includes(x));

const read = (): any => dataValue;

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
};

const write = (value: any): void => {
	const el = root.value;
	if (!el) return;
	dataValue = value;
	(el as any).dataValue = value;
	update();
	if (!el.classList.contains('disabled')) {
		toggleRelatedElements();
	}
	if (writeEventEnabled) {
		const writeEvent = new Event('write') as Event & { value: any };
		writeEvent.value = dataValue;
		el.dispatchEvent(writeEvent);
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
			const inputEvent = new Event('input', { bubbles: true }) as Event & {
				last: any;
				value: any;
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

const loadItems = (items: any): void => {
	dataItems = items;
	if (root.value) (root.value as any).dataItems = items;
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
	dataItems = null as any;
	dataValue = null;
	(el as any).dataItems = null;
	(el as any).dataValue = null;
	infoEl.textContent = '';
	return el;
};

const enableHiddenMode = (): HTMLElement => {
	hideUnrelated = true;
	return root.value as HTMLElement;
};

const relate = (entries: any): void => {
	relations = entries;
	if (root.value) (root.value as any).relations = entries;
};

const toggleRelatedElements = (): void => {
	const el = root.value;
	if (!el || relations.length === 0) return;
	if (!el.classList.contains('disabled')) {
		const entries = relations;
		const value = dataValue;
		const selection = entries.find((entry: any) =>
			entry.case instanceof Array ? entry.case.includes(value) : entry.case === value
		);
		const deferredList: any[] = [];
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

const enableElement = (element: any): void => {
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

const disableElement = (element: any): void => {
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
	listener: (event: any) => void,
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

const pick = (item: any): void => {
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
	root
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

onMounted(() => {
	const el = root.value;
	const infoEl = info.value;
	if (!el || !infoEl) return;
	el.tabIndex = 0;
	(el as any).info = infoEl;
	(el as any).dataItems = dataItems;
	(el as any).dataValue = dataValue;
	(el as any).relations = relations;
	(el as any).invalid = invalid;
	(el as any).hideUnrelated = hideUnrelated;
	(el as any).savedValue = savedValue;
	(el as any).read = read;
	(el as any).write = write;
	(el as any).write2 = write2;
	(el as any).writeDefault = writeDefault;
	(el as any).input = input;
	(el as any).update = update;
	(el as any).reselect = reselect;
	(el as any).save = save;
	(el as any).restore = restore;
	(el as any).enable = enable;
	(el as any).disable = disable;
	(el as any).loadItems = loadItems;
	(el as any).setItemNames = setItemNames;
	(el as any).clear = clear;
	(el as any).enableHiddenMode = enableHiddenMode;
	(el as any).relate = relate;
	(el as any).toggleRelatedElements = toggleRelatedElements;
	(el as any).enableElement = enableElement;
	(el as any).disableElement = disableElement;
	(el as any).on = on;
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
				:key="item.value"
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

.popup :global(.select-item) {
	padding: var(--ym-space-1) var(--ym-space-3);
	cursor: pointer;
	white-space: nowrap;
}

.popup :global(.select-item:hover),
.popup :global(.select-item.selected) {
	background-color: var(--ym-color-selected);
	color: var(--ym-color-on-primary);
}
</style>
