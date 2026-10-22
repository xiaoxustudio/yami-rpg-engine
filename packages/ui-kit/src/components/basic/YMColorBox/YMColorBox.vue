<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import { createPayloadEvent } from '../../../utils/payload-event';
import { useEventListener } from '../../../composables/useEventListener';

interface Props {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
	popup?: boolean;
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false,
	popup: true,
	label: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	input: [value: string];
	open: [];
}>();

type ColorBoxApi = HTMLElement & {
	dataValue?: string;
	foreground?: HTMLElement | null;
	inputEventEnabled?: boolean;
	read(): string;
	write(color: string): void;
	input(color: string): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown(event: KeyboardEvent): void;
	mouseclick(event: Event): void;
};

const root = ref<HTMLElement | null>(null);
const foreground = ref<HTMLElement | null>(null);

let dataValue = '';
let inputEventEnabled = false;
const builtinOpen = ref(false);

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

const hexValue = computed(() => {
	const hex = dataValue.length >= 6 ? dataValue.slice(0, 6) : '000000';
	return `#${hex}`;
});

const read = (): string => dataValue;

const write = (color: string): void => {
	dataValue = color;
	const el = foreground.value;
	if (!el) return;
	const r = parseInt(color.slice(0, 2), 16);
	const g = parseInt(color.slice(2, 4), 16);
	const b = parseInt(color.slice(4, 6), 16);
	const a = parseInt(color.slice(6, 8) || 'ff', 16) / 255;
	el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
};

const input = (color: string): void => {
	if (dataValue !== color) {
		write(color);
		const el = root.value;
		if (el) {
			if (inputEventEnabled) {
				const inputEvent = createPayloadEvent('input', {} as { value: string });
				inputEvent.value = dataValue;
				el.dispatchEvent(inputEvent);
			}
			el.dispatchEvent(new Event('change', { bubbles: true }));
		}
		emit('update:modelValue', dataValue);
		emit('input', dataValue);
	}
};

const enable = (): void => {
	const el = root.value;
	if (!el) return;
	const wasDisabled = el.classList.contains('disabled');
	el.classList.remove('disabled');
	if (wasDisabled) {
		for (const child of Array.from(el.children)) {
			(child as HTMLElement).style.display = '';
		}
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	const wasEnabled = !el.classList.contains('disabled');
	el.classList.add('disabled');
	if (wasEnabled) {
		for (const child of Array.from(el.children)) {
			(child as HTMLElement).style.display = 'none';
		}
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
		case 'input':
			inputEventEnabled = true;
			break;
	}
};

const openBuiltin = (): void => {
	if (!props.popup || props.disabled) return;
	builtinOpen.value = true;
};

const closeBuiltin = (): void => {
	builtinOpen.value = false;
};

const pickColor = (event: Event): void => {
	const value = (event.target as HTMLInputElement).value;
	const hex = value.replace('#', '');
	input(hex.length === 6 ? hex + 'ff' : hex);
	closeBuiltin();
};

const mouseclick = (_event: Event): void => {
	if (props.disabled) return;
	if (props.popup) {
		openBuiltin();
	} else {
		emit('open');
	}
};

const keydown = (event: KeyboardEvent): void => {
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!(event.ctrlKey || event.metaKey)) {
				event.stopPropagation();
				mouseclick(event);
			}
			break;
	}
};

defineExpose({ read, write, input, enable, disable, on, root });

watch(
	() => props.modelValue,
	(val) => write(val)
);
watch(
	() => props.disabled,
	(val) => (val ? disable() : enable())
);

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.tabIndex = 0;
	Object.defineProperty(el, 'dataValue', {
		configurable: true,
		get: () => dataValue,
		set: (value: string) => {
			dataValue = value;
		}
	});
	(el as ColorBoxApi).foreground = foreground.value;
	(el as ColorBoxApi).inputEventEnabled = false;
	attachApi(el, { read, write, input, enable, disable, on, keydown, mouseclick });
	write(props.modelValue);
	if (props.disabled) disable();
});

onBeforeUnmount(() => {
	closeBuiltin();
});
</script>

<template>
	<div
		ref="root"
		class="color-box"
		:class="{ disabled }"
		:id="props.id"
		role="button"
		:aria-disabled="disabled || undefined"
		:aria-label="props.label || undefined"
		@keydown="keydown"
		@click="mouseclick"
	>
		<div class="box color-box-background" :class="$style.background" />
		<div ref="foreground" class="box color-box-foreground" :class="$style.foreground" />
		<div v-if="builtinOpen" class="color-popup" :class="$style.popup" @click.stop>
			<input ref="colorInput" type="color" :value="hexValue" @input="pickColor" />
		</div>
	</div>
</template>

<style module>
.background {
	position: absolute;
	inset: 0;
	background-color: #ffffff;
	background-image:
		linear-gradient(45deg, #ccc 25%, transparent 25%),
		linear-gradient(-45deg, #ccc 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #ccc 75%),
		linear-gradient(-45deg, transparent 75%, #ccc 75%);
	background-size: 8px 8px;
	background-position:
		0 0,
		0 4px,
		4px -4px,
		-4px 0;
}

:global(:root.dark) .background {
	background-color: #202020;
	background-image:
		linear-gradient(45deg, #545454 25%, transparent 25%),
		linear-gradient(-45deg, #545454 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #545454 75%),
		linear-gradient(-45deg, transparent 75%, #545454 75%);
}

.foreground {
	position: absolute;
	inset: 0;
}

.popup {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 9999;
	padding: var(--ym-space-2);
	background-color: var(--ym-color-popup-bg);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-sm);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:global(:where(.color-box)) {
	display: block;
	position: relative;
	padding: 1px;
	width: auto;
	height: 20px;
	background-color: var(--input-background);
	border: var(--input-border);
	border-radius: 2px;
}

:global(:where(.color-box:focus)) {
	border-color: var(--input-border-color-focus);
}

:global(:where(.color-box.disabled)) {
	pointer-events: none;
	background-color: var(--input-background-disabled);
}

:global(:where(.color-box-background)) {
	position: absolute;
	padding: 1px;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-origin: content-box;
	background-clip: content-box;
	background-image: var(--grid-background);
	background-size: 8px;
}

:global(:where(.color-box-foreground)) {
	position: absolute;
	padding: 1px;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-origin: content-box;
	background-clip: content-box;
}
</style>
