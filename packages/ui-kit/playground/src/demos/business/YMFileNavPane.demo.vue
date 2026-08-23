<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMButton, YMFileNavPane, createTextBoxElement } from '@ui-kit';

interface FileItemContext {
	element?: HTMLElement;
	expanded: boolean;
}

const contextMap = new WeakMap<object, Map<HTMLElement, FileItemContext>>();

const getContextOf = (file: object) => (node: HTMLElement): FileItemContext => {
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
	subfolders: FolderItem[];
	getContext: (node: HTMLElement) => FileItemContext;

	constructor(name: string, parent: FolderItem | null = null, subfolders: FolderItem[] = []) {
		this.name = name;
		this.parent = parent;
		this.path = parent ? `${parent.path}/${name}` : `/${name}`;
		this.stats = { ino: inoCounter++ };
		this.subfolders = subfolders;
		this.getContext = getContextOf(this);
	}
}

const assets = new FolderItem('assets');
const actors = new FolderItem('Actors', assets);
const maps = new FolderItem('Maps', assets);
const system = new FolderItem('System', assets);
const skills = new FolderItem('Skills', actors);
assets.subfolders = [actors, maps, system];
actors.subfolders = [skills];

const navWrap = ref<HTMLElement | null>(null);
const navRef = ref<{ load(...folders: unknown[]): void; clear(): void; getSelections(): unknown[] } | null>(null);
const info = ref('');

const links = {
	browser: {
		display: 'normal',
		backupFolders: [],
		update() {
			const nav = navRef.value;
			if (nav) {
				const selections = nav.getSelections() as FolderItem[];
				info.value = selections.length ? `selected: ${selections.map((s) => s.path).join(', ')}` : 'no selection';
			}
		},
		restoreDisplay() {}
	},
	nav: {},
	body: {}
};

const directoryApi = {
	sortFiles: () => {},
	getFolder: (path: string) => {
		const map = new Map<string, FolderItem>();
		const walk = (folder: FolderItem) => {
			map.set(folder.path, folder);
			for (const sub of folder.subfolders) {
				walk(sub);
			}
		};
		walk(assets);
		return map.get(path) ?? null;
	},
	update: () => Promise.resolve(false),
	assets,
	inoMap: {}
};

const fileSystem = {
	path: (p: string) => p,
	rename: () => Promise.resolve(),
	existsSync: () => false
};

const pathUtil = {
	dirname: (p: string) => p.slice(0, p.lastIndexOf('/'))
};

const createTextBox = () => createTextBoxElement();

const init = () => {
	const wrap = navWrap.value as HTMLElement & { directory?: unknown } | null;
	if (!wrap) return;
	wrap.directory = assets;
	navRef.value?.load(assets);
	info.value = 'loaded /assets';
};

const loadActors = () => {
	navRef.value?.load(actors);
};

const loadRoot = () => {
	navRef.value?.load(assets);
};

const expandAll = () => {
	const node = navWrap.value?.querySelector('.file-nav-pane');
	if (!node) return;
	for (const folder of [assets, actors, maps, system, skills]) {
		folder.getContext(node as HTMLElement).expanded = true;
	}
	(node as HTMLElement & { update?(): void }).update?.();
};

const clearNav = () => {
	navRef.value?.clear();
	info.value = 'cleared';
};

onMounted(() => {
	init();
});
</script>

<template>
	<section class="demo">
		<h2>YMFileNavPane</h2>
		<p class="desc">文件夹导航树：load(folder) 载入并选中，点击 folder-mark 展开/折叠，双击展开，F2 重命名（需 createTextBox）。</p>
		<div class="row">
			<YMButton variant="primary" @click="loadActors">Load /assets/Actors</YMButton>
			<YMButton @click="loadRoot">Load Root</YMButton>
			<YMButton @click="expandAll">Expand All</YMButton>
			<YMButton @click="clearNav">Clear</YMButton>
			<span class="hint">{{ info }}</span>
		</div>
		<div class="nav-box" ref="navWrap">
			<YMFileNavPane
				ref="navRef"
				:links="links"
				:directory-api="directoryApi"
				:file-system="fileSystem"
				:path-util="pathUtil"
				:menu-state="() => ''"
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

.nav-box {
	position: relative;
	width: 100%;
	max-width: 360px;
	height: 260px;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
	overflow: hidden;
}

.nav-box :deep(.file-nav-pane) {
	width: 100%;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
