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
	change: [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

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
const addCloseButton = (): void => {
	const el = root.value;
	if (!el) return;
	const baseWrite = write;
	const updateCloseButton = (): void => {
		const closeButton = (el as any).closeButton as HTMLElement | null;
		if (!closeButton) return;
		closeButton.style.display = read() !== '' ? '' : 'none';
	};
	(el as any).write = (value: string): void => {
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
	el.addEventListener('keydown', keydown);
	el.addEventListener('input', input);
	const closeButton = document.createElement('div');
	closeButton.className = 'box close-button';
	closeButton.textContent = '\u2716';
	closeButton.addEventListener('pointerdown', closeButtonPointerdown);
	closeButton.addEventListener('click', closeButtonClick);
	(el as any).closeButton = closeButton;
	closeButton.style.display = 'none';
	el.appendChild(closeButton);
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
	input.addEventListener('compositionstart', () => {
		isEditing = true;
	});
	input.addEventListener('compositionend', () => {
		isEditing = false;
	});
	input.addEventListener(
		'keydown',
		(e) => {
			if (!isEditing) return;
			switch (e.code) {
				case 'Escape':
				case 'Enter':
					e.stopPropagation();
					return;
			}
		},
		{ capture: true }
	);
	(el as any).lastText = '';
	(el as any).hiddenNodes = [];
	(el as any).input = input;
	(el as any).read = read;
	(el as any).write = write;
	(el as any).insert = insert;
	(el as any).enable = enable;
	(el as any).disable = disable;
	(el as any).focus = focus;
	(el as any).getFocus = getFocus;
	(el as any).setPlaceholder = setPlaceholder;
	(el as any).setMaxLength = setMaxLength;
	(el as any).fitContent = fitContent;
	(el as any).deleteInputContent = deleteInputContent;
	(el as any).addCloseButton = addCloseButton;
	(el as any).addKeydownFilter = addKeydownFilter;
	(el as any).on = on;
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

<template>
	<div ref="root" class="text-box" :class="$style.box" :id="props.id">
		<input ref="inputEl" class="text-box-input" :class="$style.input" type="text" />
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
