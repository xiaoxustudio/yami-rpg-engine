<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMButton, YMFileBodyPane, createTextBoxElement } from '@ui-kit';

interface FileItemContext {
	element?: HTMLElement;
	expanded: boolean;
}

const contextMap = new WeakMap<object, Map<HTMLElement, FileItemContext>>();

const getContextOf =
	(file: object) =>
	(node: HTMLElement): FileItemContext => {
		let map = contextMap.get(file);
		if (!map) {
			map = new Map();
			contextMap.set(file, map);
		}
		let context = map.get(node);
		if (!context) {
			context = { expanded: false };
			map.set(node, context);
		}
		return context;
	};

let inoCounter = 1;

class FolderItem {
	name: string;
	basename: string;
	extname: string;
	path: string;
	type: string;
	parent: FolderItem | null;
	stats: { ino: number; mtimeMs: number };
	subfolders: FolderItem[];
	children: (FileItem | FolderItem)[];
	getContext: (node: HTMLElement) => FileItemContext;

	constructor(name: string, parent: FolderItem | null = null) {
		this.name = name;
		this.basename = name;
		this.extname = '';
		this.type = 'folder';
		this.parent = parent;
		this.path = parent ? `${parent.path}/${name}` : `/${name}`;
		this.stats = { ino: inoCounter++, mtimeMs: Date.now() };
		this.subfolders = [];
		this.children = [];
		this.getContext = getContextOf(this);
	}
}

class FileItem {
	name: string;
	basename: string;
	extname: string;
	path: string;
	type: string;
	parent: FolderItem | null;
	stats: { ino: number; mtimeMs: number };
	data: Record<string, unknown> = {};
	meta: { guid: string };
	children: FileItem[] = [];
	getContext: (node: HTMLElement) => FileItemContext;

	constructor(name: string, type: string, parent: FolderItem) {
		this.name = name;
		this.type = type;
		this.parent = parent;
		const dot = name.lastIndexOf('.');
		this.basename = dot === -1 ? name : name.slice(0, dot);
		this.extname = dot === -1 ? '' : name.slice(dot);
		this.path = `${parent.path}/${name}`;
		this.stats = { ino: inoCounter++, mtimeMs: Date.now() };
		this.meta = { guid: String(inoCounter++).padStart(16, '0') };
		this.getContext = getContextOf(this);
	}
}

const assets = new FolderItem('assets');
const maps = new FolderItem('Maps', assets);
const ui = new FolderItem('UI', assets);

assets.children = [maps, ui];
maps.children = [
	new FileItem('Map001.map', 'scene', maps),
	new FileItem('Map002.map', 'scene', maps),
	new FileItem('Map003.map', 'scene', maps)
];
ui.children = [
	new FileItem('titlescreen.ui', 'ui', ui),
	new FileItem('hud.ui', 'ui', ui),
	new FileItem('main.js', 'script', ui),
	new FileItem('sfx.ogg', 'audio', ui),
	new FileItem('title.font', 'font', ui),
	new FileItem('logo.anim', 'animation', ui)
];

const bodyRef = ref<{
	el: HTMLElement | null;
	updateFiles(): void;
	setViewIndex(index: number): void;
	select(...files: unknown[]): void;
} | null>(null);

const current = ref<FolderItem>(assets);
const viewIndex = ref(0);
const info = ref('');

const links = {
	browser: {
		display: 'normal',
		filters: null as string[] | null,
		searchResults: [],
		backToParentFolder: () => false,
		getFilePaths: () => ({ absolutePaths: [] })
	},
	nav: {
		selections: [assets] as FolderItem[]
	},
	head: {
		view: {
			write(_value: number) {}
		}
	},
	body: {}
};

const refresh = () => {
	links.nav.selections = [current.value];
	bodyRef.value?.updateFiles();
	info.value = `folder: ${current.value.path}`;
};

const openAssets = () => {
	current.value = assets;
	refresh();
};

const openMaps = () => {
	current.value = maps;
	refresh();
};

const openUi = () => {
	current.value = ui;
	refresh();
};

const setView = (index: number) => {
	viewIndex.value = index;
	bodyRef.value?.setViewIndex(index);
};

const selectAll = () => {
	bodyRef.value?.select(...current.value.children);
	info.value = 'selected all';
};

const directoryApi = {
	sortFiles: () => {},
	getFolder: () => null,
	update: () => Promise.resolve(false),
	deleteFiles: () => Promise.resolve(),
	moveFiles: () => Promise.resolve(),
	copyFiles: () => Promise.resolve(),
	saveFiles: () => Promise.resolve(),
	readdir: () => Promise.resolve([]),
	assets,
	inoMap: {}
};

const fileSystemApi = {
	path: (p: string) => p,
	route: (p: string) => p,
	getPath: (p: string) => p,
	getFileName: (dir: string, name: string) => ({
		path: `${dir}/${name}`,
		route: `${dir}/${name}`
	}),
	getImageResolution: () => Promise.resolve({ width: 0, height: 0 }),
	showInExplorer: () => {},
	showOpenDialog: () => Promise.resolve({ filePaths: [] }),
	showSaveDialog: () => Promise.resolve({}),
	mkdir: () => Promise.resolve(),
	copyFile: () => Promise.resolve(),
	stat: () => Promise.resolve(),
	rename: () => Promise.resolve(),
	existsSync: () => false,
	addOversizeImagePaths: () => {}
};

const pathUtil = {
	dirname: (p: string) => p.slice(0, p.lastIndexOf('/')),
	normalize: (p: string) => p,
	slash: (p: string) => p,
	extname: (p: string) => p.slice(p.lastIndexOf('.')),
	basename: (p: string) => p.slice(p.lastIndexOf('/') + 1),
	resolve: (...paths: string[]) => paths.join('/')
};

const localize = { createGetter: () => () => '' };

const createTextBox = () => createTextBoxElement();

onMounted(() => {
	bodyRef.value?.setViewIndex(0);
	refresh();
});
</script>

<template>
	<section class="demo">
		<h2>YMFileBodyPane</h2>
		<p class="desc">
			文件正文区：根据 nav.selections 展示目录内容，支持 list/small/medium/large/huge
			五种视图与多选。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openAssets">/assets</YMButton>
			<YMButton @click="openMaps">/assets/Maps</YMButton>
			<YMButton @click="openUi">/assets/UI</YMButton>
			<YMButton @click="setView((viewIndex + 1) % 5)">Next View ({{ viewIndex }})</YMButton>
			<YMButton @click="selectAll">Select All</YMButton>
			<span class="hint">{{ info }}</span>
		</div>
		<div class="body-box">
			<YMFileBodyPane
				ref="bodyRef"
				:links="links"
				:data-api="{ manifest: { guidMap: {} } }"
				:directory-api="directoryApi"
				:file-system-api="fileSystemApi"
				:path-util="pathUtil"
				:file-classes="{ FileItem, FolderItem }"
				:localize="localize"
				:create-text-box="createTextBox"
			/>
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

.body-box {
	position: relative;
	width: 100%;
	max-width: 720px;
	height: 280px;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
	overflow: hidden;
}

.body-box :deep(.file-body-pane) {
	left: 0;
	top: 0;
	height: 100%;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
