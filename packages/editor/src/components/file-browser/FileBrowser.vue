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
import { computed, onMounted, ref, watch } from 'vue';
import { YMFileBrowser } from '@ui-kit';
import { Menu } from '@/components/menu-list.ts';
import { Data } from '@/data/data-object.ts';
import { Window } from '@/tools/window-object.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { Local } from '@/tools/localization.ts';
import { Path } from '@/util/config.ts';
import { createTextBox as createTextBoxFactory } from '@/components/text-box.ts';
import { setIconClip } from '@/util/icon-clip.ts';
import { useBrowserStore, type FileBrowserInstance } from '@app/stores/browser.ts';
import { useSelectorStore, type SelectorInstance } from '@app/stores/selector.ts';

interface Props {
	id?: string;
	bridge?: 'browser' | 'selector';
}

const props = defineProps<Props>();

const Clipboard = (globalThis as unknown as { Clipboard?: unknown }).Clipboard as { write(type: string, data: unknown): void; read(type: string): unknown; has(type: string): boolean };

const menuPopup = (options: any, items: any[]) => Menu.popup(options, items);
const directoryApi = {
	sortFiles: (dir: any) => Directory.sortFiles?.(dir),
	getFolder: (path: string) => Directory.getFolder?.(path),
	update: () => Directory.update?.(),
	deleteFiles: (files: any[]) => Directory.deleteFiles?.(files),
	moveFiles: (path: string, dir: any[]) => Directory.moveFiles?.(path, dir),
	copyFiles: (path: string, dir: any[], prefix?: string) =>
		Directory.copyFiles?.(path, dir, prefix),
	saveFiles: (files: any[]) => Directory.saveFiles?.(files),
	readdir: (paths: string[]) => Directory.readdir?.(paths),
	searchFiles: (filters: any[], kw: RegExp, directory: string, results: any[]) =>
		Directory.searchFiles?.(filters, kw, directory, results),
	existFiles: (path: string, dir: any[]) => Directory.existFiles?.(path, dir),
	rename: (oldPath: string, newPath: string) => FSP.rename(oldPath, newPath),
	existsSync: (p: string) => FSP.existsSync(p),
	get assets() {
		return Directory.assets;
	},
	get inoMap() {
		return Directory.inoMap;
	}
};
const fileSystemApi = {
	path: (p: string) => File.path(p),
	route: (p: string) => File.route?.(p),
	getPath: (guid: string) => File.getPath?.(guid),
	getFileName: (dir: string, name: string, ext?: string) =>
		File.getFileName?.(dir, name, ext),
	getImageResolution: (p: string) => File.getImageResolution?.(p),
	showInExplorer: (p: string) => File.showInExplorer?.(p),
	showOpenDialog: (options: any) => File.showOpenDialog?.(options),
	showSaveDialog: (options: any) => File.showSaveDialog?.(options),
	mkdir: (p: string, options?: any) => FSP.mkdir(p, options),
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
const localize = { createGetter: (key: string) => Local.createGetter(key) };
const fileClasses = { FileItem, FolderItem };
const menuState = () => Menu.state;
const dataApi = {
	get manifest() {
		return Data.manifest;
	}
};
const windowApi = {
	confirm: (options: any, items: any[]) => Window.confirm(options, items),
	getTopWindow: () => Window.getTopWindow()
};
const glApi = { maxTexSize: GL.maxTexSize };
const clipboardApi = {
	write: (type: string, data: any) => Clipboard?.write?.(type, data),
	read: (type: string) => Clipboard?.read?.(type)
};
const referenceApi = {
	findRelated: (guid: string) => Reference.findRelated?.(guid),
	openList: (list: any) => Reference.openList?.(list),
	openRelated: (guid: string) => Reference.openRelated?.(guid)
};
const editorApi = { config: Editor.config };
const setIconClipAdapter = (icon: HTMLElement, path: string, cx: number, cy: number, cw: number, ch: number) =>
	setIconClip(icon, path, cx, cy, cw, ch);

const onBrowserMount = (): void => useBrowserStore().initialize();
const onSelectorMount = (): void => useSelectorStore().initialize();

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

watch(
	() => ym.value?.el,
	(node) => {
		const selector = useSelectorStore();
		if (!node) {
			if (props.bridge === 'selector') selector.setComponent(null);
			else useBrowserStore().setComponent(null);
			return;
		}
		if (props.bridge === 'selector') {
			selector.setComponent(node as unknown as SelectorInstance);
			return;
		}
		const browserNode = node as unknown as FileBrowserInstance;
		useBrowserStore().setComponent(browserNode);
		browserNode.open = (target: unknown, allowNone = true) => selector.open(target, allowNone);
		browserNode.close = () => selector.close();
	}
);
</script>
