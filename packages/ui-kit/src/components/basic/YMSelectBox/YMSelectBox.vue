<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import { useEventListener } from '../../../composables/useEventListener';
import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import {
	createSelectBoxCore,
	type RelationEntry,
	type SelectBoxCoreState,
	type SelectItem
} from './select-box-core';

interface Props {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
	popup?: boolean;
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null as never,
	items: () => [],
	disabled: false,
	popup: true,
	label: ''
});

const popupId = computed(() => (props.id ? `${props.id}-popup` : undefined));

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	write: [value: unknown];
	input: [value: unknown];
	change: [value: unknown];
	open: [];
}>();

const root = ref<HTMLElement | null>(null);
const info = ref<HTMLElement | null>(null);

type SelectBoxHost = HTMLElement & {
	dataItems?: SelectItem[] | null;
	dataValue?: unknown;
	relations?: RelationEntry[];
	hideUnrelated?: boolean;
};

const state: SelectBoxCoreState = {
	dataItems: [],
	dataValue: null,
	relations: [],
	invalid: false,
	hideUnrelated: false,
	savedValue: undefined,
	writeEventEnabled: false,
	inputEventEnabled: false
};

const builtinOpen = ref(false);

const core = createSelectBoxCore({ getRoot: () => root.value, getInfo: () => info.value }, state);
const {
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
	setItemNames,
	toggleRelatedElements,
	enableElement,
	disableElement,
	on
} = core;

const loadItems = (items: unknown[]): HTMLElement => {
	if (!Array.isArray(items)) return root.value as HTMLElement;
	core.loadItems(items);
	return root.value as HTMLElement;
};

const clear = (): HTMLElement => {
	core.clear();
	return root.value as HTMLElement;
};

const enableHiddenMode = (): HTMLElement => {
	core.enableHiddenMode();
	return root.value as HTMLElement;
};

const relate = (entries: unknown): void => {
	core.relate(entries);
	if (state.dataValue !== undefined) {
		toggleRelatedElements();
	}
};

const openBuiltin = (): void => {
	if (!props.popup || props.disabled) return;
	builtinOpen.value = true;
};

const closeBuiltin = (): void => {
	builtinOpen.value = false;
};

useEventListener(
	document,
	'pointerdown',
	(event) => {
		const el = root.value;
		if (el && !el.contains(event.target as Node)) {
			closeBuiltin();
		}
	},
	{ enabled: builtinOpen }
);

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

/** 根元素上的 `change` → Vue emit（模板 `@change` 绑定，见下）。 */
const onChange = (): void => emit('change', read());

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
	if (!el || !infoEl || isApiAttached(el)) return;
	el.tabIndex = 0;
	elementDataOf<SelectBoxHost>(el).dataItems = state.dataItems;
	Object.defineProperty(el, 'dataValue', {
		configurable: true,
		get: () => state.dataValue,
		set: (value: unknown) => {
			state.dataValue = value;
		}
	});
	elementDataOf<{ invalid?: boolean }>(el).invalid = state.invalid;
	(el as SelectBoxHost).hideUnrelated = state.hideUnrelated;
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
		emit('update:modelValue', e.value);
		emit('input', e.value);
	});
	on('write', (e: Event & { value?: unknown }) => emit('write', e.value));
	if (props.modelValue !== null) write(props.modelValue);
	if (props.disabled) disable();
	markApiAttached(el);
}

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
		role="combobox"
		aria-haspopup="listbox"
		:aria-expanded="builtinOpen"
		:aria-disabled="disabled || undefined"
		:aria-label="props.label || undefined"
		:aria-controls="popupId"
		@keydown="onKeydown"
		@pointerdown="onPointerdown"
		@change="onChange"
	>
		<div class="select-box-text" ref="info" :data-v-ref="''" />
		<div
			v-if="builtinOpen"
			:id="popupId"
			class="select-popup"
			:class="$style.popup"
			role="listbox"
		>
			<div
				v-for="item in state.dataItems"
				:key="item.value as PropertyKey"
				class="select-item"
				:class="{ selected: item.value === state.dataValue }"
				role="option"
				:aria-selected="item.value === state.dataValue"
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
	outline: 1px solid var(--ym-color-input-border);
	border: none;
}

.popup :global(:where(.select-item)) {
	display: block;
	padding: 0 var(--ym-space-1);
	height: 20px;
	line-height: 20px;
	cursor: pointer;
	white-space: pre;
	overflow: hidden;
	text-overflow: ellipsis;
}

.popup :global(:where(.select-item:hover)),
.popup :global(:where(.select-item.selected)) {
	background-color: var(--ym-color-selected);
	color: var(--ym-color-on-primary);
}

:global(:where(.select-box)) {
	display: block;
	position: relative;
	width: auto;
	min-width: 60px;
	height: 20px;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
}

:global(:where(.select-box:not(.disabled)))::before {
	content: '';
	position: absolute;
	right: 4px;
	top: 7px;
	border-left: 4px solid transparent;
	border-right: 4px solid transparent;
	border-top: 4px solid var(--text-color);
}

:global(:where(.select-box.disabled)) {
	pointer-events: none;
	background-color: var(--input-background-disabled);
}

:global(:where(.select-box:hover)) {
	background-color: var(--input-background-hover);
}

:global(:where(.select-box:focus)) {
	border-color: var(--input-border-color-focus);
}

:global(:where(.select-box-text)) {
	display: inline-block;
	vertical-align: top;
	padding: 0 4px;
	width: calc(100% - 16px);
	line-height: 18px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.select-box-text.invalid)) {
	color: var(--text-color-error);
}
</style>
