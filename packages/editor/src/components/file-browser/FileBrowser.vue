<template>
	<YMFileBrowser
		ref="ym"
		:id="props.id"
		:menu-popup="menuPopup"
		:directory-api="directoryApi"
		:file-system-api="fileSystemApi"
		:path-util="pathUtil"
		:localize="localize"
		:file-classes="fileClasses"
		:menu-state="menuState"
		:create-text-box="createTextBoxFactory"
		:data-api="dataApi"
		:window-api="windowApi"
		:gl-api="glApi"
		:clipboard-api="clipboardApi"
		:reference-api="referenceApi"
		:editor-api="editorApi"
		:set-icon-clip="setIconClipAdapter"
		:on-browser-mount="onBrowserMount"
		:on-selector-mount="onSelectorMount"
	/>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { YMFileBrowser, type MenuItem, type MenuOptions } from '@ui-kit';
import { Menu } from '@app/components/menu-list.ts';
import { Data } from '@app/data/data-object.ts';
import { getWindowStore } from '@app/stores/window';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Reference } from '@app/log/related-references.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Directory } from '@app/file/directory-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { FolderItem } from '@app/services/file-system/file-item.ts';
import { getYamiI18n } from '@app/i18n';
import { Path } from '@app/utils/config';
import { createTextBoxElement as createTextBoxFactory } from '@ui-kit';
import { setIconClip } from '@app/utils/icon-clip';
import { getBrowserStore, type FileBrowserInstance } from '@app/stores/browser.ts';
import { getSelectorStore, type SelectorInstance } from '@app/stores/selector.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { useToastService } from '@app/composables/useToastService';

interface Props {
	id?: string;
	bridge?: 'browser' | 'selector';
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const Clipboard = GlobalClipboard;
const toast = useToastService();

const menuPopup = (options: MenuOptions, items: MenuItem[]) => Menu.popup(options, items);
const directoryApi = {
	sortFiles: (dir: Array<FileItem | FolderItem>) => Directory.sortFiles?.(dir),
	getFolder: (path: string) => Directory.getFolder?.(path),
	update: () => Directory.update?.(),
	deleteFiles: (files: Array<FileItem | FolderItem>) => {
		return Promise.resolve()
			.then(() => Directory.deleteFiles?.(files))
			.catch((e) => toast.show(String(e), 'error'));
	},
	moveFiles: (path: string, dir: Array<{ name: string; path: string; children?: unknown[] }>) => {
		return Promise.resolve()
			.then(() => Directory.moveFiles?.(path, dir))
			.catch((e) => toast.show(String(e), 'error'));
	},
	copyFiles: (
		path: string,
		dir: Array<{ name: string; path: string; children?: unknown[] }>,
		prefix?: string
	) => {
		return Promise.resolve()
			.then(() => Directory.copyFiles?.(path, dir, prefix))
			.catch((e) => toast.show(String(e), 'error'));
	},
	saveFiles: (files: Array<FileItem | FolderItem>) => {
		return Promise.resolve()
			.then(() => Directory.saveFiles?.(files))
			.catch((e) => toast.show(String(e), 'error'));
	},
	readdir: (paths: string[]) => Directory.readdir?.(paths),
	searchFiles: (
		filters: string[] | null,
		kw: RegExp,
		directory: string,
		results: Array<FileItem | FolderItem>
	) => Directory.searchFiles?.(filters, kw, directory, results),
	existFiles: (path: string, dir: Array<{ name: string; children?: unknown[] }>) =>
		Directory.existFiles?.(path, dir),
	rename: (oldPath: string, newPath: string) => {
		return Promise.resolve()
			.then(() => FSP.rename(oldPath, newPath))
			.catch((e) => toast.show(String(e), 'error'));
	},
	/**
	 * ⚠️ 必须是 `FS.existsSync`（`node:fs` 上的**同步**方法），**不是** `FSP.existsSync`。
	 *
	 * `FSP` 就是 `fs.promises` 本体，而 `fs.promises` **没有** `existsSync`
	 * （实测 `node -e "typeof require('fs').promises.existsSync"` → `undefined`；
	 *  它只有异步的 `access`）。原先写的 `FSP.existsSync(p)` 因此是
	 * `undefined(p)` ⇒ 调用即 `TypeError: FSP.existsSync is not a function`。
	 *
	 * 它一路被 `YMFileBrowser.vue:211` 转发到 `YMFileNavPane.vue:719` 的**重命名失焦**
	 * 分支（`if (!props.fileSystem!.existsSync(path)) return …rename…`）——
	 * 也就是说**在文件浏览器里重命名文件会直接抛错、改名不生效**。
	 * 它能编译（且一直没人发现）纯粹是因为 `FSP` 当时的类型是 `Record<string, any>`。
	 */
	existsSync: (p: string) => FS.existsSync(p),
	get assets() {
		return Directory.assets;
	},
	get inoMap() {
		return Directory.inoMap;
	}
};
const fileSystemApi = {
	path: (p: string) => File.path!(p),
	route: (p: string) => File.route?.(p),
	getPath: (guid: string) => File.getPath?.(guid),
	getFileName: (dir: string, name: string, ext?: string) => File.getFileName?.(dir, name, ext),
	getImageResolution: (p: string) => File.getImageResolution?.(p),
	showInExplorer: (p: string) => File.showInExplorer?.(p),
	showOpenDialog: (options: unknown) => File.showOpenDialog?.(options),
	showSaveDialog: (options: unknown) => File.showSaveDialog?.(options),
	mkdir: (p: string, options?: { recursive?: boolean; mode?: number }) => FSP.mkdir(p, options),
	rename: (src: string, dst: string) => FSP.rename(src, dst),
	copyFile: (src: string, dst: string) => FSP.copyFile(src, dst),
	stat: (p: string, bigint?: boolean) => FSP.stat(p, bigint),
	addOversizeImagePaths: (p: string) => FileItem.addOversizeImagePaths?.(p)
};
const pathUtil = {
	dirname: (p: string) => Path.dirname(p),
	normalize: (p: string) => Path.normalize(p),
	slash: (p: string) => Path.slash(p),
	extname: (p: string) => Path.extname(p),
	basename: (p: string, ext?: string) => Path.basename(p, ext),
	resolve: (...paths: string[]) => Path.resolve(...paths)
};
const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
const localize = { createGetter: (key: string) => (sub: string) => t(key + '.' + sub) };
const fileClasses = { FileItem, FolderItem };
const menuState = () => Menu.state;
const dataApi = {
	get manifest() {
		return Data.manifest;
	}
};
const windowApi = {
	confirm: (
		options: { message?: string; close?: () => void },
		items: Array<{ label?: string; click?: () => void }>
	) => getWindowStore().confirm(options, items),
	getTopWindow: () => getWindowStore().getTopWindow()
};
const glApi = { maxTexSize: GL.maxTexSize };
const clipboardApi = {
	write: (type: string, data: unknown) => Clipboard?.write?.(type, data),
	read: (type: string) => Clipboard?.read?.(type)
};
const referenceApi = {
	findRelated: (guid: string) => Reference.findRelated?.(guid),
	openList: (
		list: Array<{ type: string; text: string; id?: string; order?: number; count?: number }>
	) => Reference.openList?.(list),
	openRelated: (guid: string) => Reference.openRelated?.(guid)
};
const editorApi = { config: Editor.config };
const setIconClipAdapter = (
	icon: HTMLElement,
	path: string,
	cx: number,
	cy: number,
	cw: number,
	ch: number
) => setIconClip(icon, path, cx, cy, cw, ch);

const onBrowserMount = (): void => getBrowserStore().initialize();
const onSelectorMount = (): void => getSelectorStore().initialize();

const ym = ref<{
	el: HTMLElement | null;
	update(): void;
	searchFiles(kw: RegExp | string): void;
	backToParentFolder(): boolean;
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const update = (): void => ym.value?.update();
const searchFiles = (kw: RegExp | string): void => ym.value?.searchFiles(kw);
const backToParentFolder = (): boolean => ym.value?.backToParentFolder() ?? false;

defineExpose({ update, searchFiles, backToParentFolder, el });

const registerNode = (node: HTMLElement | null): void => {
	const selector = getSelectorStore();
	if (!node) {
		if (props.bridge === 'selector') selector.setComponent(null);
		else getBrowserStore().setComponent(null);
		return;
	}
	if (props.bridge === 'selector') {
		selector.setComponent(node as SelectorInstance);
		const selectorNode = node as SelectorInstance;
		selectorNode.open = (target: unknown, allowNone = true) =>
			selector.open(
				target as { read(): string; filter?: string; input?(value?: unknown): void },
				allowNone
			);
		return;
	}
	const browserNode = node as FileBrowserInstance;
	getBrowserStore().setComponent(browserNode);
	browserNode.open = (target: unknown, allowNone = true) =>
		selector.open(
			target as { read(): string; filter?: string; input?(value?: unknown): void },
			allowNone
		);
};

watch(
	() => {
		const exposed = ym.value?.el;
		return exposed instanceof HTMLElement
			? exposed
			: ((exposed as { value?: HTMLElement } | null | undefined)?.value ?? null);
	},
	(node) => {
		registerNode(node as HTMLElement | null);
	}
);

onMounted(() => {
	void nextTick(() => {
		void nextTick(() => {
			registerNode(ym.value?.el ?? null);
		});
	});
});
</script>
