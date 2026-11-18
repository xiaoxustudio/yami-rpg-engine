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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { YMParamList, type MenuItem, type MenuOptions } from '@ui-kit';
import { ParamListHistory } from '@ui-kit';
import { ctrl as ctrlText } from '@app/utils/event-accessors';
import { Menu } from '@app/components/menu-list';
import { GlobalClipboard } from '@app/utils/clipboard';

interface Props {
	id?: string;
	filter?: string;
	group?: string;
	flexible?: boolean;
	modelValue?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
	flexible: false
});

const { t } = useI18n();

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
	object?: unknown;
	start?: number | null;
	bind(object: unknown): HTMLElement;
	read(): unknown[] | null;
	write(data: unknown[]): void;
	update(): void;
	select(start: number, end?: number): void;
	insert(): void;
	edit(): void;
	delete(): void;
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
const insert = (): void => ym.value?.insert();
const edit = (): void => ym.value?.edit();
const remove = (): void => ym.value?.delete();
const clear = (): HTMLElement => ym.value!.clear();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

/**
 * 列表当前绑定的参数对象（`bind` 的入参）。
 *
 * 能力对象在 YMParamList 内部，包装层只转出编辑器/窗口真正要用的那一份：
 * 选中后菜单、双击编辑、undo/redo 都从 api 走，不再经元素。
 */
defineExpose({
	bind,
	read,
	write,
	update,
	select,
	insert,
	edit,
	delete: remove,
	clear,
	on,
	root,
	/** YMParamList 实例：bind 需要它的 object/data，包装层本身没有 */
	self: computed(() => ym.value),
	get object(): unknown {
		return ym.value?.object ?? null;
	},
	get start(): number | null {
		return ym.value?.start ?? null;
	}
});
</script>
