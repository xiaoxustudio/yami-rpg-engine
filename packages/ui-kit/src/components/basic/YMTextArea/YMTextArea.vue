<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';

interface Props {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false,
	label: ''
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

/**
 * 合并原先**两个** `input` 监听（`inputInput` 与一个内联的 emit 闭包）为模板上的一处
 * `@input`。两个监听同目标同事件、注册顺序相邻，合并后语义等价且少一次闭包分配。
 * 原先的 `inputInput` 只剩这一处调用点，已并入本函数（保留独立名字反而不清楚）。
 */
const onInput = (): void => {
	markInputting();
	const value = read();
	emit('update:modelValue', value);
	emit('input', value);
};

const onInputFocus = (event: FocusEvent): void => emit('focus', event);
const onInputBlur = (event: FocusEvent): void => emit('blur', event);

defineExpose({ read, write, insert, enable, disable, getFocus, on, input: inputEl, root });

watch(
	() => props.modelValue,
	(val) => write(val)
);
watch(
	() => props.disabled,
	(val) => (val ? disable() : enable())
);

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
	(el as TextAreaHost).input = input;
	attachApi(el, { read, write, insert, enable, disable, getFocus, on });
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>

<!--
  `keydown` / `input` / `focus` / `blur` 走模板 @。原先 `on()` 里那对 focus/blur 的
  **条件性**再派发（消费者给根元素挂 focus/blur 时才把内层 textarea 的事件转发上去）保持不动 ——
  它本身就是「消费者挂根监听」这一契约的配套实现，属 P2 删 `on` 时一并处理的范畴。

  ⚠️ 这正是 `wrapper.element` 陷阱：注释若写在 `<template>` 的**根元素之前**，Vue 会把它当成
  模板根节点，于是 `wrapper.element` 变成注释节点、`wrapper.classes()` 恒为空数组。
  所以这段说明放在模板**外面**（SFC 允许 template 之外有顶层注释）。
-->
<template>
	<div ref="root" class="text-area" :class="$style.box" :id="props.id">
		<textarea
			ref="inputEl"
			class="text-area-input"
			:class="$style.input"
			:aria-label="props.label || undefined"
			@keydown="inputKeydown"
			@input="onInput"
			@focus="onInputFocus"
			@blur="onInputBlur"
		/>
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
