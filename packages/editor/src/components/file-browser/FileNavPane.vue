<template>
	<YMFileNavPane
		ref="ym"
		:links="props.links"
		:directory-api="directoryApi"
		:file-system="fileSystem"
		:path-util="pathUtil"
		:menu-state="menuState"
		:create-text-box="createTextBoxFactory"
	/>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMFileNavPane } from '@ui-kit';
import { Path } from '@/util/config.ts';
import { File } from '@/file/file-system-core.ts';
import { Directory } from '@/file/directory-object.ts';
import { FS, FSP } from '@/file/file-system.ts';
import { Menu } from '@/components/menu-list.ts';
import { createTextBox as createTextBoxFactory } from '@/components/text-box.ts';
import { FileBrowserLinks } from '@/types/file-browser-links.ts';

interface Props {
	links: FileBrowserLinks;
}

const props = defineProps<Props>();

const directoryApi = {
	sortFiles: (dir: any) => (Directory as any).sortFiles(dir),
	getFolder: (path: string) => (Directory as any).getFolder(path),
	update: () => (Directory as any).update(),
	get assets() {
		return (Directory as any).assets;
	},
	get inoMap() {
		return (Directory as any).inoMap;
	}
};

const fileSystem = {
	path: (p: string) => File.path(p),
	rename: (oldPath: string, newPath: string) => FSP.rename(oldPath, newPath),
	existsSync: (p: string) => FS.existsSync(p)
};

const pathUtil = { dirname: (p: string) => Path.dirname(p) };
const menuState = () => (Menu as any).state;

const ym = ref<{
	el: HTMLElement | null;
	load(...folders: any[]): void;
	update(): void;
	select(...files: any[]): void;
	unselect(): void;
	clear(): HTMLElement;
	getSelections(): any[];
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const load = (...folders: any[]): void => ym.value?.load(...folders);
const update = (): void => ym.value?.update();
const select = (...files: any[]): void => ym.value?.select(...files);
const unselect = (): void => ym.value?.unselect();
const clear = (): HTMLElement => ym.value?.clear() ?? document.createElement('div');
const getSelections = (): any[] => ym.value?.getSelections() ?? [];

defineExpose({ load, update, select, unselect, clear, getSelections, el });
</script>
