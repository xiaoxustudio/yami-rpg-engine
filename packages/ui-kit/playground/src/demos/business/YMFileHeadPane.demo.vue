<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMButton, YMFileHeadPane, YMMenuList, type MenuItem, type MenuOptions } from '@ui-kit';

interface FileItem {
	name: string;
	parent?: FileItem;
	subfolders: FileItem[];
}

interface HeadApi {
	el: HTMLElement | null;
	updateAddress(): void;
}

interface FileBrowserLinks {
	browser: {
		display: string;
		backToParentFolder(): void;
		searchFiles(kw: string): void;
	};
	nav: {
		selections: FileItem[];
		load(...files: unknown[]): void;
		scrollToSelection(mode: string): void;
	};
	body: {
		content: HTMLElement;
		elements: { count: number };
		setViewIndex(index: number): void;
	};
	[key: string]: unknown;
}

const assets: FileItem = { name: 'assets', subfolders: [] };
const actors: FileItem = { name: 'Actors', parent: assets, subfolders: [] };
const maps: FileItem = { name: 'Maps', parent: assets, subfolders: [] };
assets.subfolders = [actors, maps];
actors.subfolders = [
	{ name: 'hero', parent: actors, subfolders: [] },
	{ name: 'guard', parent: actors, subfolders: [] }
];

const headRef = ref<HeadApi | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const menuRef = ref<InstanceType<typeof YMMenuList> | null>(null);

const display = ref<'normal' | 'search'>('normal');
const current = ref<FileItem>(assets);
const fileCount = ref(12);
const viewIndex = ref(0);

const nav = {
	selections: [assets] as FileItem[],
	load(...files: unknown[]) {
		const file = files[0] as FileItem | undefined;
		if (file) {
			current.value = file;
			nav.selections = [file];
		}
		headRef.value?.updateAddress();
	},
	scrollToSelection() {}
};

const links: FileBrowserLinks = {
	browser: {
		get display() {
			return display.value;
		},
		backToParentFolder() {
			const parent = current.value.parent;
			if (parent) {
				nav.load(parent);
			}
		},
		searchFiles(kw: string) {
			display.value = kw ? 'search' : 'normal';
			if (kw) {
				fileCount.value = kw.length * 5;
			}
			headRef.value?.updateAddress();
		}
	},
	nav,
	body: {
		content: bodyRef.value as HTMLElement,
		elements: { count: 0 },
		setViewIndex(index: number) {
			viewIndex.value = index;
		}
	}
};

Object.defineProperty(links.body, 'content', {
	get: () => bodyRef.value
});

const openActors = () => nav.load(actors);
const openMaps = () => nav.load(maps);
const back = () => nav.load(assets);

const toggleSearch = () => {
	display.value = display.value === 'normal' ? 'search' : 'normal';
	if (display.value === 'search') {
		fileCount.value = 18;
	}
	headRef.value?.updateAddress();
};

const setView = (index: number) => {
	viewIndex.value = index;
	links.body.setViewIndex(index);
};

const menuPopup = (options: MenuOptions, items: MenuItem[]): void => {
	menuRef.value?.popup(options, items);
};

onMounted(() => {
	headRef.value?.updateAddress();
});
</script>

<template>
	<section class="demo">
		<h2>YMFileHeadPane</h2>
		<p class="desc">文件浏览器头部：地址栏（可逐级回退）+ 返回上级按钮 + 搜索框 + 视图缩放条，依赖 links 三联动结构。</p>
		<div class="row">
			<YMButton variant="primary" @click="openActors">Open /assets/Actors</YMButton>
			<YMButton @click="openMaps">Open /assets/Maps</YMButton>
			<YMButton @click="back">Back to Root</YMButton>
			<YMButton @click="toggleSearch">Toggle Search Mode</YMButton>
			<YMButton @click="setView((viewIndex + 1) % 5)">Next View ({{ viewIndex }})</YMButton>
		</div>
		<div class="head-box">
			<div ref="bodyRef" class="fake-body" />
			<YMFileHeadPane
				ref="headRef"
				:links="links"
				:menu-popup="menuPopup"
				:is-folder-item="(obj: unknown) => !!obj && typeof obj === 'object' && 'subfolders' in (obj as object)"
			/>
		</div>
		<YMMenuList ref="menuRef" />
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

.head-box {
	position: relative;
	width: 100%;
	max-width: 720px;
	height: 64px;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
	overflow: hidden;
}

.head-box :deep(.file-head-pane) {
	left: 0;
}

.fake-body {
	position: absolute;
	top: 24px;
	left: 0;
	right: 0;
	height: 40px;
	background: var(--ym-color-surface-hover);
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
