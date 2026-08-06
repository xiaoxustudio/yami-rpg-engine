<template>
	<YMTabBar ref="ym" :id="props.id" :update-app-region="updateAppRegion" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMTabBar } from '@ui-kit';
import { Title } from '@/title/title-bar';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	select: [event: any];
	closed: [event: any];
	popup: [event: any];
}>();

const updateAppRegion = (): void => Title.updateAppRegion();

const ym = ref<{
	root: HTMLElement | null;
	read(): any;
	write(value: any): void;
	update(): void;
	parseTabName(item: any): string;
	select(item: any): void;
	unselect(): void;
	insert(item: any): void;
	close(item: any): void;
	closeByProperty(key: string, value: any): void;
	closeOtherTabs(item: any): void;
	closeTabsToTheRight(item: any): void;
	find(meta: any): any;
	clear(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): any => ym.value?.read();
const write = (value: any): void => ym.value?.write(value);
const update = (): void => ym.value?.update();
const parseTabName = (item: any): string => ym.value?.parseTabName(item) ?? '';
const select = (item: any): void => ym.value?.select(item);
const unselect = (): void => ym.value?.unselect();
const insert = (item: any): void => ym.value?.insert(item);
const close = (item: any): void => ym.value?.close(item);
const closeByProperty = (key: string, value: any): void => ym.value?.closeByProperty(key, value);
const closeOtherTabs = (item: any): void => ym.value?.closeOtherTabs(item);
const closeTabsToTheRight = (item: any): void => ym.value?.closeTabsToTheRight(item);
const find = (meta: any): any => ym.value?.find(meta);
const clear = (): void => ym.value?.clear();
const on = (
	type: string,
	listener: (event: any) => void,
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
	const el = root.value as any;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.update = update;
	el.parseTabName = parseTabName;
	el.select = select;
	el.unselect = unselect;
	el.insert = insert;
	el.close = close;
	el.closeByProperty = closeByProperty;
	el.closeOtherTabs = closeOtherTabs;
	el.closeTabsToTheRight = closeTabsToTheRight;
	el.find = find;
	el.clear = clear;
	el.on = on;

	// 经 el.on 注册（YMTabBar 的 on() 会启用 selectEventEnabled/closedEventEnabled/popupEventEnabled 派发开关）
	el.on('select', (event: any) => emit('select', event));
	el.on('closed', (event: any) => emit('closed', event));
	el.on('popup', (event: any) => emit('popup', event));
});
</script>
