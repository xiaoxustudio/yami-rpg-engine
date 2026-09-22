<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import {
	YMFileBrowser,
	YMMenuList,
	createTextBoxElement,
	type MenuItem,
	type MenuOptions
} from '@ui-kit';

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
	path: string;
	parent: FolderItem | null;
	stats: { ino: number };
	subfolders: FolderItem[] = [];
	children: (FileItem | FolderItem)[] = [];
	getContext: (node: HTMLElement) => FileItemContext;

	constructor(name: string, parent: FolderItem | null = null) {
		this.name = name;
		this.parent = parent;
		this.path = parent ? `${parent.path}/${name}` : `/${name}`;
		this.stats = { ino: inoCounter++ };
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
const actors = new FolderItem('Actors', assets);
const maps = new FolderItem('Maps', assets);
const system = new FolderItem('System', assets);

assets.subfolders = [actors, maps, system];
assets.children = [actors, maps, system];

actors.subfolders = [];
actors.children = [
	new FileItem('hero.actor', 'actor', actors),
	new FileItem('guard.actor', 'actor', actors)
];

maps.subfolders = [];
maps.children = [
	new FileItem('Map001.map', 'scene', maps),
	new FileItem('Map002.map', 'scene', maps),
	new FileItem('collision.grid', 'tileset', maps)
];

system.subfolders = [];
system.children = [
	new FileItem('main.js', 'script', system),
	new FileItem('system.ts', 'script', system),
	new FileItem('titlescreen.ui', 'ui', system),
	new FileItem('explosion.anim', 'animation', system)
];

const folderMap = new Map<string, FolderItem>();
for (const folder of [assets, actors, maps, system]) {
	folderMap.set(folder.path, folder);
}

const browserWrap = ref<HTMLElement | null>(null);
const menuRef = ref<InstanceType<typeof YMMenuList> | null>(null);
const info = ref('');

const directoryApi = {
	sortFiles: () => {},
	getFolder: (path: string) => folderMap.get(path) ?? null,
	update: () => Promise.resolve(false),
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
	existsSync: () => true,
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

const menuPopup = (options: MenuOptions, items: MenuItem[]): void => {
	menuRef.value?.popup(options, items);
};

const createTextBox = () => createTextBoxElement();

type BrowserNode = HTMLElement & {
	directory?: unknown;
	nav?: { load?(...folders: unknown[]): void; selections: unknown[] };
	update?(): void;
	searchFiles?(kw: string | RegExp): void;
	backToParentFolder?(): void;
};

const init = () => {
	const wrap = browserWrap.value as BrowserNode | null;
	if (!wrap) return;
	wrap.directory = assets;
	const body = wrap.querySelector('.file-body-pane') as
		| (HTMLElement & { setViewIndex?(index: number): void })
		| null;
	body?.setViewIndex?.(0);
	const nav = wrap.nav as (BrowserNode['nav'] & { selections: unknown[] }) | undefined;
	nav?.load?.(assets);
	info.value = 'loaded /assets';
};

onMounted(() => {
	void nextTick(() => {
		void nextTick(() => {
			init();
		});
	});
});
</script>

<template>
	<section class="demo">
		<h2>YMFileBrowser</h2>
		<p class="desc">
			文件浏览器：组合 YMFileNavPane / YMFileHeadPane /
			YMFileBodyPane，双击目录可下钻，单击选中，Ctrl+滚轮切换视图。
		</p>
		<div class="row">
			<span class="hint">{{ info }}</span>
		</div>
		<div class="browser" ref="browserWrap">
			<YMFileBrowser
				id="filebrowser-demo"
				:menu-popup="menuPopup"
				:directory-api="directoryApi"
				:file-system-api="fileSystemApi"
				:path-util="pathUtil"
				:localize="localize"
				:file-classes="{ FileItem, FolderItem }"
				:create-text-box="createTextBox"
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

.hint {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
}

.browser {
	position: relative;
	width: 100%;
	max-width: 720px;
	height: 300px;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
	overflow: hidden;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
