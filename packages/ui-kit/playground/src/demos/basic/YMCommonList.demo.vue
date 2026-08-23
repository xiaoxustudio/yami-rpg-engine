<script setup lang="ts">
import { h, onMounted, ref, render } from 'vue';
import { YMCommonList, YMMenuList, YMButton, type MenuItem } from '@ui-kit';
interface DemoItem {
	id: number;
	label: string;
}

interface CommonListApi extends HTMLElement {
	[k: string]: unknown;
	read(): unknown;
	write(value: unknown): void;
	reload(): HTMLElement;
	appendElement(element: HTMLElement): void;
	update(): void;
	select(element: HTMLElement): void;
	clear(): HTMLElement;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const items: DemoItem[] = Array.from({ length: 60 }, (_, i) => ({
	id: i,
	label: `Item ${i + 1}`
}));

const listRef = ref<InstanceType<typeof YMCommonList> | null>(null);
const menuRef = ref<InstanceType<typeof YMMenuList> | null>(null);
const selected = ref('(none)');
const popupInfo = ref('(right-click an item)');
const lastAction = ref('(none)');

const buildItem = (item: DemoItem): HTMLElement => {
	const host = document.createElement('div');
	render(h('common-item', { '.dataValue': item }, item.label), host);
	const el = host.firstElementChild as HTMLElement;
	host.removeChild(el);
	return el;
};

const fill = (): void => {
	const list = listRef.value;
	if (!list) return;
	list.reload();
	for (const item of items) {
		list.appendElement(buildItem(item));
	}
	list.update();
};

onMounted(() => {
	fill();
	const el = listRef.value?.root as CommonListApi | null;
	if (!el) return;
	el.on('popup', (event: Event) => {
		const e = event as Event & { value?: unknown; clientX: number; clientY: number };
		const item = e.value as DemoItem | null;
		popupInfo.value = item
			? `popup at (${e.clientX}, ${e.clientY}): ${item.label}`
			: 'popup: empty area';
		menuRef.value?.popup({ x: e.clientX, y: e.clientY, minWidth: 160 }, buildMenu(item));
	});
});

const buildMenu = (item: DemoItem | null): MenuItem[] => [
	{
		label: item ? item.label : 'Empty Area',
		enabled: false
	},
	{ type: 'separator' },
	{
		label: 'Select',
		enabled: item !== null,
		click: () => {
			if (item) {
				listRef.value?.write(item);
				lastAction.value = `Select ${item.label}`;
			}
		}
	},
	{
		label: 'Insert Above',
		enabled: item !== null,
		click: () => {
			if (item) insertItem(items.indexOf(item));
		}
	},
	{
		label: 'Insert Below',
		enabled: item !== null,
		click: () => {
			if (item) insertItem(items.indexOf(item) + 1);
		}
	},
	{
		label: 'Delete',
		enabled: item !== null,
		click: () => {
			if (item) deleteItem(items.indexOf(item));
		}
	},
	{ type: 'separator' },
	{
		label: 'Clear List',
		click: () => {
			clearList();
			lastAction.value = 'Clear List';
		}
	},
	{
		label: 'Refill',
		click: () => {
			refill();
			lastAction.value = 'Refill';
		}
	}
];

const insertItem = (index: number): void => {
	const item: DemoItem = { id: Date.now(), label: `Item ${items.length + 1}` };
	items.splice(index, 0, item);
	lastAction.value = `Insert ${item.label}`;
	fill();
};

const deleteItem = (index: number): void => {
	const [item] = items.splice(index, 1);
	lastAction.value = `Delete ${item.label}`;
	fill();
};

const onSelect = (value: unknown): void => {
	selected.value = (value as DemoItem | null)?.label ?? '(none)';
};

const selectRandom = (): void => {
	const list = listRef.value;
	const root = list?.root;
	if (!list || !root) return;
	const element = root.children[Math.floor(Math.random() * root.children.length)] as HTMLElement;
	list.select(element);
};

const clearList = (): void => {
	listRef.value?.clear();
	selected.value = '(none)';
};

const refill = (): void => {
	fill();
};
</script>

<template>
	<section>
		<h2>YMCommonList</h2>
		<p class="desc">虚拟滚动列表；点击选中、右键弹出菜单（需先点击列表获得焦点）。</p>
		<div class="row">
			<YMButton size="sm" @click="selectRandom">Select Random</YMButton>
			<YMButton size="sm" @click="clearList">Clear</YMButton>
			<YMButton size="sm" @click="refill">Refill</YMButton>
			<span class="hint">selected: {{ selected }}</span>
		</div>
		<div class="stage" @contextmenu.prevent>
			<YMCommonList ref="listRef" @select="onSelect" />
		</div>
		<p class="hint">popup: {{ popupInfo }} · action: {{ lastAction }}</p>
		<YMMenuList ref="menuRef" />
	</section>
</template>

<style scoped>
.stage {
	position: relative;
	margin-top: var(--ym-space-3);
	width: 320px;
	height: 200px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
}
</style>
