<template>
	<YMFileBodyPane
		ref="ym"
		:links="props.links"
		:data-api="dataApi"
		:window-api="windowApi"
		:gl-api="glApi"
		:menu-state="menuState"
		:clipboard-api="clipboardApi"
		:reference-api="referenceApi"
		:localize="localize"
		:editor-api="editorApi"
		:directory-api="directoryApi"
		:file-system-api="fileSystemApi"
		:path-util="pathUtil"
		:file-classes="fileClasses"
		:set-icon-clip="setIconClip"
		:create-text-box="createTextBoxFactory"
	/>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMFileBodyPane } from '@ui-kit';
import { Data } from '@app/data/data-object.ts';
import { getWindowStore } from '@app/stores/window';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Menu } from '@app/components/menu-list.ts';
import { createTextBoxElement as createTextBoxFactory } from '@ui-kit';
import { Directory } from '@app/file/directory-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { FolderItem } from '@app/services/file-system/file-item.ts';
import { Reference } from '@app/log/related-references.ts';
import { Editor } from '@app/services/project/editor.ts';
import { createGetter } from '@app/i18n';
import { Path } from '@app/utils/config';
import { setIconClip } from '@app/utils/icon-clip';
import { FileBrowserLinks } from '@app/types/file-browser-links.ts';
import { useToastService } from '@app/composables/useToastService';

interface Props {
	links: FileBrowserLinks;
}

const props = defineProps<Props>();

const Clipboard = null as unknown as { write(type: string, data: unknown): void; read(type: string): unknown; has(type: string): boolean };
const toast = useToastService();

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
const menuState = () => Menu.state;
const clipboardApi = {
	write: (type: string, data: unknown) => Clipboard?.write?.(type, data),
	read: (type: string) => Clipboard?.read?.(type)
};
const referenceApi = {
	findRelated: (guid: string) => Reference.findRelated?.(guid),
	openList: (list: Array<{ type: string; text: string; id?: string; order?: number; count?: number }>) =>
		Reference.openList?.(list),
	openRelated: (guid: string) => Reference.openRelated?.(guid)
};
const localize = { createGetter: (key: string) => createGetter(key) };
const editorApi = { config: Editor.config };
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
	showOpenDialog: (options: unknown) => File.showOpenDialog?.(options),
	showSaveDialog: (options: unknown) => File.showSaveDialog?.(options),
	mkdir: (p: string, options?: { recursive?: boolean; mode?: number }) => FSP.mkdir(p, options),
	copyFile: (src: string, dst: string) => FSP.copyFile(src, dst),
	stat: (p: string, bigint?: boolean) => FSP.stat(p, bigint),
	rename: (oldPath: string, newPath: string) => {
		return Promise.resolve()
			.then(() => FSP.rename(oldPath, newPath))
			.catch((e) => toast.show(String(e), 'error'));
	},
	existsSync: (p: string) => FSP.existsSync(p),
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
const fileClasses = { FileItem, FolderItem };

const ym = ref<{
	el: HTMLElement | null;
	setViewIndex(idx: number): void;
	updateFiles(): void;
	select(...files: FileItem[]): void;
	unselect(): void;
	clear(): HTMLElement;
	on(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const setViewIndex = (idx: number): void => ym.value?.setViewIndex(idx);
const updateFiles = (): void => ym.value?.updateFiles();
const select = (...files: FileItem[]): void => ym.value?.select(...files);
const unselect = (): void => ym.value?.unselect();
const clear = (): HTMLElement => ym.value?.clear() ?? document.createElement('div');
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ setViewIndex, updateFiles, select, unselect, clear, on, el });
</script>
