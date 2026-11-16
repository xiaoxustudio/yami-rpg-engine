/**
 * 文件浏览器组的**显式句柄表**（editor 侧读到的子集）。
 *
 * 迁移前的形状是「元素 + 方法」：`nav: HTMLElement & { selections; load; … }`，
 * 元素上挂着 `attachApi` 装出来的方法，选中项是元素属性 `nav.selections`。
 * 现在 `YMFileBrowser` 把三个 pane 的**组件实例**（`defineExpose`）放进 `links`，
 * 选中项只能经 `getSelections()` 取，方法一律是可选的（句柄表在挂载后的
 * `nextTick` 才填满，调用方本来就用 `?.`）。
 *
 * 这里只声明 editor 真正用到的成员：谁依赖谁保持可见，避免把 ui-kit 的整份实例类型
 * 抄过来（抄一份就会漂移）。
 */

export interface FileBrowserNavHandle {
	el?: HTMLElement;
	getSelections?(): unknown[];
	load?(...folders: unknown[]): void;
	unselect?(): void;
	clear?(): void;
	resize?(): void;
	update?(): void;
	scrollToSelection?(mode?: string): void;
}

export interface FileBrowserHeadHandle {
	el?: HTMLElement;
	/** 地址栏容器（选择器窗口关闭时按它清空） */
	address?: HTMLElement;
	searcher?: HTMLElement & {
		on?(type: string, listener: (event: never) => void): void;
		getFocus?(): void;
		read?(): unknown;
	};
	updateAddress?(): void;
	view?: { write?(index: number): void };
}

export interface FileBrowserBodyHandle {
	el?: HTMLElement;
	content?: HTMLElement & { getFocus?(): void };
	activeFile?: unknown;
	viewIndex?: number | null;
	getSelections?(): unknown[];
	getRowFiles?(): unknown[];
	getFileCount?(): number;
	select?(...files: unknown[]): void;
	selectByPath?(path?: string): void;
	selectDefault?(): void;
	unselect?(): void;
	clear?(): void;
	setViewIndex?(index: number): void;
	resize?(): void;
	computeGridProperties?(): void;
	updateContentSize?(): void;
	updateFiles?(): void;
	getDirName?(): string;
	rename?(file?: unknown): void;
	copyFiles?(cut?: boolean): void;
	pasteFiles?(path?: string): void;
	deleteFiles?(): void;
	importFiles?(): void;
	exportFile?(): void;
	openFile?(file?: unknown): void;
	openFileLocation?(file?: unknown): void;
	showInExplorer?(): void;
	updateIcon?(meta?: unknown): void;
	/** 选择器窗口用「单击行 = 选中」覆写按下行为（原来是往 body 元素赋值 `activateFile`） */
	setActivateFile?(fn: ((file: never) => void) | null): void;
	on?(type: string, listener: (event: never) => void): void;
}

export interface FileBrowserBrowserHandle {
	display?: string;
	searchResults?: unknown[];
	backupFolders?: unknown[];
	filters?: unknown[] | null;
	update?(): void;
	searchFiles?(kw: string | RegExp): void;
	restoreDisplay?(): void;
	backToParentFolder?(): boolean;
	getFilePaths?(files: unknown[]): { relativePaths: string[]; absolutePaths: string[] };
}

export interface FileBrowserLinks {
	browser?: FileBrowserBrowserHandle | null;
	nav?: FileBrowserNavHandle | null;
	head?: FileBrowserHeadHandle | null;
	body?: FileBrowserBodyHandle | null;
}
