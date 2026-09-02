<template>
	<YMTabBar ref="ym" :id="props.id" :update-app-region="updateAppRegion" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMTabBar } from '@ui-kit';
import { getLazyWindow } from '@app/tools/window-registry';
import { attachElementApi } from '@app/utils/attach-element-api';
import { on as onElement } from '@app/utils/element-utils';

const Title = getLazyWindow('title', () =>
	import('@app/tools/window-cluster').then((m) => m.Title)
);

interface Props {
	id?: string;
}

interface TabItemMeta {
	guid?: string;
	path?: string;
	[k: string]: unknown;
}

interface TabItemData {
	icon: string;
	name: string;
	meta?: TabItemMeta;
	type?: string;
	tab?: HTMLElement;
	[k: string]: unknown;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const emit = defineEmits<{
	select: [event: Event & { value?: TabItemData }];
	closed: [event: Event & { value?: TabItemData }];
	popup: [event: Event & { value?: TabItemData }];
}>();

const updateAppRegion = (): void => Title.updateAppRegion?.();

const ym = ref<{
	root: HTMLElement | null;
	read(): TabItemData | undefined;
	write(value: TabItemData | undefined): void;
	update(): void;
	parseTabName(item: TabItemData): string;
	select(item: TabItemData): void;
	unselect(): void;
	insert(item: TabItemData): void;
	close(item: TabItemData): void;
	closeByProperty(key: string, value: unknown): void;
	closeOtherTabs(item: TabItemData): void;
	closeTabsToTheRight(item: TabItemData): void;
	find(meta: TabItemMeta): TabItemData | undefined;
	clear(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): TabItemData | undefined => ym.value?.read();
const write = (value: TabItemData | undefined): void => ym.value?.write(value);
const update = (): void => ym.value?.update();
const parseTabName = (item: TabItemData): string => ym.value?.parseTabName(item) ?? '';
const select = (item: TabItemData): void => ym.value?.select(item);
const unselect = (): void => ym.value?.unselect();
const insert = (item: TabItemData): void => ym.value?.insert(item);
const close = (item: TabItemData): void => ym.value?.close(item);
const closeByProperty = (key: string, value: unknown): void =>
	ym.value?.closeByProperty(key, value);
const closeOtherTabs = (item: TabItemData): void => ym.value?.closeOtherTabs(item);
const closeTabsToTheRight = (item: TabItemData): void => ym.value?.closeTabsToTheRight(item);
const find = (meta: TabItemMeta): TabItemData | undefined => ym.value?.find(meta);
const clear = (): void => ym.value?.clear();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({
	read,
	write,
	update,
	parseTabName,
	select,
	unselect,
	insert,
	close,
	closeByProperty,
	closeOtherTabs,
	closeTabsToTheRight,
	find,
	clear,
	on,
	root
});

onMounted(() => {
	const el = root.value as HTMLElement & {
		read: () => TabItemData | undefined;
		write: (value: TabItemData | undefined) => void;
		update: () => void;
		parseTabName: (item: TabItemData) => string;
		select: (item: TabItemData) => void;
		unselect: () => void;
		insert: (item: TabItemData) => void;
		close: (item: TabItemData) => void;
		closeByProperty: (key: string, value: unknown) => void;
		closeOtherTabs: (item: TabItemData) => void;
		closeTabsToTheRight: (item: TabItemData) => void;
		find: (meta: TabItemMeta) => TabItemData | undefined;
		clear: () => void;
	};
	if (!el) return;
	attachElementApi(el, {
		read,
		write,
		update,
		parseTabName,
		select,
		unselect,
		insert,
		close,
		closeByProperty,
		closeOtherTabs,
		closeTabsToTheRight,
		find,
		clear,
		on
	});

	// 经 on() 注册（YMTabBar 的 on() 会启用 selectEventEnabled/closedEventEnabled/popupEventEnabled 派发开关）
	onElement(el, 'select', (event: Event & { value?: TabItemData }) => emit('select', event));
	onElement(el, 'closed', (event: Event & { value?: TabItemData }) => emit('closed', event));
	onElement(el, 'popup', (event: Event & { value?: TabItemData }) => emit('popup', event));
});
</script>
