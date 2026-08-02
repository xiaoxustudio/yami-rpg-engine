<template>
	<div class="text-area" ref="root" :id="props.id">
		<textarea ref="inputEl" class="text-area-input" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
	on as onElement,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus as getFocusElement,
	listenDraggingScrollbarEvent
} from '@/util/element-utils';
import { TextHistory } from '@/components/text-history';
import { Timer } from '@/util/timer';
import { macInputKeydown } from '@/components/text-box';

interface TextAreaElement extends HTMLElement {
	input: HTMLTextAreaElement;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

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

const root = ref<TextAreaElement | null>(null);
const inputEl = ref<HTMLTextAreaElement | null>(null);

const state = {
	focusEventEnabled: false,
	blurEventEnabled: false
};

let target: HTMLElement | null = null;

const timer = new Timer({
	duration: 0,
	callback: () => {
		removeClass(target, 'inputting');
		target = null;
	}
});

const read = (): string => inputEl.value?.value ?? '';
const write = (value: string): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = value;
	el.history.reset();
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
	if (removeClass(root.value, 'disabled')) {
		showChildNodes(root.value);
	}
};
const disable = (): void => {
	if (addClass(root.value, 'disabled')) {
		hideChildNodes(root.value);
	}
};
const getFocus = (mode: any): void => {
	getFocusElement(inputEl.value, mode);
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
		case 'focus':
			if (!state.focusEventEnabled) {
				state.focusEventEnabled = true;
				onElement(inputEl.value, 'focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!state.blurEventEnabled) {
				state.blurEventEnabled = true;
				onElement(inputEl.value, 'blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

const inputKeydown = (event: any): void => {
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!event.cmdOrCtrlKey) {
				event.stopPropagation();
			}
			break;
	}
	if (!target) {
		target = root.value;
		timer.add();
		addClass(root.value, 'inputting');
	}
};

const inputInput = (event: any): void => {
	if (!target) {
		target = root.value;
		timer.add();
		addClass(root.value, 'inputting');
	}
};

defineExpose({ read, write, insert, enable, disable, getFocus, on, input: inputEl, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input) return;
	input.history = new TextHistory(input);
	onElement(input, 'keydown', inputKeydown);
	onElement(input, 'input', inputInput);
	listenDraggingScrollbarEvent(input);
	if (process.platform === 'darwin') {
		onElement(input, 'keydown', macInputKeydown as (event: EditorEvent) => void);
	}
	el.input = input;
	el.read = read;
	el.write = write;
	el.insert = insert;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
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
