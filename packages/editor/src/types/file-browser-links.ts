import type { FileItem, FolderItem } from '@app/services/file-system/file-item.ts';

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
