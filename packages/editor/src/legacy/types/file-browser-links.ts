// FileBrowser / FileNavPane / FileHeadPane / FileBodyPane 4 类共享的反向链接对象。 替代 components/file-browser.ts:42 / file-nav-pane.ts:28 / file-body-pane.ts:52 的 `links: Record<string, any>` 残留，收敛为精确接口。
import type { FileItem } from '@app/legacy/file/file-item.ts';
import type { FolderItem } from '@app/legacy/file/folder-item.ts';

export interface FileBrowserLinks {
	browser: HTMLElement & {
		display: 'normal' | 'search';
		backupFolders: FolderItem[];
		filters: string[] | null;
		searchResults: Array<FileItem | FolderItem>;
		getFilePaths(files: FileItem[]): { absolutePaths: string[] };
		backToParentFolder(): boolean;
		restoreDisplay(): void;
		update(): void;
	};
	nav: HTMLElement & {
		selections: FolderItem[];
		load(...folders: FolderItem[]): void;
		scrollToSelection(mode?: string): void;
	};
	head: HTMLElement;
	body: HTMLElement;
}
