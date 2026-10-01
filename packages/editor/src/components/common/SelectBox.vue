<template>
	<YMSelectBox
		ref="ym"
		:model-value="props.modelValue"
		:items="props.items"
		:disabled="props.disabled"
		:popup="false"
		:id="props.id"
		:label="props.label"
		@open="onOpen"
		@input="onInput"
		@write="onWrite"
		@change="onChange"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { YMSelectBox } from '@ui-kit';
import { setTooltip as setTooltipElement, dispatchChangeEvent } from '@app/utils/element-utils';
import { Select } from '@app/components/select-list.ts';
import { parseLocalTip } from '@app/localize/dom-localizer';
import { useLocalStore } from '@app/stores/local';
import { pinia } from '@app/stores/pinia';
import { attachElementApi } from '@app/utils/attach-element-api';

interface SelectBoxElement extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	writeDefault(): void;
	input(value: unknown): void;
	update(): void;
	reselect(offset: number): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: unknown[]): void;
	setItemNames(options: Record<string, string | { name?: string; tip?: string }>): void;
	setTooltip(tip: string | (() => string)): void;
	createTooltip(): void;
	clear(): HTMLElement;
	enableHiddenMode(): HTMLElement;
	relate(entries: unknown): void;
	toggleRelatedElements(): void;
	enableElement(element: unknown): void;
	disableElement(element: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
	/** 可访问名（透传给 ui-kit 的 aria-label），不渲染可见文本 */
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null as never,
	items: () => [],
	disabled: false,
	label: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	write: [value: unknown];
	input: [value: unknown];
	change: [value: unknown];
}>();

let originalTip = '';

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	writeDefault(): void;
	input(value: unknown): void;
	update(): void;
	reselect(offset: number): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: unknown[]): HTMLElement;
	setItemNames(options: Record<string, string | { name?: string; tip?: string }>): void;
	clear(): HTMLElement;
	enableHiddenMode(): HTMLElement;
	relate(entries: unknown): void;
	toggleRelatedElements(): void;
	enableElement(element: unknown): void;
	disableElement(element: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): unknown => ym.value?.read();
const write = (value: unknown): void => ym.value?.write(value);
const write2 = (value: unknown): void => ym.value?.write2(value);
const writeDefault = (): void => ym.value?.writeDefault();
const input = (value: unknown): void => ym.value?.input(value);
const update = (): void => ym.value?.update();
const reselect = (offset: number): void => ym.value?.reselect(offset);
const save = (): void => ym.value?.save();
const restore = (): void => ym.value?.restore();
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
/**
 * 选项名由本组件按语言文件**自己生成**（`t()` 响应式），本地化器不必再为这些键查 DOM。
 * 与 `useLocalStore().components[id].options` 等价（那份只在语言切换时重写一次），
 * 这里按同一份 `components.<id>.options` 消息树生成，并由 `watchEffect` 在语言切换时重挂。
 * 未收录 `components.<id>.options` 的控件保持原样（不写名字，交给调用方的 loadItems）。
 */
const { t, te, tm } = useI18n();
const applyLocalizedOptions = (): void => {
	const id = props.id;
	if (!id) return;
	const messageKey = `components.${id}.options`;
	if (!te(messageKey)) {
		const item = useLocalStore(pinia).components?.[id];
		if (item?.options) {
			setItemNames(item.options as Record<string, string | { name?: string; tip?: string }>);
		}
		return;
	}
	const raw = tm(messageKey) as Record<string, { name?: string; tip?: string }>;
	const mapped: Record<string, { name: string; tip: string }> = {};
	for (const value of Object.keys(raw)) {
		mapped[value] = {
			name: t(`${messageKey}.${value}.name`),
			tip: t(`${messageKey}.${value}.tip`)
		};
	}
	setItemNames(mapped);
};
const loadItems = (items: unknown[]): HTMLElement => {
	const el = ym.value?.loadItems(items) as HTMLElement | undefined;
	applyLocalizedOptions();
	return el as HTMLElement;
};
const setItemNames = (options: Record<string, string | { name?: string; tip?: string }>): void => {
	const mapped: Record<string, string | { name?: string; tip?: string }> = {};
	for (const key of Object.keys(options ?? {})) {
		const option = options[key];
		if (typeof option === 'string') {
			mapped[key] = option;
		} else if (option && typeof option === 'object') {
			const copy: { name?: string; tip?: string } = { ...option };
			if ('tip' in copy) {
				copy.tip = parseLocalTip(copy.tip!, copy.name ?? '');
			}
			mapped[key] = copy;
		}
	}
	ym.value?.setItemNames(mapped);
	createTooltip();
};
const clear = (): HTMLElement => ym.value?.clear() as HTMLElement;
const enableHiddenMode = (): HTMLElement => ym.value?.enableHiddenMode() as HTMLElement;
const relate = (entries: unknown): void => ym.value?.relate(entries);
const toggleRelatedElements = (): void => ym.value?.toggleRelatedElements();
const enableElement = (element: unknown): void => ym.value?.enableElement(element);
const disableElement = (element: unknown): void => ym.value?.disableElement(element);
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

const setTooltip = (tip: string | (() => string)): void => {
	const el = root.value;
	if (!el) return;
	originalTip = tip as string;
	setTooltipElement(el, tip);
};

const createTooltip = (): void => {
	const el = root.value;
	if (!el) return;
	let tip = originalTip ?? '';
	let options = '';
	const items =
		(el as HTMLElement & { dataItems?: Array<{ tip?: string }> | null }).dataItems ?? [];
	for (const item of items) {
		if (item.tip) {
			options += item.tip + '\n';
		}
	}
	if (tip === '' && options !== '') {
		const prev = el.previousElementSibling;
		if (prev && prev.classList.contains('text')) {
			tip += `<b>${prev.textContent}</b>`;
		}
	}
	if (tip !== '' && options !== '') {
		tip += '<tooltip-line></tooltip-line>';
	}
	tip += options;
	if (tip !== '') {
		setTooltipElement(el, tip.trim());
	}
};

const openSelect = (): void => {
	const el = root.value;
	// 读 props 而不是本地 ref：本地那份是挂载时的快照，运行期改 disabled 后守卫会失效
	if (!el || props.disabled) return;
	Select.open(el);
};

const onOpen = (): void => {
	openSelect();
};

const onInput = (value: unknown): void => {
	emit('input', value);
	emit('update:modelValue', value);
};

const onWrite = (value: unknown): void => emit('write', value);

const onChange = (value: unknown): void => emit('change', value);

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
	setTooltip,
	createTooltip,
	clear,
	enableHiddenMode,
	relate,
	toggleRelatedElements,
	enableElement,
	disableElement,
	on,
	root
});

// 语言切换时重挂选项名（`applyLocalizedOptions` 内部调 `t`，故本 effect 会随语言变化重跑）
watchEffect(() => {
	applyLocalizedOptions();
});

onMounted(() => {
	const el = root.value as SelectBoxElement | null;
	if (!el) return;
	attachElementApi(el, {
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
		setTooltip,
		createTooltip,
		clear,
		enableHiddenMode,
		relate,
		toggleRelatedElements,
		enableElement,
		disableElement,
		on
	});
	dispatchChangeEvent(el);
	if (props.disabled) disable();
});
</script>
