<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

let dataValue = 0;
let inputEventEnabled = false;
let focusEventEnabled = false;
let blurEventEnabled = false;

const read = (): number => dataValue;

const codeToKey = (code: string): string => {
	if (code.startsWith('Key')) return code.slice(3);
	if (code.startsWith('Digit')) return code.slice(5);
	if (code.startsWith('Numpad')) return code.slice(6);
	if (code.startsWith('Arrow')) return code.slice(5);
	return code;
};

const write = (code: number): void => {
	dataValue = code;
	if (input.value) {
		input.value.value = code === 0 ? '' : String(code);
	}
};

const inputCode = (code: number): void => {
	if (dataValue !== code) {
		write(code);
		if (inputEventEnabled) {
			const inputEvent = new InputEvent('input') as InputEvent & {
				value: number;
			};
			inputEvent.value = dataValue;
			root.value?.dispatchEvent(inputEvent);
		}
		root.value?.dispatchEvent(new Event('change', { bubbles: true }));
	}
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

const getFocus = (mode: string): HTMLInputElement | null => {
	const el = input.value;
	setTimeout(() => {
		if (!el) return;
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
	return el;
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
		case 'input':
			inputEventEnabled = true;
			break;
		case 'focus':
			if (!focusEventEnabled) {
				focusEventEnabled = true;
				input.value?.addEventListener('focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!blurEventEnabled) {
				blurEventEnabled = true;
				input.value?.addEventListener('blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

const inputKeydown = (event: KeyboardEvent): void => {
	event.stopPropagation();
	event.preventDefault();
	switch (event.code) {
		case 'Backspace':
			inputCode(0);
			break;
		case 'Enter':
		case 'NumpadEnter':
			event.stopImmediatePropagation();
		default:
			inputCode(event.keyCode || 0);
			if (input.value) input.value.value = codeToKey(event.code);
			break;
	}
};

onMounted(() => {
	input.value?.addEventListener('keydown', inputKeydown);
	const el = root.value as any;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.inputCode = inputCode;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	el.input = input.value;
});

defineExpose({ read, write, inputCode, enable, disable, getFocus, on, root, input });
</script>

<template>
	<div ref="root" class="keyboard-box" :class="$style.box" :id="props.id">
		<input class="keyboard-box-input" :class="$style.input" ref="input" type="text" />
	</div>
</template>

<style module>
.box {
	display: inline-block;
}

.input {
	width: 100%;
}
</style>
