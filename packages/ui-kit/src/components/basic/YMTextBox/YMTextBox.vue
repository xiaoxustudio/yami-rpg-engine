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
	change: [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const closeButtonEl = ref<HTMLElement | null>(null);
const closeButtonDisplay = ref('none');

interface TextBoxApi extends HTMLElement {
	_initialized?: boolean;
	lastText?: string;
	hiddenNodes?: HTMLElement[];
	closeButton?: HTMLElement | null;
	input?: HTMLInputElement;
	history?: { reset(): void };
	read?(): string;
	write?(value: string): void;
	insert?(value: string): void;
	enable?(): void;
	disable?(): void;
	getFocus?(mode: string | null): HTMLInputElement | undefined;
	setPlaceholder?(placeholder: string): void;
	setMaxLength?(length: number): void;
	fitContent?(): void;
	deleteInputContent?(): void;
	addCloseButton?(): void;
	addKeydownFilter?(): void;
	on?(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const state = {
	focusEventEnabled: false,
	blurEventEnabled: false
};

let isEditing = false;

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

const read = (): string => inputEl.value?.value ?? '';
const write = (value: string): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = value;
	(el as TextBoxApi).history?.reset();
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
const focus = (): void => {
	inputEl.value?.focus();
};
const getFocus = (mode: string | null): HTMLInputElement | undefined => {
	const el = inputEl.value;
	if (!el) return undefined;
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
	const parentRight = parent.getBoundingClientRect().right;
	const elLeft = el.getBoundingClientRect().left;
	el.style.width = `${clamp(input.scrollWidth + 2, 0, parentRight - elLeft)}px`;
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
const updateCloseButton = (): void => {
	closeButtonDisplay.value = read() !== '' ? '' : 'none';
};

const addCloseButton = (): void => {
	const el = root.value;
	const closeButton = closeButtonEl.value;
	if (!el || !closeButton) return;
	const baseWrite = write;
	(el as TextBoxApi).write = (value: string): void => {
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
	el.addEventListener('keydown', keydown);
	el.addEventListener('input', input);
	(el as TextBoxApi).closeButton = closeButton;
	closeButtonDisplay.value = 'none';
};

const onCloseButtonPointerdown = (event: PointerEvent): void => {
	event.preventDefault();
	event.stopPropagation();
};

const onCloseButtonClick = (): void => {
	deleteInputContent();
};
const addKeydownFilter = (): void => {
	const el = root.value;
	if (!el) return;
	const keydown = (event: KeyboardEvent): void => {
		const cmdOrCtrlKey = event.ctrlKey || event.metaKey;
		if (event.altKey) {
			return;
		} else if (!cmdOrCtrlKey && !event.shiftKey) {
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
	el.addEventListener('keydown', keydown);
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

const onCompositionStart = (): void => {
	isEditing = true;
};

const onCompositionEnd = (): void => {
	isEditing = false;
};

const onInputKeydown = (event: KeyboardEvent): void => {
	if (!isEditing) return;
	switch (event.code) {
		case 'Escape':
		case 'Enter':
			event.stopPropagation();
			return;
	}
};

const onInput = (): void => {
	const val = read();
	emit('update:modelValue', val);
	emit('input', val);
};

const onChange = (): void => emit('change', read());

const onFocus = (event: FocusEvent): void => emit('focus', event);

const onBlur = (event: FocusEvent): void => emit('blur', event);

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
	root,
	initializeApi
});

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

function initializeApi(): void {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input || (el as TextBoxApi)._initialized) return;
	(el as TextBoxApi).lastText = '';
	(el as TextBoxApi).hiddenNodes = [];
	(el as TextBoxApi).input = input;
	attachApi(el, {
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
		on
	});
	write(props.modelValue);
	if (props.disabled) disable();
	(el as TextBoxApi)._initialized = true;
};

onMounted(initializeApi);
</script>

<template>
	<div ref="root" class="text-box" :class="$style.box" :id="props.id">
		<input
			ref="inputEl"
			class="text-box-input"
			:class="$style.input"
			type="text"
			@compositionstart="onCompositionStart"
			@compositionend="onCompositionEnd"
			@keydown.capture="onInputKeydown"
			@input="onInput"
			@change="onChange"
			@focus="onFocus"
			@blur="onBlur"
		/>
		<div
			ref="closeButtonEl"
			class="box close-button"
			:style="{ display: closeButtonDisplay }"
			@pointerdown.prevent.stop="onCloseButtonPointerdown"
			@click="onCloseButtonClick"
		>
			&#x2716;
		</div>
	</div>
</template>

<style module>
.box {
	display: block;
}

.input {
	width: 100%;
}

:global(:where(.text-box)) {
	display: block;
	position: relative;
	width: auto;
	height: 20px;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
	overflow: hidden;
}

:global(:where(.text-box.disabled)) {
	pointer-events: none;
	background-color: var(--input-background-disabled);
}

:global(:where(.text-box:focus-within)) {
	border-color: var(--input-border-color-focus);
}

:global(:where(.text-box-input)) {
	position: absolute;
	margin: 0;
	padding: 4px;
	width: 100%;
	height: 100%;
	background-color: transparent;
	border: none;
}

:global(:where(.close-button)) {
	position: absolute;
	right: 0;
	width: 18px;
	height: 18px;
	line-height: 18px;
	font-size: 10px;
	text-align: center;
	color: var(--tab-close-color);
}

:global(:where(.close-button:hover)) {
	color: var(--tab-close-color-hover);
}

:global(:where(.close-button:active)) {
	color: var(--tab-close-color-active);
}
</style>


