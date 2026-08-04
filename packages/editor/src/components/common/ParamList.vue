<template>
	<YMParamList
		ref="ym"
		:id="props.id"
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
import { YMParamList } from '@ui-kit';
import { ParamListHistory } from '@/components/param-history';
import { ctrl as ctrlText } from '@/util/event-accessors';
import { Menu } from '@/components/menu-list';
import { Local } from '@/tools/localization';

interface Props {
	id?: string;
	flexible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	flexible: false
});

const historyFactory = (list: any): any => new ParamListHistory(list);
const menuPopup = (options: any, items: any[]): void => Menu.popup(options, items);
const localize = (key: string): string => Local.createGetter('menuParamList')(key);
const clipboard = ((): any => {
	const C = (window as any).Clipboard;
	if (!C) return null;
	return {
		write: (type: string, data: any): void => C.write(type, data),
		read: (type: string): any => C.read(type),
		has: (type: string): boolean => C.has(type)
	};
})();
const ctrl = (keyName: string): string => ctrlText(keyName);

const ym = ref<{
	root: HTMLElement | null;
	bind(object: any): HTMLElement;
	read(): any[] | null;
	write(data: any[]): void;
	update(): void;
	select(start: number, end?: number): void;
	clear(): HTMLElement;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const bind = (object: any): HTMLElement => ym.value!.bind(object);
const read = (): any[] | null => ym.value?.read() ?? null;
const write = (data: any[]): void => ym.value?.write(data);
const update = (): void => ym.value?.update();
const select = (start: number, end?: number): void => ym.value?.select(start, end);
const clear = (): HTMLElement => ym.value!.clear();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ bind, read, write, update, select, clear, on, root });

onMounted(() => {
	const el = root.value as any;
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
