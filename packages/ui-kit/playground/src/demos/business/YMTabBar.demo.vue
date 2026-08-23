<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMButton, YMTabBar } from '@ui-kit';

interface TabItemMeta {
	guid?: string;
	path?: string;
	[k: string]: unknown;
}

interface TabItem {
	icon: string;
	name: string;
	type?: string;
	meta?: TabItemMeta;
	tab?: HTMLElement;
	[k: string]: unknown;
}

interface TabBarElement extends HTMLElement {
	data: TabItem[] | null;
	dirItem: TabItem | null;
	update(): void;
	select(item: TabItem): void;
	unselect(): void;
	close(item: TabItem): void;
	closeOtherTabs(item: TabItem): void;
	closeTabsToTheRight(item: TabItem): void;
	insert(item: TabItem): void;
	clear(): void;
	read(): TabItem | undefined;
	on(type: string, listener: (event: Event) => void): void;
}

const tabRef = ref<{ root: HTMLElement | null } | null>(null);

const directoryTab: TabItem = { icon: '\u25B6', name: 'Map001', type: 'directory' };
const tabs = ref<TabItem[]>([
	directoryTab,
	{ icon: '\u25A0', name: 'Event 1', meta: { guid: '1111111111111111' } },
	{ icon: '\u25CF', name: 'Event 2', meta: { guid: '2222222222222222' } },
	{ icon: '\u25C6', name: 'Actor Actor', meta: { guid: '3333333333333333' } },
	{ icon: '\u25B2', name: 'Common Event', meta: { guid: '4444444444444444' } }
]);

const lastEvent = ref('');

const el = (): TabBarElement | null => tabRef.value?.root as TabBarElement | null;

const sync = () => {
	const node = el();
	if (!node) return;
	node.data = tabs.value;
	node.update();
};

const onSelect = () => {
	const node = el();
	if (!node) return;
	lastEvent.value = `select: ${node.read()?.name ?? 'none'}`;
};

const onClosed = () => {
	lastEvent.value = 'closed: tab removed';
};

const addTab = () => {
	const index = tabs.value.length;
	tabs.value.push({
		icon: '\u2605',
		name: `New Tab ${index}`,
		meta: { guid: `aaaaaaaa${index}aaaaaaaa` }
	});
	sync();
};

const closeSelected = () => {
	const node = el();
	if (!node) return;
	const item = node.read();
	if (item) {
		node.close(item);
	}
};

const closeOthers = () => {
	const node = el();
	if (!node) return;
	const item = node.read();
	if (item) {
		node.closeOtherTabs(item);
	}
};

const closeRight = () => {
	const node = el();
	if (!node) return;
	const item = node.read();
	if (item) {
		node.closeTabsToTheRight(item);
	}
};

const clearTabs = () => {
	tabs.value = [directoryTab];
	sync();
};

onMounted(() => {
	const node = el();
	if (!node) return;
	node.dirItem = directoryTab;
	node.on('select', () => onSelect());
	node.on('closed', () => onClosed());
	sync();
});
</script>

<template>
	<section class="demo">
		<h2>YMTabBar</h2>
		<p class="desc">标签栏：点击切换选中，✖ 关闭（可拖出窗口外侧松开关闭），拖动标签可排序，右键触发 popup。</p>
		<div class="row">
			<YMButton variant="primary" @click="addTab">Add Tab</YMButton>
			<YMButton @click="closeSelected">Close Selected</YMButton>
			<YMButton @click="closeOthers">Close Others</YMButton>
			<YMButton @click="closeRight">Close Right</YMButton>
			<YMButton @click="clearTabs">Reset</YMButton>
			<span class="hint">{{ lastEvent }}</span>
		</div>
		<div class="tab-wrap">
			<YMTabBar ref="tabRef" id="tabbar-demo" />
		</div>
	</section>
</template>

<style scoped>
.demo {
	margin-bottom: 24px;
}

.row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	margin: 8px 0;
}

.hint {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
}

.tab-wrap {
	width: 100%;
	min-height: 28px;
	background: var(--ym-color-surface);
	border: 1px solid var(--ym-color-border);
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
