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
import { Path } from '@app/legacy/util/config.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Directory } from '@app/legacy/file/directory-object.ts';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { Menu } from '@app/legacy/components/menu-list.ts';
import { createTextBox as createTextBoxFactory } from '@app/legacy/components/text-box.ts';
import { FileBrowserLinks } from '@app/legacy/types/file-browser-links.ts';
import { FileItem } from '@app/legacy/file/file-item.ts';
import { FolderItem } from '@app/legacy/file/folder-item.ts';
import { useToastService } from '@app/composables/useToastService';

interface Props {
	links: FileBrowserLinks;
}

const props = defineProps<Props>();

const toast = useToastService();

const directoryApi = {
	sortFiles: (dir: unknown) => Directory.sortFiles?.(dir),
	getFolder: (path: string) => Directory.getFolder?.(path),
	update: () => Directory.update?.(),
	get assets() {
		return Directory.assets;
	},
	get inoMap() {
		return Directory.inoMap;
	}
};

const fileSystem = {
	path: (p: string) => File.path(p),
	rename: (oldPath: string, newPath: string) => {
		try { FSP.rename(oldPath, newPath); } catch (e) { toast.show(String(e), 'error'); }
	},
	existsSync: (p: string) => FS.existsSync(p)
};

const pathUtil = { dirname: (p: string) => Path.dirname(p) };
const menuState = () => Menu.state;

const ym = ref<{
	el: HTMLElement | null;
	load(...folders: unknown[]): void;
	update(): void;
	select(...files: FileItem[]): void;
	unselect(): void;
	clear(): HTMLElement;
	getSelections(): FolderItem[];
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const load = (...folders: unknown[]): void => ym.value?.load(...folders);
const update = (): void => ym.value?.update();
const select = (...files: FileItem[]): void => ym.value?.select(...files);
const unselect = (): void => ym.value?.unselect();
const clear = (): HTMLElement => ym.value?.clear() ?? document.createElement('div');
const getSelections = (): FolderItem[] => ym.value?.getSelections() ?? [];

defineExpose({ load, update, select, unselect, clear, getSelections, el });
</script>
