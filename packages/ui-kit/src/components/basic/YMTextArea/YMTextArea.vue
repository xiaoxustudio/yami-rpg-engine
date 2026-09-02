<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';

interface Props {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLTextAreaElement | null>(null);

const state = {
	focusEventEnabled: false,
	blurEventEnabled: false
};

let inputtingTimer: ReturnType<typeof setTimeout> | null = null;

const read = (): string => inputEl.value?.value ?? '';
const write = (value: string): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = value;
	(el as HTMLTextAreaElement & { history?: { reset(): void } }).history?.reset();
};
const insert = (value: string): void => {
	const el = inputEl.value;
	if (!el) return;
	el.dispatchEvent(
		new InputEvent('beforeinput', {
			inputType: 'insertFromPaste',
			data: value,
			bubbles: true
		})
	);
	document.execCommand('insertText', false, value);
};
const enable = (): void => {
	const el = root.value;
	if (!el) return;
	el.classList.remove('disabled');
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = '';
	}
};
const disable = (): void => {
	const el = root.value;
	if (!el) return;
	el.classList.add('disabled');
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = 'none';
	}
};
const getFocus = (mode: string): void => {
	const el = inputEl.value;
	if (!el) return;
	setTimeout(() => {
		el.focus();
		switch (mode) {
			case 'all':
				el.select();
				el.scrollLeft = 0;
				break;
			case 'end':
				if (typeof el.selectionStart === 'number') {
					el.setSelectionRange(el.value.length, el.value.length);
					el.scrollLeft = el.scrollWidth;
				}
				break;
		}
	});
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
		case 'focus':
			if (!state.focusEventEnabled) {
				state.focusEventEnabled = true;
				inputEl.value?.addEventListener('focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!state.blurEventEnabled) {
				state.blurEventEnabled = true;
				inputEl.value?.addEventListener('blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

const markInputting = (): void => {
	const el = root.value;
	if (!el) return;
	if (inputtingTimer !== null) {
		clearTimeout(inputtingTimer);
	}
	inputtingTimer = setTimeout(() => {
		el.classList.remove('inputting');
		inputtingTimer = null;
	}, 300);
	el.classList.add('inputting');
};

const inputKeydown = (event: KeyboardEvent): void => {
	const cmdOrCtrlKey = event.ctrlKey || event.metaKey;
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!cmdOrCtrlKey) {
				event.stopPropagation();
			}
			break;
	}
	markInputting();
};

const inputInput = (): void => {
	markInputting();
};

defineExpose({ read, write, insert, enable, disable, getFocus, on, input: inputEl, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

type TextAreaHost = HTMLElement & {
	input: HTMLTextAreaElement | null;
	read: typeof read;
	write: typeof write;
	insert: typeof insert;
	enable: typeof enable;
	disable: typeof disable;
	getFocus: typeof getFocus;
	on: typeof on;
};

onMounted(() => {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input) return;
	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('input', inputInput);
	(el as TextAreaHost).input = input;
	attachApi(el, { read, write, insert, enable, disable, getFocus, on });
	input.addEventListener('input', () => {
		const val = read();
		emit('update:modelValue', val);
		emit('input', val);
	});
	input.addEventListener('focus', (e: FocusEvent) => emit('focus', e));
	input.addEventListener('blur', (e: FocusEvent) => emit('blur', e));
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>

<template>
	<div ref="root" class="text-area" :class="$style.box" :id="props.id">
		<textarea ref="inputEl" class="text-area-input" :class="$style.input" />
	</div>
</template>

<style module>
.box {
	display: block;
}

.input {
	width: 100%;
}

:global(:where(.text-area)) {
	display: block;
	position: relative;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
}

:global(:where(.text-area.disabled)) {
	pointer-events: none;
	background-color: var(--input-background-disabled);
}

:global(:where(.text-area:focus-within)) {
	border-color: var(--input-border-color-focus);
}

:global(:where(.text-area > textarea)) {
	display: block;
	position: absolute;
	margin: 0;
	padding: 4px;
	width: 100%;
	height: 100%;
	font-size: 1em;
	font-family: var(--font-family-mono);
	overflow-x: hidden;
	overflow-y: auto;
	cursor: auto;
	resize: none;
	word-break: break-all;
	color: var(--text-color);
	background-color: transparent;
	border: none;
}

:global(:where(.text-area > textarea.inputting)) {
	margin-top: 4px;
	padding-top: 0;
	padding-bottom: 0;
	height: calc(100% - 8px);
}

:global(:where(.field-set > .text-area)) {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: transparent;
	border: none;
	border-radius: 0;
}

:global(:where(.field-set > .text-area > textarea)) {
	padding: 10px;
}

:global(:where(.field-set > .text-area > textarea.inputting)) {
	margin-top: 10px;
	height: calc(100% - 20px);
}
</style>

