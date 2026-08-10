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
import { Data } from '@/data/data-object.ts';
import { Window } from '@/tools/window-object.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Menu } from '@/components/menu-list.ts';
import { createTextBox as createTextBoxFactory } from '@/components/text-box.ts';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { Local } from '@/tools/localization.ts';
import { Path } from '@/util/config.ts';
import { setIconClip } from '@/util/icon-clip.ts';
import { FileBrowserLinks } from '@/types/file-browser-links.ts';

interface Props {
	links: FileBrowserLinks;
}

const props = defineProps<Props>();

const Clipboard = null as unknown as { write(type: string, data: unknown): void; read(type: string): unknown; has(type: string): boolean };

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
const menuState = () => Menu.state;
const clipboardApi = {
	write: (type: string, data: any) => Clipboard?.write?.(type, data),
	read: (type: string) => Clipboard?.read?.(type)
};
const referenceApi = {
	findRelated: (guid: string) => Reference.findRelated?.(guid),
	openList: (list: any) => Reference.openList?.(list),
	openRelated: (guid: string) => Reference.openRelated?.(guid)
};
const localize = { createGetter: (key: string) => Local.createGetter(key) };
const editorApi = { config: Editor.config };
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
	rename: (oldPath: string, newPath: string) => FSP.rename(oldPath, newPath),
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
	select(...files: any[]): void;
	unselect(): void;
	clear(): HTMLElement;
	on(type: string, listener: (event: any) => void, options?: boolean | AddEventListenerOptions): void;
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const setViewIndex = (idx: number): void => ym.value?.setViewIndex(idx);
const updateFiles = (): void => ym.value?.updateFiles();
const select = (...files: any[]): void => ym.value?.select(...files);
const unselect = (): void => ym.value?.unselect();
const clear = (): HTMLElement => ym.value?.clear() ?? document.createElement('div');
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ setViewIndex, updateFiles, select, unselect, clear, on, el });
</script>
