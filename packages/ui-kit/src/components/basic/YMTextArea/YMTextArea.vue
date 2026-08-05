<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

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

let target: HTMLElement | null = null;
let inputtingTimer: ReturnType<typeof setTimeout> | null = null;

const read = (): string => inputEl.value?.value ?? '';
const write = (value: string): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = value;
	(el as any).history?.reset();
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
const getFocus = (mode: any): void => {
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
	listener: (event: any) => void,
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
	target = el;
	if (inputtingTimer !== null) {
		clearTimeout(inputtingTimer);
	}
	inputtingTimer = setTimeout(() => {
		el.classList.remove('inputting');
		target = null;
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

onMounted(() => {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input) return;
	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('input', inputInput);
	(el as any).input = input;
	(el as any).read = read;
	(el as any).write = write;
	(el as any).insert = insert;
	(el as any).enable = enable;
	(el as any).disable = disable;
	(el as any).getFocus = getFocus;
	(el as any).on = on;
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
</style>

