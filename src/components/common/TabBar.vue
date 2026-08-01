<template>
	<tab-bar ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement
} from '@/util/element-utils';

interface TabBarElement extends HTMLElement {
	data: any[] | null;
	dragging: any | null;
	selectionIndex: number;
	dirItem: any;
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
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	write: [value: any];
	select: [value: any];
	closed: [closedItems: any[], lastValue: any];
	popup: [value: any, clientX: number, clientY: number];
}>();

const root = ref<TabBarElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const update = (): void => root.value?.update();
const parseTabName = (item: any): string => root.value?.parseTabName(item) ?? '';
const select = (item: any): void => root.value?.select(item);
const unselect = (): void => root.value?.unselect();
const insert = (item: any): void => root.value?.insert(item);
const close = (item: any): void => root.value?.close(item);
const closeByProperty = (key: string, value: any): void =>
	root.value?.closeByProperty(key, value);
const closeOtherTabs = (item: any): void => root.value?.closeOtherTabs(item);
const closeTabsToTheRight = (item: any): void =>
	root.value?.closeTabsToTheRight(item);
const find = (meta: any): any => root.value?.find(meta);
const clear = (): void => { if (root.value) clearElement(root.value); };
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

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
	const el = root.value;
	if (!el) return;
	el.on('write', (e: any) => emit('write', e.value));
	el.on('select', (e: any) => emit('select', e.value));
	el.on('closed', (e: any) => emit('closed', e.closedItems, e.lastValue));
	el.on('popup', (e: any) =>
		emit('popup', e.value, e.clientX, e.clientY)
	);
});
</script>
