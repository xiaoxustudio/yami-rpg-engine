<template>
	<YMParamList
		ref="ym"
		:id="props.id"
		:filter="props.filter"
		:group="props.group"
		:flexible="props.flexible"
		:model-value="props.modelValue"
		:history-factory="historyFactory"
		:menu-popup="menuPopup"
		:localize="localize"
		:clipboard="clipboard"
		:ctrl="ctrl"
		@update:model-value="emit('update:modelValue', $event)"
		@change="emit('change', $event)"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { YMParamList, type MenuItem, type MenuOptions } from '@ui-kit';
import { ParamListHistory } from '@ui-kit';
import { ctrl as ctrlText } from '@app/utils/event-accessors';
import { Menu } from '@app/components/menu-list';
import { attachElementApi } from '@app/utils/attach-element-api';
import { GlobalClipboard } from '@app/utils/clipboard';

interface Props {
	id?: string;
	filter?: string;
	group?: string;
	flexible?: boolean;
	/**
	 * 透传给 ui-kit `YMParamList` 的 `v-model`。
	 *
	 * 显式声明而不是靠 `$attrs` 落到根组件上：`@vue/test-utils` 不受影响，但"这个包装层
	 * 到底透不透 v-model"原先只能靠 Vue 的 fallthrough 推断。缺了这条，`v-model` 在
	 * 模板里看起来接了、实际值到不了列表（显示选项窗口的选项列表就空过，2026-10-22）。
	 */
	modelValue?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
	flexible: false
});

const { t } = useI18n();

/**
 * 转发 ui-kit `YMParamList` 的 `change`。
 *
 * 为什么要加：本仓有消费方仍在用元素优先写法（取到本组件的实例/元素后再订阅 change），
 * 而 `YMParamList` 早就 `emit('change', value)` 了，只是这层包装没有转发。
 * 补上后消费方可用 `@change`，与 editor `common/WindowFrame` 转发 open/closed 是同一处理。
 */
const emit = defineEmits<{
	change: [value: unknown];
	'update:modelValue': [value: unknown];
}>();

const historyFactory = (list: unknown): ParamListHistory => new ParamListHistory(list as never);
const menuPopup = (options: MenuOptions, items: MenuItem[]): void => Menu.popup(options, items);
const localize = (key: string): string => t('menuParamList.' + key);
interface ClipboardAdapter {
	write(type: string, data: unknown): void;
	read(type: string): unknown[] | null;
	has(type: string): boolean;
}
const clipboard = ((): ClipboardAdapter | null => {
	const C = GlobalClipboard;
	if (!C) return null;
	return {
		write: (type: string, data: unknown): void => C.write(type, data),
		read: (type: string): unknown[] | null => C.read(type) as unknown[] | null,
		has: (type: string): boolean => C.has(type)
	};
})();
const ctrl = (keyName: string): string => ctrlText(keyName);

const ym = ref<{
	root: HTMLElement | null;
	bind(object: unknown): HTMLElement;
	read(): unknown[] | null;
	write(data: unknown[]): void;
	update(): void;
	select(start: number, end?: number): void;
	clear(): HTMLElement;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const bind = (object: unknown): HTMLElement => ym.value!.bind(object);
const read = (): unknown[] | null => ym.value?.read() ?? null;
const write = (data: unknown[]): void => ym.value?.write(data);
const update = (): void => ym.value?.update();
const select = (start: number, end?: number): void => ym.value?.select(start, end);
const clear = (): HTMLElement => ym.value!.clear();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ bind, read, write, update, select, clear, on, root });

onMounted(() => {
	const el = root.value as HTMLElement & {
		bind(object: unknown): HTMLElement;
		read(): unknown[] | null;
		write(data: unknown[]): void;
		update(): void;
		select(start: number, end?: number): void;
		clear(): HTMLElement;
		on(
			type: string,
			listener: (event: Event) => void,
			options?: boolean | AddEventListenerOptions
		): void;
	};
	if (!el) return;
	attachElementApi(el, { bind, read, write, update, select, clear, on });
});
</script>
