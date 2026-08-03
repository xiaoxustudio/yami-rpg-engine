<template>
	<div class="text-box" ref="root" :id="props.id">
		<input ref="inputEl" class="text-box-input" type="text" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
	on as onElement,
	addClass,
	removeClass,
	show,
	hide,
	getFocus as getFocusElement,
	rect,
	hideChildNodes,
	showChildNodes
} from '@/util/element-utils';
import { TextHistory } from '@/components/text-history';

interface TextBoxElement extends HTMLElement {
	input: HTMLInputElement;
	lastText: string;
	hiddenNodes: any[];
	closeButton: HTMLElement | null;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	focus(): void;
	getFocus(mode: string | null): HTMLInputElement;
	setPlaceholder(placeholder: string): void;
	setMaxLength(length: number): void;
	fitContent(): void;
	deleteInputContent(): void;
	addCloseButton(): void;
	addKeydownFilter(): void;
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
	change: [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<TextBoxElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const state = {
	focusEventEnabled: false,
	blurEventEnabled: false
};

let isEditing = false;

const macInputKeydown = (event: KeyboardEvent): void => {
	if (event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				document.execCommand('copy');
				break;
			case 'KeyV':
				document.execCommand('paste');
				break;
			case 'KeyX':
				document.execCommand('cut');
				break;
		}
	}
};

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
const focus = (): void => {
	inputEl.value?.focus();
};
const getFocus = (mode: string | null): HTMLInputElement | undefined => {
	const el = inputEl.value;
	if (!el) return undefined;
	getFocusElement(el, mode ?? undefined);
	return el;
};
const setPlaceholder = (placeholder: string): void => {
	if (inputEl.value) inputEl.value.placeholder = placeholder;
};
const setMaxLength = (length: number): void => {
	if (inputEl.value) inputEl.value.maxLength = length;
};
const fitContent = (): void => {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input) return;
	const parent = el.parentNode as HTMLElement;
	el.style.width = '0';
	el.style.width = `${Math.clamp(
		input.scrollWidth + 2,
		0,
		rect(parent).right - rect(el).left
	)}px`;
};
const deleteInputContent = (): void => {
	const el = inputEl.value;
	if (!el) return;
	if (read() !== '') {
		el.select();
		el.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'deleteContentForward',
				bubbles: true
			})
		);
		document.execCommand('delete');
	}
};
const addCloseButton = (): void => {
	const el = root.value;
	if (!el) return;
	const baseWrite = write;
	const updateCloseButton = (): void => {
		const closeButton = el.closeButton;
		if (!closeButton) return;
		if (read() !== '') {
			show(closeButton);
		} else {
			hide(closeButton);
		}
	};
	el.write = (value: string): void => {
		baseWrite(value);
		updateCloseButton();
	};
	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Escape':
				if (read() !== '') {
					event.stopPropagation();
					deleteInputContent();
				}
				break;
		}
	};
	const input = (): void => {
		updateCloseButton();
	};
	const closeButtonPointerdown = (event: PointerEvent): void => {
		event.preventDefault();
		event.stopPropagation();
	};
	const closeButtonClick = (): void => {
		deleteInputContent();
	};
	onElement(el, 'keydown', keydown);
	onElement(el, 'input', input);
	const closeButton = document.createElement('div');
	addClass(closeButton, 'box');
	addClass(closeButton, 'close-button');
	closeButton.textContent = '\u2716';
	onElement(closeButton, 'pointerdown', closeButtonPointerdown);
	onElement(closeButton, 'click', closeButtonClick);
	el.closeButton = closeButton;
	el.appendChild(hide(closeButton));
};
const addKeydownFilter = (): void => {
	const el = root.value;
	if (!el) return;
	const keydown = (event: KeyboardEvent): void => {
		if (event.altKey) {
			return;
		} else if (!event.cmdOrCtrlKey && !event.shiftKey) {
			switch (event.code) {
				case 'Escape':
				case 'F1':
				case 'F3':
				case 'F4':
				case 'F9':
					return;
			}
		}
		event.stopImmediatePropagation();
	};
	onElement(el, 'keydown', keydown);
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

defineExpose({
	read,
	write,
	insert,
	enable,
	disable,
	focus,
	getFocus,
	setPlaceholder,
	setMaxLength,
	fitContent,
	deleteInputContent,
	addCloseButton,
	addKeydownFilter,
	on,
	input: inputEl,
	root
});

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input) return;
	input.history = new TextHistory(input);
	if (process.platform === 'darwin') {
		onElement(input, 'keydown', macInputKeydown as (event: EditorEvent) => void);
	}
	input.addEventListener('compositionstart', () => {
		isEditing = true;
	});
	input.addEventListener('compositionend', () => {
		isEditing = false;
	});
	input.addEventListener(
		'keydown',
		(e) => {
			if (!isEditing) {
				return;
			}
			switch (e.code) {
				case 'Escape':
				case 'Enter':
					e.stopPropagation();
					return;
			}
		},
		{ capture: true }
	);
	el.lastText = '';
	el.hiddenNodes = [];
	el.input = input;
	el.read = read;
	el.write = write;
	el.insert = insert;
	el.enable = enable;
	el.disable = disable;
	el.focus = focus;
	el.getFocus = getFocus;
	el.setPlaceholder = setPlaceholder;
	el.setMaxLength = setMaxLength;
	el.fitContent = fitContent;
	el.deleteInputContent = deleteInputContent;
	el.addCloseButton = addCloseButton;
	el.addKeydownFilter = addKeydownFilter;
	el.on = on;
	input.addEventListener('input', () => {
		const val = read();
		emit('update:modelValue', val);
		emit('input', val);
	});
	input.addEventListener('change', () => emit('change', read()));
	input.addEventListener('focus', (e: FocusEvent) => emit('focus', e));
	input.addEventListener('blur', (e: FocusEvent) => emit('blur', e));
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
