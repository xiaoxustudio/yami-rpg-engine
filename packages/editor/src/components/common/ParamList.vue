<template>
	<YMParamList
		ref="ym"
		:id="props.id"
		:filter="props.filter"
		:flexible="props.flexible"
		:history-factory="historyFactory"
		:menu-popup="menuPopup"
		:localize="localize"
		:clipboard="clipboard"
		:ctrl="ctrl"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMParamList, type MenuItem, type MenuOptions } from '@ui-kit';
import { ParamListHistory } from '@/components/param-history';
import { ctrl as ctrlText } from '@/util/event-accessors';
import { Menu } from '@/components/menu-list';
import { Local } from '@/tools/localization';

interface Props {
	id?: string;
	filter?: string;
	flexible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	flexible: false
});

const historyFactory = (list: unknown): ParamListHistory => new ParamListHistory(list);
const menuPopup = (options: MenuOptions, items: MenuItem[]): void => Menu.popup(options, items);
const localize = (key: string): string => Local.createGetter('menuParamList')(key);
interface ClipboardAdapter {
	write(type: string, data: unknown): void;
	read(type: string): unknown;
	has(type: string): boolean;
}
const clipboard = ((): ClipboardAdapter | null => {
	const C = (
		window as unknown as {
			Clipboard?: ClipboardAdapter;
		}
	).Clipboard;
	if (!C) return null;
	return {
		write: (type: string, data: unknown): void => C.write(type, data),
		read: (type: string): unknown => C.read(type),
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
	el.bind = bind;
	el.read = read;
	el.write = write;
	el.update = update;
	el.select = select;
	el.clear = clear;
	el.on = on;
});
</script>
